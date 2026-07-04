import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

// `vite-tsconfig-paths` resolves both `@/*` and the single-file
// `@payload-config` mapping straight from tsconfig.json — no hand-maintained
// second path map. (Fallback if the non-glob `@payload-config` mapping ever
// misbehaves: an explicit `resolve.alias` entry
// `{ '@payload-config': path.resolve('src/payload.config.ts') }`.)
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.unit.test.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['src/tests/integration/**/*.int.test.ts'],
          environment: 'node',
          globalSetup: ['src/tests/setup/global.integration.ts'],
          setupFiles: ['src/tests/setup/integration.setup.ts'],
          fileParallelism: false,
          testTimeout: 30000,
          hookTimeout: 30000,
          env: {
            NODE_ENV: 'test',
            DATABASE_URI:
              process.env.TEST_DATABASE_URI ?? 'postgres://postgres:postgres@db:5432/kite_and_key_test',
            PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ?? 'test-secret-please-override',
          },
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: [
        'src/payload-types.ts', // generated
        'src/migrations/**', // generated / framework-owned
        'src/app/**', // (payload) generator + (frontend) RSC — e2e-covered, not unit-testable
        'src/components/**', // presentational — e2e-covered
        'src/seed/**', // exercised behaviorally via subprocess (out-of-process → no V8 line capture)
        'src/tests/**',
        '**/*.test.ts',
        '.next/**',
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
        'src/lib/**': { lines: 90, statements: 90, functions: 90, branches: 90 },
        'src/fields/**': { lines: 90, statements: 90, functions: 90, branches: 90 },
      },
    },
  },
})
