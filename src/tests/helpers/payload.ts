import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

/**
 * Cached Payload Local API init, reused across the (serial) integration
 * project so we don't pay Payload-init cost (lexical, sharp, pg pool) per
 * test file. `DATABASE_URI`/`PAYLOAD_SECRET` must already be set to the test
 * DB's values before this (or anything importing `@payload-config`) is
 * first called — guaranteed by Vitest's `test.env` for the integration
 * project, applied before any module in the worker loads.
 */
let cached: Payload | null = null

export async function getTestPayload(): Promise<Payload> {
  if (!cached) {
    cached = await getPayload({ config })
  }
  return cached
}

/** Closes the cached Payload instance's pg pool so the Vitest process can exit cleanly. */
export async function destroyTestPayload(): Promise<void> {
  if (cached) {
    await cached.destroy()
    cached = null
  }
}

/** Minimal Lexical rich-text document — mirrors `src/seed/index.ts`'s `richText()`. */
export function richText(text: string) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text, version: 1 }],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

let userCounter = 0

/** Creates a fixture user, returning the created doc. Defaults to role 'editor'. */
export async function createTestUser(
  payload: Payload,
  overrides: { role?: 'admin' | 'editor'; email?: string } = {},
) {
  userCounter += 1
  return payload.create({
    collection: 'users',
    data: {
      email: overrides.email ?? `test-user-${userCounter}@example.org`,
      password: 'test-password-123!',
      name: 'Test User',
      role: overrides.role ?? 'editor',
    },
  })
}

/** Creates an admin fixture user (role: 'admin'). */
export async function createTestAdmin(payload: Payload, overrides: { email?: string } = {}) {
  return createTestUser(payload, { ...overrides, role: 'admin' })
}

/** Creates a minimal fixture Profile (required by Projects/Posts relationships). */
export async function createTestProfile(payload: Payload, overrides: Record<string, unknown> = {}) {
  userCounter += 1
  return payload.create({
    collection: 'profiles',
    data: {
      name: `Test Profile ${userCounter}`,
      profileType: 'student',
      ...overrides,
    },
  })
}

// A 1x1 transparent PNG — the smallest valid input `sharp` (Media's upload
// pipeline) will accept, so fixture Media docs don't need a file on disk.
const ONE_PX_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

/** Creates a fixture Media doc backed by a real (tiny) uploaded image. */
export async function createTestMedia(payload: Payload, overrides: Record<string, unknown> = {}) {
  userCounter += 1
  return payload.create({
    collection: 'media',
    data: { alt: `Test media ${userCounter}`, ...overrides },
    file: {
      data: ONE_PX_PNG,
      mimetype: 'image/png',
      name: `test-fixture-${userCounter}.png`,
      size: ONE_PX_PNG.length,
    },
  })
}
