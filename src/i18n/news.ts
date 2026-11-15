import type { Locale } from '@/i18n/config'
import type { NewsTopic } from '@/lib/news/lexicon'

/** Topic names for the news pages, the home panel and the admin (Phase 7e). */
export const topicLabels: Record<NewsTopic, Record<Locale, string>> = {
  preturi: { ro: 'Prețuri și recolte', en: 'Prices and harvest' },
  subventii: { ro: 'Subvenții și plăți', en: 'Subsidies and payments' },
  vreme: { ro: 'Vreme și calamități', en: 'Weather and damage' },
  inputuri: { ro: 'Inputuri', en: 'Inputs' },
  boli: { ro: 'Boli și dăunători', en: 'Disease and pests' },
  comert: { ro: 'Comerț și UE', en: 'Trade and the EU' },
  finantare: { ro: 'Finanțare', en: 'Finance' },
  ferma: { ro: 'Din fermă', en: 'Farming' },
}

/** Short topic names for chips. */
export const topicChips: Record<NewsTopic, Record<Locale, string>> = {
  preturi: { ro: 'Prețuri', en: 'Prices' },
  subventii: { ro: 'Subvenții', en: 'Subsidies' },
  vreme: { ro: 'Vreme', en: 'Weather' },
  inputuri: { ro: 'Inputuri', en: 'Inputs' },
  boli: { ro: 'Boli', en: 'Disease' },
  comert: { ro: 'Comerț UE', en: 'EU trade' },
  finantare: { ro: 'Finanțare', en: 'Finance' },
  ferma: { ro: 'Fermă', en: 'Farming' },
}

export const newsUi = {
  ro: {
    important: 'Important acum',
    kicker: 'Știri pentru fermieri',
    updated: (when: string, n: number) =>
      `Actualizat ${when} · din ${n} ${n === 1 ? 'sursă' : 'surse'}`,
    sources: (n: number) => `${n} ${n === 1 ? 'sursă' : 'surse'}`,
    references: 'Surse',
    rest: 'Ultimele 48 de ore, pe subiecte',
    archive: 'Arhiva pe zile',
    archiveNone: 'Arhiva apare după prima zi încheiată.',
    allNews: 'Toate știrile',
    edition: (day: string) => `Știrile zilei: ${day}`,
    editionSummary:
      'Știrile agricole ale zilei, în ordinea importanței, cu sursele fiecăreia. Titlurile aparțin publicațiilor citate.',
    editionEmpty: 'Nu există știri pentru această zi.',
    previous: 'Ziua anterioară',
    next: 'Ziua următoare',
    empty: 'Știrile apar aici de îndată ce sursele publică.',
    disclaimer:
      'Titlurile și extrasele aparțin publicațiilor citate; ordinea este calculată automat după subiect, surse și vechime.',
    via: 'prin Google News',
  },
  en: {
    important: 'Important now',
    kicker: 'News for farmers',
    updated: (when: string, n: number) =>
      `Updated ${when} · from ${n} ${n === 1 ? 'source' : 'sources'}`,
    sources: (n: number) => `${n} ${n === 1 ? 'source' : 'sources'}`,
    references: 'Sources',
    rest: 'The last 48 hours, by topic',
    archive: 'Archive by day',
    archiveNone: 'The archive starts after the first full day.',
    allNews: 'All news',
    edition: (day: string) => `The day's news: ${day}`,
    editionSummary:
      "The day's farm news in order of importance, with each story's sources. Headlines belong to the publications quoted.",
    editionEmpty: 'There is no news for this day.',
    previous: 'Previous day',
    next: 'Next day',
    empty: 'News appears here as soon as the sources publish.',
    disclaimer:
      'Headlines and excerpts belong to the publications quoted; the order is computed automatically from topic, sources and age.',
    via: 'via Google News',
  },
} as const
