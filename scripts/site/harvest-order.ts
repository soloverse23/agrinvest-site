/**
 * Puts the crops in the order of harvest (barley, wheat, rapeseed, sunflower, corn) on a site
 * that is already live: the crop links of the menu, and the saved texts that list crops. The
 * code sorts its own lists (`@/lib/crops`) and the seed writes the new order on an empty
 * database. Only a menu in the old order and texts still in the old words change, so anything
 * staff edited stays. Safe to repeat.
 */
import type { Payload } from 'payload'

import { keepUrl } from '../finance/corrections'
import type { Locale } from './navigation'

const locales: Locale[] = ['ro', 'en']
const context = { skipChildren: true }

/** Each old text, exactly as the site saved it → the same text in harvest order. */
const words = new Map<string, string>([
  // Menu: the line under "Seeds".
  ['Grâu, orz, rapiță, năut', 'Orz, grâu, rapiță, năut'],
  ['Wheat, barley, rapeseed, chickpea', 'Barley, wheat, rapeseed, chickpea'],
  // The grain pages' search title and summary.
  [
    'Vinde cereale: grâu, porumb, floarea-soarelui, rapiță',
    'Vinde cereale: grâu, rapiță, floarea-soarelui, porumb',
  ],
  [
    'Cumpărăm grâu, porumb, floarea-soarelui, rapiță și orz direct de la fermieri, cu recepție în bazele noastre și transport cu flota proprie.',
    'Cumpărăm orz, grâu, rapiță, floarea-soarelui și porumb direct de la fermieri, cu recepție în bazele noastre și transport cu flota proprie.',
  ],
  [
    'Romanian grain: wheat, corn, sunflower, rapeseed',
    'Romanian grain: wheat, rapeseed, sunflower, corn',
  ],
  [
    'Agrinvest buys wheat, corn, sunflower, rapeseed and barley directly from Romanian farmers, receives it at its own bases and moves it with its own fleet.',
    'Agrinvest buys barley, wheat, rapeseed, sunflower and corn directly from Romanian farmers, receives it at its own bases and moves it with its own fleet.',
  ],
  // The home page's search description.
  [
    'Prețul zilei pentru grâu, porumb și floarea-soarelui, recepție în bazele Agrinvest, magazin agricol cu semințe și inputuri, credit cu rate după recoltă.',
    'Prețul zilei pentru grâu, floarea-soarelui și porumb, recepție în bazele Agrinvest, magazin agricol cu semințe și inputuri, credit cu rate după recoltă.',
  ],
  [
    'Today’s price for wheat, maize and sunflower, reception at Agrinvest’s bases, a farm shop for seeds and inputs, and credit repaid after harvest.',
    'Today’s price for wheat, sunflower and maize, reception at Agrinvest’s bases, a farm shop for seeds and inputs, and credit repaid after harvest.',
  ],
  // The two instalments on the financing page.
  ['grâu, orz, rapiță', 'orz, grâu, rapiță'],
  ['porumb, floarea-soarelui', 'floarea-soarelui, porumb'],
  ['wheat, barley, rapeseed', 'barley, wheat, rapeseed'],
  ['corn, sunflower', 'sunflower, corn'],
  // Shop categories: intro, search title and description.
  [
    'Erbicide pentru porumb, cereale, floarea-soarelui și rapiță, cu substanța activă, numărul omologării și, unde le-am verificat, dozele din registrul ANF sau de pe etichetă.',
    'Erbicide pentru cereale, rapiță, floarea-soarelui și porumb, cu substanța activă, numărul omologării și, unde le-am verificat, dozele din registrul ANF sau de pe etichetă.',
  ],
  [
    'Herbicides for maize, cereals, sunflower and rapeseed, with the active substance, the registration number and, where we checked them, the rates from the ANF register or the label.',
    'Herbicides for cereals, rapeseed, sunflower and maize, with the active substance, the registration number and, where we checked them, the rates from the ANF register or the label.',
  ],
  [
    'Erbicide la Agrinvest pentru porumb, cereale, floarea-soarelui și rapiță: substanță activă, omologare ANF și doze verificate. Cere ofertă.',
    'Erbicide la Agrinvest pentru cereale, rapiță, floarea-soarelui și porumb: substanță activă, omologare ANF și doze verificate. Cere ofertă.',
  ],
  [
    'Herbicides at Agrinvest for maize, cereals, sunflower and rapeseed: active substance, ANF registration and checked rates. Ask for a quote.',
    'Herbicides at Agrinvest for cereals, rapeseed, sunflower and maize: active substance, ANF registration and checked rates. Ask for a quote.',
  ],
  [
    'Insecticide pentru cereale, porumb, rapiță, cartof, legume și pomi, cu substanța activă, grupa IRAC și numărul omologării.',
    'Insecticide pentru cereale, rapiță, porumb, cartof, legume și pomi, cu substanța activă, grupa IRAC și numărul omologării.',
  ],
  [
    'Insecticides for cereals, maize, rapeseed, potato, vegetables and orchards, with the active substance, the IRAC group and the registration number.',
    'Insecticides for cereals, rapeseed, maize, potato, vegetables and orchards, with the active substance, the IRAC group and the registration number.',
  ],
  [
    'Insecticide la Agrinvest pentru cereale, porumb, rapiță, cartof, legume și pomi: substanță activă, grupa IRAC, omologare ANF. Cere ofertă.',
    'Insecticide la Agrinvest pentru cereale, rapiță, porumb, cartof, legume și pomi: substanță activă, grupa IRAC, omologare ANF. Cere ofertă.',
  ],
  [
    'Insecticides at Agrinvest for cereals, maize, rapeseed, potato, vegetables and orchards: active substance, IRAC group, ANF registration. Ask for a quote.',
    'Insecticides at Agrinvest for cereals, rapeseed, maize, potato, vegetables and orchards: active substance, IRAC group, ANF registration. Ask for a quote.',
  ],
  [
    'Sămânță certificată de grâu, orz, rapiță și năut, cu soiul, clasa biologică și ambalajul fiecărui produs.',
    'Sămânță certificată de orz, grâu, rapiță și năut, cu soiul, clasa biologică și ambalajul fiecărui produs.',
  ],
  [
    'Certified wheat, barley, rapeseed and chickpea seed, with the variety, seed class and pack of each product.',
    'Certified barley, wheat, rapeseed and chickpea seed, with the variety, seed class and pack of each product.',
  ],
  ['Sămânță certificată: grâu, orz, rapiță, năut', 'Sămânță certificată: orz, grâu, rapiță, năut'],
  [
    'Sămânță certificată la Agrinvest: grâu, orz, rapiță și năut. Vezi soiul, clasa biologică și ambalajul și cere sfatul unui consultant.',
    'Sămânță certificată la Agrinvest: orz, grâu, rapiță și năut. Vezi soiul, clasa biologică și ambalajul și cere sfatul unui consultant.',
  ],
  [
    'Certified seed: wheat, barley, rapeseed, chickpea',
    'Certified seed: barley, wheat, rapeseed, chickpea',
  ],
  [
    'Certified seed at Agrinvest: wheat, barley, rapeseed and chickpea. See the variety, seed class and pack, and ask a consultant for advice.',
    'Certified seed at Agrinvest: barley, wheat, rapeseed and chickpea. See the variety, seed class and pack, and ask a consultant for advice.',
  ],
  [
    'Erbicide pentru cereale, porumb, floarea-soarelui și rapiță. Alege după cultură, substanța activă și momentul aplicării.',
    'Erbicide pentru cereale, rapiță, floarea-soarelui și porumb. Alege după cultură, substanța activă și momentul aplicării.',
  ],
  [
    'Herbicides for cereals, maize, sunflower and rapeseed. Choose by crop, active ingredient and application timing.',
    'Herbicides for cereals, rapeseed, sunflower and maize. Choose by crop, active ingredient and application timing.',
  ],
  // Figure C7, "Grain we buy".
  [
    'grâu, orz, rapiță, floarea-soarelui, porumb, triticale, soia, mazăre',
    'orz, grâu, rapiță, floarea-soarelui, porumb, triticale, soia, mazăre',
  ],
  [
    'wheat, barley, rapeseed, sunflower, corn, triticale, soy, peas',
    'barley, wheat, rapeseed, sunflower, corn, triticale, soy, peas',
  ],
])

