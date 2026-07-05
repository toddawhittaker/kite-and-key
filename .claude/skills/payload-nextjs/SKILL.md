---
name: payload-nextjs
description: Stack conventions for the Kite & Key IT site — Next.js App Router + Payload CMS in one self-hosted monorepo. Load when architecting, implementing, or reviewing anything touching pages, content models, or the admin.
---

# Kite & Key IT — Next.js + Payload conventions

Self-hosted monorepo: Next.js (App Router) public site + Payload CMS admin, no third-party CMS SaaS.

## Non-negotiables
- **Content-managed from day one.** Pages render from Payload collections. Do not hardcode content that editors should own. If you're about to type visitor-facing copy into a `.tsx` file, stop and model it as a collection field instead.
- **The admin is a product surface.** Non-technical student editors and faculty moderators use it. Every collection: sensible field order, clear labels + `admin.description` help text, previews where useful, and required/validated fields so bad content can't ship.
- **Model for credibility.** Collections capture the specifics that make work legible, e.g. a Project has problem addressed, technologies used, student/team contributors, outcomes/artifacts — not just title + blurb. (See `kk-voice`.)

## Real shape (scaffolded)
- **Collections** (`src/collections/`): `Projects` (group Build), `Events` + `PartnerOpportunities` (group Engage), `Posts` + `Profiles` (group Publish), `Media` + `Users` (group System). Global: `about` (`src/globals/About.ts`).
- **Public pages** (`src/app/(frontend)/`): Home (`/`), About (`/about`), Projects list + detail (`/projects`, `/projects/[slug]`), Students (`/students`), Blog (`/blog`), Partner With Us (`/partner`), Get Involved (`/get-involved`) — each serving one primary audience. Shared shell: `src/components/site-header.tsx`, `site-footer.tsx`, `page-container.tsx`, plus the component library in `src/components/*` (Button, Badge, Card, ProjectCard, BlogCard, StudentCard, IconTile, StatTile, StepItem, FilterPill, Pagination, form primitives — see `docs/design/DESIGN.md`).
- **Data access:** `src/lib/payload.ts`'s `getPayloadClient()` (Local API, no HTTP). Public pages always pass `draft: false`. Rich text renders via `@payloadcms/richtext-lexical/react`'s `RichText`.
- **Access control:** centralized in `src/lib/access.ts` (`isAdmin`, `isAuthenticated`, `anyone`) — currently a sensible-defaults seam (auth-required writes, public reads on published content), not fully hardened. `PartnerOpportunities` has no public read (contact info + internal notes are sensitive).
- **Slugs:** `src/fields/slug.ts`'s `slugField()` — auto-slugifies from a source field, unique + indexed.
- **DB:** Postgres, Drizzle migrations in `src/migrations/`, `push: false` — every schema change needs `payload migrate:create <name>`.
- **Dev stack is Docker-first** — see CLAUDE.md's Commands section (`docker compose up`, `docker compose run --rm app pnpm …`). No native host service beyond Docker.

## Engineering conventions
- Prefer Server Components; reach for client components only for genuine interactivity.
- Fetch CMS content through Payload's local/API layer; keep data access out of presentational components.
- Any collection/field change ships with a Payload migration and a safe forward path — flag anything that risks existing content.
- New config via env vars, documented; never commit secrets.
- **Styling:** use the `@theme` tokens in `globals.css` (never raw hex) — see `docs/design/DESIGN.md` for the token table. Reuse an existing `src/components/*` component before writing new markup. Headings use `font-display` (Noto Serif); eyebrow labels use the `eyebrow` utility. Filters/pagination are server-driven via `searchParams` + `<Link>`, not client `useState`.
