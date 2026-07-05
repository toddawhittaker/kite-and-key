# Kite & Key IT — Design System

## What this is

**Kite & Key IT** is a student-driven IT consultancy operating as part of
**Franklin University** (Columbus, Ohio). Students work in supervised,
apprenticeship-style teams delivering real, live technology projects —
web apps, data/cloud migrations, cybersecurity audits — for nonprofits,
small businesses, and civic organizations, under the oversight of faculty
and industry veterans. The site positions the org as a "living laboratory"
bridging academic theory and professional practice.

Products / surfaces represented here:
- **Marketing website** — a five-page brochure site: About, Projects,
  Students, Blog, Partner With Us (a Home/index page was referenced in
  every nav bar and footer but not provided — see Caveats).

No app, dashboard, or authenticated product was provided — this is a
public-facing marketing site only.

## Sources

- `uploads/about.html` — About page (mission narrative, core principles, "success ecosystem" pathway diagram, Franklin affiliation)
- `uploads/blog.html` — Blog index ("From the Field") — filterable post grid, newsletter bento card, pagination
- `uploads/partner.html` — Partner With Us — offer cards, audience list, 5-step process, intake form
- `uploads/projects.html` — Projects portfolio grid with status badges and category filters
- `uploads/students.html` — Student success stories grid with filters and view toggle

These were flat, static HTML exports (Tailwind CDN + inline config), not a
live codebase or Figma file — no repo URL or Figma link was supplied. All
five files share one identical Tailwind theme config (color roles, font
families, radii), which is the source of truth for every token in this
system. Treat the values in `tokens/*.css` as extracted verbatim from that
shared config, not reinterpreted.

## Caveats / open questions for you

- **No Home/index page was provided.** Every page's nav links to
  `index.html` and the design implies a homepage exists, but its content
  was never included. The UI kit's `index.html` therefore recreates the
  five given pages behind a page switcher — it does not invent a homepage.
- **A logo crest was later supplied by the user** (`assets/logo/kite-key-crest.png`)
  — a navy/white/gold shield split into a kite and a key with circuit-trace
  detailing. It was not present in the original five source pages (which
  render a plain serif wordmark), but it is now the system's official mark.
  See `guidelines/brand-wordmark.html` for horizontal/stacked lockups, and
  `assets/README.md` for details.
- **No local font files were provided.** Noto Serif, Inter, and Material
  Symbols Outlined are all pulled from Google Fonts' CDN in every source
  page. `tokens/typography.css` loads the same CDN URLs rather than
  substituting a different family — flag if you'd rather vendor the actual
  font files for offline use.
- All photography in the source pages is stock imagery from a placeholder
  CDN (`lh3.googleusercontent.com/aida-public/...`) — not owned brand
  photography. The UI kit keeps a couple of representative frames but you
  should swap in real photos before shipping anything externally.

---

## Content fundamentals

**Voice:** confident, mission-forward, slightly academic-editorial — reads
like a university consultancy annual report, not a startup landing page.
Sentences are complete and a little long; there's no chat-bot casualness.

- **Point of view:** "We" throughout — "We believe...", "We seek partners
  who...", never a second-person "you're going to love this." The reader
  is addressed directly only in CTAs ("Tell us about your organization").
- **Framing device:** the org repeatedly frames itself in metaphor —
  "living laboratory," "launchpad," "digital atelier," "bridging the gap
  between theory and mastery." Nearly every hero headline uses a
  bridge/gap/pathway metaphor connecting academia to industry.
