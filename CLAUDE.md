# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Kite & Key IT is the public-facing platform and operating identity for a student-driven applied technology initiative connected to Franklin University's Computing Sciences and Mathematics programs. It is **not merely a marketing website** — it is the visible surface of a career-connected learning model whose deeper purpose is to help students accumulate **credible, portfolio-ready evidence of capability before graduation**.

The site's job is to make student talent, student work, and student professional growth legible to the audiences who most need to see it. Every build decision should be judged against that: does this make real student work more visible, specific, and credible?

### The three pillars

Content and information architecture organize around three pillars. Reuse this vocabulary in code, content models, and copy:

- **Build** — applied technical work: software development, cloud migration, data solutions, cybersecurity support, web modernization, and other *scoped* technology projects.
- **Engage** — the professional/community relationships that make the work valuable: mentorship, code reviews, workshops, employer interaction, collaboration with regional tech professionals.
- **Publish** — the visible evidence students create: project writeups, blog posts, case studies, open-source contributions, conference talks, portfolio artifacts.

### Audiences (each page should serve one primarily)

- **Prospective students** — answer "If I study technology here, what will I actually get to do?" with concrete examples, not program-brochure claims.
- **Employers** — a lightweight talent *signal*: evidence students produce work, solve problems, and engage industry tools. A supporting layer to hiring, not a replacement.
- **Project partners** — a structured intake point for **bounded**, educationally-appropriate projects with faculty oversight. Never promise unrestricted consulting labor.
- **Current students** — a bridge from "I completed a course" to "here is a project I contributed to, the problem, the tech, what I learned, and how I communicate about it."
- **Faculty / moderators** — the people maintaining content and providing oversight.

## Architecture

Single combined app: **Next.js (App Router) + Payload CMS in one codebase**, self-hosted, no third-party CMS SaaS. Payload runs *inside* the Next.js app as a route group, not a separate service.

- **Public site** — `src/app/(frontend)/` renders the audience-facing pages (Server Components) from CMS content via Payload's Local API (`src/lib/payload.ts`'s `getPayloadClient()`).
- **CMS** — `src/app/(payload)/` is generator-owned (admin UI + REST/GraphQL routes) at `/admin` — treat it as read-only; don't hand-edit.
- **Database** — PostgreSQL via `@payloadcms/db-postgres`, Drizzle migrations, `push: false` (migration-based workflow — see Commands). Migrations live in `src/migrations/`.
- **Content is the source of truth.** Pages are driven by CMS collections (`src/collections/`) and the `about` global (`src/globals/About.ts`), not hardcoded. Data access is centralized in `src/lib/payload.ts`; public queries always pass `draft: false`.
- **Access control** is centralized in `src/lib/access.ts` (`isAdmin`, `isAuthenticated`, `anyone`) — sensible defaults (auth-required writes, public reads on published content), not yet hardened. See the collections for the seam.

### Container topology

The whole dev stack runs in Docker — **both Postgres and the Next/Payload app** — via `docker compose up`. No native service runs on the host beyond Docker itself.

