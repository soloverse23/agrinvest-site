import { request } from 'node:https'
import { rootCertificates } from 'node:tls'

import type { Payload } from 'payload'

import { sendMessage } from '@/lib/messaging/send'
import { revalidate, tags } from '@/lib/revalidate'
import { fetchHeaders, newsSourceKeys, newsSources, type NewsSource } from '@/lib/sources'
import type { NewsItem } from '@/payload-types'

import { intermediates, type IntermediateKey } from './certs'
import { group } from './group'
import { classify, isExcluded, topics as topicDefs, type NewsTopic } from './lexicon'
import { REMOVING_STORY } from './remove'
import { MAX_AGE_DAYS, parseRss, validate, type FeedItem } from './rss'
import { defaultWeights, mainTopic, score, type Weights } from './score'
import { entriesOf } from './entries'

/**
 * The hourly news run (decision 0011, Phase 7e):
 *
 * fetch every enabled source (conditional GET, 10 s timeout) → parse → drop excluded,
 * off-topic, invalid, known and blocked items → store → regroup the last 48 hours into stories
 * → rebuild today's edition (and freeze yesterday's) → clean up once a day → alert when the
 * sources stay down.
 *
 * One bad source never stops the run. A run that adds nothing writes no story and revalidates
 * nothing. `fetchImpl` and `now` are injectable for tests.
 */

const TIMEOUT_MS = 10_000
const MAX_PER_SOURCE = 50
const LOCK_MINUTES = 10
const BREAKER_FAILURES = 6
const BREAKER_PAUSE_HOURS = 6
const KEEP_DAYS = 90
const KEEP_RUN_DAYS = 30
const ALERT_ALL_DOWN_HOURS = 3
const ALERT_SOURCE_DOWN_HOURS = 24
const CLEANUP_HOUR = 3

type SourceState = {
  state: 'ok' | 'unchanged' | 'failed' | 'paused' | 'off'
  status?: number
  new?: number
  known?: number
  refused?: number
  error?: string
  etag?: string
  lastModified?: string
  /** Failed runs in a row. */
  failures: number
  failingSince?: string
  lastAttempt?: string
}

type RunSources = Partial<Record<NewsSource, SourceState>>

/** yyyy-mm-dd in Bucharest time. */
export const bucharestDay = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Bucharest' }).format(d)

const bucharestHour = (d: Date) =>
  Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Bucharest',
      hour: '2-digit',
      hourCycle: 'h23',
    }).format(d),
  )

async function settingsOf(payload: Payload) {
  const s = await payload.findGlobal({ slug: 'news-settings', depth: 0 }).catch(() => null)
  const w = s?.weights
  const weights: Weights = {
    source: {
      official: w?.official ?? defaultWeights.source.official,
      wire: w?.wire ?? defaultWeights.source.wire,
      farm: w?.farm ?? defaultWeights.source.farm,
      general: w?.general ?? defaultWeights.source.general,
    },
    halfLifeHours: w?.halfLifeHours ?? defaultWeights.halfLifeHours,
    romania: w?.romania ?? defaultWeights.romania,
    region: w?.region ?? defaultWeights.region,
  }
  return { disabled: new Set((s?.disabledSources ?? []) as NewsSource[]), weights }
}

/**
 * GET over node:https with one extra trusted intermediate, for a server that sends an
 * incomplete chain. TLS verification stays on. Answers like `fetch` (status, headers, text).
 */
function fetchWithIntermediate(
  url: string,
  headers: Record<string, string>,
  ca: IntermediateKey,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const req = request(
      url,
      { headers, ca: [...rootCertificates, intermediates[ca]], timeout: TIMEOUT_MS },
      (res) => {
        const chunks: Buffer[] = []
        res.on('data', (c: Buffer) => chunks.push(c))
        res.on('end', () =>
          resolve(
            new Response(res.statusCode === 304 ? null : Buffer.concat(chunks), {
              status: res.statusCode ?? 500,
              headers: Object.entries(res.headers).flatMap(([k, v]) =>
                v === undefined
                  ? []
                  : [[k, Array.isArray(v) ? v.join(', ') : v] as [string, string]],
              ),
            }),
          ),
        )
        res.on('error', reject)
      },
    )
    req.on('timeout', () =>
      req.destroy(Object.assign(new Error('timeout'), { name: 'TimeoutError' })),
    )
    req.on('error', reject)
    req.end()
  })
}

