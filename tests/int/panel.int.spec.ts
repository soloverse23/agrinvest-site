import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  departments,
  editors,
  hiddenUnlessAdmin,
  hiddenUnlessOwner,
  ownersOf,
  sectionsFor,
} from '@/access/departments'
import { parseLink } from '@/lib/panel/find'
import config from '@/payload.config'

const as = (roles: string[], id = 990001) =>
  ({ id, collection: 'users', email: 'zz-panel@example.com', roles }) as never

describe('staff panel departments', () => {
  let payload: Payload
  const created: { collection: 'pages' | 'users'; id: number }[] = []

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })
  afterAll(async () => {
    for (const { collection, id } of created.reverse())
      await payload.delete({ collection, id }).catch(() => undefined)
  })

  it('gives every section to at least one department', () => {
    for (const role of Object.keys(departments) as (keyof typeof departments)[])
      for (const slug of departments[role].sections)
        expect(
          payload.collections[slug as never] || payload.config.globals.find((g) => g.slug === slug),
        ).toBeTruthy()
    expect(ownersOf('pages')).toEqual(['continut'])
    expect(ownersOf('orders')).toEqual(['magazin', 'vanzari'])
  })

  it('shows a department only its own sections', () => {
    const shop = { user: as(['magazin']) }
    expect(hiddenUnlessOwner('products')(shop)).toBe(false)
    expect(hiddenUnlessOwner('pages')(shop)).toBe(true)
    expect(hiddenUnlessAdmin(shop)).toBe(true)
    expect(hiddenUnlessOwner('pages')({ user: as(['admin']) })).toBe(false)
    expect(hiddenUnlessOwner('pages')({ user: as([]) })).toBe(true)
    expect(sectionsFor({ user: as(['preturi']) })).toEqual(['preturi'])
    expect(sectionsFor({ user: as(['admin']) })).toEqual(Object.keys(departments))
  })

  it('never trusts a role on an account of another collection', () => {
    const user = { collection: 'customers', roles: ['admin'] } as never
    expect(editors('pages')({ req: { user } } as never)).toBe(false)
  })

  it('lets content edit a page but not delete it, and keeps the shop out', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: { title: 'ZZ panel page', slug: 'zz-panel-page' } as never,
      draft: true,
    })
    created.push({ collection: 'pages', id: page.id })

    const updated = await payload.update({
      collection: 'pages',
      id: page.id,
      data: { title: 'ZZ panel page edited' },
      draft: true,
      overrideAccess: false,
      user: as(['continut']),
    })
    expect(updated.title).toBe('ZZ panel page edited')

    await expect(
      payload.delete({
        collection: 'pages',
        id: page.id,
        overrideAccess: false,
        user: as(['continut']),
      }),
    ).rejects.toThrow()
    await expect(
      payload.update({
        collection: 'pages',
        id: page.id,
        data: { title: 'no' },
        overrideAccess: false,
        user: as(['magazin']),
      }),
    ).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'pages',
        data: { title: 'ZZ new', slug: 'zz-new' } as never,
        overrideAccess: false,
        user: as(['continut']),
      }),
    ).rejects.toThrow()
  })

  it('keeps leads away from departments other than sales', async () => {
    await expect(
      payload.find({ collection: 'leads', overrideAccess: false, user: as(['continut']) }),
    ).rejects.toThrow()
    const { docs } = await payload.find({
      collection: 'leads',
      limit: 1,
      overrideAccess: false,
      user: as(['vanzari']),
    })
    expect(Array.isArray(docs)).toBe(true)
  })

  it('lets an account read only itself, and only the admin hand out roles', async () => {
    const user = await payload.create({
      collection: 'users',
      data: { email: 'zz-panel-self@example.com', password: 'zz-panel-pass-1', roles: ['preturi'] },
    })
    created.push({ collection: 'users', id: user.id })
    const self = { ...user, collection: 'users' } as never
    const { docs } = await payload.find({ collection: 'users', overrideAccess: false, user: self })
    expect(docs.map((d) => d.id)).toEqual([user.id])
    const after = await payload.update({
      collection: 'users',
      id: user.id,
      data: { roles: ['admin'] },
      overrideAccess: false,
      user: self,
    })
    expect(after.roles).toEqual(['preturi'])
  })
})

describe('page finder links', () => {
  it('reads a pasted link as a locale and a path', () => {
    expect(parseLink('https://agrinvest.ro/magazin/erbicide/')).toEqual({
      locale: 'ro',
      path: '/magazin/erbicide',
    })
    expect(parseLink('https://www.agrinvest.ro/en/shop?x=1')).toEqual({
      locale: 'en',
      path: '/shop',
    })
    expect(parseLink('/ro/despre')).toEqual({ locale: 'ro', path: '/despre' })
    expect(parseLink('agrinvest.ro/')).toEqual({ locale: 'ro', path: '/' })
    expect(parseLink('ghid erbicidare')).toBeNull()
  })
})
