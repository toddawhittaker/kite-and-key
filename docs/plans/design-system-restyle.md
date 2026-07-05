# Technical plan: Design-system restyle

- **Slug:** design-system-restyle
- **Governs:** `docs/specs/design-system-restyle.md` (spec) + `docs/plans/design-system-restyle-ux.md` (UX plan). This is the technical counterpart — it does not contradict the UX plan; it makes it buildable.
- **Author:** architect pass (read-only on code). Downstream: implementer builds it, tester owns test edits, devops-reviewer checks the build/CI impact.
- **PM decisions baked in:** R1 (pillars-as-category, no status pill), R2/R3 (Students & Blog cards non-linked; ProjectCard links to existing `/projects/[slug]`), R6 (Partner form visually complete, unwired), R8 (blog newsletter → honest CTA block), single light theme (drop `dark:`), fonts self-hosted via `next/font`, crest at `public/kite-key-crest.png` with graceful serif-wordmark fallback.

---

## 0. Architect decisions (recorded)

### 0.1 Tailwind v4 token strategy — CSS-first `@theme`, delete the JS config

Adopt the **v4-idiomatic CSS-first** path: express all design tokens in an `@theme` block in `src/app/(frontend)/globals.css`. **Delete `tailwind.config.ts`** and **remove the `@config` line** from `globals.css`. Rationale: the current JS config exists only to hold the placeholder `ink-*/accent-*/signal-*` scales (all being retired) and `darkMode: 'class'` (being dropped). v4 auto-detects source files (no `content` array needed), and PostCSS is already `@tailwindcss/postcss`. Keeping a JS config alongside `@theme` would split the token source of truth — exactly what we're eliminating. One file, one source of truth.

**Key finding — the design radius/type scales map cleanly onto Tailwind v4 stock utilities**, so most tokens need no custom naming, only bespoke names where there's no generic equivalent:

- **Radii:** design 4/8/12/full → v4 stock `rounded-sm` (0.25rem) / `rounded-lg` (0.5rem) / `rounded-xl` (0.75rem) / `rounded-full`. These already resolve to the exact values. We still declare `--radius-sm/lg/xl` in `@theme` to self-document and lock against future Tailwind default drift. Use `rounded-sm` for buttons/inputs/tags (not bare `rounded`, to stay unambiguous).
- **Type scale:** design 72/60/48/36/24/20/16/14/12 → v4 stock `text-7xl`/`text-6xl`/`text-5xl`/`text-4xl`/`text-2xl`/`text-xl`/`text-base`/`text-sm`/`text-xs`. All match exactly. **No custom font-size tokens.** (Optional `--text-micro: 0.625rem` for 10px tag chips, but a11y notes prefer a `text-xs` floor for real content — recommend not using micro for anything load-bearing.)
- **Bespoke names** are reserved for what has no stock equivalent or that we want singular/greppable: the `brand-*`/`surface-*`/`status-*`/text colors, the one `shadow-card` elevation, `font-display`, and the `eyebrow`/`type-emphasis` composite utilities.

**Collision guard:** do **not** define both a `--color-body` and a `--text-body` — they'd both generate a `text-body` utility. We define the color (`--color-body`) and rely on stock size utilities (`text-base` etc.), so there is no clash. Text colors are named short (`text-body`, `text-muted`, `text-inverse`) rather than `text-text-body`. Headings reuse `text-brand-ink` (design's `--text-heading` === `--brand-ink` === `#041627`, so no separate heading-color token).

### 0.2 Material Symbols — self-host via `next/font/local`

**Self-host the Material Symbols Outlined variable font via `next/font/local`**, with the woff2 committed to the repo (`src/app/(frontend)/fonts/`), not `next/font/google` and not a runtime `<link>`. Justification:

