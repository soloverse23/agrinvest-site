import type { NewsTopic } from './lexicon'

/**
 * Agrinvest's own photos (stills from its brand film, `public/news/*.webp`, 480×270), shown on
 * a story whose feed has no photo (owner, 2026-11-15). They illustrate the topic; they are
 * never presented as the article's photo (the title says "Foto: Agrinvest").
 */
export const topicPhotos: Record<NewsTopic, string[]> = {
  preturi: ['grain-close', 'wheat-ears', 'harvest-unload'],
  subventii: ['credit-office', 'green-fields', 'row-crops'],
  vreme: ['stubble-sowing', 'row-crops', 'green-fields'],
  inputuri: ['spreader', 'big-bags', 'fuel-tanker'],
  boli: ['trial-plots', 'green-fields'],
  comert: ['silo-row', 'fuel-tanker', 'harvest-unload'],
  finantare: ['credit-office', 'silo-row'],
  ferma: ['tractor-cab', 'combine-front', 'sowing'],
}

const all = [...new Set(Object.values(topicPhotos).flat())]

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

export const photoSrc = (name: string) => `/news/${name}.webp`

/**
 * A topic photo for a story: stable for its key, and not one in `used` while another is free
 * (first the topic's own photos, then any).
 */
export function topicPhoto(topic: NewsTopic, key: string, used: Set<string> = new Set()) {
  const own = topicPhotos[topic] ?? topicPhotos.ferma
  const start = hash(key)
  for (const list of [own, all])
    for (let i = 0; i < list.length; i++) {
      const name = list[(start + i) % list.length]
      if (!used.has(name)) return name
    }
  return own[start % own.length]
}
