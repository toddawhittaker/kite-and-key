import { Button } from '@/components/button'
import { FilterPill } from '@/components/filter-pill'
import { PageContainer } from '@/components/page-container'
import { ProjectCard } from '@/components/project-card'
import { humanizePillar, mediaImage, pillarToIcon, type Pillar } from '@/lib/display'
import { findPublic } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const PILLARS: Pillar[] = ['build', 'engage', 'publish']

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const rawPillar = params.pillar
  const activePillar = (typeof rawPillar === 'string' && PILLARS.includes(rawPillar as Pillar)
    ? (rawPillar as Pillar)
    : undefined) as Pillar | undefined

  // findPublic() bakes in overrideAccess:false + draft:false — see
  // src/lib/payload.ts for why draft:false alone isn't enough. The pillar
  // filter is an additive `where` clause on the same query, not a new
  // access path (plan §5).
  const { docs: projects } = await findPublic('projects', {
    depth: 1,
    sort: '-publishedDate',
    limit: 50,
    ...(activePillar ? { where: { pillars: { contains: activePillar } } } : {}),
  })

  return (
    <PageContainer>
      <div className="py-16">
        <span className="eyebrow text-muted">Our Portfolio</span>
        <h1 className="mt-6 text-4xl font-bold text-brand-ink md:text-5xl">Our Work</h1>
        <p className="mt-4 max-w-2xl text-lg text-body">
          Real, scoped technical work with named problems, technologies, and student
          contributors.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <FilterPill href="/projects" active={!activePillar}>
            All
          </FilterPill>
          {PILLARS.map((pillar) => (
            <FilterPill
              key={pillar}
              href={`/projects?pillar=${pillar}`}
              active={activePillar === pillar}
            >
              {humanizePillar(pillar)}
            </FilterPill>
          ))}
        </div>

        {projects.length === 0 ? (
          <p className="mt-12 text-muted">Projects are being added — check back soon.</p>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const technologies = (project.technologies ?? [])
                .map((t) => t.name)
                .filter((n): n is string => Boolean(n))
              const pillar = (project.pillars ?? [])[0] as Pillar | undefined

              return (
                <ProjectCard
                  key={project.id}
                  title={project.title}
                  description={project.summary}
                  tags={technologies}
                  href={`/projects/${project.slug}`}
                  icon={pillar ? pillarToIcon(pillar) : undefined}
                  category={pillar ? humanizePillar(pillar) : undefined}
                  coverImage={mediaImage(project.coverImage)}
                />
              )
            })}
          </div>
        )}
      </div>

      <div className="pb-16">
        <div className="rounded-lg bg-brand-ink p-12 text-inverse">
          <h2 className="max-w-lg text-3xl font-bold">
            Ready to launch your next project with student talent?
          </h2>
          <p className="mt-4 max-w-lg text-inverse-muted">
            We bring fresh perspectives and current technical skills to real, bounded problems.
          </p>
          <div className="mt-8">
            <Button href="/partner" variant="primary">
              Start a Partnership
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
