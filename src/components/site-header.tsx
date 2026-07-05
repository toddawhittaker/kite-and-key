import Link from 'next/link'

import { Crest } from '@/components/crest'
import { MobileNav } from '@/components/mobile-nav'
import { PageContainer } from '@/components/page-container'

export const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/students', label: 'Students' },
  { href: '/blog', label: 'Blog' },
  { href: '/partner', label: 'Partner With Us' },
  { href: '/get-involved', label: 'Get Involved' },
]

/**
 * Fixed glass top nav (docs/design/reference/readme.md: "the top nav is the
 * only translucent surface"). Stays a Server Component — MobileNav is the
 * only client island, handling the below-`md` disclosure.
 */
export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-hairline/10 bg-surface-page/80 backdrop-blur-lg">
      <PageContainer>
        <div className="flex h-24 items-center justify-between">
          <Link href="/" className="shrink-0">
            <Crest size={36} />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-bold md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-brand-ink transition-colors hover:text-brand-gold"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <MobileNav links={NAV_LINKS} />
        </div>
      </PageContainer>
    </header>
  )
}
