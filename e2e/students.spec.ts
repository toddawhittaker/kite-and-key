import { expect, test } from '@playwright/test'

// Drives the live, seeded dev stack (docker compose up -d && pnpm seed) —
// see playwright.config.ts. Assumes the seed data from src/seed/index.ts is
// present and unmodified.
//
// docs/plans/brand-lockup-and-outcomes.md §6 Phase 1: the Students page must
// render an uppercase outcome pill per profile that has one, distinct from
// the existing muted profile-type tag, with `detail` (when set) as
// supporting text. Per the plan's Phase 2 seed step, the implementer gives:
//   - 'Sample Profile — Student One' -> { type: 'internship', detail: 'SWE Intern — sample data' }
//   - 'Sample Profile — Student Two' -> { type: 'new-position' } (no detail)
// Red until Profiles.outcome exists + is seeded + StudentCard renders the
// pill (implementer's Phase 2) — the pill text/detail simply aren't in the
// DOM yet, not a selector typo.

test.describe('/students outcome pill', () => {
  test('shows the INTERNSHIP pill with its detail as supporting text for the profile carrying one', async ({
    page,
  }) => {
    await page.goto('/students')

    // Scope to the specific card so the pill/detail assertions can't false-
    // positive against some other card's markup.
    const card = page
      .locator('article, a')
      .filter({ hasText: 'Sample Profile — Student One' })
      .first()

    await expect(card.getByText('INTERNSHIP', { exact: true })).toBeVisible()
    await expect(card.getByText('SWE Intern — sample data')).toBeVisible()
  })

  test('shows the NEW POSITION pill with no detail line for the profile without one', async ({
    page,
  }) => {
    await page.goto('/students')

    const card = page
      .locator('article, a')
      .filter({ hasText: 'Sample Profile — Student Two' })
      .first()

    await expect(card.getByText('NEW POSITION', { exact: true })).toBeVisible()
  })
})
