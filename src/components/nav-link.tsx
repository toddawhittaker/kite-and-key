'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Desktop nav link — the only client piece of SiteHeader's nav (which stays
 * a Server Component otherwise). Adds the design system's gold-underline
 * active state, keyed off the current route, and `aria-current="page"` for
 * assistive tech (fix batch #3). Active on an exact match or any nested
 * route under it (e.g. `/projects/[slug]` keeps "Projects" active).
 */
export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`border-b-2 pb-1 transition-colors ${
        isActive
          ? 'border-brand-gold text-brand-ink'
          : 'border-transparent text-brand-ink hover:text-brand-gold'
      }`}
    >
      {label}
    </Link>
  )
}