- **Casing:** Title Case for headings and nav labels ("Partner With Us,"
  "Core Principles"); eyebrow/label text is small, bold, and
  **UPPERCASE with wide letter-spacing** ("OUR MISSION," "THE FOUNDATION
  OF KITE & KEY," "FILTER BY:").
  Example — eyebrow: `<span class="uppercase tracking-widest">The Foundation of Kite & Key</span>`
- **Italics as emphasis, not slang:** a headline word or short phrase is
  set in serif italic for lyrical emphasis — *"theory"* and *"mastery,"*
  *"Academic Excellence."* Never used for sarcasm or asides.
- **No emoji anywhere.** All iconography is the Material Symbols glyph
  set (see Iconography below) — emoji do not appear in copy or UI.
- **Numbers do real work:** stats are concrete and specific — "50+
  Projects Shipped," "100% Student Driven," "3 business days," "6
  months" — never vague ("many," "tons of").
  Example: *"From codebase to lead architect in six months."*
- **Headlines lead with the human outcome, subheads with the mechanism.**
- **CTAs are direct and low-pressure**, phrased as an action the reader
  takes: "Send Us Your Project Idea," "Start a Partnership," "Join the
  Pathway" — never "Get Started Now!!" or scarcity language.
- **Tone stays warm even when talking business.**

> **REPO NOTE — voice reconciliation:** this readme's marketing framing
> ("consultancy," sample stats like "50+ Projects Shipped") is adopted only
> for its *tone mechanics* (eyebrow labels, serif-italic emphasis, no emoji,
> concrete numbers, warm-professional register). On *substance*, the repo's
> `.claude/skills/kk-voice` remains authoritative: partner copy stays
> **bounded / faculty-overseen**, and **no fabricated** student names,
> projects, or metrics ship. Do not copy the sample copy in `ui_kits/*` or
> the source pages verbatim — pages render real CMS content.

---

## Visual foundations

**Overall vibe:** editorial, university-press, quietly confident — closer
to a design-forward nonprofit annual report than a SaaS product site.
Warm off-white paper tone, near-black navy ink, one single gold accent
used sparingly and deliberately. Generous whitespace, serif display type,
soft photography — never loud, never gradient-heavy.

- **Color:** built on a full M3 role system (`tokens/colors.css`) but used
  with restraint — in practice only three colors carry the design:
  **near-black navy** (`--brand-ink`, `#041627`), **warm off-white**
  (`--surface-page`, `#fcf9f8`), and **one gold accent** (`--brand-gold`,
  `#fbbc00`) reserved for CTAs, active nav states, underlines, and small
  icon fills. Status pills borrow standard green/blue/amber
  (success/info/pending) only inside the Projects grid.
- **Type:** Noto Serif for every headline/h1–h4 (often 60–72px on hero
  sections), Inter for all body copy, labels, nav. Serif italic is a
  constant inline emphasis device inside otherwise-roman headlines.
  Headline tracking is slightly tightened (~-0.02em); eyebrow labels are
  the inverse — small, bold, uppercase, very widely tracked (~0.2em).
- **Spacing:** big vertical section rhythm — 80–96px (`py-20`/`py-24`)
  between major sections, `max-w-7xl` (1280px) content well with 32px side
  gutters on every page. Cards breathe internally (`p-8`–`p-12`).
- **Backgrounds:** flat color only — no photographic full-bleed, no
  patterns. Only decoration: a very low-opacity (5–10%) radial gradient/
  blurred blob behind a hero/CTA, plus the occasional oversized ghost
  numeral (partner steps). Sections alternate `--surface-page` and
  `--surface-sunken` — never more than two flat tones per page.
- **Imagery:** stock photography, cropped to soft aspect ratios (4:5,
  16:10), skewed cool/neutral and frequently desaturated (grayscale +
  multiply on the About hero) so photography never competes with
  ink/gold. No grain, no heavy filters.
- **Corners:** `4px` default (buttons, inputs, tags), `8px` (`lg`, most
  cards/panels), `12px` (`xl`, hero image frames), `full` pill radius for
  buttons, filter chips, badges, icon/avatar circles. Nothing sharp,
  nothing exceeds 12px except explicit pills.
- **Cards:** flat fill (`surface-container-lowest`, pure white on the
  off-white page), no border at rest (or a hairline `outline-variant/10`
  on project cards only), `rounded-lg`, no shadow at rest. Shadow + a
  slight upward translate (`hover:-translate-y-2`) appear only on hover —
  elevation is an interaction cue, not a resting signal.
- **Buttons:** solid gold fill + dark ink text = the one primary action
  color; a dark-navy-container button = secondary; text-only with an
  animated arrow (`→` translates right on hover) = tertiary/link. No
  outline-only buttons in source.
- **Hover states:** color-based for links/nav (`text` → gold); cards lift
  and gain soft shadow; images inside cards scale `1.05` inside an
  `overflow-hidden` frame; icon tiles go low→full opacity or invert to
  filled navy.
- **Press states:** buttons scale down (`active:scale-95`) — the only
  press feedback.
- **Borders:** hairline only, low-contrast — `outline-variant` ~10% on
  project cards, `border-t` hairlines between footer/content sections. No
  colored borders, no left-border accent cards.
- **Shadow:** a single soft, warm-black-tinted elevation everywhere —
  `0 32px 64px -12px rgba(4,22,39,.04–.08)`. No hard/tight/inner shadows.
- **Glass/blur:** the top nav is the only translucent surface —
  `backdrop-filter: blur(12px)` over ~80%-opacity surface, fixed to the
  viewport top. No blur/transparency elsewhere.
- **Animation:** minimal — 200–500ms color/opacity/transform transitions
  on hover only. Standard ease, no spring/bounce, no scroll reveals, no
  ambient loops.
- **Layout:** one fixed element — the glass top nav. Everything else
  scrolls inside a consistent `max-w-7xl` centered well. Grid-based
  (`md:grid-cols-2/3`, `lg:grid-cols-5` for numbered steps).

## Logo

The official mark is a crest (`assets/logo/kite-key-crest.png`, supplied by
the user): a shield split into a gold-and-navy kite (left) and a gold key
(right), each threaded by a circuit-trace line, flanked by gold laurel
branches, with a small three-node network glyph at the base. Academic/
heraldic (nodding to Franklin University) while the circuit traces signal
the technology focus. Use the PNG directly.

**Tagline:** "Apply. Solve. Advance." — three terse verb-first imperatives
tracing the student journey (classroom theory → live client work → career
outcome), set in small caps under the wordmark.

`guidelines/brand-wordmark.html` shows all four lockups: horizontal and
stacked, each with and without the tagline.

## Iconography

- **System:** Google's **Material Symbols Outlined** variable icon font
  (`FILL, wght` axes animated 0→1 for outline ⇄ filled).
  - Icon names used across the five pages: `work`, `trending_up`, `groups`,
    `school`, `code`, `stars`, `rocket_launch`, `account_balance`,
    `arrow_forward`, `chevron_right`, `chevron_left`, `account_tree`,
    `verified_user`, `diversity_3`, `check_circle`, `terminal`, `database`,
    `security`, `cloud`, `language`, `shield`, `smart_toy`, `handshake`,
    `auto_awesome`, `grid_view`, `view_list`, `share`, `bookmark`.
- **No SVG sprite, no PNG icon set, no other icon font.** No emoji. No
  unicode glyphs as icons — every icon is a named Material Symbols ligature
  inside `<span class="material-symbols-outlined">`.
- Icons sit inside colored tiles/circles (see `IconTile`) at two shapes —
  small rounded-square badges and large circles — never bare at large
  sizes; bare/unboxed icons appear only small and inline (share, bookmark,
  chevrons, arrow_forward).

---

## Index / manifest

```
styles.css                  → root stylesheet, @imports tokens/*
tokens/
  colors.css                 → M3 role palette + brand-* semantic aliases
  typography.css              → Noto Serif / Inter / Material Symbols, type scale
  spacing.css                  → spacing / radius / shadow / motion scale
guidelines/                  → 13 foundation specimen cards (Colors, Type, Spacing, Brand groups)
components/
  forms/        Button, Input, Select, Textarea
  feedback/     Badge
  navigation/   TopNavBar, Footer, FilterPill, Pagination
  content/      Card, ProjectCard, BlogCard, StudentCard, IconTile, StatTile, StepItem
ui_kits/
  marketing-site/  index.html (About/Projects/Students/Blog/Partner, page-switcher)
```

### Components

- **forms/** — `Button` (primary/dark/text variants), `Input`, `Select`, `Textarea`
- **feedback/** — `Badge` (success/info/pending/neutral/gold/glass tones)
- **navigation/** — `TopNavBar` (fixed glass nav), `Footer` (4-column dark footer), `FilterPill` (category filter chip), `Pagination` (numbered pager)
- **content/** — `Card` (generic hover-lift panel), `ProjectCard`, `BlogCard`, `StudentCard`, `IconTile` (boxed/circled icon), `StatTile` (big-number block), `StepItem` (numbered ghost-numeral process step)

Every component maps to a real recurring pattern in the five source pages —
none were invented. No Toast/Tooltip/Tabs/Dialog exist because the source
never used them.
