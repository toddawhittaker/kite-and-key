# UX/Design plan: Scaffold monorepo

- **Slug:** scaffold-monorepo (design contribution)
- **Author:** designer
- **Companion to:** architect's `docs/plans/scaffold-monorogo.md` (collections field model, routing, seed, commands — deferred to that doc; this doc assumes those collections exist and focuses on how they're presented, both in the admin and on the public shells)

This is a **foundation pass**: a minimal, credible baseline the implementer can build in one shot, not a finished brand system. Every token, label, and layout below is deliberately restrained — enough to prove the content→render pipeline works and to keep non-technical editors oriented, not to finish the site's visual identity.

---

## 1. Editor experience (Payload admin) — the priority

The audience for `/admin` in this pass is a **non-technical student editor or faculty moderator**, not a developer. They should be able to open a collection, understand what's being asked without external documentation, and publish something credible without guessing.

### 1.1 Admin sidebar grouping

Payload supports `admin.group` per collection to cluster them in the sidebar nav. Group using the site's own vocabulary — this is a chance to reinforce Build/Engage/Publish inside the tool editors use every day, not just on the public site.

```ts
// payload.config.ts (excerpt — collections array order also follows this grouping)
Projects:            admin.group: 'Build'
PartnerOpportunities: admin.group: 'Build'   // intake feeds Build work
Events:              admin.group: 'Engage'
Posts (blog):        admin.group: 'Publish'
Profiles:            admin.group: 'Publish'  // profiles ARE the visible evidence of a student
Media:               admin.group: 'Publish'  // supporting asset library for the above
Users:               admin.group: 'Admin'    // not shown to editor role, see access notes below
```

