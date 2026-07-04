import { PageContainer } from '@/components/page-container'

export default function GetInvolvedPage() {
  return (
    <PageContainer>
      <div className="max-w-2xl py-16">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Get Involved</h1>
        <p className="mt-4 text-base text-ink-700 dark:text-ink-300">
          {/* PLACEHOLDER: framed toward current students */}
          How current students move from coursework to a project, a code review, or a
          published writeup.
        </p>

        <div className="mt-12 rounded-lg border border-ink-100 p-6 dark:border-ink-900">
          <h2 className="text-lg font-medium">Upcoming events</h2>
          <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">
            {/* PLACEHOLDER: an events listing (workshops, code reviews, employer sessions)
                is a follow-up pass once Events content exists to show here. */}
            Workshops, code reviews, and employer sessions will be listed here.
          </p>
        </div>

        <p className="mt-8 text-sm text-ink-700 dark:text-ink-300">
          {/* PLACEHOLDER: the "bridge from course to contribution" note */}
          Ask your instructor or a faculty moderator how to join a Build project or contribute
          a Publish post.
        </p>
      </div>
    </PageContainer>
  )
}
