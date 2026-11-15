import { readFileSync } from 'node:fs'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { group, sameEvent } from '@/lib/news/group'
import { classify, isExcluded } from '@/lib/news/lexicon'
import { acceptable, ingestNews } from '@/lib/news/pipeline'
import { parseRss, validate } from '@/lib/news/rss'
import { defaultWeights, score } from '@/lib/news/score'
import { newsSources } from '@/lib/sources'

/** Phase 7e (decision 0011): parsing, the lexicon, grouping, ranking and the hourly job. */

const fixture = (name: string) => readFileSync(`tests/fixtures/feeds/${name}`, 'utf8')

describe('news feeds', () => {
  it('reads Reuters from Google News: headline and Google link only, " - Reuters" cut', () => {
    const items = parseRss(fixture('news-reuters-gnews.xml'), 'reuters')
    expect(items.length).toBeGreaterThan(50)
    for (const i of items) {
      expect(new URL(i.url).hostname).toBe('news.google.com')
      expect(i.title).not.toMatch(/ - Reuters$/)
      expect(i.excerpt).toBe('')
    }
  })

  it('drops the zero-width spaces MADR puts in titles, and keeps its excerpt within 300', () => {
    const items = parseRss(fixture('news-madr.xml'), 'madr')
    expect(items).toHaveLength(10)
    for (const i of items) {
      expect(i.title).not.toMatch(/[​-‍﻿]/)
      expect(i.excerpt.length).toBeLessThanOrEqual(300)
    }
  })

  it('keeps only europa.eu links from the Commission feed (events elsewhere are skipped)', () => {
    const items = parseRss(fixture('news-ec-agri.xml'), 'ec-agri')
    expect(items.length).toBeGreaterThan(0)
    for (const i of items) expect(new URL(i.url).hostname).toMatch(/(^|\.)europa\.eu$/)
  })

  it('cuts ZF, Mediafax and G4Media excerpts to the 250 characters their terms allow', () => {
    for (const [file, key] of [
      ['news-zf.xml', 'zf'],
      ['news-mediafax.xml', 'mediafax'],
      ['news-g4media.xml', 'g4media'],
    ] as const) {
      for (const i of parseRss(fixture(file), key))
        expect(i.excerpt.length).toBeLessThanOrEqual(250)
      expect(newsSources[key].excerptMax).toBe(250)
    }
  })

  it('refuses a headline from the future, an old one and a too-short one', () => {
    const now = new Date('2026-11-15T12:00:00Z')
    const base = { source: 'agrointel' as const, url: 'https://agrointel.ro/x', excerpt: '' }
    expect(
      validate({ ...base, title: 'Prețul grâului crește în port', publishedAt: now }, now),
    ).toBeNull()
    expect(
      validate(
        {
          ...base,
          title: 'Prețul grâului crește în port',
          publishedAt: new Date('2026-11-16T12:00:00Z'),
        },
        now,
      ),
    ).toBe('future')
    expect(
      validate(
        {
          ...base,
          title: 'Prețul grâului crește în port',
          publishedAt: new Date('2026-11-01T12:00:00Z'),
        },
        now,
      ),
    ).toBe('old')
    expect(validate({ ...base, title: 'Grâu', publishedAt: now }, now)).toBe('title')
  })
})

describe('agriculture lexicon', () => {
  it('finds topics without diacritics or case, at the start of words', () => {
    expect(classify('Subvențiile APIA: plata în avans începe luni').topics).toEqual(
      expect.arrayContaining(['subventii']),
    )
    expect(classify('Seceta a distrus culturile de porumb din Dolj').topics).toEqual(
      expect.arrayContaining(['vreme', 'preturi']),
    )
  })

  it('does not take "afirmă" for AFIR, "Carney" for meat or a hospital payout for farm aid', () => {
    const zelensky = classify('Zelenski afirmă că Statele Unite au lansat ideea')
    expect(zelensky.anchored).toBe(false)
    expect(classify('Canada, US make progress on trade deal, Carney says', 'en').anchored).toBe(
      false,
    )
    expect(classify('Spital obligat să plătească despăgubiri uriașe').anchored).toBe(false)
  })

  it('rates Romania above the region, and "eu" counts as the EU only in English', () => {
    expect(classify('Fermierii din Constanța cer sprijin').relevance).toBe(1.5)
    expect(classify('Comisia Europeană propune noi cote pentru Ucraina').relevance).toBe(1.2)
    expect(classify('Eu cred că recolta va fi bună').relevance).toBe(1)
    expect(classify('EU wheat exports slow', 'en').relevance).toBe(1.2)
  })

  it('excludes quote pages the Reuters search returns', () => {
    expect(isExcluded('Golden Grain Energy LLC (GGENU.PK) | Stock Price & Latest News')).toBe(true)
    expect(isExcluded('Ukraine hopes for grain exports breakthrough')).toBe(false)
  })

  it('keeps a general outlet’s item only when it is about farming', () => {
    const now = new Date('2026-11-15T12:00:00Z')
    const item = (title: string) => ({
      source: 'zf' as const,
      title,
      url: `https://www.zf.ro/${encodeURIComponent(title)}`,
      publishedAt: now,
      excerpt: '',
    })
    const { kept, refused } = acceptable(
      [
        item('Importurile de mașini au crescut cu 12%'),
        item('Fermierii primesc plata în avans APIA'),
      ],
      now,
    )
    expect(kept.map((k) => k.title)).toEqual(['Fermierii primesc plata în avans APIA'])
    expect(refused).toBe(1)
  })
})

