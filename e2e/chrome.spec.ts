import { expect, test } from '@playwright/test'

// Behavioral coverage for the design-system restyle's shared chrome
// (docs/plans/design-system-restyle.md §6 worklist): the header nav, the
// MobileNav [Client] disclosure below `md`, and the footer tagline + logo.
// Asserts roles/text/behavior only — never CSS classes or the icon font's
// internals (this restyle is presentational; site-header.tsx keeps
// exporting the same NAV_LINKS labels per the plan, hardcoded here rather
// than imported so this spec doesn't couple to a module path).

const NAV_LABELS = ['About', 'Projects', 'Students', 'Blog', 'Partner With Us', 'Get Involved']

test.describe('site header: desktop nav', () => {
  test('renders every nav link, reachable and visible', async ({ page }) => {
    await page.goto('/')
    for (const label of NAV_LABELS) {
      await expect(page.getByRole('link', { name: label, exact: true })).toBeVisible()
    }
  })

  test('marks the current page active via aria-current, and only the current page', async ({
    page,
  }) => {
    // Review-fix batch: NavLink [Client] (usePathname) sets aria-current="page"
    // on the nav link matching the current route (docs/plans review-fix note).
    await page.goto('/projects')
    await expect(page.getByRole('link', { name: 'Projects', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
    // A non-current link must not carry aria-current at all.
    await expect(page.getByRole('link', { name: 'About', exact: true })).not.toHaveAttribute(
      'aria-current',
    )
    await expect(page.getByRole('link', { name: 'Blog', exact: true })).not.toHaveAttribute(
      'aria-current',
    )
  })
})

test.describe('mobile navigation (< md viewport)', () => {
  test.use({ viewport: { width: 375, height: 800 } })

  test('a trigger opens a panel exposing the nav links, closed by default', async ({ page }) => {
    await page.goto('/')

    const trigger = page.getByRole('button', { name: /menu/i })
    await expect(trigger).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    // Closed: nav links aren't reachable/visible yet.
    await expect(page.getByRole('link', { name: 'Projects', exact: true })).not.toBeVisible()

    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    for (const label of NAV_LABELS) {
      await expect(page.getByRole('link', { name: label, exact: true })).toBeVisible()
    }
  })

  test('Escape closes the open panel', async ({ page }) => {
    await page.goto('/')
    const trigger = page.getByRole('button', { name: /menu/i })
    await trigger.click()
    await expect(page.getByRole('link', { name: 'Projects', exact: true })).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(page.getByRole('link', { name: 'Projects', exact: true })).not.toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('clicking a nav link closes the panel and navigates', async ({ page }) => {
    await page.goto('/')
    const trigger = page.getByRole('button', { name: /menu/i })
    await trigger.click()

    await page.getByRole('link', { name: 'About', exact: true }).click()

    await expect(page).toHaveURL(/\/about$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('About Kite & Key IT')
  })
})

test.describe('site footer', () => {
  test('renders the tagline and a logo with an accessible name', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer.getByText('Apply. Solve. Advance.')).toBeVisible()

    // The crest asset may not be vendored yet (interim serif-wordmark
    // fallback per plan §8 R-CREST) — assert on the accessible name, not a
    // specific file: either an <img alt="Kite & Key IT"...> or a text
    // wordmark satisfies this.
    const logoImage = footer.getByRole('img', { name: /kite.*key/i })
    const logoText = footer.getByText(/Kite & Key IT/i)
    await expect(logoImage.or(logoText).first()).toBeVisible()
  })
})
