import { describe, expect, it } from 'vitest'

import { anyone, isAdmin, isAuthenticated, publishedOrAuth } from '@/lib/access'

// Minimal shape of the `AccessArgs` these helpers actually read (`req.user`) —
// pure logic, no DB, no Payload init.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const args = (user: unknown): any => ({ req: { user } })

describe('isAdmin', () => {
  it('returns true for a user with role "admin"', () => {
    expect(isAdmin(args({ role: 'admin' }))).toBe(true)
  })

  it('returns false for a user with role "editor"', () => {
    expect(isAdmin(args({ role: 'editor' }))).toBe(false)
  })

  it('returns false when there is no user', () => {
    expect(isAdmin(args(undefined))).toBe(false)
  })
})

describe('isAuthenticated', () => {
  it('returns true when a user is present', () => {
    expect(isAuthenticated(args({ role: 'editor' }))).toBe(true)
  })

  it('returns false when there is no user', () => {
    expect(isAuthenticated(args(undefined))).toBe(false)
  })
})

describe('anyone', () => {
  it('returns true unconditionally, with or without a user', () => {
    expect(anyone(args(undefined))).toBe(true)
    expect(anyone(args({ role: 'admin' }))).toBe(true)
  })
})

describe('publishedOrAuth', () => {
  it('returns true for an authenticated caller (any role)', () => {
    expect(publishedOrAuth(args({ role: 'editor' }))).toBe(true)
    expect(publishedOrAuth(args({ role: 'admin' }))).toBe(true)
  })

  // This is the unit half of the draft-leak regression: an anonymous caller
  // must get the published-only query constraint, not a bare `true` (which
  // would let `?draft=true` leak unpublished docs through the REST/GraphQL
  // API — see src/lib/access.ts's doc comment).
  it('returns a published-only filter (not `true`) for an anonymous caller', () => {
    const result = publishedOrAuth(args(undefined))
    expect(result).not.toBe(true)
    expect(result).toEqual({ _status: { equals: 'published' } })
  })
})
