import { afterAll, beforeEach } from 'vitest'

import { closeResetClient, resetTestDb } from '../helpers/db'
import { destroyTestPayload, getTestPayload } from '../helpers/payload'

// Warms the cached Payload Local API instance once per test file, before the
// per-test timeout budget starts ticking.
await getTestPayload()

beforeEach(async () => {
  // Discovers tables from information_schema and TRUNCATEs them (excluding
  // `payload_migrations`) — see src/tests/helpers/db.ts. Runs before every
  // test (including the first) so each test starts from an empty DB.
  await resetTestDb()
})

afterAll(async () => {
  // Closes the pg pool(s) this file opened so Vitest can exit cleanly.
  await destroyTestPayload()
  await closeResetClient()
})
