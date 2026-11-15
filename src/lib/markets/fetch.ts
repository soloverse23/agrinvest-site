import { endpoints, fetchHeaders } from '@/lib/sources'

import { parseEcbRates, parseFredBrent, parseWorldBank, worldBankWorkbookUrl } from './parse'

/**
 * Downloads for the Phase 7f sources, shared by the cron jobs (recent data) and
 * `apply:markets` (the history). `since` is a UTC day; each throws on a failed answer.
 */

const day = (d: Date) => d.toISOString().slice(0, 10)

async function get(url: string, what: string) {
  const res = await fetch(url, { headers: fetchHeaders, cache: 'no-store' })
  if (!res.ok) throw new Error(`${what} answered ${res.status}`)
  return res
}

export async function fetchBrent(since: Date, now = new Date()) {
  const res = await get(`${endpoints.fredBrent}&cosd=${day(since)}`, 'FRED')
  return parseFredBrent(await res.text(), now)
}

export async function fetchEcbRates(since: Date, now = new Date()) {
  const res = await get(`${endpoints.ecbRates}&startPeriod=${day(since)}`, 'ECB')
  return parseEcbRates(await res.text(), now)
}

export async function fetchWorldBank(since: Date, now = new Date()) {
  const page = await get(endpoints.worldBankPage, 'World Bank page')
  const file = await get(worldBankWorkbookUrl(await page.text()), 'World Bank workbook')
  return parseWorldBank(Buffer.from(await file.arrayBuffer()), since, now)
}

/** `days` before `now`, as a UTC day. */
export const daysAgo = (days: number, now = new Date()) =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days))
