import type { Payload } from 'payload'
import { beforeEach, describe, expect, it } from 'vitest'

import { createTestProfile, getTestPayload, richText } from '../helpers/payload'

let payload: Payload

beforeEach(async () => {
  payload = await getTestPayload()
})

// DB-enforced uniqueness — invisible to the pure `slugField()` hook test
// (src/fields/slug.unit.test.ts), since collision is a `unique: true`
// constraint, not a hook branch.
describe('slug uniqueness (DB-enforced)', () => {
  it('auto-generates the slug from the title on create (hook + persistence)', async () => {
    const profile = await createTestProfile(payload)
    const created = await payload.create({
      collection: 'projects',
      data: {
        title: 'Inventory Tracker!',
        summary: 'summary',
        problem: richText('problem'),
        technologies: [{ name: 'Next.js' }],
        contributors: [profile.id],
        _status: 'published',
      },
      draft: false,
    })

    expect(created.slug).toBe('inventory-tracker')
  })

  it('rejects creating a second project with a colliding explicit slug', async () => {
    const profile = await createTestProfile(payload)
    const base = {
      summary: 'summary',
      problem: richText('problem'),
      technologies: [{ name: 'Next.js' }],
      contributors: [profile.id],
      _status: 'published' as const,
    }

    await payload.create({
      collection: 'projects',
      data: { ...base, title: 'First Project', slug: 'shared-slug' },
      draft: false,
    })

    await expect(
      payload.create({
        collection: 'projects',
        data: { ...base, title: 'Second Project', slug: 'shared-slug' },
        draft: false,
      }),
    ).rejects.toThrow()
  })
})
