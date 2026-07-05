import { RichText } from '@payloadcms/richtext-lexical/react'

import { Card } from '@/components/card'
import { Icon } from '@/components/icon'
import { IconTile } from '@/components/icon-tile'
import { PageContainer } from '@/components/page-container'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

// R2 (plan §6): the About global has no structured fields for Core
// Principles / the pathway / the Franklin affiliation block — these are
// fixed structural copy, not CMS-driven, and map onto CLAUDE.md's already-
// fixed Build/Engage/Publish vocabulary rather than inventing new content.
const CORE_PRINCIPLES = [
  {
    icon: 'code',
    title: 'Build',
    body: 'Scoped, real technical work — software, cloud, data, and security projects with a named problem, real technologies, and a shipped outcome.',
  },
  {
    icon: 'diversity_3',
    title: 'Engage',
    body: 'Mentorship, code reviews, workshops, and direct collaboration with faculty and regional tech professionals.',
  },
  {
    icon: 'auto_awesome',
    title: 'Publish',
    body: 'The visible evidence students create along the way — project writeups, case studies, and portfolio artifacts.',
  },
]

const PATHWAY = [
  { icon: 'school', label: 'Coursework', tone: 'outline' as const },
  { icon: 'code', label: 'Build Project', tone: 'navy' as const },
  { icon: 'stars', label: 'Engage & Publish', tone: 'active' as const },
  { icon: 'rocket_launch', label: 'Career Outcome', tone: 'gold' as const },
]

export default async function AboutPage() {
  const payload = await getPayloadClient()
  const about = await payload.findGlobal({ slug: 'about' })

  return (
    <PageContainer>
      <section className="py-16">
        <span className="eyebrow text-muted">Our Mission</span>
        <h1 className="mt-6 max-w-3xl text-4xl font-bold text-brand-ink md:text-5xl">
          {about.heading}
        </h1>
        <div className="mt-8 max-w-2xl text-lg leading-relaxed text-body">
          {about.body && <RichText data={about.body} />}
        </div>
      </section>

      <section className="rounded-lg bg-surface-sunken px-8 py-16 md:px-12">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-brand-ink">Core Principles</h2>
          <p className="eyebrow mt-2 text-muted">The Foundation of Kite &amp; Key</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {CORE_PRINCIPLES.map((principle) => (
            <Card key={principle.title} padding="lg">
              <IconTile icon={principle.icon} shape="square" tone="navy" />
              <h3 className="mt-6 text-xl font-bold text-brand-ink">{principle.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-body">{principle.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-bold text-brand-ink">The Success Pathway</h2>
            <p className="mt-4 text-lg text-body">
              A path from coursework to a live Build project, to Engage and Publish evidence, to
              a real career outcome.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {PATHWAY.map((step) => (
              <div key={step.label} className="flex flex-col items-center gap-3 text-center">
                <IconTile icon={step.icon} shape="circle" tone={step.tone} size="lg" />
                <span className="text-xs font-bold text-brand-ink uppercase">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-hairline/20 py-16 text-center">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
          <div className="flex items-center gap-4 opacity-40">
            <Icon name="account_balance" size={32} className="text-brand-ink" />
            <span className="font-display text-2xl font-bold tracking-tight text-brand-ink">
              Franklin University
            </span>
          </div>
          <p className="leading-relaxed text-muted">
            Kite &amp; Key IT is a student-driven initiative connected to Franklin
            University&rsquo;s Computing Sciences and Mathematics programs, operating under
            faculty oversight.
          </p>
        </div>

        {about.facultyModeratorNote && (
          <div className="mx-auto mt-8 max-w-2xl rounded-lg border border-hairline/20 p-6 text-left text-sm leading-relaxed text-body">
            <RichText data={about.facultyModeratorNote} />
          </div>
        )}
      </section>
    </PageContainer>
  )
}
