import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { applicationPrefill, applicationSchema } from '@/lib/finance/application'
import { initialApplicationState } from '@/lib/finance/application-state'
import { harvestCrops } from '@/lib/finance/calendar'
import {
  buildSchedule,
  fromIndex,
  monthIndex,
  parseSimulator,
  type SimulatorInput,
} from '@/lib/finance/simulator'
import { newReference } from '@/lib/reference'

// The action and loaders run outside a Next.js request here.
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }))
vi.mock('next/headers', () => ({ headers: async () => new Headers() }))

/** The simulator and the credit application (4.4): pure rules first, then the stored row. */
const today = new Date(Date.UTC(2026, 10, 9)) // November 2026
const nov26 = monthIndex(2026, 11)

const input = (over: Partial<SimulatorInput> = {}): SimulatorInput => ({
  amount: 300_000,
  months: 24,
  crops: ['wheat', 'maize'],
  start: monthIndex(2026, 12),
  ...over,
})

describe('simulator', () => {
  it('never puts more than 2 instalments in a calendar year', () => {
    for (const months of [1, 6, 12, 30, 60, 120])
      for (let start = nov26; start < nov26 + 12; start++) {
        const s = buildSchedule(input({ months, start, crops: [...harvestCrops] }))
        if (s.kind !== 'schedule') continue
        const perYear = new Map<number, number>()
        for (const i of s.instalments) {
          const { year } = fromIndex(i.index)
          perYear.set(year, (perYear.get(year) ?? 0) + 1)
        }
        expect(Math.max(...perYear.values())).toBeLessThanOrEqual(2)
      }
  })

  it('always adds up to the amount, the last instalment taking the rounding', () => {
    const s = buildSchedule(input({ amount: 100_001, months: 36 }))
    if (s.kind !== 'schedule') throw new Error('expected a schedule')
    expect(s.instalments.reduce((sum, i) => sum + i.principal, 0)).toBe(100_001)
    expect(s.instalments.at(-1)!.remaining).toBe(0)
    expect(new Set(s.instalments.slice(0, -1).map((i) => i.principal)).size).toBe(1)
  })

  it('falls only on the chosen harvests', () => {
    const s = buildSchedule(input({ crops: ['sunflower'], months: 24 }))
    if (s.kind !== 'schedule') throw new Error('expected a schedule')
    expect(s.instalments.map((i) => fromIndex(i.index))).toEqual([
      { year: 2027, month: 11 },
      { year: 2028, month: 11 },
    ])
  })

  it('rolls a December start into the next year', () => {
    const s = buildSchedule(input({ crops: ['wheat'], months: 9 }))
    if (s.kind !== 'schedule') throw new Error('expected a schedule')
    expect(s.instalments.map((i) => fromIndex(i.index))).toEqual([{ year: 2027, month: 8 }])
  })

  it('names the term that reaches the first harvest when none falls inside', () => {
    const s = buildSchedule(input({ crops: ['wheat'], months: 3 }))
    expect(s).toMatchObject({ kind: 'no-harvest', season: 'summer', monthsNeeded: 8 })
  })

  it('charges interest only with a rate typed by the farmer, on what is still owed', () => {
    expect(buildSchedule(input()).kind === 'schedule' && buildSchedule(input())).toMatchObject({
      totalInterest: undefined,
    })
    // 120,000 at 10% from December: 8 months to August, then 3 months to November.
    const s = buildSchedule(input({ amount: 120_000, months: 11, rate: 10 }))
    if (s.kind !== 'schedule') throw new Error('expected a schedule')
    expect(s.instalments.map((i) => i.interest)).toEqual([8_000, 1_500])
    expect(s.totalInterest).toBe(9_500)
  })

  it('reads the form from the URL and never throws on bad values', () => {
    const ok = parseSimulator(
      {
        suma: '250.000',
        luni: '24',
        culturi: ['wheat', 'maize'],
        start: '2027-01',
        dobanda: '9,5',
      },
      120,
      today,
    )
    expect(ok.input).toMatchObject({ amount: 250_000, months: 24, rate: 9.5 })
    const bad = parseSimulator(
      { suma: 'mult', luni: '121', culturi: 'cotton', start: '2030-01', dobanda: '-3' },
      120,
      today,
    )
    expect(bad.input).toBeUndefined()
    expect(Object.keys(bad.errors).sort()).toEqual(['culturi', 'dobanda', 'luni', 'start', 'suma'])
    expect(parseSimulator({}, 120, today)).toMatchObject({ submitted: false, errors: {} })
  })

  it('caps the term with the register value it is given', () => {
    expect(
      parseSimulator({ suma: '5000', luni: '61', culturi: 'wheat' }, 60, today).errors,
    ).toEqual({ luni: 'months' })
  })
})

