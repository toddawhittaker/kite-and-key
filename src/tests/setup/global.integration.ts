import { createTestDatabase, runMigrations, testDatabaseUrl } from '../helpers/db'

/**
 * Vitest `globalSetup` for the `integration` project — runs once, in the
 * main Vitest process, BEFORE any worker (and thus before that worker's
 * `test.env` env injection) starts. It therefore can't rely on
 * `process.env.DATABASE_URI` already pointing at the test DB the way test
 * files can; `testDatabaseUrl()` computes the same default independently.
 *
 * Creates the `kite_and_key_test` database (idempotent) in the existing
 * compose `db` container, then applies the committed migrations against it
 * — reusing the real `src/payload.config.ts` unmodified, only overriding the
 * `DATABASE_URI` env var it already reads.
 */
export default async function setup(): Promise<void> {
  const url = testDatabaseUrl()
  await createTestDatabase(url)
  runMigrations(url)
}
