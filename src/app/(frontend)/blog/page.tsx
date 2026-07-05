import { BlogCard } from '@/components/blog-card'
import { Button } from '@/components/button'
import { FilterPill } from '@/components/filter-pill'
import { PageContainer } from '@/components/page-container'
import { Pagination } from '@/components/pagination'
import { mediaImage } from '@/lib/display'
import { findPublic } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const POSTS_PER_PAGE = 9

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const tag = typeof params.tag === 'string' ? params.tag : undefined
  const page = typeof params.page === 'string' ? Math.max(1, Number(params.page) || 1) : 1

  // A lightweight, unfiltered fetch just to compute the real distinct tag
  // set for the filter row (findPublic() — draft-excluding, same as below).
  const { docs: allPosts } = await findPublic('posts', { depth: 0, limit: 100 })
  const tags = Array.from(
    new Set(allPosts.flatMap((post) => (post.tags ?? []).map((t) => t.tag).filter(Boolean))),
  ) as string[]

  // findPublic() bakes in overrideAccess:false + draft:false — see
  // src/lib/payload.ts. `?tag=`/`?page=` are additive `where`/`page` on the
  // same query (plan §5), not a new access path.
  const {
    docs: posts,
    totalPages,
    page: currentPage,
  } = await findPublic('posts', {
    depth: 1,
    sort: '-publishedDate',
    limit: POSTS_PER_PAGE,
    page,
    ...(tag ? { where: { 'tags.tag': { equals: tag } } } : {}),
  })

  return (
    <PageContainer>
      <div className="py-16">
        <span className="eyebrow text-muted">Insights From Our Students</span>
        <h1 className="mt-6 text-4xl font-bold text-brand-ink md:text-5xl">From the Field</h1>
        <p className="mt-4 max-w-2xl text-lg text-body">
          Students writing about real project work — the Publish pillar made visible.
        </p>

        {tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            <FilterPill href="/blog" active={!tag}>
              All Posts
            </FilterPill>
            {tags.map((t) => (
              <FilterPill key={t} href={`/blog?tag=${encodeURIComponent(t)}`} active={tag === t}>
                {t}
              </FilterPill>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <p className="mt-12 text-muted">Posts are being added — check back soon.</p>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const author = typeof post.author === 'object' ? post.author?.name : undefined
              const initials = author
                ? author
                    .split(' ')
                    .map((part) => part[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()
                : '—'
              const category = post.tags?.[0]?.tag ?? undefined

              return (
                <BlogCard
                  key={post.id}
                  title={post.title}
                  description={post.excerpt ?? undefined}
                  author={author ?? 'Kite & Key IT'}
                  authorInitials={initials}
                  date={
                    post.publishedDate
                      ? new Date(post.publishedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : ''
                  }
                  category={category}
                  coverImage={mediaImage(post.coverImage)}
                />
              )
            })}
          </div>
        )}

        <div className="mt-16">
          <div className="rounded-lg bg-brand-navy-panel p-10 text-inverse">
            <span className="eyebrow text-inverse-muted">Follow Along</span>
            <h2 className="mt-4 text-2xl font-bold">Want to see more student work?</h2>
            <p className="mt-3 max-w-md text-inverse-muted">
              Browse the Build projects these posts come out of, or bring your own bounded
              project to a student team.
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <Button href="/get-involved" variant="secondary">
                Explore Get Involved
              </Button>
              <Button href="/partner" variant="primary">
                Start a Partnership
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-hairline/20 pt-12">
          <Pagination
            page={currentPage ?? page}
            pageCount={totalPages ?? 1}
            basePath="/blog"
            searchParams={params}
          />
        </div>
      </div>
    </PageContainer>
  )
}