1. **No third-party SaaS at build or runtime** — consistent with the repo ethos and with self-hosting Inter/Noto Serif. Critically, `next/font/local` reads a committed file, so the **Docker/CI build makes no network call** for this font (unlike `next/font/google`, which fetches at build time — see Risk R-BUILD).
2. **Full variable-axis control.** The hover-fill interaction needs `FILL 0→1` (plus `wght`) via `font-variation-settings`. `next/font/google`'s support for icon-font variable axes is the less-trodden path and may not expose the full `FILL` range; `next/font/local` on the variable file guarantees it.
3. The `.filled` state is plain CSS (`font-variation-settings: 'FILL' 1`), independent of load mechanism.

**Source:** `MaterialSymbolsOutlined[FILL,GRAD,opsz,wght].ttf` from the `google/material-design-icons` repo (OFL-1.1), converted to woff2 and committed. The full variable file is large (~3 MB); a `pyftsubset` subset to the ~30 glyph codepoints actually used (icon names enumerated in `docs/design/reference/readme.md` § Iconography) is an **optional size follow-up**, not required for v1. Bind it in `globals.css`:

```css
.material-symbols-outlined {
  font-family: var(--font-material-symbols);
  font-weight: normal; font-style: normal; line-height: 1;
  letter-spacing: normal; text-transform: none; white-space: nowrap;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.material-symbols-outlined.filled { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
```

