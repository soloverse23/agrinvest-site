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
    // Pack chips are radios, so the choice works without JavaScript.
    await expect(page.getByRole('radio', { name: /^1 kg/ })).toBeAttached()
    await expect(page.getByRole('radio', { name: /^5 kg/ })).toBeAttached()
    await expect(page.getByText('862 lei').first()).toBeVisible()
    await expect(page.getByText('de confirmat').first()).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Doze recomandate' })).toHaveCount(1)
    await expect(page.getByRole('group', { name: 'Calculator de doză' })).toBeVisible()
    // The quick request replaces the long form; old #cerere links land on it.
    await expect(page.locator('#cerere').getByRole('textbox')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Cere ofertă pentru/ })).toHaveCount(0)
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
    await page
      .locator('main')
      .getByRole('link', { name: /^Porumb/ })
      .click()
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
    await expect(nav.locator('a[href="/depozitare"]')).toHaveCount(1)
  })

  test('the shop panel lists live categories, crops and brands in the HTML', async ({ page }) => {
    await page.goto('/despre')
    const nav = page.getByRole('navigation', { name: 'Navigație principală' }).first()
    await expect(nav.locator('a[href="/magazin/erbicide"]')).toHaveCount(1)
    await expect(nav.locator('a[href^="/magazin/cultura/"]').first()).toBeAttached()
    await expect(nav.locator('a[href^="/magazin/producator/"]').first()).toBeAttached()
    await expect(nav.locator('form[role="search"]')).toHaveCount(1)
  })

  test('the tools hub renders with its tools and a CollectionPage', async ({ page }) => {
    await page.goto('/unelte')
    await expect(page.locator('h1')).toHaveCount(1)
    for (const href of [
      '/preturi',
      '/preturi/calculator-pret-net',
      '/motorina',
      '/finantare/simulator',
    ])
      await expect(page.locator(`main a[href="${href}"]`).first()).toBeAttached()
    expect(await page.locator('script[type="application/ld+json"]').allTextContents()).toEqual(
      expect.arrayContaining([expect.stringContaining('CollectionPage')]),
    )
    await page.goto('/en/tools')
    await expect(page.locator('h1')).toHaveCount(1)
  })

  test('the price ticker is on shop pages, links every price, and is not on home', async ({
    page,
  }) => {
    await page.goto('/magazin')
    const strip = page.locator('div.bg-forest').first()
    await expect(strip.locator('a[href^="/preturi/"]').first()).toBeAttached()
    await expect(strip.locator('a[href="/motorina"]')).toHaveCount(1)
    await page.goto('/')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('div.bg-forest a[href="/motorina"]')).toHaveCount(0)
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
  test('the mega menu stays open on a diagonal move to a panel link', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/despre')
    const nav = page.getByRole('navigation', { name: 'Navigație principală' }).first()
    const item = await nav
      .getByRole('link', { name: 'Prețuri și unelte', exact: true })
      .boundingBox()
    await page.mouse.move(item!.x + item!.width / 2, item!.y + item!.height / 2)
    const target = nav.locator('a[href="/preturi/porumb"]')
    await expect(target).toBeVisible()
    const box = await target.boundingBox()
    await page.mouse.move(box!.x + 20, box!.y + 10, { steps: 25 })
    await expect(target).toBeVisible()
    await target.click()
    await expect(page).toHaveURL(/\/preturi\/porumb$/)
  })

  test('the county map shades the counties with bases and names each on hover', async ({
    page,
  }) => {
    await page.goto('/depozitare')
    const map = page.locator('#baze figure svg[role=img]')
    await expect(map).toHaveAttribute('aria-label', /Buzău/)
    await expect(page.locator('#baze figure use[class*="fill-surface"]')).not.toHaveCount(0)
    await expect(page.locator('#baze figure title', { hasText: /^Buzău: / })).toHaveCount(1)
    await expect(page.locator('#baze figcaption')).toContainText('Capacitate pe județ')
  })

  test('the live panel switches prices without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/')
    const tabs = page.locator('input[name="live-crop"]')
    expect(await tabs.count()).toBeGreaterThan(1)
    const second = await tabs.nth(1).getAttribute('value')
    // The radio is visually hidden; its label is the tab.
    await tabs.nth(1).locator('xpath=..').click()
    await expect(page.locator(`[data-crop="${second}"]`)).toBeVisible()
    await expect(page.locator('[data-crop]:visible')).toHaveCount(1)
    await context.close()
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
    // With JavaScript the buy box keeps the visitor on the page and offers the cart link;
    // without it the form posts and the cart opens.
    const cart = /\/(cos|cart)$/
    const link = page.getByRole('link', { name: /Vezi coșul|View cart/ }).first()
    await Promise.race([page.waitForURL(cart).catch(() => {}), link.waitFor().catch(() => {})])
    if (!cart.test(new URL(page.url()).pathname)) await link.click()
    await page.waitForURL(cart)
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

