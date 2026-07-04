import { beforeEach, describe, expect, it, vi } from 'vitest'

// Hoisted so the mock factories below (which are themselves hoisted above
// imports by Vitest) can reference it.
const { findSpy } = vi.hoisted(() => ({ findSpy: vi.fn().mockResolvedValue({ docs: [] }) }))

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: vi.fn().mockResolvedValue({ find: findSpy }) }))

// Imported after the mocks so `findPublic`'s module-level `getPayload({config})`
// call resolves against the mock, never a real Payload init or DB.
const { findPublic } = await import('@/lib/payload')

describe('findPublic', () => {
  beforeEach(() => {
    findSpy.mockClear()
  })

  it('always forces overrideAccess:false and draft:false', async () => {
    await findPublic('projects')

    expect(findSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'projects',
        overrideAccess: false,
        draft: false,
      }),
    )
  })

  it('passes caller options through, without letting them override the forced defaults', async () => {
    // `Omit<FindOptions, 'collection' | 'draft' | 'overrideAccess'>` forbids
    // these at the type level — cast to `any` so the test can prove the
    // runtime guarantee too: even if a caller manages to smuggle
    // overrideAccess/draft through (or a future refactor loosens the type),
    // findPublic's own values must still win.
    await findPublic('projects', {
      limit: 5,
      sort: '-publishedDate',
      where: { title: { equals: 'x' } },
      depth: 1,
      overrideAccess: true,
      draft: true,
    } as any)

    expect(findSpy).toHaveBeenCalledWith({
      limit: 5,
      sort: '-publishedDate',
      where: { title: { equals: 'x' } },
      depth: 1,
      collection: 'projects',
      overrideAccess: false,
      draft: false,
    })
  })
})
