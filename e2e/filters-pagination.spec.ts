import { expect, test } from '@playwright/test'

// Server-driven filter/pagination behavior (docs/plans/design-system-restyle.md
// §4/§5/§6): `?pillar=` on /projects and `?page=` on /blog must change which
// CMS docs render, and filter pills / pagination controls must be real
// `<Link>`s (not JS-only), per the plan's "server-driven via searchParams"
// framing decision. Relies on the seeded stack (src/seed/index.ts):
//   - projects: 'Sample Project — Inventory Tracker' (pillars: ['build']),
//     'Sample Project — Data Dashboard' (pillars: ['build', 'publish']).
//   - posts: exactly 2 published posts, no tags — see the gap note below.

test.describe('/projects ?pillar= server-driven filter', () => {
  test('unfiltered grid shows both seeded projects', async ({ page }) => {
    await page.goto('/projects')
    await expect(page.getByText('Sample Project — Inventory Tracker')).toBeVisible()
    await expect(page.getByText('Sample Project — Data Dashboard')).toBeVisible()
  })

  test('?pillar=publish filters out the project with no publish pillar', async ({ page }) => {
    // Only 'Sample Project — Data Dashboard' has pillars: ['build', 'publish'];
    // 'Sample Project — Inventory Tracker' is pillars: ['build'] only, so this
    // is a real filtered-vs-unfiltered difference from seeded data (picking
    // ?pillar=build would not differ, since both seeded projects have 'build').
    await page.goto('/projects?pillar=publish')
    await expect(page.getByText('Sample Project — Data Dashboard')).toBeVisible()
    await expect(page.getByText('Sample Project — Inventory Tracker')).not.toBeVisible()
  })

  test('pillar filter pills are real links carrying ?pillar=', async ({ page }) => {
    await page.goto('/projects')
    const buildPill = page.getByRole('link', { name: 'Build', exact: true })
    await expect(buildPill).toHaveAttribute('href', /\?pillar=build\b/)
  })
})

test.describe('/blog ?page= server-driven pagination', () => {
  test('default page shows both seeded posts', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.getByText('Sample Post — Field Notes From a Project')).toBeVisible()
    await expect(page.getByText('Sample Post — What We Learned')).toBeVisible()
  })

  test('?page=2 renders a different (empty) page — the page param reaches the query', async ({
    page,
  }) => {
    // GAP (flagged for the PM): the seed has only 2 posts and the plan fixes
    // limit:9, so there is exactly one real page of results — no seeded
    // second page of *content* exists to assert against, and Pagination
    // controls (if pageCount<=1) may not render at all. This still proves
    // `?page=` is wired into the findPublic() query (an out-of-range page
    // legitimately returns zero docs) without fabricating a second page of
    // posts the seed doesn't have.
    const response = await page.goto('/blog?page=2')
    expect(response?.status()).toBe(200)
    await expect(page.getByText('Sample Post — Field Notes From a Project')).not.toBeVisible()
    await expect(page.getByText('Sample Post — What We Learned')).not.toBeVisible()
  })
})
