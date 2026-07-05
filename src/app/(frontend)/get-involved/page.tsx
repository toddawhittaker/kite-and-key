import { Card } from '@/components/card'
import { IconTile } from '@/components/icon-tile'
import { PageContainer } from '@/components/page-container'
import { StepItem } from '@/components/step-item'
import { eventTypeToIcon, type EventType } from '@/lib/display'
import { findPublic } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const STEPS = [
  { title: 'Take a course', body: 'Build the foundation in your Computing Sciences coursework.' },
  {
    title: 'Join a project',
    body: 'Bring what you learned to a real, faculty-overseen Build project.',
  },
  {
    title: 'Publish your work',
    body: 'Write up what you built and shipped — real evidence for your portfolio.',
  },
]

export default async function GetInvolvedPage() {
  // Get Involved is the first public consumer of the Events collection —
  // query wiring only, no schema change (plan §5).
  const { docs: events } = await findPublic('events', {
    depth: 0,
    sort: 'startDate',
    where: { startDate: { greater_than_equal: new Date().toISOString() } },
    limit: 10,
  })

  return (
    <PageContainer>
      <div className="py-16">
        <span className="eyebrow text-muted">For Current Students</span>
        <h1 className="mt-6 text-4xl font-bold text-brand-ink md:text-5xl">Get Involved</h1>
        <p className="mt-4 max-w-2xl text-lg text-body">
          How current students move from coursework to a project, a code review, or a published
          writeup.
        </p>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-brand-ink">Upcoming Events</h2>
          {events.length === 0 ? (
            <p className="mt-4 text-muted">
              Workshops, code reviews, and employer sessions will be listed here as they&rsquo;re
              scheduled.
            </p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card key={event.id}>
                  <IconTile
                    icon={eventTypeToIcon(event.eventType as EventType)}
                    shape="square"
                    tone="navy"
                  />
                  <h3 className="mt-6 text-lg font-bold text-brand-ink">{event.title}</h3>
                  {event.startDate && (
                    <p className="mt-2 text-sm text-muted">
                      {new Date(event.startDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                  {event.location && <p className="mt-1 text-sm text-muted">{event.location}</p>}
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-brand-ink">The Path From Course to Contribution</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <StepItem
                key={step.title}
                number={index + 1}
                title={step.title}
                description={step.body}
              />
            ))}
          </div>
        </section>

        <section className="mt-16">
          <Card tone="sunken">
            <p className="text-base leading-relaxed text-body">
              Ask your instructor or a faculty moderator how to join a Build project or
              contribute a Publish post.
            </p>
          </Card>
        </section>
      </div>
    </PageContainer>
  )
}
