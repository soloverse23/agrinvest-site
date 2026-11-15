import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { fuelHistoryRows, parseOilBulletin } from '@/lib/diesel/oil-bulletin'
import { crossRate, converted, lastDays, monthlyAverages, quoteOf } from '@/lib/markets/load'
import {
  parseEcbRates,
  parseFredBrent,
  worldBankRows,
  worldBankWorkbookUrl,
} from '@/lib/markets/parse'
import {
  marketKeys,
  markets,
  tickerMarkets,
  unitOf,
  worldBankColumns,
} from '@/lib/markets/registry'
import { showOwnPrices } from '@/lib/prices/visibility'
import { buildIssue } from '@/lib/news/newsletter'
import type { SheetRow } from '@/lib/xlsx'
import { marketSourceKeys } from '@/lib/sources'

const fixture = (name: string) => readFileSync(`tests/fixtures/feeds/${name}`)
const day = (d: Date) => d.toISOString().slice(0, 10)

describe('Phase 7f market sources (saved samples, 2026-11-15)', () => {
  it('reads daily Brent from FRED and skips holidays', () => {
    const rows = parseFredBrent(fixture('fred-brent.csv').toString())
    expect(rows).toHaveLength(6)
    expect(rows.at(-1)).toMatchObject({
      source: 'eia-brent',
      series: 'brent',
      market: 'world',
      price: 92.14,
      currency: 'USD',
      unit: 'bbl',
    })
    expect(day(rows.at(-1)!.period)).toBe('2026-11-11')
    expect(
      parseFredBrent('observation_date,DCOILBRENTEU\n2026-12-25,.\n2026-12-24,74.1'),
    ).toHaveLength(1)
    expect(() => parseFredBrent('observation_date,DGS10\n2026-11-11,4.1')).toThrow(/DCOILBRENTEU/)
  })

  it('reads the ECB’s EUR/RON and EUR/USD rates', () => {
    const rows = parseEcbRates(fixture('ecb-rates.csv').toString())
    const ron = rows.filter((r) => r.series === 'eur-ron')
    const usd = rows.filter((r) => r.series === 'eur-usd')
    expect(ron.length).toBeGreaterThan(0)
    expect(usd.length).toBe(ron.length)
    expect(ron.find((r) => day(r.period) === '2026-11-11')?.price).toBe(5.3451)
    expect(ron[0]).toMatchObject({ source: 'ecb', market: 'ECB', currency: 'RON', unit: 'EUR' })
    expect(() => parseEcbRates('A,B\n1,2')).toThrow(/header/)
  })

  it('reads the World Bank’s monthly prices by column header', () => {
    const rows = worldBankRows(
      JSON.parse(fixture('world-bank-monthly-sample.json').toString()),
      new Date(Date.UTC(2026, 0, 1)),
    )
    const series = new Set(rows.map((r) => r.series))
    expect([...series].sort()).toEqual(Object.values(worldBankColumns).sort())
    const urea = rows.find((r) => r.series === 'urea' && day(r.period) === '2026-10-01')
    expect(urea).toMatchObject({ source: 'world-bank', currency: 'USD', unit: 't', price: 420 })
    const gas = rows.find(
      (r) => r.series === 'natural-gas-europe' && day(r.period) === '2026-10-01',
    )
    expect(gas).toMatchObject({ unit: 'MMBtu', price: 28.5 })
    expect(() => worldBankRows([{ A: 'x' }], new Date(0))).toThrow(/header row/)
  })

  it('finds the workbook link on the World Bank page', () => {
    const html =
      '<a href="https://thedocs.worldbank.org/en/doc/abc-0050012026/related/CMO-Historical-Data-Monthly.xlsx">x</a>'
    expect(worldBankWorkbookUrl(html)).toMatch(/CMO-Historical-Data-Monthly\.xlsx$/)
    expect(() => worldBankWorkbookUrl('<html></html>')).toThrow(/link/)
  })

  it('reads petrol and the EU average from the Oil Bulletin, Romania’s diesel first', () => {
    const rows = parseOilBulletin(fixture('eu-oil-bulletin.xlsx'), new Date('2026-11-10'))
    expect(rows[0]).toMatchObject({ series: 'diesel', market: 'RO' })
    expect(rows.map((r) => `${r.series}|${r.market}`)).toEqual([
      'diesel|RO',
      'euro95|RO',
      'diesel|EU',
      'euro95|EU',
    ])
  })

  it('reads the fuel history columns and fails on a missing one', () => {
    const rows: SheetRow[] = [
      {
        A: 'x',
        B: 'RO_price_with_tax_diesel',
        C: 'RO_price_with_tax_euro95',
        D: 'EU_price_with_tax_diesel',
        E: 'EU_price_with_tax_euro95',
      },
      {},
      { B: '1000 l', C: '1000 l', D: '1000 l', E: '1000 l' },
      { A: '46335', B: '2032.99', C: '1843.66', D: '2097.09', E: '1876.7' },
      { A: '46328', B: '2070.93', C: '1850', D: '2100', E: '1880' },
    ]
    expect(fuelHistoryRows(rows, 1)).toHaveLength(4)
    expect(fuelHistoryRows(rows, 2)).toHaveLength(8)
    expect(() => fuelHistoryRows([{ A: 'x' }, {}, {}], 5)).toThrow(/RO_price_with_tax_diesel/)
  })
})

