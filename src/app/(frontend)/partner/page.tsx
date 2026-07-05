import { Icon } from '@/components/icon'
import { IconTile } from '@/components/icon-tile'
import { Input } from '@/components/input'
import { PageContainer } from '@/components/page-container'
import { StatTile } from '@/components/stat-tile'
import { StepItem } from '@/components/step-item'
import { Textarea } from '@/components/textarea'
import { getSiteStats } from '@/lib/stats'

export const dynamic = 'force-dynamic'

// kk-voice: bounded/faculty-overseen framing, never "consultancy" or
// unrestricted engagement — reworded from the design system's sample copy.
const OFFERS = [
  {
    icon: 'account_tree',
    title: 'Scoped Projects',
    body: 'Every engagement has a clearly bounded scope and timeline, agreed up front — not open-ended work.',
  },
  {
    icon: 'verified_user',
    title: 'Professional & Supervised',
    body: 'Student teams are overseen by Franklin University faculty throughout the project, from intake to delivery.',
  },
  {
    icon: 'diversity_3',
    title: 'Community-Serving Model',
    body: 'We prioritize nonprofits, small businesses, and civic organizations whose needs fit an educationally-appropriate, bounded project.',
  },
]

const AUDIENCE = [
  {
    title: 'Nonprofits & NGOs',
    body: 'Organizations looking to scale their digital impact with limited resources.',
  },
  {
    title: 'Small Businesses',
    body: 'Local enterprises needing a modern web presence or a scoped internal tool.',
  },
  {
    title: 'Civic Organizations',
    body: 'Local government initiatives and community-driven technology projects.',
  },
]

const STEPS = [
  { title: 'Submit', body: 'Tell us about the problem and its rough scope.' },
  {
    title: 'Faculty review',
    body: 'A faculty moderator reviews the request for fit and boundedness.',
  },
  {
    title: 'Matched to a team',
    body: 'Accepted opportunities are matched to a student project team.',
  },
  {
    title: 'Scoped delivery',
    body: 'Students deliver within the agreed, bounded scope, with faculty oversight.',
  },
]

export default async function PartnerPage() {
  const stats = await getSiteStats()

  return (
    <>
      <section className="bg-brand-ink px-6 py-24 text-inverse md:px-8">
        <PageContainer>
          <span className="eyebrow inline-block rounded-full bg-brand-navy-panel px-4 py-1 text-brand-gold">
            Partnerships
          </span>
          <h1 className="mt-6 max-w-2xl text-4xl font-bold md:text-5xl">Partner With Us</h1>
          <p className="mt-6 max-w-xl text-xl leading-relaxed text-inverse">
            Scoped, faculty-overseen student projects — not open-ended consulting. We match
            bounded technology work to student teams under faculty supervision.
          </p>
        </PageContainer>
      </section>

      <PageContainer>
        <section className="py-16">
          <h2 className="text-3xl font-bold text-brand-ink">What We Offer</h2>
          <div className="mt-4 h-1 w-20 bg-brand-gold" />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {OFFERS.map((offer) => (
              <div key={offer.title} className="rounded-lg bg-surface-card p-8">
                <IconTile icon={offer.icon} shape="square" tone="navy" />
                <h3 className="mt-6 text-xl font-bold text-brand-ink">{offer.title}</h3>
                <p className="mt-3 leading-relaxed text-body">{offer.body}</p>
              </div>
            ))}
          </div>
        </section>
      </PageContainer>

      <section className="bg-surface-sunken px-6 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-brand-ink">Who We Work With</h2>
              <p className="mt-6 max-w-md text-lg text-body">
                We seek partners with a bounded, educationally-appropriate problem and the
                availability to work with a student team under faculty oversight.
              </p>
              <div className="mt-8 flex flex-col gap-6">
                {AUDIENCE.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <Icon
                      name="check_circle"
                      filled
                      className="mt-1 text-brand-gold-hover"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-brand-ink">{item.title}</h3>
                      <p className="mt-1 text-body">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <StatTile value={String(stats.projects)} label="Projects Delivered" tone="navy" />
              <StatTile
                value={String(stats.profiles)}
                label="Student Contributors"
                tone="gold"
              />
            </div>
          </div>
        </div>
      </section>

      <PageContainer>
        <section className="py-16">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-brand-ink">Our Collaborative Process</h2>
            <p className="mx-auto mt-3 max-w-md text-body">
              A bounded path from initial idea to a scoped, faculty-reviewed delivery.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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

        <section className="pb-16">
          <div className="mx-auto max-w-2xl rounded-xl bg-surface-card p-8 shadow-card-soft md:p-12">
            <h2 className="text-3xl font-bold text-brand-ink">Start a Partnership</h2>
            <p className="mt-3 text-body">
              Tell us about your organization and the problem you&rsquo;re looking to solve. A
              faculty moderator reviews every submission for fit and boundedness.
            </p>

            <form className="mt-8 flex flex-col gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <Input label="Organization Name" placeholder="e.g. Mid-Ohio Food Collective" disabled />
                <Input label="Contact Name" placeholder="Jane Doe" disabled />
              </div>
              <Input
                label="Contact Email"
                type="email"
                placeholder="jane@example.org"
                disabled
              />
              <Textarea
                label="What do you need help with?"
                placeholder="Describe the problem in plain terms — bounded enough for a student team to complete in a term."
                disabled
              />
              <Input
                label="Term Availability"
                placeholder="e.g. Fall 2026"
                disabled
              />
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-sm bg-brand-gold px-6 py-4 text-base font-bold text-brand-gold-ink opacity-50"
              >
                Send Us Your Project Idea
              </button>
            </form>

            <p className="mt-6 text-sm text-muted">
              A partner intake form is coming soon. In the meantime, reach out through Franklin
              University&rsquo;s Computing Sciences and Mathematics program.
            </p>
          </div>
        </section>
      </PageContainer>
    </>
  )
}
