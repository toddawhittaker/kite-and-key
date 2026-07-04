import { expect, test } from '@playwright/test'

// Negative-auth boundaries against the live REST API, as an anonymous
// caller. The authoritative, fixture-controlled draft regression lives in
// src/tests/integration/drafts.int.test.ts; this is the boundary smoke test
// against the real stack. We deliberately do NOT create a draft in the dev
// DB here — "must not touch dev data."

test.describe('anonymous REST API access boundaries', () => {
  test('GET /api/partner-opportunities is forbidden', async ({ request }) => {
    const response = await request.get('/api/partner-opportunities')
    expect(response.status()).toBe(403)
  })

  test('GET /api/users is forbidden', async ({ request }) => {
    const response = await request.get('/api/users')
    expect(response.status()).toBe(403)
  })

  test('GET /api/projects is public', async ({ request }) => {
    const response = await request.get('/api/projects')
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(Array.isArray(body.docs)).toBe(true)
    expect(body.docs.length).toBeGreaterThan(0)
  })

  test('?draft=true does not flip anon access — no draft docs leak through', async ({
    request,
  }) => {
    const response = await request.get('/api/projects?draft=true')
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.docs.length).toBeGreaterThan(0)
    for (const doc of body.docs) {
      expect(doc._status).not.toBe('draft')
    }
  })

  test('the /projects page HTML never embeds a draft document', async ({ page }) => {
    await page.goto('/projects')
    const html = await page.content()
    expect(html).not.toContain('"_status":"draft"')
  })
})
