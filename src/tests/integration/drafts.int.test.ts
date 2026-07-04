import type { Payload } from 'payload'
import { beforeEach, describe, expect, it } from 'vitest'

import { findPublic } from '@/lib/payload'

import { createTestAdmin, createTestProfile, getTestPayload, richText } from '../helpers/payload'

/**
 * THE regression test for the HIGH we fixed: `publishedOrAuth` +
 * `findPublic`'s baked-in `overrideAccess:false` + `draft:false`. Before the
 * fix, `publishedOrAuth` returned `true` unconditionally, which meant
 * anonymous REST/GraphQL callers passing `?draft=true` could read
 * unpublished documents — `draft:false` alone does not filter by `_status`,
 * only `access.read` does. Every case below asserts the POST-fix behavior
 * and would fail against the pre-fix `publishedOrAuth` (`() => true`).
 */
let payload: Payload

beforeEach(async () => {
  payload = await getTestPayload()
})

describe('draft exclusion for anonymous callers', () => {
  it('projects: anon sees only the published doc, even when requesting draft:true', async () => {
    const profile = await createTestProfile(payload)
    const base = {
      summary: 'summary',
      problem: richText('problem'),
      technologies: [{ name: 'Next.js' }],
      contributors: [profile.id],
    }
    await payload.create({
      collection: 'projects',
      data: { ...base, title: 'Published Project', slug: 'published-project', _status: 'published' },
      draft: false,
    })
    await payload.create({
      collection: 'projects',
      data: { ...base, title: 'Draft Project', slug: 'draft-project', _status: 'draft' },
      draft: true,
    })

    const anonDefault = await payload.find({ collection: 'projects', overrideAccess: false })
    expect(anonDefault.docs.map((d) => d.title)).toEqual(['Published Project'])

    // The critical assertion: passing draft:true must NOT flip anon access.
    const anonWithDraftFlag = await payload.find({
      collection: 'projects',
      overrideAccess: false,
      draft: true,
    })
    expect(anonWithDraftFlag.docs.map((d) => d.title)).toEqual(['Published Project'])

    const admin = await createTestAdmin(payload)
    const authed = await payload.find({
      collection: 'projects',
      overrideAccess: false,
      user: admin,
      draft: true,
    })
    expect(authed.docs.map((d) => d.title).sort()).toEqual(['Draft Project', 'Published Project'])
  })

  it('posts: anon sees only the published doc, even when requesting draft:true', async () => {
    const profile = await createTestProfile(payload)
    const base = { author: profile.id, body: richText('body') }
    await payload.create({
      collection: 'posts',
      data: { ...base, title: 'Published Post', slug: 'published-post', _status: 'published' },
      draft: false,
    })
    await payload.create({
      collection: 'posts',
      data: { ...base, title: 'Draft Post', slug: 'draft-post', _status: 'draft' },
      draft: true,
    })

    const anonWithDraftFlag = await payload.find({
      collection: 'posts',
      overrideAccess: false,
      draft: true,
    })
    expect(anonWithDraftFlag.docs.map((d) => d.title)).toEqual(['Published Post'])

    const admin = await createTestAdmin(payload)
    const authed = await payload.find({
      collection: 'posts',
      overrideAccess: false,
      user: admin,
      draft: true,
    })
    expect(authed.docs.map((d) => d.title).sort()).toEqual(['Draft Post', 'Published Post'])
  })

  it('events: anon sees only the published doc, even when requesting draft:true', async () => {
    const base = { eventType: 'workshop' as const, startDate: new Date().toISOString() }
    await payload.create({
      collection: 'events',
      data: { ...base, title: 'Published Event', slug: 'published-event', _status: 'published' },
      draft: false,
    })
    await payload.create({
      collection: 'events',
      data: { ...base, title: 'Draft Event', slug: 'draft-event', _status: 'draft' },
      draft: true,
    })

    const anonWithDraftFlag = await payload.find({
      collection: 'events',
      overrideAccess: false,
      draft: true,
    })
    expect(anonWithDraftFlag.docs.map((d) => d.title)).toEqual(['Published Event'])

    const admin = await createTestAdmin(payload)
    const authed = await payload.find({
      collection: 'events',
      overrideAccess: false,
      user: admin,
      draft: true,
    })
    expect(authed.docs.map((d) => d.title).sort()).toEqual(['Draft Event', 'Published Event'])
  })

  it('findPublic() end-to-end: only published docs surface, for each drafts-enabled collection', async () => {
    const profile = await createTestProfile(payload)

    await payload.create({
      collection: 'projects',
      data: {
        title: 'Published Project',
        slug: 'published-project',
        summary: 'summary',
        problem: richText('problem'),
        technologies: [{ name: 'Next.js' }],
        contributors: [profile.id],
        _status: 'published',
      },
      draft: false,
    })
    await payload.create({
      collection: 'projects',
      data: {
        title: 'Draft Project',
        slug: 'draft-project',
        summary: 'summary',
        problem: richText('problem'),
        technologies: [{ name: 'Next.js' }],
        contributors: [profile.id],
        _status: 'draft',
      },
      draft: true,
    })

    // This is the case that goes RED against pre-fix `publishedOrAuth`
    // (`() => true`), which would have let the draft leak through here.
    const { docs } = await findPublic('projects')
    expect(docs.map((d) => d.title)).toEqual(['Published Project'])
  })
})
