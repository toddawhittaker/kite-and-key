import Link from 'next/link'

import { Crest } from '@/components/crest'
import { PageContainer } from '@/components/page-container'

const PILLAR_LINKS = [
  { href: '/projects', label: 'Build' },
  { href: '/get-involved', label: 'Engage' },
  { href: '/blog', label: 'Publish' },
]

const PAGE_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/students', label: 'Students' },
  { href: '/partner', label: 'Partner With Us' },
  { href: '/get-involved', label: 'Get Involved' },
]

/**
 * Dark navy 4-column footer (docs/plans/design-system-restyle-ux.md §1):
 * crest + tagline, page links, pillar links, a Franklin-affiliation column.
 * Server Component, no interactivity.
 */
export function SiteFooter() {
  return (
    <footer className="bg-brand-ink text-inverse">
      <PageContainer>
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Crest tone="dark" size={36} />
            <p className="mt-4 text-sm font-bold tracking-widest text-inverse-muted uppercase">
              Apply. Solve. Advance.
            </p>
          </div>

          <div>
            <h2 className="eyebrow text-inverse-muted">Site</h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              {PAGE_LINKS.map((link) => (
                <li key={link.href}>
                  {/* aria-label disambiguates from the header nav's identically-
                      labeled link (and, for pillar links below, from
                      FilterPill's "Build"/"Engage"/"Publish" on /projects) —
                      both render on every page, so an exact-name a11y query
                      would otherwise resolve to more than one element. */}
                  <Link
                    href={link.href}
                    aria-label={`${link.label} (footer)`}
                    className="hover:text-brand-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="eyebrow text-inverse-muted">Pillars</h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              {PILLAR_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-label={`${link.label} (footer)`}
                    className="hover:text-brand-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="eyebrow text-inverse-muted">Affiliation</h2>
            <p className="mt-4 text-sm leading-relaxed text-inverse-muted">
              Kite &amp; Key IT is a student-driven initiative connected to Franklin
              University&rsquo;s Computing Sciences and Mathematics programs.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-xs text-inverse-muted">
          Kite &amp; Key IT — Franklin University Computing Sciences &amp; Mathematics
        </div>
      </PageContainer>
    </footer>
  )
}
