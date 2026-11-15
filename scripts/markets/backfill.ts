/**
 * History for the Phase 7f market pages, so the charts have years of data from the first
 * deploy: Brent and ECB rates from 2016 (daily), the World Bank's monthly prices from 2010 and
 * ten years of weekly fuel prices from the Oil Bulletin. Each source is filled only while it
 * has fewer rows than its threshold; after that the cron jobs keep it current. Rows go in with
 * one set-based insert per 500 (`insertMarketPrices`), safe to repeat. A failed source is
 * logged and skipped: it must never stop a deploy.
 */
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Payload, Where } from 'payload'

import { fuelHistoryRows } from '../../src/lib/diesel/oil-bulletin'
import { fetchBrent, fetchEcbRates, fetchWorldBank } from '../../src/lib/markets/fetch'
import type { MarketRow } from '../../src/lib/prices/types'
import { insertMarketPrices } from '../../src/lib/prices/store'
import { endpoints, fetchHeaders } from '../../src/lib/sources'
import { readFirstSheet } from '../../src/lib/xlsx'

const FROM_DAILY = new Date(Date.UTC(2016, 0, 1))
const FROM_MONTHLY = new Date(Date.UTC(2010, 0, 1))
const FUEL_WEEKS = 10 * 53

async function fuelHistory(now: Date) {
  const res = await fetch(endpoints.oilBulletinHistory, { headers: fetchHeaders })
  if (!res.ok) throw new Error(`Oil Bulletin history answered ${res.status}`)
  return fuelHistoryRows(readFirstSheet(Buffer.from(await res.arrayBuffer())), FUEL_WEEKS, now)
}

const steps: {
  name: string
  where: Where
  min: number
  rows: (now: Date) => Promise<MarketRow[]>
}[] = [
  {
    name: 'Brent (EIA via FRED)',
    where: { source: { equals: 'eia-brent' } },
    min: 1500,
    rows: (now) => fetchBrent(FROM_DAILY, now),
  },
  {
    name: 'ECB rates',
    where: { source: { equals: 'ecb' } },
    min: 3000,
    rows: (now) => fetchEcbRates(FROM_DAILY, now),
  },
  {
    name: 'World Bank monthly prices',
    where: { source: { equals: 'world-bank' } },
    min: 1500,
    rows: (now) => fetchWorldBank(FROM_MONTHLY, now),
  },
  {
    name: 'Oil Bulletin fuel history',
    where: {
      and: [{ source: { equals: 'eu-oil-bulletin' } }, { market: { equals: 'EU' } }],
    },
    min: 200,
    rows: fuelHistory,
  },
]

export async function backfillMarkets(payload: Payload, log: (s: string) => void = console.log) {
  let added = 0
  for (const step of steps) {
    const { totalDocs } = await payload.count({ collection: 'market-prices', where: step.where })
    if (totalDocs >= step.min) continue
    try {
      const rows = await step.rows(new Date())
      const { created } = await insertMarketPrices(payload, rows)
      added += created
      log(`markets: ${step.name}, ${created} row(s) added`)
    } catch (error) {
      log(`markets: ${step.name} skipped (${error instanceof Error ? error.message : error})`)
    }
  }
  // Written outside Next.js: clear its local data cache, as the seed does. On Vercel the
  // market cache also expires within the hour (`src/lib/markets/load.ts`).
  if (added)
    for (const dir of ['.next/cache/fetch-cache', '.next/dev/cache/fetch-cache'])
      rmSync(resolve(dir), { recursive: true, force: true })
  return added
}
