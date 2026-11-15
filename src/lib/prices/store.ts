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

/**
 * The same append-only upsert for long histories (Phase 7f backfill: thousands of rows), as
 * one `INSERT … ON CONFLICT (key) DO NOTHING` per 500 rows instead of a Payload create per
 * row. Skips Payload hooks, which `MarketPrices` does not have. Returns the rows added.
 */
export async function insertMarketPrices(payload: Payload, rows: MarketRow[]) {
  const { sql } = await import('@payloadcms/db-postgres')
  const db = (payload.db as unknown as { drizzle: { execute: (q: unknown) => Promise<unknown> } })
    .drizzle
  let created = 0
  for (let i = 0; i < rows.length; i += 500) {
    const values = rows
      .slice(i, i + 500)
      .map(
        (r) =>
          sql`(${marketKey(r)}, ${r.source}, ${r.series}, ${r.market}, ${r.price}, ${r.currency}, ${r.unit}, ${r.period.toISOString()}, ${r.fetchedAt.toISOString()})`,
      )
    const result = (await db.execute(sql`
      INSERT INTO "market_prices" ("key", "source", "series", "market", "price", "currency", "unit", "period", "fetched_at")
      VALUES ${sql.join(values, sql`, `)}
      ON CONFLICT ("key") DO NOTHING`)) as { rowCount?: number }
    created += result.rowCount ?? 0
  }
  return { created, skipped: rows.length - created }
}
