import Image from 'next/image'
import Link from 'next/link'

import { Icon } from '@/components/icon'

/**
 * Replaces EntityCard on /projects. No status pill (R1 — no lifecycle-status
 * field exists on Projects; see docs/plans/design-system-restyle.md §6 R1).
 * `category`/`icon` come from the humanized pillar (src/lib/display.ts), not
 * fabricated sector data. Whole card is always a link, so hover-lift always
 * applies — the one card type that keeps a resting hairline border.
 */
export function ProjectCard({
  title,
  description,
  tags,
  href,
  icon,
  category,
  coverImage,
}: {
  title: string
  description: string
  tags: string[]
  href: string
  icon?: string
  category?: string
  coverImage?: { url: string; alt?: string }
}) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-lg border border-hairline/10 bg-surface-card transition-all duration-300 hover:-translate-y-2 hover:shadow-card"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-sunken">
        {coverImage ? (
          <Image
            src={coverImage.url}
            alt={coverImage.alt ?? title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : icon ? (
          <div className="flex h-full items-center justify-center">
            <Icon name={icon} size={40} className="text-brand-ink/20" />
          </div>
        ) : null}
      </div>
      <div className="p-6">
        {category && (
          <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-muted uppercase">
            {icon && <Icon name={icon} size={16} />}
            <span>{category}</span>
          </div>
        )}
        <h3 className="text-xl font-bold text-brand-ink">{title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-body">{description}</p>
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-sunken px-3 py-1 text-xs font-medium text-body"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
