/**
 * Demo seed: fills every place the site waits for hand-entered data, with history, so the whole
 * site can be checked end to end. EVERYTHING HERE IS INVENTED. It is never meant for production.
 * Local databases only. Undo with `npm run unseed:demo`. Run with `npm run seed:demo`.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { evaluateAlerts, draftMarketNote } from '@/lib/jobs/tasks'
import { buildIssue } from '@/lib/news/newsletter'
import { rt } from '@/lib/richtext'
import { newReference } from '@/lib/reference'
import { productGaps } from '@/lib/shop/rules'
import { SUBSCRIPTION_CONSENT_VERSION, subscriptionConsent } from '@/lib/subscriptions/state'
import { newsSources } from '@/lib/sources'
import { sendMessage } from '@/lib/messaging/send'
import { randomBytes } from 'node:crypto'

import {
  assertLocal,
  clearNextCache,
  Demo,
  demoPdf,
  loadManifest,
  remoteAllowed,
  monday,
  rng,
  saveManifest,
} from './kit'

assertLocal()
if (loadManifest()) {
  console.error('The demo seed is already applied. Run `npm run unseed:demo` first.')
  process.exit(1)
}
const payload = await getPayload({ config })
// Deploys repeat this step: once the demo staff account exists, the seed has run.
if (remoteAllowed()) {
  const done = await payload.find({
    collection: 'users',
    where: { email: { equals: 'demo-admin@agrinvest.test' } },
    limit: 1,
    depth: 0,
  })
  if (done.docs[0]) {
    console.log('demo seed: already applied on this database, skipping')
    process.exit(0)
  }
}
const startedAt = new Date()
const demo = new Demo(payload, {
  startedAt: startedAt.toISOString(),
  created: {},
  changed: {},
  globals: {},
})
for (const ev of ['uncaughtException', 'unhandledRejection'] as const)
  process.on(ev, (e) => {
    saveManifest(demo.m)
    console.error(
      'Seed failed; the manifest was saved, so `npm run unseed:demo` can undo the partial run.\n',
      e,
    )
    process.exit(1)
  })
const now = new Date('2026-11-10T09:00:00Z')
const skip = { context: { skipAlerts: true, skipChildren: true } }
const rand = rng(2611)
const day = (d: Date) => d.toISOString()
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000)
const step = (x: number, pct: number) => x * (1 + (rand() - 0.5) * 2 * pct)
const round5 = (x: number) => Math.round(x / 5) * 5

const all = async (collection: string, extra: Record<string, unknown> = {}) =>
  (
    await payload.find({
      collection: collection as never,
      limit: 1000,
      pagination: false,
      depth: 0,
      locale: 'ro',
      fallbackLocale: false,
      ...extra,
    } as never)
  ).docs as unknown as Record<string, any>[]

const outboxBefore = new Set((await all('outbox')).map((o) => o.id))
const log = (s: string) => console.log(s)

/* ------------------------------------------------------------------ lookups */
const crops = await all('crops')
const cropId = (key: string) => crops.find((c) => c.key === key)!.id as number
const counties = await all('counties')
const county = (name: string) => counties.find((c) => c.name === name)!
const bases = await all('bases', { draft: true })
const people = await all('people')
const brands = await all('brands')

/* ------------------------------------------------------------------ 1. staff accounts */
if (remoteAllowed() && !process.env.DEMO_PASSWORD)
  throw new Error('A remote demo seed needs DEMO_PASSWORD; the default password is public.')
const password = process.env.DEMO_PASSWORD ?? 'Demo-Agrinvest-2026'
const accounts = [
  { email: 'demo-admin@agrinvest.test', roles: ['admin'] },
  { email: 'demo-ifn@agrinvest.test', roles: ['ifn'] },
  { email: 'demo-staff@agrinvest.test', roles: [] },
]
for (const a of accounts) {
  const found = await payload.find({
    collection: 'users',
    where: { email: { equals: a.email } },
    limit: 1,
    depth: 0,
  })
  if (!found.docs[0]) await demo.create('users', { ...a, password })
}
log(`users: ${accounts.length} accounts`)

/* ------------------------------------------------------------------ 2. reference data */
// People: public contact details, so contact blocks render in full.
for (const p of people) {
  await demo.change('people', p.id, ['phone', 'publishPhone', 'email', 'publishEmail', 'author'], {
    phone: p.phone ?? `+40 700 000 0${String(10 + p.id).padStart(2, '0')}`,
    publishPhone: true,
    email: p.email ?? `demo.${p.id}@agrinvest.test`,
    publishEmail: true,
    author: {
      ...(p.author ?? {}),
      bio: p.author?.bio ?? `${p.name} (profil demonstrativ): ${p.role}, la Agrinvest din 2012.`,
      credentials: p.author?.credentials ?? 'Date demonstrative.',
    },
  })
}

