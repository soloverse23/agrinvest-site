import { describe, expect, it } from 'vitest'

import {
  clampDose,
  displayAmount,
  doseSummary,
  mixCost,
  packMix,
  parseDoseUnit,
  parseLabelNumber,
  parseSowingRate,
  parseWaterVolume,
  totalNeeded,
  type PackOption,
} from '@/lib/shop/dose'

const pack = (sku: string, size: number, unit: string, price: number | null = 10): PackOption => ({
  sku,
  size,
  unit,
  price,
  stock: 'in-stock',
})

describe('dose units', () => {
  it('reads the units on the labels', () => {
    expect(parseDoseUnit('l/ha')).toEqual({ dimension: 'volume', basis: 'ha', factor: 1000 })
    expect(parseDoseUnit('ml/ha')).toEqual({ dimension: 'volume', basis: 'ha', factor: 1 })
    expect(parseDoseUnit('kg/ha')).toEqual({ dimension: 'mass', basis: 'ha', factor: 1000 })
    expect(parseDoseUnit('g/ha')).toEqual({ dimension: 'mass', basis: 'ha', factor: 1 })
    expect(parseDoseUnit('kg/t')).toEqual({ dimension: 'mass', basis: 't', factor: 1000 })
    expect(parseDoseUnit('L/t')).toEqual({ dimension: 'volume', basis: 't', factor: 1000 })
    expect(parseDoseUnit('%')).toEqual({ dimension: 'volume', basis: 'percent', factor: 1 })
  })

  it('refuses what it cannot compute', () => {
    expect(parseDoseUnit(null)).toBeNull()
    expect(parseDoseUnit('')).toBeNull()
    expect(parseDoseUnit('pieces/ha')).toBeNull()
    expect(parseDoseUnit('l/m2')).toBeNull()
  })
})

describe('label numbers', () => {
  it('reads Romanian thousands and decimals', () => {
    expect(parseLabelNumber('1.500')).toBe(1500)
    expect(parseLabelNumber('400.000')).toBe(400000)
    expect(parseLabelNumber('0,75')).toBe(0.75)
    expect(parseLabelNumber('1.500,5')).toBe(1500.5)
    expect(parseLabelNumber('0.5')).toBe(0.5)
    expect(parseLabelNumber('abc')).toBeNull()
  })

  it('reads water volumes per hectare', () => {
    expect(parseWaterVolume('200–300 l/ha')).toEqual({ min: 200, max: 300 })
    expect(parseWaterVolume('1.000 l apă/ha')).toEqual({ min: 1000, max: 1000 })
    expect(parseWaterVolume('8–10 L apă/tona sămânță')).toBeNull()
    expect(parseWaterVolume(null)).toBeNull()
  })

  it('reads sowing rates only when they are per hectare', () => {
    expect(parseSowingRate('60 kg/ha')).toEqual({ min: 60, max: 60, dimension: 'mass', unit: 'kg' })
    expect(parseSowingRate('200–220 kg/ha')).toMatchObject({ min: 200, max: 220, unit: 'kg' })
    expect(parseSowingRate('400.000–450.000 boabe germinabile/ha')).toMatchObject({
      min: 400000,
      max: 450000,
      unit: 'seeds',
    })
    expect(parseSowingRate('370–400 boabe germinabile/m²')).toBeNull()
    expect(parseSowingRate('25–35 plante/m²')).toBeNull()
    expect(parseSowingRate('după recomandarea consultantului')).toBeNull()
  })
})

describe('total needed', () => {
  const lha = parseDoseUnit('l/ha')!
  it('multiplies area by dose in base units', () => {
    expect(totalNeeded({ dose: 0.75, unit: lha, amount: 10 })).toBe(7500)
    expect(totalNeeded({ dose: 20, unit: parseDoseUnit('g/ha')!, amount: 12.5 })).toBe(250)
    expect(totalNeeded({ dose: 0.15, unit: parseDoseUnit('kg/t')!, amount: 8 })).toBe(1200)
  })

  it('turns a percentage into product through the water volume', () => {
    const pct = parseDoseUnit('%')!
    // 0,05% in 1.000 l/ha = 0,5 l/ha; on 10 ha that is 5 l.
    expect(totalNeeded({ dose: 0.05, unit: pct, amount: 10, waterVolume: 1000 })).toBe(5000)
    expect(totalNeeded({ dose: 0.05, unit: pct, amount: 10 })).toBeNull()
  })

  it('needs positive inputs', () => {
    expect(totalNeeded({ dose: 0, unit: lha, amount: 10 })).toBeNull()
    expect(totalNeeded({ dose: 1, unit: lha, amount: -1 })).toBeNull()
  })

  it('keeps the dose inside the label range', () => {
    expect(clampDose(5, { min: 0.5, max: 1 })).toBe(1)
    expect(clampDose(0.1, { min: 0.5, max: 1 })).toBe(0.5)
    expect(clampDose(0.75, { min: 0.5, max: 1 })).toBe(0.75)
  })

  it('shows base amounts in farm units', () => {
    expect(displayAmount(7500, 'volume')).toEqual({ value: 7.5, unit: 'l' })
    expect(displayAmount(1200, 'mass')).toEqual({ value: 1.2, unit: 'kg' })
    expect(displayAmount(450000, 'seeds')).toEqual({ value: 450000, unit: 'seeds' })
  })
})

