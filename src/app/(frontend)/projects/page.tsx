import { EntityCard } from '@/components/entity-card'
import { PageContainer } from '@/components/page-container'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const payload = await getPayloadClient()
  const { docs: projects } = await payload.find({
    collection: 'projects',
    draft: false,
    depth: 1,
    sort: '-publishedDate',
    limit: 50,
  })

  return (
    <PageContainer>
      <div className="py-16">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Projects</h1>
        <p className="mt-4 max-w-2xl text-base text-ink-700 dark:text-ink-300">
          {/* PLACEHOLDER: framing these as real, scoped work with named problems and technologies */}
          Real, scoped technical work with named problems, technologies, and student
          contributors.
        </p>

        {projects.length === 0 ? (
          <p className="mt-12 text-ink-500 dark:text-ink-300">
            Projects are being added — check back soon.
          </p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const contributorCount = Array.isArray(project.contributors)
                ? project.contributors.length
                : 0
              const technologies = (project.technologies ?? [])
                .map((t) => t.name)
                .filter((n): n is string => Boolean(n))

              return (
                <EntityCard
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  title={project.title}
                  meta={`${contributorCount} contributor${contributorCount === 1 ? '' : 's'}`}
                  excerpt={project.summary}
                  tags={technologies}
                />
              )
            })}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