// Crops: reception limits and GDD bases.
const quality: Record<string, [number, number, number, number]> = {
  wheat: [14, 2, 76, 4],
  maize: [14, 2, 70, 10],
  sunflower: [9, 3, 38, 6],
  rapeseed: [9, 2, 62, 5],
  barley: [14, 2, 62, 4],
}
for (const [key, [moisture, impurities, hectolitre, gdd]] of Object.entries(quality)) {
  await demo.change('crops', cropId(key), ['quality', 'gddBase'], {
    gddBase: gdd,
    quality: {
      moisture,
      impurities,
      hectolitre,
      notes: 'Limite demonstrative, după recepția în bază.',
    },
  })
  await demo.changeEn('crops', cropId(key), {
    quality: { notes: 'Demo limits, as applied at base reception.' },
  })
}

// Bases: location, contact, hours, services. Counties and addresses are INVENTED placeholders.
const placement: Record<string, [string, string]> = {
  Balaci: ['Teleorman', 'Balaci'],
  Baraitaru: ['Prahova', 'Bărăitaru'],
  Cetate: ['Dolj', 'Cetate'],
  Crețești: ['Vaslui', 'Crețești'],
  Foltești: ['Galați', 'Foltești'],
  Fulga: ['Prahova', 'Fulga'],
  Grădiștea: ['Brăila', 'Grădiștea'],
  Mihăilești: ['Giurgiu', 'Mihăilești'],
  Pogoanele: ['Buzău', 'Pogoanele'],
  Sărățuica: ['Ialomița', 'Sărățuica'],
  'Slobozia Mândră': ['Teleorman', 'Slobozia Mândră'],
  Știubei: ['Argeș', 'Știubei'],
  Stolnici: ['Argeș', 'Stolnici'],
  Strejnicu: ['Prahova', 'Strejnicu'],
  Traian: ['Brăila', 'Traian'],
  'Valea Nucarilor': ['Tulcea', 'Valea Nucarilor'],
  Vedea: ['Giurgiu', 'Vedea'],
}
const services = ['reception', 'drying', 'cleaning', 'weighing', 'storage']
const contacts = people.filter((p) => ['Toma Ion', 'Agrinvest'].includes(p.name))
let bi = 0
for (const b of bases) {
  const [cName, locality] = placement[b.name] ?? ['Buzău', b.name]
  const c = county(cName)
  const k = bi++
  const lat = c.centroid.lat + 0.08 * Math.sin(k * 2.1)
  const lng = c.centroid.lng + 0.1 * Math.cos(k * 2.1)
  await demo.change(
    'bases',
    b.id,
    [
      'county',
      'address',
      'geo',
      'phone',
      'contact',
      'services',
      'hours',
      'intro',
      'capacityStatus',
      'locationStatus',
      'servicesStatus',
      'contactStatus',
    ],
    {
      county: c.id,
      address: {
        street: `Str. Silozului nr. ${3 + k}`,
        locality,
        postalCode: String(100000 + k * 137),
      },
      geo: { lat: Math.round(lat * 1e4) / 1e4, lng: Math.round(lng * 1e4) / 1e4 },
      phone: `+40 700 100 ${String(100 + k).padStart(3, '0')}`,
      contact: contacts[k % contacts.length].id,
      services: k % 4 === 3 ? services.slice(0, 4) : services,
      hours: [
        { days: ['Mo', 'Tu', 'We', 'Th', 'Fr'], opens: '07:00', closes: '18:00' },
        { days: ['Sa'], opens: '08:00', closes: '13:00' },
      ],
      intro: `Baza ${b.name} (date demonstrative) primește, usucă și depozitează cereale din zona ${locality}.`,
      capacityStatus: 'confirmed',
      locationStatus: 'confirmed',
      servicesStatus: 'confirmed',
      contactStatus: 'confirmed',
    },
    { draft: false },
  )
  await demo.changeEn('bases', b.id, {
    intro: `The ${b.name} base (demo data) receives, dries and stores grain from the ${locality} area.`,
  })
}
log(`bases: ${bases.length} filled; crops, people updated`)

// Figures register: every row confirmed.
{
  const rows = await Promise.all(
    (['ro', 'en'] as const).map((locale) =>
      payload.findGlobal({ slug: 'figures', locale, fallbackLocale: false, depth: 0 }),
    ),
  )
  demo.m.globals.figures = { ro: { rows: rows[0].rows }, en: { rows: rows[1].rows } }
  await payload.updateGlobal({
    slug: 'figures',
    locale: 'ro',
    context: { skipChildren: true },
    data: {
      rows: (rows[0].rows ?? []).map((r) => ({
        ...r,
        status: 'confirmed',
        confirmedBy: r.confirmedBy ?? 'demo',
        confirmedAt: r.confirmedAt ?? '2026-11-09T00:00:00.000Z',
      })),
    },
  } as never)
}

