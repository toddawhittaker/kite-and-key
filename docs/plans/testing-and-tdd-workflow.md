# Plan: Test harness + retroactive high-coverage suite

- **Slug:** testing-and-tdd-workflow
- **Spec:** `docs/specs/testing-and-tdd-workflow.md`
- **Scope of THIS plan:** the test **harness + suite only** (Vitest unit/integration, Playwright e2e, test DB, coverage, scripts, Docker wiring). The TDD-workflow/agent-doc codification (CLAUDE.md, `.claude/agents/*`, `.claude/commands/pm.md`) is owned separately by the PM and is **out of scope here**.

---

## 1. Approach

Two Vitest "projects" in one `vitest.config.ts` — a fast **unit** project (pure functions, no DB, fully parallel) and an **integration** project (real Payload Local API against a dedicated test Postgres DB, run serially) — plus a separate **Playwright** e2e suite that drives the already-running dockerized stack. This split is deliberate: the spec's `pnpm test` must be fast (no browser, and unit tests must not pay Payload-init cost), while the access-control regression that motivated this work (`publishedOrAuth` draft exclusion) can only be proven by exercising real collection `access` functions through Payload — which needs a DB. Alias resolution (`@payload-config`, `@/*`) is handled once via `vite-tsconfig-paths` reading the existing `tsconfig.json`, so we never hand-maintain a second path map. The test DB is a second database (`kite_and_key_test`) in the **existing compose `db` container**, schema applied by the **committed migrations** (keeping `push:false` prod-parity and doubling as a migration smoke test), reset by TRUNCATE between tests. No product code changes — the only non-test edits are `package.json` (scripts/devDeps) and the `Dockerfile` (skip Playwright's browser auto-download, add an e2e stage). The suite is authored **CI-ready** (headless, in-container, deterministic); wiring GitHub Actions is the explicitly deferred pass and is only flagged as a seam here.

---

## 2. Data model

**None.** No Payload collections, fields, globals, or migrations change. This pass adds tests + harness only (confirmed by spec "Content model impact: None"). The one new database (`kite_and_key_test`) is infrastructure, not a schema change — it is populated by the *existing* committed migration.

---

## 3. Test Postgres strategy

**Decision: a separate `kite_and_key_test` database inside the existing compose `db` container. Schema via committed migrations. Reset via TRUNCATE.**

- **Why the shared container, separate DB (not ephemeral):** zero new infra — the `db` service, its port, creds, and healthcheck already exist and are reachable from any `docker compose run --rm app …` container at host `db:5432`. A throwaway container (testcontainers) adds Docker-in-Docker/socket-mount complexity that fights the "runs in the app container" model and slows every run. Isolation from dev data is guaranteed by the **database name** — tests connect only to `kite_and_key_test`; the dev DB `kite_and_key` is never opened by the suite.
- **Never touch dev data:** the integration project hard-codes/derives its `DATABASE_URI` to the `…/kite_and_key_test` database via Vitest `test.env` (below). It does not read the app's runtime `DATABASE_URI` (which points at the dev DB). A guard in global setup asserts the connection string ends in `kite_and_key_test` before running any destructive statement.
- **Schema (`push:false`):** global setup runs the **committed migrations** against the test DB (`pnpm payload migrate` as a subprocess with `DATABASE_URI` overridden). Chosen over `push:true`-for-test because: (a) it needs **no config override** — we reuse the real `src/payload.config.ts` untouched, only overriding the env var it already reads; (b) it keeps prod-parity (`push:false` everywhere); (c) it doubles as a migration smoke test — a forgotten `migrate:create` after a schema change surfaces as a red integration run, which is a feature. Cost: migrations must be kept current (already a project rule). If migration currency ever becomes a maintenance drag, switching that one DB to `push:true` is the documented fallback.
- **DB creation:** global setup connects to the container's default `postgres` database with `pg` and issues `CREATE DATABASE kite_and_key_test` if absent (idempotent), then migrates. `pg` is a transitive dep of `@payloadcms/db-postgres`; we add it (+`@types/pg`) as an explicit devDep so the helper doesn't rely on a transitive.
- **Reset between tests (per spec "reset state between runs"):** true transaction-rollback is impractical — Payload's Local API opens its own transaction per operation, so a wrapping test transaction can't cleanly nest. Instead: a `resetTestDb()` helper issues a single `TRUNCATE <all payload tables> RESTART IDENTITY CASCADE`, discovering table names from `information_schema.tables` and **excluding `payload_migrations`** (so schema/migration state survives). Called in `beforeEach` of the integration setup file. Combined with `fileParallelism:false` (integration project runs serially), this gives deterministic per-test isolation without re-migrating.
- **Teardown:** integration setup calls `payload.destroy()` in `afterAll` to close the pool so Vitest exits cleanly (open pg pools hang the runner).

