import Link from 'next/link'

interface EntityCardProps {
  href: string
  title: string
  meta?: string
  excerpt?: string
  tags?: string[]
}

/**
 * One card shape, driven by props — reused for Projects, Profiles, and
 * Posts list items rather than building three bespoke components.
 */
export function EntityCard({ href, title, meta, excerpt, tags }: EntityCardProps) {
  return (
    <Link href={href} className="block">
      <article className="rounded-lg border border-ink-100 p-6 transition-colors hover:border-accent-500 dark:border-ink-900">
        <h3 className="text-lg font-medium">{title}</h3>
        {meta && <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">{meta}</p>}
        {excerpt && <p className="mt-3 line-clamp-3 text-base">{excerpt}</p>}
        {tags && tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent-100 px-2 py-0.5 text-xs text-accent-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </Link>
  )
}
