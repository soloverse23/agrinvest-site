import config from '@payload-config'
import { readFileSync } from 'node:fs'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { chartScale } from '@ds/patterns/LineChart'
import { GET as cron } from '@/app/api/cron/[task]/route'
import { parseOilBulletin } from '@/lib/diesel/oil-bulletin'
import { evaluateAlerts } from '@/lib/jobs/tasks'
import { sendMessage } from '@/lib/messaging/send'
import { buildIssue, weekStart } from '@/lib/news/newsletter'
import { clip, parseRss } from '@/lib/news/rss'
import {
  cerealCrop,
  parseCerealPrices,
  parseEuDate,
  parseFertiliserPrices,
  parsePrice,
} from '@/lib/prices/eu-agrifood'
import { upsertMarketPrices } from '@/lib/prices/store'
import { cropChanges, priceAlertMessages, triggers } from '@/lib/subscriptions/alerts'
import { subscriptionSchema } from '@/lib/subscriptions/form'
import { subscriptionConsent } from '@/lib/subscriptions/state'
import { storeSubscription } from '@/lib/subscriptions/store'
import { forecastUrl, parseForecast, weatherConfig } from '@/lib/weather/open-meteo'

const fixture = (name: string) => readFileSync(`tests/fixtures/feeds/${name}`)