/** Fetches one feed. A 304 means nothing changed since the last ETag / Last-Modified. */
async function fetchFeed(
  source: NewsSource,
  prev: SourceState | undefined,
  fetchImpl: typeof fetch,
): Promise<{ status: number; body?: string; etag?: string; lastModified?: string }> {
  const headers: Record<string, string> = { ...fetchHeaders }
  if (prev?.etag) headers['if-none-match'] = prev.etag
  if (prev?.lastModified) headers['if-modified-since'] = prev.lastModified
  const { feed, extraCa } = newsSources[source]
  const res =
    extraCa && fetchImpl === fetch
      ? await fetchWithIntermediate(feed, headers, extraCa)
      : await fetchImpl(feed, {
          headers,
          cache: 'no-store',
          signal: AbortSignal.timeout(TIMEOUT_MS),
        })
  if (res.status === 304) return { status: 304, etag: prev?.etag, lastModified: prev?.lastModified }
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status })
  return {
    status: res.status,
    body: await res.text(),
    etag: res.headers.get('etag') ?? undefined,
    lastModified: res.headers.get('last-modified') ?? undefined,
  }
}

/** The items a source may keep: on topic (for filtered sources), valid, newest first, capped. */
export function acceptable(items: FeedItem[], now: Date) {
  let refused = 0
  const kept: (FeedItem & { topics: NewsTopic[]; lang: 'ro' | 'en' })[] = []
  for (const item of items) {
    const info = newsSources[item.source]
    const text = `${item.title} ${item.excerpt}`
    const c = classify(text, info.lang)
    if (isExcluded(text) || (info.filter && !c.anchored) || validate(item, now)) {
      refused++
      continue
    }
    kept.push({ ...item, topics: c.topics, lang: info.lang })
  }
  kept.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
  return {
    kept: kept.slice(0, MAX_PER_SOURCE),
    refused: refused + Math.max(0, kept.length - MAX_PER_SOURCE),
  }
}

type WindowItem = NewsItem & { lang: 'ro' | 'en' }

/** Scores one group of headlines (oldest first). */
function storyOf(items: WindowItem[], weights: Weights, now: Date) {
  const cls = items.map((i) => classify(`${i.title} ${i.excerpt ?? ''}`, i.lang))
  const found = [...new Set(cls.flatMap((c) => c.topics))]
  const sources = items.map((i) => i.source as NewsSource)
  const latest = new Date(Math.max(...items.map((i) => new Date(i.publishedAt).getTime())))
  const { parts } = score(
    {
      topicWeight: Math.max(...cls.map((c) => c.topicWeight)),
      relevance: Math.max(...cls.map((c) => c.relevance)),
      sources,
      latest,
    },
    now,
    weights,
  )
  const baseScore =
    Math.round(parts.topic * parts.relevance * parts.coverage * parts.source * 1000) / 1000
  return {
    topic: mainTopic(found, topicDefs),
    topics: found,
    sources: [...new Set(sources)],
    baseScore,
    parts,
    firstSeen: items[0].publishedAt,
    lastSeen: latest.toISOString(),
  }
}

/**
 * Regroups every visible headline of the last `MAX_AGE_DAYS` (the age limit for new items, so
 * a late headline still gets a story; "same event" itself needs two headlines within 48 hours)
 * and writes the stories. A story keeps
 * its key (its first headline's id), its status and its pin as it grows. A story whose
 * headlines moved into another one is deleted; if it was hidden, the story that took them in
 * is hidden too, because staff hid that event.
 */
