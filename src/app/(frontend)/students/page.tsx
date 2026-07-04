import { EntityCard } from '@/components/entity-card'
import { PageContainer } from '@/components/page-container'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export default async function StudentsPage() {
  const payload = await getPayloadClient()
  const { docs: profiles } = await payload.find({
    collection: 'profiles',
    draft: false,
    depth: 0,
    sort: 'name',
    limit: 50,
  })

  return (
    <PageContainer>
      <div className="py-16">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Students</h1>
        <p className="mt-4 max-w-2xl text-base text-ink-700 dark:text-ink-300">
          {/* PLACEHOLDER: framed as evidence of contribution, not a directory */}
          The students and team members behind the work on this site.
        </p>

        {profiles.length === 0 ? (
          <p className="mt-12 text-ink-500 dark:text-ink-300">
            Student profiles are being added — check back soon.
          </p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <EntityCard
                key={profile.id}
                href={`/students#${profile.slug ?? profile.id}`}
                title={profile.name}
                meta={profile.program ?? undefined}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
