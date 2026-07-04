import Link from 'next/link'

import { PageContainer } from '@/components/page-container'

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/students', label: 'Students' },
  { href: '/blog', label: 'Blog' },
  { href: '/partner', label: 'Partner With Us' },
  { href: '/get-involved', label: 'Get Involved' },
]

export function SiteHeader() {
  return (
    <header className="border-b border-ink-100 dark:border-ink-900">
      <PageContainer>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Kite &amp; Key IT
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-ink-700 hover:text-accent-700 dark:text-ink-300 dark:hover:text-accent-500"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </PageContainer>
    </header>
  )
}