---

## 4. Vitest setup

**`vitest.config.ts`** (repo root):

- `plugins: [tsconfigPaths()]` from `vite-tsconfig-paths` — resolves **both** `@/*` and the single-file `@payload-config` mapping straight from `tsconfig.json`. (Fallback if the non-glob `@payload-config` mapping misbehaves: an explicit `resolve.alias` entry `{ '@payload-config': path.resolve('src/payload.config.ts') }` — note it in a comment.)
- Two projects via `test.projects` (Vitest 3 syntax; `extends: true` so root plugins/coverage apply):
  - **`unit`** — `include: ['src/**/*.unit.test.ts']`, `environment: 'node'`, no setup, parallel. Pure functions only; must never open a DB or init Payload.
  - **`integration`** — `include: ['src/tests/integration/**/*.int.test.ts']`, `environment: 'node'`, `globalSetup: ['src/tests/setup/global.integration.ts']`, `setupFiles: ['src/tests/setup/integration.setup.ts']`, `fileParallelism: false`, `testTimeout: 30000`, `hookTimeout: 30000`, and:
    ```ts
    env: {
      NODE_ENV: 'test',
      DATABASE_URI: process.env.TEST_DATABASE_URI
        ?? 'postgres://postgres:postgres@db:5432/kite_and_key_test',
      PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ?? 'test-secret-please-override',
    }
    ```
    `test.env` is applied before any module (incl. `@payload-config`, which reads `DATABASE_URI`/`PAYLOAD_SECRET` at import) loads in the worker — this is the seam that points Payload at the test DB. Default host is `db` (in-container). Host runs override with `TEST_DATABASE_URI=…@localhost:5432/kite_and_key_test`.
- **Coverage** (`@vitest/coverage-v8`), root-level so it merges both projects:
  ```ts
  coverage: {
    provider: 'v8',
    include: ['src/**'],
    exclude: [
      'src/payload-types.ts',        // generated
      'src/migrations/**',           // generated / framework-owned
      'src/app/**',                  // (payload) generator + (frontend) RSC — e2e-covered, not unit-testable
      'src/components/**',           // presentational — e2e-covered
      'src/seed/**',                 // exercised behaviorally via subprocess (out-of-process → no V8 line capture)
      'src/tests/**',
      '**/*.test.ts',
      '.next/**',
    ],
    thresholds: {
      lines: 80, statements: 80, functions: 80, branches: 80,
      'src/lib/**': { lines: 90, statements: 90, functions: 90, branches: 90 },
      'src/fields/**': { lines: 90, statements: 90, functions: 90, branches: 90 },
    },
  }
  ```
  Rationale for the excludes matching the spec + task note: RSC pages and the `(payload)` generator are **not unit-testable**; they are covered by Playwright, whose coverage is not fed into V8. So the ≥80% "overall" bar is measured on the **testable source** — `src/lib`, `src/fields`, `src/collections`, `src/globals`, `src/payload.config.ts` (all loaded and their `access`/hook functions invoked during integration) — with the generated/e2e-covered surfaces excluded. The ≥90% logic bar lands on `src/lib` + `src/fields`, which unit+integration hit directly.
