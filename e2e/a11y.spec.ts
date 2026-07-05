import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// Acceptance criterion (docs/specs/design-system-restyle.md): "All pages ...
// pass an axe-clean bar for color contrast on the navy/off-white/gold
// palette." Scoped to the `color-contrast` rule specifically (not a full
// a11y sweep — that's out of scope for this restyle).
//
// Originally scoped to the three pages the plan/UX-plan flagged as the
// highest-risk boundary cases (UX plan §4: `Home`'s hero copy, `Projects`'
// body/meta text, `Partner`'s dark-hero rgba lede and stat tiles) — extended
// to every public page after the designer found a 2.57:1 contrast fail on
// `/about` that this smoke *didn't* cover (fixed in the review-fix batch:
// `opacity-40` -> `text-muted`). Covering every page, not just the
// originally-flagged three, is exactly what stops this class of bug from
// hiding in an uncovered page again.
//
// Requires `@axe-core/playwright` as a devDependency — added by the tester
// (package.json + pnpm-lock.yaml) since it wasn't present; a Docker image
// rebuild (`docker compose build` / `--build -V`) is needed to pick it up
// before `pnpm test:e2e` can run this file (see final report to PM).

const PAGES = [
  '/',
  '/about',
  '/projects',
  '/projects/sample-project-one',
  '/students',
  '/blog',
  '/partner',
  '/get-involved',
]

test.describe('color-contrast a11y smoke', () => {
  for (const path of PAGES) {
    test(`${path} has no axe color-contrast violations`, async ({ page }) => {
      await page.goto(path)
      const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze()
      expect(results.violations).toEqual([])
    })
  }
})
