# Spec: Testing infrastructure + TDD separation-of-duties workflow

- **Slug:** testing-and-tdd-workflow
- **Date:** 2026-07-04
- **Primary audience:** faculty/moderators + future contributors (the people who maintain and extend the codebase)

## Problem
The scaffold shipped with **zero automated tests** (deferred by its spec) — behavior is only protected by manual verification, which silently regresses. We just fixed a HIGH draft-leak bug that a test would have caught and would now prevent from recurring. Separately, the team wants a **repeatable TDD discipline** with real separation of duties so tests can't be weakened by whoever is racing to make them pass. This spec establishes both: a test harness + high-coverage retroactive suite for the existing scaffold, and a codified TDD workflow that governs future changes.

## Proposed outcome
After this ships:
- Running `docker compose run --rm app pnpm test` executes a fast **unit/integration** suite (Vitest); `pnpm test:e2e` runs **end-to-end** browser tests (Playwright) against the running stack. Both run in-container, matching the dockerized dev model.
- The existing scaffold's logic, access control, hooks, seed, and API/route behavior are covered at **high coverage**, including an explicit **draft-leak regression test** (the bug we just fixed stays fixed).
- The **e2e/behavioral verification is retained** (Playwright over the routes + admin), not replaced by unit tests.
- The `/pm` agentic workflow **codifies TDD with separation of duties**: a test-author role owns tests, the implementer builds against them and may not edit them, and the PM arbitrates disagreements. Policy: TDD is **default (test-first) whenever the user surfaces a bug**, and used for **logic-heavy changes** otherwise; trivial glue is exempt.

## Decisions (proposed — confirm at gate)
- **Frameworks:** **Vitest** for unit + integration (Local-API/access) tests; **Playwright** for e2e. (Modern, ESM-native, fast; Playwright already implied by "keep e2e".)
- **Coverage target ("high"):** **≥90% statements/branches** on the testable logic layer (`src/lib/`, `src/fields/`, `src/access` helpers, seed logic, collection `access` functions); **≥80% overall** on `src/` measured with generated/framework-owned code excluded (`src/payload-types.ts`, `src/migrations/`, `src/app/(payload)/` generator code, `.next`). E2e covers all 7 routes + a project detail + admin login + the negative-auth API boundaries. *(Adjustable — say if you want a different bar.)*
- **Retroactive = test-after/characterization** for the existing scaffold (you can't drive already-written code test-first). **True TDD begins with the next feature** under the new workflow. Several retroactive tests are written to assert the *post-fix* behavior (e.g. draft exclusion) so they'd have gone red against the pre-fix code.

## Acceptance criteria
### Test infrastructure + suite
- [ ] `pnpm test` (Vitest) and `pnpm test:e2e` (Playwright) scripts exist and run **in-container**; `pnpm test` is fast (no browser) and `pnpm test:e2e` drives the real stack.
- [ ] A test Postgres strategy exists that does **not** clobber dev data (separate database/schema or ephemeral), documented; integration tests reset state between runs.
- [ ] Coverage reporting is wired (`pnpm test --coverage` or equivalent) with the exclusions above, and meets the agreed target.
- [ ] **Unit** tests cover: `slugField` hook (slugify-on-empty, collision behavior), `src/lib/access.ts` helpers (`isAdmin`, `isAuthenticated`, `anyone`, `publishedOrAuth` — anon vs. auth branches), and `findPublic` defaults (`overrideAccess:false` + `draft:false` always applied).
- [ ] **Integration** tests (Local API against a test DB) cover: each collection's access baseline (public read where intended; PartnerOpportunities/Users not publicly readable; writes require auth), **draft exclusion for anonymous callers on Projects/Posts/Events (the regression test)**, and seed idempotency.
- [ ] **E2e** tests (Playwright): the 7 routes + a project detail return 200 and render seeded content; `/admin` login works; anon `GET /api/partner-opportunities` and `/api/users` → 403 while `/api/projects` → 200; anon draft is absent from `/projects` and `?draft=true`.
- [ ] `docker compose --profile prod build` and lint remain green; new test deps don't break the prod image.

### Codified TDD workflow
- [ ] `CLAUDE.md`'s agentic-workflow section documents: the **test-author owns tests / implementer may not edit them / PM arbitrates** invariant; the **TDD policy** (default for user-surfaced bugs; logic-heavy otherwise; trivial exempt); and that **enforcement is the PM diff-gate** (`git diff <base> -- <test globs>` must be empty on implementer turns), a process guarantee not a permission wall.
- [ ] The **arbitration protocol** is written down: implementer never edits a test even when it believes the test is wrong — it escalates to the PM, who rules against the spec/plan; if the test is wrong, **only the test-author changes it**.
- [ ] `.claude/agents/tester.md` is updated to a **test-author** mandate (write failing tests first from spec/plan when in a TDD pass; own the test files) while retaining its e2e/behavioral-verification role.
- [ ] `.claude/agents/implementer.md` states the **tests are off-limits** and the escalation path.
- [ ] `.claude/commands/pm.md` adds the TDD-pass sequencing (test-author red → implementer green with diff-gate → arbitration) as a mode within the pipeline.
- [ ] `docs/specs/TEMPLATE.md`-driven specs continue to carry acceptance criteria the test-author turns into tests (no change needed, but note the linkage).

## Content model impact
None. No Payload collections or fields change.

## Out of scope
- **CI wiring** (GitHub Actions running the suite, coverage gates in CI, CODEOWNERS-enforcing the test-ownership invariant) — remains the deferred CI/CD pass. This pass makes the **unit + integration** suites CI-ready (headless in-container) and notes the seam. Enforcement of the invariant is the PM diff-gate for now.
- **Clean cross-platform e2e-in-container networking** — a compose network alias not under the `.app` TLD + an env-gated `allowedDevOrigins` in `next.config.ts`, so Playwright can drive the admin panel from a separate container on any OS. Confirmed needed during review (see plan §9). Deferred to the CI/CD pass; **today e2e runs via the Linux host-network invocation** documented in CLAUDE.md.
- 100% coverage / testing framework-owned `(payload)` generator code or generated types.
- Visual regression / screenshot testing, load/perf testing, mutation testing.
- Retrofitting true TDD onto the already-written scaffold (it's characterization here; true TDD starts next feature).
- New product functionality — this pass adds tests + workflow only.

## Open questions
- Coverage target numbers (see Decisions) — accept ≥90% logic / ≥80% overall, or set a different bar?
- Test DB: separate database in the existing compose `db` container vs. a throwaway ephemeral instance — architect to choose in the plan unless you have a preference.
- Should the `/pm` workflow also gain an explicit **`/pm tdd ...`** invocation for forcing a TDD pass, or is "default for user-surfaced bugs + logic-heavy" auto-detection enough?
