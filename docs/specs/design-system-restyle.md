# Spec: Design-system restyle

- **Slug:** design-system-restyle
- **Date:** 2026-07-05
- **Primary audience:** all public audiences (this is the visual/brand layer beneath every page); the editor experience (faculty/moderator) is unaffected.

## Problem

The public site currently renders with placeholder styling (a minimal Tailwind
setup: `ink-*`/`accent-*` scales, a plain text wordmark, no display type, no
component system). It does not yet look like a credible applied-learning
platform. The user has authored a complete **"Kite & Key IT Design System"**
on claude.ai/design (project `95b706ec-…b920`) — M3-derived tokens distilled to
a disciplined editorial palette, Noto Serif/Inter/Material Symbols type, a full
spacing/radius/shadow/motion scale, a component library, per-page screen
compositions, a crest logo, and the tagline "Apply. Solve. Advance."

We need to adopt that system as the site's real visual identity, and make it the
**documented, authoritative** design reference going forward so future work stays
on-brand. Credibility (the mission) depends on the site *looking* as serious as
the work it showcases.

## Proposed outcome

Every public page (`src/app/(frontend)/`) renders in the design system's visual
language: warm off-white page (`#fcf9f8`), near-black navy ink (`#041627`), a
single gold accent (`#fbbc00`) reserved for CTAs/active states, Noto Serif
display headlines with Inter body, Material Symbols iconography, generous
editorial spacing, a fixed glass top-nav, a dark four-column footer, and
hover-lift cards. The crest logo and tagline appear in the chrome. The design
tokens live in the repo's Tailwind v4 layer as the single source of truth, and
the documentation (CLAUDE.md, skills, a new design reference) points at this
system so every subsequent change inherits it.

**Decisions locked (from clarification):**
- **Depth:** full page-by-page restyle matching the ui_kit screens where they
  exist (About, Projects, Students, Blog, Partner); Home, Get Involved, and
  project-detail extrapolate from the same design language (no reference screen
  exists for them — noted in the design system's own caveats).
- **Fonts:** self-hosted via `next/font` (Inter + Noto Serif) to honor the
  repo's self-hosted, no-third-party-SaaS architecture; Material Symbols
  self-hosted if practical, CDN-linked as an acceptable fallback (the architect
  decides and records the tradeoff).
- **Brand identity:** adopt the crest logo (`assets/logo/kite-key-crest.png`)
  and the "Apply. Solve. Advance." tagline per the brand-wordmark lockups.

## Acceptance criteria

### Foundation (tokens, type)
- [ ] The design system's color, spacing, radius, shadow, and motion tokens are
      expressed in the app's Tailwind v4 theme (`globals.css` `@theme` and/or
      `tailwind.config.ts`) as named tokens — navy ink, off-white surface, gold
      accent, surface tiers, status pills, the radius scale (4/8/12/full), and
      the single soft editorial shadow — replacing the placeholder
      `ink-*`/`accent-*` scales.
- [ ] Noto Serif and Inter are loaded via `next/font` (self-hosted at build
      time; no runtime Google Fonts call for body/display type). Material
      Symbols is available for icon glyphs. No layout-shift flash of unstyled
      text.
- [ ] Headlines render in Noto Serif with tightened tracking; body/labels in
      Inter; eyebrow labels are small, bold, UPPERCASE, widely tracked; serif
      italic is available as the inline emphasis device.

### Shared chrome & components
- [ ] `site-header` becomes the fixed glass top-nav (backdrop-blur over ~80%
      surface), showing the crest logo; active/hover nav states use gold.
- [ ] `site-footer` becomes the dark navy four-column footer with the crest +
      tagline.
- [ ] `page-container` enforces the `max-w-7xl` (1280px) well with the standard
      side gutters.
- [ ] The recurring UI patterns from the system exist as reusable components in
      `src/components/`, mapped from the design library: at minimum Button
      (gold-primary / navy-secondary / text-tertiary), Badge (status + tone
      variants), Card / ProjectCard / BlogCard / StudentCard, IconTile,
      StatTile, StepItem, FilterPill, Pagination — built only where a page
      actually uses them (no speculative components).
- [ ] `entity-card` is superseded by (or refactored into) the new card
      components; no orphaned placeholder styling remains.

