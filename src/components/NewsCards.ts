import type { StoryCardData, StoryLabels, StoryTone } from '@ds/patterns/NewsStories'
import type { Locale } from '@/i18n/config'
import { newsUi, topicChips } from '@/i18n/news'
import type { NewsTopic } from '@/lib/news/lexicon'
import type { EditionEntry } from '@/lib/news/types'

/** News stories as cards, shared by `/stiri`, the daily editions and the home panel (7e). */

const topicTone: Record<NewsTopic, StoryTone> = {
  preturi: 'price',
  subventii: 'support',
  vreme: 'weather',
  boli: 'disease',
  comert: 'trade',
  inputuri: 'neutral',
  finantare: 'neutral',
  ferma: 'neutral',
}

/** A ranked story or an edition entry as a card. */
export function storyCard(e: EditionEntry, rank: number, locale: Locale): StoryCardData {
  const lead = e.references[0]
  return {
    key: e.key,
    rank,
    title: e.title,
    href: lead.url,
    topic: { label: topicChips[e.topic][locale], tone: topicTone[e.topic] },
    lang: e.lang,
    date: new Date(e.lastSeen),
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
  sources: newsUi[locale].sources,
  references: newsUi[locale].references,
  via: newsUi[locale].via,
})
