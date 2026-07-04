# Spec: Scaffold the Next.js + Payload monorepo

- **Slug:** scaffold-monorepo
- **Date:** 2026-07-04
- **Primary audience:** faculty/moderator (as first editors), with all public audiences downstream

## Problem
The repo is greenfield — only docs exist. Before any audience-facing feature can be built, we need the decided target stack actually standing up: a **Next.js (App Router) + Payload CMS monorepo**, self-hosted, Postgres-backed, with the admin at `/admin` so non-technical student editors and faculty can manage content. Everything in the mission — making student work visible and credible — depends on content being CMS-driven from day one, so the scaffold must establish that pattern (content is the source of truth), not just boot a Next app.

## Proposed outcome
After this ships, a developer can clone the repo, install, set env, run migrations, and:
- Visit the public site at `/` and see placeholder pages for the planned routes, each rendering **from CMS content** (not hardcoded).
- Visit `/admin`, log in as the seeded first user, and see the planned collections ready to edit.
- Non-technical editors have a coherent admin: collections are named and grouped in Build / Engage / Publish terms, with human-readable labels and descriptions.

The scaffold is a foundation, not a finished site — copy is clearly-labeled placeholder, styling is a minimal design-token baseline, and pages prove the content→render pipeline works end to end.

## Decisions (settled)
- **Database:** PostgreSQL (Payload Postgres adapter + Drizzle migrations).
- **Package manager:** pnpm.
- **Language:** TypeScript throughout.
- **Styling:** Tailwind CSS.
- **Scope:** runnable skeleton **+ collections modeled + page shells wired to content.**
- **Runtime: Docker-first.** The whole dev stack runs in containers — **both Postgres and the Next/Payload app** — brought up with a single `docker compose up`. No service is installed natively on the host beyond Docker itself. A production-oriented Dockerfile builds the app image; local dev uses a dev target with source bind-mounted for hot reload and `node_modules` + Postgres data in named volumes. (Rationale: minimal host footprint, reproducibility, and a container-based deploy path. See [[prefers-dockerized-dev]].)
- Host has Docker 29.6 + compose v5.3, Node 22 + pnpm 11 already available; host `pnpm install` is optional (IDE type info only).

## Acceptance criteria
- [ ] **`docker compose up` boots the full stack** — Postgres + the Next/Payload app, both containerized — with no native service install. App reachable on the host at `http://localhost:3000`, `/admin` loads, and an admin user can log in.
- [ ] The app container connects to the Postgres container over the compose network (service hostname, not `localhost`); `.env`/compose wires `DATABASE_URI` accordingly.
- [ ] Migrations run **inside the app container** (`docker compose run/exec ... payload migrate`) cleanly against a fresh Postgres volume; documented migrate-before-boot ordering.
- [ ] Editing a source file on the host hot-reloads the app running in the container (bind-mount works).
- [ ] A production image builds (`docker build` / compose build of the prod target) and `pnpm build` succeeds inside it.
- [ ] A `.dockerignore` keeps `node_modules`, `.next`, `.git`, `.env` out of the build context.
- [ ] Payload collections exist, modeled to capture credibility-creating specifics (not just title + blurb):
  - **Users** (auth; roles for admin/editor).
  - **Projects** — problem addressed, technologies, student contributors (relation to Profiles), learning outcomes/artifacts, pillar tags.
  - **Blog posts** — author (relation to Profiles), body, publish state.
  - **Profiles** (student/team) — name, program, bio, links, contributions.
  - **Events** — Engage activities (workshops, code reviews, employer sessions).
  - **Partner opportunities** — bounded, faculty-overseen intake fields.
  - (Media collection for uploads.)
- [ ] Collections are grouped/labeled in the admin around Build / Engage / Publish vocabulary and readable by non-technical editors.
- [ ] Public routes exist as page shells rendering from CMS: Home, About, Projects (list), Students, Blog (list), Partner With Us, Get Involved.
- [ ] At least one list page (Projects or Blog) queries Payload and renders seeded content, proving the content→render pipeline.
- [ ] A seed path (script or documented steps) creates the first admin user and minimal sample content so the app isn't empty on first run.
- [ ] TypeScript, lint, and a build (`pnpm build`) all pass. Payload generates types.
- [ ] `.env.example` documents required env vars; secrets are not committed.
- [ ] CLAUDE.md "Commands" and "Architecture" sections are updated to reflect the real project; the greenfield "Status" note is removed.

## Content model impact
Introduces the initial Payload collections listed above. Field-level modeling detail is the architect's to finalize in the plan, but the **specificity requirement is a spec-level constraint**: Projects and Profiles must capture problem/tech/contributors/outcomes, and Partner opportunities must encode the *bounded, faculty-overseen* framing.

## Out of scope
- Real content, real student/partner data, real copy (placeholders only, clearly labeled).
- Visual/brand design system beyond a minimal token baseline (a later designer pass).
- Auth beyond Payload's built-in local auth + basic roles (no SSO, no external IdP).
- **CI/CD pipelines and a real deploy target/host** (later /pm pass). The app Dockerfile + compose stack are in scope now; wiring them into GitHub Actions and a production host is not. The devops-reviewer notes the seam.
- Container orchestration beyond docker-compose (no k8s), image registry/publishing, TLS/reverse-proxy in front of the app.
- Search, rich filtering, pagination polish, SEO depth.
- Access-control hardening beyond sensible collection defaults (security-auditor will flag; full hardening is a follow-up).

## Open questions (resolved)
- Node version: **22 LTS**, pinned. (Was LTS 20 vs 22.)
- Monorepo tooling: **single combined app** (Payload's Next integration), no workspace split.
- Rich text: **Lexical**.
- Runtime: **Docker-first, app + Postgres both containerized** (this revision).