/* ------------------------------------------------------------------ 3. prices */
const cropPrices: Record<string, number> = {
  wheat: 1020,
  maize: 910,
  sunflower: 2280,
  rapeseed: 2350,
  barley: 860,
}
const WEEKS = 26
const priceBases = [
  'Pogoanele',
  'Crețești',
  'Sărățuica',
  'Vedea',
  'Mihăilești',
  'Fulga',
  'Grădiștea',
  'Foltești',
]
const baseOffset = new Map(priceBases.map((n) => [n, Math.round((rand() - 0.5) * 12) * 5]))
let buyRows = 0
for (const [key, start] of Object.entries(cropPrices)) {
  let price = start * 0.94
  for (let w = WEEKS; w >= 0; w--) {
    price = round5(step(price, 0.012) + (start - price) * 0.04)
    const validFrom = monday(now, w)
    const latest = w === 0
    const noteRo = latest
      ? 'Preț demonstrativ, doar pentru testare. Marfă conformă cu limitele de recepție.'
      : undefined
    const noteEn = latest
      ? 'Demo price, for testing only. Grain within the reception limits.'
      : undefined
    const row = await demo.create(
      'buy-prices',
      {
        crop: cropId(key),
        price,
        basis: 'la-baza',
        validFrom: day(validFrom),
        status: 'published',
        source: 'manual',
        note: noteRo,
      },
      { locale: 'ro', ...skip },
    )
    if (noteEn) await demo.changeEn('buy-prices', row.id, { note: noteEn })
    buyRows++
    if (w <= 7) {
      for (const name of priceBases) {
        const base = bases.find((b) => b.name === name)!
        await demo.create(
          'buy-prices',
          {
            crop: cropId(key),
            base: base.id,
            price: round5(price + baseOffset.get(name)! + (rand() - 0.5) * 10),
            basis: name === 'Vedea' ? 'la-ferma' : 'la-baza',
            validFrom: day(validFrom),
            status: 'published',
            source: 'manual',
          },
          { locale: 'ro', ...skip },
        )
        buyRows++
      }
    }
  }
}
// One draft row per crop, to see how the admin and the public page treat unpublished prices.
for (const key of Object.keys(cropPrices))
  await demo.create(
    'buy-prices',
    {
      crop: cropId(key),
      price: cropPrices[key] + 25,
      basis: 'la-baza',
      validFrom: day(addDays(now, 5)),
      status: 'draft',
      source: 'manual',
      note: 'Ciornă: se publică după verificare.',
    },
    { locale: 'ro', ...skip },
  )
log(`buy-prices: ${buyRows} published rows + ${Object.keys(cropPrices).length} drafts`)

// Diesel: weekly history, newest published row carries counties and minimum.
{
  let p = 8.1
  const served = ['Buzău', 'Brăila', 'Ialomița', 'Prahova', 'Galați', 'Giurgiu'].map(
    (n) => county(n).id,
  )
  for (let w = WEEKS; w >= 0; w--) {
    p = Math.round(step(p, 0.012) * 100) / 100
    const latest = w === 0
    const row = await demo.create(
      'diesel-prices',
      {
        price: p,
        vat: 'fara-tva',
        validFrom: day(monday(now, w)),
        minimumLitres: 1000,
        counties: served,
        status: 'published',
        note: latest
          ? 'Preț demonstrativ pentru livrare în cisternă, min. 1.000 l. Doar pentru testare.'
          : undefined,
      },
      { locale: 'ro', ...skip },
    )
    if (latest)
      await demo.changeEn('diesel-prices', row.id, {
        note: 'Demo price for tanker delivery, min. 1,000 l. For testing only.',
      })
  }
  await demo.create(
    'diesel-prices',
    { price: 8.55, vat: 'fara-tva', validFrom: day(addDays(now, 5)), status: 'draft' },
    { locale: 'ro', ...skip },
  )
}
log('diesel-prices: history + a draft')

// EU series (the live API is down): cereals weekly for 53 weeks, fertilisers monthly for 24 months.
{
  const series = [
    { series: 'milling-wheat', markets: ['Constanta / FOB', 'Braila / Ex-works'], base: 215 },
    { series: 'feed-maize', markets: ['Constanta / FOB', 'Calarasi / Ex-works'], base: 205 },
    { series: 'feed-barley', markets: ['Constanta / FOB', 'Braila / Ex-works'], base: 190 },
  ]
  let n = 0
  for (const s of series) {
    for (const [mi, market] of s.markets.entries()) {
      let p = s.base * (mi ? 0.96 : 1)
      for (let w = 52; w >= 0; w--) {
        p = Math.round(step(p, 0.012) * 10) / 10
        const period = monday(now, w)
        await demo.create('market-prices', {
          key: `eu-agrifood|${s.series}|${market}|${day(period).slice(0, 10)}`,
          source: 'eu-agrifood',
          series: s.series,
          market,
          price: p,
          currency: 'EUR',
          unit: 't',
          period: day(period),
          fetchedAt: day(now),
        })
        n++
      }
    }
  }
  const fert = [
    ['urea', 520],
    ['calcium-ammonium-nitrate-can-27', 380],
    ['npk-15-15-15', 470],
    ['dap', 640],
  ] as const
  for (const [s, base] of fert)
    for (const market of ['Romania', 'EU']) {
      let p = base * (market === 'EU' ? 0.97 : 1)
      for (let m = 23; m >= 0; m--) {
        p = Math.round(step(p, 0.02))
        const period = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - m, 1))
        await demo.create('market-prices', {
          key: `eu-fertiliser|${s}|${market}|${day(period).slice(0, 10)}`,
          source: 'eu-fertiliser',
          series: s,
          market,
          price: p,
          currency: 'EUR',
          unit: 't',
          period: day(period),
          fetchedAt: day(now),
        })
        n++
      }
    }
  log(`market-prices: ${n} demo rows (the real Oil Bulletin rows stay)`)
}

