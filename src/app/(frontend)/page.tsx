import Link from 'next/link'

import { PageContainer } from '@/components/page-container'

const PILLARS = [
  {
    name: 'Build',
    description: 'Scoped, real technical work: software, cloud, data, and security projects.',
    href: '/projects',
  },
  {
    name: 'Engage',
    description: 'Mentorship, code reviews, workshops, and employer collaboration.',
    href: '/get-involved',
  },
  {
    name: 'Publish',
    description: 'Writeups, case studies, and portfolio artifacts students create.',
    href: '/blog',
  },
]

export default function HomePage() {
  return (
    <PageContainer>
      <section className="py-16">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {/* PLACEHOLDER: replace with a one-line mission statement framed around what students DO */}
          Franklin students building, engaging, and publishing real technical work.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-700 dark:text-ink-300">
          {/* PLACEHOLDER: content team to replace before launch */}
          Kite &amp; Key IT is the public surface of applied technology work coming out of
          Franklin University&rsquo;s Computing Sciences and Mathematics programs.
        </p>
      </section>

      <section className="grid gap-6 py-8 sm:grid-cols-3">
        {PILLARS.map((pillar) => (
          <Link
            key={pillar.name}
            href={pillar.href}
            className="rounded-lg border border-ink-100 p-6 transition-colors hover:border-accent-500 dark:border-ink-900"
          >
            <h2 className="text-2xl font-semibold">{pillar.name}</h2>
            <p className="mt-2 text-base text-ink-700 dark:text-ink-300">{pillar.description}</p>
          </Link>
        ))}
      </section>

      <section className="flex flex-col gap-4 py-16 sm:flex-row">
        <Link
          href="/partner"
          className="rounded-md bg-accent-700 px-6 py-3 text-center text-sm font-medium text-white hover:bg-accent-500"
        >
          Partner With Us
        </Link>
        <Link
          href="/get-involved"
          className="rounded-md border border-ink-100 px-6 py-3 text-center text-sm font-medium hover:border-accent-500 dark:border-ink-900"
        >
          Get Involved
        </Link>
      </section>
    </PageContainer>
  )
}
