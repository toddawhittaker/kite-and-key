# Spec: Brand lockup, crest fix & student outcome pills

- **Slug:** brand-lockup-and-outcomes
- **Date:** 2026-07-05
- **Primary audience:** prospective students + employers (Students page); all audiences (brand chrome)

## Problem
Two visible-quality gaps surfaced after the restyle shipped:

1. **The crest is broken.** `public/kite-key-crest.png` is a **truncated PNG** (196608 bytes, no `IEND` chunk, ~53% of scanlines) — the earlier vendoring clipped at DesignSync's 256 KiB download cap. Browsers render the partial image, so the crest appears cut off in both the header and the footer. The brand mark — the most identity-bearing asset on the site — is literally rendering damaged.
2. **The header carries no name.** Only the crest shows; the "Kite & Key IT" wordmark is absent. The design system's `TopNavBar` and `guidelines/brand-wordmark.html` both specify a **crest + wordmark lockup**, not a bare crest.
3. **Student outcomes are invisible.** The Students page is our strongest employer-facing talent signal, but a profile can't state where the work *led* — an internship, a new position. There's no field for it and no pill on the card.

Fixing these makes the brand read as intentional and makes the single most credible employer signal — "this student's work led somewhere" — legible at a glance.

## Proposed outcome

**Crest asset (blocking on a clean source).**
- The corrupt PNG is replaced with a complete, optimized crest. DesignSync's `get_file` cannot deliver it (its 256 KiB base64 cap is exactly the truncation point), so the full-resolution original comes from the user. I downscale/optimize it to a lean, crisp asset (target ≤ ~512 px wide, well under any cap).
- **Interim:** the corrupt file is removed so the `Crest` component's graceful serif-wordmark fallback renders — a clean wordmark beats a broken image until the real asset lands.

**Crest + wordmark lockup.**
- A reusable lockup, faithful to `guidelines/brand-wordmark.html`: **horizontal** (crest + "Kite & Key IT") and **stacked**, each optionally with the "Apply. Solve. Advance." tagline. Wordmark in the display serif (700, tracking-tight); tagline in body (600, uppercase, tracking-widest, gold).
- **Header:** horizontal crest + wordmark, no tagline (matches the design's `TopNavBar`). Still degrades to the wordmark-only fallback when the asset is absent.
- **Footer:** the existing crest + separate tagline becomes the official **stacked + tagline** lockup (same visual result, one component).
- **Larger format:** a large lockup on the **About** page's brand/mission area so the mark appears at identity scale somewhere, per the design system's intent.

**Student outcome pills.**
- A new **`outcome`** field on the `Profiles` collection: a `type` select (Internship, Co-op, New Position, Full-time Offer, Promotion, Research Role, Grad School) + an optional `detail` free-text (e.g. "SWE Intern, Nationwide") for specificity.
- The Students page renders a **prominent pill** (e.g. `INTERNSHIP`, `NEW POSITION`) on each `StudentCard` when an outcome is set, visually distinct from the existing profile-type tag. When `detail` is present it appears as supporting text.
- Seed data gains realistic, clearly-sample outcomes on the existing sample profiles so the treatment is visible in dev.

## Acceptance criteria
- [ ] `public/kite-key-crest.png` (once re-vendored) is a **complete** PNG (`IEND` present, decodes fully) and renders un-clipped in header, footer, and the About lockup at all sizes.
- [ ] With **no** crest asset present, header/footer/About degrade to the serif-wordmark lockup — no broken `<img>`, no layout break.
- [ ] Header shows the **crest + "Kite & Key IT"** horizontal lockup; the wordmark is a real text node (accessible name intact, not baked into the image).
- [ ] Footer renders the **stacked crest + tagline** lockup; About renders a **large** lockup.
- [ ] An editor can set a **Profile → Outcome** (`type` + optional `detail`) in `/admin`; leaving it empty renders no pill.
- [ ] The Students page renders an uppercase **outcome pill** per profile that has one, distinct from the profile-type tag; `detail` shows as supporting text when set.
- [ ] A Drizzle migration adds the `outcome` field; `docker compose ... payload migrate` applies cleanly on a fresh DB.
- [ ] Seed sample profiles carry sample outcomes; `pnpm seed` succeeds.
- [ ] Voice: outcome copy stays specific and non-fabricated (sample data clearly labeled); lockup carries the correct accessible name.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm test:e2e` (incl. the axe contrast smoke — the new gold/ink pill must pass WCAG AA) are green.

## Content model impact
- `Profiles` gains an `outcome` group: `type` (select, optional) + `detail` (text, optional). New Drizzle migration in `src/migrations/`. No change to access control or other collections.

## Out of scope
- No `students/[slug]` detail route (still R3 — cards stay non-linked).
- No change to Projects/Posts/Events, access control, or the admin generator files.
- No new CTA button in the header (the design's "Work With Us" CTA stays deferred — our nav already carries Partner/Get Involved).
- Outcome is descriptive evidence, not a verified-placement claim — no metrics/aggregate "placement rate" language.

## Resolved decisions (GATE 1)
1. **Crest source** — user provides the full-resolution PNG on disk; PM optimizes + vendors it. Non-blocking for code (the `Crest` fallback covers its absence).
2. **Outcome field shape** — categorized `type` select + optional `detail` free-text.
3. **Larger crest placement** — About brand/mission area only for v1 (no home-hero lockup).
