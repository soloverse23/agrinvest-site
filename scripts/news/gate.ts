/**
 * Rules for `npm run check:news` (Phase 7e, decision 0011). Pure: the runner reads the data.
 */
import { hostAllowed } from '../../src/lib/news/rss'
import { newsSources, type NewsSource } from '../../src/lib/sources'

export type Finding = { level: 'error' | 'warning'; rule: string; message: string }

export type GateItem = { id: number; source: string; url: string; excerpt?: string | null }
export type GateStory = { id: number; key: string; items: number }

/** Every stored headline comes from a registered source, links to its hosts, and its excerpt is within the publisher's limit. */
export function itemFindings(items: GateItem[]): Finding[] {
  const out: Finding[] = []
  for (const i of items) {
    const info = newsSources[i.source as NewsSource]
    if (!info) {
      out.push({
        level: 'error',
        rule: 'source',
        message: `item ${i.id}: unknown source "${i.source}"`,
      })
      continue
    }
    if (!hostAllowed(new URL(i.url).hostname, info.linkHosts))
      out.push({
        level: 'error',
        rule: 'host',
        message: `item ${i.id}: ${i.url} is outside ${info.name}'s hosts`,
      })
    const len = (i.excerpt ?? '').length
    if (len > info.excerptMax)
      out.push({
        level: 'error',
        rule: 'excerpt',
        message: `item ${i.id}: excerpt ${len} characters, ${info.name} allows ${info.excerptMax}`,
      })
  }
  return out
}

/** Every visible story has at least one headline to cite. */
export function storyFindings(stories: GateStory[]): Finding[] {
  return stories
    .filter((s) => s.items < 1)
    .map((s) => ({
      level: 'error' as const,
      rule: 'references',
      message: `story ${s.key} has no headline`,
    }))
}

/** The last successful run is under two hours old; an error only once the site is indexable. */
export function freshnessFindings(lastOk: Date | null, now: Date, indexable: boolean): Finding[] {
  const level = indexable ? 'error' : 'warning'
  if (!lastOk) return [{ level, rule: 'freshness', message: 'no successful news run yet' }]
  const hours = (now.getTime() - lastOk.getTime()) / 3_600_000
  return hours > 2
    ? [
        {
          level,
          rule: 'freshness',
          message: `last successful run ${hours.toFixed(1)} hours ago (limit 2)`,
        },
      ]
    : []
}
