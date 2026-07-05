import type { Payload } from 'payload'
import { beforeEach, describe, expect, it } from 'vitest'

import { getSiteStats } from '@/lib/stats'

import { createTestProfile, getTestPayload, richText } from '../helpers/payload'

/**
 * Contract for the design-system restyle's Home "real-numbers stat row"
 * (docs/plans/design-system-restyle.md §5: "totalDocs from projects/
 * profiles/posts (fetch { limit: 1, depth: 0 } and read .totalDocs — NOT
 * limit:0)"). Pulled out as a pure Local-API helper so Home's real-count
 * derivation is testable without rendering the page — the implementer
 * creates `src/lib/stats.ts` to satisfy these assertions; this file is red
 * until that module exists.
 *
 * Every count here must be `findPublic()`-derived: real, live, and
 * draft-excluding — never a fabricated/hardcoded number (spec's
 * Reconciliation section; non-regression: "must not change data access,
 * draft:false behavior, or findPublic() guarantees").
 */
let payload: Payload

beforeEach(async () => {
  payload = await getTestPayload()
})

async function makeProject(payload: Payload, overrides: Record<string, unknown> = {}) {
  const profile = await createTestProfile(payload)
  return payload.create({
    collection: 'projects',
    data: {
      title: 'Stats Fixture Project',
      summary: 'summary',
      problem: richText('problem'),
      technologies: [{ name: 'Next.js' }],
      contributors: [profile.id],
      _status: 'published',
      ...overrides,
    },
    draft: false,
  })
}

async function makePost(
  payload: Payload,
  authorId: number,
  overrides: Record<string, unknown> = {},
) {
  return payload.create({
    collection: 'posts',
    data: {
      title: 'Stats Fixture Post',
      author: authorId,
      body: richText('body'),
      _status: 'published',
      ...overrides,
    },
    draft: false,
  })
}

describe('getSiteStats()', () => {
  it('reflects real, seeded totalDocs counts for projects/profiles/posts', async () => {
    // Profiles: 2 fixture profiles (independent of any project/post use).
    await createTestProfile(payload, { name: 'Stats Fixture Profile A' })
    const authorProfile = await createTestProfile(payload, { name: 'Stats Fixture Profile B' })

    // Projects: 3 published.
    await makeProject(payload, { title: 'Project One', slug: 'stats-project-one' })
    await makeProject(payload, { title: 'Project Two', slug: 'stats-project-two' })
    await makeProject(payload, { title: 'Project Three', slug: 'stats-project-three' })

    // Posts: 2 published, sharing one author.
    await makePost(payload, authorProfile.id, { title: 'Post One', slug: 'stats-post-one' })
    await makePost(payload, authorProfile.id, { title: 'Post Two', slug: 'stats-post-two' })

    const stats = await getSiteStats()

    // 2 explicit fixture profiles + 1 author profile created via
    // createTestProfile inside makeProject x3 = 5 total profiles.
    expect(stats.profiles).toBe(5)
    expect(stats.projects).toBe(3)
    expect(stats.posts).toBe(2)
  })

  it('excludes draft projects/posts from the counts (findPublic()/draft:false guarantee)', async () => {
    const profile = await createTestProfile(payload)

    await makeProject(payload, { title: 'Published Project', slug: 'stats-published-project' })
    await payload.create({
      collection: 'projects',
      data: {
        title: 'Draft Project',
        slug: 'stats-draft-project',
        summary: 'summary',
        problem: richText('problem'),
        technologies: [{ name: 'Next.js' }],
        contributors: [profile.id],
        _status: 'draft',
      },
      draft: true,
    })

    await makePost(payload, profile.id, { title: 'Published Post', slug: 'stats-published-post' })
    await payload.create({
      collection: 'posts',
      data: {
        title: 'Draft Post',
        slug: 'stats-draft-post',
        author: profile.id,
        body: richText('body'),
        _status: 'draft',
      },
      draft: true,
    })

    const stats = await getSiteStats()

    expect(stats.projects).toBe(1)
    expect(stats.posts).toBe(1)
  })
})
