import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('Pages paths', () => {
  let payload: Payload
  const ids: number[] = []

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    for (const id of ids.reverse()) await payload.delete({ collection: 'pages', id })
  })

  it('builds nested paths per locale and keeps children in step', async () => {
    const parent = await payload.create({
      collection: 'pages',
      locale: 'ro',
      data: { title: 'Test părinte', slug: 'test-parinte', languages: ['ro', 'en'] },
    })
    ids.push(parent.id)
    await payload.update({
      collection: 'pages',
      id: parent.id,
      locale: 'en',
      data: { title: 'Test parent', slug: 'test-parent' },
    })
    const child = await payload.create({
      collection: 'pages',
      locale: 'ro',
      data: { title: 'Test copil', slug: 'test-copil', parent: parent.id, languages: ['ro'] },
    })
    ids.push(child.id)
    expect(child.path).toBe('/test-parinte/test-copil')

    const en = await payload.findByID({ collection: 'pages', id: parent.id, locale: 'en' })
    expect(en.path).toBe('/test-parent')

    await payload.update({
      collection: 'pages',
      id: parent.id,
      locale: 'ro',
      data: { slug: 'test-redenumit' },
    })
    const moved = await payload.findByID({
      collection: 'pages',
      id: child.id,
      locale: 'ro',
      draft: true,
    })
    expect(moved.path).toBe('/test-redenumit/test-copil')
  })

  it('hides drafts from the public', async () => {
    const draft = await payload.create({
      collection: 'pages',
      locale: 'ro',
      draft: true,
      data: { title: 'Ciornă', slug: 'test-ciorna', languages: ['ro'], _status: 'draft' },
    })
    ids.push(draft.id)
    const { docs } = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      where: { slug: { equals: 'test-ciorna' } },
    })
    expect(docs).toHaveLength(0)
  })
})

describe('Figures register', () => {
  it('has a status on every seeded row', async () => {
    const payload = await getPayload({ config: await config })
    const figures = await payload.findGlobal({ slug: 'figures', locale: 'ro' })
    expect(figures.rows?.length).toBeGreaterThan(0)
    for (const row of figures.rows ?? []) {
      expect(['to-confirm', 'conflict', 'confirmed']).toContain(row.status)
    }
    expect(figures.rows?.find((r) => r.key === 'S2')?.status).toBe('confirmed')
    expect(figures.rows?.find((r) => r.key === 'F4.money')?.status).toBe('conflict')
  })
})
