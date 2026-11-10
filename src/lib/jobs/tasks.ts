import type { Payload, PayloadRequest, TaskConfig } from 'payload'

import type { Locale } from '@/i18n/config'
import { locales } from '@/i18n/config'
import { editorialDigest } from '@/lib/articles/digest'
import { isGrainKey } from '@/lib/crops'
import { parseOilBulletin } from '@/lib/diesel/oil-bulletin'
import { canSend, sendMessage } from '@/lib/messaging/send'
import { buildIssue, weekStart } from '@/lib/news/newsletter'
import { parseRss } from '@/lib/news/rss'
import { fetchCerealPrices, fetchFertiliserPrices } from '@/lib/prices/eu-agrifood'
import { cropLines, latestByBase, priceRange, type BuyPriceRow } from '@/lib/prices/grain'
import { marketNoteDraft } from '@/lib/prices/market-note'
import { rt } from '@/lib/richtext'
import { upsertMarketPrices } from '@/lib/prices/store'
import { revalidate, tags } from '@/lib/revalidate'
import { endpoints, fetchHeaders, marketSources, newsSourceKeys, newsSources } from '@/lib/sources'
import { cropChanges, priceAlertMessages, type AlertSubscriber } from '@/lib/subscriptions/alerts'

/**
 * Background tasks, run by the cron route (`src/app/api/cron/[task]/route.ts`) through
 * Payload's job queue, so each run is logged in `payload-jobs` while it runs and kept there
 * when it fails. Every fetch fails loudly here and softly on the pages: a failed run stores
 * nothing, and the pages keep showing the last good data with its date. No retries: the next
 * scheduled run is the retry.
 */

/** Markets kept from the EU fertiliser series (it reports few member states). */
export const fertiliserMarkets = ['Romania', 'EU'] as const

async function fetchOilBulletin(now: Date) {
  const res = await fetch(endpoints.oilBulletin, { headers: fetchHeaders, cache: 'no-store' })
  if (!res.ok) throw new Error(`Oil Bulletin answered ${res.status}`)
  return parseOilBulletin(Buffer.from(await res.arrayBuffer()), now)
}

