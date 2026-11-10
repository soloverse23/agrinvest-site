import type { Payload } from 'payload'

import { marketKey, type MarketRow } from './types'

/**
 * Adds the rows that are not stored yet (unique on source, series, market and period).
 * The series is append-only: a value already stored is kept, so a rerun changes nothing.
 */
export async function upsertMarketPrices(payload: Payload, rows: MarketRow[]) {
  const keys = rows.map(marketKey)
  const existing = new Set<string>()
  for (let i = 0; i < keys.length; i += 200) {
    const found = await payload.find({
      collection: 'market-prices',
      where: { key: { in: keys.slice(i, i + 200) } },
      limit: 200,
      depth: 0,
      pagination: false,
      select: { key: true },
    })
    for (const doc of found.docs) existing.add(doc.key)
  }

  let created = 0
  for (const row of rows) {
    const key = marketKey(row)
    if (existing.has(key)) continue
    existing.add(key)
    await payload.create({
      collection: 'market-prices',
      depth: 0,
      data: {
        ...row,
        key,
        period: row.period.toISOString(),
        fetchedAt: row.fetchedAt.toISOString(),
      },
    })
    created++
  }
  return { created, skipped: rows.length - created }
}
