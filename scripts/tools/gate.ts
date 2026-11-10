/**
 * `check:tools` rules (Phase 5.8), pure so they are unit-tested. The runner is
 * `scripts/checks/tools.ts`. Dataset JSON-LD and noindex on URLs with parameters are checked
 * by `check:seo` and the e2e tests.
 */
import { marketSources, type MarketSource } from '../../src/lib/sources'

export type Finding = { level: 'error' | 'warning'; rule: string; message: string }

const DAY = 86_400_000
/** Margin on top of a source's cadence before its series counts as stale. */
export const STALE_MARGIN_DAYS = 7
/** A calculator's rule source must have been checked within a year. */
export const RULE_MAX_AGE_DAYS = 365

/**
 * Every market source's newest period, against its cadence. A stale or empty series warns
 * while the site is noindex and fails once it is indexable: a dated price page with old data
 * misleads (decision 0008).
 */
export function seriesFindings(
  latest: Partial<Record<MarketSource, Date>>,
  now: Date,
  indexable: boolean,
): Finding[] {
  const level = indexable ? 'error' : 'warning'
  return (Object.keys(marketSources) as MarketSource[]).flatMap((source): Finding[] => {
    const date = latest[source]
    const limit = marketSources[source].cadenceDays + STALE_MARGIN_DAYS
    if (!date) return [{ level, rule: 'series', message: `${source}: no data` }]
    const age = Math.floor((now.getTime() - date.getTime()) / DAY)
    return age > limit
      ? [
          {
            level,
            rule: 'series',
            message: `${source}: newest period ${age} days old (limit ${limit})`,
          },
        ]
      : []
  })
}

/** Each calculator rule source was checked within a year. */
export function ruleFindings(sources: { id: string; checked: string }[], now: Date): Finding[] {
  return sources.flatMap((s): Finding[] => {
    const age = (now.getTime() - Date.parse(s.checked)) / DAY
    if (Number.isNaN(age))
      return [{ level: 'error', rule: 'rules', message: `${s.id}: no check date` }]
    return age > RULE_MAX_AGE_DAYS
      ? [{ level: 'error', rule: 'rules', message: `${s.id}: last checked ${s.checked}` }]
      : []
  })
}
