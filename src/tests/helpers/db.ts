import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { Client } from 'pg'

const dirname = path.dirname(fileURLToPath(import.meta.url))
export const repoRoot = path.resolve(dirname, '../../..')

const TEST_DB_NAME = 'kite_and_key_test'

/**
 * The one place the integration project's target database is decided. Must
 * match `vitest.config.ts`'s `integration` project `env.DATABASE_URI` default
 * — that value is what test *worker* processes see; this function is what
 * `globalSetup` (which runs outside the per-file `test.env` injection) uses
 * to create/migrate the same database before any worker connects to it.
 */
export function testDatabaseUrl(): string {
  return process.env.TEST_DATABASE_URI ?? `postgres://postgres:postgres@db:5432/${TEST_DB_NAME}`
}

/**
 * Safety net: never let a destructive statement (TRUNCATE, DROP, etc.) run
 * against anything but the dedicated test database. Called before every
 * destructive operation in this file.
 */
export function assertTestDbUrl(url: string): void {
  const { pathname } = new URL(url)
  const dbName = pathname.replace(/^\//, '')
  if (dbName !== TEST_DB_NAME) {
    throw new Error(
      `Refusing to operate on database "${dbName}" — the test harness only operates on ` +
        `"${TEST_DB_NAME}". Check TEST_DATABASE_URI / DATABASE_URI.`,
    )
  }
}

/**
 * Idempotently creates the test database (in the same Postgres server/
 * container as the dev DB) by connecting to the server's default
 * `postgres` database. Postgres has no `CREATE DATABASE IF NOT EXISTS`, so
 * existence is checked first.
 */
export async function createTestDatabase(url: string = testDatabaseUrl()): Promise<void> {
  assertTestDbUrl(url)
  const target = new URL(url)
  const dbName = target.pathname.replace(/^\//, '')

  const adminUrl = new URL(url)
  adminUrl.pathname = '/postgres'

  const client = new Client({ connectionString: adminUrl.toString() })
  await client.connect()
  try {
    const { rows } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName])
    if (rows.length === 0) {
      // Database identifiers can't be parameterized — dbName is our own
      // constant (`kite_and_key_test`), never user input.
      await client.query(`CREATE DATABASE "${dbName}"`)
    }
  } finally {
    await client.end()
  }
}

/**
 * Runs the project's committed migrations against the test database via a
 * subprocess (`payload migrate`), reusing the real `src/payload.config.ts`
 * unmodified — only the `DATABASE_URI` env var it reads is overridden. This
 * keeps `push:false` prod-parity and doubles as a migration-currency smoke
 * test (a forgotten `migrate:create` surfaces as a red integration run).
 */
export function runMigrations(url: string = testDatabaseUrl()): void {
  assertTestDbUrl(url)
  execFileSync('pnpm', ['exec', 'payload', 'migrate'], {
    cwd: repoRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test',
      DATABASE_URI: url,
      PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ?? 'test-secret-please-override',
    },
  })
}

let resetClient: Client | null = null

async function getResetClient(url: string): Promise<Client> {
  if (!resetClient) {
    resetClient = new Client({ connectionString: url })
    await resetClient.connect()
  }
  return resetClient
}

/**
 * Resets all Payload-owned tables between tests. True transaction rollback
 * isn't viable — Payload's Local API opens its own transaction per
 * operation — so this issues a single TRUNCATE across every table except
 * `payload_migrations` (so schema/migration state survives), discovered
 * dynamically from `information_schema` so it never drifts from the schema.
 */
export async function resetTestDb(url: string = testDatabaseUrl()): Promise<void> {
  assertTestDbUrl(url)
  const client = await getResetClient(url)

  const { rows } = await client.query<{ tablename: string }>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> 'payload_migrations'`,
  )
  if (rows.length === 0) return

  const tableList = rows.map((row) => `"${row.tablename}"`).join(', ')
  await client.query(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`)
}

/** Closes the reset connection. Called from global teardown. */
export async function closeResetClient(): Promise<void> {
  if (resetClient) {
    await resetClient.end()
    resetClient = null
  }
}