/** Every text equal to an old one, replaced; the same value when there is none. */
export function reworded<T>(value: T): T {
  if (typeof value === 'string') return (words.get(value) ?? value) as T
  if (Array.isArray(value)) {
    const next = value.map(reworded)
    return next.some((v, i) => v !== value[i]) ? (next as T) : value
  }
  if (!value || typeof value !== 'object') return value
  const entries = Object.entries(value).map(([k, v]) => [k, v, reworded(v)] as const)
  return entries.some(([, before, after]) => before !== after)
    ? (Object.fromEntries(entries.map(([k, , after]) => [k, after])) as T)
    : value
}

/** The crop slugs in the order the menu used to list them, and in harvest order. */
const slugs: Record<Locale, { prices: string; old: string[]; harvest: string[] }> = {
  ro: {
    prices: '/preturi',
    old: ['grau', 'porumb', 'floarea-soarelui', 'rapita', 'orz'],
    harvest: ['orz', 'grau', 'rapita', 'floarea-soarelui', 'porumb'],
  },
  en: {
    prices: '/en/prices',
    old: ['wheat', 'corn', 'sunflower', 'rapeseed', 'barley'],
    harvest: ['barley', 'wheat', 'rapeseed', 'sunflower', 'corn'],
  },
}

type Row = { link?: { href?: string | null } | null }