async function rebuildStories(payload: Payload, weights: Weights, now: Date) {
  const since = new Date(now.getTime() - MAX_AGE_DAYS * 86_400_000).toISOString()
  const { docs } = await payload.find({
    collection: 'news-items',
    where: {
      and: [{ publishedAt: { greater_than_equal: since } }, { status: { not_equals: 'ascuns' } }],
    },
    pagination: false,
    depth: 0,
  })
  const items = docs.map((d) => ({
    ...d,
    lang: (d.lang ?? newsSources[d.source as NewsSource]?.lang ?? 'ro') as 'ro' | 'en',
  }))
  const groups = group(items.map((i) => ({ ...i, publishedAt: new Date(i.publishedAt) }))).map(
    (g) => g.map((x) => items.find((i) => i.id === x.id)!),
  )

  const ids = items.map((i) => i.id)
  const existing = ids.length
    ? (
        await payload.find({
          collection: 'news-stories',
          where: { items: { in: ids } },
          pagination: false,
          depth: 0,
        })
      ).docs
    : []
  const byKey = new Map(existing.map((s) => [s.key, s]))
  const used = new Set<string>()
  let written = 0

  for (const g of groups) {
    const key = String(g[0].id)
    const memberIds = new Set(g.map((i) => i.id))
    const absorbed = existing.filter(
      (s) =>
        s.key !== key &&
        (s.items ?? []).some((i) => memberIds.has(typeof i === 'number' ? i : i.id)),
    )
    const own = byKey.get(key)
    const s = storyOf(g, weights, now)
    const data = {
      key,
      title: g[0].title,
      items: g.map((i) => i.id),
      topic: s.topic,
      topics: s.topics,
      sources: s.sources,
      sourceCount: s.sources.length,
      lang: g[0].lang,
      baseScore: s.baseScore,
      scoreParts: s.parts,
      firstSeen: s.firstSeen,
      lastSeen: s.lastSeen,
      ...(absorbed.some((a) => a.status === 'hidden') ? { status: 'hidden' as const } : {}),
    }
    used.add(key)
    if (own) {
      const same =
        own.baseScore === data.baseScore &&
        (own.items ?? []).length === data.items.length &&
        own.lastSeen === data.lastSeen &&
        !('status' in data && own.status !== data.status)
      if (!same) {
        await payload.update({ collection: 'news-stories', id: own.id, data, depth: 0 })
        written++
      }
    } else {
      await payload.create({
        collection: 'news-stories',
        data: { ...data, status: data.status ?? 'visible' },
        depth: 0,
      })
      written++
    }
  }
  // Stories left with no headline (a headline removed without its hooks): nothing to cite.
  const recent = await payload.find({
    collection: 'news-stories',
    where: { lastSeen: { greater_than_equal: since } },
    pagination: false,
    depth: 0,
    select: { key: true, items: true },
  })
  for (const s of recent.docs) {
    if ((s.items ?? []).length || used.has(s.key)) continue
    await payload.delete({
      collection: 'news-stories',
      id: s.id,
      depth: 0,
      context: { [REMOVING_STORY]: true },
    })
    written++
  }
  // Stories whose headlines now live in another story.
  for (const s of existing) {
    if (used.has(s.key)) continue
    await payload.delete({
      collection: 'news-stories',
      id: s.id,
      depth: 0,
      context: { [REMOVING_STORY]: true },
    })
    written++
  }
  return written
}

/** Rebuilds one day's edition from the visible stories that started that day. */
async function buildEdition(payload: Payload, day: string, freeze: boolean) {
  const found = await payload.find({
    collection: 'news-editions',
    where: { date: { equals: day } },
    limit: 1,
    depth: 0,
  })
  const current = found.docs[0]
  if (current?.status === 'removed' || current?.frozen) return false
  // Bucharest is UTC+2 or +3: a two-day UTC range, filtered by the Bucharest day below.
  const from = new Date(`${day}T00:00:00Z`)
  const { docs } = await payload.find({
    collection: 'news-stories',
    where: {
      and: [
        { status: { equals: 'visible' } },
        {
          firstSeen: { greater_than_equal: new Date(from.getTime() - 3 * 3_600_000).toISOString() },
        },
        { firstSeen: { less_than: new Date(from.getTime() + 24 * 3_600_000).toISOString() } },
      ],
    },
    pagination: false,
    depth: 0,
    sort: '-baseScore',
  })
  const stories = docs.filter((s) => bucharestDay(new Date(s.firstSeen)) === day)
  const entries = await entriesOf(payload, stories)
  if (!entries.length && !current) return false
  const data = { date: day, entries, count: entries.length, frozen: freeze }
  if (current) await payload.update({ collection: 'news-editions', id: current.id, data, depth: 0 })
  else
    await payload.create({
      collection: 'news-editions',
      data: { ...data, status: 'published' },
      depth: 0,
    })
  return true
}

