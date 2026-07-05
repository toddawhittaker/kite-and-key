---
name: kk-voice
description: Voice, tone, and content rules for anything user-facing on the Kite & Key IT site — page copy, headings, project/blog/profile content models, partner-facing language, microcopy. Load before writing or reviewing any text a visitor or editor will read.
---

# Kite & Key IT — voice & content

These are product requirements. Credibility is the whole point; these rules protect it.

## The message (every page reinforces it)
Franklin University students are doing applied technical work that is **visible, credible, and connected to professional communities**. Organize around three pillars — reuse this vocabulary:
- **Build** — scoped, real technical work (software, cloud, data, security, web modernization).
- **Engage** — mentorship, code reviews, workshops, employer and regional-community interaction.
- **Publish** — the visible evidence: writeups, blog posts, case studies, OSS, talks, portfolio artifacts.

## Rules
- **Credibility comes from specificity.** Name the projects, the technologies, the outcomes. Show artifacts and real student stories. Cut any sentence that could appear on any university's site unchanged.
- **Professional, not inflated.** Do not read like a startup, a brochure, or a club page with nicer graphics. Read like a serious applied-learning platform: student-centered, employer-aware, community-facing.
- **"Bounded" is load-bearing** in all partner-facing copy. Offer *scoped, faculty-overseen, educationally-appropriate* projects. Never imply unrestricted or free consulting labor. Be concrete about intake and expectations.
- **Audience-first.** Each page primarily serves one audience — write to the question they're actually asking:
  - Prospective students → "If I study here, what will I actually get to do?"
  - Employers → a credible talent *signal* (a supporting layer to hiring, not a replacement).
  - Partners → a clear, bounded pathway to engage.
  - Current students → the bridge from "I completed a course" to "here is a project, the problem, the tech, what I learned, and how I talk about it."
- **No fabrication.** Never invent student names, projects, partners, metrics, or quotes. Use clearly-labeled placeholders and flag them for real content.

## Quick test before shipping copy
1. Could this exact sentence sit on a generic university page? If yes, make it specific or cut it.
2. Does partner-facing text keep the work bounded and faculty-overseen?
3. Is there a concrete artifact or story nearby, or just a claim?

## Design system reconciliation

The imported design system (`docs/design/reference/`) contributes **tone mechanics** on top of these rules, additively: eyebrow labels (small, bold, uppercase, widely tracked), serif-italic emphasis on a headline word or phrase (`type-emphasis`), metaphor-forward headlines, concrete/specific numbers, a warm-professional register, and Material Symbols glyphs instead of emoji (this repo already forbids emoji).

**Unchanged and authoritative where the two disagree:** partner-facing copy stays **bounded / faculty-overseen** (never "consultancy" or unrestricted engagement, regardless of how the reference `readme.md`/screens phrase it), and **no fabrication** — stat tiles render real CMS-derived counts (`src/lib/stats.ts`) or are omitted, never invented sample numbers like the reference's "50+ Projects Shipped." Do not copy the reference screens' sample copy verbatim; render real CMS content through the tone mechanics above.