describe('Phase 7f market maths', () => {
  const d = (iso: string) => Date.parse(`${iso}T00:00:00Z`)

  it('works out USD/RON from the two ECB rates of the same day only', () => {
    expect(
      crossRate(
        [
          [d('2026-11-12'), 5.3473],
          [d('2026-11-13'), 5.3494],
        ],
        [[d('2026-11-13'), 1.1052]],
      ),
    ).toEqual([[d('2026-11-13'), 4.8402]])
  })

  it('quotes the latest value, its move and the year’s range', () => {
    const q = quoteOf('brent', [
      [d('2025-11-10'), 60],
      [d('2026-06-01'), 120],
      [d('2026-11-10'), 90],
      [d('2026-11-11'), 92],
    ])!
    expect(q.last[1]).toBe(92)
    expect(q.change).toBe(2)
    expect(q.changePct).toBe(2.22)
    expect(q.yearPct).toBe(53.33)
    expect(q.high).toBe(120)
    expect(q.low).toBe(90)
    expect(quoteOf('brent', [])).toBeNull()
  })

  it('averages by month and cuts to the last days', () => {
    const points: [number, number][] = [
      [d('2026-10-01'), 10],
      [d('2026-10-15'), 20],
      [d('2026-11-01'), 30],
    ]
    expect(monthlyAverages(points)).toEqual([
      { month: '2026-11', value: 30, n: 1 },
      { month: '2026-10', value: 15, n: 2 },
    ])
    expect(lastDays(points, 20)).toHaveLength(2)
  })

  it('converts to the farmer’s unit with the ECB rate', () => {
    const rates = { eurRon: 5, eurUsd: 1.25, day: 0 }
    // € per 1,000 l → lei per litre
    expect(converted(markets['diesel-ro'], 2000, rates)).toBeCloseTo(10)
    // $ per tonne → lei per tonne: 250 $ = 200 € = 1,000 lei
    expect(converted(markets.urea, 250, rates)).toBeCloseTo(1000)
    expect(converted(markets.brent, 90, rates)).toBeNull()
    expect(converted(markets.urea, 250, null)).toBeNull()
  })

  it('stores every market under a known source, with a unit label', () => {
    for (const k of marketKeys) {
      const m = markets[k]
      if (m.store) expect(marketSourceKeys).toContain(m.store.source)
      expect(unitOf(m)).toBeTruthy()
    }
    for (const k of tickerMarkets) expect(marketKeys).toContain(k)
  })
})

describe('Phase 7f: Agrinvest’s own prices are hidden', () => {
  it('is switched off', () => {
    expect(showOwnPrices).toBe(false)
  })

  it('keeps Agrinvest’s prices out of the newsletter', () => {
    const issue = buildIssue({
      week: new Date('2026-11-09'),
      locale: 'ro',
      prices: [{ name: 'Grâu', price: 1000, place: 'Brăila' }],
      headlines: [],
    })
    expect(issue.intro).not.toMatch(/Agrinvest|lei\/t/)
  })
})
