import { EntityCard } from '@/components/entity-card'
import { PageContainer } from '@/components/page-container'
import { findPublic } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  // findPublic() bakes in overrideAccess:false + draft:false — see
  // src/lib/payload.ts for why draft:false alone isn't enough.
  const { docs: posts } = await findPublic('posts', {
    depth: 1,
    sort: '-publishedDate',
    limit: 50,
  })

  return (
    <PageContainer>
      <div className="py-16">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Blog</h1>
        <p className="mt-4 max-w-2xl text-base text-ink-700 dark:text-ink-300">
          {/* PLACEHOLDER: framed as students writing about real project work */}
          Students writing about real project work — the Publish pillar made visible.
        </p>

        {posts.length === 0 ? (
          <p className="mt-12 text-ink-500 dark:text-ink-300">
            Posts are being added — check back soon.
          </p>
        ) : (
          <div className="mt-12 flex flex-col gap-6">
            {posts.map((post) => {
              const author = typeof post.author === 'object' ? post.author?.name : undefined
              return (
                <EntityCard
                  key={post.id}
                  title={post.title}
                  meta={author}
                  excerpt={post.excerpt ?? undefined}
                />
              )
            })}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
