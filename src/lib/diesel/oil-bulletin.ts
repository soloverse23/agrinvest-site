import type { MarketRow } from '@/lib/prices/types'
import { readFirstSheet, excelDate } from '@/lib/xlsx'

/**
 * The Weekly Oil Bulletin's "prices with taxes" sheet: one row per country, consumer
 * prices in euro per 1,000 litres, the bulletin date (a Monday) in A2. Column C is
 * automotive gas oil (diesel). Returns Romania's diesel price, or throws when the layout
 * has changed, so the job fails loudly instead of storing a wrong number.
 */
export function parseOilBulletin(file: Buffer, fetchedAt = new Date()): MarketRow[] {
  const rows = readFirstSheet(file)
  const header = rows[0]?.C ?? ''
  if (!/gas oil|diesel/i.test(header)) throw new Error('Oil Bulletin: column C is not diesel')
  const unit = rows[1]?.C?.trim()
  if (unit !== '1000 l') throw new Error(`Oil Bulletin: unexpected unit "${unit}"`)
  const serial = Number(rows[1]?.A)
  if (!Number.isFinite(serial) || serial < 40_000) throw new Error('Oil Bulletin: no date')

  const romania = rows.find((r) => r.A?.trim() === 'Romania')
  const price = Number(romania?.C)
  if (!romania || !Number.isFinite(price) || price <= 0)
    throw new Error('Oil Bulletin: no diesel price for Romania')

  return [
    {
      source: 'eu-oil-bulletin',
      series: 'diesel',
      market: 'RO',
      // Romania reports in lei; the bulletin converts to euro with long fractions.
      price: Math.round(price * 100) / 100,
      currency: 'EUR',
      unit: '1000 l',
      period: excelDate(serial),
      fetchedAt,
    },
  ]
}