test.describe('Finance cross-selling', () => {
  test('a shop product carries one brief hint to input financing', async ({ page }) => {
    await page.goto('/magazin/ingrasaminte/uree')
    const hint = page.getByRole('link', { name: 'Cum se pot finanța inputurile' })
    await expect(hint).toHaveCount(1)
    await expect(hint).toHaveAttribute('href', /^\/finantare\//)
  })

  test('the cart shows the financing callout, with the total in the simulator link', async ({
    page,
  }) => {
    await page.goto('/magazin/ingrasaminte/uree')
    await page.getByRole('button', { name: 'Adaugă în coș' }).first().click()
    await page.getByRole('link', { name: 'Vezi coșul' }).first().click()
    await page.waitForURL(/\/cos$/)
    const callout = page.locator('aside', { hasText: 'Agrinvest Credit IFN' })
    await expect(callout.getByRole('heading', { level: 2 })).toBeVisible()
    await expect(callout).toContainText('Nu este o ofertă de credit')
    await expect(callout.getByRole('link', { name: /Simulează ratele/ })).toHaveAttribute(
      'href',
      /^\/finantare\/simulator/,
    )
    await page.getByRole('button', { name: 'Șterge' }).click()
  })

  test('crop and base pages link to stock financing', async ({ page }) => {
    for (const url of ['/cereale/grau', '/baze/pogoanele', '/en/grain/wheat']) {
      await page.goto(url)
      await expect(
        page.locator('a[href$="/finantare-stocuri"], a[href$="/stock-financing"]').first(),
      ).toBeVisible()
    }
  })

  test('the menu and footer lead into the finance section', async ({ page }) => {
    await page.goto('/')
    // The desktop panel and the mobile menu both carry it.
    await expect(page.locator('header a[href="/finantare/simulator"]').first()).toBeAttached()
    await expect(page.locator('footer a[href="/finantare/aplica"]')).toHaveCount(1)
  })
})

test.describe('Grain prices', () => {
  const email = 'e2e-alert@example.ro'

  test.afterAll(async () => {
    const payload = await getPayload({ config })
    await payload.delete({ collection: 'subscriptions', where: { email: { equals: email } } })
  })

  test('every price route answers in Romanian and English', async ({ page }) => {
    for (const url of [
      '/preturi',
      '/preturi/grau',
      '/preturi/porumb',
      '/preturi/floarea-soarelui',
      '/preturi/rapita',
      '/preturi/orz',
      '/preturi/calculator-pret-net',
      '/piata',
      '/en/prices',
      '/en/prices/wheat',
      '/en/prices/corn',
      '/en/prices/sunflower',
      '/en/prices/rapeseed',
      '/en/prices/barley',
      '/en/prices/net-price-calculator',
      '/en/market',
    ]) {
      const res = await page.goto(url)
      expect(res?.status(), url).toBe(200)
      await expect(page.locator('h1'), url).toHaveCount(1)
    }
  })

  test('a crop page carries Dataset JSON-LD and never shows an unpublished price', async ({
    page,
  }) => {
    await page.goto('/preturi/orz')
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join()
    expect(ld).toContain('"Dataset"')
    const payload = await getPayload({ config })
    const barley = await payload.find({ collection: 'crops', where: { key: { equals: 'barley' } } })
    const published = await payload.find({
      collection: 'buy-prices',
      where: { crop: { equals: barley.docs[0].id }, status: { equals: 'published' } },
      limit: 1,
    })
    if (!published.docs.length) {
      await expect(page.getByText('Preț la cerere')).toBeVisible()
      await expect(page.locator('#pret-agrinvest ~ div table')).toHaveCount(0)
    }
  })

  test('the calculator works without JavaScript and is noindex with parameters', async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/preturi/calculator-pret-net')
    await page.locator('[name=cultura]').selectOption('wheat')
    await page.locator('[name=cantitate]').fill('25')
    await page.locator('[name=pret]').fill('1000')
    await page.locator('[name=umiditate]').fill('16')
    await page.locator('[name=impuritati]').fill('3')
    await page.locator('[name=umiditate_baza]').fill('14')
    await page.locator('[name=impuritati_baza]').fill('2')
    await page.getByRole('button', { name: 'Calculează' }).click()
    await page.waitForURL(/cantitate=25/)
    await expect(page.locator('#rezultat dl')).toContainText('24,169 t')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      /\/preturi\/calculator-pret-net$/,
    )
    await context.close()
  })

  test('the price alert sign-up stores a pending subscription with its consent', async ({
    page,
  }) => {
    await page.goto('/preturi/grau')
    const form = page.locator('#alerta form')
    await form.locator('[name=email]').fill(email)
    await form.locator('[name=consent]').check()
    await form.getByRole('button', { name: 'Activează alerta' }).click()
    await expect(page.locator('#alerta').getByRole('status')).toContainText('Am salvat alerta')
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'subscriptions',
      where: { email: { equals: email } },
    })
    expect(docs).toHaveLength(1)
    expect(docs[0]).toMatchObject({ status: 'pending' })
    expect(docs[0].topics?.[0]).toMatchObject({ kind: 'price-alert', rule: 'any' })
  })
})