Rationale for Profiles under Publish rather than a fourth group: CLAUDE.md frames the three pillars as the whole taxonomy; a student profile is itself a published artifact (bio, links, contributions), so it belongs with the other visible-evidence collection (Posts) rather than inventing an "Admin/People" group that dilutes the three-pillar vocabulary. `Users` and any future system collections get a plain `Admin` group so they're visually separated from content collections — editors should never wonder whether "Users" is where they log a student's project work (that's `Profiles`).

### 1.2 Collection labels

Use the plural human name as the sidebar label (Payload default from `slug` is fine if slugs are already human words), but set explicit `labels.singular` / `labels.plural` so nothing renders as a camelCase slug:

| Collection | `labels.singular` | `labels.plural` |
|---|---|---|
| `projects` | Project | Projects |
| `posts` | Blog Post | Blog Posts |
| `profiles` | Student Profile | Student Profiles |
| `events` | Event | Events |
| `partner-opportunities` | Partner Opportunity | Partner Opportunities |
| `media` | Media | Media |
| `users` | User | Users |

### 1.3 `useAsTitle`

Every collection needs a title field editors will recognize in list views and relationship pickers:

| Collection | `useAsTitle` | Notes |
|---|---|---|
| Projects | `title` | e.g. "Regional Food Bank Inventory Migration" |
| Posts | `title` | |
| Profiles | `name` | Not `id` or email — a relationship picker on Projects will show this |
| Events | `title` | |
| Partner Opportunities | `organizationName` | Falls back poorly to a generic "title" — name the org so intake list is scannable |
| Media | `filename` (Payload default) | |

### 1.4 Field descriptions that push toward specificity

This is the highest-leverage design lever in this pass: **the admin.description text is the mechanism by which "credibility comes from specificity" (kk-voice) actually gets enforced**, because the person filling in the field is usually a student, not a marketer. Descriptions should read as coaching, not just a hint about data type. Concrete copy for the fields the spec calls out (architect owns final field list/types; these are the labels + descriptions to attach to whichever fields land):

**Projects**
- `title` — Label: "Project title." Description: "Specific and concrete — name the system or problem, not just the technology. e.g. 'Inventory Tracker for Mid-Ohio Food Collective' rather than 'Web App Project.'"
- `problem` (rich text/textarea) — Label: "Problem addressed." Description: "What real problem or need prompted this project? Write it so someone outside the program understands why it mattered — this is what employers read first."
- `technologies` (array/relationship to a tags list, or multi-select) — Label: "Technologies used." Description: "Name the actual languages, frameworks, platforms, and tools — not categories. e.g. 'PostgreSQL, Next.js, AWS Lambda,' not 'a database and cloud services.'"
- `contributors` (relationship → Profiles, many) — Label: "Student contributors." Description: "Every student who worked on this project. Their profile will link back here — make sure they're added before publishing."
- `outcomes` (rich text or repeater) — Label: "Outcomes & artifacts." Description: "What got built or shipped, what changed as a result, and any links to artifacts (repo, deployed app, writeup, demo video). Concrete outcomes, not 'gained experience.'"
- `pillars` (select, multi) — Label: "Pillar tags." Description: "Which of Build / Engage / Publish does this project represent? Most projects are Build; tag Engage or Publish too if mentorship or a writeup was a core part of the work."
- `partner` (relationship → Partner Opportunities, optional) — Label: "Originating partner opportunity." Description: "Link this to the partner intake record if this project came from one, so the partner-facing story stays connected to the real request."

**Blog Posts**
- `title` — Label: "Post title."
- `author` (relationship → Profiles) — Label: "Author." Description: "The student (or faculty moderator) writing this post. Shows on the public post and links to their profile."
- `body` (rich text) — Label: "Post body."
- `status` (draft/published select, or Payload's built-in draft system) — Label: "Publish state." Description: "Drafts are visible in the admin only. Set to Published when this is ready for the public site — check for placeholder text and broken links first."

**Profiles**
- `name` — Label: "Full name."
- `program` — Label: "Program / concentration." Description: "e.g. 'B.S. Computer Science' or 'M.S. Data Analytics' — helps employers read the profile in context."
- `bio` (textarea) — Label: "Bio." Description: "Two or three sentences in your own voice. Specific interests and what you've worked on read better than general career-goal statements."
- `links` (repeater: label + URL) — Label: "Links." Description: "GitHub, LinkedIn, portfolio site, deployed projects — anything that lets an employer see more of your work."
- `contributions` (relationship, likely auto-populated reverse of Projects.contributors — read-only if so) — Label: "Project contributions." Description: "Populated automatically from Projects you're linked to as a contributor."

**Events**
- `title` — Label: "Event title."
- `type` (select) — Label: "Event type." Description: "Workshop, code review, employer session, or other Engage activity — pick the closest match so the Get Involved page can group these sensibly."
- `date` — Label: "Date."
- `description` — Label: "Description." Description: "What happens at this event and who it's for — prospective attendees should know what to expect before signing up."

**Partner Opportunities**
- `organizationName` — Label: "Organization name."
- `contactName` / `contactEmail` — Label: "Primary contact."
- `projectDescription` (textarea) — Label: "What do you need help with?" Description: "Describe the problem or task in plain terms. This is scoped, faculty-overseen student work, not open-ended consulting — describe something bounded enough for a student team to complete in a term."
- `scopeBoundaries` (textarea) — Label: "Scope & boundaries." Description: "What's explicitly in and out of scope? Bounded, well-defined requests move faster through faculty review."
- `status` (select: submitted/under review/matched/in progress/completed/declined) — Label: "Status." Description: "Tracked by faculty during intake review — not shown publicly."
- `facultyReviewer` (relationship → Users, optional) — Label: "Faculty reviewer." Description: "Faculty member overseeing this opportunity once it's matched to a student project."

### 1.5 Required fields (credibility gate)

To keep bad/thin content from shipping, mark required at minimum:
- **Projects:** `title`, `problem`, `technologies`, `contributors` — a Project without a named problem or contributor isn't credible evidence.
- **Posts:** `title`, `author`, `body`.
- **Profiles:** `name`, `program`.
- **Events:** `title`, `type`, `date`.
- **Partner Opportunities:** `organizationName`, `contactName`, `contactEmail`, `projectDescription`.

Leave `outcomes` on Projects optional but strongly prompted (via description) rather than required — in-progress projects are legitimate content and shouldn't be blocked from saving as a draft; publish-gating (draft/published status) is the better lever than a hard-required field, and is the architect's to wire via Payload's draft system or a status field.

### 1.6 `admin.defaultColumns` for list views

Pick columns that let an editor scan for completeness/staleness at a glance, not just identify a row:

- **Projects:** `title`, `pillars`, `contributors`, `updatedAt`, `status` (if using draft/publish)
- **Posts:** `title`, `author`, `status`, `updatedAt`
- **Profiles:** `name`, `program`, `updatedAt`
- **Events:** `title`, `type`, `date`
- **Partner Opportunities:** `organizationName`, `status`, `contactName`, `createdAt`

### 1.7 Access control note (design-adjacent, defer detail to architect/security-auditor)
The admin nav itself is a design surface: an editor role should not see a `Users` group at all if they have no permission there — hiding inapplicable groups keeps the sidebar legible rather than showing greyed-out things a student editor will wonder about. Flag this as a `admin.hidden` / access-control condition for the architect to wire, not something to solve visually.

---

## 2. Minimal design-token baseline

Restrained, professional, not startup-bright. Support light/dark since Tailwind's `dark:` variant is nearly free to wire now and expensive to retrofit later — but keep the palette small enough that dark mode is a direct token swap, not new design work.

### 2.1 Color

Avoid a saturated "brand blue + gradient" startup look. Lean toward an ink/paper neutral base with a single restrained accent (a deep, slightly desaturated teal/blue reads as institutional-technical without being either "university crest" navy-and-gold or SaaS-gradient). Exact hue is a placeholder the team can swap later — what matters for this pass is the *structure* (neutral scale + one accent + one semantic set), not the specific hex.

```js
// tailwind.config.ts — theme.extend.colors
colors: {
  ink: {
    950: '#0b0d10',   // near-black text, dark-mode page bg
    900: '#14171a',
    700: '#3a4148',
    500: '#5b6570',
    300: '#98a1a9',
    100: '#e4e7ea',
    50:  '#f6f7f8',   // light-mode page bg
  },
  accent: {
    700: '#0f5c5c',   // primary links, buttons, focus rings (dark-on-light)
    500: '#1a7a7a',   // hover state, dark-mode primary
    100: '#e0f0ef',   // subtle backgrounds (tags, highlighted cards)
  },
  signal: {
    // sparingly: status chips (partner-opportunity status, draft/published)
    success: '#2f7a4f',
    warning: '#9a6b1a',
    info:    '#3a628f',
  },
}
```

Usage rule for the implementer: body text/background comes from `ink`, all interactive/brand emphasis comes from `accent`, and `signal` is reserved for status chips only (never body copy or headings) — this keeps the palette from sprawling as more UI gets built later.

Dark mode: use Tailwind's `class` strategy (`darkMode: 'class'`) so it's an explicit toggle later rather than forced by OS preference in this pass; swap `ink.50`↔`ink.950` and `ink.900`↔`ink.100` roles via `dark:` variants on the two or three shell components (header, footer, card) rather than redefining the palette.

### 2.2 Type scale

System-font stack for this pass (no webfont licensing/perf work needed yet) — `font-sans` default is fine. A restrained scale, mapped to Tailwind's existing `text-*` sizes rather than inventing new ones:

| Use | Tailwind class | Notes |
|---|---|---|
| Page H1 | `text-3xl md:text-4xl font-semibold tracking-tight` | One per page |
| Section H2 | `text-2xl font-semibold` | |
| Card title / H3 | `text-lg font-medium` | |
| Body | `text-base leading-relaxed` | |
| Meta/small (dates, tags, byline) | `text-sm text-ink-500 dark:text-ink-300` | |

### 2.3 Spacing rhythm

Default Tailwind spacing scale is sufficient; standardize on a few recurring values so pages feel consistent without a bespoke scale:
- Section vertical rhythm: `py-16` (page sections), `py-8` (sub-sections)
- Container horizontal padding: `px-4 sm:px-6 lg:px-8`
- Card internal padding: `p-6`
- Grid gap for card listings: `gap-6`

### 2.4 Base components (2–4, shape only — implementer builds)

**Header/nav** (`components/site-header.tsx`, server component; nav data can be a static array in this pass — not worth a CMS collection yet):
```
<header class="border-b border-ink-100 dark:border-ink-900">
  <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    <Logo/Wordmark → links to />
    <nav> Home · About · Projects · Students · Blog · Partner With Us · Get Involved </nav>
  </div>
</header>
```
Nav order matches the spec's route list; "Partner With Us" and "Get Involved" are the two calls-to-action so they read visually distinct (e.g., last two, or the last one styled as a solid button) — implementer's call, keep it simple in this pass (plain links are acceptable; do not over-build a mega-menu).

**Footer** (`components/site-footer.tsx`):
```
<footer class="border-t border-ink-100 dark:border-ink-900 mt-16">
  <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-ink-500 dark:text-ink-300">
    Kite & Key IT — Franklin University Computing Sciences & Mathematics
    · link to /admin (or omit; editors know the URL) · placeholder for future contact/social links
  </div>
</footer>
```

**Page container** (`components/page-container.tsx` or a layout convention): `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8`, reused by every route so width/gutters stay consistent without repeating classes.

**Card** (`components/entity-card.tsx`), used for Project and Profile (and Post) list items — one shape, driven by props, not three bespoke components:
```
<article class="rounded-lg border border-ink-100 dark:border-ink-900 p-6 hover:border-accent-500 transition-colors">
  <h3 class="text-lg font-medium">{title}</h3>
  <p class="mt-1 text-sm text-ink-500 dark:text-ink-300">{meta — e.g. contributors, program, or date}</p>
  <p class="mt-3 text-base line-clamp-3">{excerpt/problem/bio}</p>
  <div class="mt-4 flex flex-wrap gap-2">{tags — pillar or technology chips, accent-100 bg}</div>
</article>
```
That's the full component budget for this pass: header, footer, container, card. Do not add a button component system, form component library, or icon set yet — inline Tailwind classes on plain `<button>`/`<a>` are fine for the one or two CTAs this pass needs (e.g., Partner intake form submit).

---

## 3. Public page-shell layout

All routes share `site-header` + `site-footer` + `page-container` from §2.4. Each shell below is structure only; placeholder copy is marked **[PLACEHOLDER]** and must stay generic/instructional per kk-voice (no invented student names, partner names, or metrics). Every page states its primary audience so the implementer knows what question the shell is answering, per CLAUDE.md's audience-first principle — copy polish is a later pass, but the *shape* should already reflect the right audience.

### Home (`/`) — audience: prospective students, secondary: all
```
<Hero>
  H1: [PLACEHOLDER: one-line statement of the mission — Build/Engage/Publish framed as what students DO, not a slogan]
  Sub: [PLACEHOLDER: one sentence — content team to replace before launch]
</Hero>
<PillarSummary> three columns/cards: Build / Engage / Publish
  — each: pillar name, one-sentence description, link to the page that shows evidence of it (Projects / Get Involved / Blog)
</PillarSummary>
<FeaturedProjects> — grid of EntityCard, pulled from Payload (`projects` where featured=true or latest 3)
  heading: "Recent work" [PLACEHOLDER heading text]
  → link: "See all projects"
</FeaturedProjects>
<CTAStrip> two side-by-side calls to action: "Partner With Us" / "Get Involved" linking to those pages
</CTAStrip>
```

### About (`/about`) — audience: prospective students & employers (context-setters)
```
H1: [PLACEHOLDER: "About Kite & Key IT"]
<Body> — [PLACEHOLDER: 2-3 paragraphs — what this is, connection to Franklin CSM programs, the three pillars explained in prose]
<FacultyModeratorNote> — [PLACEHOLDER: short block naming faculty oversight model — supports the "bounded" partner framing before partners even get to that page]
```
This is the one shell in this pass most reasonably static/hardcoded prose rather than CMS-driven (it changes rarely and isn't a list), but per `payload-nextjs` convention, flag to architect whether this should still be a Payload global (singleton) rather than hardcoded JSX — recommend yes, a Payload **global** (`about`) with rich-text body fields, so faculty can edit it without a deploy.

### Projects (`/projects`) — audience: employers (primary), prospective students
```
H1: "Projects" [or PLACEHOLDER wording]
Sub: [PLACEHOLDER: one line framing these as real, scoped work with named problems/tech — this is the employer trust-builder page]
<FilterRow> (optional in this pass, can be deferred) — by pillar or technology tag
<Grid> EntityCard × N, from Payload `projects` collection, each card shows: title, contributor names (small, links to profile), technologies as chips, problem excerpt
<EmptyState> — [PLACEHOLDER: "Projects are being added — check back soon." style message, since a fresh seed may have only 1-2 items]
```

### Students (`/students`) — audience: employers (talent signal), prospective students (peer proof)
```
H1: "Students" [or "Student Profiles"]
Sub: [PLACEHOLDER: framed as evidence of contribution, not a directory — e.g. "the students behind the work on this site"]
<Grid> EntityCard × N, from Payload `profiles`, each card shows: name, program, bio excerpt, link chips (GitHub/portfolio), and a small "Projects: N" or list of linked project titles
```

### Blog (`/blog`) — audience: current students (voice/reflection) & prospective students
```
H1: "Blog" [or "Field Notes" — naming is a later voice pass, keep literal for now]
Sub: [PLACEHOLDER: framed as students writing about real project work — the Publish pillar made visible]
<Grid or List> EntityCard-shaped list items, from Payload `posts` where status=published, each shows: title, author (link to profile), date, excerpt
```

### Partner With Us (`/partner-with-us`) — audience: project partners (primary)
```
H1: "Partner With Us"
Sub: [PLACEHOLDER: must state the bounded framing plainly per kk-voice — e.g. "Scoped, faculty-overseen student projects — not open-ended consulting."]
<HowItWorks> 3-4 step structure: submit → faculty review → matched to a student team → scoped delivery
  [PLACEHOLDER copy per step — keep concrete, no invented examples]
<IntakeForm> — client component, POSTs to create a `partner-opportunities` document (draft/submitted status)
  Fields mirror admin fields from §1.4: organization name, contact name, contact email, project description, scope/boundaries
  Submit button: "Submit opportunity" (not "Get a quote" / "Hire us" — keep it institutional, not sales)
<PastPartnerExamples> (optional, can be deferred if no real data yet) — if included, pull from published Projects with a `partner` link, NOT a separate fabricated list
```
This is the one shell with a real form; keep it a plain, accessible HTML form (labeled inputs, visible focus states using `accent-700` ring) — no need for a multi-step wizard in this pass.

### Get Involved (`/get-involved`) — audience: current students (and prospective, secondarily)
```
H1: "Get Involved"
Sub: [PLACEHOLDER: framed toward current students — how to move from coursework to a project]
<EventsList> — from Payload `events`, upcoming first, grouped or tagged by type (workshop/code review/employer session)
  each item: title, type chip, date, short description
<PathwayNote> — [PLACEHOLDER: short block on how students join a Build project or contribute a Publish post — the "bridge from course to contribution" CLAUDE.md calls out]
```

### Shared list-page pattern
Projects, Students, and Blog all follow the same shape: H1 + one-line audience-appropriate sub, optional filter row, `Grid`/`List` of `EntityCard`, empty-state message. Building `EntityCard` once (§2.4) and reusing it across all three (with different prop mappings) is the key reuse point for the implementer — resist building three separate card components.

---

## Summary of implementer deliverables from this doc
1. `payload.config.ts` (or per-collection config files): `admin.group`, `labels`, `useAsTitle`, field `label`/`admin.description` text, `required` flags, `admin.defaultColumns` — all per §1.
2. `tailwind.config.ts`: `colors.ink` / `colors.accent` / `colors.signal`, `darkMode: 'class'` — per §2.1.
3. `components/site-header.tsx`, `components/site-footer.tsx`, `components/page-container.tsx`, `components/entity-card.tsx` — per §2.4.
4. Seven route shells (`app/(site)/page.tsx`, `about`, `projects`, `students`, `blog`, `partner-with-us`, `get-involved`) matching the structures in §3, fetching from Payload where noted, with clearly-marked placeholder copy.
5. Flag to architect: recommend an `about` Payload global rather than hardcoded About page prose, so faculty can edit without a deploy.