/* ------------------------------------------------------------------ 4. shop */
// Documents: nine small PDFs, shared by product type.
const docIds: Record<string, number[]> = {}
for (const type of ['protection', 'seed', 'fertiliser']) {
  docIds[type] = []
  for (const [kind, ro, en] of [
    ['technical', 'Fișă tehnică', 'Technical sheet'],
    ['safety', 'Fișă de securitate', 'Safety data sheet'],
    ['label', 'Etichetă', 'Label'],
  ] as const) {
    if (type === 'seed' && kind === 'safety') continue
    const name = `demo-${type}-${kind}.pdf`
    const pdf = demoPdf(`${ro} (${type})`)
    const doc = await demo.create(
      'documents',
      {
        title: `${ro} (demo)`,
        kind,
        language: 'ro',
        version: '2026',
        rights: 'owned',
        source: 'https://example.com/demo',
      },
      { locale: 'ro', file: { data: pdf, mimetype: 'application/pdf', name, size: pdf.length } },
    )
    await demo.changeEn('documents', doc.id, { title: `${en} (demo)` })
    docIds[type].push(doc.id)
  }
}

const products = await all('products', { draft: true })
const ingredients = await all('active-ingredients')
const cropByWords: [RegExp, string][] = [
  [/porumb|maize|corn/i, 'maize'],
  [/floarea|sunflower/i, 'sunflower'],
  [/rapit|rapeseed/i, 'rapeseed'],
  [/orz|barley/i, 'barley'],
]
let live = 0
let pi = 0
for (const p of products) {
  const k = pi++
  const gaps = productGaps(p as never)
  const name: string = p.name ?? ''
  const keys = [
    'variants',
    'brand',
    'crops',
    'summary',
    'documents',
    'protection',
    'seed',
    'fertiliser',
    'verification',
    'commerceStatus',
  ]
  const data: Record<string, any> = {}
  const vat = p.productType === 'seed' ? 11 : 21
  data.variants = (p.variants ?? []).map((v: any, i: number) => ({
    ...v,
    vatRate: v.vatRate ?? vat,
    stock:
      (k + i) % 13 === 5
        ? 'on-request'
        : (k + i) % 29 === 7
          ? 'out-of-stock'
          : (v.stock ?? 'in-stock'),
  }))
  if (gaps.includes('brand')) {
    const hit = brands.find((b) => name.toLowerCase().includes(String(b.name).toLowerCase()))
    data.brand = (hit ?? brands[k % brands.length]).id
  }
  if (gaps.includes('crops')) {
    const hit = cropByWords.find(([re]) => re.test(name))
    data.crops = hit
      ? [cropId(hit[1])]
      : p.productType === 'fertiliser'
        ? Object.keys(cropPrices).map(cropId)
        : [cropId('wheat'), cropId('maize')]
  }
  if (gaps.includes('summary'))
    data.summary = `${name}: produs din catalog, cu fișă tehnică și ambalaje la zi (text demonstrativ).`
  data.documents = p.documents?.length ? p.documents : (docIds[p.productType] ?? [])
  const cropsForDose = (data.crops ?? p.crops ?? [cropId('wheat')]).slice(0, 2)
  const cropText = (id: number) => crops.find((c) => c.id === id)?.name ?? 'Grâu'
  if (p.productType === 'protection') {
    const g = { ...(p.protection ?? {}) }
    if (!g.activeIngredients?.length)
      g.activeIngredients = [
        { ingredient: ingredients[k % ingredients.length].id, concentration: 480, unit: 'g/l' },
      ]
    g.formulation ||= 'SC'
    g.registrationNumber ||= `DEMO-${String(1000 + p.id)}`
    g.registrationValidUntil ||= '2029-12-31T00:00:00.000Z'
    if (!g.doses?.length)
      g.doses = cropsForDose.map((id: number) => ({
        cropText: cropText(id),
        crops: [id],
        targetText: 'Buruieni anuale',
        timing: 'BBCH 21–29',
        doseText: '0,5–1 l/ha',
        doseMin: 0.5,
        doseMax: 1,
        doseUnit: 'l/ha',
        waterVolume: '200–300 l/ha',
        maxTreatments: 1,
        waitingPeriod: 30,
        notes: 'Doze demonstrative, nu pentru uz în câmp.',
      }))
    g.modeOfAction ||= 'Acțiune sistemică (text demonstrativ).'
    data.protection = g
  }
  if (p.productType === 'seed') {
    const g = { ...(p.seed ?? {}) }
    g.species ||= cropText(cropsForDose[0])
    g.variety ||= `Demo ${p.id}`
    g.sowingRate ||= '60 kg/ha'
    data.seed = g
  }
  if (p.productType === 'fertiliser') {
    const g = { ...(p.fertiliser ?? {}) }
    if (!g.nutrients?.length)
      g.nutrients = [
        { nutrient: 'N', percent: 27 },
        { nutrient: 'S', percent: 4 },
      ]
    g.form ||= 'Granule'
    if (!g.rates?.length)
      g.rates = cropsForDose.map((id: number) => ({
        cropText: cropText(id),
        crops: [id],
        timing: 'Primăvara, înainte de semănat',
        rateText: '200–300 kg/ha',
        rateMin: 200,
        rateMax: 300,
        rateUnit: 'kg/ha',
      }))
    data.fertiliser = g
  }
  const v = p.verification ?? {}
  data.verification = {
    price: { ...(v.price ?? {}), status: 'confirmed' },
    technical: { ...(v.technical ?? {}), status: 'confirmed' },
    doses: { ...(v.doses ?? {}), status: 'confirmed' },
  }
  await demo.change('products', p.id, keys, data, {
    draft: p._status === 'draft',
    context: { skipChildren: true },
  })
  try {
    await demo.change(
      'products',
      p.id,
      keys,
      { commerceStatus: 'live' },
      { draft: p._status === 'draft' },
    )
    live++
  } catch {
    /* an expired registration keeps the product in pilot, which is also worth seeing */
  }
}
log(`products: ${products.length} completed, ${live} set live`)

