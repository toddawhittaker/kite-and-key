import { PageContainer } from '@/components/page-container'

const STEPS = [
  { title: 'Submit', description: 'Tell us about the problem and its rough scope.' },
  { title: 'Faculty review', description: 'A faculty moderator reviews the request for fit and boundedness.' },
  { title: 'Matched to a student team', description: 'Accepted opportunities are matched to a student project team.' },
  { title: 'Scoped delivery', description: 'Students deliver within the agreed, bounded scope, with faculty oversight.' },
]

export default function PartnerPage() {
  return (
    <PageContainer>
      <div className="max-w-2xl py-16">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Partner With Us</h1>
        <p className="mt-4 text-base text-ink-700 dark:text-ink-300">
          {/* kk-voice: "bounded" is load-bearing for partner-facing copy */}
          Scoped, faculty-overseen student projects — not open-ended consulting.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="rounded-lg border border-ink-100 p-6 dark:border-ink-900"
            >
              <p className="text-sm font-medium text-accent-700 dark:text-accent-500">
                Step {index + 1}
              </p>
              <h2 className="mt-1 text-lg font-medium">{step.title}</h2>
              <p className="mt-2 text-sm text-ink-700 dark:text-ink-300">{step.description}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-sm text-ink-500 dark:text-ink-300">
          {/* PLACEHOLDER: the partner intake form (writing to PartnerOpportunities) is a
              later pass — see docs/plans/scaffold-monorepo.md §3 access-control seam. */}
          A partner intake form is coming soon. In the meantime, reach out through Franklin
          University&rsquo;s Computing Sciences and Mathematics program.
        </p>
      </div>
    </PageContainer>
  )
}