- **TS/ESM:** Vitest transforms TS via esbuild — no separate ts config needed. Use **explicit imports** (`import { describe, it, expect, vi } from 'vitest'`) rather than `globals:true`, so no `tsconfig` `types` edit is required. If Payload/ESM interop throws transform errors during integration init, add `test.server.deps.inline: [/^payload/, /^@payloadcms/]` (note as a contingency, not a default).

**Pure-unit vs. integration boundary:**
- **Unit (no DB, no Payload init):** `src/lib/access.ts` helpers, `src/fields/slug.ts` slugify branches, and `findPublic` **default-merging** (mock `payload`'s `getPayload` + `@payload-config`).
- **Integration (Payload Local API + test DB):** collection `access` baselines, the draft-leak regression, slug **uniqueness/collision** (DB-enforced, not a hook concern), and seed idempotency.

---

## 5. Test directory layout + file-by-file coverage map

```
vitest.config.ts
playwright.config.ts
src/
  lib/
    access.unit.test.ts
    payload.unit.test.ts
  fields/
    slug.unit.test.ts
  tests/
    setup/
      global.integration.ts        # globalSetup: create test DB (pg) + guard + run migrations
      integration.setup.ts         # setupFiles: init Payload once, beforeEach TRUNCATE, afterAll destroy
    helpers/
      db.ts                        # createTestDatabase(), resetTestDb(), assertTestDbUrl()
      payload.ts                   # getTestPayload() (cached init), fixture builders
    integration/
      access.int.test.ts
      drafts.int.test.ts           # THE draft-leak regression (HIGH)
      slug.int.test.ts
      seed.int.test.ts
e2e/
  routes.spec.ts
  admin.spec.ts
  api-access.spec.ts
```

### Unit

**`src/lib/access.unit.test.ts`** — pure; `access.ts` imports only `type Access` (erased), no mocks:
- `isAdmin`: `{req:{user:{role:'admin'}}}`→true; `role:'editor'`→false; no user→false.
- `isAuthenticated`: user present→true; no user→false.
- `anyone`: →true unconditionally.
- `publishedOrAuth`: user present→`true`; no user→deep-equals `{ _status: { equals: 'published' } }`. (This is the unit half of the regression — asserts the anon branch returns the published-only filter, not `true`.)

**`src/fields/slug.unit.test.ts`** — call `slugField()`, grab `field.hooks.beforeValidate[0]`, invoke:
- empty `value`, `data.title = 'Inventory Tracker!'` → `'inventory-tracker'` (slugify-on-empty from source).
- existing `value = 'My Custom Slug'` → `'my-custom-slug'` (provided slug normalized/preserved, source ignored).
- empty `value`, no source field → returns the empty `value` unchanged (no crash).
- custom source arg `slugField('name')` slugifies from `data.name`.
- edge: leading/trailing separators trimmed (`'--Hi--'`→`'hi'`), non-alnum collapsed.

**`src/lib/payload.unit.test.ts`** — `findPublic` defaults, no DB. Hoisted mocks:
```ts
vi.mock('@payload-config', () => ({ default: {} }))
const findSpy = vi.fn().mockResolvedValue({ docs: [] })
vi.mock('payload', () => ({ getPayload: vi.fn().mockResolvedValue({ find: findSpy }) }))
```
Assertions:
- `findPublic('projects')` → `findSpy` called with `overrideAccess:false` **and** `draft:false`.
- caller opts pass through: `findPublic('projects', { limit: 5, sort: '-publishedDate', where:{…}, depth:1 })` → those keys reach `find`, `collection:'projects'` set, and `overrideAccess/draft` still forced (spread order guarantees our values win — assert both present and correct even though TS `Omit` forbids passing them).

### Integration (Payload Local API + test DB)

All use `getTestPayload()` and control fixtures explicitly. Anonymous = `{ overrideAccess: false }` with no `user`; authed = `{ overrideAccess: false, user: adminUser }` (admin created in-test via `payload.create({collection:'users'})`).

**`src/tests/integration/access.int.test.ts`** — per-collection read/write baseline:
- **Public reads where intended:** seed one published doc in `projects`, `posts`, `events`, `profiles`, `media`(record), and the `about` global; anon `find`/`findGlobal` returns them.
- **Not publicly readable:** create a `partner-opportunities` doc and a second `users` doc; anon `find` on each returns `docs: []` / `totalDocs: 0` (access `false` → empty result, no leak); authed `find` returns them.
- **Writes require auth:** anon `create`/`update`/`delete` on `projects` (and `partner-opportunities`) **rejects** (Forbidden); authed create succeeds. `users` create as anon and as a non-admin authed user rejects (`isAdmin`); admin succeeds.

**`src/tests/integration/drafts.int.test.ts`** — **the regression for the HIGH we fixed** (`publishedOrAuth` + `findPublic`). For each of `projects`, `posts`, `events`:
- create one **published** doc and one **draft** doc (`payload.create({ …, draft:true })` / `_status:'draft'`).
- anon `find` with `overrideAccess:false` → returns **only** the published doc (draft absent) — regardless of passing `draft:true` in the query (proves `?draft=true` can't flip anon access).
- authed `find` → returns **both** (admin UI must see drafts).
- via `findPublic(collection)` directly → only published (asserts the baked-in `overrideAccess:false`+`draft:false` path end-to-end against the DB). This case goes **red** against pre-fix code (anon-visible draft) and green now.

**`src/tests/integration/slug.int.test.ts`** — DB-enforced uniqueness (not a hook branch):
- create a project → slug auto-generated from title (hook + persistence together).
- create a second project with the **same explicit slug** → rejects with a uniqueness/validation error (asserts `unique:true` is real, not just a hook). (Documented here rather than in the unit slug test because collision is a DB constraint, invisible to the pure hook.)

**`src/tests/integration/seed.int.test.ts`** — idempotency without touching product code:
- run `pnpm seed` **as a subprocess** (`execFile`) with env `DATABASE_URI`=test DB, `PAYLOAD_SECRET`, `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`, `NODE_ENV=test`; then run it a **second** time.
- after both runs, query counts via `getTestPayload()`: exactly 1 admin user, 2 profiles, 2 projects, 2 posts, 1 event, 1 partner-opportunity, and the `about` global populated once — no duplicates. (Subprocess is required because `src/seed/index.ts` `process.exit()`s at top level and can't be imported in-process. Consequence: seed lines aren't captured by in-process V8 coverage → `src/seed/**` is excluded from the coverage denominator but validated behaviorally here. Optional future: refactor seed to export `run()` for in-process coverage — not in scope.)

### E2e (Playwright) — drives the live, seeded dev stack

**`e2e/routes.spec.ts`** — 7 routes + a detail, each `expect(response.status()).toBe(200)` and a seeded-content assertion:
- `/`, `/about` (renders `about` global heading), `/projects` (contains `Sample Project — Inventory Tracker`), `/students` (`Sample Profile — Student One`), `/blog` (`Sample Post —`), `/partner`, `/get-involved`.
- `/projects/sample-project-one` → 200 + renders the project title and a technology tag (`Next.js`).

**`e2e/admin.spec.ts`** — `/admin` login: fill `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` (from env), submit, assert the admin dashboard renders (e.g. a nav/collection link visible). Skips with a clear message if creds env is unset.

**`e2e/api-access.spec.ts`** — negative-auth boundaries via `request` (APIRequestContext, anon):
- `GET /api/partner-opportunities` → **403**; `GET /api/users` → **403**; `GET /api/projects` → **200** with `docs` present.
- Draft boundary (dev DB has only published seed, so we assert non-leak without mutating it): `GET /api/projects?draft=true` → 200 and **every** returned doc has `_status !== 'draft'`; and the `/projects` page HTML contains no `_status:draft` title. (The authoritative, fixture-controlled draft regression lives in `drafts.int.test.ts`; this e2e case is the boundary smoke that `?draft=true` doesn't flip anon access. We deliberately do **not** create a draft in the dev DB — "must not touch dev data.")

> **Explicit note (per task):** RSC pages, the `/admin` UI, and REST access boundaries are covered by **e2e, not unit tests** — they aren't unit-testable. The ≥80% "overall" coverage figure is therefore measured on testable source (`src/lib`, `src/fields`, `src/collections`, `src/globals`, config) with `src/app/**`, `src/components/**`, generated files, and `src/seed/**` excluded.

---

## 6. Playwright setup

**`playwright.config.ts`** (repo root; `testDir: './e2e'`, `.gitignore` already ignores `test-results/`, `playwright-report/`, `blob-report/`, `playwright/.cache/`):
- `use.baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'`.
- Single project: **chromium only**, headless (fast; multi-browser is out of scope).
- `reporter: [['list'], ['html', { open: 'never' }]]`, `retries: process.env.CI ? 1 : 0`, `forbidOnly: !!process.env.CI`.
- **No `webServer`** — assume the dockerized stack is already up (`docker compose up -d` + seeded). Justification: the app runs as a *separate* container; having Playwright boot its own `pnpm dev`/`start` inside the test container would double-boot Next (slow) and diverge from the "drives the real stack" spec intent. This matches the spec AC ("`pnpm test:e2e` drives the real stack").
- **Two run modes, documented in the plan output:**
  - *Host dev:* `pnpm test:e2e` from the host against `http://localhost:3000`.
  - *In-container / CI-ready:* bring the stack up (`docker compose up -d && docker compose run --rm app pnpm seed`), then
    `docker compose run --rm -e E2E_BASE_URL=http://app:3000 <e2e-image> pnpm test:e2e`
    (service-name `app:3000` is reachable on the compose network from the run container). Contingency `webServer` block (commented) with `reuseExistingServer:true` for anyone who prefers Playwright to boot the app on `localhost` — not the default.
- **Browsers in-container:** the `node:22-bookworm-slim` dev image has neither Chromium nor its system libs. Handled in the Dockerfile (§7) via a dedicated **`e2e` stage** so the lean dev image is untouched. Quick local path: `docker compose run --rm app sh -c "pnpm exec playwright install --with-deps chromium && pnpm test:e2e"`.

---

## 7. package.json + Dockerfile

**`package.json` scripts (add):**
```jsonc
"test":          "vitest run",
"test:unit":     "vitest run --project unit",
"test:watch":    "vitest",
"test:coverage": "vitest run --coverage",
"test:e2e":      "playwright test"
```
(`cross-env NODE_OPTIONS=--no-deprecation` prefix optional to match house style; Vitest/Playwright don't need it.)

**`package.json` devDeps (add — take what resolves, pin per note):**
- `vitest` and `@vitest/coverage-v8` — **must be the same version** (V8 provider is version-locked to Vitest); pin both to the identical resolved version.
- `vite-tsconfig-paths` — caret ok.
- `@playwright/test` — pin exact (browser build ↔ package version coupling), like the repo pins `payload`/`next`.
- `pg` + `@types/pg` — for the DB-create/reset helper (pin `pg` to match the version `@payloadcms/db-postgres` already resolves, to avoid a duplicate `pg` in the tree; caret `@types/pg`).

**Prod image — confirmed won't choke, one size caveat to flag:**
- All additions are **devDependencies**; `next start` (prod CMD) never imports Vitest/Playwright/pg-helpers, so the `prod` stage runs fine.
- Caveat (pre-existing, not introduced-breakage): the Dockerfile's single `deps` stage runs `pnpm install --frozen-lockfile` (all deps) and the `prod` stage copies that whole `node_modules`, so the new devDeps **do** land in the prod image — larger, not broken. Optional future optimization (flag for devops-reviewer): a separate `prod-deps` stage with `pnpm install --prod`. Not required by this spec.
- **Critical gotcha — Playwright browser auto-download:** installing `@playwright/test` triggers a postinstall that downloads ~150MB of browsers into every `pnpm install`, bloating the `deps` stage (and thus dev **and** prod images). **Add `ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` in the `base` stage before `pnpm install`** so normal installs stay lean; browsers are pulled **only** in the dedicated e2e stage.

**Dockerfile — new `e2e` stage (keeps dev/prod lean):**
```dockerfile
FROM deps AS e2e
ENV NODE_ENV=test
RUN pnpm exec playwright install --with-deps chromium
COPY --chown=node:node . .
CMD ["pnpm", "test:e2e"]
```
Run via `docker compose run` against this target (or a `--profile e2e` compose service the implementer may add). Unit/integration tests need **no** Dockerfile change — they run in the existing dev image: `docker compose run --rm app pnpm test` (integration reaches the `db` service already on the network).

---

## 8. Step-by-step order

1. **Deps + scripts:** add devDeps and `test*` scripts to `package.json`; rebuild image (`docker compose up --build -V`) so the anon `node_modules` volume picks them up. Verify `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` is set in the Dockerfile `base` stage first (else the rebuild pulls browsers).
2. **Vitest config:** `vitest.config.ts` with `vite-tsconfig-paths`, the two projects, and coverage config/excludes/thresholds.
3. **Unit tests** (no infra dep): `access.unit.test.ts`, `slug.unit.test.ts`, `payload.unit.test.ts`. Run `docker compose run --rm app pnpm test:unit` — must pass with zero DB.
4. **Integration harness:** `src/tests/helpers/db.ts` (create DB via `pg`, `assertTestDbUrl` guard, `resetTestDb` TRUNCATE), `helpers/payload.ts` (`getTestPayload` cached init + fixture builders), `setup/global.integration.ts` (create+migrate), `setup/integration.setup.ts` (beforeEach truncate, afterAll destroy).
5. **Integration tests:** `access.int.test.ts`, `drafts.int.test.ts` (the regression — confirm it would fail against pre-fix `publishedOrAuth`), `slug.int.test.ts`, `seed.int.test.ts`. Run `docker compose run --rm app pnpm test` (unit + integration) green.
6. **Coverage:** `docker compose run --rm app pnpm test:coverage`; confirm ≥90% on `src/lib` + `src/fields` and ≥80% overall on the included set. Tighten tests (not thresholds) if short.
7. **Playwright:** `playwright.config.ts` + Dockerfile `e2e` stage; `e2e/routes.spec.ts`, `e2e/admin.spec.ts`, `e2e/api-access.spec.ts`. Bring the stack up + seed, then run e2e in-container against `http://app:3000`; confirm green.
8. **Verify prod unaffected:** `docker compose --profile prod build` and `pnpm lint` stay green.
9. **CI seam (deferred):** leave a short note in the plan/PR that the suite is CI-ready (headless, in-container, env-driven) and that GitHub Actions wiring + coverage gate is the next pass — do **not** author `.github/workflows/*` here.

---

## 9. Trade-offs & risks

- **Payload init in Vitest is the main risk.** Full Local API init (lexical, sharp, pg pool) is heavy and occasionally has ESM-interop friction. Mitigations: integration in `environment:'node'`, single cached `getTestPayload()` reused across the (serial) integration files, `afterAll` `payload.destroy()` to avoid a hung runner, and the documented `server.deps.inline` contingency. Keep unit tests DB-free so `pnpm test`'s fast path never pays this cost.
- **Requires `PAYLOAD_SECRET` + a reachable DB for integration.** Supplied via Vitest `test.env` (secret) and the compose network (`db:5432`). Global setup **must** run before any worker imports `@payload-config`; `test.env` guarantees the env vars are set first, but if a test imports config outside a worker (e.g. top-level in a helper) the order can break — keep all Payload imports inside test/setup files.
- **Test-DB isolation/leakage.** Serial integration (`fileParallelism:false`) + `beforeEach` TRUNCATE is the isolation contract; parallelizing integration later would require per-worker schemas/DBs. The `assertTestDbUrl` guard is the safety net against ever pointing TRUNCATE at the dev DB — reviewers should confirm it's called before any destructive statement.
- **Migrations vs. push for the test DB.** We chose committed-migrations (prod-parity, migration smoke test). Cost: an out-of-date migration set fails integration until `migrate:create` is run — intended, but flag it so a red run isn't misread as a test bug. `push:true`-for-test is the documented escape hatch.
- **Playwright in the image.** Browsers add ~400MB; isolated to the `e2e` stage so dev/prod stay lean. The `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` env is load-bearing — without it every install (dev + prod) bloats. devops-reviewer should confirm the prod image size is acceptable given devDeps ride along in the shared `deps` stage (pre-existing; optional `--prod` split noted).
- **e2e depends on a seeded dev stack.** Tests assert seeded strings, so `pnpm seed` must have run; specs skip/param off env creds where possible. e2e deliberately does **not** create a draft in the dev DB (keeps dev data clean) — the authoritative draft regression is the integration test.
- **e2e in-container networking (CONFIRMED during review — corrects the "CI-ready" claim for e2e specifically).** Running Playwright in a *separate* container against a compose **service-name** origin fails two independent, reproduced ways: (a) Chromium force-upgrades any bare host `app` to HTTPS because `.app` is on the *static* HSTS-preload list (the `--disable-features=HttpsUpgrades` arg does NOT override this); (b) Next 15's dev `allowedDevOrigins` blocks the admin panel's `/_next/*` HMR/RSC from any non-`localhost` origin (this is the real mechanism — `NEXT_PUBLIC_SERVER_URL` is currently unused). **Supported today (Linux, dockerized):** build the `e2e` image and `docker run --network host` against `http://localhost:3000` so the browser origin is `localhost` (accepted by both Chromium and Next). Non-Linux: run `pnpm test:e2e` on the host. **Unit + integration are fully CI-ready; e2e is CI-ready only via the host-network invocation.** The clean cross-platform in-container fix — a compose network alias not under `.app` + an env-gated `allowedDevOrigins` in `next.config.ts` (touches `docker-compose.yml`/`next.config.ts`, out of this pass's scope) — is a **documented seam for the deferred CI/CD pass**, tracked in the spec.
- **Keeping the suite fast.** `pnpm test` = unit (parallel, no DB) + integration (serial, one Payload init, TRUNCATE not re-migrate). Browser e2e is a separate `pnpm test:e2e` so the default loop stays quick, per spec.
- **Chose against:** testcontainers/ephemeral PG (infra weight), Playwright `webServer` double-boot (slow, non-parity), in-process seed import (blocked by top-level `process.exit`), and refactoring product code for coverage (out of scope — behavioral coverage instead).

---

## 10. Out of scope

- The **TDD-workflow codification** (CLAUDE.md agentic section, `.claude/agents/tester.md`/`implementer.md`, `.claude/commands/pm.md`, arbitration protocol, PM diff-gate) — PM-owned, separate.
- **GitHub Actions / CI wiring**, coverage gates in CI, CODEOWNERS — the deferred CI/CD pass. This pass only makes the suite CI-ready and flags the seam.
- **100% coverage**; testing generated types or the `(payload)` generator code.
- **Visual regression / screenshot, load/perf, mutation** testing; multi-browser Playwright matrices.
- Any **product functionality, collection, field, or migration** change.
- Refactoring `src/seed/index.ts` for in-process coverage (behavioral subprocess coverage is sufficient here).

---

## Open questions for the PM

1. **e2e execution model** — I planned "assume `docker compose up -d` is live, drive `app:3000`" (no `webServer`), which matches the dockerized model and the spec. Confirm that's acceptable vs. having Playwright boot the app itself. (Doesn't block authoring; changes only run wiring.)
2. **e2e browser stage** — I added a dedicated Dockerfile `e2e` stage to keep dev/prod lean, rather than baking Chromium into the dev image. Confirm that's the preferred shape (vs. on-demand `playwright install` each run). Both are documented; the stage is the CI-ready default.
