import Link from 'next/link'

import { Button } from '@/components/button'
import { IconTile } from '@/components/icon-tile'
import { PageContainer } from '@/components/page-container'
import { StatTile } from '@/components/stat-tile'
import { getSiteStats } from '@/lib/stats'

export const dynamic = 'force-dynamic'

const PILLARS = [
  {
    name: 'Build',
    description: 'Scoped, real technical work: software, cloud, data, and security projects.',
    href: '/projects',
    icon: 'code',
  },
  {
    name: 'Engage',
    description: 'Mentorship, code reviews, workshops, and employer collaboration.',
    href: '/get-involved',
    icon: 'diversity_3',
  },
  {
    name: 'Publish',
    description: 'Writeups, case studies, and portfolio artifacts students create.',
    href: '/blog',
    icon: 'auto_awesome',
  },
]

export default async function HomePage() {
  const stats = await getSiteStats()

  return (
    <PageContainer>
      <section className="py-20">
        <span className="eyebrow text-muted">Applied Learning, Live</span>
        <h1 className="mt-6 max-w-3xl text-5xl font-bold text-brand-ink md:text-6xl">
          Franklin students <em className="type-emphasis">building</em>, engaging, and publishing
          real technical work.
        </h1>
        <p className="mt-6 max-w-2xl text-xl leading-relaxed text-body">
          Kite &amp; Key IT is the public surface of applied technology work coming out of
          Franklin University&rsquo;s Computing Sciences and Mathematics programs.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Button href="/projects" variant="primary">
            See the Work
          </Button>
          <Button href="/partner" variant="tertiary">
            Start a Partnership
          </Button>
        </div>
      </section>

      <section className="grid gap-6 py-8 sm:grid-cols-3">
        {PILLARS.map((pillar) => (
          <Link
            key={pillar.name}
            href={pillar.href}
            className="group block rounded-lg bg-surface-card p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-card"
          >
            <IconTile icon={pillar.icon} shape="square" tone="navy" />
            <h2 className="mt-6 text-2xl font-bold text-brand-ink">{pillar.name}</h2>
            <p className="mt-2 text-base text-body">{pillar.description}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 py-16 sm:grid-cols-3">
        <StatTile value={String(stats.projects)} label="Published Projects" tone="navy" />
        <StatTile value={String(stats.profiles)} label="Profiles on Site" tone="gold" />
        <StatTile value={String(stats.posts)} label="Posts Published" tone="navy" />
      </section>

      <section className="py-16">
        <div className="rounded-lg bg-brand-ink p-12 text-inverse">
          <h2 className="max-w-xl text-3xl font-bold">
            Ready to see what students can build for your organization?
          </h2>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button href="/partner" variant="primary">
              Start a Partnership
            </Button>
            <Button href="/get-involved" variant="secondary">
              Explore Get Involved
            </Button>
          </div>
        </div>
      </section>
    </PageContainer>
  )
}
