import type { NewsTopic } from './lexicon'

/** One source line of a story: the publisher's own headline and link. */
export type StoryReference = {
  /** Publisher name, e.g. "Agrointel". */
  name: string
  title: string
  url: string
  /** The excerpt this publisher allows; empty when only the headline may be shown. */
  excerpt: string
  publishedAt: string
  /** True for links that go through Google News (Reuters). */
  viaGoogle: boolean
}

/** A story as the pages show it, and as a daily edition stores it. */
export type EditionEntry = {
  key: string
  title: string
  topic: NewsTopic
  lang: 'ro' | 'en'
  /** The lead headline's date (ISO). */
  publishedAt: string
  /** The newest headline's date (ISO). */
  lastSeen: string
  baseScore: number
  references: StoryReference[]
}