/**
 * A menu panel's links with the five crop prices in harvest order, or the same array when they
 * are not there, one after another, in the old order.
 */
export function withHarvestLinks<T extends Row>(rows: T[], locale: Locale): T[] {
  const { prices, old, harvest } = slugs[locale]
  const start = rows.findIndex((r) => r.link?.href === `${prices}/${old[0]}`)
  const found = start >= 0 && old.every((s, i) => rows[start + i]?.link?.href === `${prices}/${s}`)
  if (!found) return rows
  const crops = harvest.map((s) => rows[start + old.indexOf(s)]!)
  return [...rows.slice(0, start), ...crops, ...rows.slice(start + old.length)]
}

async function applyMenu(payload: Payload, log: (s: string) => void) {
  for (const locale of locales) {
    const nav = await payload.findGlobal({ slug: 'navigation', locale, depth: 0 })
    const items = nav.items ?? []
    let changed = false
    const next = items.map((item) => {
      const children = item.children ?? []
      const ordered = reworded(withHarvestLinks(children, locale))
      if (ordered === children) return item
      changed = true
      return { ...item, children: ordered }
    })
    if (!changed) continue
    await payload.updateGlobal({ slug: 'navigation', locale, data: { items: next }, context })
    log(`harvest order: menu (${locale}) updated`)
  }
}

async function applyPages(payload: Payload, log: (s: string) => void) {
  const { docs } = await payload.find({
    collection: 'pages',
    pagination: false,
    depth: 0,
    draft: true,
    select: {},
  })
  for (const { id } of docs) {
    for (const locale of locales) {
      const page = await payload.findByID({
        collection: 'pages',
        id,
        locale,
        fallbackLocale: false,
        depth: 0,
        draft: true,
      })
      const before = { summary: page.summary, seo: page.seo, layout: page.layout }
      const changed = Object.entries(before).filter(([, value]) => reworded(value) !== value)
      if (!changed.length) continue
      await payload.update({
        collection: 'pages',
        id,
        locale,
        context,
        data: {
          ...Object.fromEntries(changed.map(([key, value]) => [key, reworded(value)])),
          ...keepUrl(page.path, page.slug),
        } as never,
        draft: page._status === 'draft',
      })
      log(`harvest order: ${page.path} (${locale}) updated`)
    }
  }
}

async function applyCategories(payload: Payload, log: (s: string) => void) {
  for (const locale of locales) {
    const { docs } = await payload.find({
      collection: 'categories',
      locale,
      fallbackLocale: false,
      pagination: false,
      depth: 0,
      draft: true,
      joins: false,
    })
    for (const doc of docs) {
      const before = { intro: doc.intro, seo: doc.seo }
      const changed = Object.entries(before).filter(([, value]) => reworded(value) !== value)
      if (!changed.length) continue
      await payload.update({
        collection: 'categories',
        id: doc.id,
        locale,
        context,
        data: {
          ...Object.fromEntries(changed.map(([key, value]) => [key, reworded(value)])),
          // The saved slug is the page's address: a save must not rebuild it from the name.
          slug: doc.slug,
          generateSlug: false,
        } as never,
        draft: doc._status === 'draft',
      })
      log(`harvest order: category ${doc.slug} (${locale}) updated`)
    }
  }
}

async function applyFigures(payload: Payload, log: (s: string) => void) {
  for (const locale of locales) {
    const figures = await payload.findGlobal({
      slug: 'figures',
      locale,
      fallbackLocale: false,
      depth: 0,
    })
    const rows = figures.rows ?? []
    const next = rows.map((row) =>
      reworded(row.value) === row.value ? row : { ...row, value: reworded(row.value) },
    )
    if (next.every((row, i) => row === rows[i])) continue
    await payload.updateGlobal({ slug: 'figures', locale, data: { rows: next }, context })
    log(`harvest order: figures (${locale}) updated`)
  }
}

export async function applyHarvestOrder(payload: Payload, log: (s: string) => void = console.log) {
  await applyMenu(payload, log)
  await applyPages(payload, log)
  await applyCategories(payload, log)
  await applyFigures(payload, log)
}