### Pages
- [ ] About, Projects (list), Students, Blog, and Partner render layouts that
      match their ui_kit screen compositions (hero, eyebrow labels, stat tiles,
      step items, filter pills, card grids) while continuing to render **real
      CMS content** via the existing Payload Local API queries — the restyle is
      presentational and must not change data access, `draft:false` behavior,
      or `findPublic()` guarantees.
- [ ] Home, Get Involved, and the project-detail page (`projects/[slug]`) render
      in the same design language, extrapolated coherently (they have no
      reference screen).
- [ ] All pages are responsive (the system's grid rules: `md:grid-cols-*`,
      single-column mobile) and pass an axe-clean bar for color contrast on the
      navy/off-white/gold palette.

### Brand identity & assets
- [ ] The crest logo asset is vendored into the repo (e.g. `public/`) and used
      in header/footer; the tagline "Apply. Solve. Advance." appears per the
      lockup guidance.

### Documentation ("use this going forward")
- [ ] A design reference lives in the repo (e.g. `docs/design/` and/or a
      `kk-design` skill) capturing the tokens, type, iconography, component
      inventory, and usage rules, so agents/humans build on-brand without
      re-fetching the remote project.
- [ ] `CLAUDE.md` references the design system as authoritative for visual/brand
      decisions (a short section + pointer), consistent with its existing
      Architecture/Voice sections.
- [ ] `kk-voice` is reconciled with the design system's tone guidance (see
      Reconciliation) — additive editorial-tone mechanics, **without** loosening
      the "bounded" partner rule or the no-fabrication rule.
- [ ] The `payload-nextjs` skill notes the styling conventions (tokens over raw
      hex, component reuse) so implementers follow them.

### Non-regression
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, and the Playwright `e2e`
      suite all pass; existing e2e specs are updated only where they assert on
      changed markup (test-author owns those edits).
- [ ] No change to Payload collections, access control, migrations, or the admin
      UI. Admin (`/admin`) is untouched.

## Content model impact

**None.** This is a presentation-layer change. No Payload collections, fields,
globals, or migrations are added or altered. (If the crest logo were ever to
become CMS-managed that would be a separate change; here it ships as a static
asset.)

## Reconciliation (design-system voice ↔ kk-voice)

The design system's readme positions the org as a "student-driven IT
**consultancy**" with marketing stats ("50+ Projects Shipped"). `kk-voice` makes
**"bounded, faculty-overseen"** load-bearing and forbids fabricated metrics.
These are reconciled, not merged blindly:

- **Adopt** the design system's *visual* language wholesale, and its
  *editorial-tone mechanics* that already align with kk-voice — eyebrow labels,
  serif-italic emphasis, metaphor-forward headlines, **no emoji**, Material
  Symbols icons, concrete/specific numbers, warm-but-professional register.
- **Keep kk-voice authoritative** on substance: partner-facing copy stays
  **bounded** (no "unrestricted consulting" implication from the "consultancy"
  framing); **no fabricated** student names, projects, or metrics — any stat
  tiles use real CMS-derived or clearly-labeled placeholder values, never
  invented ones.
- Where the two genuinely conflict, kk-voice's credibility guardrails win and
  the docs will say so.

## Out of scope

- Live deployment / any hosting change (unrelated to styling).
- CMS/editor UI restyling beyond what Payload themes natively — admin stays
  stock.
- New content, new pages, or new collections — this restyles what exists.
- Wiring the design system's `_adherence.oxlintrc.json` adherence-lint into CI
  (possible future hardening; note it, don't build it).
- Vendoring real brand photography — the system flags its imagery as
  placeholder stock; we keep tasteful placeholders and flag them.
- Two-way `/design-sync` with the remote project — this pass is a one-way import
  (remote → repo); keeping them in sync later is a separate concern.

## Open questions

- **Material Symbols delivery** — self-host the variable icon font vs. CDN link.
  Defaulting to "architect decides, records the tradeoff"; self-host preferred
  for consistency with the font decision, CDN acceptable if self-hosting the
  variable font is disproportionately fiddly.
- **Dark mode** — the current placeholder has `dark:` variants; the design
  system is a single light editorial theme. Proposal: drop the ad-hoc dark
  variants in favor of the system's one intentional light theme (dark navy is a
  *panel/section* treatment, not a global mode). Confirm at GATE 1 if you'd
  rather retain a dark mode.
