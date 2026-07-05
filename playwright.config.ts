import { defineConfig, devices } from '@playwright/test'

// Drives the already-running dockerized stack (`docker compose up -d` +
// `pnpm seed`) rather than booting its own server — the app runs in a
// separate container, and having Playwright boot `pnpm dev`/`start` inside
// the test runner would double-boot Next and diverge from "drives the real
// stack." Two run modes:
//   - Host dev:  pnpm test:e2e against http://localhost:3000.
//   - e2e image (compose network, no `--network host` — the CI invocation):
//     `docker compose --profile e2e up -d --wait db app && docker compose
//     run --rm app pnpm seed && docker compose run --rm e2e pnpm test:e2e`.
//     The `app` service carries a network alias `webapp` (docker-compose.yml)
//     — not under Google's `.app` gTLD, so Chromium doesn't force-upgrade it
//     to HTTPS via the static HSTS-preload list (a bare `app` origin would).
//     `app`'s `ALLOWED_DEV_ORIGINS: webapp` env feeds an env-gated
//     `allowedDevOrigins` entry in next.config.ts, unblocking the admin
//     panel's `/_next/*` HMR/RSC requests from that origin (dev-server only,
//     inert in prod). The `e2e` service points `E2E_BASE_URL` at
//     `http://webapp:3000` accordingly.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // CI-only headroom: `next dev` compiles a route on first request, and the
  // heavier `/admin` (Payload admin) bundle can outrun the 30s default on a
  // slower CI runner (local stays fast — the compose `app` container's first
  // hit is warmed by the CI e2e job before tests run; see ci.yml). Local
  // defaults are unchanged (Playwright's own 30s/no-timeout defaults).
  timeout: process.env.CI ? 90_000 : 30_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    actionTimeout: process.env.CI ? 30_000 : 0,
    navigationTimeout: process.env.CI ? 60_000 : 0,
    // No longer load-bearing now that `webapp` (top-of-file note) sidesteps
    // the `.app` HSTS-preload issue entirely — kept as a harmless no-op in
    // case a future hostname trips Chromium's broader "upgrade unrecognized
    // hosts to HTTPS" heuristic (distinct from the `.app` preload list, and
    // not something this flag overrides for that specific list).
    launchOptions: {
      args: ['--disable-features=HttpsUpgrades'],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Contingency for anyone who prefers Playwright to boot the app itself on
  // localhost instead of driving an already-running stack — not the default:
  // webServer: {
  //   command: 'pnpm dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: true,
  // },
})
