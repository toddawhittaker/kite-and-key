import { expect, test } from '@playwright/test'

// Drives the live, seeded dev stack (docker compose up -d && pnpm seed) —
// see playwright.config.ts. Assumes the seed data from src/seed/index.ts is
// present and unmodified.

test.describe('public routes render seeded content', () => {
  test('/ renders the homepage', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('/about renders the about global heading', async ({ page }) => {
    const response = await page.goto('/about')
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('About Kite & Key IT')
  })

  test('/projects lists seeded projects', async ({ page }) => {
    const response = await page.goto('/projects')
    expect(response?.status()).toBe(200)
    await expect(page.getByText('Sample Project — Inventory Tracker')).toBeVisible()
  })

  test('/students lists seeded profiles', async ({ page }) => {
    const response = await page.goto('/students')
    expect(response?.status()).toBe(200)
    await expect(page.getByText('Sample Profile — Student One')).toBeVisible()
  })

  test('/blog lists seeded posts', async ({ page }) => {
    const response = await page.goto('/blog')
    expect(response?.status()).toBe(200)
    await expect(page.getByText(/Sample Post —/).first()).toBeVisible()
  })

  test('/partner renders', async ({ page }) => {
    const response = await page.goto('/partner')
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Partner With Us')
  })

  test('/get-involved renders', async ({ page }) => {
    const response = await page.goto('/get-involved')
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Get Involved')
  })

  test('/projects/sample-project-one renders the project detail', async ({ page }) => {
    const response = await page.goto('/projects/sample-project-one')
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Sample Project — Inventory Tracker',
    )
    await expect(page.getByText('Next.js', { exact: true })).toBeVisible()
  })
})
