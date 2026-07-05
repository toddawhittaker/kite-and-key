import Link from 'next/link'

/**
 * Numbered `<Link>`s (not client state) — server-driven pagination that
 * preserves other searchParams (e.g. an active `?tag=` filter survives a
 * page change). Renders nothing when there's only one page.
 */
export function Pagination({
  page,
  pageCount,
  basePath,
  searchParams = {},
}: {
  page: number
  pageCount: number
  basePath: string
  searchParams?: Record<string, string | string[] | undefined>
}) {
  if (pageCount <= 1) return null

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1)

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(basePath, p, searchParams)}
          aria-current={p === page ? 'page' : undefined}
          className={`flex h-10 w-10 items-center justify-center rounded-sm text-sm font-bold transition-colors ${
            p === page ? 'bg-brand-ink text-white' : 'text-body hover:bg-surface-sunken'
          }`}
        >
          {p}
        </Link>
      ))}
    </nav>
  )
}

function buildHref(
  basePath: string,
  page: number,
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === 'page' || value === undefined) continue
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, v)
    } else {
      params.set(key, value)
    }
  }
  if (page > 1) params.set('page', String(page))

  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}
