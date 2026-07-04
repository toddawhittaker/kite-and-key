import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageContainer } from '@/components/page-container'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'projects',
    draft: false,
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

  return (
    <PageContainer>
      <article className="max-w-2xl py-16">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{project.title}</h1>
        <p className="mt-4 text-base text-ink-700 dark:text-ink-300">{project.summary}</p>

        {technologies.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-accent-100 px-2 py-0.5 text-xs text-accent-700"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">Problem addressed</h2>
          <div className="mt-2 text-base leading-relaxed">
            {project.problem && <RichText data={project.problem} />}
          </div>
        </section>

        {contributors.length > 0 && (
          <section className="mt-8">
            <h2 className="text-2xl font-semibold">Student contributors</h2>
            <ul className="mt-2 flex flex-wrap gap-4">
              {contributors.map((contributor) =>
                typeof contributor === 'object' ? (
                  <li key={contributor.id}>
                    <Link
                      href={`/students#${contributor.slug ?? contributor.id}`}
                      className="text-accent-700 hover:underline dark:text-accent-500"
                    >
                      {contributor.name}
                    </Link>
                  </li>
                ) : null,
              )}
            </ul>
          </section>
        )}

        {project.outcomes && (
          <section className="mt-8">
            <h2 className="text-2xl font-semibold">Outcomes</h2>
            <div className="mt-2 text-base leading-relaxed">
              <RichText data={project.outcomes} />
            </div>
          </section>
        )}

        {project.artifacts && project.artifacts.length > 0 && (
          <section className="mt-8">
            <h2 className="text-2xl font-semibold">Artifacts</h2>
            <ul className="mt-2 list-disc pl-5">
              {project.artifacts.map((artifact, index) => (
                <li key={index}>
                  {artifact.url ? (
                    <a
                      href={artifact.url}
                      className="text-accent-700 hover:underline dark:text-accent-500"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {artifact.label}
                    </a>
                  ) : (
                    artifact.label
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </PageContainer>
  )
}
