/**
 * Seeds the content model: Figures register, counties, bases, crops, shop categories, people,
 * lead routing, media (local footage stills), navigation, footer, SEO defaults and the core
 * pages with their content (content.ts).
 * Idempotent: every record is upserted by its key or slug. Run with `npm run seed`.
 */
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

import config from '@payload-config'
import { getPayload, type Payload, type Where } from 'payload'

import type { FactStatus } from '@/fields'
import { slugify } from '@/lib/slugify'
import { contentFor, cropContent, cropFaq, type Ctx } from './content'
import { contentEn, cropContentEn, cropFaqEn } from './content-en'
import {
  bases,
  categories,
  counties,
  crops,
  figures,
  people,
  routes,
  sameAs,
  shopCrops,
} from './data'
import { footer, navigation, pages } from './pages'
import { importProducts } from '../import/woo'

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

async function upsert<T extends 'counties' | 'bases' | 'crops' | 'people' | 'categories'>(
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
        isGrain: true,
        name: crop.name.ro,
        slug: crop.slug.ro,
        intro: cropContent[crop.key].intro,
        faq: cropFaq(crop.name.ro.toLowerCase(), cropContent[crop.key].season),
        _status: 'published',
      },
    )
    await payload.update({
      collection: 'crops',
      id,
      locale: 'en',
      data: {
        name: crop.name.en,
        slug: crop.slug.en,
        intro: cropContentEn[crop.key].intro,
        faq: cropFaqEn(crop.name.en.toLowerCase(), cropContentEn[crop.key].season),
        _status: 'published',
      },
      context,
    })
  }
  console.log(
    `locations: ${counties.length} counties, ${bases.length} bases, ${crops.length} crops`,
  )
}

async function seedShop(payload: Payload) {
  for (const crop of shopCrops) {
    const id = await upsert(
      payload,
      'crops',
      { key: { equals: crop.key } },
      {
        key: crop.key,
        isGrain: false,
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
  const ids: Record<string, number> = {}
  for (const [order, c] of categories.entries()) {
    const parent = 'parent' in c ? ids[c.parent] : null
    ids[c.slug.ro] = await upsert(
      payload,
      'categories',
      { slug: { equals: c.slug.ro } },
      {
        name: c.name.ro,
        slug: c.slug.ro,
        role: c.role,
        parent,
        order,
        icon: 'icon' in c ? c.icon : null,
        intro: c.intro.ro,
        indexable: true,
        _status: 'published',
      },
    )
    await payload.update({
      collection: 'categories',
      id: ids[c.slug.ro],
      locale: 'en',
      data: { name: c.name.en, slug: c.slug.en, intro: c.intro.en, _status: 'published' },
      context,
    })
  }
  console.log(`shop: ${shopCrops.length} shop crops, ${categories.length} categories`)
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

/**
 * Video stills from the 2022 Agrinvest films (data/raw/frames, gitignored). Footage rights
 * are not confirmed, so they are uploaded as "pending" and only to a local database where
 * the files exist; elsewhere (CI, hosted previews) pages render without photos.
 */
const frames: Record<string, { ro: string; en: string }> = {
  'harvest-sunflower': {
    ro: 'Combină recoltând floarea-soarelui, văzută de sus',
    en: 'A combine harvesting sunflower, seen from above',
  },
  combine: { ro: 'Combină în lanul de grâu', en: 'A combine in a wheat field' },
  team: { ro: 'Echipa Agrinvest pe teren', en: 'The Agrinvest team in the field' },
  fleet: { ro: 'Camioane din flota Agrinvest', en: 'Trucks from the Agrinvest fleet' },
  'grain-reception': {
    ro: 'Cereale descărcate la recepție, într-o bază Agrinvest',
    en: 'Grain unloaded at reception in an Agrinvest base',
  },
}

async function seedMedia(payload: Payload): Promise<Ctx['media']> {
  const dir = resolve('data/raw/frames')
  const ids: Ctx['media'] = {}
  // Only a local database: the files stay on this machine, and footage rights are open.
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(process.env.DATABASE_URL ?? '')
  if (!local || !existsSync(dir)) {
    console.log('media: skipped (local database and data/raw/frames only), no photos on pages')
    return ids
  }
  for (const [name, alt] of Object.entries(frames)) {
    const filePath = resolve(dir, `${name}.webp`)
    if (!existsSync(filePath)) continue
    const found = await payload.find({
      collection: 'media',
      where: { filename: { equals: `${name}.webp` } },
      limit: 1,
      depth: 0,
    })
    const data = { alt: alt.ro, rights: 'pending' as const, credit: 'Agrinvest (YouTube, 2022)' }
    const doc = found.docs[0]
      ? await payload.update({ collection: 'media', id: found.docs[0].id, data, locale: 'ro' })
      : await payload.create({ collection: 'media', data, filePath, locale: 'ro' })
    await payload.update({ collection: 'media', id: doc.id, data: { alt: alt.en }, locale: 'en' })
    ids[name] = doc.id
  }
  console.log(`media: ${Object.keys(ids).length} frames (rights pending)`)
  return ids
}

async function seedPages(payload: Payload, ctx: Ctx) {
  const ids: Record<string, number> = {}
  for (const seed of pages) {
    const content = contentFor(seed.key, ctx)
    const english = contentEn(seed.key, ctx)
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
      layout: content?.ro ?? [],
      faq: content?.faq?.ro ?? [],
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
      // Layout and FAQ are per language: the English page has its own blocks.
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
          layout: english?.blocks ?? [],
          faq: english?.faq ?? [],
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
        items: navigation[locale].map(({ label, href, blurb, children }) => ({
          link: { label, href },
          blurb,
          children: children?.map((c) => ({
            link: { label: c.label, href: c.href },
            description: c.description,
          })),
        })),
        cta: navigation.cta[locale],
      },
    })
    await payload.updateGlobal({
      slug: 'footer',
      locale,
      context,
      data: {
        columns: footer[locale].columns.map((col) => ({
          title: col.title,
          links: col.links.map(([label, href]) => ({ link: { label, href } })),
        })),
        legal: footer[locale].legal,
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
  console.log('globals: navigation, footer, seo defaults')
}

const payload = await getPayload({ config })
await seedFigures(payload)
await seedLocations(payload)
await seedShop(payload)
await importProducts(payload)
const peopleIds = await seedPeople(payload)
const mediaIds = await seedMedia(payload)
await seedGlobals(payload)
await seedPages(payload, { people: peopleIds, media: mediaIds })

// The seed writes outside Next.js, so its hooks cannot revalidate cache tags. Clear Next's
// data cache instead, or the next build or dev run serves the pre-seed content.
for (const dir of ['.next/cache/fetch-cache', '.next/dev/cache/fetch-cache']) {
  rmSync(resolve(dir), { recursive: true, force: true })
}
console.log('cleared the Next.js data cache')
process.exit(0)
