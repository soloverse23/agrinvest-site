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
  for (const path of [
    '/magazin',
    '/magazin/erbicide',
    '/magazin/protectia-plantelor',
    '/magazin/cultura/grau',
    '/magazin/substanta-activa/tebuconazol',
    '/magazin/producator/bayer',
    '/magazin/insecticide/karate-zeon',
    '/magazin/seminte/samanta-de-grau-apache-c1',
    '/en/shop',
    '/en/shop/herbicides',
    '/en/shop/crop/wheat',
    '/en/shop/insecticides/karate-zeon',
  ]) {
    test(`${path} renders with one H1`, async ({ page }) => {
      expect((await page.goto(path))?.status()).toBe(200)
      await expect(page.locator('h1')).toHaveCount(1)
    })
  }

  test('a product shows its packs, price marker, doses and no Offer while it is a pilot', async ({
    page,
  }) => {
    await page.goto('/magazin/insecticide/lamdex-extra')
    await expect(page.getByRole('rowheader', { name: '1 kg' })).toBeVisible()
    await expect(page.getByRole('rowheader', { name: '5 kg' })).toBeVisible()
    await expect(page.getByText('862 lei')).toBeVisible()
    await expect(page.getByText('de confirmat').first()).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Doze recomandate' })).toHaveCount(1)
    const schema = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(schema.join()).toContain('"Product"')
    expect(schema.join()).not.toContain('Offer')
  })

  test('a product under another category does not exist', async ({ page }) => {
    expect((await page.goto('/magazin/erbicide/karate-zeon'))?.status()).toBe(404)
  })

  test('filters work as plain links and stay out of the index', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/magazin/erbicide')
    const all = await page.locator('h3').count()
    await page.getByRole('link', { name: /^Porumb/ }).click()
    await expect(page).toHaveURL(/\/magazin\/erbicide\?cultura=porumb/)
    expect(await page.locator('h3').count()).toBeLessThan(all)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/magazin\/erbicide$/,
    )
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    await context.close()
  })

  test('search finds products without diacritics', async ({ page }) => {
    await page.goto('/magazin/cautare?q=tebuconazol')
    await expect(page.getByRole('link', { name: 'Tokama', exact: true })).toBeVisible()
    await page.goto('/magazin/cautare?q=samanta%20grau%20apache')
    await expect(page.locator('h3')).toHaveCount(1)
    await expect(page.locator('h3')).toContainText('Sămânță de grâu Apache C1')
    await page.goto('/magazin/cautare?q=nuexista')
    await expect(page.locator('h3')).toHaveCount(0)
  })

  test('English product pages show no Romanian text', async ({ page }) => {
    await page.goto('/en/shop/insecticides/karate-zeon')
    await expect(page.locator('main')).not.toContainText('insecticid piretroid')
    await expect(page.getByRole('heading', { name: 'Recommended doses' })).toBeVisible()
  })

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

test.describe('Shop orders', () => {
  const product = '/magazin/ingrasaminte/uree'
  const protection = '/magazin/erbicide/adengo'

  const addToCart = async (page: import('@playwright/test').Page, url: string) => {
    await page.goto(url)
    await page
      .getByRole('button', { name: /Adaugă în coș|Add to cart/ })
      .first()
      .click()
    await page.waitForURL(/\/(cos|cart)$/)
  }
  const buyer = async (page: import('@playwright/test').Page) => {
    await page.locator('[name=name]').fill('Test Comandă')
    await page.locator('[name=phone]').fill('0741 201 056')
    await page.locator('[name=email]').fill('test@example.ro')
    await page.locator('[name=deliveryMethod][value=pickup]').check()
    await page.locator('[name=base]').selectOption({ index: 1 })
    await page.locator('[name=consent]').check()
    await page.locator('[name=terms]').check()
  }
  const reference = (page: import('@playwright/test').Page) =>
    page.locator('[data-order-reference]')

  test('a person orders in Romanian and the order reaches the admin, routed', async ({ page }) => {
    await addToCart(page, product)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Coșul tău')
    await page.getByRole('link', { name: 'Continuă comanda' }).click()
    await page.waitForURL('**/comanda')
    await expect(page.locator('[data-company-fields]')).toBeHidden()
    await buyer(page)
    await page.getByRole('button', { name: 'Trimite comanda' }).click()
    await expect(reference(page)).toHaveText(/^AGR-\d{4}-[A-Z2-9]{5}$/)
    const code = await reference(page).textContent()
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'orders',
      where: { reference: { equals: code } },
      depth: 0,
    })
    expect(docs[0]).toMatchObject({ status: 'new', payment: 'consultant' })
    expect(docs[0].assignedTo).toBeTruthy()
    expect(docs[0].lines[0].name).toBe('Uree')
    await payload.delete({ collection: 'orders', id: docs[0].id })
  })

  test('a company orders in English, entering its details by hand', async ({ page }) => {
    await addToCart(page, '/en/shop/fertilisers/uree')
    await page.goto('/en/checkout')
    await page.locator('[name=buyerType][value=company]').check()
    await expect(page.locator('[data-company-fields]')).toBeVisible()
    await buyer(page)
    await page.getByLabel('Tax ID (CUI)').fill('14399840')
    await page.getByLabel('Company name').fill('Firma Test SRL')
    await page.getByLabel('Registered address').fill('Buzău, str. Test 1')
    await page.getByRole('button', { name: 'Send order' }).click()
    await expect(reference(page)).toBeVisible()
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'orders',
      where: { reference: { equals: await reference(page).textContent() } },
      depth: 0,
    })
    expect(docs[0].buyer).toMatchObject({ type: 'company', company: 'Firma Test SRL' })
    await payload.delete({ collection: 'orders', id: docs[0].id })
  })

  test('a professional-use product needs a certificate and the age confirmation', async ({
    page,
  }) => {
    await addToCart(page, protection)
    await page.goto('/comanda')
    await buyer(page)
    await page.getByRole('button', { name: 'Trimite comanda' }).click()
    await expect(page.locator('form [role=alert]')).toContainText('certificatului')
    await expect(page.locator('form [role=alert]')).toContainText('18 ani')
    await expect(reference(page)).toHaveCount(0)
  })

  test('a withdrawn product has no add to cart button', async ({ page }) => {
    await page.goto('/magazin/fungicide/tazer-250-sc')
    await expect(page.getByRole('button', { name: 'Adaugă în coș' })).toHaveCount(0)
    await expect(page.getByRole('note')).toContainText('nu poate fi comandat online')
  })

  test('the cart changes quantities and empties, without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await addToCart(page, product)
    await page.getByLabel('Cantitate').fill('3')
    await page.getByRole('button', { name: 'Actualizează' }).click()
    await expect(page.getByLabel('Cantitate')).toHaveValue('3')
    await page.getByRole('button', { name: 'Șterge' }).click()
    await expect(page.getByText('Coșul este gol.')).toBeVisible()
    await context.close()
  })

  test('cart and checkout are not indexed', async ({ page }) => {
    for (const url of ['/cos', '/en/cart', '/comanda', '/en/checkout']) {
      await page.goto(url)
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    }
  })
})

