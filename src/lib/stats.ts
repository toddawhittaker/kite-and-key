import { findPublic } from '@/lib/payload'

/**
 * Real, live, draft-excluding site counts for the Home stat row (docs/plans/
 * design-system-restyle.md §5: "totalDocs from projects/profiles/posts
 * (fetch { limit: 1, depth: 0 } and read .totalDocs — NOT limit:0)"). Every
 * count goes through findPublic(), so drafts never inflate the numbers —
 * see src/tests/integration/stats.int.test.ts for the exact contract.
 * kk-voice: stat tiles must be real CMS-derived counts, never fabricated.
 */
export async function getSiteStats(): Promise<{
  projects: number
  profiles: number
  posts: number
}> {
  const [projects, profiles, posts] = await Promise.all([
    findPublic('projects', { limit: 1, depth: 0 }),
    findPublic('profiles', { limit: 1, depth: 0 }),
    findPublic('posts', { limit: 1, depth: 0 }),
  ])

  return {
    projects: projects.totalDocs,
    profiles: profiles.totalDocs,
    posts: posts.totalDocs,
  }
}
