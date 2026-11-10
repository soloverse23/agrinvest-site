/**
 * Seeds the content model: Figures register, counties, bases, crops, shop categories, people,
 * lead routing, media (local footage stills), navigation, footer, SEO defaults and the core
 * pages with their content (content.ts).
 * Idempotent: every record is upserted by its key or slug. Run with `npm run seed`.
 */
import { existsSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

import config from '@payload-config'
import { getPayload, type Payload, type Where } from 'payload'

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
import { applyToolsEntryPoints, withToolsFooter, withToolsMenu } from '../tools/entry-points'
import { footer, navigation, pages } from './pages'
import { attachProductPhotos, canUploadPhotos, importProducts } from '../import/woo'
import { applyFinance } from '../finance/apply'
import { applyEntryPoints } from '../finance/entry-points'
import { applyEnrichment } from '../products/apply'
import { registerConfirmation, registerStatuses } from './register'

const context = { skipChildren: true }

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
  const statusOf = registerStatuses()
  const confirmation = registerConfirmation()
  const rows = figures.map((f) => ({
    key: f.key,
    label: f.label.ro,
    value: f.value.ro,
    number: f.number,
    unit: f.unit?.ro,
    source: f.source,
    status: statusOf(f.key),
    ...confirmation(f.key),
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
    // The enrichment step owns the text of a category it has written: never reset it.
    const { docs: existing } = await payload.find({
      collection: 'categories',
      where: { slug: { equals: c.slug.ro } },
      locale: 'ro',
      depth: 0,
      limit: 1,
      draft: true,
    })
    const enriched = Boolean((existing[0] as { enrichment?: unknown } | undefined)?.enrichment)
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
        ...(enriched ? {} : { intro: c.intro.ro, indexable: true }),
        _status: 'published',
      },
    )
    await payload.update({
      collection: 'categories',
      id: ids[c.slug.ro],
      locale: 'en',
      data: {
        name: c.name.en,
        slug: c.slug.en,
        ...(enriched ? {} : { intro: c.intro.en }),
        _status: 'published',
      },
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
 * Video stills from the 2022 Agrinvest films (`scripts/seed/assets/frames`). Footage rights
 * are not confirmed, so they stay marked "pending". They upload to a local database or where
 * cloud storage is set; elsewhere (CI) pages render without photos.
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
  const dir = resolve('scripts/seed/assets/frames')
  const ids: Ctx['media'] = {}
  if (!canUploadPhotos()) {
    console.log('media: skipped (no local database or cloud storage), no photos on pages')
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
      seo: { title: seed.ro.seoTitle, description: null },
      // The seed replaced the page, so the apply step starts again from the seed's text.
      enrichment: null,
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
          // Or Payload makes the slug from the title, and it no longer matches the path.
          generateSlug: false,
          summary: seed.en.summary,
          seo: { title: seed.en.seoTitle, description: null },
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
        // The prices panel comes from the same list the live step uses (Phase 5).
        items: withToolsMenu(
          navigation[locale].map(({ label, href, blurb, children }) => ({
            link: { label, href },
            blurb,
            children: children?.map((c) => ({
              link: { label: c.label, href: c.href },
              description: c.description,
            })),
          })),
          locale,
        ) as never,
        cta: navigation.cta[locale],
      },
    })
    await payload.updateGlobal({
      slug: 'footer',
      locale,
      context,
      data: {
        columns: withToolsFooter(
          footer[locale].columns.map((col) => ({
            title: col.title,
            links: col.links.map(([label, href]) => ({ link: { label, href } })),
          })),
          locale,
        ) as never,
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

// Deploys seed only an empty database, so they never overwrite what staff have entered. Once
// cloud storage exists they add the photos: stills go on the pages a single time, while no
// still is uploaded yet, and products that have no photo get theirs.
if (process.env.SEED_ONLY_IF_EMPTY === 'true') {
  const { totalDocs } = await payload.count({ collection: 'pages' })
  if (totalDocs > 0) {
    console.log(`seed: skipped, the database already has ${totalDocs} pages`)
    if (process.env.SEED_PHOTOS === 'true') {
      const { totalDocs: stills } = await payload.count({
        collection: 'media',
        // `like`: storage may rename a file whose name is already taken.
        where: { filename: { like: 'harvest-sunflower' } },
      })
      if (!stills) {
        const found = await payload.find({ collection: 'people', pagination: false, depth: 0 })
        const ids = Object.fromEntries(
          people.flatMap((p) => {
            const doc = found.docs.find((d) => d.name === p.name)
            return doc ? [[p.key, doc.id]] : []
          }),
        )
        await seedPages(payload, { people: ids, media: await seedMedia(payload) })
      }
      await attachProductPhotos(payload)
    }
    process.exit(0)
  }
}

await seedFigures(payload)
await seedLocations(payload)
await seedShop(payload)
await importProducts(payload)
await applyEnrichment(payload)
const peopleIds = await seedPeople(payload)
const mediaIds = await seedMedia(payload)
await seedGlobals(payload)
await seedPages(payload, { people: peopleIds, media: mediaIds })
// After the pages and people it links to.
await applyFinance(payload)
await applyEntryPoints(payload)
// Price menu, footer and the logistics diesel widget (Phase 5); the seed and deploys share it.
await applyToolsEntryPoints(payload)

// The seed writes outside Next.js, so its hooks cannot revalidate cache tags. Clear Next's
// data cache instead, or the next build or dev run serves the pre-seed content.
for (const dir of ['.next/cache/fetch-cache', '.next/dev/cache/fetch-cache']) {
  rmSync(resolve(dir), { recursive: true, force: true })
}
console.log('cleared the Next.js data cache')
process.exit(0)
