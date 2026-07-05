import type { Payload } from 'payload'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  createTestAdmin,
  createTestMedia,
  createTestProfile,
  createTestUser,
  getTestPayload,
  richText,
} from '../helpers/payload'

let payload: Payload

beforeEach(async () => {
  payload = await getTestPayload()
})

describe('per-collection access baseline', () => {
  describe('public reads where intended', () => {
    it('anon can read a published Project', async () => {
      const profile = await createTestProfile(payload)
      await payload.create({
        collection: 'projects',
        data: {
          title: 'Public Project',
          slug: 'public-project',
          summary: 'summary',
          problem: richText('problem'),
          technologies: [{ name: 'Next.js' }],
          contributors: [profile.id],
          _status: 'published',
        },
        draft: false,
      })

      const { docs } = await payload.find({ collection: 'projects', overrideAccess: false })
      expect(docs).toHaveLength(1)
      expect(docs[0].title).toBe('Public Project')
    })

    it('anon can read a published Post', async () => {
      const profile = await createTestProfile(payload)
      await payload.create({
        collection: 'posts',
        data: {
          title: 'Public Post',
          slug: 'public-post',
          author: profile.id,
          body: richText('body'),
          _status: 'published',
        },
        draft: false,
      })

      const { docs } = await payload.find({ collection: 'posts', overrideAccess: false })
      expect(docs).toHaveLength(1)
      expect(docs[0].title).toBe('Public Post')
    })

    it('anon can read a published Event', async () => {
      await payload.create({
        collection: 'events',
        data: {
          title: 'Public Event',
          slug: 'public-event',
          eventType: 'workshop',
          startDate: new Date().toISOString(),
          _status: 'published',
        },
        draft: false,
      })

      const { docs } = await payload.find({ collection: 'events', overrideAccess: false })
      expect(docs).toHaveLength(1)
      expect(docs[0].title).toBe('Public Event')
    })

    it('anon can read a Profile', async () => {
      await createTestProfile(payload, { name: 'Public Profile' })

      const { docs } = await payload.find({ collection: 'profiles', overrideAccess: false })
      expect(docs).toHaveLength(1)
      expect(docs[0].name).toBe('Public Profile')
    })

    it('anon can read a Media record', async () => {
      await createTestMedia(payload)

      const { docs } = await payload.find({ collection: 'media', overrideAccess: false })
      expect(docs).toHaveLength(1)
    })

    it('anon can read the about global', async () => {
      await payload.updateGlobal({
        slug: 'about',
        data: { heading: 'About Test', body: richText('about body') },
      })

      const about = await payload.findGlobal({ slug: 'about', overrideAccess: false })
      expect(about.heading).toBe('About Test')
    })
  })

  describe('not publicly readable', () => {
    it('partner-opportunities: anon find is empty (no leak); authed find returns it', async () => {
      await payload.create({
        collection: 'partner-opportunities',
        data: {
          title: 'Secret Opportunity',
          organization: 'Org',
          contactName: 'Contact',
          contactEmail: 'contact@example.org',
          problem: richText('problem'),
          scope: 'scope',
          estimatedEffort: 'small',
          status: 'submitted' as const,
        },
      })

      // disableErrors:true is what makes a boolean-false access result
      // degrade to "empty result" instead of throwing Forbidden — the
      // no-leak check this test wants, at the Local API layer. (Without it,
      // `find` throws — that's what produces the REST 403 covered by
      // e2e/api-access.spec.ts.)
      const anon = await payload.find({
        collection: 'partner-opportunities',
        overrideAccess: false,
        disableErrors: true,
      })
      expect(anon.docs).toHaveLength(0)
      expect(anon.totalDocs).toBe(0)

      const admin = await createTestAdmin(payload)
      const authed = await payload.find({
        collection: 'partner-opportunities',
        overrideAccess: false,
        user: admin,
      })
      expect(authed.docs).toHaveLength(1)
    })

    it('users: anon find is empty (no leak); authed find returns it', async () => {
      await createTestUser(payload, { email: 'findable-user@example.org' })

      const anon = await payload.find({
        collection: 'users',
        overrideAccess: false,
        disableErrors: true,
      })
      expect(anon.docs).toHaveLength(0)
      expect(anon.totalDocs).toBe(0)

      const admin = await createTestAdmin(payload)
      const authed = await payload.find({ collection: 'users', overrideAccess: false, user: admin })
      expect(authed.docs.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('writes require auth', () => {
    it('projects: anon create/update/delete reject; authed create succeeds', async () => {
      const profile = await createTestProfile(payload)
      const data = {
        title: 'Auth Test Project',
        slug: 'auth-test-project',
        summary: 'summary',
        problem: richText('problem'),
        technologies: [{ name: 'Next.js' }],
        contributors: [profile.id],
        _status: 'published' as const,
      }

      await expect(
        payload.create({ collection: 'projects', data, draft: false, overrideAccess: false }),
      ).rejects.toThrow()

      const editor = await createTestUser(payload)
      const created = await payload.create({
        collection: 'projects',
        data,
        draft: false,
        overrideAccess: false,
        user: editor,
      })
      expect(created.id).toBeDefined()

      await expect(
        payload.update({
          collection: 'projects',
          id: created.id,
          data: { title: 'Changed' },
          overrideAccess: false,
        }),
      ).rejects.toThrow()

      await expect(
        payload.delete({ collection: 'projects', id: created.id, overrideAccess: false }),
      ).rejects.toThrow()
    })

    it('partner-opportunities: anon create rejects; authed create succeeds', async () => {
      const data = {
        title: 'New Opportunity',
        organization: 'Org',
        contactName: 'Contact',
        contactEmail: 'contact@example.org',
        problem: richText('problem'),
        scope: 'scope',
        estimatedEffort: 'small' as const,
        status: 'submitted' as const,
      }

      await expect(
        payload.create({ collection: 'partner-opportunities', data, overrideAccess: false }),
      ).rejects.toThrow()

      const editor = await createTestUser(payload)
      const created = await payload.create({
        collection: 'partner-opportunities',
        data,
        overrideAccess: false,
        user: editor,
      })
      expect(created.id).toBeDefined()
    })

    it('users: create requires admin — anon and non-admin authed reject, admin succeeds', async () => {
      await expect(
        payload.create({
          collection: 'users',
          data: {
            email: 'anon-create@example.org',
            password: 'test-password-123!',
            name: 'Anon Create',
            role: 'editor',
          },
          overrideAccess: false,
        }),
      ).rejects.toThrow()

      const editor = await createTestUser(payload)
      await expect(
        payload.create({
          collection: 'users',
          data: {
            email: 'editor-create@example.org',
            password: 'test-password-123!',
            name: 'Editor Create',
            role: 'editor',
          },
          overrideAccess: false,
          user: editor,
        }),
      ).rejects.toThrow()

      const admin = await createTestAdmin(payload)
      const created = await payload.create({
        collection: 'users',
        data: {
          email: 'admin-created@example.org',
          password: 'test-password-123!',
          name: 'Admin Created',
          role: 'editor',
        },
        overrideAccess: false,
        user: admin,
      })
      expect(created.id).toBeDefined()
    })
  })
})
