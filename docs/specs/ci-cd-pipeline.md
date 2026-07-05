# Spec: CI/CD pipeline + e2e networking fix

- **Slug:** ci-cd-pipeline
- **Date:** 2026-07-04
- **Primary audience:** faculty/moderators + contributors (maintainers)

## Problem
The scaffold and test suite shipped **CI-ready but with no CI**: nothing runs the tests, lint, typecheck, or build automatically, so `main` can regress silently and the TDD discipline we codified isn't actually enforced at the gate. Two deferred seams now come due: (1) a **GitHub Actions pipeline** that runs the full suite on every PR and publishes a deploy-ready image on merge, and (2) the **e2e in-container networking fix** so Playwright can drive the admin panel from a separate container on any OS / in CI (today it only works via a Linux `--network host` hack).

## Proposed outcome
- Every PR to `main` runs **lint, typecheck (+ generated-types drift check), unit + integration tests (against a real Postgres), e2e (Playwright), and a production image build** — all green required before merge (**branch protection**).
- On merge to `main`, a **versioned container image is built and pushed to GHCR** (GitHub Container Registry) — a deploy-ready artifact. No live deployment target this pass.
- **e2e runs cleanly in-container and in CI** without the `--network host` workaround, via a compose network alias not under the `.app` TLD + an env-gated `allowedDevOrigins` in `next.config.ts`. The Linux-only caveat in CLAUDE.md is removed.

## Decisions (settled)
- **CD scope:** CI validation on PRs + **GHCR image publish on merge to main**. No live deploy (no host established).
- **Enforcement:** branch protection on `main` **requires** the CI checks to pass before merge.
- CI runner: GitHub-hosted `ubuntu-latest`; Node 22 (match `.nvmrc`); pnpm via corepack.

## Acceptance criteria
### CI (on pull_request + push to main)
- [ ] `.github/workflows/ci.yml` runs: **lint**, **typecheck + `generate:types` drift check** (fails if committed `payload-types.ts` is stale), **unit + integration tests** against a real Postgres (service container or compose), **e2e** (Playwright), and a **production image build**.
- [ ] Integration tests run migrations against a fresh CI Postgres and pass; the migration set is validated (a missing migration fails CI).
- [ ] Coverage thresholds (≥90% lib/fields, ≥80% overall) are enforced in CI — a drop below fails the job.
- [ ] `PAYLOAD_SECRET` and any test creds come from **GitHub secrets / workflow env**, never hardcoded; no secret is printed in logs.
- [ ] CI is reasonably fast (dependency + Docker layer caching where it helps) and deterministic (headless, no interactive prompts).

### Image publish (on push to main)
- [ ] A workflow builds the **prod** image and pushes to **GHCR** (`ghcr.io/toddawhittaker/kite-and-key`), tagged with the commit SHA and `latest` (and/or a semver/date tag). Auth via the built-in `GITHUB_TOKEN` (no PAT).
- [ ] The published image is the `prod` Dockerfile target and runs migrations-then-boot as designed.

### e2e networking fix
- [ ] `docker-compose.yml` gives the `app` service a **network alias not under `.app`** (e.g. `webapp`) so Chromium won't force-HTTPS it.
- [ ] `next.config.ts` sets **`allowedDevOrigins`** (env-gated, e.g. from an `E2E`/dev flag) to permit the admin panel's `/_next/*` from that alias origin.
- [ ] Playwright e2e runs from the dedicated `e2e` image **on the compose network against the alias** (no `--network host`), green for all specs incl. admin login — and this is the invocation CI uses.
- [ ] CLAUDE.md's e2e section is updated to the new cross-platform command; the Linux-only caveat and the deferred-seam notes in the spec/plan are resolved.

### Branch protection
- [ ] `main` requires the CI status checks to pass before merge (configured via the GitHub API), and (at minimum) blocks direct pushes / force-pushes per sensible defaults.

## Content model impact
None.

## Out of scope
- **Live deployment** to any host (VPS/Fly/Railway/cloud) — no target established. The GHCR image is the handoff point; wiring a deploy is a later pass.
- Multi-environment (staging/prod) promotion, blue-green, migrations-on-deploy orchestration against a real DB.
- Image size optimization beyond what exists (the `--prod` deps split remains an optional future item).
- Secret management beyond GitHub Actions secrets (no Vault/cloud secret manager).
- CODEOWNERS-based enforcement of the test-ownership invariant (the PM diff-gate remains the mechanism; branch protection is about check-passing, not test authorship).

## Open questions
- CI test execution model — run via `docker compose` (consistent with the dockerized dev model) vs. directly on the runner with a Postgres **service container** (GitHub-idiomatic, faster). Architect to choose; both must keep prod-parity (migrations, `push:false`).
- Image tag scheme — SHA + `latest`, or add a date/semver tag. Default: SHA + `latest`.
- Whether e2e is a **required** check or a separate advisory job (it's the heaviest). Default: required, but in its own job so a flake is diagnosable. Confirm at plan if cost matters.