/** Deletes news older than 90 days and run rows older than 30, without blocking any link. */
async function cleanUp(payload: Payload, now: Date) {
  const old = new Date(now.getTime() - KEEP_DAYS * 86_400_000)
  const ctx = { [REMOVING_STORY]: true }
  await payload.delete({
    collection: 'news-stories',
    where: { lastSeen: { less_than: old.toISOString() } },
    depth: 0,
    context: ctx,
  })
  await payload.delete({
    collection: 'news-items',
    where: { publishedAt: { less_than: old.toISOString() } },
    depth: 0,
    context: ctx,
  })
  // A story whose last headline just expired has nothing left to cite.
  const nearOld = new Date(old.getTime() + 3 * 86_400_000).toISOString()
  const ageing = await payload.find({
    collection: 'news-stories',
    where: { lastSeen: { less_than: nearOld } },
    pagination: false,
    depth: 0,
    select: { items: true },
  })
  const empty = ageing.docs.filter((d) => !(d.items ?? []).length).map((d) => d.id)
  if (empty.length)
    await payload.delete({
      collection: 'news-stories',
      where: { id: { in: empty } },
      depth: 0,
      context: ctx,
    })
  await payload.delete({
    collection: 'news-editions',
    where: { date: { less_than: bucharestDay(old) } },
    depth: 0,
  })
  await payload.delete({
    collection: 'news-runs',
    where: {
      startedAt: { less_than: new Date(now.getTime() - KEEP_RUN_DAYS * 86_400_000).toISOString() },
    },
    depth: 0,
  })
  // A blocked link older than the 7-day item window can never come back anyway.
  await payload.delete({
    collection: 'news-blocked',
    where: {
      createdAt: { less_than: new Date(now.getTime() - KEEP_RUN_DAYS * 86_400_000).toISOString() },
    },
    depth: 0,
  })
}

/** One Outbox message a day per problem: every source down 3 hours, or one down 24 hours. */
async function alertIfDown(payload: Payload, sources: RunSources, now: Date) {
  const day = bucharestDay(now)
  const hoursDown = (s?: SourceState) =>
    s?.failingSince ? (now.getTime() - new Date(s.failingSince).getTime()) / 3_600_000 : 0
  const active = Object.entries(sources).filter(([, s]) => s && s.state !== 'off') as [
    NewsSource,
    SourceState,
  ][]
  const problems: string[] = []
  if (active.length && active.every(([, s]) => hoursDown(s) >= ALERT_ALL_DOWN_HOURS)) {
    problems.push(
      `Nicio sursă de știri nu a răspuns de ${ALERT_ALL_DOWN_HOURS} ore / No news source has answered for ${ALERT_ALL_DOWN_HOURS} hours.`,
    )
  }
  for (const [key, s] of active) {
    if (hoursDown(s) >= ALERT_SOURCE_DOWN_HOURS) {
      problems.push(`${newsSources[key].name}: ${s.error ?? 'failing'} since ${s.failingSince}`)
    }
  }
  if (!problems.length) return 0
  await sendMessage(payload, {
    channel: 'email',
    to: process.env.EDITORIAL_EMAIL || 'editorial (EDITORIAL_EMAIL not set)',
    template: 'news-health',
    subject: 'Știri: surse care nu răspund / News sources down',
    body: [...problems, '', 'Admin: /admin/collections/news-runs'].join('\n'),
    dedupeKey: `news-health|${day}|${problems.length}`,
  })
  return problems.length
}

export type IngestResult =
  | { skipped: 'locked' }
  | {
      created: number
      stories: number
      editions: number
      failed: string[]
      sources: RunSources
    }