// Shop price history: five earlier points per pack, ending in today's price.
{
  const after = await all('products', { draft: true })
  let n = 0
  for (const p of after) {
    for (const v of p.variants ?? []) {
      if (!v.price) continue
      let price = v.price * 0.93
      for (const back of [150, 120, 90, 60, 30]) {
        price = Math.round(step(price, 0.03) * 100) / 100
        await demo.create('price-history', {
          product: p.id,
          sku: v.sku,
          price,
          date: day(addDays(now, -back)),
          source: 'demo',
        })
        n++
      }
    }
  }
  log(`price-history: ${n} rows`)
}

/* ------------------------------------------------------------------ 5. news, notes, guides */
const news = await all('news-items')
for (const [i, n] of news.slice(0, 15).entries()) {
  const status = i < 12 ? 'aprobat' : 'ascuns'
  const c = [cropId(Object.keys(cropPrices)[i % 5])]
  await demo.change('news-items', n.id, ['status', 'crops'], {
    status,
    crops: status === 'aprobat' ? c : [],
  })
}

const author = people.find((p) => p.isAuthor) ?? people[0]
const reviewer = people.find((p) => p.name === 'Toma Ion') ?? people[0]
const noteWeeks = [2, 1, 0]
for (const w of noteWeeks) {
  const when = addDays(monday(now, w), 3)
  const res = await draftMarketNote(payload, w === 0 ? now : when)
  const key = `piata-${monday(w === 0 ? now : when, 0)
    .toISOString()
    .slice(0, 10)}`
  const found = await payload.find({
    collection: 'guides',
    where: { key: { equals: key } },
    draft: true,
    limit: 1,
    depth: 0,
  })
  const g = found.docs[0]
  if (!g) {
    log(`market note ${key}: ${JSON.stringify(res)}`)
    continue
  }
  demo.track('guides', [g.id])
  const extra =
    '\n\n## Ce înseamnă pentru fermier\n\nPrețurile au rămas aproape de media ultimelor săptămâni. Verifică prețul bazei tale înainte de livrare (text demonstrativ).'
  const body = (g.body as never) ?? rt('## Notă\n\nText demonstrativ.')
  await payload.update({
    collection: 'guides',
    id: g.id,
    locale: 'ro',
    depth: 0,
    data: {
      _status: 'published',
      author: author.id,
      reviewer: reviewer.id,
      body: rt(extra.trim()) as never,
      review: {
        legalStatus: 'legal-approved',
        status: 'confirmed',
        reviewedAt: '2026-11-09T00:00:00.000Z',
        reviewedBy: 'Demo',
      },
    } as never,
  })
  void body
}

const stiri = [
  [
    'Prețurile cerealelor în prima săptămână din noiembrie',
    'Grâul și porumbul se mențin; floarea-soarelui urcă ușor.',
    'grau',
  ],
  [
    'Ce schimbă motorina mai scumpă în planul de toamnă',
    'Costul combustibilului pentru arături și transport, pe scurt.',
    'motorina',
  ],
  [
    'Cum pregătești recepția la bază',
    'Umiditate, impurități și masă hectolitrică: ce se verifică și cum se calculează prețul net.',
    'receptie',
  ],
] as const
for (const [title, summary, slug] of stiri) {
  const doc = await demo.create(
    'guides',
    {
      key: `stiri-demo-${slug}`,
      section: 'stiri',
      title,
      slug: `demo-${slug}`,
      generateSlug: false,
      summary,
      body: rt(
        `## ${title}\n\n${summary} Text demonstrativ, scris pentru a verifica pagina de știri.\n\n- Punct unu\n- Punct doi\n\nAfișează [calculatorul de preț net](/preturi/calculator-pret-net).`,
      ) as never,
      author: author.id,
      reviewer: reviewer.id,
      _status: 'published',
      review: {
        legalStatus: 'legal-approved',
        status: 'confirmed',
        reviewedAt: '2026-11-09T00:00:00.000Z',
        reviewedBy: 'Demo',
      },
    },
    { locale: 'ro' },
  )
  await demo.changeEn('guides', doc.id, {
    title: `Demo news: ${title}`,
    slug: `demo-${slug}`,
    generateSlug: false,
    summary: `Demo summary: ${summary}`,
    body: rt(`## Demo news\n\nDemo text, written to check the news page.`) as never,
  })
}

