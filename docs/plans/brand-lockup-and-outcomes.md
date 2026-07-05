# Plan: Brand lockup, crest fix & student outcome pills

- **Slug:** brand-lockup-and-outcomes
- **Spec:** `docs/specs/brand-lockup-and-outcomes.md`
- **Date:** 2026-07-05

## 1. Approach

Three loosely-coupled deliverables, sequenced so the risky/tested pieces land first.
(A) Generalize the existing `Crest` component into a **variant-driven lockup** (`crest` |
`horizontal` | `stacked`, optional tagline) reused by header, footer, and About — keeping
the module-scope `CREST_EXISTS` check and the graceful serif-wordmark fallback so nothing
depends on the asset being vendored at implementation time. (B) Add an optional `outcome`
group to `Profiles`, a `outcomeTypeLabel` helper (TDD'd), a gold **outcome pill** on
`StudentCard`, and sample seed data. (C) The crest asset itself is PM-owned (remove the
truncated file now so the fallback renders; drop the optimized PNG in later) — **not a code
step**.

Chosen shape over alternatives: one component with a `variant` prop (not three separate
lockup components) because the header/footer/About differences are pure layout + which
sub-elements show — the fallback logic, aspect-ratio math, and accessible-name handling are
identical and shouldn't be duplicated three times. The `outcome` is a **group** (not two
flat fields, not a `select` alone) so `type` + `detail` read as one editable unit in
`/admin` and map to a single `outcome?: { label; detail? }` card prop.

## 2. Data model

`src/collections/Profiles.ts` — add one `group` field after `gradYear` (line 63), before
`bio`. Both sub-fields **optional** (empty `type` ⇒ no pill):

```
{
  name: 'outcome',
  type: 'group',
  label: 'Outcome',
  admin: { description: 'Where this student\'s work led. Optional — leave the type blank to show no outcome.' },
  fields: [
    {
      name: 'type', type: 'select', label: 'Outcome type',
      admin: { description: 'Shown as a prominent pill on the student card.' },
      options: [
        { label: 'Internship',       value: 'internship' },
        { label: 'Co-op',            value: 'co-op' },
        { label: 'New Position',     value: 'new-position' },
        { label: 'Full-time Offer',  value: 'full-time-offer' },
        { label: 'Promotion',        value: 'promotion' },
        { label: 'Research Role',    value: 'research-role' },
        { label: 'Grad School',      value: 'grad-school' },
      ],
    },
    {
      name: 'detail', type: 'text', label: 'Detail',
      admin: { description: 'Optional specifics, e.g. "SWE Intern, Nationwide". Factual and concrete — see kk-voice.' },
    },
  ],
}
```

Additive + nullable ⇒ safe forward path, no backfill. Group maps to columns
`outcome_type` (new pg enum) + `outcome_detail` (varchar) on the `profiles` table; Payload
types it as `outcome?: { type?: (...) | null; detail?: string | null } | null`.

**Migration:** generated, not hand-written —
`docker compose run --rm app pnpm payload migrate:create add_profile_outcome`. Produces
`src/migrations/<ts>_add_profile_outcome.{ts,json}` and appends to
`src/migrations/index.ts` (existing: `20260704_160722_initial`). Verify it applies on a
fresh DB (`docker compose down -v` → `up`; entrypoint runs `payload migrate`).

**Types drift:** `docker compose run --rm app pnpm generate:types` → commit the updated
`src/payload-types.ts`. CI's `static` job runs the `generate:types` drift check and fails
if the regenerated file isn't committed — call this out to the implementer.

## 3. Crest component API

`src/components/crest.tsx` — keep `CREST_PATH` / `CREST_EXISTS` (module scope) and the
`762×691` aspect ratio (`height = round(width * 691 / 762)`). New signature:

```
<Crest
  variant="crest" | "horizontal" | "stacked"   // default "horizontal"
  tagline?={boolean}                            // default false; ignored for variant="crest"
  tone?="light" | "dark"                        // default "light"
  size?={number}                                // crest width px; default 60 (horizontal) / 68 (stacked) / 40 (crest)
/>
```

