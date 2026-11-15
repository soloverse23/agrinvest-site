import type { StoryCardData, StoryLabels } from '@ds/patterns/NewsStories'
import type { Locale } from '@/i18n/config'
import { newsUi, topicLabels } from '@/i18n/news'
import type { EditionEntry } from '@/lib/news/types'

/** News stories as cards, shared by `/stiri`, the daily editions and the home panel (7e). */

/**
 * A ranked story or an edition entry as a card. The time is the first publisher's, because
 * it is shown next to that publisher's name.
 */
export function storyCard(e: EditionEntry, rank: number, locale: Locale): StoryCardData {
  const lead = e.references[0]
  return {
    key: e.key,
    rank,
    title: e.title,
    href: lead.url,
    topic: { label: topicLabels[e.topic][locale] },
    lang: e.lang,
    date: new Date(lead.publishedAt),
    excerpt: lead.excerpt ? { text: lead.excerpt, source: lead.name } : null,
    sources: e.references.map((r) => ({
      name: r.name,
      title: r.title,
      url: r.url,
      viaGoogle: r.viaGoogle,
    })),
  }
}

export const storyLabels = (locale: Locale): StoryLabels => ({
  more: newsUi[locale].more,
  via: newsUi[locale].via,
})