// Finance: pages and products approved, limits filled.
{
  const review = {
    legalStatus: 'legal-approved',
    status: 'confirmed',
    reviewedAt: '2026-11-09T00:00:00.000Z',
    reviewedBy: 'Demo (IFN)',
  }
  const gs = (await all('guides', { draft: true })).filter((g) =>
    ['finantare', 'pagina-finantare'].includes(g.section),
  )
  for (const g of gs) await demo.change('guides', g.id, ['review'], { review })
  const fps = await all('finance-products', { draft: true })
  for (const [i, f] of fps.entries())
    await demo.change('finance-products', f.id, ['review', 'limits'], {
      review,
      limits: {
        amountMin: f.limits?.amountMin ?? 10_000 * (1 + (i % 3)),
        amountMax: f.limits?.amountMax ?? 500_000 * (1 + (i % 4)),
        termMonths: f.limits?.termMonths ?? 6 + (i % 5) * 12,
      },
    })
  log(`finance: ${gs.length} pages, ${fps.length} products approved`)
}

/* ------------------------------------------------------------------ 6. subscriptions, alerts, newsletter */
const subs: Array<{
  email?: string
  phone?: string
  channel: 'email' | 'whatsapp'
  locale: 'ro' | 'en'
  status: 'pending' | 'confirmed' | 'unsubscribed'
  topics: Record<string, unknown>[]
}> = [
  {
    email: 'ion.popescu@demo.agrinvest.test',
    channel: 'email',
    locale: 'ro',
    status: 'confirmed',
    topics: [{ kind: 'price-alert', crop: cropId('wheat'), rule: 'any' }, { kind: 'newsletter' }],
  },
  {
    email: 'maria.ionescu@demo.agrinvest.test',
    channel: 'email',
    locale: 'ro',
    status: 'confirmed',
    topics: [{ kind: 'price-alert', crop: cropId('maize'), rule: 'above', threshold: 900 }],
  },
  {
    email: 'george.dumitru@demo.agrinvest.test',
    channel: 'email',
    locale: 'ro',
    status: 'pending',
    topics: [
      { kind: 'price-alert', crop: cropId('sunflower'), rule: 'below', threshold: 2400 },
      { kind: 'newsletter' },
    ],
  },
  {
    email: 'ana.stan@demo.agrinvest.test',
    channel: 'email',
    locale: 'en',
    status: 'confirmed',
    topics: [{ kind: 'newsletter' }],
  },
  {
    email: 'vlad.matei@demo.agrinvest.test',
    channel: 'email',
    locale: 'ro',
    status: 'unsubscribed',
    topics: [{ kind: 'newsletter' }],
  },
  {
    phone: '0700 200 001',
    channel: 'whatsapp',
    locale: 'ro',
    status: 'confirmed',
    topics: [{ kind: 'price-alert', crop: cropId('rapeseed'), rule: 'any' }],
  },
  {
    phone: '0700 200 002',
    channel: 'whatsapp',
    locale: 'ro',
    status: 'pending',
    topics: [{ kind: 'price-alert', crop: cropId('barley'), rule: 'above', threshold: 800 }],
  },
  {
    phone: '0700 200 003',
    channel: 'whatsapp',
    locale: 'ro',
    status: 'confirmed',
    topics: [{ kind: 'frost-alert', county: county('Buzău').id }],
  },
  {
    email: 'cristina.radu@demo.agrinvest.test',
    channel: 'email',
    locale: 'ro',
    status: 'confirmed',
    topics: [
      { kind: 'price-alert', crop: cropId('wheat'), rule: 'below', threshold: 1100 },
      { kind: 'price-alert', crop: cropId('maize'), rule: 'any' },
    ],
  },
  {
    email: 'tom.baker@demo.agrinvest.test',
    channel: 'email',
    locale: 'en',
    status: 'pending',
    topics: [{ kind: 'price-alert', crop: cropId('wheat'), rule: 'any' }, { kind: 'newsletter' }],
  },
]
for (const s of subs) {
  const sub = await demo.create('subscriptions', {
    ...s,
    token: randomBytes(24).toString('base64url'),
    consent: {
      version: SUBSCRIPTION_CONSENT_VERSION,
      at: day(addDays(now, -9)),
      text: subscriptionConsent[s.locale],
      sourcePath: s.locale === 'ro' ? '/preturi/grau' : '/en/prices/wheat',
    },
  })
  await sendMessage(payload, {
    channel: s.channel,
    to: (s.email ?? s.phone)!,
    template: 'subscription-confirm',
    subscription: sub.id,
    subject:
      s.locale === 'ro' ? 'Confirmă abonarea la Agrinvest' : 'Confirm your Agrinvest subscription',
    body:
      s.locale === 'ro'
        ? 'Apasă linkul pentru a confirma (mesaj demonstrativ).'
        : 'Click the link to confirm (demo message).',
    dedupeKey: `demo-confirm-${sub.id}`,
  })
}
const alerts = await evaluateAlerts(payload)
log(`subscriptions: ${subs.length}; alerts evaluated: ${JSON.stringify(alerts)}`)

