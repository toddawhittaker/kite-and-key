# Plan: CI/CD pipeline + e2e networking fix

- **Slug:** ci-cd-pipeline
- **Spec:** `docs/specs/ci-cd-pipeline.md` (approved)
- **Scope:** GitHub Actions CI on PRs + push:main, GHCR image publish on merge, branch protection, and the deferred e2e in-container networking fix. **No live deploy** (GHCR image is the handoff point).

---

## Approach

One workflow file (`.github/workflows/ci.yml`) triggered on `pull_request` and `push: main`, with a DAG of jobs: three fast checks in parallel (`static`, `test`, `e2e`) that gate a final `image` job, whose GHCR **push** step is conditional on `push: main`. The DB/app-touching jobs (`test`, `e2e`) run **via `docker compose`** — reusing the exact documented local invocations and their prod-parity migrate/`push:false` path — while the pure-static checks (`static`: lint, typecheck, types-drift) run **directly on the runner with corepack pnpm**, since they need neither a DB nor the app image and shouldn't pay a full image build. The e2e networking fix ships as a **compose network alias `webapp`** on the `app` service (dodges the `.app`-gTLD HSTS preload) plus an **env-gated `allowedDevOrigins`** in `next.config.ts` fed by `ALLOWED_DEV_ORIGINS` (dev-server-only; inert in prod), so Playwright drives `http://webapp:3000` on the compose network with no `--network host` — cross-platform. This shape is chosen over a runner-side Postgres service container because the whole harness (`src/tests/helpers/db.ts` defaults, `runMigrations` subprocess, migrate-before-boot entrypoint, and the e2e compose-network requirement) is dockerized-first; a service container would fork the env matrix and lose prod-parity for the jobs that actually need Postgres, while buying nothing the static-on-runner split doesn't already give us on the cheap jobs.

## Data model

**None.** No Payload collections, fields, globals, or migrations change. Confirmed by spec ("Content model impact: None").

---

## 1. Workflow files — one file, not two

**`.github/workflows/ci.yml`** on both triggers:

```yaml
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
```

