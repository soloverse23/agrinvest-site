/**
 * Fills a year of Romania's weekly diesel price from the Oil Bulletin's price history, so the
 * diesel chart has data from the first deploy. Runs only while fewer than `MIN_WEEKS` weekly
 * rows exist; after that the daily `fetchOilBulletin` job keeps the series. Safe to repeat
 * (rows are upserted) and never stops a deploy: a failure is logged and skipped.
 */
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Payload } from 'payload'

import { parseOilBulletinHistory } from '../../src/lib/diesel/oil-bulletin'
import { upsertMarketPrices } from '../../src/lib/prices/store'
import { endpoints, fetchHeaders } from '../../src/lib/sources'

export const MIN_WEEKS = 20

export async function backfillDiesel(payload: Payload, log: (s: string) => void = console.log) {
  const { totalDocs } = await payload.count({
    collection: 'market-prices',
    where: { and: [{ source: { equals: 'eu-oil-bulletin' } }, { series: { equals: 'diesel' } }] },
  })
  if (totalDocs >= MIN_WEEKS) return
  try {
    const res = await fetch(endpoints.oilBulletinHistory, { headers: fetchHeaders })
    if (!res.ok) throw new Error(`answered ${res.status}`)
    const rows = parseOilBulletinHistory(Buffer.from(await res.arrayBuffer()))
    const { created } = await upsertMarketPrices(payload, rows)
    log(`backfill: diesel history, ${created} week(s) added`)
    // Written outside Next.js: clear its local data cache, as the seed does. On Vercel the
    // market cache also expires within the hour (`src/lib/prices/load.ts`).
    if (created)
      for (const dir of ['.next/cache/fetch-cache', '.next/dev/cache/fetch-cache'])
        rmSync(resolve(dir), { recursive: true, force: true })
  } catch (error) {
    log(`backfill: diesel history skipped (${error instanceof Error ? error.message : error})`)
  }
}
