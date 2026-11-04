import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { leadSchema, normalizePhone } from '@/lib/leads/form'
import { allow } from '@/lib/leads/rate-limit'

describe('lead validation', () => {
  it('accepts Romanian and international phones', () => {
    expect(normalizePhone('0741 201 056')).toBe('0741201056')
    expect(normalizePhone('+40 (741) 201-056')).toBe('+40741201056')
    expect(normalizePhone('0040741201056')).toBe('+40741201056')
    expect(normalizePhone('12345')).toBeNull()
  })

  const valid = {
    type: 'general',
    name: 'Ion Popescu',
    phone: '0741 201 056',
    email: 'Ion@Example.ro ',
    consent: 'on',
  }

  it('requires phone, email and consent', () => {
    const result = leadSchema('ro').safeParse({
      ...valid,
      phone: '',
      email: 'x',
      consent: undefined,
    })
    expect(result.success).toBe(false)
    const fields = result.error?.issues.map((i) => i.path[0])
    expect(fields).toEqual(expect.arrayContaining(['phone', 'email', 'consent']))
  })

  it('normalises a valid lead', () => {
    const result = leadSchema('en').parse({ ...valid, county: '3', company: '' })
    expect(result).toMatchObject({ phone: '0741201056', email: 'ion@example.ro', county: 3 })
    expect(result.company).toBeUndefined()
  })

  it('rate-limits one IP after five submissions', () => {
    const t = Date.now()
    for (let i = 0; i < 5; i++) expect(allow('test-ip', t + i)).toBe(true)
    expect(allow('test-ip', t + 6)).toBe(false)
    expect(allow('test-ip', t + 11 * 60 * 1000)).toBe(true)
  })
})

describe('Leads collection', () => {
  let payload: Payload
  const created: number[] = []

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    for (const id of created) await payload.delete({ collection: 'leads', id })
  })

  it('routes a lead to the person set for its type', async () => {
    const routing = await payload.findGlobal({ slug: 'lead-routing', depth: 0 })
    const route = routing.routes?.find((r) => r.type === 'logistica')
    expect(route, 'seed the database first (npm run seed)').toBeDefined()
    const lead = await payload.create({
      collection: 'leads',
      data: {
        type: 'logistica',
        name: 'Test',
        phone: '0741201056',
        email: 'test@example.ro',
        status: 'new',
      },
    })
    created.push(lead.id)
    const assigned = typeof lead.assignedTo === 'object' ? lead.assignedTo?.id : lead.assignedTo
    expect(assigned).toBe(route?.primary)
  })

  it('falls back to the general route', async () => {
    const routing = await payload.findGlobal({ slug: 'lead-routing', depth: 0 })
    const general = routing.routes?.find((r) => r.type === 'general')
    const lead = await payload.create({
      collection: 'leads',
      data: {
        type: 'cariere',
        name: 'Test',
        phone: '0741201056',
        email: 'test@example.ro',
        status: 'new',
      },
    })
    created.push(lead.id)
    const assigned = typeof lead.assignedTo === 'object' ? lead.assignedTo?.id : lead.assignedTo
    expect(assigned).toBe(general?.primary)
  })

  it('cannot be created or read through the public API', async () => {
    await expect(
      payload.create({
        collection: 'leads',
        overrideAccess: false,
        data: {
          type: 'general',
          name: 'Spam',
          phone: '0741201056',
          email: 'x@example.ro',
          status: 'new',
        },
      }),
    ).rejects.toThrow()
    await expect(payload.find({ collection: 'leads', overrideAccess: false })).rejects.toThrow()
  })
})
