import { newsSources, type NewsSource, type NewsSourceKind } from '@/lib/sources'

import type { NewsTopic } from './lexicon'

/**
 * How important a story is (decision 0011). Pure: no I/O.
 *
 *   score = topic × relevance × coverage × source × freshness
 *
 * Every part is kept, so the admin can show why a story ranks where it does. The weights can
 * be changed in the admin (`News settings`) without a deploy; these are the defaults.
 */

export type Weights = {
  /** Multipliers per source kind. */
  source: Record<NewsSourceKind, number>
  /** Hours for the freshness factor to halve. */
  halfLifeHours: number
  /** Romania and EU / Black Sea relevance multipliers. */
  romania: number
  region: number
}

export const defaultWeights: Weights = {
  source: { official: 1.3, wire: 1.3, farm: 1.1, general: 1 },
  halfLifeHours: 24,
  romania: 1.5,
  region: 1.2,
}

export type ScoreInput = {
  /** Highest topic weight across the story's items (0.5–3); a farm-press item with none counts 0.5. */
  topicWeight: number
  /** Raw relevance from the lexicon: 1.5 Romania, 1.2 region, 1 elsewhere. */
  relevance: number
  sources: NewsSource[]
  /** The newest item's date. */
  latest: Date
}

export type ScoreParts = {
  topic: number
  relevance: number
  coverage: number
  source: number
  freshness: number
}

const round = (n: number) => Math.round(n * 1000) / 1000

export function score(
  input: ScoreInput,
  now: Date,
  w: Weights = defaultWeights,
): { score: number; parts: ScoreParts } {
  const distinct = [...new Set(input.sources)]
  const relevance = input.relevance >= 1.5 ? w.romania : input.relevance > 1 ? w.region : 1
  const source = Math.max(...distinct.map((s) => w.source[newsSources[s]?.kind ?? 'general']))
  const hours = Math.max(0, (now.getTime() - input.latest.getTime()) / 3_600_000)
  const parts: ScoreParts = {
    topic: Math.max(0.5, input.topicWeight),
    relevance,
    coverage: 1 + Math.log2(distinct.length),
    source,
    freshness: Math.pow(0.5, hours / w.halfLifeHours),
  }
  const total = parts.topic * parts.relevance * parts.coverage * parts.source * parts.freshness
  return {
    score: round(total),
    parts: Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, round(v)])) as ScoreParts,
  }
}

/** The topic a story is filed under on the page: its heaviest topic, ties by list order. */
export function mainTopic(found: NewsTopic[], weights: Record<NewsTopic, { weight: number }>) {
  return [...found].sort((a, b) => weights[b].weight - weights[a].weight)[0] ?? 'ferma'
}