describe('grouping and ranking', () => {
  const at = (h: number) => new Date(Date.UTC(2026, 10, 15, h))

  it('puts the same event from three outlets in one story, and keeps other events apart', () => {
    const items = [
      {
        id: 1,
        lang: 'ro' as const,
        publishedAt: at(8),
        title: 'APIA începe plata în avans pentru fermieri de luni',
      },
      {
        id: 2,
        lang: 'ro' as const,
        publishedAt: at(9),
        title: 'Plata în avans APIA pentru fermieri începe de luni',
      },
      {
        id: 3,
        lang: 'ro' as const,
        publishedAt: at(10),
        title: 'De luni, APIA începe plata în avans către fermieri',
      },
      {
        id: 4,
        lang: 'ro' as const,
        publishedAt: at(10),
        title: 'Seceta lovește culturile de rapiță din Dobrogea',
      },
    ]
    const stories = group(items)
    expect(stories.map((s) => s.map((i) => i.id))).toEqual([[1, 2, 3], [4]])
  })

  it('never groups across languages or more than 48 hours apart', () => {
    const a = {
      id: 1,
      lang: 'ro' as const,
      publishedAt: at(8),
      title: 'Grâul românesc se vinde în Egipt',
    }
    expect(sameEvent(a, { ...a, id: 2, lang: 'en' })).toBe(false)
    expect(
      sameEvent(a, { ...a, id: 3, publishedAt: new Date(at(8).getTime() + 49 * 3_600_000) }),
    ).toBe(false)
  })

  it('ranks a story told by more sources higher, and halves it after one half-life', () => {
    const now = at(12)
    const one = score({ topicWeight: 3, relevance: 1.5, sources: ['agrointel'], latest: now }, now)
    const three = score(
      { topicWeight: 3, relevance: 1.5, sources: ['agrointel', 'madr', 'zf'], latest: now },
      now,
    )
    expect(three.score).toBeGreaterThan(one.score)
    expect(three.parts.coverage).toBeCloseTo(1 + Math.log2(3))
    const later = new Date(now.getTime() + defaultWeights.halfLifeHours * 3_600_000)
    expect(
      score({ topicWeight: 3, relevance: 1.5, sources: ['agrointel'], latest: now }, later).score,
    ).toBeCloseTo(one.score / 2, 2)
  })

  it('keeps generic farming below a real topic', () => {
    const now = at(12)
    const generic = score(
      { topicWeight: 0.5, relevance: 1.5, sources: ['agrointel'], latest: now },
      now,
    )
    const subsidy = score(
      { topicWeight: 3, relevance: 1.5, sources: ['agrointel'], latest: now },
      now,
    )
    expect(subsidy.score).toBeGreaterThan(generic.score * 5)
  })
})

