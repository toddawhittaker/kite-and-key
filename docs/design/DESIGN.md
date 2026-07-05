# Kite & Key IT — Design System (in-repo reference)

This is the **authoritative, in-repo** design reference for the Kite & Key IT
site — build on-brand from this file without re-fetching or re-reading the
imported source material in `docs/design/reference/` each time. That
directory is the one-way-imported design system this page was built from
(readme + tokens + sample `ui_kits/marketing-site/*.jsx` screens) — treat it
as historical reference, not buildable code, and not a second source of
truth for tokens (this file + `globals.css` are canonical).

Single light editorial theme — **no dark mode**. Tailwind v4, CSS-first:
every token lives in `src/app/(frontend)/globals.css`'s `@theme` block.
There is no `tailwind.config.ts`.

## Token table (canonical)

### Colors / surfaces / text

| Alias | Utility | Value |
|---|---|---|
| brand-ink | `bg-brand-ink` / `text-brand-ink` | `#041627` |
| brand-navy-panel | `bg-brand-navy-panel` | `#1a2b3c` |
| brand-gold | `bg-brand-gold` / `text-brand-gold` | `#fbbc00` |
| brand-gold-ink | `text-brand-gold-ink` | `#261a00` |
| brand-gold-hover | `hover:bg-brand-gold-hover` | `#b88900` |
| surface-page | `bg-surface-page` | `#fcf9f8` |
| surface-card | `bg-surface-card` | `#ffffff` |
| surface-card-tint | `bg-surface-card-tint` | `#f6f3f2` |
| surface-sunken | `bg-surface-sunken` | `#f6f3f2` |
| surface-sunken-strong | `bg-surface-sunken-strong` | `#eae7e7` |
| text-body | `text-body` | `#44474c` |
| text-body-strong | `text-body-strong` | `#1b1c1c` |
| text-muted | `text-muted` | `#5f5e5e` |
| text-inverse | `text-inverse` | `#fcf9f8` |
| text-inverse-muted | `text-inverse-muted` | `#9ca3af` |
| border-hairline | `border-hairline` (use `/10` for the soft variant) | `#c4c6cd` |
| status success | consumed **inside `Badge`** only | bg `#dcfce7` / text `#166534` |
| status info | consumed **inside `Badge`** only | bg `#dbeafe` / text `#1e40af` |
| status pending | consumed **inside `Badge`** only | bg `#fef3c7` / text `#92400e` |

Status colors are never exposed as ad-hoc utility combos outside `Badge` —
that's the one place status hues are allowed to appear.

### Radius / shadow / type / font

| Token | Utility | Value |
|---|---|---|
| radius sm | `rounded-sm` | buttons, inputs, tags (0.25rem) |
| radius lg | `rounded-lg` | cards, panels (0.5rem) |
| radius xl | `rounded-xl` | hero image frames (0.75rem) |
| radius full | `rounded-full` | pills, avatar/icon circles |
| shadow-card | `shadow-card`, `hover:shadow-card` | `0 32px 64px -12px rgba(4,22,39,.08)` |
| shadow-card-soft | `shadow-card-soft` | `…/.04` |
| shadow-pop | `shadow-pop` | `0 25px 50px -12px rgba(0,0,0,.25)` (IconTile `active`) |
| headline font | `font-display` | Noto Serif (self-hosted, `next/font/google`) |
| body font | ambient (Preflight `font-sans`) | Inter (self-hosted, `next/font/google`) |
| icon font | `.material-symbols-outlined` | Material Symbols Outlined (self-hosted, `next/font/local`, committed woff2) |
| headline tracking | `tracking-tight` (applied on h1–h4 in base layer) | `-0.02em` |

Type sizes use **stock Tailwind v4 utilities** — no custom size tokens:
72px `text-7xl`, 60px `text-6xl`, 48px `text-5xl`, 36px `text-4xl`, 24px
`text-2xl`, 20px `text-xl`, 16px `text-base`, 14px `text-sm`, 12px `text-xs`.

### Composite utilities

- `eyebrow` (`<span class="eyebrow">`) — small, bold, uppercase, very wide
  letter-spacing (`0.2em`). Section labels, e.g. "Our Mission."
- `type-emphasis` (`<em class="type-emphasis">`) — `font-display italic`,
  inline serif-italic emphasis inside an otherwise-roman headline.

## Component inventory + usage rules

All in `src/components/`. Server Components unless noted **[Client]**.

- **`Icon`** — thin `.material-symbols-outlined` wrapper (`name`, `filled?`,
  `size?`). Use for every icon; never emoji or a raw unicode glyph.
- **`Button`** — `primary` (gold fill) / `secondary` (navy fill) /
  `tertiary` (text + animated arrow). No outline-only variant.
- **`Badge`** — `tone` × `variant('status'|'eyebrow')`. Status tones
  (success/info/pending) are Badge-internal only.
- **`IconTile`** — boxed/circled icon primitive (`shape`, `tone`, `size`).
  Every boxed icon on the site (Core Principles, Partner offers, About's
  pathway, Home's pillar cards) goes through this, not ad-hoc markup.
- **`StatTile`** — big-number block. `value` must always be real,
  CMS-derived (`src/lib/stats.ts`'s `getSiteStats()`), never invented.
- **`StepItem`** — numbered process step with an oversized ghost numeral.
- **`Card`** — generic flat panel. `hoverLift` only when the caller wraps it
  in a `<Link>` — lifting a non-interactive panel is a false affordance.
- **`ProjectCard`** — the one card type that keeps a resting hairline
  border; always linked (`/projects/[slug]`); no status pill (no lifecycle-
  status field on Projects — a real `status` field is a plausible fast-
  follow, not this pass).
- **`BlogCard`** / **`StudentCard`** — non-linked in this pass (no
  `/blog/[slug]` or `/students/[slug]` route exists yet); hover-lift only
  activates if a future pass adds `href`.
- **`FilterPill`** — a styled `<Link>` (`href`, `active`), not a stateful
  button — filters are server-driven.
- **`Pagination`** — numbered `<Link>`s preserving other `searchParams`.
- **`Input` / `Select` / `Textarea`** — labeled form field wrappers, gold
  focus ring.
- **`ViewToggle`** **[Client]** — Students' grid/list presentation toggle,
  local state only, no refetch.
- **`MobileNav`** **[Client]** — header's below-`md` disclosure panel.

## Rules

- **Tokens over raw hex.** Every color/radius/shadow value comes from the
  `@theme` block above — never a literal hex or px value in a component.
- **Reuse components.** Check this inventory before writing new markup;
  most visual patterns (boxed icons, stat blocks, process steps, filter
  chips) already have a purpose-built component.
- **Status colors only inside `Badge`.**
- **Server-driven filters.** Category/tag/program filters and pagination
  are `searchParams` + `<Link>`, not client `useState` — keeps pages Server
  Components, works without JS, and is bookmarkable. The only client islands
  are `MobileNav` and `ViewToggle` (pure presentation, no data).
- **One elevation, hover-only.** `shadow-card` is the only shadow in the
  system, and it (plus `-translate-y-2`) appears on hover, never at rest.
- **No fabricated content.** Stat tiles, testimonials, and metrics render
  real CMS data or are omitted — see `kk-voice`'s no-fabrication rule, which
  is authoritative over the reference system's sample marketing copy.

See `docs/design/reference/` for the original imported source (readme,
token CSS, sample screens) if you need the full rationale behind a value.
