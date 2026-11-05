import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { applyFinance, richView } from '../../scripts/finance/apply'
import { correct, keepUrl } from '../../scripts/finance/corrections'
import { applyFigures } from '../../scripts/finance/figures'
import { productFile, type ProductFile } from '../../scripts/finance/schema'
import { contentFor } from '../../scripts/seed/content'
import { contentEn } from '../../scripts/seed/content-en'
import { pages as seededPages } from '../../scripts/seed/pages'
import { rt } from '../../scripts/seed/richtext'
import { ifnRequest } from '@/access'
import { reservedFinanceSlugs } from '@/i18n/routes'

/**
 * The finance model and its apply step against a real database, with throw-away documents
 * (`zz-*`): who can read an application, what a deploy may change, and what it must leave alone.
 */
const silent = () => {}
const key = 'zz-fin-product'

const side = (l: string) => ({
  title: `Produs de test ${l}`,
  slug: `zz-fin-${l}`,
  answer: `Răspuns ${l}.`,
  fits: `Pentru [fermieri](/finantare) ${l}.`,
  notFor: 'Nu pentru toți.',
  finances: 'Finanțează ceva.',
  repayment: 'Rate după recoltă.',
  example: { title: 'Exemplu', scenario: 'O fermă.', rows: [{ label: 'Sumă', value: '100' }] },
  risks: 'Riscuri.',
  guarantees: [{ kind: 'machinery' as const, note: 'Utilajul.' }],
  documents: [{ audience: 'all' as const, label: 'Act de identitate' }],
  process: [{ title: 'Cerere', body: 'Trimiți cererea.' }],
  faq: [{ question: 'Întrebare?', answer: 'Răspuns.' }],
  seo: { title: 'Titlu de test pentru pagină', description: 'Descriere de test.' },
})

const file = (over: Partial<ProductFile> = {}): ProductFile =>
  productFile.parse({
    key,
    order: 5,
    borrowers: ['pfa', 'srl'],
    sources: [{ title: 'Sursă', url: 'https://example.com/a', retrieved: '2026-11-05' }],
    text: { ro: side('ro'), en: side('en') },
    ...over,
  })