**Fallback (record only):** if `next/font/local` mishandles the variable ligature font at build, fall back to a `<link>` to Google Fonts in `layout.tsx` `<head>` (the spec's sanctioned hedge). Decide after a quick spike; default remains self-host.

### 0.3 `next/font` wiring for Inter + Noto Serif

Load in **`src/app/(frontend)/layout.tsx`** via `next/font/google` (matches the locked decision — `next/font/google` self-hosts the files and serves them from our own origin; no *runtime* CDN call). Auto-generated fallback size-adjust metrics prevent CLS, which is what actually stops FOUT (not just `display: swap`).

- **Inter:** `subsets: ['latin']`, `weight` 400–700 (or `variable`), `variable: '--font-inter'`, `display: 'swap'`.
- **Noto Serif:** `subsets: ['latin']`, `weight: ['400','700']`, `style: ['normal','italic']` (italic is the inline-emphasis device — required), `variable: '--font-noto-serif'`, `display: 'swap'`.
- **Material Symbols:** `next/font/local` (§0.2), `variable: '--font-material-symbols'`.
- Apply all three `.variable` classNames on `<html>`; map in `@theme`: `--font-sans: var(--font-inter), …` and `--font-display: var(--font-noto-serif), …`. Overriding `--font-sans` makes Inter the ambient body font document-wide (v4 Preflight binds `html` font-family to `--font-sans`); `font-display` opts headings into Noto Serif.
- **Build-time network caveat (R-BUILD):** `next/font/google` fetches Inter/Noto Serif from Google at `next build`. GitHub Actions runners and default Docker builds have egress, so this works, but it's an external build-time dependency. Mitigation if CI flakes: move Inter/Noto Serif to `next/font/local` with committed woff2 too. Flag for devops-reviewer; keep `next/font/google` unless the build proves flaky.

---

## 1. Overview & sequencing (phased, each independently reviewable)

- **Phase A — Foundation.** `@theme` tokens + `@utility eyebrow/type-emphasis` + base-layer heading rules in `globals.css`; fonts wired in `layout.tsx`; Material Symbols self-hosted; delete `tailwind.config.ts` + `@config`; remove all `dark:` variants; add the fixed-nav `pt-24` offset to the shell `<main>`. **Nothing renders differently yet except type/colors** — but the whole surface compiles against the new tokens. Reviewable as "tokens + fonts land, no page regressions."
- **Phase B — Chrome.** `SiteHeader` (glass nav + crest + `MobileNav [Client]`), `SiteFooter` (dark 4-col + crest + tagline), `PageContainer` (`max-w-7xl`). Crest asset + graceful wordmark fallback.
- **Phase C — Component library.** Build the 13 components (§4) in dependency order.
- **Phase D — Pages.** Restyle all 8 pages using the components; wire server-driven filters/pagination; add the Home stat row and Get Involved events query. Retire `entity-card.tsx` at the end of this phase (its last consumer removed).
- **Phase E — Docs.** `docs/design/DESIGN.md`, CLAUDE.md pointer, `payload-nextjs` skill note, `kk-voice` reconciliation note.

Tester writes/updates specs in parallel with D (see §6).

---

## 2. File-by-file change list

### Create
- `src/app/(frontend)/fonts/MaterialSymbolsOutlined.woff2` — committed variable icon font (§0.2).
- `public/kite-key-crest.png` — **PM supplies the binary.** Header/footer reference this path; until it lands, render an interim serif wordmark lockup (see `SiteHeader`/`SiteFooter` below) that upgrades cleanly when the file exists.
- `src/components/button.tsx`, `badge.tsx`, `card.tsx`, `project-card.tsx`, `blog-card.tsx`, `student-card.tsx`, `icon-tile.tsx`, `stat-tile.tsx`, `step-item.tsx`, `filter-pill.tsx`, `pagination.tsx`, `input.tsx`, `select.tsx`, `textarea.tsx` — component library (§4). Add `icon.tsx` (thin `<span class="material-symbols-outlined">` wrapper taking `name`/`filled`/`size`) so glyph rendering + fixed-box sizing is centralized (prevents icon-load reflow, §5 UX plan).
- `src/components/mobile-nav.tsx` **[Client]** — disclosure panel for `< md`, fed `NAV_LINKS` as a prop; focus management, Escape/tap-outside/link-click close.
- `src/components/view-toggle.tsx` **[Client]** — Students grid/list presentation toggle (local state only, no refetch).
- `docs/design/DESIGN.md` — the in-repo design reference (§7).

### Edit
- `src/app/(frontend)/globals.css` — replace entirely: drop `@config` + the `ink-*` body rule; add `@theme`, `@utility eyebrow`, `@utility type-emphasis`, base-layer heading rules, the `.material-symbols-outlined` rules, and the body `bg-surface-page text-body` rule.
- `src/app/(frontend)/layout.tsx` — wire the three fonts; put their `.variable` classNames on `<html>`; add `pt-24` (fixed-nav offset) to `<main>` once, not per page (§4 UX plan).
- `src/components/site-header.tsx` — glass fixed nav + crest + active/hover gold; render `MobileNav` below `md`. Stays a Server Component; keeps exporting `NAV_LINKS`.
- `src/components/site-footer.tsx` — dark navy 4-column footer + crest + "Apply. Solve. Advance." tagline.
- `src/components/page-container.tsx` — `max-w-7xl`, gutters `px-6 md:px-8`.
- `src/app/(frontend)/page.tsx` — Home restyle + real-number StatTile row (add data fetch); becomes dynamic.
- `src/app/(frontend)/about/page.tsx` — About restyle; **keep `about.heading` as the h1 text** (preserves e2e assertion + R7 mapping); Core Principles / pathway / Franklin block as fixed structural copy (R2).
- `src/app/(frontend)/projects/page.tsx` — swap `EntityCard`→`ProjectCard`; add `?pillar=` server-driven FilterPill row; async `searchParams`.
- `src/app/(frontend)/projects/[slug]/page.tsx` — restyle (hero, stat strip, problem/outcomes prose, contributor StudentCards, artifact chips); no new query.
- `src/app/(frontend)/students/page.tsx` — swap `EntityCard`→`StudentCard`; add Select filters (`program`/`gradYear`/`profileType`) + `ViewToggle`; async `searchParams`.
- `src/app/(frontend)/blog/page.tsx` — swap `EntityCard`→`BlogCard`; `?tag=` filter row; `Pagination` (`?page=`, `limit: 9`); newsletter panel → honest CTA block (R8); async `searchParams`.
- `src/app/(frontend)/partner/page.tsx` — restyle to the PartnerScreen composition; **keep h1 "Partner With Us"** (e2e) unless tester updates; render intake form via Input/Select/Textarea, **unwired** (submit disabled, existing "coming soon" note retained) (R6); StatTiles use real counts or omit (R5).
- `src/app/(frontend)/get-involved/page.tsx` — restyle; add real Events query (`findPublic('events', { sort: 'startDate', where: { startDate: { greater_than_equal: <now> } } })`) rendered as cards; **keep h1 "Get Involved"** (e2e).
- `CLAUDE.md` — add a short "Design system" pointer section (§7).
- `.claude/skills/payload-nextjs/SKILL.md` — styling-conventions note (tokens over hex, component reuse) (§7).
- `.claude/skills/kk-voice/…` — reconciliation note (additive tone mechanics; bounded/no-fabrication rules unchanged) (§7).

### Delete
- `tailwind.config.ts` — retired (tokens move to `@theme`; `darkMode: 'class'` dropped).
- `src/components/entity-card.tsx` — **retired.** Consumers: `projects/page.tsx`, `students/page.tsx`, `blog/page.tsx` → replaced by `ProjectCard`/`StudentCard`/`BlogCard` respectively (all three imports removed in Phase D before deletion).

### Not touched
`next.config.ts` (no change needed — `next/font` needs no config; images already allow `/api/media/file/**`). Collections, globals, `src/lib/payload.ts`, `src/lib/access.ts`, migrations, `(payload)/` admin — all unchanged.

---

## 3. Token → `@theme` mapping table

Values verbatim from `docs/design/reference/tokens/*.css`. `@theme` var → generated utility.

### Colors / surfaces / text
| Design alias | `@theme` var | Value | Utility |
|---|---|---|---|
| brand-ink | `--color-brand-ink` | `#041627` | `bg-brand-ink`, `text-brand-ink` (also heading color) |
| brand-navy-panel | `--color-brand-navy-panel` | `#1a2b3c` | `bg-brand-navy-panel` |
| brand-gold | `--color-brand-gold` | `#fbbc00` | `bg-brand-gold`, `text-brand-gold` |
| brand-gold-ink | `--color-brand-gold-ink` | `#261a00` | `text-brand-gold-ink` |
| brand-gold-hover | `--color-brand-gold-hover` | `#b88900` | `hover:bg-brand-gold-hover` |
| surface-page | `--color-surface-page` | `#fcf9f8` | `bg-surface-page` |
| surface-card | `--color-surface-card` | `#ffffff` | `bg-surface-card` |
| surface-card-tint | `--color-surface-card-tint` | `#f6f3f2` | `bg-surface-card-tint` |
| surface-sunken | `--color-surface-sunken` | `#f6f3f2` | `bg-surface-sunken` |
| surface-sunken-strong | `--color-surface-sunken-strong` | `#eae7e7` | `bg-surface-sunken-strong` |
| text-body | `--color-body` | `#44474c` | `text-body` |
| text-body-strong | `--color-body-strong` | `#1b1c1c` | `text-body-strong` |
| text-muted | `--color-muted` | `#5f5e5e` | `text-muted` |
| text-inverse | `--color-inverse` | `#fcf9f8` | `text-inverse` |
| text-inverse-muted | `--color-inverse-muted` | `#9ca3af` | `text-inverse-muted` |
| border-hairline | `--color-hairline` | `#c4c6cd` | `border-hairline` (use at `/10` for the soft variant) |
| status success bg/text | `--color-status-success-bg` / `-text` | `#dcfce7` / `#166534` | consumed **inside `Badge`** only |
| status info bg/text | `--color-status-info-bg` / `-text` | `#dbeafe` / `#1e40af` | inside `Badge` only |
| status pending bg/text | `--color-status-pending-bg` / `-text` | `#fef3c7` / `#92400e` | inside `Badge` only |

Status colors are **not** exposed as ad-hoc utility combos on arbitrary elements — they live inside `Badge` so status hues can't leak onto random UI.

### Radius / shadow / type / font
| Design token | `@theme` var | Value | Utility |
|---|---|---|---|
| radius sm (buttons/inputs/tags) | `--radius-sm` | `0.25rem` | `rounded-sm` |
| radius lg (cards/panels) | `--radius-lg` | `0.5rem` | `rounded-lg` |
| radius xl (hero frames) | `--radius-xl` | `0.75rem` | `rounded-xl` |
| radius full | (stock) | `9999px` | `rounded-full` |
| shadow-card | `--shadow-card` | `0 32px 64px -12px rgba(4,22,39,.08)` | `shadow-card`, `hover:shadow-card` |
| shadow-card-soft | `--shadow-card-soft` | `…/.04` | `shadow-card-soft` |
| shadow-pop | `--shadow-pop` | `0 25px 50px -12px rgba(0,0,0,.25)` | `shadow-pop` (IconTile `active`) |
| headline font | `--font-display` | `var(--font-noto-serif)` | `font-display` |
| body font | `--font-sans` (override) | `var(--font-inter)` | ambient (Preflight) |
| icon font | `--font-material-symbols` | local woff2 | via `.material-symbols-outlined` |
| headline tracking | `--tracking-tight` (override) | `-0.02em` | `tracking-tight` (applied on h1–h4 in base layer) |

Type sizes use **stock v4 utilities** (72→`text-7xl`, 60→`text-6xl`, 48→`text-5xl`, 36→`text-4xl`, 24→`text-2xl`, 20→`text-xl`, 16→`text-base`, 14→`text-sm`, 12→`text-xs`) — no custom size tokens.

### Composite utilities (v4 `@utility`)
- `eyebrow` → `font-sans`, `text-xs`, `font-bold`, `uppercase`, `letter-spacing: 0.2em`, `leading-none`. Use `<span class="eyebrow">`.
- `type-emphasis` → `font-display italic`. Use `<em class="type-emphasis">` for inline serif-italic emphasis inside headlines.

Base layer: `h1,h2,h3,h4 { font-family: var(--font-display); letter-spacing: -0.02em; }`; `body { @apply bg-surface-page text-body antialiased; }`.

---

## 4. Component build order & APIs

Build in dependency order. All **Server Components** unless flagged **[Client]**. APIs are the UX plan's (§1) — reproduced only where load-bearing; defer to `docs/plans/design-system-restyle-ux.md` §1 for full prop signatures. The design-system `.jsx` internals are **not in the repo** — the PM supplies component references to the implementer at build time; build APIs from those references + the UX plan.

1. **`icon.tsx`** — `{ name, filled?, size? }` → `<span class="material-symbols-outlined [filled]">{name}</span>` with a fixed box to prevent icon-load reflow.
2. **`button.tsx`** — `primary`/`secondary`/`tertiary`; `href`→`<Link>`, else `<button type>`; tertiary gets the animated `arrow_forward`. Replaces every ad-hoc `<Link className="rounded-md bg-accent-700…">`.
3. **`badge.tsx`** — `tone` × `variant('status'|'eyebrow')`; status tones read the `--color-status-*` pairs internally.
4. **`icon-tile.tsx`**, **`stat-tile.tsx`**, **`step-item.tsx`** — presentational primitives (tones/shapes/sizes per UX §1).
5. **`card.tsx`** — generic panel; `hoverLift` only when the caller wraps it in `<Link>` (no false affordance).
6. **`project-card.tsx`** — links to `/projects/[slug]`; hairline resting border; hover-lift + image scale. **No status pill (R1).** `category` = humanized pillar; `icon` = deterministic pillar→glyph (`build`→`code`, `engage`→`diversity_3`, `publish`→`auto_awesome`).
7. **`blog-card.tsx`**, **`student-card.tsx`** — **non-linked (R3)**: no `href`, therefore no hover-lift. StudentCard `tag` = humanized `profileType`; no `quote` (R4).
8. **`filter-pill.tsx`** — styled `<Link>` (`href`, `active`); **not** a stateful button. Confirms the UX plan's server-driven filter model.
9. **`pagination.tsx`** — numbered `<Link>`s preserving other `searchParams`.
10. **`input.tsx`/`select.tsx`/`textarea.tsx`** — labeled field wrappers, gold focus ring. Server-renderable (Partner form is unwired, R6).
11. **`view-toggle.tsx` [Client]** — local grid/list state only.
12. **`mobile-nav.tsx` [Client]** — disclosure fed `NAV_LINKS`.
13. Chrome refactors: **`site-header.tsx`** (Server; renders `MobileNav`), **`site-footer.tsx`** (Server), **`page-container.tsx`**.

**Server vs Client confirmed:** filters, pagination, and category/tag selection are **server-driven via `searchParams` + `<Link>`** (no client `useState` for data-affecting filters) — this keeps pages Server Components, works without JS, and is bookmarkable. The only Client islands are `MobileNav` and `ViewToggle` (pure presentation, no refetch). This matches and confirms the designer's §0 framing decision.

**Async `searchParams`:** Next 16 delivers `searchParams` as a `Promise`. Pages gaining filters (`projects`, `students`, `blog`) take `{ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }` and `await` it. All these pages already set `dynamic = 'force-dynamic'`.

---

## 5. Data flow preservation

**Unchanged:** every Payload query still goes through `src/lib/payload.ts` — `findPublic()` for collections (bakes in `overrideAccess:false` + `draft:false`), `getPayloadClient().findGlobal` for `about`. Access control (`src/lib/access.ts`), the draft-exclusion guarantee, and `depth` semantics are untouched. The restyle is **presentational only** — no collection, field, global, migration, or admin change. The `api-access` e2e invariant ("`/projects` HTML never embeds `_status:"draft"`") holds because the query path is unchanged.

**Filters are additive `where` clauses on the existing queries**, not new access paths:
- Projects: `?pillar=build|engage|publish` → `where: { pillars: { contains: <value> } }` on the existing `findPublic('projects', …)`.
- Blog: `?tag=<t>` → `where: { 'tags.tag': { equals: <t> } }`; `?page=n` → `page: n, limit: 9`.
- Students: `?program=/?year=/?type=` → `where` on `program`/`gradYear`/`profileType`. Filter *options* are computed server-side from the fetched set (distinct values), not hardcoded.

**Page → field mapping (real field names, verified against collections/global):**

| Page | Source | Fields rendered |
|---|---|---|
| Home | `findPublic` counts | `totalDocs` from projects/profiles/posts (fetch `{ limit: 1, depth: 0 }` and read `.totalDocs` — **not** `limit:0`, which returns all docs). Real, live numbers only. |
| About | `about` global | `heading` (→ h1, kept as literal text), `body` richText (→ lede/prose), `facultyModeratorNote` richText (→ Franklin block, optional). Core Principles / pathway = fixed structural copy (R2). |
| Projects list | `projects` | `title`, `summary`, `technologies[].name` (chips), `pillars` (→ category + FilterPill), `slug` (→ href), `coverImage`, `publishedDate`. **No status/sector fields exist — none fabricated (R1).** |
| Project detail | `projects` | `title`, `summary`, `pillars`, `technologies[].name`, `problem` richText, `contributors[]` (→ StudentCards, name/program/gradYear/avatar), `outcomes` richText, `artifacts[]` (label/url → chips), `publishedDate`. Stat strip derived from the already-fetched doc (contributor/tech counts) — no extra query. |
| Students | `profiles` | `name`, `program`, `gradYear`, `profileType` (→ tag), `bio` richText (→ plain-text excerpt), `avatar`. No `quote`/`href` (R3/R4). |
| Blog | `posts` (`depth:1`) | `title`, `excerpt`, `author.name` (relationship → author + initials), `publishedDate`, `tags[].tag` (→ filter + category), `coverImage`. Non-linked cards (R3). Newsletter → honest CTA (R8). |
| Partner | static + real counts | Static bounded copy (kk-voice governs, not "consultancy"); intake form fields map 1:1 to `PartnerOpportunities` (`organization`/`contactName`/`contactEmail`/`problem`/`termAvailability`) but **unwired (R6)**; StatTiles real counts or omit (R5). |
| Get Involved | `events` | New query: upcoming `events` by `startDate`, rendered as cards keyed by `eventType` (`workshop`→`school`, `code-review`→`code`, `employer-session`→`handshake`, `talk`→`stars`). First public consumer of Events — query wiring only, no schema change. |

---

## 6. Testing & e2e impact (tester owns all test edits — enumerated, not written here)

**Existing specs that assert on markup/text this restyle touches:**

- `e2e/routes.spec.ts`:
  - `/about` asserts h1 contains **"About Kite & Key IT"** → **preserve** `about.heading` as the h1 text; no edit needed if we honor §2.
  - `/partner` asserts h1 contains **"Partner With Us"** → **preserve** this h1 or tester updates line 41. Flag: the PartnerScreen headline differs; keeping "Partner With Us" as the h1 is the low-friction path (recommended).
  - `/get-involved` asserts h1 **"Get Involved"** → **preserve**.
  - `/projects` asserts visible text "Sample Project — Inventory Tracker" → ProjectCard renders `title`; passes.
  - `/students` asserts "Sample Profile — Student One" → StudentCard renders `name`; passes.
  - `/blog` asserts `/Sample Post —/` → BlogCard renders `title`; passes.
  - `/projects/sample-project-one` asserts h1 title + `getByText('Next.js', { exact: true })` → keep the tech chip text exactly `Next.js` (chip renders `technologies[].name` verbatim); passes.
  - `/` asserts an h1 is visible → Home keeps an h1; passes.
- `e2e/api-access.spec.ts` — query path unchanged; all pass. (The `_status:"draft"` HTML check still holds.)
- `e2e/admin.spec.ts` — admin untouched; unaffected.
- `src/tests/integration/*` — unit/integration on access/drafts/slug/seed; **no markup coupling**; unaffected.

**Risk to watch:** any e2e that relied on the exact old class-based structure would break, but the specs above assert on **roles/text**, not classes — so the surface is small. The single genuine decision point is the Partner h1 copy.

**New coverage worth adding (tester's call, note only — do NOT author here):** header renders all `NAV_LINKS`; `MobileNav` opens/closes below `md`; footer renders the tagline + crest alt text; `?pillar=` changes the projects grid (server-driven filter); blog `?page=2` pagination; an **axe a11y smoke** on Home/Projects/Partner asserting the acceptance-criteria "axe-clean color contrast" bar (see contrast checklist in UX plan §4 — verify `text-muted` on `surface-page`, gold-on-navy, footer `text-inverse-muted`, and Partner hero rgba body copy at implementation).

---

## 7. Docs to update

- **`docs/design/DESIGN.md`** (new) — the authoritative in-repo reference so agents/humans build on-brand without re-fetching the remote project. Contents: the token table (§3) as the canonical list; type scale + font usage (Noto Serif display / Inter body / Material Symbols icons, self-hosted); the `eyebrow`/`type-emphasis` conventions; radius/shadow/motion rules ("one elevation, hover-only"); the component inventory + when to use each (Button/Badge/Card/ProjectCard/BlogCard/StudentCard/IconTile/StatTile/StepItem/FilterPill/Pagination/form primitives); rules — **tokens over raw hex, reuse components, status colors only inside Badge, server-driven filters**; and a pointer to `docs/design/reference/` as the imported source of truth (one-way import, per spec out-of-scope).
- **`CLAUDE.md`** — short "Design system" subsection under Architecture (or after Voice): names `docs/design/DESIGN.md` as authoritative for visual/brand decisions, states the single light editorial theme (no dark mode), tokens in `globals.css` `@theme`, and self-hosted fonts. A pointer, not a duplicate of DESIGN.md.
- **`.claude/skills/payload-nextjs/SKILL.md`** — add a styling-conventions line under Engineering conventions: use `@theme` tokens (never raw hex), reuse `src/components/*` before writing new markup, headings `font-display`, eyebrows via the `eyebrow` utility.
- **`.claude/skills/kk-voice`** — reconciliation note (additive): adopt the design system's **tone mechanics** (eyebrow labels, serif-italic emphasis, metaphor-forward headlines, no emoji, Material Symbols not emoji, concrete/specific numbers, warm-professional register). **Unchanged and authoritative:** "bounded/faculty-overseen" for partner copy (never "consultancy"/"unrestricted consulting"), and no fabricated names/projects/metrics — stat tiles use real CMS-derived counts or are omitted. Where they conflict, kk-voice's credibility guardrails win.

---

## 8. Risks & mitigations

- **R-BUILD — `next/font/google` build-time fetch (Docker/CI).** `next build` fetches Inter/Noto Serif from Google. Runners/Docker have egress so it works, but it's an external build dependency that can flake. *Mitigation:* if the `image` CI job or local Docker build flakes on fonts, move Inter/Noto Serif to `next/font/local` with committed woff2 (as Material Symbols already is). **Devops-reviewer: watch the `image` job.**
- **R-ICON-SIZE — Material Symbols variable woff2 (~3 MB) committed.** Large binary in the repo. *Mitigation:* acceptable for v1 (repo already vendors a crest PNG; it's one file, cached, self-hosted). Optional `pyftsubset` to the ~30 used glyphs as a size follow-up — note in DESIGN.md, don't block v1.
- **R-CONTRAST — axe-clean bar is an acceptance criterion.** `text-muted` (#5f5e5e) on `surface-page` (#fcf9f8), footer `text-inverse-muted` (#9ca3af) on `brand-ink`, and any ad-hoc `rgba(255,255,255,.7)` Partner-hero body copy are the boundary cases. *Mitigation:* verify with a real axe run at implementation (not estimates); bump the smallest muted text to `text-xs` floor / higher opacity / `text-inverse` where borderline. Enumerated in UX plan §4; tester adds the axe smoke (§6).
- **R-CREST — asset not in repo.** `public/kite-key-crest.png` is PM-supplied. *Mitigation:* header/footer reference the path but render an interim serif wordmark lockup ("Kite & Key IT" in `font-display`) that upgrades automatically when the file lands — code degrades gracefully; no broken `<img>`.
- **R1 (carried) — Projects grid communicates differently than the reference screen** (no status pill, pillar-as-category). *Resolution:* PM-approved; note a real `status` select field as an out-of-scope fast-follow in DESIGN.md.
- **R6 (carried) — unwired Partner form.** Rendering a full form that silently accepts nothing is a credibility bug. *Resolution:* submit disabled + existing "coming soon" note retained; no `PartnerOpportunities` public-create path added (that would touch access control — out of scope).
- **`force-dynamic` + filters** — all filtered pages are already `force-dynamic`, so `searchParams` reads add no caching surprise. Home/Get-Involved gain data fetches → confirm they carry `dynamic = 'force-dynamic'` (Home currently static).

---

## Out of scope (explicit non-goals)

- New collections, fields, globals, or migrations (spec: "Content model impact: None").
- `/students/[slug]` and `/blog/[slug]` detail routes (R3 fast-follow).
- Wiring the Partner intake submission / a public-create access path (R6).
- A real `status` field on Projects, or `quote`/testimonial on Profiles (R1/R4 fast-follows).
- Newsletter/email-subscription backend (R8 — replaced by an honest CTA).
- Real brand photography (placeholders retained, flagged).
- Admin/`(payload)` restyling; dark mode; the design-system adherence-lint (`_adherence.oxlintrc.json`) in CI; two-way `/design-sync`.
