import type { Payload } from 'payload'

import { newsSources, type NewsSource } from '@/lib/sources'
import type { NewsItem, NewsStory } from '@/payload-types'

import type { NewsTopic } from './lexicon'
import type { EditionEntry, StoryReference } from './types'

/** A stored headline as a story reference. Excerpts are cut to the publisher's limit again. */
export function referenceOf(
  item: Pick<NewsItem, 'title' | 'url' | 'source' | 'excerpt' | 'publishedAt'>,
): StoryReference {
  const info = newsSources[item.source as NewsSource]
  return {
    name: info?.name ?? item.source,
    title: item.title,
    url: item.url,
    excerpt: info?.excerptMax ? (item.excerpt ?? '').slice(0, info.excerptMax) : '',
    publishedAt: item.publishedAt,
    viaGoogle: info?.linkHosts.includes('news.google.com') ?? false,
  }
}

/** A story's entry for a page or an edition. Hidden headlines are left out. */
export async function entriesOf(payload: Payload, stories: NewsStory[]): Promise<EditionEntry[]> {
  const ids = stories.flatMap((s) => (s.items ?? []).map((i) => (typeof i === 'number' ? i : i.id)))
  if (!ids.length) return []
  const { docs } = await payload.find({
    collection: 'news-items',
    where: { and: [{ id: { in: ids } }, { status: { not_equals: 'ascuns' } }] },
    pagination: false,
    depth: 0,
  })
  const byId = new Map(docs.map((d) => [d.id, d]))
  return stories
    .map((s) => {
      const refs = (s.items ?? [])
        .map((i) => byId.get(typeof i === 'number' ? i : i.id))
        .filter((d): d is NewsItem => Boolean(d))
        .map(referenceOf)
      return {
        key: s.key,
        title: refs[0]?.title ?? s.title,
        topic: s.topic as NewsTopic,
        lang: (s.lang ?? 'ro') as 'ro' | 'en',
        publishedAt: s.firstSeen,
        lastSeen: s.lastSeen,
        baseScore: s.baseScore ?? 0,
        references: refs,
      }
    })
    .filter((e) => e.references.length > 0)
}
