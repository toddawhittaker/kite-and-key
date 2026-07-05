import Image from 'next/image'
import Link from 'next/link'

/**
 * Replaces EntityCard on /students. Non-linked (no `/students/[slug]` route
 * exists yet — R3). No `quote` prop: the source's pull-quote has no real
 * data source (R4) — omit rather than fabricate.
 */
export function StudentCard({
  name,
  program,
  year,
  description,
  avatar,
  tag,
  href,
}: {
  name: string
  program?: string
  year?: number
  description?: string
  avatar?: { url: string; alt?: string }
  tag?: string
  href?: string
}) {
  const meta = [program, year].filter(Boolean).join(' · ')

  const content = (
    <div
      className={`rounded-lg bg-surface-card p-8 text-center ${href ? 'transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-card' : ''}`}
    >
      <div className="mx-auto h-20 w-20 overflow-hidden rounded-full bg-surface-sunken">
        {avatar && (
          <Image
            src={avatar.url}
            alt={avatar.alt ?? name}
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      {tag && (
        <span className="mt-4 inline-block rounded-full bg-surface-sunken-strong px-3 py-1 text-xs font-bold tracking-widest text-muted uppercase">
          {tag}
        </span>
      )}
      <h3 className="mt-3 text-lg font-bold text-brand-ink">{name}</h3>
      {meta && <p className="mt-1 text-sm text-muted">{meta}</p>}
      {description && (
        <p className="mt-3 text-sm leading-relaxed text-body">{description}</p>
      )}
    </div>
  )

  if (!href) return <article>{content}</article>

  return (
    <Link href={href} className="group block">
      {content}
    </Link>
  )
}