export async function ingestNews(payload: Payload) {
  let created = 0
  const failed: string[] = []
  for (const source of newsSourceKeys) {
    try {
      const res = await fetch(newsSources[source].feed, {
        headers: fetchHeaders,
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(String(res.status))
      const items = parseRss(await res.text(), source)
      if (!items.length) throw new Error('no items')
      const known = await payload.find({
        collection: 'news-items',
        where: { url: { in: items.map((i) => i.url) } },
        pagination: false,
        depth: 0,
        select: { url: true },
      })
      const seen = new Set(known.docs.map((d) => d.url))
      for (const item of items) {
        if (seen.has(item.url)) continue
        await payload.create({
          collection: 'news-items',
          depth: 0,
          data: {
            ...item,
            publishedAt: item.publishedAt.toISOString(),
            excerpt: item.excerpt || undefined,
            status: 'nou',
          },
        })
        created++
      }
    } catch (error) {
      failed.push(`${source}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  if (created) revalidate(tags.news)
  if (failed.length === newsSourceKeys.length) throw new Error(failed.join('; '))
  return { created, failed }
}

/**
 * Price alerts from Agrinvest's published buy prices into the Outbox. Runs after every buy
 * price write (the `BuyPrices` hook passes its request, so the new row is visible inside the
 * transaction) and daily from cron. The Outbox's dedupe key makes a second run add nothing.
 */
export async function evaluateAlerts(payload: Payload, req?: PayloadRequest) {
  const [prices, crops, subs] = await Promise.all([
    payload.find({
      req,
      collection: 'buy-prices',
      where: { status: { equals: 'published' } },
      sort: '-validFrom',
      limit: 500,
      depth: 0,
    }),
    payload.find({ req, collection: 'crops', pagination: false, depth: 0, locale: 'all' }),
    payload.find({
      req,
      collection: 'subscriptions',
      where: { status: { not_equals: 'unsubscribed' } },
      pagination: false,
      depth: 0,
    }),
  ])
  const names = new Map(
    crops.docs.map((c) => [c.id, c.name as unknown as Record<Locale, string>] as const),
  )
  const changes = cropChanges(
    prices.docs.map((p) => ({
      crop: typeof p.crop === 'object' ? p.crop.id : p.crop,
      price: p.price,
      validFrom: p.validFrom,
    })),
    names,
  )
  const messages = priceAlertMessages(subs.docs as unknown as AlertSubscriber[], changes, {
    // With no provider the Outbox shows what pending subscribers would get.
    includePending: !canSend('email'),
  })
  let written = 0
  for (const m of messages)
    if ((await sendMessage(payload, m, req)).status !== 'duplicate') written++
  return { changes: changes.length, messages: written }
}

/** Drafts this week's issue in each language; an issue staff already approved is kept. */
export async function buildNewsletter(payload: Payload, now = new Date()) {
  const week = weekStart(now)
  const since = new Date(week.getTime() - 7 * 86_400_000).toISOString()
  const built: string[] = []
  for (const locale of locales) {
    const key = `${week.toISOString().slice(0, 10)}|${locale}`
    const existing = await payload.find({
      collection: 'newsletters',
      where: { key: { equals: key } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs[0] && existing.docs[0].status !== 'draft') continue

    const [prices, news, notes] = await Promise.all([
      payload.find({
        collection: 'buy-prices',
        where: { status: { equals: 'published' } },
        sort: '-validFrom',
        limit: 50,
        depth: 1,
        locale,
      }),
      payload.find({
        collection: 'news-items',
        where: {
          and: [{ status: { not_equals: 'ascuns' } }, { publishedAt: { greater_than: since } }],
        },
        sort: '-publishedAt',
        limit: 8,
        depth: 0,
      }),
      payload.find({
        collection: 'guides',
        where: { and: [{ section: { equals: 'piata' } }, { _status: { equals: 'published' } }] },
        sort: '-updatedAt',
        limit: 1,
        depth: 0,
        locale,
      }),
    ])

    // Latest published price per crop and base.
    const seen = new Set<string>()
    const priceLines = prices.docs.flatMap((p) => {
      const crop = typeof p.crop === 'object' ? p.crop : null
      const base = typeof p.base === 'object' ? p.base : null
      const id = `${crop?.id}|${base?.id ?? 'all'}`
      if (!crop || seen.has(id)) return []
      seen.add(id)
      const place = base?.name ?? (locale === 'ro' ? 'toate bazele' : 'all bases')
      return [{ name: crop.name, price: p.price, place }]
    })
    const note = notes.docs[0]
    const issue = buildIssue({
      week,
      locale,
      prices: priceLines,
      headlines: news.docs.map((n) => ({
        title: n.title,
        url: n.url,
        source: newsSources[n.source].name,
      })),
      note: note ? { title: note.title, summary: note.summary, slug: note.slug } : undefined,
    })
    const data = { key, week: week.toISOString(), locale, status: 'draft' as const, ...issue }
    if (existing.docs[0])
      await payload.update({ collection: 'newsletters', id: existing.docs[0].id, data, depth: 0 })
    else await payload.create({ collection: 'newsletters', data, depth: 0 })
    built.push(key)
  }
  return { built }
}

/**
 * This week's market note as a draft `Guides` entry (section `piata`), in Romanian and English,
 * written from the series. It never publishes and never overwrites: once the week's draft
 * exists (key `piata-{week}`), staff own it.
 */
export async function draftMarketNote(payload: Payload, now = new Date()) {
  const week = weekStart(now)
  const day = week.toISOString().slice(0, 10)
  const key = `piata-${day}`
  const existing = await payload.find({
    collection: 'guides',
    where: { key: { equals: key } },
    limit: 1,
    depth: 0,
    draft: true,
  })
  if (existing.docs[0]) return { skipped: 'exists', key }

  const since = new Date(week.getTime() - 9 * 7 * 86_400_000).toISOString()
  const [points, prices, crops] = await Promise.all([
    payload.find({
      collection: 'market-prices',
      where: { period: { greater_than_equal: since } },
      sort: 'period',
      pagination: false,
      depth: 0,
    }),
    payload.find({
      collection: 'buy-prices',
      where: { status: { equals: 'published' } },
      pagination: false,
      depth: 0,
    }),
    payload.find({
      collection: 'crops',
      where: { isGrain: { equals: true } },
      pagination: false,
      depth: 0,
      locale: 'all',
      sort: 'createdAt',
    }),
  ])
  const rows: BuyPriceRow[] = prices.docs.map((p) => ({
    crop: typeof p.crop === 'object' ? p.crop.id : p.crop,
    base: typeof p.base === 'object' && p.base ? { id: p.base.id, name: '', slug: '' } : null,
    price: p.price,
    basis: p.basis,
    validFrom: p.validFrom,
  }))
  const drafts = locales.map((locale) =>
    marketNoteDraft(
      week,
      crops.docs.flatMap((c) =>
        isGrainKey(c.key)
          ? [
              {
                name: (c.name as unknown as Record<Locale, string>)[locale],
                lines: cropLines(points.docs, c.key, week, 9),
                agrinvest: priceRange(latestByBase(rows, c.id)),
              },
            ]
          : [],
      ),
      locale,
    ),
  )
  if (drafts.some((d) => !d)) return { skipped: 'no data', key }

  const source = marketSources['eu-agrifood']
  const sources = [{ title: source.name, url: source.url, retrieved: now.toISOString() }]
  const [ro, en] = drafts as NonNullable<(typeof drafts)[number]>[]
  const doc = await payload.create({
    collection: 'guides',
    locale: 'ro',
    draft: true,
    depth: 0,
    data: {
      key,
      section: 'piata',
      title: ro.title,
      slug: ro.slug,
      // Keep the dated slugs: the slug field would otherwise rewrite them from the title.
      generateSlug: false,
      summary: ro.summary,
      body: rt(ro.markdown) as never,
      sources,
      _status: 'draft',
    },
  })
  await payload.update({
    collection: 'guides',
    id: doc.id,
    locale: 'en',
    draft: true,
    depth: 0,
    data: {
      title: en.title,
      slug: en.slug,
      generateSlug: false,
      summary: en.summary,
      body: rt(en.markdown) as never,
      sources,
    },
  })
  return { created: key }
}

const fetchTask = (
  slug: string,
  fetchRows: (now: Date) => Promise<Parameters<typeof upsertMarketPrices>[1]>,
  tag: string,
): TaskConfig =>
  ({
    slug,
    handler: async ({ req }) => {
      const rows = await fetchRows(new Date())
      if (!rows.length) throw new Error(`${slug}: the source returned no rows`)
      const result = await upsertMarketPrices(req.payload, rows)
      if (result.created) revalidate(tag)
      return { output: result }
    },
  }) as TaskConfig

export const jobTasks: TaskConfig[] = [
  fetchTask('fetchEuCereal', (now) => fetchCerealPrices(now), tags.prices),
  fetchTask(
    'fetchEuFertiliser',
    (now) => fetchFertiliserPrices(fertiliserMarkets, now),
    tags.prices,
  ),
  fetchTask('fetchOilBulletin', fetchOilBulletin, tags.diesel),
  {
    slug: 'ingestNews',
    handler: async ({ req }) => ({ output: await ingestNews(req.payload) }),
  } as TaskConfig,
  {
    slug: 'evaluateAlerts',
    handler: async ({ req }) => ({ output: await evaluateAlerts(req.payload) }),
  } as TaskConfig,
  {
    slug: 'draftMarketNote',
    handler: async ({ req }) => ({ output: await draftMarketNote(req.payload) }),
  } as TaskConfig,
  {
    slug: 'editorialDigest',
    handler: async ({ req }) => ({ output: await editorialDigest(req.payload) }),
  } as TaskConfig,
  {
    slug: 'buildNewsletter',
    handler: async ({ req }) => ({ output: await buildNewsletter(req.payload) }),
  } as TaskConfig,
]

export const jobTaskSlugs = jobTasks.map((t) => t.slug)