describe('application rules', () => {
  const choices = { products: [7], counties: [3], crops: { wheat: 11, maize: 12 }, maxMonths: 120 }
  const valid = {
    borrower: 'srl',
    cui: 'RO14399840',
    company: 'Ferma Test SRL',
    name: 'Ion Popescu',
    phone: '0741 201 056',
    email: 'Ion@Example.com',
    county: '3',
    product: '7',
    amount: '250.000',
    termMonths: '24',
    crops: ['wheat', 'maize'],
    area: '',
    guarantees: ['machinery'],
    consent: 'on',
  }
  const parse = (over: Record<string, unknown> = {}) =>
    applicationSchema('ro', choices).safeParse({ ...valid, ...over })

  it('accepts a full application and maps crops to their records', () => {
    const r = parse()
    expect(r.success && r.data).toMatchObject({
      cui: '14399840',
      email: 'ion@example.com',
      amount: 250_000,
      crops: [11, 12],
      area: undefined,
      creditBureau: false,
    })
  })

  it('requires a valid CUI for every legal form, PFA included', () => {
    for (const borrower of ['pfa', 'srl']) {
      const r = parse({ borrower, cui: '14399841' })
      expect(r.success).toBe(false)
    }
    expect(parse({ borrower: 'pfa' }).success).toBe(true)
  })

  it('rejects what the published lists do not hold', () => {
    for (const over of [
      { product: '8' },
      { county: '4' },
      { crops: ['barley'] },
      { guarantees: ['gold'] },
    ])
      expect(parse(over).success).toBe(false)
    expect(parse({ product: '' }).success).toBe(true)
  })

  it('needs an amount within bounds and consent', () => {
    expect(parse({ amount: '' }).success).toBe(false)
    expect(parse({ amount: '999' }).success).toBe(false)
    expect(parse({ termMonths: '121' }).success).toBe(false)
    expect(parse({ consent: undefined }).success).toBe(false)
  })

  it('prefills only a known product, and only harvest crops', () => {
    const prefill = applicationPrefill(
      { produs: 'credit-productie', suma: '300000', luni: '24', culturi: 'wheat,cotton' },
      (slug) => (slug === 'credit-productie' ? 7 : undefined),
    )
    expect(prefill).toEqual({ product: '7', amount: '300000', termMonths: '24', crops: 'wheat' })
    expect(applicationPrefill({ produs: 'ciorna' }, () => undefined).product).toBeUndefined()
  })

  it('makes references that are easy to read over the phone', () => {
    expect(newReference('CRD', today)).toMatch(/^CRD-2611-[A-HJ-NP-Z2-9]{5}$/)
  })
})

describe('submitting an application', () => {
  let payload: Payload
  const cleanup = () =>
    payload.delete({ collection: 'finance-applications', where: { name: { equals: 'ZZ Tools' } } })

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await cleanup()
  })
  afterAll(() => cleanup())

  const form = async (over: Record<string, string> = {}) => {
    const county = (await payload.find({ collection: 'counties', limit: 1, depth: 0 })).docs[0]
    const data = new FormData()
    const fields = {
      locale: 'ro',
      borrower: 'pfa',
      cui: '14399840',
      company: 'Popescu Ion PFA',
      name: 'ZZ Tools',
      phone: '0741201056',
      email: 'zz-tools@example.com',
      county: String(county.id),
      amount: '120000',
      consent: 'on',
      sourcePath: '/finantare/aplica',
      ...over,
    }
    for (const [k, v] of Object.entries(fields)) data.set(k, v)
    data.append('crops', 'wheat')
    data.append('guarantees', 'promissory-note')
    return data
  }

  it('stores it with a reference and routes it, without a decision', async () => {
    const { submitApplication } = await import('@/lib/finance/actions')
    const state = await submitApplication(initialApplicationState, await form())
    expect(state.status).toBe('success')
    expect(state.reference).toMatch(/^CRD-/)
    const { docs } = await payload.find({
      collection: 'finance-applications',
      where: { reference: { equals: state.reference } },
      depth: 0,
    })
    expect(docs[0]).toMatchObject({
      status: 'new',
      borrower: 'pfa',
      amount: 120_000,
      guarantees: ['promissory-note'],
      consents: { dataProcessing: true, creditBureau: false },
    })
    expect(docs[0].crops).toHaveLength(1)
  })

  it('stores nothing for a bot, and keeps the values after an error', async () => {
    const { submitApplication } = await import('@/lib/finance/actions')
    const before = await payload.count({ collection: 'finance-applications' })
    expect(
      (await submitApplication(initialApplicationState, await form({ website: 'x' }))).status,
    ).toBe('success')
    const error = await submitApplication(initialApplicationState, await form({ cui: '1' }))
    expect(error).toMatchObject({ status: 'error', values: { name: 'ZZ Tools', crops: 'wheat' } })
    expect(error.errors?.cui).toBeTruthy()
    expect((await payload.count({ collection: 'finance-applications' })).totalDocs).toBe(
      before.totalDocs,
    )
  })
})