describe('feed parsers (saved fixtures, 2026-11-10)', () => {
  it('reads Romania’s diesel price from the Weekly Oil Bulletin', () => {
    const [row] = parseOilBulletin(fixture('eu-oil-bulletin.xlsx'), new Date('2026-11-10'))
    expect(row).toMatchObject({
      source: 'eu-oil-bulletin',
      series: 'diesel',
      market: 'RO',
      currency: 'EUR',
      unit: '1000 l',
      price: 2070.93,
    })
    expect(row.period.toISOString().slice(0, 10)).toBe('2026-11-02')
  })

  it('keeps headline, link and date only for Revista Ferma', () => {
    const items = parseRss(fixture('rss-revista-ferma.xml').toString(), 'revista-ferma')
    expect(items).toHaveLength(5)
    for (const item of items) {
      expect(item.url).toMatch(/^https:\/\/revista-ferma\.ro\//)
      expect(item.excerpt).toBe('')
      expect(item.title).not.toMatch(/<|&#/)
    }
  })

  it('keeps Agrointel excerpts within 500 characters, as its terms allow', () => {
    const items = parseRss(fixture('rss-agrointel.xml').toString(), 'agrointel')
    expect(items).toHaveLength(5)
    for (const item of items) {
      expect(item.excerpt.length).toBeGreaterThan(0)
      expect(item.excerpt.length).toBeLessThanOrEqual(500)
      expect(item.excerpt).not.toMatch(/<|\[…\]|&#8230;/)
    }
  })

  it('skips feed items that link off the publisher’s site', () => {
    const xml = `<rss><channel><item><title>X</title><link>https://example.com/a</link><pubDate>Tue, 10 Nov 2026 08:00:00 +0000</pubDate></item></channel></rss>`
    expect(parseRss(xml, 'agrointel')).toEqual([])
  })

  it('clips at a word boundary', () => {
    expect(clip('unu doi trei patru', 10)).toBe('unu doi…')
    expect(clip('scurt', 10)).toBe('scurt')
    expect(clip('orice', 0)).toBe('')
  })

  it('turns an Open-Meteo response into hourly and daily points', () => {
    const forecast = parseForecast(JSON.parse(fixture('open-meteo.json').toString()))
    expect(forecast.hourly).toHaveLength(7 * 24)
    expect(forecast.daily).toHaveLength(7)
    expect(forecast.hourly[0]).toHaveProperty('wind_speed_10m')
    expect(forecast.daily[0]).toHaveProperty('et0_fao_evapotranspiration')
  })

  it('rounds coordinates to 0.1° and sends the key only to the paid endpoint', () => {
    const free = weatherConfig({})
    expect(free).toMatchObject({ base: 'https://api.open-meteo.com', commercial: false })
    const url = new URL(forecastUrl(44.4268, 26.1025, 7, free))
    expect(url.searchParams.get('latitude')).toBe('44.4')
    expect(url.searchParams.get('longitude')).toBe('26.1')
    expect(url.searchParams.has('apikey')).toBe(false)

    const paid = weatherConfig({ OPEN_METEO_API_KEY: 'k1' })
    expect(paid.base).toBe('https://customer-api.open-meteo.com')
    expect(new URL(forecastUrl(44.4, 26.1, 7, paid)).searchParams.get('apikey')).toBe('k1')
    expect(weatherConfig({ OPEN_METEO_BASE_URL: 'https://meteo.example/' }).base).toBe(
      'https://meteo.example',
    )
  })

  it('reads EU agri-food prices in the documented shape', () => {
    expect(parsePrice('€205.50')).toBe(205.5)
    expect(parsePrice('1,234.50')).toBe(1234.5)
    expect(parsePrice('205,5')).toBe(205.5)
    expect(parseEuDate('03/11/2026').toISOString().slice(0, 10)).toBe('2026-11-03')

    // Fields as in /agrifood/v3/api-docs/cereals (CerealPrice).
    const rows = parseCerealPrices([
      {
        memberStateCode: 'RO',
        beginDate: '02/11/2026',
        price: '€190.00',
        unit: '€/t',
        productName: 'Feed maize',
        marketName: 'Constanța',
        stageName: 'FOB',
      },
      {
        memberStateCode: 'HU',
        beginDate: '02/11/2026',
        price: '€180.00',
        productName: 'Feed maize',
      },
      { memberStateCode: 'RO', beginDate: 'bad', price: '€1', productName: 'Feed maize' },
    ])
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ series: 'feed-maize', market: 'Constanța / FOB', price: 190 })
    expect(cerealCrop('feed-maize')).toBe('maize')
    expect(cerealCrop('durum-wheat')).toBeNull()

    // Fields as in /agrifood/v3/api-docs/fertiliser (FertiliserPrice).
    const fert = parseFertiliserPrices(
      [
        {
          year: 2026,
          month: 'September',
          memberStateName: 'EU',
          product: 'Urea',
          price: 480,
          unit: '€/t',
        },
        { year: 2026, month: '9', memberStateName: 'France', product: 'Urea', price: 470 },
      ],
      ['EU'],
    )
    expect(fert).toHaveLength(1)
    expect(fert[0].period.toISOString().slice(0, 10)).toBe('2026-09-01')
  })
})

describe('chart scale', () => {
  it('covers every value with round ticks', () => {
    const { min, max, ticks } = chartScale([187, 203, 214])
    expect(min).toBeLessThanOrEqual(187)
    expect(max).toBeGreaterThanOrEqual(214)
    expect(ticks.length).toBeGreaterThanOrEqual(3)
    expect(ticks.length).toBeLessThanOrEqual(7)
    for (const t of ticks) expect(t % 5).toBe(0)
  })

  it('handles a flat series', () => {
    const { min, max } = chartScale([200, 200])
    expect(min).toBeLessThan(200)
    expect(max).toBeGreaterThan(200)
  })
})

describe('alerts (pure)', () => {
  const day = (d: string) => new Date(`${d}T00:00:00Z`)
  const change = (prev: number | undefined, cur: number) => ({
    crop: 1,
    name: { ro: 'Grâu', en: 'Wheat' },
    current: { price: cur, date: day('2026-11-10') },
    previous: prev === undefined ? undefined : { price: prev, date: day('2026-11-03') },
  })

  it('fires on any change, or when the threshold is crossed', () => {
    expect(triggers('any', null, change(1000, 1010))).toBe(true)
    expect(triggers('any', null, change(1000, 1000))).toBe(false)
    expect(triggers('any', null, change(undefined, 1000))).toBe(false)
    expect(triggers('above', 1005, change(1000, 1010))).toBe(true)
    expect(triggers('above', 1005, change(1010, 1020))).toBe(false)
    expect(triggers('below', 1005, change(1010, 1000))).toBe(true)
    expect(triggers('below', null, change(1010, 1000))).toBe(false)
  })

  it('takes the highest price across bases on the latest and previous dates', () => {
    const names = new Map([[1, { ro: 'Grâu', en: 'Wheat' }]])
    const [c] = cropChanges(
      [
        { crop: 1, price: 1000, validFrom: '2026-11-03T00:00:00.000Z' },
        { crop: 1, price: 1020, validFrom: '2026-11-03T00:00:00.000Z' },
        { crop: 1, price: 1050, validFrom: '2026-11-10T00:00:00.000Z' },
      ],
      names,
    )
    expect(c.current.price).toBe(1050)
    expect(c.previous?.price).toBe(1020)
  })

  it('writes to pending subscribers only while nothing can be sent', () => {
    const sub = {
      id: 7,
      channel: 'email' as const,
      email: 'a@example.ro',
      locale: 'ro' as const,
      status: 'pending' as const,
      topics: [{ kind: 'price-alert', crop: 1, rule: 'any' as const }],
    }
    expect(priceAlertMessages([sub], [change(1000, 1010)], { includePending: false })).toEqual([])
    const [m] = priceAlertMessages([sub], [change(1000, 1010)], { includePending: true })
    expect(m).toMatchObject({ to: 'a@example.ro', template: 'price-alert', subscription: 7 })
    expect(m.subject).toContain('1.010')
  })
})

describe('subscription validation', () => {
  const base = { topic: 'newsletter', email: 'A@Example.ro', consent: 'on' }

  it('requires consent and a contact for the channel', () => {
    const r = subscriptionSchema('ro').safeParse({ ...base, consent: undefined, email: '' })
    expect(r.success).toBe(false)
    expect(r.error?.issues.map((i) => i.path[0])).toEqual(
      expect.arrayContaining(['consent', 'email']),
    )
    const w = subscriptionSchema('en').safeParse({ ...base, channel: 'whatsapp', phone: '12' })
    expect(w.error?.issues.map((i) => i.path[0])).toContain('phone')
  })

  it('needs a crop for a price alert and a threshold for a crossing rule', () => {
    const r = subscriptionSchema('ro').safeParse({ ...base, topic: 'price-alert', rule: 'above' })
    expect(r.error?.issues.map((i) => i.path[0])).toEqual(
      expect.arrayContaining(['crop', 'threshold']),
    )
    const ok = subscriptionSchema('ro').parse({
      ...base,
      topic: 'price-alert',
      crop: '3',
      rule: 'above',
      threshold: '1050',
    })
    expect(ok).toMatchObject({ email: 'a@example.ro', crop: 3, threshold: 1050 })
  })

  it('has the consent text in both languages', () => {
    expect(subscriptionConsent.ro).toMatch(/Sunt de acord/)
    expect(subscriptionConsent.en).toMatch(/I agree/)
    expect(subscriptionConsent.ro).not.toMatch(/[şţ]/)
  })
})

describe('newsletter (pure)', () => {
  it('starts weeks on Monday and never adds an unpublished price', () => {
    expect(weekStart(new Date('2026-11-13T10:00:00Z')).toISOString()).toBe(
      '2026-11-09T00:00:00.000Z',
    )
    const issue = buildIssue({
      week: new Date('2026-11-09'),
      locale: 'ro',
      prices: [],
      headlines: [],
    })
    expect(issue.intro).toMatch(/la cerere/)
    expect(issue.content.prices).toEqual([])
  })
})

describe('tools data (Payload)', () => {
  let payload: Payload
  const cleanup: { collection: Parameters<Payload['delete']>[0]['collection']; id: number }[] = []
  let cropId: number

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const crop = await payload.find({
      collection: 'crops',
      where: { key: { equals: 'wheat' } },
      limit: 1,
      depth: 0,
    })
    expect(crop.docs[0], 'seed the database first (npm run seed)').toBeDefined()
    cropId = crop.docs[0].id
  })

  afterAll(async () => {
    // Alerts reach every matching test subscriber, so remove all their Outbox rows too.
    await payload.delete({ collection: 'outbox', where: { to: { like: '@example.ro' } } })
    for (const { collection, id } of cleanup.reverse())
      await payload.delete({ collection, id }).catch(() => undefined)
  })

  it('adds a market row once, however often the job runs', async () => {
    const row = {
      source: 'eu-oil-bulletin' as const,
      series: 'diesel-test',
      market: 'RO',
      price: 1,
      currency: 'EUR',
      unit: '1000 l',
      period: new Date('2001-01-01'),
      fetchedAt: new Date(),
    }
    expect(await upsertMarketPrices(payload, [row, row])).toEqual({ created: 1, skipped: 1 })
    expect(await upsertMarketPrices(payload, [row])).toEqual({ created: 0, skipped: 1 })
    const found = await payload.find({
      collection: 'market-prices',
      where: { series: { equals: 'diesel-test' } },
      depth: 0,
    })
    expect(found.docs).toHaveLength(1)
    cleanup.push({ collection: 'market-prices', id: found.docs[0].id })
  })

  it('shows visitors only published buy prices', async () => {
    const draft = await payload.create({
      collection: 'buy-prices',
      data: {
        crop: cropId,
        price: 999,
        validFrom: '2001-01-01',
        basis: 'la-baza',
        source: 'manual',
        status: 'draft',
      },
    })
    cleanup.push({ collection: 'buy-prices', id: draft.id })
    const visible = await payload.find({
      collection: 'buy-prices',
      where: { id: { equals: draft.id } },
      overrideAccess: false,
    })
    expect(visible.docs).toHaveLength(0)
  })

  it('stubs every message in the Outbox and skips duplicates', async () => {
    const message = {
      channel: 'email' as const,
      to: 'test@example.ro',
      template: 'price-alert' as const,
      subject: 'Test',
      body: 'Test',
      dedupeKey: `test|${Date.now()}`,
    }
    const first = await sendMessage(payload, message)
    expect(first.status).toBe('stubbed')
    cleanup.push({ collection: 'outbox', id: first.id! })
    expect((await sendMessage(payload, message)).status).toBe('duplicate')
  })

  it('stores consent with the subscription and merges a second topic', async () => {
    const email = `sub-${Date.now()}@example.ro`
    const input = subscriptionSchema('ro').parse({ topic: 'newsletter', email, consent: 'on' })
    const sub = await storeSubscription(payload, input, 'ro', new Date('2026-11-10T09:00:00Z'))
    cleanup.push({ collection: 'subscriptions', id: sub.id })
    expect(sub.status).toBe('pending')
    expect(sub.consent).toMatchObject({ text: subscriptionConsent.ro, version: expect.any(String) })
    expect(sub.token.length).toBeGreaterThan(20)

    const alert = subscriptionSchema('ro').parse({
      topic: 'price-alert',
      email,
      crop: String(cropId),
      consent: 'on',
    })
    const merged = await storeSubscription(payload, alert, 'en')
    expect(merged.id).toBe(sub.id)
    expect(merged.topics?.map((t) => t.kind)).toEqual(['newsletter', 'price-alert'])
    expect(merged.consent?.text).toBe(subscriptionConsent.en)
  })

  it('writes a price alert to the Outbox when a published price changes', async () => {
    const email = `alert-${Date.now()}@example.ro`
    const sub = await storeSubscription(
      payload,
      subscriptionSchema('ro').parse({
        topic: 'price-alert',
        email,
        crop: String(cropId),
        consent: 'on',
      }),
      'ro',
    )
    cleanup.push({ collection: 'subscriptions', id: sub.id })
    // Dates far in the future, so they are this crop's latest two prices.
    for (const [price, validFrom] of [
      [1000, '2099-01-01'],
      [1040, '2099-01-08'],
    ] as const) {
      const p = await payload.create({
        collection: 'buy-prices',
        data: {
          crop: cropId,
          price,
          validFrom,
          basis: 'la-baza',
          source: 'manual',
          status: 'published',
        },
      })
      cleanup.push({ collection: 'buy-prices', id: p.id })
    }
    await evaluateAlerts(payload)
    const rows = await payload.find({
      collection: 'outbox',
      where: { to: { equals: email } },
      depth: 0,
    })
    expect(rows.docs).toHaveLength(1)
    expect(rows.docs[0]).toMatchObject({ status: 'stubbed', template: 'price-alert' })
    cleanup.push({ collection: 'outbox', id: rows.docs[0].id })

    // A second run finds the same change and writes nothing new.
    await evaluateAlerts(payload)
    const again = await payload.find({ collection: 'outbox', where: { to: { equals: email } } })
    expect(again.docs).toHaveLength(1)
  })

  it('queues an approved newsletter to the Outbox once', async () => {
    const email = `news-${Date.now()}@example.ro`
    const sub = await storeSubscription(
      payload,
      subscriptionSchema('ro').parse({ topic: 'newsletter', email, consent: 'on' }),
      'ro',
    )
    cleanup.push({ collection: 'subscriptions', id: sub.id })
    const issue = await payload.create({
      collection: 'newsletters',
      data: {
        key: `2001-01-01|ro|${Date.now()}`,
        week: '2001-01-01',
        locale: 'ro',
        subject: 'Test',
        status: 'draft',
      },
    })
    cleanup.push({ collection: 'newsletters', id: issue.id })
    await payload.update({ collection: 'newsletters', id: issue.id, data: { status: 'approved' } })
    const after = await payload.findByID({ collection: 'newsletters', id: issue.id })
    expect(after.status).toBe('queued')
    const rows = await payload.find({ collection: 'outbox', where: { to: { equals: email } } })
    expect(rows.docs).toHaveLength(1)
    expect(rows.docs[0].template).toBe('newsletter')
    cleanup.push({ collection: 'outbox', id: rows.docs[0].id })
  })
})

describe('cron route', () => {
  const call = (task: string, auth?: string) =>
    cron(
      new Request(`http://localhost/api/cron/${task}`, {
        headers: auth ? { authorization: auth } : {},
      }) as never,
      { params: Promise.resolve({ task }) },
    )

  it('refuses calls without the secret, and every call when none is set', async () => {
    const saved = process.env.CRON_SECRET
    delete process.env.CRON_SECRET
    expect((await call('evaluateAlerts', 'Bearer ')).status).toBe(401)
    process.env.CRON_SECRET = 'test-secret'
    expect((await call('evaluateAlerts')).status).toBe(401)
    expect((await call('evaluateAlerts', 'Bearer wrong-secret')).status).toBe(401)
    expect((await call('nope', 'Bearer test-secret')).status).toBe(404)
    if (saved === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = saved
  })
})
