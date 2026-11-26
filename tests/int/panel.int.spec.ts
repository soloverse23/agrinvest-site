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
import { defaultDepartment } from '@/collections/Pages'
import { parseLink } from '@/lib/panel/find'
import { editLinksFor } from '@/lib/panel/here'
import { targetsFor } from '@/lib/panel/onPage'
import config from '@/payload.config'

const as = (roles: string[], id = 990001) =>
  ({ id, collection: 'users', email: 'zz-panel@example.com', roles }) as never

describe('staff panel departments', () => {
  let payload: Payload
  const created: { collection: 'pages' | 'users' | 'leads'; id: number }[] = []

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
    expect(ownersOf('orders')).toEqual(['comercial'])
    expect(ownersOf('buy-prices')).toEqual(['cereale'])
    expect(ownersOf('diesel-prices')).toEqual(['motorina'])
    expect(ownersOf('pages')).toEqual(['cereale', 'comercial', 'ifn', 'logistica', 'continut'])
  })

  it('shows a department only its own sections', () => {
    const shop = { user: as(['comercial']) }
    expect(hiddenUnlessOwner('products')(shop)).toBe(false)
    expect(hiddenUnlessOwner('buy-prices')(shop)).toBe(true)
    expect(hiddenUnlessAdmin(shop)).toBe(true)
    expect(hiddenUnlessOwner('pages')({ user: as(['admin']) })).toBe(false)
    expect(hiddenUnlessOwner('pages')({ user: as([]) })).toBe(true)
    expect(hiddenUnlessOwner('pages')({ user: as(['motorina']) })).toBe(true)
    expect(sectionsFor({ user: as(['motorina']) })).toEqual(['motorina'])
    expect(sectionsFor({ user: as(['admin']) })).toEqual(Object.keys(departments))
  })

  it('splits shared sections by document', () => {
    const req = (roles: string[]) => ({ req: { user: as(roles) } }) as never
    expect(editors('pages')(req(['admin']))).toBe(true)
    expect(editors('pages')(req(['cereale']))).toEqual({ department: { in: ['cereale'] } })
    expect(editors('guides')(req(['ifn']))).toEqual({
      section: { in: ['finantare', 'pagina-finantare'] },
    })
    expect(editors('leads')(req(['logistica']))).toEqual({ type: { in: ['logistica'] } })
    expect(editors('leads')(req(['cereale', 'motorina']))).toEqual({
      type: { in: ['vanzare-cereale', 'depozitare', 'motorina'] },
    })
    expect(editors('products')(req(['comercial']))).toBe(true)
    expect(editors('guides')(req(['comercial']))).toBe(false)
  })

  it('gives a new page the department of its path', () => {
    expect(defaultDepartment('/')).toBe('continut')
    expect(defaultDepartment('/depozitare/uscare')).toBe('cereale')
    expect(defaultDepartment('/retur')).toBe('comercial')
    expect(defaultDepartment('/livrare')).toBe('logistica')
    expect(defaultDepartment('/finantare')).toBe('ifn')
    expect(defaultDepartment('/cookie-uri')).toBeNull()
  })

  it('never trusts a role on an account of another collection', () => {
    const user = { collection: 'customers', roles: ['admin'] } as never
    expect(editors('pages')({ req: { user } } as never)).toBe(false)
  })

  it('lets a department edit its own page only, and never delete or create one', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: { title: 'ZZ panel page', slug: 'zz-panel-page', department: 'logistica' } as never,
      draft: true,
    })
    created.push({ collection: 'pages', id: page.id })

    const updated = await payload.update({
      collection: 'pages',
      id: page.id,
      data: { title: 'ZZ panel page edited', department: 'cereale' } as never,
      draft: true,
      overrideAccess: false,
      user: as(['logistica']),
    })
    expect(updated.title).toBe('ZZ panel page edited')
    // Only the admin moves a page to another department.
    expect((updated as { department?: string }).department).toBe('logistica')

    await expect(
      payload.delete({
        collection: 'pages',
        id: page.id,
        overrideAccess: false,
        user: as(['logistica']),
      }),
    ).rejects.toThrow()
    await expect(
      payload.update({
        collection: 'pages',
        id: page.id,
        data: { title: 'no' },
        overrideAccess: false,
        user: as(['continut']),
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

  it('shows each department only its own requests', async () => {
    const lead = await payload.create({
      collection: 'leads',
      data: {
        type: 'motorina',
        name: 'ZZ panel lead',
        phone: '0700000000',
        email: 'zz-panel-lead@example.com',
        consent: true,
      } as never,
    })
    created.push({ collection: 'leads', id: lead.id })
    const ids = async (roles: string[]) =>
      (
        await payload.find({
          collection: 'leads',
          where: { id: { equals: lead.id } },
          overrideAccess: false,
          user: as(roles),
        })
      ).docs.map((d) => d.id)
    expect(await ids(['motorina'])).toEqual([lead.id])
    expect(await ids(['cereale'])).toEqual([])
    expect(await ids(['admin'])).toEqual([lead.id])
    await expect(
      payload.find({ collection: 'leads', overrideAccess: false, user: as(['continut']) }),
    ).rejects.toThrow()
  })

  it('keeps a department account to a username, with no email', async () => {
    // Signing in itself is checked against a real database in the deploy rehearsal: the
    // test environment cannot sign Payload's session token.
    const user = await payload.create({
      collection: 'users',
      data: { username: 'zz-panel-user', password: 'zz-panel-pass-1', roles: ['cereale'] } as never,
    })
    created.push({ collection: 'users', id: user.id })
    expect(user.email ?? null).toBeNull()
    await expect(
      payload.create({
        collection: 'users',
        data: { username: 'zz-panel-user', password: 'zz-panel-pass-2' } as never,
      }),
    ).rejects.toThrow()
  })

  it('lets an account read only itself, and only the admin hand out roles', async () => {
    const user = await payload.create({
      collection: 'users',
      data: {
        email: 'zz-panel-self@example.com',
        password: 'zz-panel-pass-1',
        roles: ['motorina'],
      },
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
    expect(after.roles).toEqual(['motorina'])
  })

  it('offers "edit this page" only to the department that owns it', async () => {
    const page = await payload.create({
      collection: 'pages',
      data: { title: 'ZZ panel here', slug: 'zz-panel-here' } as never,
    })
    created.push({ collection: 'pages', id: page.id })
    const req = (roles: string[]) =>
      ({ payload, user: as(roles), i18n: { language: 'ro' } }) as never

    // A new page outside the chart's segments is Conținut's.
    const content = await editLinksFor(req(['continut']), '/zz-panel-here')
    expect(content).toEqual([
      { label: 'Editează pagina', href: `/admin/collections/pages/${page.id}` },
    ])
    expect(await editLinksFor(req(['cereale']), '/zz-panel-here')).toEqual([])
    expect(await editLinksFor(req(['comercial']), '/magazin')).toEqual([
      { label: 'Editează pagina', href: '/admin/globals/shop-home' },
    ])
    const prices = await editLinksFor(req(['cereale']), '/en/prices/wheat')
    expect(prices.map((l) => l.href)).toEqual(['/admin/collections/buy-prices'])
    expect(await editLinksFor(req(['comercial']), '/en/prices/wheat')).toEqual([])
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

describe('edit this page: what a public path shows', () => {
  it('follows the site routes in both languages', () => {
    expect(targetsFor('ro', '/')).toEqual([{ kind: 'page', path: '/' }])
    expect(targetsFor('ro', '/depozitare/uscare')).toEqual([
      { kind: 'page', path: '/depozitare/uscare' },
    ])
    expect(targetsFor('ro', '/magazin')).toEqual([{ kind: 'global', global: 'shop-home' }])
    expect(targetsFor('ro', '/magazin/erbicide')).toEqual([
      { kind: 'doc', collection: 'categories', slug: 'erbicide' },
    ])
    expect(targetsFor('en', '/shop/herbicides/wing-p')).toEqual([
      { kind: 'doc', collection: 'products', slug: 'wing-p' },
    ])
    expect(targetsFor('ro', '/magazin/producator/bayer')).toEqual([
      { kind: 'doc', collection: 'brands', slug: 'bayer' },
    ])
    expect(targetsFor('ro', '/magazin/cautare')).toEqual([])
    expect(targetsFor('ro', '/finantare/credit-investitii/utilaje')).toEqual([
      { kind: 'doc', collection: 'finance-products', slug: 'utilaje' },
    ])
    expect(targetsFor('en', '/financing/about-ifn')).toEqual([
      { kind: 'doc', collection: 'guides', slug: 'about-ifn', section: 'pagina-finantare' },
    ])
    expect(targetsFor('ro', '/finantare/ghiduri/glosar')).toEqual([
      { kind: 'doc', collection: 'guides', slug: 'glosar', section: 'finantare' },
    ])
    expect(targetsFor('ro', '/finantare/intrebari/dobanda')).toEqual([
      { kind: 'doc', collection: 'finance-questions', slug: 'dobanda' },
    ])
    expect(targetsFor('ro', '/ghiduri/protectia-plantelor/rapita')).toEqual([
      { kind: 'doc', collection: 'guides', slug: 'rapita', section: 'ghid' },
    ])
    expect(targetsFor('ro', '/stiri/zi/2026-11-15')).toEqual([])
    expect(targetsFor('ro', '/preturi/petrol-brent')).toEqual([])
    expect(targetsFor('ro', '/motorina')).toEqual([{ kind: 'list', collection: 'diesel-prices' }])
  })
})