describe('finance', () => {
  let payload: Payload
  let dir: string
  const write = (f: ProductFile) => {
    mkdirSync(join(dir, 'products'), { recursive: true })
    writeFileSync(join(dir, 'products', `${f.key}.json`), JSON.stringify(f))
  }
  const run = () => applyFinance(payload, silent, dir)
  const doc = async () =>
    (
      await payload.find({
        collection: 'finance-products',
        where: { key: { equals: key } },
        locale: 'all',
        depth: 0,
        draft: true,
      })
    ).docs[0] as unknown as Record<string, Record<string, unknown>> & { id: number }

  const cleanup = async () => {
    await payload.delete({ collection: 'finance-products', where: { key: { like: 'zz-fin' } } })
    await payload.delete({ collection: 'finance-applications', where: { name: { equals: 'ZZ' } } })
    await payload.delete({ collection: 'users', where: { email: { like: 'zz-fin' } } })
  }

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    dir = mkdtempSync(join(tmpdir(), 'finance-'))
    await cleanup()
  })
  afterAll(async () => {
    await cleanup()
    rmSync(dir, { recursive: true, force: true })
  })

  describe('applications', () => {
    const asUser = (roles: string[]) =>
      ({ collection: 'users', id: 1, email: 'zz@example.com', roles }) as never
    const application = {
      reference: 'ZZ-FIN-1',
      borrower: 'pfa' as const,
      name: 'ZZ',
      phone: '0700000000',
      email: 'zz@example.com',
      consents: { dataProcessing: true },
    }

    it('are hidden from the public and from staff without the ifn role', async () => {
      await payload.create({ collection: 'finance-applications', data: application as never })
      for (const user of [undefined, asUser([]), asUser(['admin'])]) {
        await expect(
          payload.find({ collection: 'finance-applications', overrideAccess: false, user }),
        ).rejects.toThrow()
      }
    })

    it('are readable with the ifn role', async () => {
      const { docs } = await payload.find({
        collection: 'finance-applications',
        where: { name: { equals: 'ZZ' } },
        overrideAccess: false,
        user: asUser(['ifn']),
      })
      expect(docs).toHaveLength(1)
    })

    it('cannot be created through the public API', async () => {
      await expect(
        payload.create({
          collection: 'finance-applications',
          data: { ...application, reference: 'ZZ-FIN-2' } as never,
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    })

    it('never trusts a role on an account of another collection', () => {
      const user = { collection: 'customers', roles: ['ifn'] } as never
      expect(ifnRequest({ user })).toBe(false)
    })
  })

  describe('roles', () => {
    const account = (email: string) => ({ email, password: 'zz-test-password-1' })

    it('makes the first account of an empty site an admin, and only that one', async () => {
      const empty = (await payload.count({ collection: 'users' })).totalDocs === 0
      const first = await payload.create({
        collection: 'users',
        data: account('zz-fin-first@example.com'),
      })
      if (empty) expect(first.roles).toEqual(['admin'])
      const second = await payload.create({
        collection: 'users',
        data: account('zz-fin-second@example.com'),
      })
      expect(second.roles ?? []).toEqual([])
    })

    it('a staff account cannot give itself the ifn role', async () => {
      const user = await payload.create({
        collection: 'users',
        data: account('zz-fin-staff@example.com'),
      })
      const updated = await payload.update({
        collection: 'users',
        id: user.id,
        data: { roles: ['ifn'] },
        overrideAccess: false,
        user: { ...user, collection: 'users' },
      })
      expect(updated.roles ?? []).toEqual([])
    })

    it('an admin can give it', async () => {
      const user = await payload.create({
        collection: 'users',
        data: account('zz-fin-ifn@example.com'),
      })
      const updated = await payload.update({
        collection: 'users',
        id: user.id,
        data: { roles: ['ifn'] },
        overrideAccess: false,
        user: { ...user, collection: 'users', roles: ['admin'] },
      })
      expect(updated.roles).toEqual(['ifn'])
    })
  })

  it('keeps product slugs off the finance routes', async () => {
    expect(reservedFinanceSlugs.has('simulator')).toBe(true)
    const bad = file({ key: 'zz-fin-reserved' })
    bad.text.ro.slug = 'simulator'
    write(bad)
    await expect(run()).rejects.toThrow()
    rmSync(join(dir, 'products', 'zz-fin-reserved.json'))
  })

  describe('apply step', () => {
    it('creates a product in both languages, as a draft for the lawyer', async () => {
      write(file())
      const { products } = await run()
      expect(products[0].created).toBe(true)
      const d = await doc()
      expect(d.title).toEqual({ ro: 'Produs de test ro', en: 'Produs de test en' })
      expect(d.review.legalStatus).toBe('draft')
      expect(d.review.status).toBe('to-confirm')
      expect(d._status).toBe('published')
    })

    it('changes nothing on a second run', async () => {
      const before = await doc()
      const { products } = await run()
      expect(products[0]).toMatchObject({ created: false, written: [], conflicts: [] })
      expect((await doc()).updatedAt).toEqual(before.updatedAt)
    })

    it('rejects a file that claims to be approved', () => {
      expect(() =>
        productFile.parse({ ...file(), review: { legalStatus: 'legal-approved' } }),
      ).toThrow()
    })

    it('sees a change to a link alone', async () => {
      const next = file()
      next.text.ro.fits = 'Pentru [fermieri](/finantare/simulator) ro.'
      write(next)
      const { products } = await run()
      expect(products[0].written).toEqual(['text.ro'])
      expect(richView((await doc()).fits.ro)).toContain('/finantare/simulator')
    })

    it('leaves a staff edit alone, in that language only', async () => {
      const d = await doc()
      await payload.update({
        collection: 'finance-products',
        id: d.id,
        locale: 'ro',
        data: { answer: 'Scris în admin.' },
      })
      const next = file()
      next.text.ro.answer = 'Din fișier.'
      next.text.en.answer = 'From the file.'
      write(next)
      const { products } = await run()
      expect(products[0].conflicts).toEqual(['text.ro'])
      expect(products[0].written).toEqual(['text.en'])
      const after = await doc()
      expect(after.answer).toEqual({ ro: 'Scris în admin.', en: 'From the file.' })
    })

    it('keeps an approval through a later deploy', async () => {
      const d = await doc()
      await payload.update({
        collection: 'finance-products',
        id: d.id,
        data: { review: { legalStatus: 'legal-approved', status: 'confirmed' } },
      })
      const next = file()
      next.text.en.risks = 'Other risks.'
      write(next)
      await run()
      expect((await doc()).review.legalStatus).toBe('legal-approved')
    })
  })

  describe('the hub page', () => {
    const blocks = (t: string) => [{ blockType: 'richText', content: `## ${t}\n\nText.` }]
    const hub = (t: string) => ({
      title: t,
      summary: 'Rezumat.',
      layout: blocks(t),
      faq: [],
      seo: { title: 'Titlu de test pentru hub', description: 'Descriere.' },
    })
    const page = async () =>
      (
        await payload.find({
          collection: 'pages',
          where: { slug: { equals: 'finantare' } },
          locale: 'ro',
          depth: 0,
          draft: true,
        })
      ).docs[0]
    const copy = (locale: 'ro' | 'en') =>
      payload
        .find({
          collection: 'pages',
          where: { path: { equals: locale === 'ro' ? '/finantare' : '/financing' } },
          locale,
          depth: 0,
          draft: true,
        })
        .then(({ docs }) => docs[0])
    let saved: Record<'ro' | 'en', Awaited<ReturnType<typeof copy>>>

    beforeAll(async () => {
      saved = { ro: await copy('ro'), en: await copy('en') }
    })
    afterAll(async () => {
      rmSync(join(dir, 'hub.json'), { force: true })
      // Other test files read this page.
      for (const locale of ['ro', 'en'] as const) {
        const { id, title, summary, layout, faq, seo, enrichment } = saved[locale]
        await payload.update({
          collection: 'pages',
          id,
          locale,
          data: { title, summary, layout, faq, seo, enrichment } as never,
          context: { skipChildren: true },
        })
      }
    })

    it('recognises the page a live site still has from the first seed', async () => {
      const seed = seededPages.find((p) => p.key === 'finantare')
      const ctx = { people: {}, media: {} }
      const old = (text: unknown) =>
        JSON.parse(
          JSON.stringify(text)
            .replaceAll('{{F4.reply}}', '{{F4}}')
            .replaceAll('{{F5.term}}, {{F5.instalments}}', '{{F5}}'),
        )
      const ro = contentFor('finantare', ctx)
      const en = contentEn('finantare', ctx)
      const write = (
        locale: 'ro' | 'en',
        side: { title: string; summary: string; seoTitle: string },
        layout: unknown,
        faq: unknown,
      ) =>
        payload.update({
          collection: 'pages',
          id: saved.ro.id,
          locale,
          data: {
            title: side.title,
            summary: side.summary,
            layout: old(layout),
            faq: old(faq),
            seo: { title: side.seoTitle, description: null },
            enrichment: null,
          } as never,
          context: { skipChildren: true },
        })
      await write('ro', seed!.ro, ro!.ro, ro!.faq?.ro)
      await write('en', seed!.en!, en!.blocks, en!.faq)
      writeFileSync(
        join(dir, 'hub.json'),
        JSON.stringify({ text: { ro: hub('Hub'), en: hub('En') } }),
      )
      const { hub: report } = await run()
      expect(report?.conflicts).toEqual([])
      expect(report?.written.sort()).toEqual(['text.en', 'text.ro'])
    })

    it('replaces the text it wrote last time', async () => {
      writeFileSync(
        join(dir, 'hub.json'),
        JSON.stringify({ text: { ro: hub('Hub 2'), en: hub('En 2') } }),
      )
      const { hub: report } = await run()
      expect(report?.conflicts).toEqual([])
      expect(report?.written.sort()).toEqual(['text.en', 'text.ro'])
      expect((await page()).title).toBe('Hub 2')
    })

    it('is stable on a second run', async () => {
      const { hub: report } = await run()
      expect(report).toMatchObject({ written: [], conflicts: [] })
    })
  })

  describe('the register on a live site', () => {
    it('rewrites references in text and figure tables', () => {
      expect(
        correct({
          lead: 'Răspuns {{F4}}. Rambursezi: {{F5}}.',
          list: 'Durată: {{F5}}, corelate cu recoltele',
          keys: ['F3', 'F4', 'F5', 'F6'],
        }),
      ).toEqual({
        lead: 'Răspuns {{F4.reply}}. Rambursezi: {{F5.term}}, {{F5.instalments}}.',
        list: 'Durată: {{F5.term}}, {{F5.instalments}}',
        keys: ['F3', 'F4.reply', 'F4.money', 'F5.term', 'F5.instalments', 'F6'],
      })
    })

    it('adds the new rows, updates pages, then retires the old rows, once', async () => {
      const read = async () =>
        ((await payload.findGlobal({ slug: 'figures', locale: 'ro' })).rows ?? []) as {
          key: string
          value: string
          label: string
          status: string
          id?: string | null
        }[]
      const rows = await read()
      const old = rows
        .filter((r) => !/^(F(4|5|7|8\.dpo|9|1\d)|C10)/.test(r.key))
        .map((r) => (r.key === 'S2' ? { ...r, value: '238.000 t', confirmedAt: null } : r))
      const kept = [
        ...old,
        { key: 'F4', label: 'Vechi', value: 'în 24 h', status: 'to-confirm' as const },
        { key: 'F5', label: 'Vechi', value: '7 ani', status: 'to-confirm' as const },
      ]
      await payload.updateGlobal({ slug: 'figures', locale: 'ro', data: { rows: kept } as never })
      const page = await payload.create({
        collection: 'pages',
        locale: 'ro',
        data: {
          title: 'ZZ register',
          slug: 'zz-fin-register',
          summary: 'Răspuns {{F4}}.',
          languages: ['ro'],
          layout: [{ blockType: 'figureTable', keys: ['F4', 'F5'] }],
          _status: 'published',
        } as never,
        context: { skipChildren: true },
      })

      await applyFigures(payload, silent)
      const after = await read()
      const keys = after.map((r) => r.key)
      expect(keys).toEqual(expect.arrayContaining(['F4.reply', 'F5.term', 'F7.office', 'F9']))
      expect(keys).not.toContain('F4')
      expect(keys).not.toContain('F5')
      expect(after.find((r) => r.key === 'F7.office')?.status).toBe('confirmed')
      expect(after.find((r) => r.key === 'F7.registered')?.status).toBe('to-confirm')
      expect(after.find((r) => r.key === 'F4.money')?.status).toBe('conflict')
      expect(after.find((r) => r.key === 'S2')?.value).toBe('275.000 t')
      expect(keys).toContain('C10')
      const en = await payload.findGlobal({ slug: 'figures', locale: 'en' })
      expect(en.rows?.find((r) => r.key === 'F5.term')?.value).toContain('10 years')

      const fresh = await payload.findByID({ collection: 'pages', id: page.id, locale: 'ro' })
      expect(fresh.summary).toBe('Răspuns {{F4.reply}}.')
      expect(JSON.stringify(fresh.layout)).toContain('F5.instalments')
      await payload.delete({ collection: 'pages', id: page.id })

      const again = (await read()).map((r) => r.id)
      await applyFigures(payload, silent)
      expect((await read()).map((r) => r.id)).toEqual(again)
    })
  })

  describe('owner corrections', () => {
    const card = (title: string, body: string, href?: string) => ({
      title,
      body,
      link: href ? { label: title, href } : null,
    })

    it('drops what is about the programme, and keeps what only linked to it', () => {
      const fixed = correct({
        layout: [
          { blockType: 'storySection', kicker: 'Golden Relationship', heading: 'Un an greu' },
          {
            blockType: 'serviceGrid',
            items: [
              card('Logistică', 'Transport.', '/logistica'),
              card('Golden Relationship', 'Sprijin.', '/golden-relationship'),
              card(
                'Fermieri',
                'Parteneriate pe termen lung, inclusiv prin programul Golden Relationship.',
                '/golden-relationship',
              ),
            ],
          },
          { blockType: 'figureTable', keys: ['C2', 'C3', 'C9.phone', 'C9.email'] },
        ],
      })
      expect(fixed).toEqual({
        layout: [
          {
            blockType: 'serviceGrid',
            items: [
              card('Logistică', 'Transport.', '/logistica'),
              {
                title: 'Fermieri',
                body: 'Parteneriate pe termen lung.',
                link: { label: null, href: null },
              },
            ],
          },
          { blockType: 'figureTable', keys: ['C3', 'C9.email'] },
        ],
      })
    })

    it('saves a real page after taking a link out of a card', async () => {
      const page = await payload.create({
        collection: 'pages',
        locale: 'ro',
        data: {
          title: 'ZZ card page',
          slug: 'zz-fin-card',
          summary: 'Rezumat.',
          languages: ['ro', 'en'],
          layout: [
            {
              blockType: 'serviceGrid',
              heading: 'Parteneri',
              items: [
                {
                  title: 'Fermieri',
                  body: 'Parteneriate pe termen lung, inclusiv prin programul Golden Relationship.',
                  link: { label: 'Golden Relationship', href: '/golden-relationship' },
                },
              ],
            },
          ],
          _status: 'published',
        } as never,
        context: { skipChildren: true },
      })
      await applyFigures(payload, silent)
      const fresh = await payload.findByID({ collection: 'pages', id: page.id, locale: 'ro' })
      expect(fresh.slug).toBe('zz-fin-card')
      expect(JSON.stringify(fresh.layout)).toContain('Fermieri')
      expect(JSON.stringify(fresh.layout)).not.toContain('olden')
      await payload.delete({ collection: 'pages', id: page.id })
    })

    it('keeps the URL when the slug and the path disagree', async () => {
      expect(keepUrl('/about/figures', 'agrinvest-in-figures').slug).toBe('figures')
      expect(keepUrl('/', 'acasa').slug).toBe('acasa')
      const page = await payload.create({
        collection: 'pages',
        locale: 'ro',
        data: {
          title: 'ZZ url',
          slug: 'zz-fin-url',
          summary: 'Capacitate în {{S1}} baze.',
          languages: ['ro'],
          _status: 'published',
        } as never,
        context: { skipChildren: true },
      })
      await payload.db.updateOne({
        collection: 'pages',
        id: page.id,
        data: { slug: 'zz-fin-other' },
        locale: 'ro',
      } as never)
      await applyFigures(payload, silent)
      const fresh = await payload.findByID({ collection: 'pages', id: page.id, locale: 'ro' })
      expect(fresh.path).toBe('/zz-fin-url')
      await payload.delete({ collection: 'pages', id: page.id })
    })

    it('says silos and warehouses, not bases, with the count', () => {
      expect(correct('Capacitatea este de {{S2}}, în {{S1}} baze.')).toBe(
        'Capacitatea este de {{S2}}, în {{S1}} silozuri și depozite de cereale.',
      )
    })

    it('hides the programme page from the public and keeps it for staff', async () => {
      const data = {
        title: 'Golden Relationship',
        slug: 'golden-relationship',
        summary: 'Program.',
        languages: ['ro'],
        _status: 'published',
      } as never
      const context = { skipChildren: true }
      const { docs } = await payload.find({
        collection: 'pages',
        where: { slug: { equals: 'golden-relationship' } },
        locale: 'ro',
        depth: 0,
        draft: true,
      })
      const page = docs[0]
        ? await payload.update({ collection: 'pages', id: docs[0].id, locale: 'ro', data, context })
        : await payload.create({ collection: 'pages', locale: 'ro', data, context })
      await applyFigures(payload, silent)
      const read = (overrideAccess: boolean) =>
        payload.find({
          collection: 'pages',
          where: { id: { equals: page.id } },
          overrideAccess,
          depth: 0,
        })
      expect((await read(false)).docs).toHaveLength(0)
      expect((await read(true)).docs).toHaveLength(1)
    })

    it('takes the programme out of the live menu and footer, and nothing else', async () => {
      const read = async () => ({
        nav: await payload.findGlobal({ slug: 'navigation', locale: 'ro', depth: 0 }),
        footer: await payload.findGlobal({ slug: 'footer', locale: 'ro', depth: 0 }),
      })
      const clean = await read()
      const stale = JSON.parse(JSON.stringify(clean)) as typeof clean
      const about = stale.nav.items?.find((i) => i.children?.length)
      const link = { label: 'Golden Relationship', href: '/golden-relationship' }
      about?.children?.push({ link, description: 'Sprijin' } as never)
      const column = stale.footer.columns?.[0]
      column?.links?.push({ link } as never)
      await payload.updateGlobal({
        slug: 'navigation',
        locale: 'ro',
        data: { items: stale.nav.items } as never,
      })
      await payload.updateGlobal({
        slug: 'footer',
        locale: 'ro',
        data: { columns: stale.footer.columns } as never,
      })
      expect(JSON.stringify(await read())).toContain('golden-relationship')

      await applyFigures(payload, silent)
      const after = await read()
      expect(JSON.stringify(after)).not.toContain('golden-relationship')
      const labels = (v: typeof clean) =>
        JSON.stringify([v.nav.items, v.footer.columns]).replace(/"id":"[^"]*",?/g, '')
      expect(labels(after)).toBe(labels(clean))
    })

    it('leaves a value signed in the admin alone', async () => {
      const rows = (await payload.findGlobal({ slug: 'figures', locale: 'ro' })).rows ?? []
      const signed = rows.map((r) =>
        r.key === 'F4.money'
          ? {
              ...r,
              value: 'în 24 h',
              status: 'confirmed' as const,
              confirmedBy: 'IFN',
              confirmedAt: '2026-12-01',
            }
          : r,
      )
      await payload.updateGlobal({ slug: 'figures', locale: 'ro', data: { rows: signed } })
      await applyFigures(payload, silent)
      const after = (await payload.findGlobal({ slug: 'figures', locale: 'ro' })).rows ?? []
      expect(after.find((r) => r.key === 'F4.money')?.value).toBe('în 24 h')
      await payload.updateGlobal({ slug: 'figures', locale: 'ro', data: { rows } })
    })
  })

  it('turns a Markdown table into rich text with a header row', () => {
    const { root } = rt(
      'Text.\n\n| A | B |\n| --- | --- |\n| 1 | **2** |\n\nAfter.',
    ) as unknown as {
      root: { children: { type: string; children: { children: { headerState: number }[] }[] }[] }
    }
    expect(root.children.map((c) => c.type)).toEqual(['paragraph', 'table', 'paragraph'])
    const [head, row] = root.children[1].children
    expect(root.children[1].children).toHaveLength(2)
    expect(head.children[0].headerState).toBe(1)
    expect(row.children[0].headerState).toBe(0)
    expect(richView(rt('| A |\n| --- |\n| **b** |'))).toContain('**b**')
  })

  it('compares rich text with its links and bold', () => {
    expect(richView(rt('A **b** [c](/d).'))).toBe('A **b** [c](/d).')
  })
})