// Newsletter issues for earlier weeks, in both languages.
{
  const latest = await all('buy-prices', {
    where: { status: { equals: 'published' } },
    sort: '-validFrom',
    limit: 60,
    depth: 1,
  })
  const lines = Object.keys(cropPrices).flatMap((key) => {
    const row = latest.find((r) => r.crop?.id === cropId(key) && !r.base)
    return row
      ? [
          {
            name: (row.crop as any).name as string,
            price: row.price as number,
            place: 'toate bazele',
          },
        ]
      : []
  })
  const headlines = news.slice(0, 4).map((n) => ({
    title: n.title as string,
    url: n.url as string,
    source: newsSources[n.source as keyof typeof newsSources].name,
  }))
  const statuses = ['queued', 'queued', 'approved'] as const
  for (const [i, w] of [3, 2, 1].entries()) {
    const week = monday(now, w)
    for (const locale of ['ro', 'en'] as const) {
      const issue = buildIssue({ week, locale, prices: lines, headlines, note: undefined })
      await demo.create('newsletters', {
        key: `${day(week).slice(0, 10)}|${locale}`,
        week: day(week),
        locale,
        status: statuses[i],
        ...issue,
      } as never)
    }
  }
}
{
  const outboxAfter = await all('outbox')
  demo.track(
    'outbox',
    outboxAfter.filter((o) => !outboxBefore.has(o.id)).map((o) => o.id),
  )
}

/* ------------------------------------------------------------------ 7. leads, orders, applications */
const prod = await all('products', { where: { _status: { equals: 'published' } } })
const base = (name: string) => bases.find((b) => b.name === name)!.id
const consent = { consentVersion: '2026-11-v1' }
const leads = [
  [
    'vanzare-cereale',
    'new',
    'Ion Popescu',
    'Buzău',
    'Pogoanele',
    'wheat',
    'Am 120 t de grâu, ce preț îmi dați la bază?',
  ],
  [
    'vanzare-cereale',
    'contacted',
    'Marin Dobre',
    'Ialomița',
    'Sărățuica',
    'maize',
    'Porumb 300 t, livrare în decembrie.',
  ],
  [
    'vanzare-cereale',
    'closed',
    'Elena Vasile',
    'Brăila',
    'Grădiștea',
    'sunflower',
    'Floarea-soarelui, 80 t, vândut.',
  ],
  [
    'depozitare',
    'new',
    'Gheorghe Neagu',
    'Giurgiu',
    'Vedea',
    null,
    'Caut 500 t depozitare până în martie.',
  ],
  [
    'depozitare',
    'contacted',
    'Silvia Marin',
    'Teleorman',
    'Balaci',
    null,
    'Cât costă uscarea porumbului?',
  ],
  ['inputuri', 'new', 'Paul Tudor', 'Prahova', null, null, 'Ofertă pentru erbicide pe 200 ha.'],
  ['inputuri', 'closed', 'Laura Pop', 'Galați', null, null, 'Semințe de porumb, 50 ha.'],
  ['finantare', 'new', 'Costel Radu', 'Vaslui', null, null, 'Vreau credit pe producție, 150 ha.'],
  [
    'finantare',
    'contacted',
    'Irina Georgescu',
    'Dolj',
    null,
    null,
    'Cum funcționează creditul pe adeverință APIA?',
  ],
  ['logistica', 'new', 'Adrian Lungu', 'Tulcea', null, null, 'Transport 25 t grâu spre Constanța.'],
  ['motorina', 'new', 'Florin Sima', 'Buzău', null, null, 'Ofertă pentru 5.000 l motorină.'],
  ['motorina', 'contacted', 'Dana Preda', 'Ialomița', null, null, '3.000 l, livrare la fermă.'],
  [
    'parteneri',
    'new',
    'Mihai Enache',
    'Argeș',
    null,
    null,
    'Propun un parteneriat de distribuție.',
  ],
  ['cariere', 'new', 'Oana Ilie', 'Buzău', null, null, 'Aplic pentru postul de inginer agronom.'],
  [
    'general',
    'closed',
    'Radu Stoica',
    'Prahova',
    null,
    null,
    'Întrebare despre programul bazelor.',
  ],
] as const
for (const [i, [type, status, name, cName, bName, crop, message]] of leads.entries()) {
  await demo.create('leads', {
    type,
    status,
    name,
    phone: `0700 300 ${String(100 + i)}`,
    email: `lead${i + 1}@demo.agrinvest.test`,
    company: i % 3 === 0 ? `SC Demo Agro ${i + 1} SRL` : undefined,
    cui: i % 3 === 0 ? `RO4${1000000 + i}` : undefined,
    county: county(cName).id,
    base: bName ? base(bName) : undefined,
    crop: crop ? cropId(crop) : undefined,
    product: type === 'inputuri' ? [prod[i].id, prod[i + 1].id] : undefined,
    quantity: type === 'motorina' ? 3000 + i * 500 : undefined,
    deliveryDate: type === 'motorina' ? day(addDays(now, 14)) : undefined,
    message,
    notes: status === 'closed' ? 'Rezolvat (notă demonstrativă).' : undefined,
    meta: {
      locale: i % 5 === 4 ? 'en' : 'ro',
      sourcePath: '/contact',
      ...consent,
      utmSource: i % 2 ? 'google' : 'facebook',
      utmMedium: 'cpc',
      utmCampaign: 'toamna-2026',
    },
  })
}

