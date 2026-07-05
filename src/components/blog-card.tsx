import Image from 'next/image'
import Link from 'next/link'

/**
 * Replaces EntityCard on /blog. Non-linked (no `/blog/[slug]` route exists
 * yet — R3): hover-lift/image-scale only apply when `href` is present, which
 * it never is in this pass.
 */
export function BlogCard({
  title,
  description,
  author,
  authorInitials,
  date,
  category,
  coverImage,
  href,
}: {
  title: string
  description?: string
  author: string
  authorInitials: string
  date: string
  category?: string
  coverImage?: { url: string; alt?: string }
  href?: string
}) {
  const content = (
    <div
      className={`overflow-hidden rounded-lg bg-surface-card ${href ? 'transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-card' : ''}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-sunken">
        {coverImage && (
          <Image
            src={coverImage.url}
            alt={coverImage.alt ?? title}
            fill
            className={`object-cover ${href ? 'transition-transform duration-300 group-hover:scale-105' : ''}`}
          />
        )}
      </div>
      <div className="p-6">
        {category && (
          <span className="text-xs font-bold tracking-widest text-muted uppercase">
            {category}
          </span>
        )}
        <h3 className="mt-2 text-lg font-bold text-brand-ink">{title}</h3>
        {description && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-body">{description}</p>
        )}
        <div className="mt-4 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-sunken-strong text-xs font-bold text-brand-ink">
            {authorInitials}
          </span>
          <div className="text-xs text-muted">
            <p className="font-medium text-body-strong">{author}</p>
            <p>{date}</p>
          </div>
        </div>
      </div>
    </div>
  )

  if (!href) return <article>{content}</article>

  return (
    <Link href={href} className="group block">
      {content}
    </Link>
  )
}
