import { expect, test } from '@playwright/test'

// Get Involved becomes the first public consumer of the Events collection
// (docs/plans/design-system-restyle.md §5: `findPublic('events', { sort:
// 'startDate', where: { startDate: { greater_than_equal: <now> } } })`).
//
// SEED GAP (flag for the PM, not fabricated): src/seed/index.ts creates
// exactly one event, 'Sample Event — Code Review Session', with
// `startDate: new Date().toISOString()` captured AT SEED TIME. Because the
// e2e run always happens strictly after `pnpm seed` finishes, that
// timestamp is already in the past by the time this page is requested — a
// `startDate: { greater_than_equal: <now> }` "upcoming events" filter will
// legitimately exclude it. The seed does have an Events doc, but not one
// that satisfies "upcoming" once implemented. Recommend: the seed's event
// `startDate` be moved to a future offset (e.g. `now + 30 days`) so this
// page has real, non-fabricated "upcoming" data to render — a seed change,
// not a test change (out of scope for the tester to make; see CLAUDE.md's
// seed being shared dev/demo infrastructure, not a test-only helper).
test.describe('/get-involved renders upcoming events from the CMS', () => {
  test('the seeded upcoming event title appears', async ({ page }) => {
    const response = await page.goto('/get-involved')
    expect(response?.status()).toBe(200)
    await expect(page.getByText('Sample Event — Code Review Session')).toBeVisible()
  })
})
