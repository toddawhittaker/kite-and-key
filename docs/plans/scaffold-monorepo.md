# Plan: Scaffold the Next.js + Payload monorepo

- **Slug:** scaffold-monorepo
- **Spec:** `docs/specs/scaffold-monorepo.md`
- **Date:** 2026-07-04
- **Architect:** (this doc) — implementer executes top-to-bottom from §8.

> Designer is running in parallel and owns: Tailwind token baseline, page-shell/layout visuals, and admin/editor UX polish. This plan specifies **structure** (collection grouping, labels, `admin.description`, route files, data flow) and keeps visual/token detail light, deferring to the designer's output.

---

## 1. Bootstrapping approach

**Single combined app** (Payload's Next integration), not a workspace split. Payload 3 runs *inside* the Next.js App Router as route groups in one `package.json`; a workspace split would fight the framework, duplicate config, and buy nothing at this scale. Revisit only if we later add a separate service (worker, mobile). **Decision: single combined app.**

**Node: pin 22 LTS.** Payload 3 requires Node ≥20.9; Node 20 is in maintenance as of mid-2026, 22 is active LTS. Pin via `.nvmrc` (`22`) and `engines` in `package.json`. **The current machine has Node v18.19.1 and no pnpm — both must be upgraded first** (see §8 step 0). If `create-payload-app`'s generated `engines` demands a higher floor (e.g. 24), honor the tool's output and bump `.nvmrc` to match.

**Rich text: Lexical** (`@payloadcms/richtext-lexical`) — Payload's default. Confirmed.

**Scaffold command.** Use the official generator with the **blank** template + Postgres:

```bash
pnpm dlx create-payload-app@latest kk-scaffold --template blank --db postgres --no-deps
```

The repo root is **not empty** (`CLAUDE.md`, `docs/`, `.gitignore`, `LICENSE`, `README.md`, `.claude/`), and `create-payload-app` refuses a non-empty target. So scaffold into a throwaway subdir (`kk-scaffold/`), then move its contents up into the repo root, and **reconcile** rather than overwrite:
- Keep our existing `CLAUDE.md`, `docs/`, `LICENSE`, `README.md`, `.claude/`.
- Keep our existing `.gitignore` (it already covers `/media`, `.env*`, `.next`, etc.) — merge in anything template-specific that's missing rather than replacing it.
- Take the template's `src/`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `package.json`, `docker-compose.yml`, `.env.example`, `.npmrc`.
- Delete the empty `kk-scaffold/` shell afterward.

The generator produces: `src/payload.config.ts`, `src/collections/Users.ts`, `src/collections/Media.ts`, the `src/app/(payload)/*` admin+API route group, a starter `src/app/(frontend)/` layout+page, `docker-compose.yml` (local Postgres), and base config files. We then extend it (§3–§6).

> Do **not** hand-pin `payload`/`next`/`react` versions from this doc — take whatever the generator resolves (`--no-deps` then `pnpm install` locks them), and commit the lockfile. See §9 on pinning discipline.

---

## 2. Directory / file layout (after scaffold + our additions)

```
/ (repo root)
├─ .nvmrc                     # "22"  (NEW)
├─ .npmrc                     # from template (pnpm settings)
├─ .env                       # local, gitignored (NOT committed)
├─ .env.example               # edited — see §6
├─ .gitignore                 # ours, kept; merge template gaps
├─ docker-compose.yml         # from template — local Postgres
├─ next.config.ts             # from template — wraps withPayload()
├─ tsconfig.json              # from template — has @payload-config + @/ aliases
├─ eslint.config.mjs          # from template
├─ postcss.config.mjs         # NEW — Tailwind (designer refines)
├─ package.json               # edited — scripts, engines, packageManager
├─ pnpm-lock.yaml             # committed
├─ CLAUDE.md                  # edited — Commands + Architecture (§7)
└─ src/
   ├─ payload.config.ts       # edited — adapter push:false, lexical, collections, admin meta
   ├─ payload-types.ts        # generated, committed
   ├─ migrations/             # NEW — committed Drizzle migrations (initial)
   │  └─ <timestamp>_initial.ts (+ .json snapshot + index.ts)
   ├─ collections/
   │  ├─ Users.ts             # edited — add role field
   │  ├─ Media.ts             # from template — add alt required (usually present)
   │  ├─ Projects.ts          # NEW  (Build)
   │  ├─ Posts.ts             # NEW  (Publish)
   │  ├─ Profiles.ts          # NEW  (Publish)
   │  ├─ Events.ts            # NEW  (Engage)
   │  └─ PartnerOpportunities.ts  # NEW  (Engage)
   ├─ fields/
   │  └─ slug.ts              # NEW — reusable slug field + slugify hook
   ├─ lib/
   │  └─ payload.ts           # NEW — getPayloadClient() helper for server components
   ├─ seed/
   │  └─ index.ts             # NEW — idempotent, dev-only seed (§5)
   └─ app/
      ├─ (payload)/           # from template — admin UI + REST/GraphQL; DO NOT hand-edit
      │  ├─ admin/[[...segments]]/{page.tsx,not-found.tsx}
      │  ├─ api/[...slug]/route.ts
      │  ├─ api/graphql/route.ts
      │  ├─ api/graphql-playground/route.ts
      │  ├─ layout.tsx
      │  └─ custom.scss
      └─ (frontend)/          # public site — ours
         ├─ layout.tsx        # edited — imports globals.css (Tailwind)
         ├─ globals.css       # NEW — @import "tailwindcss"; (designer owns tokens)
         ├─ page.tsx          # Home
         ├─ about/page.tsx
         ├─ projects/page.tsx           # Projects LIST — queries Payload (proof page)
         ├─ projects/[slug]/page.tsx    # Project detail (proves single-doc fetch)
         ├─ students/page.tsx           # Profiles list — queries Payload
         ├─ blog/page.tsx               # Blog list — queries Payload
         ├─ partner/page.tsx            # "Partner With Us"
         └─ get-involved/page.tsx       # "Get Involved"
```

The `(payload)` route group is generator-owned system code — treat as read-only. All our public work lives under `(frontend)`.

---

## 3. Payload collections

**Admin grouping** (`admin.group`) maps collections to the pillars; System holds infrastructure collections:

| Collection | `admin.group` | `admin.useAsTitle` |
|---|---|---|
| Projects | **Build** | `title` |
| Events | **Engage** | `title` |
| PartnerOpportunities | **Engage** | `title` |
| Posts | **Publish** | `title` |
| Profiles | **Publish** | `name` |
| Media | System | `filename` |
| Users | System | `email` |

Every collection gets a plural human `labels`, ordered fields, and `admin.description` help text on the collection and on non-obvious fields (editor experience is a first-class constraint). Give Projects, Posts, Events a `admin.defaultColumns` list for a readable list view.

**Slugs.** Add a reusable `src/fields/slug.ts` exporting a `slugField(sourceField = 'title')`: a `text` field, `unique: true`, `index: true`, with a `beforeValidate`/`beforeChange` hook that slugifies the source when empty, and `admin.position: 'sidebar'`. Used by Projects, Posts, Profiles, Events.

**Drafts.** Enable `versions: { drafts: true }` on **Projects, Posts, Events** so editors can stage unpublished work. Public queries MUST pass `draft: false` (Local API returns only published by default, but be explicit) and never surface `_status: 'draft'`. This is the "never expose unpublished content" non-negotiable — call it out in the data-access helper (§4).

### Users (`src/collections/Users.ts`) — group: System
Built-in Payload auth (`auth: true`, email + password). Add:
- `name` — text, required.
- `role` — select, options `admin | editor`, required, `defaultValue: 'editor'`, `saveToJWT: true`. `admin.description`: "Admins manage users and all content; editors manage content."

Access (sensible defaults, hardening deferred — see seam below):
- `read`: authenticated only (admin data).
- `create/update/delete`: restrict to `role === 'admin'` (first pass) — keep the check in one place so it's easy to tighten.

### Media (`src/collections/Media.ts`) — group: System
Upload collection (template default). Ensure:
- `alt` — text, **required** (accessibility).
- `caption` — text, optional.
- `access.read: () => true` (public — images are referenced by public pages); write requires auth.
- Local disk storage (`/media`, already gitignored). Object storage is a later concern (§9).

### Projects (`src/collections/Projects.ts`) — group: **Build**
The flagship credibility model. Fields:
- `title` — text, required.
- `slug` — from `slugField()`.
- `summary` — textarea, required. One-line what-it-is (used on list cards).
- `problem` — richText (Lexical), required. `admin.description`: "The real problem or need this project addressed."
- `technologies` — array of `{ name: text }`, `labels: { singular: 'Technology', plural: 'Technologies' }`. Free-form so editors aren't blocked by a fixed taxonomy. `admin.description`: "Languages, frameworks, cloud services, tools actually used."
- `contributors` — relationship → `profiles`, `hasMany: true`, required. `admin.description`: "Student/team members who did the work."
- `outcomes` — richText (Lexical). `admin.description`: "What was delivered and what contributors learned."
- `artifacts` — array of `{ label: text (required), url: text, file: relationship → media (optional) }`. `admin.description`: "Evidence: repo links, writeups, demos, deliverables." Captures portfolio-ready proof.
- `pillars` — select `hasMany`, options `build | engage | publish`, `defaultValue: ['build']`. The spec's "pillar tags."
- `coverImage` — upload/relationship → media, optional.
- `publishedDate` — date, sidebar.
- Drafts enabled.

### Posts (blog) (`src/collections/Posts.ts`) — group: **Publish**
- `title` — text, required.
- `slug` — `slugField()`.
- `author` — relationship → `profiles`, required.
- `excerpt` — textarea, optional (list/card + meta).
- `body` — richText (Lexical), required.
- `coverImage` — upload → media, optional.
- `tags` — array of `{ tag: text }`, optional (light; no taxonomy collection yet).
- `publishedDate` — date, sidebar.
- Drafts enabled (spec's "publish state").

### Profiles (student/team) (`src/collections/Profiles.ts`) — group: **Publish**
- `name` — text, required, `useAsTitle`.
- `slug` — `slugField('name')`.
- `profileType` — select `student | team | faculty | alum`, required, default `student`.
- `program` — text (e.g. "B.S. Computing Science"), optional.
- `gradYear` — number, optional.
- `bio` — richText (Lexical), optional.
- `avatar` — upload → media, optional.
- `links` — array of `{ label: text (required), url: text (required) }` (GitHub, LinkedIn, portfolio).
- `contributions` — richText, optional. Narrative of involvement.
- (Optional, if cheap) `projects` — a Payload **`join` field** on `projects.contributors` to surface a read-only list of projects this person contributed to. If the join field adds friction, skip it — the relation already exists on Projects.

### Events (`src/collections/Events.ts`) — group: **Engage**
- `title` — text, required.
- `slug` — `slugField()`.
- `eventType` — select `workshop | code-review | employer-session | talk | other`, required.
- `description` — richText (Lexical).
- `startDate` — date+time, required.
- `endDate` — date+time, optional.
- `location` — text, optional; `isOnline` — checkbox.
- `facilitators` — relationship → `profiles`, `hasMany`, optional.
- `publishedDate` — date; drafts enabled.

### PartnerOpportunities (`src/collections/PartnerOpportunities.ts`) — group: **Engage**
Encodes the **bounded, faculty-overseen** framing (load-bearing per CLAUDE.md / kk-voice). Fields:
- `title` — text, required. `admin.description`: "Short name for the proposed project."
- `organization` — text, required.
- `contactName` — text, required (**sensitive** — see access seam).
- `contactEmail` — email, required (**sensitive**).
- `problem` — richText, required. "The problem or need."
- `scope` — textarea, required. `admin.description`: "Bounded scope — what's realistically deliverable by students with faculty oversight. Not open-ended consulting."
- `estimatedEffort` — select `small | medium | term-length`, required. Reinforces bounded sizing.
- `desiredTechnologies` — array of `{ name: text }`, optional.
- `facultyOverseer` — relationship → `users`, optional (assigned during review). `admin.description`: "Faculty moderator responsible for oversight."
- `status` — select `submitted | under-review | accepted | declined | active | complete`, default `submitted`.
- `termAvailability` — text, optional.
- `internalNotes` — textarea, `admin.description`: "Internal only — not shown publicly." (Public rendering of this collection is out of scope for the scaffold; `partner/page.tsx` is a static shell + future intake form.)

**Access-control seam (documented, not hardened — spec defers full hardening).** Establish one consistent baseline and flag it for the security-auditor:
- Content collections meant to be public (Projects, Posts, Profiles, Events, Media): `access.read: () => true`, but public queries filter to published (drafts stay private — Local API default + explicit `draft: false`).
- Write (`create/update/delete`) on all collections: authenticated user required.
- Users + PartnerOpportunities: read restricted to authenticated users (contact info + internal notes are sensitive). PartnerOpportunities has **no public read** in the scaffold.
- **Seam to harden later:** role-based split (editor vs admin vs faculty-moderator) on who can *publish* vs *draft*, per-collection field-level access on sensitive PartnerOpportunities fields, and a future public-facing intake mutation that writes PartnerOpportunities without exposing read. Centralize the role checks (e.g. `src/lib/access.ts` helpers `isAdmin`, `isAuthenticated`) so the follow-up is a small diff.

---

## 4. Public routes & data access

All pages are **Server Components** under `src/app/(frontend)/`. Data comes from Payload's **Local API** (in-process, no HTTP), via a small helper:

`src/lib/payload.ts`:
```ts
import config from '@payload-config'
import { getPayload } from 'payload'
export const getPayloadClient = () => getPayload({ config })
```
Pages call `const payload = await getPayloadClient()` then `payload.find({ collection, where, depth, limit, draft: false, sort })`. Keep all `payload.find/findByID` calls in the page (or colocated loaders) — presentational components receive plain data, per stack conventions. Add `export const dynamic = 'force-dynamic'` on data pages for the scaffold (simplest correct behavior; revalidation/ISR tuning is a later perf pass).

Rich text renders via `@payloadcms/richtext-lexical/react`'s `RichText` component (Lexical → React). Note this for `problem`/`body`/`outcomes` fields when detail pages render them.

| Route | File | Audience | Queries Payload? |
|---|---|---|---|
| Home | `page.tsx` | prospective student | no (static shell + links) |
| About | `about/page.tsx` | all | no |
| **Projects (list)** | `projects/page.tsx` | employer / prospective | **YES** — `find('projects', draft:false, depth:1)`; cards show title, summary, technologies, contributor count. **Primary proof page.** |
| Project detail | `projects/[slug]/page.tsx` | employer | YES — `find` by slug; renders problem/tech/contributors/outcomes/artifacts. Proves single-doc fetch + Lexical render. |
| Students | `students/page.tsx` | prospective / current | YES — `find('profiles')`. |
| Blog (list) | `blog/page.tsx` | all | YES — `find('posts', draft:false)`. |
| Partner With Us | `partner/page.tsx` | partner | no (static shell; intake form is later) |
| Get Involved | `get-involved/page.tsx` | current student | no (static shell) |

Spec requires **at least one** list page proving the pipeline; we prove it on Projects (list + detail) and also Blog/Students since they're cheap and reinforce the pattern. All copy is clearly-labeled placeholder (designer + kk-voice own final wording). A shared `(frontend)/layout.tsx` provides nav across the seven routes.

---

## 5. Seed strategy

A standalone, **idempotent, dev-only** script: `src/seed/index.ts`, run via a `pnpm seed` script mapped to `payload run src/seed/index.ts` (Payload's `run` bootstraps config + Local API).

Behavior:
- **Guard:** refuse to run if `NODE_ENV === 'production'` unless `ALLOW_SEED=true` — abort with a clear message.
- **First admin:** `find` Users where `email === process.env.SEED_ADMIN_EMAIL`; create only if absent, with `role: 'admin'` and a password from `SEED_ADMIN_PASSWORD` (env, not hardcoded; documented in `.env.example`). This satisfies the "app isn't empty / can log in on first run" criterion.
- **Sample content:** create 2–3 Profiles, 2 Projects (with contributors relations, technologies, artifacts), 2 Posts (with author), 1 Event, 1 PartnerOpportunity — each guarded by a `find` on its unique slug/title so re-running is a no-op. All content marked as obvious placeholder ("Sample Project — …").
- Idempotency comes from find-before-create on unique fields; no upsert churn.

Document the flow in CLAUDE.md: `pnpm payload migrate && pnpm seed`.

---

## 6. Env & config

`.env.example` (names only, no values that are secret):
```
# Postgres — Payload Postgres adapter
DATABASE_URI=postgres://postgres:postgres@localhost:5432/kite_and_key

# Payload — REQUIRED, random 32+ char string; generate with `openssl rand -hex 32`
PAYLOAD_SECRET=

# Public base URL (Payload serverURL + Next)
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Seed script (dev only) — first admin credentials
SEED_ADMIN_EMAIL=admin@example.edu
SEED_ADMIN_PASSWORD=
# ALLOW_SEED=  # set true only to force seed outside dev
```
`.env` stays gitignored (already covered by `.gitignore`); only `.env.example` is committed.

Config touches:
- `src/payload.config.ts`: `postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI }, push: false })` — **`push: false` forces the migration-based workflow** (matches the Drizzle-migrations decision and makes `pnpm payload migrate` on a fresh DB real, per acceptance criteria). `editor: lexicalEditor()`. Register all collections. Set `admin.meta` (title/description) and `admin.user: 'users'`. `secret: process.env.PAYLOAD_SECRET`. `db.migrationDir` defaults to `src/migrations`.
- **Version pinning:** `engines.node: ">=22 <23"` (or match generator), `packageManager: "pnpm@<locked>"`, `.nvmrc: 22`. Commit `pnpm-lock.yaml`.
- Tailwind: `postcss.config.mjs` + `globals.css` with `@import "tailwindcss";` (Tailwind v4 style — no `tailwind.config` needed unless designer wants one). Designer owns tokens/theme; implementer just wires the import into `(frontend)/layout.tsx`.

---

## 7. Commands (to replace CLAUDE.md's placeholder "Commands" section)

```
pnpm install               # install deps (Node 22 via .nvmrc; pnpm via corepack)
docker compose up -d        # local Postgres (docker-compose.yml)
pnpm payload migrate:create <name>   # generate a Drizzle migration from schema changes
pnpm payload migrate        # apply migrations (run on fresh DB before first boot)
pnpm payload migrate:status # show migration state
pnpm seed                   # dev-only: create first admin + sample content (idempotent)
pnpm dev                    # Next.js + Payload — site at :3000, admin at :3000/admin
pnpm build                  # production build
pnpm start                  # run the production build
pnpm lint                   # eslint
pnpm generate:types         # regenerate src/payload-types.ts after collection changes
```
Also update CLAUDE.md **Architecture** section (real layout from §2) and **remove the greenfield "Status" note**. Update the `payload-nextjs` skill's "when scaffolding lands" line with the real layout/scripts.

---

## 8. Step-by-step implementation order

0. **Prereqs (machine):** install/activate Node 22 (`nvm install 22 && nvm use 22`); enable pnpm via `corepack enable && corepack prepare pnpm@latest --activate`. Verify `node -v` ≥ 20.9 and `pnpm -v`. (Current env is Node 18 + no pnpm — this step is mandatory, not optional.)
1. **Scaffold** into `kk-scaffold/` with `create-payload-app` (blank + postgres, §1), then move contents to root, reconcile `.gitignore`, keep our docs/README/LICENSE/CLAUDE.md, delete the empty subdir.
2. **Pin versions:** add `.nvmrc`, `engines`, `packageManager`; run `pnpm install`; commit `pnpm-lock.yaml`.
3. **Bring up Postgres** (`docker compose up -d`) and create `.env` from `.env.example`; set `PAYLOAD_SECRET`, `DATABASE_URI`.
4. **Config:** edit `src/payload.config.ts` — Postgres `push:false`, Lexical, admin meta, collection registration placeholders.
5. **Shared field/util:** add `src/fields/slug.ts` and `src/lib/access.ts` (`isAdmin`, `isAuthenticated`).
6. **Collections:** edit `Users` (role), confirm `Media` (alt required), author `Projects`, `Posts`, `Profiles`, `Events`, `PartnerOpportunities` per §3 (groups, labels, descriptions, drafts, access).
7. **Types:** `pnpm generate:types`; commit `src/payload-types.ts`.
8. **Initial migration:** `pnpm payload migrate:create initial`; verify `pnpm payload migrate` runs clean against a fresh DB; commit `src/migrations/*`.
9. **Tailwind:** `postcss.config.mjs`, `globals.css`, wire into `(frontend)/layout.tsx` (designer refines tokens).
10. **Data helper + pages:** add `src/lib/payload.ts`; build the seven `(frontend)` routes (§4), with Projects list+detail, Students, Blog querying Payload.
11. **Seed:** author `src/seed/index.ts` + `pnpm seed` script (§5); run it.
12. **Docs:** update `.env.example`, CLAUDE.md (Commands + Architecture, drop Status note), `payload-nextjs` skill layout note.
13. **Verify acceptance:** `pnpm install` clean → `pnpm payload migrate` on fresh DB → `pnpm seed` → `pnpm dev` (log into `/admin`, see grouped collections) → `/projects` renders seeded content → `pnpm generate:types` → `pnpm lint` → `pnpm build` all green.

**CI/CD seam (not built here — later `/pm` pass, flagged for devops-reviewer):** a `.github/workflows/ci.yml` should run `pnpm install --frozen-lockfile`, `pnpm lint`, `generate:types` drift check, `pnpm build`, and `pnpm payload migrate` against a Postgres **service container** (mirrors §8.8). The deploy path must run `payload migrate` **before** the app boots (never rely on `push` in prod — we set `push:false` precisely so migrations are the contract). Env/secrets (`DATABASE_URI`, `PAYLOAD_SECRET`) come from CI secrets. Keep this out of the current change but don't design against it.

---

## 9. Risks & trade-offs

- **Node/pnpm upgrade is a hard gate.** The machine is Node 18 with no pnpm; nothing installs or scaffolds until step 0 is done. Call it out first so the implementer doesn't burn time.
- **Non-empty scaffold target.** `create-payload-app` won't scaffold into the existing repo root — the temp-dir-then-merge dance (§1) is required, and `.gitignore` must be *merged* not clobbered (ours already has good rules).
- **`push:false` vs dev ergonomics.** We chose migration-based dev (no schema auto-push) to make the deploy/CI path honest and satisfy the fresh-DB migrate criterion. Cost: every collection/field change needs `migrate:create` before it takes effect locally. This is the right trade for a real deploy pipeline; the alternative (`push:true` in dev) causes drift between dev schema and committed migrations and would let us ship an app whose migrations were never actually run.
- **Draft leakage.** Drafts are enabled on Projects/Posts/Events. Public queries must stay `draft:false` and never render `_status:'draft'`. Centralize in the data helper and note for the security-auditor. This is the most likely correctness bug.
- **Version pinning / floating deps.** Payload 3 + Next release frequently and Payload's peer-dep on a specific Next range is strict. Take the generator's resolved versions, commit the lockfile, and use `--frozen-lockfile` in CI. Don't bump Next independently of Payload. If the generated `engines` requires Node >22, honor it and update `.nvmrc`.
- **Local media storage.** Uploads go to `/media` on local disk (gitignored) — fine for dev, but ephemeral on most hosts. Object storage (`@payloadcms/storage-*`) is a later concern; flag so no one assumes durability.
- **Local API + Next caching.** `force-dynamic` on data pages avoids stale/cached-fetch surprises for the scaffold; revisit ISR/`revalidate` when perf matters. `getPayload` is cheap to call per request.
- **`join` field (Profiles→projects).** Newer Payload feature; if it misbehaves or complicates seeding, drop it — the Projects→Profiles relation is the source of truth and detail pages already traverse it.
- **Access defaults are deliberately loose** (auth-required writes, public reads on published content). Full role-based hardening and PartnerOpportunities field-level protection are a follow-up — centralized in `src/lib/access.ts` so the security pass is a small diff. Security-auditor should expect and flag this seam.

---

## Out of scope (explicit)

- Real content/copy, brand/visual design system beyond a minimal token baseline (designer pass), page-shell polish.
- Auth beyond Payload local auth + `admin`/`editor` roles (no SSO/IdP).
- Full access-control hardening, field-level protection, public partner-intake write path.
- Public rendering of PartnerOpportunities; search, filtering, pagination polish, SEO depth.
- CI/CD workflows and production deploy infra (seam noted in §8; separate `/pm` pass).
- Object storage for media; ISR/caching tuning; tests beyond making `pnpm build`/`lint`/typegen pass.

---

## Open questions for PM (surface, don't guess)

1. **First-admin credentials in dev:** plan uses env-driven `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` (no hardcoded default password). Acceptable, or do you want an interactive `payload create-first-user` documented instead? (I recommend the env-driven seed for idempotent, scriptable setup.)
2. **Profiles pillar fit:** Profiles are people, not a pillar activity — I grouped them under **Publish** (students-as-visible-evidence). If you'd rather they live in their own "People" admin group outside the three pillars, say so; it's a one-line change.

---

## PM reconciliation decisions (AUTHORITATIVE — resolves architect vs. designer divergences)

The implementer follows **this doc** for structure/field-models/routing/seed/commands, and the companion `scaffold-monorepo-ux.md` for admin labels, `admin.description` coaching copy, `useAsTitle`, `defaultColumns`, Tailwind tokens, base components, and page-shell layouts. Where the two diverge, these PM decisions win:

1. **PartnerOpportunities → `admin.group: 'Engage'`** (architect's placement wins over designer's 'Build'). Rationale: partner intake is external employer/community *relationship* work, which is exactly Engage per CLAUDE.md ("employer interaction, collaboration with regional tech professionals"). Update the designer doc's 'Build' reference mentally to Engage.
2. **Field names = architect §3 (schema source of truth).** Designer's differing field names (`organizationName`, `projectDescription`, `scopeBoundaries`, `facultyReviewer`) map onto architect's (`organization`, `problem`+`scope`, `facultyOverseer`). Use architect's names in code; apply designer's **labels + `admin.description` copy** to those fields.
3. **PartnerOpportunities `useAsTitle: 'organization'`** (designer's scannability point wins over architect's `title`). Keep the `title` field too, but list views/relationship pickers key off `organization`.
4. **First admin = env-driven seed** (`SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`), architect's recommendation. No hardcoded password.
5. **Profiles → `admin.group: 'Publish'`** (both agreed). No separate People group.
6. **Add an `about` Payload global** (designer's recommendation, accepted): a singleton `about` global with rich-text body field(s), so faculty edit About without a deploy. `about/page.tsx` renders from the global — keeps "content is the source of truth" honest rather than hardcoding prose. Small addition: one global + its migration + one `payload.findGlobal` call.
7. **Route group = `(frontend)`** (architect/template default), NOT designer's `(site)`. Components live in **`src/components/`** (`site-header.tsx`, `site-footer.tsx`, `page-container.tsx`, `entity-card.tsx`).
8. **URL slugs:** `/partner` (nav label "Partner With Us") and `/get-involved`. Short URL, on-brand label. Keep `/projects`, `/students`, `/blog`, `/about`, `/`.
9. **Users group label:** `admin.group: 'System'` (architect) — designer's 'Admin' label is equivalent; use **'System'** for Users + Media-infra consistency. Media stays System per architect (designer put it in Publish — minor; **System** wins so content editors aren't scrolling past the asset library as if it were a content type; it's still reachable).

Everything else (drafts on Projects/Posts/Events, access-control seam centralized in `src/lib/access.ts`, `push:false` migration workflow, Local API data pattern, Node 22 prereq) stands as written in both docs.

---

## §10. REVISION — Docker-first containerization (supersedes §8 step 0, step 3, step 8, step 13, and §7 commands)

**Change:** the entire dev stack runs in Docker — **both Postgres and the Next/Payload app** — via one `docker compose up`. No native service on the host beyond Docker. This supersedes the "run pnpm on host" assumptions in §7/§8. Collections, routes, seed, field models (§3–§6) are unchanged; only *how the app process and DB run, migrate, and get invoked* changes.

### 10.1 Machine state (supersedes §8 step 0 + §9 "Node/pnpm is a hard gate")
Already done this session — the implementer does NOT repeat these:
- Node 22.23 + pnpm 11 + corepack installed on host; Docker 29.6 + compose v5.3 installed, daemon running; `todd` in the `docker` group; the stray `kk-scaffold-src/` upstream clone deleted.
- Host `pnpm` usage is now **optional** (IDE type info only). All authoritative commands run **inside the app container**.

### 10.2 Files to add (beyond §2 layout)
```
/ (repo root)
├─ Dockerfile              # NEW — multi-stage: base → deps → dev target + build → prod runner
├─ .dockerignore          # NEW — node_modules, .next, .git, .env*, /media, docs (build-context slimming)
├─ docker-compose.yml      # EXTEND template's — add `app` service alongside `db`
├─ docker-entrypoint.sh    # NEW — runs `payload migrate` (deploy=honest) then execs CMD
└─ .env / .env.example     # DATABASE_URI host becomes the compose service name `db` (see 10.5)
```

### 10.3 Dockerfile (multi-stage)
- **`base`:** `node:22-bookworm-slim` (glibc — avoids Alpine native-module surprises with sharp/Payload), `corepack enable && corepack prepare pnpm@<locked> --activate`, workdir `/app`.
- **`deps`:** copy `package.json` + `pnpm-lock.yaml`, `pnpm install --frozen-lockfile`.
- **`dev` target:** from `deps`; `ENV NODE_ENV=development`; entrypoint = `docker-entrypoint.sh`; CMD `pnpm dev`. Source is bind-mounted at runtime (not COPYed) so edits hot-reload.
- **`build` stage:** from `deps`; `COPY . .`; `pnpm build` (Next + Payload admin build).
- **`prod` (runner) target:** from `base`; copy built app + prod deps; `ENV NODE_ENV=production`; entrypoint = `docker-entrypoint.sh`; CMD `pnpm start`. **Do NOT use Next `output:'standalone'` in this pass** — Payload 3's admin/importMap + standalone copy has known gotchas; a plain `pnpm start` prod image is reliable for the scaffold. Note standalone as a later image-slimming optimization (§10.7).

### 10.4 docker-compose.yml (dev stack)
- **`db`:** `postgres:16-bookworm`, `environment` POSTGRES_USER/PASSWORD/DB = `postgres`/`postgres`/`kite_and_key`, named volume `pgdata:/var/lib/postgresql/data`, **healthcheck** `pg_isready -U postgres`, optionally publish `5432:5432` (host psql access; can drop for isolation).
- **`app`:** `build: { context: ., target: dev }`; `depends_on: { db: { condition: service_healthy } }`; `ports: ["3000:3000"]`; `env_file: .env`; `environment: DATABASE_URI=postgres://postgres:postgres@db:5432/kite_and_key` (the compose **service hostname `db`**, overriding any localhost value in `.env`); `volumes: [ ".:/app", "/app/node_modules", "/app/.next" ]` — the anonymous volumes on `node_modules`/`.next` prevent the host bind-mount from shadowing the container's install/build. CMD inherits `pnpm dev`.
- **`volumes: { pgdata: {} }`.**
- **Prod smoke-test:** a second app service (or a `--profile prod` / compose override) building `target: prod` to verify the prod image boots — kept behind a profile so `docker compose up` stays dev by default.
- **Hot-reload fallback:** if file watching misbehaves in-container, set `WATCHPACK_POLLING=true` (and `CHOKIDAR_USEPOLLING=true`) on the `app` service. On this Linux host native inotify through bind mounts should work — add polling only if verification shows stale reloads.

### 10.5 Env wiring (supersedes §6's `localhost` DATABASE_URI)
`.env.example` documents **both**: a commented host value and the compose value.
```
# When running the app INSIDE docker compose (the default), the DB host is the
# compose service name `db` — compose sets this in the app service's environment:
#   DATABASE_URI=postgres://postgres:postgres@db:5432/kite_and_key
# If you ever run the app on the HOST instead, use localhost:
DATABASE_URI=postgres://postgres:postgres@localhost:5432/kite_and_key

PAYLOAD_SECRET=                         # required; openssl rand -hex 32
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
SEED_ADMIN_EMAIL=admin@example.edu
SEED_ADMIN_PASSWORD=
# ALLOW_SEED=                           # true only to force seed outside dev
```
The `app` service's `environment.DATABASE_URI` (pointing at `db`) wins for the container. Postgres adapter keeps `push:false`.

### 10.6 Migrate + seed IN-CONTAINER (supersedes §8 steps 3, 8, 11, 13)
`docker-entrypoint.sh` runs `pnpm payload migrate` before `exec "$@"`, so a fresh `pgdata` volume auto-migrates on `docker compose up` (satisfies migrate-before-boot). Seed stays explicit/dev-only:
```
docker compose up -d db                                   # Postgres only, wait healthy
docker compose run --rm app pnpm payload migrate:create initial   # generate initial migration → src/migrations/*
docker compose up -d app                                  # entrypoint applies migrations, boots app
docker compose run --rm app pnpm seed                     # first admin + sample content (idempotent)
```
Fresh-DB verification = drop the `pgdata` volume (`docker compose down -v`) then `docker compose up` and confirm migrations apply from zero.

### 10.7 Commands (REPLACES §7 for CLAUDE.md's "Commands" section)
```
docker compose up                         # full stack: Postgres + app. Site :3000, admin :3000/admin
docker compose up -d db                   # Postgres only
docker compose run --rm app pnpm payload migrate:create <name>   # new Drizzle migration
docker compose run --rm app pnpm payload migrate                 # apply (entrypoint also does this on boot)
docker compose run --rm app pnpm seed                            # dev-only: first admin + sample content
docker compose run --rm app pnpm generate:types                 # regen src/payload-types.ts
docker compose run --rm app pnpm lint
docker compose build                      # rebuild images after dependency/Dockerfile changes
docker compose --profile prod up          # smoke-test the production image
docker compose down -v                    # stop + wipe DB volume (fresh-DB test)
# Optional on host (IDE type info only; not required): pnpm install
```
CLAUDE.md "Architecture" section also notes the container topology (app + db services, volumes, entrypoint-migrate).

### 10.8 Revised step order (replaces §8.0/3/8/11/13; 1,2,4–7,9,10,12 unchanged in spirit — pnpm runs via `docker compose run --rm app …` instead of on host)
0. Verify Docker works (`docker ps`), Node/pnpm present — all already done; do not reinstall.
1–2. Scaffold + version pins as §8.1–2, but run `pnpm install` to generate the lockfile (host is fine for lockfile gen since deps are already installable; the image installs from the committed lock).
3′. Author `Dockerfile`, `.dockerignore`, `docker-entrypoint.sh`; extend `docker-compose.yml` with the `app` service (§10.3–10.4). Create `.env` from `.env.example`; set `PAYLOAD_SECRET`.
4–7, 9, 10, 12. As original §8 (config, collections, fields/access, types, Tailwind, pages, docs) — invoke any pnpm command via `docker compose run --rm app pnpm …`.
8′. Initial migration + generate types **in-container** (§10.6); commit `src/migrations/*` and `src/payload-types.ts`.
11′. Seed in-container (§10.6).
13′. **Verify acceptance (Docker):** `docker compose down -v` → `docker compose up` boots db+app, migrations apply from a fresh volume, `/admin` loads + admin login, `/projects` renders seeded content, host file edit hot-reloads the container, `docker compose --profile prod up` boots the prod image, and `docker compose run --rm app pnpm lint` + `... pnpm build` pass.

### 10.9 Added risks (extend §9)
- **node_modules shadowing:** the `.:/app` bind mount hides the image's `node_modules` unless the anonymous volume `/app/node_modules` is declared (§10.4). Miss this and the app can't find deps at runtime. Highest-likelihood Docker bug here.
- **DB host mismatch:** app-in-container must use `db`, not `localhost` — a `localhost` DATABASE_URI inside the container points at the container itself and fails. Verified via the compose `environment` override (§10.5).
- **Entrypoint migrate on empty schema:** first `docker compose up` runs `migrate` before any migration exists if step 8′ was skipped — ensure the initial migration is generated/committed first, or the entrypoint no-ops cleanly on "no migrations."
- **Prod image + Payload build:** `pnpm build` inside Docker must have `DATABASE_URI`/`PAYLOAD_SECRET` available if the build touches config init; pass build args or keep build DB-agnostic. Devops-reviewer to confirm the prod build doesn't require a live DB.
- **Native deps (sharp):** using `bookworm-slim` (glibc) over Alpine avoids musl native-module rebuilds for Payload's image handling.

> **This §10 is PM-authored (not the architect's) for a standard containerization pattern — the devops-reviewer must scrutinize the Dockerfile, compose topology, volume/entrypoint strategy, and prod build closely in the review fan-out.**
