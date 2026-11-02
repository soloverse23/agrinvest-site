import { expect, test } from '@playwright/test'

test.describe('Locale routing', () => {
  test('Romanian is served at the root', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'ro')
    await expect(page.locator('h1')).toHaveCount(1)
  })

  test('English is served under /en', async ({ page }) => {
    await page.goto('/en')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('h1')).toHaveCount(1)
  })

  test('/ro redirects to the unprefixed URL', async ({ request }) => {
    const res = await request.get('/ro', { maxRedirects: 0 })
    expect(res.status()).toBe(308)
    expect(res.headers().location).toBe('/')
  })
})
