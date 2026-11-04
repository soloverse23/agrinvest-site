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
// Every Romanian page has an English equivalent.
const coreEn = [
  '/en',
  '/en/about',
  '/en/about/figures',
  '/en/grain',
  '/en/grain/wheat',
  '/en/storage',
  '/en/storage/drying',
  '/en/bases/pogoanele',
  '/en/financing',
  '/en/golden-relationship',
  '/en/logistics',
  '/en/partners',
  '/en/careers',
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

  test('Romanian slugs are not served under /en', async ({ request }) => {
    expect((await request.get('/en/despre', { maxRedirects: 0 })).status()).toBe(404)
    expect((await request.get('/en/cereale/grau', { maxRedirects: 0 })).status()).toBe(404)
    expect((await request.get('/grain/wheat', { maxRedirects: 0 })).status()).toBe(404)
  })
})

test.describe('Core pages', () => {
  test('shop-only crops have no grain page', async ({ page }) => {
    expect((await page.goto('/cereale/soia'))?.status()).toBe(404)
    expect((await page.goto('/en/grain/soybean'))?.status()).toBe(404)
  })

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

  test('crop and base pages switch to their English twins', async ({ page }) => {
    const en = () => page.getByRole('group', { name: 'Limba' }).getByRole('link', { name: 'en' })
    await page.goto('/cereale/grau')
    await expect(en()).toHaveAttribute('href', '/en/grain/wheat')
    await page.goto('/baze/pogoanele')
    await expect(en()).toHaveAttribute('href', '/en/bases/pogoanele')
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

test.describe('Core page content', () => {
  test('the menu lists sub-pages in the HTML (no JavaScript needed)', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Navigație principală' }).first()
    await expect(nav.locator('a[href="/cereale/grau"]')).toHaveCount(1)
    await expect(nav.locator('a[href="/depozitare/uscare"]')).toHaveCount(1)
  })

  test('a base page pre-selects its base in the delivery form', async ({ page }) => {
    await page.goto('/baze/pogoanele')
    await expect(page.getByLabel('Baza cea mai apropiată')).toHaveValue(/\d+/)
    const selected = await page
      .getByLabel('Baza cea mai apropiată')
      .evaluate((el: HTMLSelectElement) => el.selectedOptions[0]?.textContent)
    expect(selected).toBe('Pogoanele')
  })

  test('the base map lists every base with a link to its page', async ({ page }) => {
    await page.goto('/depozitare')
    await expect(page.locator('#baze nav a[href^="/baze/"]')).toHaveCount(17)
  })

  test('English pages have their own blocks, not Romanian fallbacks', async ({ page }) => {
    await page.goto('/en/storage')
    await expect(page.getByRole('heading', { name: 'Our storage bases' })).toBeVisible()
    await expect(page.locator('main')).not.toContainText('Bazele de depozitare')
  })
})

test.describe('Interactions', () => {
  test('the mega menu stays open on a diagonal move across a neighbour', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/despre')
    const nav = page.getByRole('navigation', { name: 'Navigație principală' }).first()
    const item = await nav.getByRole('link', { name: 'Vinde cereale' }).boundingBox()
    await page.mouse.move(item!.x + item!.width / 2, item!.y + item!.height / 2)
    // Porumb sits right of the item: the path crosses "Depozitare".
    const target = nav.locator('a[href="/cereale/porumb"]')
    const box = await target.boundingBox()
    await page.mouse.move(box!.x + 20, box!.y + 10, { steps: 25 })
    await expect(target).toBeVisible()
    await target.click()
    await expect(page).toHaveURL(/\/cereale\/porumb$/)
  })

  test('a county shows its name and area on hover', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/depozitare')
    await page.locator('#baze use[aria-label="Buzău"]').hover()
    const card = page.locator('#baze [role=status]')
    await expect(card).toContainText('Buzău')
    await expect(card).toContainText('6.103 km²')
  })
})
