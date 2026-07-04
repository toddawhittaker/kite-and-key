# Kite & Key IT

**A Franklin University student consultancy — real technology work, real student talent.**

Kite & Key IT is the public-facing platform for a student-driven applied technology initiative connected to Franklin University's Computing Sciences and Mathematics programs. It exists to make student capability *legible* — to help students accumulate credible, portfolio-ready evidence of applied work before graduation, and to give employers, community partners, and prospective students a concrete view of what Franklin technology students actually do.

The work organizes around three pillars:

- **Build** — scoped, real technical projects: software, cloud migration, data solutions, cybersecurity support, web modernization.
- **Engage** — the professional relationships that make the work valuable: mentorship, code reviews, workshops, employer and regional-community interaction.
- **Publish** — the visible evidence students create: project writeups, blog posts, case studies, open-source contributions, talks, and portfolio artifacts.

This is not a marketing site with nicer graphics. It's a content-managed record of applied learning, and its credibility comes from specificity — named projects, named technologies, real student stories, and clearly-bounded partner engagements.

## Status

**Greenfield.** The repository currently contains the project charter and the development workflow — the application itself is not yet scaffolded. See [`CLAUDE.md`](./CLAUDE.md) for the full charter (mission, audiences, voice) and workflow reference.

## Tech stack (target)

Self-hosted monorepo:

- **[Next.js](https://nextjs.org/) (App Router)** — the public site, rendered from CMS content.
- **[Payload CMS](https://payloadcms.com/)** — the admin, so non-technical student editors and faculty moderators can publish and maintain content without touching code.

Everything visitor-facing is content-managed from day one. Planned content types: Projects, Blog posts, Student/Team profiles, Events, and Partner opportunities. Planned pages: Home, About, Projects, Students, Blog, Partner With Us, Get Involved — each serving one primary audience.

## Development workflow

Development runs through a **PM-orchestrated, agent-based pipeline**. You talk to the root Claude Code session (acting as Product Manager) via the `/pm` command; it dispatches specialist subagents (architect, implementer, reviewer, tester, security-auditor, designer, devops-reviewer) and synthesizes their results, pausing for your approval at two gates (spec, then plan).

```
/pm <request>
  → spec        ── you approve
  → plan        ── you approve
  → implement → review (parallel) → fix → ship (PR) → report
```

The full workflow — agents, skills, cost disciplines, and GitHub/CI handling — is documented in [`CLAUDE.md`](./CLAUDE.md). Agent and command definitions live under [`.claude/`](./.claude/); specs and plans are recorded under [`docs/`](./docs/).

## Getting started

The app is not scaffolded yet, so there are no install/run commands. Once the Next.js + Payload project lands, this section (and the Commands section of `CLAUDE.md`) will document install, dev server, build, test, and the Payload admin.

## License

[MIT](./LICENSE) © 2026 Todd Whittaker
