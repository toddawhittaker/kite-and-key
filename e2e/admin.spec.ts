import { expect, test } from '@playwright/test'

const { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env

test.describe('/admin login', () => {
  test.skip(
    !SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD,
    'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD are not set in the environment running Playwright — ' +
      'set them (matching the seeded admin from `pnpm seed`) to run this test.',
  )

  test('an editor can log in and reach the admin dashboard', async ({ page }) => {
    await page.goto('/admin/login')

    await page.getByLabel('Email', { exact: false }).fill(SEED_ADMIN_EMAIL as string)
    await page.getByLabel('Password', { exact: false }).fill(SEED_ADMIN_PASSWORD as string)
    await page.getByRole('button', { name: /login/i }).click()

    await expect(page).toHaveURL(/\/admin(?!\/login)/)
    // The sidebar nav link (id="nav-projects") is the surface a non-technical
    // editor needs after logging in — confirms the dashboard rendered, not
    // just a redirect. `exact: true` disambiguates from the dashboard's
    // "Create new Projects" / "Show all Projects" card action links, which
    // also have accessible names containing "Projects".
    await expect(page.getByRole('link', { name: 'Projects', exact: true })).toBeVisible()
  })
})
