import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * A styled `<Link>`, not a stateful button — filters are server-driven via
 * `searchParams` (docs/plans/design-system-restyle.md §4). `active` is
 * computed by the caller (a Server Component) from the current searchParams.
 */
export function FilterPill({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-bold transition-colors ${
        active
          ? 'bg-brand-ink text-white'
          : 'bg-surface-sunken text-body hover:bg-surface-sunken-strong'
      }`}
    >
      {children}
    </Link>
  )
}