- **`db`** service — `postgres:16-bookworm`, named volume `pgdata`, healthcheck-gated.
- **`app`** service — built from the repo's multi-stage `Dockerfile` (`dev` target for local work: source bind-mounted for hot reload, with anonymous volumes on `/app/node_modules` and `/app/.next` so the bind mount doesn't shadow the container's installed deps/build). Connects to Postgres over the compose network at host `db` (never `localhost` — the app service's `environment.DATABASE_URI` sets this).
- **`docker-entrypoint.sh`** runs `pnpm payload migrate` before exec'ing the CMD, so migrations apply automatically against a fresh `pgdata` volume before the app boots (dev and prod alike).
- **`app-prod`** service (behind `--profile prod`) builds the `prod` target — a `pnpm build` + `pnpm start` image, no Next `output: 'standalone'` (deferred; Payload's admin/importMap + standalone copy has known gotchas) — for smoke-testing the production image without disturbing the default dev `docker compose up`.

### Content types (Payload collections)

`Projects` (Build), `Events` + `PartnerOpportunities` (Engage), `Posts` + `Profiles` (Publish), `Media` + `Users` (System) — grouped in the admin sidebar using the Build/Engage/Publish vocabulary. Projects/Posts/Events have `versions.drafts` enabled. See `src/collections/` for full field models (problem addressed, technologies, student contributors, outcomes/artifacts for Projects; bounded/faculty-overseen intake fields for PartnerOpportunities).

### Public pages

Home, About, Projects (list + detail), Students, Blog, Partner With Us (`/partner`), Get Involved (`/get-involved`) — under `src/app/(frontend)/`, sharing `src/components/site-header.tsx` + `site-footer.tsx` + `page-container.tsx`. Projects/Students/Blog query Payload's Local API and render seeded content; Home/About/Partner/Get Involved are static shells (About renders from the `about` global). Each page targets one primary audience per CLAUDE.md's audience list.

## Voice and content principles

These are product requirements, not style preferences — credibility depends on them.

- **Credibility comes from specificity.** Name the kinds of projects, describe the technologies, show artifacts, tell real student stories, make partner engagement concrete. Avoid vague "career readiness" language.
- **Professional but not inflated.** It must not read like a generic startup, a university brochure, or a student club page with nicer graphics. Aim for: serious applied-learning platform — student-centered, employer-aware, community-facing, grounded in real work.
- **"Bounded" is load-bearing** for partner-facing copy and intake. Scoped, faculty-overseen, realistic expectations — never open-ended consulting.

## Agentic workflow

Development runs through a PM-orchestrated pipeline. **You talk only to the root session**, which acts as Product Manager; the specialists are subagents it dispatches (cold context each) and whose results it synthesizes.

Entry point: **`/pm <what you want>`** (`.claude/commands/pm.md`).

Pipeline — two human gates, autonomous in between:
```
/pm → clarify → docs/specs/<slug>.md   ── GATE 1: approve spec
    → architect (+ designer) → docs/plans/<slug>.md   ── GATE 2: approve plan
    → implementer
    → reviewer ∥ tester ∥ security-auditor ∥ devops-reviewer   (parallel; skip what doesn't apply)
    → PM synthesizes findings → implementer fixes → re-review
    → PM ships via gh: branch → PR (from spec/plan/reviews) → CI → merge → report
```

**GitHub / CI-CD.** No dedicated agent — it's split by kind:
- **PR/branch/merge glue** is the PM's job via the `gh` CLI (step 6): feature branch, PR body drafted from the spec + plan + review synthesis, findings optionally posted with `/code-review --comment`, merge only on green + your approval. Pushing/opening PRs/merging are outward-facing — the PM confirms unless you've said to ship autonomously, and never commits to the default branch.
- **CI/CD authoring** is in-scope for the **architect** (plans it) and **implementer** (writes `.github/workflows/*.yml`, migrations, env), reviewed by the **devops-reviewer** — authoring and review stay in separate roles.
- **CI monitoring** is a mechanism, not an agent — `gh pr checks` or a `/loop`, triggered by the PM; red builds route back through the warm-implementer fix loop.

Three cost disciplines keep this from being token-heavy:
- **Triage / right-sizing.** Trivial changes (copy, one-liners) the PM does inline — no spec, plan, or fan-out. `/pm lean …` swaps the four parallel reviewers for one `review-lean` agent (one context-load instead of four); reserve the full fan-out for risky changes.
- **Warm-agent reuse.** The fix/re-review loop continues existing agent instances via `SendMessage` instead of cold-spawning, so they skip re-reading context. Only the *first* spawn per role pays the cold cost.
- **Tight plan files.** A compact `docs/plans/<slug>.md` is what downstream agents read instead of re-exploring the tree — the better the plan, the cheaper everyone after it.

Specialists (`.claude/agents/`), tiered by model:
- **architect** (opus) — spec → technical plan; read-only on code, writes the plan doc.
- **implementer** (sonnet) — executes the plan; the only role that writes code freely.
- **reviewer** (opus) — correctness + cleanup; read-only.
- **tester** (sonnet) — writes/runs tests, drives the app; leans on `verify`/`run`.
- **security-auditor** (opus) — authz/access-control/injection; read-only, leans on `security-review`.
- **designer** (sonnet) — UI/UX + the editor experience; leans on `artifact-design`/`dataviz`.
- **devops-reviewer** (sonnet) — build/CI/migrations/deploy; read-only.
- **review-lean** (opus) — lean-mode stand-in: correctness + security + ops + light behavior in one pass; read-only.

Project skills (`.claude/skills/`): **`kk-voice`** (voice/content rules — load before any user-facing text) and **`payload-nextjs`** (stack conventions).

Conventions that keep this working:
- Specialists share state through **files in `docs/`** (spec, plan), never memory — every spawn is cold, so briefs must be self-contained.
- **Skip stages that don't fit** the change; don't run all seven for a copy tweak.
- Reviews rely on git diffs — once the repo is initialized the reviewer/security-auditor use `code-review`/`security-review`; before that they read changed files directly.

## Commands

The whole dev stack is Docker-first — Postgres and the Next/Payload app both run in containers. No native service is required on the host beyond Docker itself (host `pnpm install` is optional, for IDE type info only).

```
docker compose up                         # full stack: Postgres + app. Site :3000, admin :3000/admin
docker compose up -d db                   # Postgres only
docker compose run --rm app pnpm payload migrate:create <name>   # new Drizzle migration
docker compose run --rm app pnpm payload migrate                 # apply (entrypoint also does this on boot)
docker compose run --rm app pnpm seed                            # dev-only: first admin + sample content
docker compose run --rm app pnpm generate:types                 # regen src/payload-types.ts
docker compose run --rm app pnpm lint
docker compose build                      # rebuild images after dependency/Dockerfile changes
docker compose --profile prod up          # smoke-test the production image (app-prod, :3001)
docker compose down -v                    # stop + wipe DB volume (fresh-DB test)
```

First run on a fresh machine: copy `.env.example` to `.env` and set `PAYLOAD_SECRET` (`openssl rand -hex 32`) and `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`, then:
```
docker compose up -d db
docker compose run --rm app pnpm payload migrate:create initial   # first time only, if src/migrations/ is empty
docker compose up -d app                                          # entrypoint applies migrations, boots app
docker compose run --rm app pnpm seed
```
Then visit `http://localhost:3000` and `http://localhost:3000/admin` (log in with `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`).