describe('pack mix', () => {
  const packs = [pack('A1', 1, 'l', 99), pack('A20', 20, 'l', 1580)]

  it('wastes least, then uses fewest packs', () => {
    // 23 l: 20 + 3 × 1 wastes nothing; 2 × 20 would waste 17 l.
    expect(packMix(23_000, 'volume', packs)).toMatchObject({
      packs: [
        { sku: 'A20', count: 1 },
        { sku: 'A1', count: 3 },
      ],
      waste: 0,
      count: 4,
    })
    // 40 l: two big packs, not forty small ones.
    expect(packMix(40_000, 'volume', packs)?.packs).toEqual([
      { sku: 'A20', size: 20, unit: 'l', count: 2 },
    ])
  })

  it('rounds up to whole packs', () => {
    expect(packMix(7_500, 'volume', packs)).toMatchObject({
      packs: [{ sku: 'A1', count: 8 }],
      supplied: 8000,
      waste: 500,
    })
  })

  it('mixes mass units', () => {
    const kg = [pack('L1', 1, 'kg', 178.5), pack('L5', 5, 'kg', 862), pack('G', 500, 'g', 95)]
    expect(packMix(11_500, 'mass', kg)).toMatchObject({
      packs: [
        { sku: 'L5', count: 2 },
        { sku: 'L1', count: 1 },
        { sku: 'G', count: 1 },
      ],
      waste: 0,
    })
  })

  it('uses only packs that can be bought', () => {
    const mixed: PackOption[] = [
      pack('A1', 1, 'l', 99),
      { ...pack('A20', 20, 'l', 1380), stock: 'on-request' },
      pack('A5', 5, 'l', null),
      pack('K', 1, 'kg'),
    ]
    expect(packMix(21_000, 'volume', mixed)?.packs).toEqual([
      { sku: 'A1', size: 1, unit: 'l', count: 21 },
    ])
    expect(packMix(1000, 'seeds', mixed)).toBeNull()
    expect(packMix(0, 'volume', mixed)).toBeNull()
  })

  it('handles seed packs', () => {
    const seeds = [pack('S', 50_000, 'seeds', 520)]
    // 4 ha at 80.000 seeds/ha = 320.000 seeds → 7 bags.
    expect(packMix(320_000, 'seeds', seeds)).toMatchObject({
      packs: [{ sku: 'S', count: 7 }],
      waste: 30_000,
    })
  })

  it('stays within the cart limit', () => {
    expect(packMix(1_000_000_000, 'volume', [pack('A1', 1, 'l')])).toBeNull()
  })

  it('prices a mix from the packs', () => {
    const mix = packMix(23_000, 'volume', packs)!
    expect(mixCost(mix, packs)).toBe(1580 + 3 * 99)
    expect(mixCost(mix, [pack('A1', 1, 'l', null), packs[1]])).toBeNull()
  })
})

describe('dose summary', () => {
  it('spans the rows in the unit most of them use', () => {
    expect(
      doseSummary([
        { min: 0.5, max: 1, unit: 'l/ha' },
        { min: 2, max: null, unit: 'kg/t' },
        { min: 1, max: 1.5, unit: 'l/ha' },
      ]),
    ).toEqual({ min: 0.5, max: 1.5, unit: 'l/ha' })
  })

  it('needs a number and a unit', () => {
    expect(
      doseSummary([
        { min: null, max: null, unit: 'l/ha' },
        { min: 1, unit: '' },
      ]),
    ).toBeNull()
    expect(doseSummary([{ max: 3, unit: '%' }])).toEqual({ min: 3, max: 3, unit: '%' })
  })
})