const orderStatuses = ['new', 'contacted', 'confirmed', 'paid', 'delivered', 'cancelled'] as const
for (const [i, status] of orderStatuses.entries()) {
  const lines = [prod[i * 3], prod[i * 3 + 1]].map((p, j) => {
    const v = (p.variants ?? [])[0]
    const quantity = 2 + i + j
    const unitPrice = v?.price ?? 100
    return {
      sku: v?.sku ?? `DEMO-${i}${j}`,
      product: p.id,
      name: p.name,
      pack: v ? `${v.size} ${v.unit}` : undefined,
      quantity,
      unitPrice,
      lineTotal: Math.round(quantity * unitPrice * 100) / 100,
      priceConfirmed: true,
    }
  })
  const company = i % 2 === 0
  await demo.create('orders', {
    reference: newReference('AGR', addDays(now, -i * 3)),
    status,
    lines,
    total: Math.round(lines.reduce((a, l) => a + l.lineTotal, 0) * 100) / 100,
    buyer: {
      type: company ? 'company' : 'person',
      name: [
        'Ion Popescu',
        'Maria Ionescu',
        'George Dumitru',
        'Ana Stan',
        'Vlad Matei',
        'Cristina Radu',
      ][i],
      phone: `0700 400 ${100 + i}`,
      email: `order${i + 1}@demo.agrinvest.test`,
      company: company ? `SC Demo Agro ${i + 1} SRL` : undefined,
      cui: company ? `RO4${2000000 + i}` : undefined,
      regCom: company ? `J2/${100 + i}/2015` : undefined,
      billingAddress: company ? 'Str. Demo 1, Buzău' : undefined,
    },
    delivery:
      i % 3 === 0
        ? { method: 'pickup', county: county('Buzău').id, base: base('Pogoanele') }
        : {
            method: 'delivery',
            county: county('Ialomița').id,
            address: 'Str. Livezii 12, Sărățuica',
          },
    certificate: { number: `CERT-DEMO-${i + 1}`, validUntil: day(new Date('2028-06-30')) },
    payment: i % 2 ? 'proforma' : 'consultant',
    message: 'Comandă demonstrativă.',
    staffNotes: status === 'cancelled' ? 'Anulată la cererea clientului (demo).' : undefined,
    meta: {
      locale: 'ro',
      consentVersion: '2026-11-v1',
      termsVersion: '2026-11-v1',
      adultConfirmed: true,
    },
  })
}

const fps = await all('finance-products', { draft: true })
const appStatuses = ['new', 'contacted', 'in-analysis', 'closed', 'new', 'in-analysis'] as const
const borrowers = ['srl', 'pfa', 'agricultural-company', 'srl', 'ii', 'sa'] as const
for (const [i, status] of appStatuses.entries()) {
  await demo.create('finance-applications', {
    reference: newReference('CRD', addDays(now, -i * 2)),
    status,
    borrower: borrowers[i],
    company: i % 2 === 0 ? `SC Demo Agro ${i + 1} SRL` : undefined,
    cui: i % 2 === 0 ? `RO4${3000000 + i}` : undefined,
    name: [
      'Ion Popescu',
      'Maria Ionescu',
      'George Dumitru',
      'Ana Stan',
      'Vlad Matei',
      'Cristina Radu',
    ][i],
    phone: `0700 500 ${100 + i}`,
    email: `credit${i + 1}@demo.agrinvest.test`,
    product: fps[i % fps.length].id,
    amount: 80_000 + i * 120_000,
    termMonths: 12 + i * 6,
    guarantees: [
      ['promissory-note', 'crops'],
      ['apia-subsidies'],
      ['machinery', 'promissory-note'],
      ['grain-contracts'],
      ['mortgage'],
      ['crops'],
    ][i],
    county: county(['Buzău', 'Brăila', 'Vaslui', 'Dolj', 'Galați', 'Tulcea'][i]).id,
    crops: [cropId('wheat'), cropId('maize')],
    area: 60 + i * 90,
    message: 'Cerere demonstrativă de finanțare.',
    consents: { dataProcessing: true, creditBureau: i % 2 === 0, version: '2026-11-v1' },
    meta: {
      locale: 'ro',
      sourcePath: '/finantare/aplica',
      utmSource: 'google',
      utmCampaign: 'toamna-2026',
    },
    notes: status === 'closed' ? 'Dosar încheiat (notă demonstrativă).' : undefined,
  })
}
log(`leads ${leads.length}, orders ${orderStatuses.length}, applications ${appStatuses.length}`)

demo.save()
clearNextCache()
log('\nDone. Staff logins (admin panel /admin):')
for (const a of accounts) log(`  ${a.email}${remoteAllowed() ? '' : ` / ${password}`}`)
process.exit(0)
