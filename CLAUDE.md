# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Greenfield. As of this writing the repository contains no code — only this document. The stack below is a **decided target**, not yet scaffolded. When you scaffold, update the "Commands" and "Architecture" sections to reflect reality, and remove this note.

## What this is

Kite & Key IT is the public-facing platform and operating identity for a student-driven applied technology initiative connected to Franklin University's Computing Sciences and Mathematics programs. It is **not merely a marketing website** — it is the visible surface of a career-connected learning model whose deeper purpose is to help students accumulate **credible, portfolio-ready evidence of capability before graduation**.

The site's job is to make student talent, student work, and student professional growth legible to the audiences who most need to see it. Every build decision should be judged against that: does this make real student work more visible, specific, and credible?

### The three pillars

Content and information architecture organize around three pillars. Reuse this vocabulary in code, content models, and copy:

- **Build** — applied technical work: software development, cloud migration, data solutions, cybersecurity support, web modernization, and other *scoped* technology projects.
- **Engage** — the professional/community relationships that make the work valuable: mentorship, code reviews, workshops, employer interaction, collaboration with regional tech professionals.
- **Publish** — the visible evidence students create: project writeups, blog posts, case studies, open-source contributions, conference talks, portfolio artifacts.

### Audiences (each page should serve one primarily)

- **Prospective students** — answer "If I study technology here, what will I actually get to do?" with concrete examples, not program-brochure claims.
- **Employers** — a lightweight talent *signal*: evidence students produce work, solve problems, and engage industry tools. A supporting layer to hiring, not a replacement.
- **Project partners** — a structured intake point for **bounded**, educationally-appropriate projects with faculty oversight. Never promise unrestricted consulting labor.
- **Current students** — a bridge from "I completed a course" to "here is a project I contributed to, the problem, the tech, what I learned, and how I communicate about it."
- **Faculty / moderators** — the people maintaining content and providing oversight.

## Target architecture

Monorepo: **Next.js (App Router) + Payload CMS in the same codebase**, self-hosted, no third-party CMS SaaS.

- **Public site** — Next.js App Router renders the audience-facing pages from CMS content.
- **CMS** — Payload admin (typically at `/admin`) so **non-technical student editors and faculty moderators** can publish and maintain content without touching code or git. Editor experience for these non-technical users is a first-class constraint, not an afterthought.
- **Content is the source of truth.** Pages should be driven by CMS collections, not hardcoded. Treat the site as content-managed from day one — resist building static pages that will later need to become editable.

### Planned content types (Payload collections)

Projects, Blog posts, Student/Team profiles, Events, Partner opportunities, and possibly organizational updates. Model these to capture the *specifics* that create credibility: for a project, that means the problem addressed, technologies used, student contributors, and learning outcomes / artifacts — not just a title and blurb.

### Planned public pages

Home, About, Projects, Students, Blog, Partner With Us, Get Involved. Each targets a different audience while reinforcing the same message: Franklin students do applied technical work that is visible, credible, and connected to professional communities.

## Voice and content principles

These are product requirements, not style preferences — credibility depends on them.

- **Credibility comes from specificity.** Name the kinds of projects, describe the technologies, show artifacts, tell real student stories, make partner engagement concrete. Avoid vague "career readiness" language.
- **Professional but not inflated.** It must not read like a generic startup, a university brochure, or a student club page with nicer graphics. Aim for: serious applied-learning platform — student-centered, employer-aware, community-facing, grounded in real work.
- **"Bounded" is load-bearing** for partner-facing copy and intake. Scoped, faculty-overseen, realistic expectations — never open-ended consulting.

## Agentic workflow

Development runs through a PM-orchestrated pipeline. **You talk only to the root session**, which acts as Product Manager; the specialists are subagents it dispatches (cold context each) and whose results it synthesizes.

Entry point: **`/pm <what you want>`** (`.claude/commands/pm.md`).

Pipeline — two human gates, autonomous in between:
```
/pm → clarify → docs/specs/<slug>.md   ── GATE 1: approve spec
    → architect (+ designer) → docs/plans/<slug>.md   ── GATE 2: approve plan
    → implementer
    → reviewer ∥ tester ∥ security-auditor ∥ devops-reviewer   (parallel; skip what doesn't apply)
    → PM synthesizes findings → implementer fixes → re-review
    → PM ships via gh: branch → PR (from spec/plan/reviews) → CI → merge → report
```

**GitHub / CI-CD.** No dedicated agent — it's split by kind:
- **PR/branch/merge glue** is the PM's job via the `gh` CLI (step 6): feature branch, PR body drafted from the spec + plan + review synthesis, findings optionally posted with `/code-review --comment`, merge only on green + your approval. Pushing/opening PRs/merging are outward-facing — the PM confirms unless you've said to ship autonomously, and never commits to the default branch.
- **CI/CD authoring** is in-scope for the **architect** (plans it) and **implementer** (writes `.github/workflows/*.yml`, migrations, env), reviewed by the **devops-reviewer** — authoring and review stay in separate roles.
- **CI monitoring** is a mechanism, not an agent — `gh pr checks` or a `/loop`, triggered by the PM; red builds route back through the warm-implementer fix loop.

Three cost disciplines keep this from being token-heavy:
- **Triage / right-sizing.** Trivial changes (copy, one-liners) the PM does inline — no spec, plan, or fan-out. `/pm lean …` swaps the four parallel reviewers for one `review-lean` agent (one context-load instead of four); reserve the full fan-out for risky changes.
- **Warm-agent reuse.** The fix/re-review loop continues existing agent instances via `SendMessage` instead of cold-spawning, so they skip re-reading context. Only the *first* spawn per role pays the cold cost.
- **Tight plan files.** A compact `docs/plans/<slug>.md` is what downstream agents read instead of re-exploring the tree — the better the plan, the cheaper everyone after it.

Specialists (`.claude/agents/`), tiered by model:
- **architect** (opus) — spec → technical plan; read-only on code, writes the plan doc.
- **implementer** (sonnet) — executes the plan; the only role that writes code freely.
- **reviewer** (opus) — correctness + cleanup; read-only.
- **tester** (sonnet) — writes/runs tests, drives the app; leans on `verify`/`run`.
- **security-auditor** (opus) — authz/access-control/injection; read-only, leans on `security-review`.
- **designer** (sonnet) — UI/UX + the editor experience; leans on `artifact-design`/`dataviz`.
- **devops-reviewer** (sonnet) — build/CI/migrations/deploy; read-only.
- **review-lean** (opus) — lean-mode stand-in: correctness + security + ops + light behavior in one pass; read-only.

Project skills (`.claude/skills/`): **`kk-voice`** (voice/content rules — load before any user-facing text) and **`payload-nextjs`** (stack conventions).

Conventions that keep this working:
- Specialists share state through **files in `docs/`** (spec, plan), never memory — every spawn is cold, so briefs must be self-contained.
- **Skip stages that don't fit** the change; don't run all seven for a copy tweak.
- Reviews rely on git diffs — once the repo is initialized the reviewer/security-auditor use `code-review`/`security-review`; before that they read changed files directly.

## Commands

Not yet established — the project is unscaffolded. Populate this section (install, dev server, build, lint, test, single-test, and how to run Payload migrations / access the admin) once the Next.js + Payload project exists.