test.describe('Tools: fertilisers, diesel, news, home', () => {
  const email = 'e2e-diesel@example.ro'

  test.afterAll(async () => {
    const payload = await getPayload({ config })
    await payload.delete({ collection: 'leads', where: { email: { equals: email } } })
  })

  test('the tool pages answer in Romanian and English and link to each other', async ({ page }) => {
    for (const url of [
      '/preturi/ingrasaminte',
      '/en/prices/fertilisers',
      '/motorina',
      '/en/diesel',
      '/stiri',
      '/en/news',
    ]) {
      const res = await page.goto(url)
      expect(res?.status(), url).toBe(200)
      await expect(page.locator('h1'), url).toHaveCount(1)
    }
    await page.goto('/motorina')
    await expect(page.locator('main a[href="/preturi"]').first()).toBeAttached()
    await expect(page.locator('main a[href="/stiri"]').first()).toBeAttached()
  })

  test('the fertiliser page lists shop products with a link to each', async ({ page }) => {
    await page.goto('/preturi/ingrasaminte')
    const rows = page.locator('main table tbody tr')
    expect(await rows.count()).toBeGreaterThan(0)
    await expect(page.locator('main table a[href^="/magazin/"]').first()).toBeAttached()
  })

  test('the home page: slider, live prices and updates, shop, tools, company', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toHaveCount(1)
    // No ticker on home; the hero rail links each price to its own page.
    await expect(page.locator('header div.bg-forest a[href="/motorina"]')).toHaveCount(0)
    const rail = page.locator('aside', { hasText: 'Prețul Agrinvest azi' })
    await expect(rail.locator('a[href^="/preturi/"]').first()).toBeAttached()
    const live = page.locator('section[aria-labelledby="live-title"]')
    await expect(live.getByRole('heading', { name: 'În direct din câmp' })).toBeVisible()
    await expect(live.locator('a[href="/stiri"]')).toBeAttached()
    await expect(live.locator('a[href="/preturi"]')).toBeAttached()
    const shop = page.locator('section[aria-labelledby="magazin"]')
    await expect(shop.locator('a[href="/magazin/seminte"]').first()).toBeAttached()
    await expect(shop.locator('a[href^="/magazin/cultura/"]').first()).toBeAttached()
    await expect(page.locator('section[aria-labelledby="unelte"] a[href="/unelte"]')).toBeAttached()
    await expect(
      page.locator('section[aria-labelledby="agrinvest"] a[href="/cereale"]'),
    ).toBeAttached()
    const jsonLd = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).join('')
    expect(jsonLd).toContain('"FAQPage"')
    expect(jsonLd).toContain('"ItemList"')
    await page.goto('/en')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(
      page.locator('section[aria-labelledby="live-title"] a[href="/en/prices"]'),
    ).toBeAttached()
    await expect(
      page.locator('section[aria-labelledby="magazin"] a[href="/en/shop"]').first(),
    ).toBeAttached()
  })

  test('crop pages and the grain page have no bases section; the figures page has the map', async ({
    page,
  }) => {
    for (const path of ['/cereale/grau', '/en/grain/wheat', '/cereale', '/en/grain', '/']) {
      await page.goto(path)
      await expect(page.locator('#baze')).toHaveCount(0)
    }
    await page.goto('/cereale/grau')
    await expect(page.locator('main')).not.toContainText('Unde livrezi')
    await page.goto('/despre/cifre')
    await expect(page.locator('#baze figure svg[role=img]')).toBeVisible()
  })

  test('the menu and footer link the prices section', async ({ page }) => {
    await page.goto('/despre')
    await expect(page.locator('header a[href="/preturi"]').first()).toBeAttached()
    await expect(page.locator('footer a[href="/motorina"]').first()).toBeAttached()
  })

  test('a diesel quote creates a motorina lead with litres', async ({ page }) => {
    await page.goto('/motorina')
    const form = page.locator('#cerere form')
    await form.locator('[name=name]').fill('Test Motorina')
    await form.locator('[name=phone]').fill('0741 201 056')
    await form.locator('[name=email]').fill(email)
    await form.locator('[name=county]').selectOption({ index: 1 })
    await form.locator('[name=quantity]').fill('5000')
    await form.locator('[name=consent]').check()
    await form.getByRole('button', { name: 'Trimite cererea' }).click()
    await expect(page.locator('#cerere').getByRole('status')).toContainText('Mulțumim')
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'leads',
      where: { email: { equals: email } },
    })
    expect(docs).toHaveLength(1)
    expect(docs[0]).toMatchObject({ type: 'motorina', quantity: 5000 })
  })
})