**One file, justified:** the publish must gate on the *same* `static`/`test`/`e2e`/`image` checks CI runs. Keeping publish in the same workflow lets it express that with a plain `needs:` on those jobs in one DAG. A separate `publish.yml` would have to chain via `workflow_run` (fires after CI completes, can't naturally reuse the jobs as PR-gating status checks, and duplicates checkout/build/cache setup). Publish is therefore the `image` job's conditional push step, not a second workflow. Concurrency guard to cancel superseded PR runs:

```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}
```
(Never cancel-in-progress on `push: main` — we don't want to abort a publish.)

Top-level least-privilege default `permissions: { contents: read }`; the `image` job elevates to `packages: write` (§5).

---

## 2. CI test execution model (resolves the spec open question)

**Decision: `docker compose` for the DB/app jobs (`test`, `e2e`, `image`); runner + corepack pnpm for `static` only.**

Why compose over a runner Postgres service container:
- **Zero harness divergence.** `src/tests/helpers/db.ts::testDatabaseUrl()` defaults to `postgres://postgres:postgres@db:5432/kite_and_key_test`; global setup creates + migrates that DB via a `pnpm exec payload migrate` **subprocess** using the real `src/payload.config.ts`. All of this already works unchanged inside `docker compose run --rm app …` because the compose network resolves host `db`. A service container would require threading `TEST_DATABASE_URI=…@localhost:5432/…` and re-solving browser/library provisioning for e2e on the bare runner.
- **Prod-parity kept.** Migrations run exactly as in prod (committed Drizzle migrations, `push:false`, migrate-before-boot). The integration run doubles as a migration-currency smoke test (a forgotten `migrate:create` → red), which the spec requires.
- **e2e *needs* the compose network** for the alias fix (§4); running the DB tests the same way keeps one consistent story.

**`test` job DB + migrations + secrets flow:**
- Create a CI `.env` (compose `app` service declares `env_file: .env`, which errors if absent) containing a **dummy** `PAYLOAD_SECRET` and dummy `SEED_ADMIN_*` — integration tests use Payload's Local API where the secret value is immaterial, and Vitest `test.env` already defaults `PAYLOAD_SECRET` if unset.
- `docker compose … up -d --wait db` (healthcheck-gated), then `docker compose … run --rm app pnpm test:coverage`.
- Vitest `globalSetup` runs `createTestDatabase()` (via `pg`) then `runMigrations()` against `kite_and_key_test`; per-test `TRUNCATE`. Coverage thresholds (≥90% `src/lib`+`src/fields`, ≥80% overall) are enforced by `vitest.config.ts` → the job fails on a drop.
- **Secrets:** real `PAYLOAD_SECRET`/`SEED_ADMIN_*` are GitHub secrets, only needed by the **`e2e`** job (real admin login) and never printed — written to `.env` with `>>` (Actions masks registered secret values in logs). The `test` job uses dummies and needs no secrets.

The one wrinkle: `docker compose run app …` triggers the entrypoint's `pnpm payload migrate` against the **dev** DB (`kite_and_key`) before the test command. Harmless (fresh empty DB, ~seconds) but redundant; optionally bypass with `--entrypoint sh app -c "pnpm test:coverage"` to skip it. Noted as an optimization, not required.

---

## 3. Jobs, concretely

Job graph: `static ∥ test ∥ e2e` all run with no `needs:`; **`image` `needs: [static, test, e2e]`**. On a PR, `image` is build-only (validates the `prod` target compiles); on `push: main` it also pushes to GHCR.

### `static` (runner: `ubuntu-latest`, Node 22)
Steps:
1. `actions/checkout@v4`
2. Enable pnpm: rely on `packageManager: pnpm@11.9.0` — `corepack enable` (or `pnpm/action-setup@v4` with `run_install: false`).
3. `actions/setup-node@v4` with `node-version-file: .nvmrc` (= 22) and `cache: pnpm` (caches the pnpm store keyed on `pnpm-lock.yaml`).
4. `pnpm install --frozen-lockfile`.
5. **lint:** `pnpm lint`.
6. **typecheck:** `pnpm typecheck` (new script = `next typegen && tsc --noEmit`). `next typegen` (present in Next 16.2.6) regenerates the gitignored `next-env.d.ts` + `.next/types` that `tsconfig.json` includes, so `tsc --noEmit` is clean on a fresh checkout. Provide dummy `PAYLOAD_SECRET`/`DATABASE_URI` env (no DB connection is made).
7. **types-drift:** `pnpm generate:types && git diff --exit-code src/payload-types.ts` — fails if the committed `src/payload-types.ts` is stale. Same dummy env.

Caching: pnpm store via `setup-node`. No Docker here. These three checks are fast and share one `pnpm install`, so they live in one job (fewer required-check contexts, one install) run sequentially; a failure in any fails `static`.

### `test` (runner + docker compose)
Steps:
1. checkout
2. `docker/setup-buildx-action@v3`
3. Build the **dev** image with `docker/build-push-action@v6`: `target: dev`, `tags: kite-and-key:dev`, `load: true`, `cache-from: type=gha,scope=dev`, `cache-to: type=gha,mode=max,scope=dev`.
4. Write CI `.env` (dummy secret).
5. `docker compose -f docker-compose.yml -f docker-compose.ci.yml up -d --wait db`
6. `docker compose -f docker-compose.yml -f docker-compose.ci.yml run --rm app pnpm test:coverage`

`docker-compose.ci.yml` (new, §7) sets `app.image: kite-and-key:dev` + `pull_policy: never` so compose reuses the buildx-loaded, layer-cached image instead of rebuilding. Source arrives via the existing `.:/app` bind mount (runner checkout); node_modules via the image's `/app/node_modules` seeding the anon volume. Caching: buildx **gha** layer cache (`scope=dev`) — the `pnpm install` layer is the expensive one and is reused across runs.

### `e2e` (runner + docker compose) — its own job
Steps:
1. checkout
2. `docker/setup-buildx-action@v3`
3. build **dev** image (as above, cache `scope=dev` — shared with `test`).
4. build **e2e** image: `target: e2e`, `tags: kite-and-key:e2e`, `load: true`, `cache-from/to: type=gha,scope=e2e`.
5. Write CI `.env` with the **real** `PAYLOAD_SECRET` + `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` from GitHub secrets.
6. `docker compose … --profile e2e up -d --wait db app` — app entrypoint migrates the dev DB and boots; `--wait` blocks on the new `app` healthcheck (§4).
7. `docker compose … run --rm app pnpm seed` — seeds the dev DB with the admin (from env) + sample content the specs assert.
8. `docker compose … run --rm e2e pnpm test:e2e` — e2e image drives `http://webapp:3000` on the compose network (`E2E_BASE_URL` set on the `e2e` service).
9. `if: failure()` → `docker compose … logs --no-color app` for diagnosis, and `actions/upload-artifact@v4` of `playwright-report/` (already gitignored).

Separate job (spec default) so a flake is diagnosable in isolation and its heavier runtime doesn't serialize behind `test`. Required check nonetheless (§6). `retries: 1` in CI is already configured in `playwright.config.ts`.

### `image` (runner + buildx) — `needs: [static, test, e2e]`
Steps:
1. checkout
2. `docker/setup-buildx-action@v3`
3. `docker/metadata-action@v5` for `ghcr.io/toddawhittaker/kite-and-key` → tags `type=sha` + `type=raw,value=latest,enable={{is_default_branch}}`.
4. `docker/login-action@v3` (ghcr.io, `github.actor` / `secrets.GITHUB_TOKEN`) — **only** `if: github.event_name == 'push'`.
5. `docker/build-push-action@v6`: `target: prod`, `push: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}`, `tags: ${{ steps.meta.outputs.tags }}`, `cache-from/to: type=gha,scope=prod`, **no build-args/secrets** (env-free build — §5).

On PRs this is a build-only validation of the `prod` target (a real gate that the production image compiles); on main it also pushes. Single job → one `next build`, no double compile.

**Parallelism summary:** `static`, `test`, `e2e` run concurrently; `image` waits for all three. Wall-clock ≈ max(static, test, e2e) + image; e2e is the long pole (browser + seed + boot).

---

## 4. The e2e networking fix (file-level)

Root cause (confirmed in `docs/plans/testing-and-tdd-workflow.md` §9 and the `playwright.config.ts` header): a bare `app` service-name origin fails two ways — Chromium force-upgrades `app` to HTTPS because `.app` is on the **static HSTS preload list**, and Next dev's `allowedDevOrigins` blocks the admin panel's `/_next/*` from any non-`localhost` origin. Fix both:

**(a) `docker-compose.yml` — network alias `webapp` on `app`** (not under `.app`, so no HSTS upgrade):
```yaml
  app:
    networks:
      default:
        aliases:
          - webapp
```
(Compose's implicit `default` network; declaring the alias doesn't otherwise change topology.)

**(b) `docker-compose.yml` — `app` service env + healthcheck:**
```yaml
    environment:
      DATABASE_URI: postgres://postgres:postgres@db:5432/kite_and_key
      ALLOWED_DEV_ORIGINS: webapp        # unblocks /_next/* for the webapp origin (dev-server only)
    healthcheck:
      test: ['CMD', 'node', '-e', "fetch('http://localhost:3000').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 5s
      timeout: 5s
      retries: 20
      start_period: 40s
```
Node 22's global `fetch` avoids needing curl/wget in the slim image. The healthcheck is what `--wait` and the `e2e` service's `depends_on` block on — the stack-readiness guard against flakes.

**(c) `next.config.ts` — env-gated `allowedDevOrigins`:**
```ts
const allowedDevOrigins = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  : undefined

const nextConfig: NextConfig = {
  ...(allowedDevOrigins ? { allowedDevOrigins } : {}),
  // …existing config…
}
```
Gated by `ALLOWED_DEV_ORIGINS`; **does not loosen prod** — `allowedDevOrigins` is a `next dev` feature only (ignored by `next start`), and the value (`webapp`) is a private compose hostname unroutable outside the network. Left unset in normal dev/prod → `undefined` → Next default (localhost only).

**(d) `docker-compose.yml` — new `e2e` service** (behind `--profile e2e`, mirroring `app-prod`'s profile pattern; usable locally *and* in CI):
```yaml
  e2e:
    profiles: [e2e]
    build: { context: ., target: e2e }
    depends_on:
      app:
        condition: service_healthy
    env_file: [.env]
    environment:
      E2E_BASE_URL: http://webapp:3000
      SEED_ADMIN_EMAIL: ${SEED_ADMIN_EMAIL}
      SEED_ADMIN_PASSWORD: ${SEED_ADMIN_PASSWORD}
```

**Exact CI e2e invocation** (no `--network host`): build `e2e` image (buildx cache) → `docker compose --profile e2e up -d --wait db app` → `run --rm app pnpm seed` → `run --rm e2e pnpm test:e2e`. Because it's all inside the compose network, this works identically on Linux, macOS, and Windows Docker — the cross-platform requirement is met.

**Doc updates that ship with this (implementer edits):**
- `CLAUDE.md` "End-to-end tests" section: replace the Linux `--network host` block with the cross-platform command: `docker compose --profile e2e up -d --wait db app && docker compose run --rm app pnpm seed && docker compose run --rm e2e pnpm test:e2e`. Remove the Linux-only caveat and the "deferred to the CI/CD pass" sentence.
- `playwright.config.ts` header comment: replace the "compose service name does NOT work / out of scope" note with the `webapp` alias + `allowedDevOrigins` explanation; keep `baseURL` default `http://localhost:3000` for host-dev runs (the `e2e` service overrides via `E2E_BASE_URL`). The `--disable-features=HttpsUpgrades` launch arg can stay (harmless) or be dropped — no longer load-bearing.
- `docs/plans/testing-and-tdd-workflow.md` §9: append a one-line "Resolved in ci-cd-pipeline" note to the e2e deferred-seam paragraph.

---

## 5. GHCR publish

- **Action:** `docker/build-push-action@v6`, `target: prod`, building the existing Dockerfile `prod` stage.
- **Repository:** `ghcr.io/toddawhittaker/kite-and-key`.
- **Tags** (via `docker/metadata-action@v5`): `type=sha` (e.g. `sha-<7char>`, the default artifact identifier) + `type=raw,value=latest,enable={{is_default_branch}}`. SHA + `latest` is the spec default; a date/semver tag is a trivial later add.
- **Permissions:** `image` job sets `permissions: { contents: read, packages: write }`.
- **Auth:** `docker/login-action@v3` with `username: ${{ github.actor }}`, `password: ${{ secrets.GITHUB_TOKEN }}` — the built-in token, **no PAT**.
- **Env-free build:** no `build-args` or `secrets` passed. The Dockerfile `build` stage runs `next build` with zero env (comment already asserts this), and `docker-entrypoint.sh` enforces `PAYLOAD_SECRET`/runs migrate only at **runtime**. So no secret is baked into the image.
- **First-push visibility:** the GHCR package is created on first successful push and defaults to **private** (fine — a future deploy consumer authenticates). No action needed now; note it so the maintainer isn't surprised the package isn't public.

---

## 6. Branch protection

**Required status-check contexts = the job names:** `static`, `test`, `e2e`, `image`. (GitHub derives the context from each job's display name; none use a matrix, so the names are literal.)

**Critical anti-lockout constraints:**
- Every required job **must run on `pull_request`** (never gate an entire required job behind `if: github.event_name == 'push'`, or its check reports *skipped* and the PR is permanently unmergeable). Only the login/push **steps** inside `image` are `push`-conditional; the job itself runs on PRs.
- **Do not require PR reviews** — a solo maintainer can't approve their own PR, so `required_pull_request_reviews: null`.
- **`enforce_admins: false`** so the owner retains an emergency-merge escape hatch and can't self-lock on a stuck/renamed check.
- **Ordering:** branch protection can only reference checks GitHub has *seen* run at least once. Apply it **after** `ci.yml` has merged to `main` and run once — otherwise the context names don't exist yet. (PM applies this post-merge.)

**`gh api` call (PM applies — outward-facing):**
```bash
gh api -X PUT repos/toddawhittaker/kite-and-key/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  --input - <<'JSON'
{
  "required_status_checks": { "strict": false, "contexts": ["static", "test", "e2e", "image"] },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
```
`strict: false` (don't force every PR to re-sync with `main` before merge) — reduces rebase churn for a low-concurrency solo repo; flip to `true` later if desired. `allow_force_pushes`/`allow_deletions` false protect `main` history per the spec's "sensible defaults."

---

## 7. Files to create / touch

**Create:**
- `.github/workflows/ci.yml` — the whole pipeline (jobs `static`, `test`, `e2e`, `image`).
- `docker-compose.ci.yml` — CI override: `app.image: kite-and-key:dev` + `pull_policy: never`; `e2e.image: kite-and-key:e2e` + `pull_policy: never`. Lets compose reuse buildx-loaded, gha-cached images without rebuilding.

**Edit:**
- `docker-compose.yml` — `app` network alias `webapp`, `ALLOWED_DEV_ORIGINS: webapp`, node-`fetch` healthcheck; new `e2e` service (profile `e2e`).
- `next.config.ts` — env-gated `allowedDevOrigins` from `ALLOWED_DEV_ORIGINS`.
- `package.json` — add `"typecheck": "next typegen && tsc --noEmit"` script. (No new deps: `@playwright/test`, `vitest`, `pg`, buildx are already present / provided by the runner.)
- `CLAUDE.md` — rewrite the e2e command block (§4); optionally add a short "CI" bullet under Commands.
- `playwright.config.ts` — update the header comment (§4).
- `docs/plans/testing-and-tdd-workflow.md` — §9 "resolved" note (§4).

**Do NOT touch:** `Dockerfile` — the `dev`/`prod`/`e2e` stages and `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` are already exactly what the pipeline needs. `docker-entrypoint.sh` — migrate-before-boot is already correct.

---

## 8. Step order + risks

**Order:**
1. e2e networking fix first (`docker-compose.yml` alias/env/healthcheck + `e2e` service, `next.config.ts`) — verify locally with the new cross-platform command before wiring CI, so CI isn't debugging two things at once.
2. `package.json` `typecheck` script.
3. `docker-compose.ci.yml`.
4. `.github/workflows/ci.yml` — `static` → `test` → `e2e` → `image`, iterating on a branch (workflows run on PRs).
5. Doc edits (`CLAUDE.md`, `playwright.config.ts`, testing plan §9).
6. **After merge to main:** PM applies branch protection (§6) once the checks have reported once, and adds GitHub secrets `PAYLOAD_SECRET`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`.

**Risks / watch-items:**
- **Self-lockout (highest):** a required check that never reports = unmergeable `main`. Guard: required jobs run on `pull_request`; `enforce_admins:false`; apply protection only after the first green run; don't require reviews. Flagged for the devops-reviewer.
- **e2e reliability:** browser install is isolated to the cached `e2e` stage (no per-run download); stack readiness is gated by the `app` healthcheck + `--wait` + `depends_on: service_healthy` (not a `sleep`); seed runs before specs; `retries: 1` in CI. Upload `playwright-report/` + dump `app` logs on failure. The `admin.spec.ts` login needs the **real** seeded creds → real secrets in the `e2e` job (it `test.skip`s if unset, which would silently pass — ensure the secrets are set so it actually runs).
- **Caching correctness:** buildx `type=gha` scoped per target (`dev`/`e2e`/`prod`) keyed on the Dockerfile + lockfile layers; `pull_policy: never` in the CI override prevents compose from rebuilding/pulling over the loaded image. If a cache scope is shared across differing targets it can serve stale layers — keep scopes distinct.
- **Migration-drift check** is implicit: the `test` job migrates `kite_and_key_test` from committed migrations; a schema change without `migrate:create` → red integration run (feature, per testing plan §3). The `types-drift` step catches stale `payload-types.ts` separately.
- **GHCR perms / first push:** package defaults **private** — expected, fine. `packages: write` scoped to the `image` job only. `GITHUB_TOKEN` (no PAT) suffices for pushing to the repo-owned namespace.
- **Secret handling:** real secrets only in the `e2e` job's `.env`, written with `>>` (values masked in logs); `test`/`static` use dummies; prod image build is env-free (no baked secrets).
- **CI time sanity:** three parallel gates + one gated image build; buildx gha cache keeps `pnpm install` and `next build` layers warm; `static` avoids Docker entirely. e2e is the long pole — acceptable as the spec accepts it as required-but-isolated.

## Out of scope

- Live deployment to any host; multi-env promotion; migrations-on-deploy against a real DB (GHCR image is the handoff).
- CODEOWNERS / test-ownership CI enforcement (PM diff-gate remains the mechanism).
- Image-size optimization (`--prod` deps split); date/semver tag scheme beyond SHA + `latest`.
- Any product/collection/field/migration change; secret managers beyond GitHub Actions secrets.
