import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { PageContainer } from '@/components/page-container'
import { StatTile } from '@/components/stat-tile'
import { StudentCard } from '@/components/student-card'
import { humanizePillar, mediaImage, type Pillar } from '@/lib/display'
import { findPublic } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  // findPublic() bakes in overrideAccess:false + draft:false — without it,
  // an unpublished project could resolve by slug on this public route.
  const { docs } = await findPublic('projects', {
    depth: 1,
    where: { slug: { equals: slug } },
    limit: 1,
  })
  const project = docs[0]

  if (!project) {
    notFound()
  }

  const contributors = Array.isArray(project.contributors) ? project.contributors : []
  const technologies = (project.technologies ?? [])
    .map((t) => t.name)
    .filter((n): n is string => Boolean(n))
  const pillars = (project.pillars ?? []) as Pillar[]
  const coverImage = mediaImage(project.coverImage)

  return (
    <PageContainer>
      <article className="py-16">
        <div className="max-w-3xl">
          {pillars.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pillars.map((pillar) => (
                <Badge key={pillar} tone="neutral">
                  {humanizePillar(pillar)}
                </Badge>
              ))}
            </div>
          )}
          <h1 className="mt-6 text-4xl font-bold text-brand-ink md:text-5xl">{project.title}</h1>
          <p className="mt-4 text-xl leading-relaxed text-body">{project.summary}</p>

          {technologies.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-surface-sunken px-3 py-1 text-xs font-medium text-body"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        {coverImage && (
          <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-xl">
            <Image
              src={coverImage.url}
              alt={coverImage.alt ?? project.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <StatTile value={String(contributors.length)} label="Contributors" tone="navy" />
          <StatTile value={String(technologies.length)} label="Technologies" tone="gold" />
          <StatTile
            value={
              project.publishedDate
                ? new Date(project.publishedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                  })
                : '—'
            }
            label="Published"
            tone="navy"
          />
        </div>

        <section className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold text-brand-ink">Problem addressed</h2>
          <div className="mt-4 leading-relaxed text-body">
            {project.problem && <RichText data={project.problem} />}
          </div>
        </section>

        {project.outcomes && (
          <section className="mt-12 max-w-3xl">
            <h2 className="text-2xl font-bold text-brand-ink">Outcomes</h2>
            <div className="mt-4 leading-relaxed text-body">
              <RichText data={project.outcomes} />
            </div>
          </section>
        )}

        {contributors.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-brand-ink">Student contributors</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {contributors.map((contributor) =>
                typeof contributor === 'object' ? (
                  <StudentCard
                    key={contributor.id}
                    name={contributor.name}
                    program={contributor.program ?? undefined}
                    year={contributor.gradYear ?? undefined}
                  />
                ) : null,
              )}
            </div>
          </section>
        )}

        {project.artifacts && project.artifacts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-brand-ink">Artifacts</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {project.artifacts.map((artifact, index) =>
                artifact.url ? (
                  <a
                    key={index}
                    href={artifact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-surface-sunken px-4 py-2 text-sm font-medium text-body hover:bg-surface-sunken-strong"
                  >
                    {artifact.label}
                  </a>
                ) : (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full bg-surface-sunken px-4 py-2 text-sm font-medium text-body"
                  >
                    {artifact.label}
                  </span>
                ),
              )}
            </div>
          </section>
        )}

        <div className="mt-16">
          <Button href="/projects" variant="tertiary">
            See more projects
          </Button>
        </div>
      </article>
    </PageContainer>
  )
}
