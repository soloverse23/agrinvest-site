import { normalise } from './lexicon'

/**
 * Groups headlines about the same event into stories (decision 0011). Pure: no I/O.
 *
 * Two headlines belong together when they are in the same language, were published within
 * `WINDOW_HOURS` of each other, and their significant words overlap: a Jaccard similarity of
 * at least 0.5, or at least 0.3 when they also share a number or a capitalised name.
 */

export const WINDOW_HOURS = 48

/** Common words that say nothing about the event. */
const STOP = new Set(
  (
    'a ai al ale am ar are as asta acest aceasta acum au bine ca care ce cea cel cele cei cu cum ' +
    'da dar de deja din dupa e este eu fi fie fost iar ii in inca intr intre isi la le lui mai mult ' +
    'ne nici noi nu o ori pe pentru peste prin sa sau se si sub sunt sus tot toti un una unei unui ' +
    'va vor anul anului ani azi ieri maine noi nou noua spune spun anunta potrivit ' +
    'the a an and or of to in on for with from by at as is are was were be has have had will ' +
    'its it this that after over says said new more than amid as'
  ).split(' '),
)

/** Significant words of a headline: normalised, no stop words, at least 3 letters. */
export function words(title: string): Set<string> {
  return new Set(
    normalise(title)
      .split(/[^a-z0-9%]+/)
      .filter((w) => w.length >= 3 && !STOP.has(w)),
  )
}

/** Numbers (with %), and capitalised words that are not the first word: names, places. */
export function entities(title: string): Set<string> {
  const out = new Set<string>()
  for (const n of title.match(/\d[\d.,]*%?/g) ?? []) out.add(n.replace(/[.,]$/, ''))
  const tokens = title.split(/\s+/)
  tokens.forEach((tok, i) => {
    if (i > 0 && /^[A-ZĂÂÎȘȚŞŢ][\p{L}-]{2,}/u.test(tok))
      out.add(normalise(tok.replace(/[^\p{L}-]/gu, '')))
  })
  return out
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0
  let shared = 0
  for (const w of a) if (b.has(w)) shared++
  return shared / (a.size + b.size - shared)
}

export type Groupable = {
  id: number | string
  title: string
  lang: 'ro' | 'en'
  publishedAt: Date
}

/** True when two headlines describe the same event. */
export function sameEvent(a: Groupable, b: Groupable): boolean {
  if (a.lang !== b.lang) return false
  const hours = Math.abs(a.publishedAt.getTime() - b.publishedAt.getTime()) / 3_600_000
  if (hours > WINDOW_HOURS) return false
  const j = jaccard(words(a.title), words(b.title))
  if (j >= 0.5) return true
  if (j < 0.3) return false
  const ea = entities(a.title)
  for (const e of entities(b.title)) if (ea.has(e)) return true
  return false
}

/**
 * Groups items into stories (single-link: an item joins a story when it matches any item in
 * it). The result is stable: stories come out ordered by their oldest item, and each story's
 * items oldest first, so a story keeps its key (its first item's id) as it grows.
 */
export function group<T extends Groupable>(items: T[]): T[][] {
  const sorted = [...items].sort(
    (a, b) =>
      a.publishedAt.getTime() - b.publishedAt.getTime() || String(a.id).localeCompare(String(b.id)),
  )
  const stories: T[][] = []
  for (const item of sorted) {
    const hits = stories.filter((s) => s.some((other) => sameEvent(item, other)))
    if (!hits.length) {
      stories.push([item])
      continue
    }
    // Merge every story this item links, keeping the oldest one's place.
    const [first, ...rest] = hits
    first.push(item)
    for (const s of rest) {
      first.push(...s)
      stories.splice(stories.indexOf(s), 1)
    }
    first.sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime())
  }
  return stories
}
