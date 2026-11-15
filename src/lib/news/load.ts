import { unstable_cache } from 'next/cache'

import { payloadClient } from '@/lib/content/payload'
import { tags } from '@/lib/revalidate'
import { newsSources } from '@/lib/sources'
import type { NewsStory } from '@/payload-types'

import { WINDOW_HOURS } from './group'
import { entriesOf } from './entries'
import { defaultWeights } from './score'
import type { EditionEntry } from './types'

export type Headline = {
  id: number
  title: string
  url: string
  source: string
  publishedAt: string
  excerpt?: string | null
}

/**
 * Pages re-rank at least this often, so a story's freshness keeps falling between runs that
 * add nothing (a quiet hour writes nothing and revalidates nothing).
 */
const RERANK_SECONDS = 900

/**
 * The latest headlines from the feeds. Every item shows unless staff hide it (`ascuns`): the
 * feeds are licence-checked (decisions 0008, 0011) and only carry title, date, link and the
 * excerpt the publisher allows. Public reads only.
 */
export const listHeadlines = unstable_cache(
  async (limit: number): Promise<Headline[]> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'news-items',
      where: { status: { not_equals: 'ascuns' } },
      sort: '-publishedAt',
      limit,
      depth: 0,
      overrideAccess: false,
    })
    return docs.map((d) => ({
      id: d.id,
      title: d.title,
      url: d.url,
      source: newsSources[d.source]?.name ?? d.source,
      publishedAt: d.publishedAt,
      excerpt: newsSources[d.source]?.excerptMax ? d.excerpt : null,
    }))
  },
  ['news:headlines'],
  { tags: [tags.news], revalidate: RERANK_SECONDS },
)

export type RankedStory = EditionEntry & {
  rank: number
  /** baseScore × freshness, as of the page render. */
  score: number
  pinned: boolean
}

/** Read-time rank: pinned first, then base score × freshness (half-life from the settings). */
function rank(stories: NewsStory[], halfLifeHours: number, now: Date) {
  const pinned = (s: NewsStory) => Boolean(s.pinnedUntil && new Date(s.pinnedUntil) > now)
  return stories
    .map((s) => {
      const hours = Math.max(0, (now.getTime() - new Date(s.lastSeen).getTime()) / 3_600_000)
      return {
        s,
        pinned: pinned(s),
        score: (s.baseScore ?? 0) * Math.pow(0.5, hours / halfLifeHours),
      }
    })
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.score - a.score)
}

/**
 * The visible stories of the last 48 hours, ranked. `limit` caps the result; the home panel
 * asks for 5, `/stiri` for all.
 */
export const listRankedStories = unstable_cache(
  async (limit: number): Promise<RankedStory[]> => {
    const payload = await payloadClient()
    const now = new Date()
    const [settings, { docs }] = await Promise.all([
      payload.findGlobal({ slug: 'news-settings', depth: 0 }).catch(() => null),
      payload.find({
        collection: 'news-stories',
        where: {
          lastSeen: {
            greater_than_equal: new Date(now.getTime() - WINDOW_HOURS * 3_600_000).toISOString(),
          },
        },
        pagination: false,
        depth: 0,
        overrideAccess: false,
      }),
    ])
    const ranked = rank(
      docs,
      settings?.weights?.halfLifeHours ?? defaultWeights.halfLifeHours,
      now,
    ).slice(0, limit)
    const entries = await entriesOf(
      payload,
      ranked.map((r) => r.s),
    )
    const byKey = new Map(entries.map((e) => [e.key, e]))
    return ranked.flatMap((r, i) => {
      const e = byKey.get(r.s.key)
      return e ? [{ ...e, rank: i + 1, score: r.score, pinned: r.pinned }] : []
    })
  },
  ['news:ranked'],
  { tags: [tags.news], revalidate: RERANK_SECONDS },
)

export type NewsStatus = {
  /** End of the last run that reached at least one source. */
  updated: string | null
  /** Sources that answered (new items or unchanged) on that run. */
  sources: number
}

/**
 * When the news last refreshed, for the "Updated … from N sources" line. The run log is
 * staff-only; this reads only its time and the count of sources that answered.
 */
export const newsStatus = unstable_cache(
  async (): Promise<NewsStatus> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'news-runs',
      where: { status: { in: ['ok', 'partial'] } },
      sort: '-startedAt',
      limit: 1,
      depth: 0,
      select: { finishedAt: true, startedAt: true, sources: true },
    })
    const run = docs[0]
    if (!run) return { updated: null, sources: 0 }
    const states = Object.values((run.sources ?? {}) as Record<string, { state?: string }>)
    return {
      updated: run.finishedAt ?? run.startedAt,
      sources: states.filter((s) => s?.state === 'ok' || s?.state === 'unchanged').length,
    }
  },
  ['news:status'],
  { tags: [tags.news], revalidate: RERANK_SECONDS },
)

export type EditionSummary = { date: string; count: number }

/** Published daily editions, newest first. */
export const listEditions = unstable_cache(
  async (limit: number): Promise<EditionSummary[]> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'news-editions',
      where: { count: { greater_than: 0 } },
      sort: '-date',
      limit,
      depth: 0,
      overrideAccess: false,
      select: { date: true, count: true },
    })
    return docs.map((d) => ({ date: d.date, count: d.count ?? 0 }))
  },
  ['news:editions'],
  { tags: [tags.news] },
)

export type Edition = { date: string; entries: EditionEntry[]; frozen: boolean }

export const getEdition = unstable_cache(
  async (date: string): Promise<Edition | null> => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'news-editions',
      where: { date: { equals: date } },
      limit: 1,
      depth: 0,
      overrideAccess: false,
    })
    const d = docs[0]
    if (!d || !(d.count ?? 0)) return null
    return { date: d.date, entries: (d.entries ?? []) as EditionEntry[], frozen: Boolean(d.frozen) }
  },
  ['news:edition'],
  { tags: [tags.news] },
)

/** Whether daily edition pages may be indexed (`News settings`, off by default). */
export const editionsIndexable = unstable_cache(
  async (): Promise<boolean> => {
    const payload = await payloadClient()
    const s = await payload.findGlobal({ slug: 'news-settings', depth: 0 }).catch(() => null)
    return Boolean(s?.indexEditions)
  },
  ['news:index-editions'],
  { tags: [tags.news] },
)
