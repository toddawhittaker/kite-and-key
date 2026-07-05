# UX plan: Design-system restyle

- **Companion to:** `docs/specs/design-system-restyle.md` (governs; read it first)
- **Author:** designer pass, cold-context, for the architect + implementer
- **Scope of this doc:** component inventory/APIs, token→Tailwind v4 mapping intent,
  page-by-page composition (real field mapping), responsive/accessibility notes,
  font-loading UX, and the risk list the architect/PM need to resolve.

Reference sources used throughout (file paths, not restated per-line):
`docs/design/reference/{readme.md,tokens/*.css,ui_kits/marketing-site/*.jsx}`,
current app under `src/app/(frontend)/`, `src/components/`, `src/collections/`,
`src/globals/About.ts`.

---

## 0. Framing decisions made in this pass

Two structural calls, made so the rest of the doc is unambiguous — flagged again
in §6 for confirmation:

1. **Filters and pagination are server-driven (`searchParams`), not client
   `useState`.** The ui_kit screens use React state because they're standalone
   demos; in the real app, category/program/year filters and blog pagination
   change *which CMS docs render*, so they belong in the Server Component data
   fetch (`findPublic(..., { where, page, limit })`) via URL query params, not a
   client-side re-render of an already-fetched list. This is simpler, keeps the
   pages as Server Components, works without JS, and is bookmarkable/shareable.
   Only *pure presentation* toggles (Students' grid/list view) are client state.
2. **`entity-card.tsx` is retired**, not kept as a fallback. `ProjectCard`,
   `BlogCard`, `StudentCard` fully replace its three call sites; the generic
   `Card` covers the remaining "flat hover-lift panel" use (Core Principles,
   Partner offer panels).

---

## 1. Component inventory & APIs

All are Server Components unless flagged **[Client]**. Tokens referenced by
name only here — see §2 for the `@theme` mapping.

### Button — new, `src/components/button.tsx`
Replaces ad-hoc `<Link className="rounded-md bg-accent-700...">` patterns
scattered across pages today (home, partner, project CTAs).

```
Button({
  variant: 'primary' | 'secondary' | 'tertiary',  // gold-fill / navy-fill / text+arrow
  size?: 'md' | 'sm',                              // md default (16px/32px pad), sm (12px/32px)
  href?: string,                                   // renders <Link>; omit for onClick/type=submit
  icon?: string,                                   // material symbol name, tertiary only, default 'arrow_forward'
  fullWidth?: boolean,
  type?: 'button' | 'submit',
  children: ReactNode,
})
```
- **primary**: `bg-brand-gold text-brand-gold-ink`, bold, `rounded` (4px), no
  border. Hover: background → `brand-gold-hover`. Press: `active:scale-95`.
- **secondary**: `bg-brand-navy-panel text-white`, hairline
  `border-white/20`. Same radius/press.
- **tertiary**: no fill, `text-brand-ink font-bold`, inline `arrow_forward`
  Material Symbol that translates `+4px` right on hover (200ms). Hover color →
  gold on text-only links per the readme's hover rule.
- No outline-only variant (none exists in source — don't invent one).

### Badge — new, `src/components/badge.tsx`
One component, two typographic **variants**, both pill-shaped
(`rounded-full`), because the source uses two visually distinct pill
patterns that are otherwise the same shape:

```
Badge({
  tone: 'success' | 'info' | 'pending' | 'neutral' | 'gold' | 'glass',
  variant?: 'status' | 'eyebrow',   // default 'status'
  children: ReactNode,
})
```
- **`variant="status"`**: small, bold, Inter — the Project status pill
  (`success`/`info`/`pending` map to the green/blue/amber status tokens,
  §2). Used only inside `ProjectCard` (see §6 R1 — real status data doesn't
  exist yet).
- **`variant="eyebrow"`**: Noto Serif italic, not uppercase — the small pill
  labels above hero headlines ("Our Mission," "Partnerships," "Insights from
  our digital atelier"). `tone="neutral"` (off-white chip on light sections)
  or `tone="gold"` (navy chip, gold text, on dark hero sections like Partner).
- `tone="glass"` reserved for a badge over photography (About hero has none
  today — kept for completeness, unused until real photography ships).

### Card — new, `src/components/card.tsx`
Generic flat panel. **Design refinement beyond the literal source:** hover-lift
(`shadow` + `-translate-y-2`) only applies when the card is itself a link —
lifting a non-interactive info panel is a false affordance. `Card` itself takes
no `href`; callers wrap it in `<Link>` (or don't) and pass `hoverLift`.

```
Card({
  padding?: 'md' | 'lg',      // 32px / 40-48px, matches p-8/p-10-12 in source
  tone?: 'default' | 'sunken', // surface-card vs surface-card-tint background
  hoverLift?: boolean,         // default false; true only when wrapped in a Link
  children: ReactNode,
  className?: string,
})
```
Used directly for: About's Core Principles panels, Partner's "What We Offer"
panels. `ProjectCard`/`BlogCard`/`StudentCard` below are purpose-built (they
need image frames + structured slots), not `Card` wrappers.

### ProjectCard — new, `src/components/project-card.tsx`
Replaces `EntityCard` on `/projects`. **[see §6 R1/R2 for field gaps]**

```
ProjectCard({
  title: string,
  description: string,           // 2-3 line clamp
  tags: string[],                // technology chips
  href: string,
  icon?: string,                 // Material Symbol, derived — see §6 R1
  category?: string,              // humanized pillar label — see §6 R1
  status?: { tone: 'success'|'info'|'pending'; label: string },  // omit in v1 — §6 R1
  timeline?: string,              // formatted publishedDate — §6 R1
  coverImage?: { url: string; alt?: string },
})
```
Card frame: `Card` internals + hairline `border-hairline/10` (the one card
type that keeps a resting border per the readme), `hoverLift` always true
(the whole card is a `<Link>`). Image (if `coverImage` present) sits in an
`overflow-hidden` frame, scales to `1.05` on hover.

### BlogCard — new, `src/components/blog-card.tsx`
Replaces `EntityCard` on `/blog`.

```
BlogCard({
  title: string,
  description?: string,
  author: string,
  authorInitials: string,     // computed from author name, not stored
  date: string,                // formatted publishedDate
  category?: string,           // first tag, if any
  coverImage?: { url: string; alt?: string },
  href?: string,               // see §6 R3 — no /blog/[slug] route exists yet
})
```
Same hover-lift/image-scale rule as ProjectCard, conditioned on `href` being
present (§6 R3).

### StudentCard — new, `src/components/student-card.tsx`
Replaces `EntityCard` on `/students`.

```
StudentCard({
  name: string,
  program?: string,
  year?: number,               // gradYear
  description?: string,        // plain-text excerpt of bio richText
  avatar?: { url: string; alt?: string },
  tag?: string,                 // humanized profileType ("Alum", "Faculty") — substituted, see §6 R4
  href?: string,                // see §6 R3 — no /students/[slug] route exists yet
})
```
No `quote` prop — the source's pull-quote has no real data source (§6 R4);
omit rather than fabricate.

### IconTile — new, `src/components/icon-tile.tsx`
One "icon in a container" primitive covers every boxed/circled icon in the
source (Core Principles squares, Partner offer squares, About's 4-stage
pathway circles, the Projects hero/CTA circles):

```
IconTile({
  icon: string,                                   // Material Symbol name
  shape?: 'square' | 'circle',                    // default 'square'
  tone?: 'navy' | 'gold' | 'outline' | 'active' | 'ghost',
  size?: 'sm' | 'md' | 'lg' | 'xl',
  filled?: boolean,                                // FILL 0→1 axis, for the CTA circles
})
```
`tone="outline"` = dashed hairline, transparent fill (pathway's "Community"
stage). `tone="active"` = navy-panel fill + `shadow-pop` + `scale(1.1)` (the
one emphasized pathway stage). `tone="ghost"` reserved for a bare, unboxed
icon usage if a future page needs it — not exercised in v1.

### StatTile — new, `src/components/stat-tile.tsx`
```
StatTile({
  value: string,        // e.g. "12", "100%" — must be real/CMS-derived, never invented (§6 R5)
  label: string,
  tone?: 'navy' | 'gold',
})
```

### StepItem — new, `src/components/step-item.tsx`
```
StepItem({
  number: number,
  title: string,
  description: string,
})
```
Renders the oversized "ghost numeral" behind the title (low-opacity serif
numeral), per Partner's 5-step process. Also reused for Get Involved's
extrapolated pathway (see §3).

### FilterPill — new, `src/components/filter-pill.tsx`
Per the framing decision in §0, this is a styled `<Link>`, not a stateful
button:
```
FilterPill({
  href: string,          // e.g. `/projects?pillar=build`
  active: boolean,        // computed by the Server Component from searchParams
  children: ReactNode,
})
```
No `onClick`/`[Client]` needed. (The one place a *stateful* pill-style toggle
appears — Students' grid/list view switch — is `ViewToggle` below, not this
component.)

### ViewToggle — new, `src/components/view-toggle.tsx` **[Client]**
Small, local UI state only (doesn't refetch data): toggles `grid_view` /
`view_list` rendering of an already-fetched student list. Isolated client
island; the page around it stays a Server Component.
```
ViewToggle({ value: 'grid' | 'list', onChange: (v) => void })
```

### Pagination — new, `src/components/pagination.tsx`
Also a Server Component per §0 — numbered `<Link>`s preserving other query
params:
```
Pagination({
  page: number,
  pageCount: number,
  basePath: string,       // e.g. '/blog' — combined with existing searchParams
})
```

### Input / Select / Textarea — new, `src/components/{input,select,textarea}.tsx`
Form primitives for Partner's intake form. Standard labeled-field wrappers
(`label` prop, `rounded` (4px), hairline border, focus ring in gold). Plain
Server-Component-renderable markup; only need `[Client]` if/when the form
gains client-side validation (see §6 R6 — submit wiring is an open question).

### SiteHeader → glass top nav — refactors `src/components/site-header.tsx`
Fixed, `backdrop-blur-lg` over ~80%-opacity `surface-page`, crest logo +
wordmark, nav links (gold underline on active/hover). Desktop nav stays a
Server Component. Mobile needs a disclosure — see §4 — implemented as a small
isolated `MobileNav` **[Client]** component that receives the same
`NAV_LINKS` array as a prop (no data fetching inside it).

### SiteFooter → dark 4-column footer — refactors `src/components/site-footer.tsx`
`bg-brand-ink text-white`, four columns (crest + tagline; page links; pillar
links Build/Engage/Publish → `/projects` `/get-involved` `/blog`; a
contact/Franklin-affiliation column), hairline `border-t` above a bottom meta
row. Server Component, no interactivity.

### PageContainer — refactors `src/components/page-container.tsx`
`max-w-7xl` (currently `max-w-6xl` — must change), `px-8` gutters (currently
`px-4 sm:px-6 lg:px-8` — simplify to the system's flat 32px gutter, still
responsive via a smaller mobile gutter if needed, e.g. `px-6 md:px-8`).

---

## 2. Token → Tailwind v4 mapping intent

Tailwind v4's `@theme` in `src/app/(frontend)/globals.css` is the source of
truth (replaces `tailwind.config.ts`'s `ink-*`/`accent-*`/`signal-*` scales
entirely — that file's placeholder scale is deleted, not extended). Naming
intent below; **exact `@theme` syntax is the architect's call**, but utility
*names* should read as follows so implementers don't invent their own:

| Design token | Proposed `@theme` var | Utility surface |
|---|---|---|
| `--brand-ink` (`#041627`) | `--color-brand-ink` | `bg-brand-ink`, `text-brand-ink` |
| `--brand-navy-panel` | `--color-brand-navy-panel` | `bg-brand-navy-panel` |
| `--brand-gold` (`#fbbc00`) | `--color-brand-gold` | `bg-brand-gold`, `text-brand-gold` |
| `--brand-gold-ink` | `--color-brand-gold-ink` | `text-brand-gold-ink` |
| `--brand-gold-hover` | `--color-brand-gold-hover` | `hover:bg-brand-gold-hover` |
| `--surface-page` | `--color-surface-page` | `bg-surface-page` |
| `--surface-card` / `-tint` | `--color-surface-card`, `--color-surface-card-tint` | `bg-surface-card` |
| `--surface-sunken` / `-strong` | `--color-surface-sunken`, `--color-surface-sunken-strong` | `bg-surface-sunken` |
| `--text-heading/body/body-strong/muted/inverse/inverse-muted` | `--color-text-*` | `text-text-heading` etc. (or shorten to `text-heading`/`text-muted` if the architect prefers — flag preference, not a hard requirement) |
| `--border-hairline` | `--color-border-hairline` | `border-border-hairline` |
| status bg/text pairs | `--color-status-{success,info,pending}-{bg,text}` | consumed **inside `Badge`**, not exposed as ad-hoc utility combos elsewhere — keeps status colors from leaking onto arbitrary elements |
| `--radius-sm/md/lg/full` (4/8/12/9999px) | override Tailwind's own `--radius-*` scale directly (`rounded`, `rounded-lg`, `rounded-xl`, `rounded-full` keep their familiar names but resolve to the system's values) rather than inventing new radius utility names | `rounded`, `rounded-lg`, `rounded-xl`, `rounded-full` |
| `--shadow-card` / `-soft` / `-pop` | custom named shadow utilities, e.g. `--shadow-card`, not folded into generic `shadow-lg` (keeps the "one deliberate elevation" system legible and greppable) | `shadow-card`, `hover:shadow-card` |
| `--font-headline` (Noto Serif) | `--font-display` (mapped to the self-hosted `next/font` CSS var, §5) | `font-display` |
| `--font-body` (Inter) | override Tailwind's default `--font-sans` so body text is Inter without a utility everywhere | (ambient) |
| eyebrow type (uppercase, bold, `tracking-widest`, `text-caption`) | a `@utility eyebrow` composite (Tailwind v4 `@utility` directive) | `<span class="eyebrow">` |
| serif-italic emphasis | a `@utility type-emphasis` composite (`font-display italic`) | `<em class="type-emphasis">` inside headlines |
| `--tracking-tight` (headlines) | override `tracking-tight` or add `tracking-headline` | applied on all `h1`–`h4` via a base-layer rule, not per-instance |

Reasoning for overriding Tailwind's *own* radius/shadow/font keys where
possible (vs. inventing all-new names): implementers get the system "for
free" through familiar utilities (`rounded-lg`, `font-sans`) instead of having
to remember bespoke class names for the common case; bespoke names (`shadow-card`,
`eyebrow`, `type-emphasis`, the `brand-*`/`surface-*`/`status-*` colors) are
reserved for things that have no generic Tailwind equivalent or that we
deliberately want to keep singular/greppable (there is exactly one elevation
in this system — a generic `shadow-lg` escape hatch would undermine that).

---

## 3. Page-by-page composition map

### About (`src/app/(frontend)/about/page.tsx`) — reference: `AboutScreen.jsx`
Primary audience: prospective students / general credibility.

| Section | Screen composition | Real data slot |
|---|---|---|
| Hero | eyebrow "Our Mission" + serif h1 with 2 italicized words + 2 lede paragraphs + framed photo (grayscale/multiply) | `about.heading` → h1 (no italic-emphasis markup exists in plain text today — see §6 R7); first paragraphs of `about.body` (richText) → lede column; photo is a placeholder frame (no real asset — flagged in spec's out-of-scope) |
| Core Principles (3 cards) | `IconTile` (square/navy) + h3 + body per card | **No structured field exists** — see §6 R7. Recommend: fixed structural copy (Build/Engage/Publish framed as the three principles), not CMS-driven, since it restates CLAUDE.md's already-fixed pillar vocabulary |
| Success Ecosystem (4-stage pathway) | label row of `IconTile` circles (outline/square/active/gold tones) + CTA link | Same as above — fixed structural copy (Community → Apprenticeship → Consultancy → Careers), not CMS-driven |
| Franklin affiliation block | icon + wordmark + one paragraph | Fixed copy (an evergreen institutional fact, not editor-managed) — OR render `about.facultyModeratorNote` here if the faculty note is meant to double as this block (needs PM/architect confirmation — see §6 R7) |

### Projects list (`src/app/(frontend)/projects/page.tsx`) — reference: `ProjectsScreen.jsx`
Primary audience: employers + prospective students.

| Section | Screen composition | Real data slot |
|---|---|---|
| Header | eyebrow "Our Portfolio" + h1 "Our Work" + lede + gold `auto_awesome` circle | Static copy (kk-voice: keep the existing "real, scoped technical work" framing already in the page) |
| Filter pills | category filter row | **Reinterpreted**: filter by `project.pillars` (Build/Engage/Publish — real `select hasMany` field) via `?pillar=` searchParam, not by fabricated sector categories (§6 R1) |
| Card grid (3-col) | `ProjectCard` × N | `title`←`project.title`, `description`←`project.summary`, `tags`←`project.technologies[].name`, `href`←`/projects/${project.slug}`, `coverImage`←`project.coverImage`. `icon`/`category`/`status`/`timeline` — see §6 R1 |
| Bottom CTA band | dark navy panel, "Ready to launch..." + Start a Partnership / View FAQ buttons | Static copy → `/partner` and (no FAQ page exists — link to `/partner` or omit second button; flag if a FAQ page is wanted) |

### Students (`src/app/(frontend)/students/page.tsx`) — reference: `StudentsScreen.jsx`
Primary audience: employers (talent signal) + prospective students.

| Section | Screen composition | Real data slot |
|---|---|---|
| Header | eyebrow "Success Narratives" + h1 + serif-italic subhead + gold rule + body | Static copy |
| Filters (3 `Select`s) + view toggle | Program / Outcome Type / Class Year selects, grid/list toggle | `program`←distinct `profile.program` values (computed server-side from the fetched set); `Class Year`←distinct `profile.gradYear`; **`Outcome Type` has no field — substitute `profileType`** (Student/Team/Faculty/Alum, a real select field) (§6 R4). View toggle → `ViewToggle` **[Client]**, presentation-only |
| Card grid (3-col) | `StudentCard` × N | `name`←`profile.name`, `program`←`profile.program`, `year`←`profile.gradYear`, `avatar`←`profile.avatar`, `description`←plain-text excerpt of `profile.bio`. `tag`←humanized `profileType` (substituted). No `quote` (§6 R4); no `href` (§6 R3) |
| "Load More" | button | Becomes `Pagination` (§0) once profile count exceeds one page, or omitted if the seed set stays small — architect's call on threshold |

### Blog (`src/app/(frontend)/blog/page.tsx`) — reference: `BlogScreen.jsx`
Primary audience: current students / prospective students (Publish pillar
evidence).

| Section | Screen composition | Real data slot |
|---|---|---|
| Header | eyebrow + h1 "From the Field" + lede | Static copy (existing page copy) |
| Filter row (underline tabs) | "All Posts / Technology / Applied Learning / Career Paths" | Reinterpreted as filter by `post.tags[].tag` distinct values (real field) via `?tag=` searchParam — category taxonomy in the screen is illustrative, not literal |
| Card grid (3-col) + newsletter bento (2-col span) | `BlogCard` × N + navy newsletter capture panel | `title`←`post.title`, `description`←`post.excerpt`, `author`/`authorInitials`←`post.author.name` (relationship, `depth:1`), `date`←formatted `post.publishedDate`, `category`←first `post.tags[].tag`, `coverImage`←`post.coverImage`. **Newsletter panel has no backend — see §6 R8**, recommend cutting or de-functionalizing it |
| Pagination | numbered pager | `Pagination` component, server-driven via `?page=`, `findPublic('posts', { page, limit: 9 })` |

### Partner (`src/app/(frontend)/partner/page.tsx`) — reference: `PartnerScreen.jsx`
Primary audience: project partners. **"Bounded" is load-bearing here — kk-voice governs, not the design system's "consultancy" framing (see spec Reconciliation).**

| Section | Screen composition | Real data slot |
|---|---|---|
| Hero (dark navy) | eyebrow "Partnerships" + h1 with gold italic phrase + lede | Static copy — but the italic phrase must be reworded to avoid "Academic Excellence" reading as an unbounded-consulting flex; keep existing page's "scoped, faculty-overseen" framing as the lede, not the design system's sample copy |
| What We Offer (3 cards) | `IconTile` + h3 + body | Static copy, **reworded per kk-voice**: "Scoped Projects" stays (already bounded-friendly), "Professional & Supervised" stays, but drop/rewrite anything implying "tiered pricing" or open engagement — no pricing model exists or is claimed anywhere else in the app |
| Who We Work With + stat tiles | audience list + 2 `StatTile` + 2 photo frames | Audience list: static copy (nonprofits/small business/civic — matches existing page's framing). **`StatTile` values must be real or omitted — "100%"/"50+" from the source are exactly the fabricated-metric problem the spec's Reconciliation calls out.** Recommend real CMS-derived counts instead (§6 R5) or drop this sub-section for v1 |
| Our Collaborative Process (5 `StepItem`s) | numbered steps | Reuse the *existing* page's 4-step process content (Submit → Faculty review → Matched to team → Scoped delivery) rather than the source's 5-step "Discovery/Consultation/Proposal/Development/Handover" (that framing reads more like paid consulting) — `StepItem` renders 4, not 5; grid still balances (`sm:grid-cols-2 lg:grid-cols-4`) |
| Intake form | `Input`/`Select`/`Textarea` + submit | Visual form matches the screen's fields (Org Name, Org Type, Contact Name, Email, Description, Timeline, Referral) mapped 1:1 to `PartnerOpportunities` fields (`organization`, —, `contactName`, `contactEmail`, `problem`, `termAvailability`, —). **Submit wiring is out of scope for this presentational pass — see §6 R6.** Render the fields, keep the existing "form coming soon" note visible, and leave the submit button disabled or link out, pending PM decision |

### Home (no reference screen) — extrapolated
Primary audience: prospective students (first-touch "what do I actually get to
do here" answer), secondary employers/partners via the pillar cards.

1. **Hero** — eyebrow ("Applied Learning, Live"), Noto Serif h1 with one
   italicized word, lede paragraph (reuse/tighten the existing placeholder
   copy — flagged for content team), primary Button → `/projects`, tertiary
   Button → `/partner`.
2. **Three pillars** (existing section, restyled) — `IconTile` (square/navy) +
   Card, one per pillar: Build → `/projects` (icon `code`), Engage →
   `/get-involved` (icon `diversity_3`), Publish → `/blog` (icon
   `auto_awesome`) — all three icons already in the approved Material Symbols
   inventory (readme's Iconography list), no new glyph names introduced.
3. **Real-numbers stat row** — 3 `StatTile`s fed by `totalDocs` from
   `findPublic('projects'|'profiles'|'posts', { limit: 0 })` (Payload returns
   `totalDocs` even with `limit: 0`) — e.g. "{n} Projects," "{n} Student
   Profiles," "{n} Posts Published." Real, live, never fabricated — directly
   satisfies the spec's "real CMS-derived or clearly-labeled placeholder"
   rule and gives Home a credibility beat the current placeholder lacks.
4. **CTA band** (existing dark-navy pattern from Projects/Partner) — "Partner
   With Us" / "Get Involved" buttons, matching the Projects list's bottom CTA
   treatment for visual consistency.

### Get Involved (no reference screen) — extrapolated
Primary audience: current students (the "bridge from course to contribution").

1. **Hero** — framed at current students, not partners: "From coursework to
   a live project" register.
2. **Upcoming events** — currently a placeholder box; restyle as a real data
   section: `findPublic('events', { sort: 'startDate', where: { startDate: {
   greater_than_equal: <now> } } })`, rendered as a card list (reuse `Card` +
   `IconTile` keyed by `eventType`: workshop→`school`, code-review→`code`,
   employer-session→`handshake`, talk→`stars`). This is a genuine
   presentational addition (query wiring, not schema) that finally gives the
   Events collection a public consumer.
3. **Pathway strip** — reuse `StepItem` for "Take a course → Join a project →
   Publish your work" (3 steps), echoing the About pathway's language without
   duplicating its exact visual (avoid two identical pathway diagrams across
   pages).
4. **CTA** — the existing "ask your instructor or a faculty moderator" note,
   kept as real (non-fabricated) guidance text, styled as a `Card` callout.

### Project detail (`projects/[slug]/page.tsx`, no reference screen) — extrapolated
Primary audience: employers (this is the actual evidence artifact) +
prospective students.

1. **Hero** — `project.title` as h1, `project.summary` as lede, `pillars`
   rendered as `Badge` chips (tone neutral), `technologies` as tag chips,
   `coverImage` as a framed hero image (same treatment as About's photo
   frame) if present.
2. **Stat strip** — small `StatTile`-style row: contributor count, technology
   count, and `publishedDate` (formatted) — all real, derived from the doc
   already fetched, no extra query.
3. **Problem addressed** — `project.problem` richText, prose column.
4. **Student contributors** — reuse a compact `StudentCard` (no `href` per §6
   R3, or linked if that gap is resolved) per `project.contributors`.
5. **Outcomes** — `project.outcomes` richText, prose column.
6. **Artifacts** — `project.artifacts[]` as a list of `Badge`/link chips
   (label + external link icon), not buried in a plain `<ul>` as today.
7. **CTA** — "See more projects" tertiary link back to `/projects`.

---

## 4. Responsive & accessibility

**Grid breakpoints** (mobile-first, single column always the floor):
- Card grids (Projects/Blog/Students): `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
- 3-up info panels (Core Principles, Partner offers): `grid-cols-1 md:grid-cols-3`.
- `StepItem` rows (4 or 5 across): `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (Partner, 4 steps per §3) — keep flexible for a 5-step future case (`lg:grid-cols-5`).
- About's pathway circles (4-up): `grid-cols-2 sm:grid-cols-4`.
- Partner form field rows (2-up): `grid-cols-1 sm:grid-cols-2`.

**Fixed-nav offset**: standardize once, not per-page. Add the offset to the
shared shell (`src/app/(frontend)/layout.tsx`'s `<main>`, e.g. `pt-24`) rather
than repeating `paddingTop` per page as the raw screens do (they use
inconsistent 96/128px values) — one accountable place, one value (`space-24`
token = 96px, matching header height + breathing room).

**Mobile nav** (no reference — screens only show desktop): below `md`, hide
the inline nav links, show the crest + a `menu` Material Symbol icon button.
Tap opens a full-width dropdown/off-canvas panel directly under the fixed
header — `bg-surface-page` with the same `backdrop-blur`, stacked nav links
(`flex flex-col`), a visible `close` icon, closes on link-click/Escape/tap-
outside. Implemented as an isolated `MobileNav` **[Client]** component (focus
management for a11y) fed the static `NAV_LINKS` array as a prop — no data
fetching inside it, keeping `SiteHeader` itself a Server Component.

**Color-contrast checklist** (verify with the real axe run at implementation
— acceptance criteria requires an axe-clean bar; don't ship on my estimate
alone):
- `brand-gold-ink` (#261a00) on `brand-gold` (#fbbc00) — primary buttons: very
  high contrast, low risk.
- Gold text/icons on `brand-ink`/`brand-navy-panel` — eyebrow chips, CTA
  circles: high contrast, low risk.
- `rgba(255,255,255,.7)` body copy on `brand-ink` (Partner hero lede) —
  likely passes but **must be verified**; if it's borderline, bump to `.8`
  opacity or use `text-inverse-muted` at full opacity instead of an ad-hoc
  rgba.
- `text-muted` (`#5f5e5e`) on `surface-page` (`#fcf9f8`) — mid-gray body/meta
  text: likely passes AA for normal text but **flag as boundary**, especially
  at `text-caption`/`text-micro` sizes; consider bumping the smallest sizes to
  `text-body-sm` where they carry real content (not pure decoration).
- Footer `text-inverse-muted` (`#9ca3af`) on `brand-ink`: verify, and
  consider not going below `text-caption` (12px) in the footer for
  legibility even though WCAG's size-based leniency wouldn't strictly require it.
- Status pill pairs (green/blue/amber -100 bg / -800 text): standard,
  well-trodden combinations — low risk.

---

## 5. Font loading UX

- **Inter + Noto Serif**: `next/font/google` (self-hosted at build time per
  the locked decision — no runtime Google Fonts CDN call). Load once in
  `src/app/(frontend)/layout.tsx`, exposing CSS variables (e.g. `--font-inter`,
  `--font-noto-serif`) via each font's `variable` option, applied as a
  className on `<html>` or `<body>`. Map them in `@theme` (§2) to `--font-sans`
  / `--font-display` so every existing `font-sans`-implicit element and every
  new `font-display` usage picks them up without a FOUT — `next/font`
  auto-generates fallback-font size-adjust metrics, which is what actually
  prevents CLS (not just `font-display: swap`).
- **Material Symbols Outlined** — my preference (spec leaves the final call
  to the architect): also self-host via `next/font/google` (it's indexed in
  the same Google Fonts catalog `next/font/google` draws from), for the same
  self-hosted/no-runtime-CDN consistency as the two text faces. The
  `FILL`/`wght` axis animation used for hover-fill icon states is plain CSS
  (`font-variation-settings`) applied at the component level — it's
  independent of *how* the font file is loaded, so self-hosting doesn't
  constrain the hover interaction. **Tradeoff to record**: if the variable-font
  axis range next/font exposes for this specific family proves restrictive
  (icon fonts are a less common next/font use case than text faces), CDN
  `<link>` in `<head>` is an acceptable fallback per the spec's own hedge —
  architect confirms after a quick spike.
- No layout-shift flash of unstyled icon glyphs: render the
  `material-symbols-outlined` span with a fixed inline `width`/`height` (or
  `min-width`) matching the glyph's box so text doesn't reflow if the icon
  font's own load lags slightly behind text fonts.

---

## 6. Risks / open questions

**R1 — Projects has no lifecycle-status or sector-category field.**
`Projects` (`src/collections/Projects.ts`) has `pillars` (Build/Engage/Publish)
and `technologies`, but nothing resembling the screen's status pill
(Completed/In Progress/Seeking Team) or sector category (Non-Profit Sector,
FinTech Startup, etc.), and only a single `publishedDate` (not a start/end
range for the "timeline" slot). **Recommendation**: v1 `ProjectCard` omits the
status pill entirely (spec's "Content model impact: None" backs this — no
schema change this pass) and reinterprets "category" as the humanized
`pillars` value and "icon" as a deterministic pillar→glyph mapping
(build→`code`, engage→`diversity_3`, publish→`auto_awesome`) rather than
fabricating sector/status data. Flag a real `status` select field as a
plausible *future* content-model change, not this one. **Needs PM
confirmation** — this measurably changes what the Projects grid communicates
vs. the reference screen.

**R2 — About global has no structured fields for Core Principles / pathway / Franklin block.**
`src/globals/About.ts` is just `heading` + `body` (richText) + optional
`facultyModeratorNote` (richText) — there's no array field for the three
principle cards or four pathway stages the screen shows as discrete,
icon-tagged items. Treating them as **fixed structural copy** (not
CMS-driven) keeps this pass schema-free, and they map naturally onto
CLAUDE.md's own fixed Build/Engage/Publish vocabulary — but it does mean
faculty can't edit that section's wording without a code change, unlike the
rest of About. **Needs PM/architect confirmation** on whether that's
acceptable for this pass, or whether a small, clearly-scoped field addition
(e.g. a `corePrinciples` array) should be raised as a fast-follow spec instead.

**R3 — No detail routes for Students or Blog.**
CLAUDE.md's documented page list is Home/About/Projects (list+detail)/
Students/Blog/Partner/Get Involved — no `/students/[slug]` or `/blog/[slug]`.
`StudentCard` and `BlogCard` are visually card-shaped, hover-lift,
"click me" affordances in the reference screens, but there's nowhere real to
click through to today. **Recommendation for this pass**: render both
without `href` (no false affordance, no hover-lift, since Card's hover-lift is
conditioned on being a link per §1). Flag `/students/[slug]` and
`/blog/[slug]` as a plausible fast-follow, not part of this presentational
restyle (adding routes is arguably beyond "presentational only," even though
it reuses existing fields) — **PM confirms scope**.

**R4 — StudentCard's `tag` (outcome type) and `quote` slots have no data source.**
Profiles (`src/collections/Profiles.ts`) has no "New Role/Career Change/
Promotion" outcome field and no pull-quote field. Substituting `profileType`
(a real select field: Student/Team/Faculty/Alum) for the `tag` slot is a clean
fit. The `quote` slot has no honest substitute — recommend omitting it in v1
rather than synthesizing one from `bio` (extracting a "quote" from prose text
risks misrepresenting what a student actually said). Flag a real `quote`/
short-testimonial field as a future Profiles addition if this pattern is
wanted — **out of scope for this pass** per the spec's content-model
constraint.

**R5 — Partner's StatTiles are the exact fabricated-metric problem the spec's Reconciliation section calls out.**
The source's "100% Student Driven" / "50+ Projects Shipped" are sample
marketing stats, not real numbers. Recommend replacing with real,
CMS-derived counts (e.g., live `totalDocs` from Projects/Profiles, same
pattern proposed for Home in §3) or dropping the stat-tile sub-section
entirely on Partner if no real number reads well there. **PM decides** which.

**R6 — Partner intake form has no wired submission.**
CLAUDE.md/current `partner/page.tsx` already flags the intake form as a later
pass ("A partner intake form is coming soon"). This restyle should render the
full visual form (matches the screen, gives the page credibility) but
**should not silently accept submissions into a void** — either keep the
submit button disabled with the existing "coming soon" copy retained
alongside it, or (if the architect/PM wants to pull the wiring into this
pass) note that it's a `PartnerOpportunities` create action gated by
`isAuthenticated` today (`src/collections/PartnerOpportunities.ts`) and would
need an access-control decision (a public create path) that's arguably
outside "presentational only." **Flag for explicit scope decision.**

**R7 — About hero's inline serif-italic emphasis has no markup source.**
`about.heading` is a plain `text` field — the screen's headline treatment
(specific words set in italic mid-sentence) requires either rich text on the
heading (a schema change) or a convention where editors mark emphasis inline
in `about.body`'s richText and the page pulls the *first* paragraph of body
into the hero position instead of using `heading` as literal h1 text. Recommend
the latter (no schema change): render `about.heading` as the eyebrow-adjacent
plain h1, and let any italic emphasis live naturally in the richText body
copy below it, rather than trying to force italics into the h1 itself.
**Needs architect sign-off** since it changes how the hero maps to the
existing field, not just its styling.

**R8 — Blog's newsletter capture panel has no backend.**
No email-subscription collection or integration exists anywhere in the repo.
Recommend cutting the newsletter bento card from v1 rather than shipping a
form that appears functional and silently does nothing (a credibility bug,
not just a missing feature) — or, if the visual "completeness" of the 3+1
grid rhythm matters to the PM, replace it with a static, honestly-labeled
callout (e.g., "Follow along" linking to a real existing channel, if one
exists) instead of an email `<input>`. **PM decides.**

**Non-blocking notes:**
- The crest logo PNG (`assets/logo/kite-key-crest.png`) referenced throughout
  the readme **does not exist anywhere in this repo** — only the reference
  docs (`readme.md`, tokens, screens) were imported, no `assets/` directory
  came with them. Someone (user/PM) needs to supply the actual PNG before the
  header/footer/acceptance-criteria item ("crest logo asset is vendored") can
  ship; until then, implementer needs a placeholder plan (e.g., a text
  wordmark lockup that upgrades cleanly once the asset lands).
- `tailwind.config.ts`'s current `ink-*`/`accent-*`/`signal-*` scale and its
  `darkMode: 'class'` setting are fully retired per the spec's locked
  decision to drop ad-hoc dark mode — confirm the architect's plan explicitly
  deletes rather than leaves it dangling unused.

---

## Summary for the PM

**Component list (11 new, 3 refactored):** Button, Badge, Card, ProjectCard,
BlogCard, StudentCard, IconTile, StatTile, StepItem, FilterPill, ViewToggle
[Client], Pagination, Input/Select/Textarea — plus refactors of SiteHeader
(+ new MobileNav [Client]), SiteFooter, PageContainer. `entity-card.tsx` is
retired, not kept.

**Biggest data-mapping risks, ranked:**
1. **R1** — Projects has no status/category/timeline-range field the
   ProjectsScreen's card design assumes; I've proposed reinterpreting around
   real fields (pillars, technologies) rather than fabricating, but that
   visibly changes what the grid communicates vs. the reference screen.
2. **R3** — Students and Blog cards read as clickable in the source but
   there's no detail route for either today; recommend non-linked cards for
   this pass and flag the routes as a fast-follow.
3. **R5/R8** — the design system's own sample stats and newsletter capture
   are exactly the kind of thing kk-voice's no-fabrication rule exists to
   catch; I've proposed real-data substitutes or honest omission.
4. **R2/R7** — About's hero-italic and Core-Principles/pathway sections don't
   have matching structured fields; proposed as fixed structural copy this
   pass rather than a schema change.

**Decisions I need from you (PM) before/at plan approval:**
- Confirm R1's reinterpretation (pillars-as-category, no status pill) is
  acceptable, or whether a `status` field should be raised as an in-scope
  schema addition instead.
- Confirm R3: ship Students/Blog cards non-linked this pass, or pull
  `/students/[slug]` + `/blog/[slug]` into scope now.
- Confirm R6: Partner form renders but stays unwired (disabled submit +
  existing "coming soon" copy) vs. wiring it now (which touches access
  control, arguably beyond "presentational only").
- Confirm R8: cut the newsletter panel vs. replace with an honest static
  callout.
- Sign off on the crest-logo gap (no asset in-repo yet) and the placeholder
  plan until it's supplied.
