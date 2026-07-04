import { execFileSync } from 'node:child_process'

import type { Payload } from 'payload'
import { beforeEach, describe, expect, it } from 'vitest'

import { getTestPayload } from '../helpers/payload'
import { repoRoot, testDatabaseUrl } from '../helpers/db'

let payload: Payload

beforeEach(async () => {
  payload = await getTestPayload()
})

/**
 * `src/seed/index.ts` calls `process.exit()` at the top level, so it can't be
 * imported in-process (that would kill the Vitest worker). Run it as a real
 * subprocess against the test DB instead — this also means seed's own lines
 * aren't captured by in-process V8 coverage (`src/seed/**` is excluded from
 * the coverage denominator; it's validated behaviorally here instead).
 */
function runSeed(): string {
  return execFileSync('pnpm', ['seed'], {
    cwd: repoRoot,
    encoding: 'utf-8',
    env: {
      ...process.env,
      NODE_ENV: 'test',
      DATABASE_URI: testDatabaseUrl(),
      PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ?? 'test-secret-please-override',
      SEED_ADMIN_EMAIL: 'seed-admin@example.org',
      SEED_ADMIN_PASSWORD: 'seed-admin-password-123!',
    },
  })
}

describe('seed idempotency', () => {
  it('running the seed script twice does not create duplicates', async () => {
    runSeed()
    runSeed()

    const [admins, profiles, projects, posts, events, opportunities] = await Promise.all([
      payload.count({
        collection: 'users',
        where: { role: { equals: 'admin' } },
        overrideAccess: true,
      }),
      payload.count({ collection: 'profiles', overrideAccess: true }),
      payload.count({ collection: 'projects', overrideAccess: true }),
      payload.count({ collection: 'posts', overrideAccess: true }),
      payload.count({ collection: 'events', overrideAccess: true }),
      payload.count({ collection: 'partner-opportunities', overrideAccess: true }),
    ])

    expect(admins.totalDocs).toBe(1)
    expect(profiles.totalDocs).toBe(2)
    expect(projects.totalDocs).toBe(2)
    expect(posts.totalDocs).toBe(2)
    expect(events.totalDocs).toBe(1)
    expect(opportunities.totalDocs).toBe(1)

    const about = await payload.findGlobal({ slug: 'about', overrideAccess: true })
    expect(about.heading).toBe('About Kite & Key IT')
    expect(about.body).toBeTruthy()
  })
})
