import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config.js'

// Requires a seeded database (npm run seed).

const coreRo = [
  '/',
  '/despre',
  '/despre/cifre',
  '/cereale',
  '/cereale/grau',
  '/depozitare',
  '/depozitare/uscare',
  '/baze/pogoanele',
  '/finantare',
  '/golden-relationship',
  '/logistica',
  '/parteneri',
  '/cariere',
  '/contact',
  '/confidentialitate',
]
const coreEn = [
  '/en',
  '/en/about',
  '/en/storage',
  '/en/partners',
  '/en/financing',
  '/en/contact',
  '/en/privacy',
]

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

  test('a page without an English version is not served under /en', async ({ request }) => {
    expect((await request.get('/en/despre', { maxRedirects: 0 })).status()).toBe(404)
  })
})

test.describe('Core pages', () => {
  for (const path of [...coreRo, ...coreEn]) {
    test(`${path} renders with one H1`, async ({ page }) => {
      const res = await page.goto(path)
      expect(res?.status()).toBe(200)
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('h1')).not.toBeEmpty()
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
    })
  }
})

test.describe('Language switch', () => {
  test('goes to the equivalent page when there is one', async ({ page }) => {
    await page.goto('/despre')
    await page.getByRole('group', { name: 'Limba' }).getByRole('link', { name: 'en' }).click()
    await expect(page).toHaveURL('/en/about')
  })

  test('falls back to the English home otherwise', async ({ page }) => {
    await page.goto('/despre/cifre')
    const en = page.getByRole('group', { name: 'Limba' }).getByRole('link', { name: 'en' })
    await expect(en).toHaveAttribute('href', '/en')
  })
})

test.describe('Lead form', () => {
  const emails = ['e2e-ro@example.ro', 'e2e-en@example.ro']

  test.afterAll(async () => {
    const payload = await getPayload({ config })
    await payload.delete({ collection: 'leads', where: { email: { in: emails } } })
  })

  test('requires phone, email and consent (RO)', async ({ page }) => {
    await page.goto('/contact')
    await page.getByRole('button', { name: 'Trimite cererea' }).click()
    await expect(page.locator('form').getByRole('alert')).toContainText('telefon')
    await expect(page.locator('form').getByRole('alert')).toContainText('e-mail')
    await expect(page.getByLabel('Telefon', { exact: true })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  test('stores and routes a Romanian lead', async ({ page }) => {
    await page.goto('/contact?utm_source=e2e')
    await page.getByLabel('Nume și prenume', { exact: true }).fill('Test E2E')
    await page.getByLabel('Telefon', { exact: true }).fill('0741 201 056')
    await page.getByLabel('E-mail', { exact: true }).fill(emails[0])
    await page.getByLabel(/Sunt de acord/).check()
    await page.getByRole('button', { name: 'Trimite cererea' }).click()
    await expect(page.getByRole('status')).toContainText('Mulțumim')

    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'leads',
      where: { email: { equals: emails[0] } },
    })
    expect(docs).toHaveLength(1)
    expect(docs[0]).toMatchObject({ type: 'general', phone: '0741201056', status: 'new' })
    expect(docs[0].meta).toMatchObject({ locale: 'ro', sourcePath: '/contact', utmSource: 'e2e' })
    expect(docs[0].assignedTo).toBeTruthy()
  })

  test('stores an English lead', async ({ page }) => {
    await page.goto('/en/contact')
    await page.getByLabel('Full name', { exact: true }).fill('Test E2E')
    await page.getByLabel('Phone', { exact: true }).fill('+40 741 201 056')
    await page.getByLabel('Email', { exact: true }).fill(emails[1])
    await page.getByLabel(/I agree/).check()
    await page.getByRole('button', { name: 'Send request' }).click()
    await expect(page.getByRole('status')).toContainText('Thank you')
  })
})
