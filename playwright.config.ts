import { defineConfig, devices } from '@playwright/test'

// Drives the already-running dockerized stack (`docker compose up -d` +
// `pnpm seed`) rather than booting its own server — the app runs in a
// separate container, and having Playwright boot `pnpm dev`/`start` inside
// the test runner would double-boot Next and diverge from "drives the real
// stack." Two run modes:
//   - Host dev:  pnpm test:e2e against http://localhost:3000.
//   - e2e image: `docker run --network host -e E2E_BASE_URL=http://localhost:3000
//     <e2e-image> pnpm test:e2e` — this is the supported/verified invocation.
//     Driving the compose network's `app:3000` service name directly does
//     NOT work: `app` sits under Google's `.app` gTLD, which is on
//     Chromium's static HSTS-preload list, so the browser force-upgrades it
//     to HTTPS unconditionally (no launch flag disables this — verified).
//     Even with a different, non-`.app` hostname, Next 15's
//     `allowedDevOrigins` would still block the admin panel's `/_next/*`
//     HMR/RSC requests unless the origin is `localhost` — so `localhost`
//     (via `--network host`) is the only origin both Chromium and Next
//     accept without further app/dev-origin config. A real compose-network
//     run therefore needs a devops follow-up (a non-`.app` service alias +
//     an `allowedDevOrigins` entry for it), out of scope here.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    // This flag does NOT help against the compose service name `app` (see
    // the top-of-file note — that's a static HSTS-preload entry for the
    // `.app` gTLD, not the general HTTPS-upgrade heuristic this feature
    // flag controls, and disabling it doesn't override the preload list).
    // It's a no-op for the supported `localhost` invocation too — kept
    // here, harmless, only as documentation-in-code for anyone who tries a
    // future non-localhost/non-`.app` hostname and hits Chromium's broader
    // "upgrade unrecognized hosts to HTTPS" heuristic (distinct from the
    // `.app` preload).
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