describe('hourly news job (Payload)', () => {
  let payload: Payload
  const tag = `t7e${Date.now()}`
  const url = (n: number) => `https://agrointel.ro/${tag}-${n}/`
  const startedAt = new Date()
  // Mid-day, so the 03:00 clean-up never runs inside the test.
  const now = new Date()
  const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000).toUTCString()

  const feed = `<?xml version="1.0"?><rss><channel>
    <item><title>APIA începe plata în avans pentru fermieri de luni ${tag}</title><link>${url(1)}</link><pubDate>${minutesAgo(50)}</pubDate><description>Plata în avans pentru fermieri.</description></item>
    <item><title>Plata în avans APIA pentru fermieri începe de luni ${tag}</title><link>${url(2)}</link><pubDate>${minutesAgo(40)}</pubDate></item>
    <item><title>Seceta lovește culturile de rapiță din Dobrogea ${tag}</title><link>${url(3)}</link><pubDate>${minutesAgo(30)}</pubDate></item>
  </channel></rss>`

  type Mode = 'serve' | 'unchanged' | 'fail'
  const fakeFetch =
    (mode: Mode): typeof fetch =>
    async (input) => {
      const u = String(input)
      if (!u.includes('agrointel.ro')) return new Response(null, { status: 304 })
      if (mode === 'fail') throw new Error('boom')
      if (mode === 'unchanged')
        return new Response(null, { status: 304, headers: { etag: '"v1"' } })
      return new Response(feed, { status: 200, headers: { etag: '"v1"' } })
    }

  const testItems = () =>
    payload.find({
      collection: 'news-items',
      where: { url: { like: tag } },
      pagination: false,
      depth: 0,
    })

  beforeAll(async () => {
    payload = await getPayload({ config })
    await payload.delete({ collection: 'news-runs', where: { status: { equals: 'running' } } })
  })

  afterAll(async () => {
    const items = await testItems()
    const ids = items.docs.map((d) => d.id)
    if (ids.length) {
      const stories = await payload.find({
        collection: 'news-stories',
        where: { items: { in: ids } },
        pagination: false,
        depth: 0,
      })
      for (const s of stories.docs) await payload.delete({ collection: 'news-stories', id: s.id })
    }
    await payload.delete({ collection: 'news-blocked', where: { url: { like: tag } } })
    await payload.delete({
      collection: 'news-runs',
      where: { startedAt: { greater_than_equal: startedAt.toISOString() } },
    })
  })

  it('stores the new headlines and groups the same event into one story', async () => {
    const r = await ingestNews(payload, { now, fetchImpl: fakeFetch('serve') })
    expect('created' in r && r.created).toBe(3)
    const items = await testItems()
    const stories = await payload.find({
      collection: 'news-stories',
      where: { items: { in: items.docs.map((d) => d.id) } },
      depth: 0,
    })
    const sizes = stories.docs.map((s) => (s.items ?? []).length).sort()
    expect(sizes).toEqual([1, 2])
    const apia = stories.docs.find((s) => (s.items ?? []).length === 2)!
    expect(apia.topic).toBe('subventii')
    expect(apia.sources).toEqual(['agrointel'])
  })

  it('adds nothing when the feed answers 304, and records the run', async () => {
    const r = await ingestNews(payload, { now, fetchImpl: fakeFetch('unchanged') })
    expect('created' in r && r.created).toBe(0)
    expect('sources' in r && r.sources.agrointel?.state).toBe('unchanged')
    expect((await testItems()).totalDocs).toBe(3)
  })

  it('records a failing source without stopping the others', async () => {
    const r = await ingestNews(payload, { now, fetchImpl: fakeFetch('fail') })
    if (!('sources' in r)) throw new Error('locked')
    expect(r.sources.agrointel?.state).toBe('failed')
    expect(r.sources.agrointel?.failures).toBe(1)
    expect(r.sources.madr?.state).toBe('unchanged')
    const run = await payload.find({
      collection: 'news-runs',
      sort: '-startedAt',
      limit: 1,
      depth: 0,
    })
    expect(run.docs[0].status).toBe('partial')
  })

  it('removes a story whose headline disappeared without its hooks', async () => {
    const items = await testItems()
    const drought = items.docs.find((d) => d.url === url(3))!
    await payload.delete({
      collection: 'news-items',
      id: drought.id,
      context: { newsRemovingStory: true },
    })
    const r = await ingestNews(payload, { now, fetchImpl: fakeFetch('serve') })
    expect('created' in r && r.created).toBe(1)
    const empty = await payload.find({
      collection: 'news-stories',
      where: { key: { equals: String(drought.id) } },
      depth: 0,
    })
    expect(empty.totalDocs).toBe(0)
  })

  it('skips a run while another one holds the lock', async () => {
    const lock = await payload.create({
      collection: 'news-runs',
      data: { startedAt: new Date().toISOString(), status: 'running', created: 0 },
      depth: 0,
    })
    expect(await ingestNews(payload, { now, fetchImpl: fakeFetch('serve') })).toEqual({
      skipped: 'locked',
    })
    await payload.delete({ collection: 'news-runs', id: lock.id })
  })

  it('deletes a story with its headlines and blocks them, so the next run does not bring them back', async () => {
    const items = await testItems()
    const story = (
      await payload.find({
        collection: 'news-stories',
        where: { items: { contains: items.docs.find((d) => d.url === url(1))!.id } },
        depth: 0,
      })
    ).docs[0]
    await payload.delete({ collection: 'news-stories', id: story.id })
    expect((await testItems()).totalDocs).toBe(1)
    const blocked = await payload.find({
      collection: 'news-blocked',
      where: { url: { like: tag } },
    })
    expect(blocked.docs.map((d) => d.url).sort()).toEqual([url(1), url(2)])

    const r = await ingestNews(payload, { now, fetchImpl: fakeFetch('serve') })
    expect('created' in r && r.created).toBe(0)
    expect((await testItems()).totalDocs).toBe(1)
  })
})
