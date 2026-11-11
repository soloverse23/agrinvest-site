/**
 * `npm run apply:shop` (Phase 7c): brings a live site's shop data to the redesign. The seed
 * writes the same on an empty database; a live one is seeded only once, so this step carries
 * the changes there. Safe to repeat: each part writes only what is still empty, so staff edits
 * stay. It runs in `prepare-database.sh` after `apply:redesign`. Label safety data is not
 * written yet: it waits for checked label sources.
 *
 * 1. Category icons from the seed's catalogue (`scripts/seed/data.ts`), by Romanian slug.
 * 2. A placeholder promo card on the ShopHome global, only while it has no promo title. The
 *    owner replaces it in the admin; it states no price, discount or date.
 */
import type { Payload } from 'payload'

import { categories as seedCategories } from '../seed/data'

type Log = (s: string) => void

/** Romanian slug → icon, as the seed sets them. */
export const seedIcons: Record<string, string> = Object.fromEntries(
  seedCategories.flatMap((c) => ('icon' in c && c.icon ? [[c.slug.ro, c.icon]] : [])),
)

/** Categories whose icon is empty and the seed has one for: `[id, icon]`. */
export function iconUpdates(docs: { id: number; slug?: string | null; icon?: string | null }[]) {
  return docs.flatMap((d) =>
    !d.icon && d.slug && seedIcons[d.slug] ? [[d.id, seedIcons[d.slug]] as const] : [],
  )
}

export async function applyCategoryIcons(payload: Payload, log: Log = console.log) {
  const { docs } = await payload.find({
    collection: 'categories',
    locale: 'ro',
    depth: 0,
    pagination: false,
    draft: true,
    select: { slug: true, icon: true },
  })
  const updates = iconUpdates(docs)
  for (const [id, icon] of updates)
    await payload.update({
      collection: 'categories',
      id,
      locale: 'ro',
      data: { icon: icon as never },
      context: { skipChildren: true },
    })
  log(`category icons: ${updates.length ? `${updates.length} set` : 'nothing to do'}`)
}

type Locale = 'ro' | 'en'

/** Placeholder promo (2026-11-11): get ready for spring. No figures, no end date. */
export const placeholderPromo: Record<
  Locale,
  { kicker: string; title: string; text: string; link: { label: string; href: string } }
> = {
  ro: {
    kicker: 'Pregătește sezonul',
    title: 'Îngrășăminte pentru primăvară',
    text: 'Comandă din timp. Un consultant îți confirmă prețul și stocul.',
    link: { label: 'Vezi îngrășămintele', href: '/magazin/ingrasaminte' },
  },
  en: {
    kicker: 'Get ready for spring',
    title: 'Fertilisers for spring',
    text: 'Order early. A consultant confirms the price and stock for you.',
    link: { label: 'See the fertilisers', href: '/en/shop/fertilisers' },
  },
}

export async function applyShopHome(payload: Payload, log: Log = console.log) {
  const current = await payload.findGlobal({
    slug: 'shop-home',
    locale: 'ro',
    fallbackLocale: false,
    depth: 0,
  })
  if (current.promo?.title?.trim()) return log('shop home promo: already set')
  for (const locale of ['ro', 'en'] as const)
    await payload.updateGlobal({
      slug: 'shop-home',
      locale,
      data: { promo: placeholderPromo[locale] },
    })
  log('shop home promo: placeholder written')
}

export async function applyShop(payload: Payload, log: Log = console.log) {
  await applyCategoryIcons(payload, log)
  await applyShopHome(payload, log)
}