test.describe('Finance tools', () => {
  test('both tools answer in Romanian and English', async ({ page }) => {
    for (const url of [
      '/finantare/simulator',
      '/en/financing/simulator',
      '/finantare/aplica',
      '/en/financing/apply',
    ]) {
      const res = await page.goto(url)
      expect(res?.status(), url).toBe(200)
      await expect(page.locator('h1')).toHaveCount(1)
    }
  })

  test('the simulator works without JavaScript and keeps the clean canonical', async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/finantare/simulator')
    await page.getByLabel('Suma').fill('300000')
    await page.getByLabel('Durata').fill('24')
    await page.getByLabel('Grâu').check()
    await page.getByLabel('Porumb').check()
    await page.getByRole('button', { name: 'Calculează' }).click()
    await page.waitForURL(/suma=300000/)
    const rows = page.locator('#rezultat tbody tr')
    expect(await rows.count()).toBeGreaterThan(1)
    expect(await rows.count()).toBeLessThanOrEqual(4)
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      /\/finantare\/simulator$/,
    )
    await page.getByRole('link', { name: 'Trimite o cerere cu aceste cifre' }).click()
    await page.waitForURL(/\/finantare\/aplica\?/)
    await expect(page.locator('[name=amount]')).toHaveValue('300000')
    await expect(page.locator('[name=crops][value=wheat]')).toBeChecked()
    await context.close()
  })

  test('a farm applies without JavaScript, as PFA, and the application reaches the IFN', async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/finantare/aplica?produs=credit-productie')
    await page.locator('[name=borrower]').selectOption('pfa')
    await page.locator('[name=cui]').fill('14399840')
    await page.locator('[name=company]').fill('Popescu Ion PFA')
    await page.locator('[name=name]').fill('Test Cerere')
    await page.locator('[name=phone]').fill('0741 201 056')
    await page.locator('[name=email]').fill('test@example.ro')
    await page.locator('[name=county]').selectOption({ index: 1 })
    await page.locator('[name=amount]').fill('150000')
    await page.locator('[name=consent]').check()
    await page.getByRole('button', { name: 'Trimite cererea' }).click()
    const reference = page.locator('[data-application-reference]')
    await expect(reference).toHaveText(/^CRD-\d{4}-[A-Z2-9]{5}$/)
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'finance-applications',
      where: { reference: { equals: await reference.textContent() } },
      depth: 1,
    })
    expect(docs[0]).toMatchObject({ borrower: 'pfa', amount: 150_000, status: 'new' })
    expect(typeof docs[0].product === 'object' && docs[0].product?.slug).toBe('credit-productie')
    await payload.delete({ collection: 'finance-applications', id: docs[0].id })
    await context.close()
  })

  test('a company applies in English and a bad tax ID keeps what was typed', async ({ page }) => {
    await page.goto('/en/financing/apply')
    await page.locator('[name=borrower]').selectOption('srl')
    await page.locator('[name=cui]').fill('123')
    await page.locator('[name=company]').fill('Test Farm SRL')
    await page.locator('[name=name]').fill('Test Application')
    await page.locator('[name=phone]').fill('0741 201 056')
    await page.locator('[name=email]').fill('test@example.ro')
    await page.locator('[name=county]').selectOption({ index: 1 })
    await page.locator('[name=amount]').fill('500000')
    await page.locator('[name=consent]').check()
    await page.getByRole('button', { name: 'Send application' }).click()
    await expect(page.locator('form [role=alert]')).toContainText('tax ID')
    await expect(page.locator('[name=company]')).toHaveValue('Test Farm SRL')
    await page.locator('[name=cui]').fill('14399840')
    await page.getByRole('button', { name: 'Send application' }).click()
    const reference = page.locator('[data-application-reference]')
    await expect(reference).toBeVisible()
    const payload = await getPayload({ config })
    await payload.delete({
      collection: 'finance-applications',
      where: { reference: { equals: await reference.textContent() } },
    })
  })

  test('product pages link to both tools', async ({ page }) => {
    await page.goto('/finantare/credit-productie')
    await expect(page.getByRole('link', { name: 'Trimite o cerere' }).last()).toHaveAttribute(
      'href',
      '/finantare/aplica?produs=credit-productie',
    )
    await expect(page.getByRole('link', { name: 'Simulează ratele' })).toHaveAttribute(
      'href',
      '/finantare/simulator',
    )
  })
})
