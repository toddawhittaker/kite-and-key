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

## Planned shape (until scaffolded, treat as the target)
- **Collections:** Projects, Posts (blog), Profiles (student/team), Events, PartnerOpportunities, and org updates.
- **Public pages:** Home, About, Projects, Students, Blog, Partner With Us, Get Involved — each serving one primary audience.
- **Access control is real:** editors/moderators have write access; enforce roles on who can create/publish/edit each collection, and never expose draft/unpublished content on the public site. Treat partner-intake and profile submissions as sensitive.

## Engineering conventions
- Prefer Server Components; reach for client components only for genuine interactivity.
- Fetch CMS content through Payload's local/API layer; keep data access out of presentational components.
- Any collection/field change ships with a Payload migration and a safe forward path — flag anything that risks existing content.
- New config via env vars, documented; never commit secrets.

When scaffolding lands, update this file with the real project layout, scripts, and commands.