Rendering rules:
- **Wordmark** is a real text node "Kite & Key IT" in `horizontal`/`stacked` (never baked
  into the image): `font-display font-bold tracking-tight`, `text-inverse` (dark) /
  `text-brand-ink` (light). Size scales with the crest: `size >= 88 → text-3xl`,
  `>= 56 → text-2xl`, else `text-xl` (keep this threshold map inline — presentational, not
  unit-tested).
- **Accessible-name discipline:** when the crest image renders *alongside* the wordmark
  text (`horizontal`/`stacked`), the `<Image>` is decorative — `alt=""` — so the name isn't
  announced twice. Only `variant="crest"` (image, no adjacent text) keeps
  `alt="Kite & Key IT"`.
- **Fallback (`!CREST_EXISTS`):** `horizontal` → wordmark only; `stacked` → wordmark (+
  tagline if set); `crest` → the serif wordmark `<span>` (today's behavior). Never a broken
  `<img>`.
- **Tagline** ("Apply. Solve. Advance."): body font, `font-semibold uppercase
  tracking-widest text-brand-gold`, `text-xs`. (Guideline says ~10px; use stock `text-xs`
  per DESIGN.md's "no custom size tokens" rule — the closest stock step.)
- **Layout:** `horizontal` = `inline-flex items-center` with gap `size <= 40 ? gap-2.5
  (~10px) : gap-4 (~16px)`. `stacked` = `flex flex-col items-center text-center gap-2.5`
  (the guideline's canonical stacked lockup is centered).

Contrast (computed, all pass WCAG AA): tagline gold `#fbbc00` on ink `#041627` = **10.7:1**.

## 4. Pill token choice (StudentCard outcome pill)

**Gold fill: `bg-brand-gold text-brand-gold-ink`**, `rounded-full px-3 py-1 text-xs
font-bold tracking-widest uppercase`. This is the site's primary-emphasis pairing (same as
Button `primary` and About's "Career Outcome" gold IconTile), so it's maximally distinct
from the existing **muted** profile-type tag (`bg-surface-sunken-strong text-muted`) and
signals "this is the outcome" at a glance. Contrast `#261a00` on `#fbbc00` = **9.99:1** —
well past AA; the `/students` axe `color-contrast` smoke (already in `e2e/a11y.spec.ts`
PAGES) covers it automatically, no spec change needed.

`detail`, when present, renders under the pill as `text-sm text-body` supporting text.

## 5. Display helper

`src/lib/display.ts` — add alongside the existing `profileTypeLabel` etc., same style:

```
export type OutcomeType =
  | 'internship' | 'co-op' | 'new-position' | 'full-time-offer'
  | 'promotion' | 'research-role' | 'grad-school'

const OUTCOME_TYPE_LABELS: Record<OutcomeType, string> = {
  internship: 'Internship', 'co-op': 'Co-op', 'new-position': 'New Position',
  'full-time-offer': 'Full-time Offer', promotion: 'Promotion',
  'research-role': 'Research Role', 'grad-school': 'Grad School',
}
export function outcomeTypeLabel(type: OutcomeType): string { return OUTCOME_TYPE_LABELS[type] }
```

## 6. Steps (ordered)

**Phase 0 — asset (PM, not implementer).** Remove the truncated `public/kite-key-crest.png`
now so the fallback renders. Drop the optimized full-res PNG (≤ ~512px wide, aspect ratio
preserved) whenever the user provides it. No code waits on this.

**Phase 1 — tests first (tester; must be red before Phase 2).**
1. `src/lib/display.unit.test.ts` — add an `outcomeTypeLabel` describe: assert all 7
   value→label mappings exactly (e.g. `outcomeTypeLabel('new-position') === 'New Position'`,
   `'co-op' → 'Co-op'`). Mirrors the existing `profileTypeLabel` block.
2. e2e (new `e2e/students.spec.ts`, or extend an existing spec): on `/students`, assert the
   seeded outcome **pill text is visible** (e.g. `INTERNSHIP`) and that the profile carrying
   a `detail` shows its **supporting text**, while the detail-less profile shows a pill with
   no detail line. (The gold pill's contrast is already covered by the `/students` entry in
   `a11y.spec.ts`.) The `outcome-unset ⇒ no pill` path is a trivial `outcome && …` guard;
   tester decides whether to add a no-outcome seed profile for a hard negative.

**Phase 2 — implementation (implementer; never edits Phase 1 test files).**
3. `src/collections/Profiles.ts` — add the `outcome` group (§2).
4. Generate migration + types (§2): `payload migrate:create add_profile_outcome`, then
   `generate:types`; commit `src/migrations/*` + `src/payload-types.ts`.
5. `src/lib/display.ts` — add `OutcomeType`, `OUTCOME_TYPE_LABELS`, `outcomeTypeLabel` (§5).
6. `src/components/crest.tsx` — rewrite to the variant API (§3).
7. `src/components/site-header.tsx` (line 28) — `<Crest size={36} />` →
   `<Crest variant="horizontal" size={34} />` (no tagline).
8. `src/components/site-footer.tsx` (lines 30–33) — replace the `<Crest tone="dark"
   size={36} />` + separate tagline `<p>` with a single
   `<Crest variant="stacked" tagline tone="dark" size={68} />`. (First footer column becomes
   center-aligned — the canonical stacked lockup; note for reviewer §7.)
9. `src/app/(frontend)/about/page.tsx` — add a large lockup at the top of the mission
   `<section>` (above the "Our Mission" eyebrow, ~line 47):
   `<Crest variant="stacked" tagline size={96} />` in a centered wrapper — the page's
   identity-scale brand moment. (Designer may prefer `horizontal`; either satisfies "large
   lockup in the brand/mission area.")
10. `src/components/student-card.tsx` — add `outcome?: { label: string; detail?: string }`
    prop; render the gold pill (§4) below `name`+`meta`, with the `detail` line under it when
    present. Keep it visually distinct from the existing muted `tag`.
11. `src/app/(frontend)/students/page.tsx` — import `outcomeTypeLabel`; pass
    `outcome={profile.outcome?.type ? { label: outcomeTypeLabel(profile.outcome.type as OutcomeType), detail: profile.outcome.detail ?? undefined } : undefined}`
    to each `StudentCard`.
12. `src/seed/index.ts` — add sample outcomes to the two existing sample profiles: profile
    one gets `{ type: 'internship', detail: 'SWE Intern — sample data' }`; profile two gets
    `{ type: 'new-position' }` (no detail) — exercises both the with/without-detail render
    paths. Keep the "sample data" labeling honest (kk-voice: no fabricated real
    employers/names presented as fact).

**Phase 3 — verify.** `pnpm lint`, `pnpm typecheck` (incl. types drift), `pnpm test`,
`pnpm test:e2e` (incl. axe). Confirm migration applies on a fresh DB.

## 7. Trade-offs & risks

- **Footer alignment shift.** The stacked lockup is centered per the guideline; the footer's
  first column moves from left-aligned to centered. Deliberate adoption of the canonical
  lockup — reviewer/designer flag if the footer grid should stay left-aligned instead.
- **Aspect-ratio constant vs. the future asset.** The `691/762` ratio is hardcoded. When the
  PM vendors the optimized PNG it must keep that intrinsic ratio (proportional downscale) or
  the constants in `crest.tsx` need updating to match, else `next/image` distorts. Noted for
  the PM's optimize step.
- **Decorative-image a11y.** Switching the image to `alt=""` in horizontal/stacked relies on
  the adjacent wordmark text for the accessible name. `e2e/chrome.spec.ts`'s footer test
  matches `img[name=/kite.*key/i]` **or** the text node, so the text-node path keeps it
  green — verify this still holds after the footer change.
- **Migration is generator-owned.** Implementer must run `migrate:create` (not hand-author
  the SQL) and commit the regenerated types, or CI's drift check fails. devops-reviewer
  should confirm the migration is additive/nullable and the fresh-DB apply is clean.
- **Enum naming.** Payload derives the pg enum name from the field path; harmless, but the
  down-migration must drop it — confirm the generated `down` is symmetric.

## 8. Out of scope

- No `students/[slug]` detail route; cards stay non-linked.
- No changes to Projects/Posts/Events/PartnerOpportunities, access control, or the
  `(payload)` generator files.
- No header CTA button; no home-hero lockup (About is the only large-lockup surface for v1).
- No aggregate/"placement rate" metrics — outcome is descriptive per-profile evidence only.
- The crest PNG optimization/vendoring is a PM asset task, not an implementation step.
```