export async function ingestNews(
  payload: Payload,
  opts: { now?: Date; fetchImpl?: typeof fetch } = {},
): Promise<IngestResult> {
  const now = opts.now ?? new Date()
  const fetchImpl = opts.fetchImpl ?? fetch

  // Overlap guard: another run younger than ten minutes holds the lock.
  const lockSince = new Date(now.getTime() - LOCK_MINUTES * 60_000).toISOString()
  const running = await payload.find({
    collection: 'news-runs',
    where: { and: [{ status: { equals: 'running' } }, { startedAt: { greater_than: lockSince } }] },
    limit: 1,
    depth: 0,
  })
  if (running.docs.length) return { skipped: 'locked' }

  const last = await payload.find({
    collection: 'news-runs',
    where: { status: { not_equals: 'running' } },
    sort: '-startedAt',
    limit: 1,
    depth: 0,
  })
  const lastRun = last.docs[0]
  const prevSources = (lastRun?.sources ?? {}) as RunSources
  const run = await payload.create({
    collection: 'news-runs',
    data: { startedAt: now.toISOString(), status: 'running', created: 0 },
    depth: 0,
  })

  try {
    const { disabled, weights } = await settingsOf(payload)
    const sources: RunSources = {}

    const fetched = await Promise.all(
      newsSourceKeys.map(async (key) => {
        const prev = prevSources[key]
        const carry = {
          etag: prev?.etag,
          lastModified: prev?.lastModified,
          failures: prev?.failures ?? 0,
          failingSince: prev?.failingSince,
          lastAttempt: prev?.lastAttempt,
        }
        if (disabled.has(key)) {
          sources[key] = { ...carry, state: 'off', failures: 0, failingSince: undefined }
          return null
        }
        const pausedUntil = prev?.lastAttempt
          ? new Date(prev.lastAttempt).getTime() + BREAKER_PAUSE_HOURS * 3_600_000
          : 0
        if ((prev?.failures ?? 0) >= BREAKER_FAILURES && now.getTime() < pausedUntil) {
          sources[key] = { ...carry, state: 'paused' }
          return null
        }
        try {
          const res = await fetchFeed(key, prev, fetchImpl)
          const base = {
            etag: res.etag,
            lastModified: res.lastModified,
            failures: 0,
            lastAttempt: now.toISOString(),
            status: res.status,
          }
          if (res.status === 304 || !res.body) {
            sources[key] = { ...base, state: 'unchanged' }
            return null
          }
          const parsed = parseRss(res.body, key)
          if (!parsed.length) throw new Error('no items')
          sources[key] = { ...base, state: 'ok' }
          return { key, parsed }
        } catch (e) {
          sources[key] = {
            ...carry,
            state: 'failed',
            status: (e as { status?: number }).status,
            error:
              e instanceof Error ? (e.name === 'TimeoutError' ? 'timeout' : e.message) : String(e),
            failures: (prev?.failures ?? 0) + 1,
            failingSince: prev?.failingSince ?? now.toISOString(),
            lastAttempt: now.toISOString(),
          }
          return null
        }
      }),
    )

    // Store the new headlines.
    let created = 0
    for (const f of fetched) {
      if (!f) continue
      const { kept, refused } = acceptable(f.parsed, now)
      const urls = kept.map((i) => i.url)
      const [known, blocked] = await Promise.all(
        (['news-items', 'news-blocked'] as const).map((collection) =>
          urls.length
            ? payload.find({
                collection,
                where: { url: { in: urls } },
                pagination: false,
                depth: 0,
                select: { url: true },
              })
            : Promise.resolve({ docs: [] as { url: string }[] }),
        ),
      )
      const skip = new Set([...known.docs, ...blocked.docs].map((d) => d.url))
      let added = 0
      for (const item of kept) {
        if (skip.has(item.url)) continue
        skip.add(item.url)
        await payload.create({
          collection: 'news-items',
          depth: 0,
          data: {
            source: item.source,
            title: item.title,
            url: item.url,
            publishedAt: item.publishedAt.toISOString(),
            excerpt: item.excerpt || undefined,
            topics: item.topics,
            lang: item.lang,
            status: 'nou',
          },
        })
        added++
      }
      created += added
      sources[f.key] = { ...sources[f.key]!, new: added, known: kept.length - added, refused }
    }

    // Stories and editions change only when something new arrived, or when a day ends.
    const today = bucharestDay(now)
    const yesterday = bucharestDay(new Date(now.getTime() - 86_400_000))
    let stories = 0
    let editions = 0
    if (created) stories = await rebuildStories(payload, weights, now)
    if (created || stories) editions += Number(await buildEdition(payload, today, false))
    editions += Number(await buildEdition(payload, yesterday, true))

    if (bucharestHour(now) === CLEANUP_HOUR) await cleanUp(payload, now)
    await alertIfDown(payload, sources, now)
    if (created || stories || editions) revalidate(tags.news)

    const failed = Object.entries(sources)
      .filter(([, s]) => s?.state === 'failed')
      .map(([k, s]) => `${k}: ${s?.error}`)
    const tried = Object.values(sources).filter(
      (s) => s && s.state !== 'off' && s.state !== 'paused',
    ).length
    const status = failed.length === 0 ? 'ok' : failed.length >= tried ? 'failed' : 'partial'
    await payload.update({
      collection: 'news-runs',
      id: run.id,
      data: {
        finishedAt: new Date().toISOString(),
        status,
        created,
        sources,
        summary: `${created} new, ${stories} story writes, ${failed.length} failed`,
      },
      depth: 0,
    })
    return { created, stories, editions, failed, sources }
  } catch (error) {
    await payload.update({
      collection: 'news-runs',
      id: run.id,
      data: {
        finishedAt: new Date().toISOString(),
        status: 'failed',
        summary: error instanceof Error ? error.message.slice(0, 300) : String(error),
        // Keep the source memory for the next run.
        sources: prevSources,
      },
      depth: 0,
    })
    throw error
  }
}