test('the logistics page shows the diesel card', async ({ page }) => {
  for (const [url, title] of [
    ['/logistica', 'Motorină'],
    ['/en/logistics', 'Diesel'],
  ] as const) {
    await page.goto(url)
    await expect(page.getByRole('heading', { name: title, exact: true }).first()).toBeVisible()
  }
})

test.describe('Guides and news (Phase 6)', () => {
  test('the hub answers in both languages and lists the financing guides', async ({ page }) => {
    for (const [url, finance] of [
      ['/ghiduri', '/finantare/ghiduri'],
      ['/en/guides', '/en/financing/guides'],
    ]) {
      const res = await page.goto(url)
      expect(res?.status(), url).toBe(200)
      await expect(page.locator('h1'), url).toHaveCount(1)
      await expect(page.locator(`main a[href="${finance}"]`).first(), url).toBeAttached()
    }
  })

  test('a brief that is not written yet has no page, and an empty pillar answers 404', async ({
    page,
  }) => {
    for (const url of [
      '/ghiduri/grau/umiditate-grau-standard',
      '/ghiduri/grau',
      '/en/guides/wheat',
      '/stiri/nu-exista',
      '/autori/nu-exista',
    ]) {
      const res = await page.goto(url)
      expect(res?.status(), url).toBe(404)
    }
  })

  test('the menu and footer link the guides', async ({ page }) => {
    await page.goto('/despre')
    await expect(page.locator('header a[href="/ghiduri"]').first()).toBeAttached()
    await expect(page.locator('footer a[href="/ghiduri"]').first()).toBeAttached()
  })
})
