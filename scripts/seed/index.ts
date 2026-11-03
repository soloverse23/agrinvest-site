/**
 * Seeds the Phase 2 content model: Figures register, counties, bases, crops, people,
 * lead routing, navigation, SEO defaults and the core page shells.
 * Idempotent: every record is upserted by its key or slug. Run with `npm run seed`.
 */
import { readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

import config from '@payload-config'
import { getPayload, type Payload, type Where } from 'payload'

import type { FactStatus } from '@/fields'
import { slugify } from '@/lib/slugify'
import type { Page } from '@/payload-types'

import { bases, counties, crops, figures, people, routes, sameAs } from './data'
import { navigation, pages, type PageSeed } from './pages'

const context = { skipChildren: true }

/** Status per register key, read from the register's tables (the source of truth). */
function registerStatuses(): Map<string, FactStatus> {
  const md = readFileSync(resolve('docs/audit/figures-register.md'), 'utf8')
  const out = new Map<string, FactStatus>()
  for (const line of md.split('\n')) {
    const cells = line.split('|').map((c) => c.trim())
    if (!/^[A-Z]\d+$/.test(cells[1] ?? '')) continue
    const status =
      cells.slice(3).find((c) => /to confirm|conflict|confirmed|snapshot|missing/i.test(c)) ?? ''
    out.set(
      cells[1],
      /conflict/i.test(status)
        ? 'conflict'
        : /^confirmed/i.test(status.replace(/\*/g, ''))
          ? 'confirmed'
          : 'to-confirm',
    )
  }
  return out
}

async function upsert<T extends 'counties' | 'bases' | 'crops' | 'people'>(
  payload: Payload,
  collection: T,
  where: Record<string, { equals: unknown }>,
  data: Record<string, unknown>,
): Promise<number> {
  const found = await payload.find({
    collection,
    where,
    limit: 1,
    depth: 0,
    locale: 'ro',
    draft: true,
  })
  const doc = found.docs[0]
    ? await payload.update({
        collection,
        id: found.docs[0].id,
        data: data as never,
        locale: 'ro',
        context,
      })
    : await payload.create({ collection, data: data as never, locale: 'ro', context })
  return (doc as { id: number }).id
}

async function seedFigures(payload: Payload) {
  const statuses = registerStatuses()
  const statusOf = (key: string) => statuses.get(key.split('.')[0]) ?? 'to-confirm'
  const rows = figures.map((f) => ({
    key: f.key,
    label: f.label.ro,
    value: f.value.ro,
    number: f.number,
    unit: f.unit?.ro,
    source: f.source,
    status: statusOf(f.key),
  }))
  const ro = await payload.updateGlobal({ slug: 'figures', data: { rows }, locale: 'ro', context })
  await payload.updateGlobal({
    slug: 'figures',
    locale: 'en',
    context,
    data: {
      rows: (ro.rows ?? []).map((row, i) => ({
        id: row.id,
        key: row.key,
        status: row.status,
        label: figures[i].label.en,
        value: figures[i].value.en,
        unit: figures[i].unit?.en,
      })),
    },
  })
  const open = rows.filter((r) => r.status !== 'confirmed').length
  console.log(`figures: ${rows.length} rows (${open} not confirmed)`)
}

async function seedLocations(payload: Payload) {
  for (const c of counties) {
    await upsert(
      payload,
      'counties',
      { code: { equals: c.code } },
      {
        name: c.name,
        slug: slugify(c.name),
        code: c.code,
        centroid: { lng: c.at[0], lat: c.at[1] },
      },
    )
  }
  for (const [name, capacity] of bases) {
    await upsert(
      payload,
      'bases',
      { slug: { equals: slugify(name) } },
      {
        name,
        slug: slugify(name),
        capacity,
        capacityStatus: 'to-confirm',
        locationStatus: 'to-confirm',
        servicesStatus: 'to-confirm',
        contactStatus: 'to-confirm',
        _status: 'published',
      },
    )
  }
  for (const crop of crops) {
    const id = await upsert(
      payload,
      'crops',
      { key: { equals: crop.key } },
      {
        key: crop.key,
        name: crop.name.ro,
        slug: crop.slug.ro,
        _status: 'published',
      },
    )
    await payload.update({
      collection: 'crops',
      id,
      locale: 'en',
      data: { name: crop.name.en, slug: crop.slug.en, _status: 'published' },
      context,
    })
  }
  console.log(
    `locations: ${counties.length} counties, ${bases.length} bases, ${crops.length} crops`,
  )
}

async function seedPeople(payload: Payload): Promise<Record<string, number>> {
  const ids: Record<string, number> = {}
  for (const p of people) {
    const data = {
      name: p.name,
      role: p.role.ro,
      phone: 'phone' in p ? p.phone : undefined,
      email: 'email' in p ? p.email : undefined,
      publishPhone: false,
      publishEmail: false,
      isAuthor: 'author' in p,
    }
    ids[p.key] = await upsert(payload, 'people', { name: { equals: p.name } }, data)
    await payload.update({
      collection: 'people',
      id: ids[p.key],
      locale: 'en',
      data: { role: p.role.en },
      context,
    })
  }
  await payload.updateGlobal({
    slug: 'lead-routing',
    context,
    data: {
      routes: Object.entries(routes).map(([type, person]) => ({
        type: type as keyof typeof routes,
        primary: ids[person],
        fallback: ids.office,
      })),
    },
  })
  console.log(`people: ${people.length}, lead routes: ${Object.keys(routes).length}`)
  return ids
}

function layoutFor(seed: PageSeed, locale: 'ro' | 'en'): Page['layout'] {
  const en = locale === 'en'
  switch (seed.layout) {
    case 'home':
      return [
        {
          blockType: 'hero',
          eyebrow: en
            ? 'Grain · Storage · Inputs · Financing'
            : 'Cereale · Depozitare · Inputuri · Finanțare',
          title: en
            ? 'From sowing to sale, a partner for Romanian farmers'
            : 'Partenerul fermierului de la semănat până la vânzare',
          accent: en ? 'From sowing to sale' : 'până la vânzare',
          lead: en ? seed.en?.summary : seed.ro.summary,
          primary: en
            ? { label: 'Grain storage', href: '/en/storage' }
            : { label: 'Vinde cereale', href: '/cereale' },
          secondary: en
            ? { label: 'Contact us', href: '/en/contact' }
            : { label: 'Contactează-ne', href: '/contact' },
        },
        {
          blockType: 'figureStrip',
          items: [{ figure: 'S1' }, { figure: 'S2' }, { figure: 'L1' }],
        },
        {
          blockType: 'ctaBand',
          heading: en ? 'Financing aligned with the harvest' : 'Finanțare cu rate după recoltă',
          body: en
            ? 'Agrinvest Credit IFN finances production, investments and grain stocks.'
            : 'Agrinvest Credit IFN finanțează producția, investițiile și stocurile de cereale.',
          primary: en
            ? { label: 'Farm financing', href: '/en/financing' }
            : { label: 'Vezi finanțarea', href: '/finantare' },
        },
      ]
    case 'contact':
      return [{ blockType: 'leadForm', leadType: 'general', extraFields: ['company', 'county'] }]
    case 'grain':
      return [
        { blockType: 'leadForm', leadType: 'vanzare-cereale', extraFields: ['county', 'crop'] },
      ]
    default:
      return []
  }
}

async function seedPages(payload: Payload) {
  const ids: Record<string, number> = {}
  for (const seed of pages) {
    const where: Where = seed.isHome
      ? { isHome: { equals: true } }
      : {
          slug: { equals: seed.ro.slug },
          ...(seed.parent ? { parent: { equals: ids[seed.parent] } } : {}),
        }
    const found = await payload.find({
      collection: 'pages',
      where,
      limit: 1,
      depth: 0,
      locale: 'ro',
      draft: true,
    })
    const ro = {
      title: seed.ro.title,
      slug: seed.ro.slug,
      summary: seed.ro.summary,
      seo: { title: seed.ro.seoTitle },
      isHome: Boolean(seed.isHome),
      parent: seed.parent ? ids[seed.parent] : null,
      languages: seed.en ? (['ro', 'en'] as const) : (['ro'] as const),
      layout: layoutFor(seed, 'ro'),
      _status: 'published' as const,
    }
    const doc = found.docs[0]
      ? await payload.update({
          collection: 'pages',
          id: found.docs[0].id,
          data: ro as never,
          locale: 'ro',
          context,
        })
      : await payload.create({ collection: 'pages', data: ro as never, locale: 'ro', context })
    ids[seed.key] = doc.id
    if (seed.en) {
      // Blocks are shared across locales: reuse the saved rows' ids so the English text
      // is written onto the same blocks instead of replacing them (which drops Romanian).
      const ids = (doc.layout ?? []).map((b) => b.id)
      const enLayout = (layoutFor(seed, 'en') ?? []).map((b, i) => ({ ...b, id: ids[i] }))
      await payload.update({
        collection: 'pages',
        id: doc.id,
        locale: 'en',
        context,
        data: {
          title: seed.en.title,
          slug: seed.en.slug,
          summary: seed.en.summary,
          seo: { title: seed.en.seoTitle },
          layout: enLayout,
          _status: 'published',
        } as never,
      })
    }
  }
  console.log(`pages: ${pages.length}`)
}

async function seedGlobals(payload: Payload) {
  for (const locale of ['ro', 'en'] as const) {
    await payload.updateGlobal({
      slug: 'navigation',
      locale,
      context,
      data: {
        items: navigation[locale].map(([label, href]) => ({ link: { label, href } })),
        cta: { label: navigation.cta[locale][0], href: navigation.cta[locale][1] },
      },
    })
  }
  await payload.updateGlobal({
    slug: 'seo-defaults',
    locale: 'ro',
    context,
    data: {
      siteName: 'Agrinvest',
      titleTemplate: '%s · Agrinvest',
      description:
        'Agrinvest lucrează direct cu fermierii: cumpără cereale, oferă depozitare, inputuri, transport și finanțare prin Agrinvest Credit IFN.',
      organization: {
        legalName: 'Agrinvest SRL',
        ifnLegalName: 'Agrinvest Credit IFN SA',
        sameAs: sameAs.map((url) => ({ url })),
      },
    },
  })
  await payload.updateGlobal({
    slug: 'seo-defaults',
    locale: 'en',
    context,
    data: {
      description:
        'Agrinvest works directly with Romanian farmers: grain trading, storage, farm inputs, transport and financing through Agrinvest Credit IFN.',
    },
  })
  console.log('globals: navigation, seo defaults')
}

const payload = await getPayload({ config })
await seedFigures(payload)
await seedLocations(payload)
await seedPeople(payload)
await seedGlobals(payload)
await seedPages(payload)

// The seed writes outside Next.js, so its hooks cannot revalidate cache tags. Clear Next's
// data cache instead, or the next build or dev run serves the pre-seed content.
for (const dir of ['.next/cache/fetch-cache', '.next/dev/cache/fetch-cache']) {
  rmSync(resolve(dir), { recursive: true, force: true })
}
console.log('cleared the Next.js data cache')
process.exit(0)
