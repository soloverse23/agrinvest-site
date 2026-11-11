/**
 * `npm run apply:redesign` (Phase 7b): brings a live site to the redesigned menu, footer and
 * home page. The seed writes the same on an empty database; a live one is seeded only once, so
 * this step carries the changes there. Runs on every deploy after `apply:articles`.
 *
 * Safe to repeat: each part skips once its target state is there, and leaves later staff edits
 * alone. Every page save sends `keepUrl`, so no live URL moves.
 *
 * 1. Menu and footer from `scripts/site/navigation.ts`, only while the old long menu is there.
 * 2. Home: the hero with three slides, the FAQ and the SEO text, in both languages. The posters
 *    go to Media when cloud storage is set (else the slides have none); stills get focal points.
 * 3. Bases: off the home page and /cereale, onto /despre/cifre under "Baze și capacitate".
 */
import type { Payload } from 'payload'

import { canUploadPhotos } from '../import/woo'
import { keepUrl } from '../finance/corrections'
import { homeFaqFor, homeLayout, posterKey } from '../seed/home'
import { findUploads, stillFocus, uploadPosters } from '../seed/media'
import { heroSlides } from '../site/hero'
import { homeSeo } from '../site/home'
import { footerColumns, navigationItems, siteCta, siteFooter } from '../site/navigation'

type Locale = 'ro' | 'en'
type Log = (s: string) => void
type Block = { blockType?: string; [k: string]: unknown }
type NavItem = { panel?: string | null; [k: string]: unknown }
type FooterColumn = { links?: { link?: { href?: string | null } | null }[] | null }

const locales: Locale[] = ['ro', 'en']
const context = { skipChildren: true }

/** The menu still has the old shape: more than five items and no shop panel. */
export const isOldMenu = (items: NavItem[]) =>
  items.length > 5 && !items.some((i) => i.panel === 'shop')

const toolsHub: Record<Locale, string> = { ro: '/unelte', en: '/en/tools' }

/** The footer predates the redesign: no column links the tools hub. */
export const isOldFooter = (columns: FooterColumn[], locale: Locale) =>
  !columns.some((c) => (c.links ?? []).some((l) => l.link?.href === toolsHub[locale]))

/** The home hero already carries the slider. */
export const hasSlides = (layout: Block[]) =>
  layout.some((b) => b.blockType === 'hero' && Array.isArray(b.slides) && b.slides.length > 0)

export const withoutBaseList = (layout: Block[]) =>
  layout.some((b) => b.blockType === 'baseList')
    ? layout.filter((b) => b.blockType !== 'baseList')
    : layout

const capacityHeading = /^(Baze și capacitate|Bases and capacity)$/

/** The figures page with the county map under the storage figures, unless it has one. */
export function withFiguresMap(layout: Block[]): Block[] {
  if (layout.some((b) => b.blockType === 'baseList')) return layout
  const block: Block = { blockType: 'baseList', showMap: true }
  const at = layout.findIndex(
    (b) =>
      b.blockType === 'figureTable' &&
      (capacityHeading.test(String(b.heading ?? '')) ||
        (Array.isArray(b.keys) && b.keys.includes('S2'))),
  )
  return at < 0 ? [...layout, block] : [...layout.slice(0, at + 1), block, ...layout.slice(at + 1)]
}

/** Fills the posters a slider lacks (written before cloud storage existed), by slide order. */
export function withPosters(layout: Block[], locale: Locale, media: Record<string, number>) {
  let changed = false
  const next = layout.map((b) => {
    if (b.blockType !== 'hero' || !Array.isArray(b.slides)) return b
    const slides = (b.slides as Block[]).map((s, i) => {
      const file = heroSlides[locale][i]?.poster
      const id = file ? media[posterKey(file)] : undefined
      if (s.poster || !id) return s
      changed = true
      return { ...s, poster: id }
    })
    return { ...b, slides }
  })
  return changed ? next : layout
}

async function applyMenus(payload: Payload, log: Log) {
  for (const locale of locales) {
    const nav = await payload.findGlobal({ slug: 'navigation', locale, depth: 0 })
    if (isOldMenu((nav.items ?? []) as NavItem[])) {
      await payload.updateGlobal({
        slug: 'navigation',
        locale,
        context,
        data: { items: navigationItems(locale), cta: siteCta[locale] } as never,
      })
      log(`redesign: menu (${locale}) replaced with the five-item menu`)
    }
    const footer = await payload.findGlobal({ slug: 'footer', locale, depth: 0 })
    if (isOldFooter((footer.columns ?? []) as FooterColumn[], locale)) {
      await payload.updateGlobal({
        slug: 'footer',
        locale,
        context,
        data: { columns: footerColumns(locale), legal: siteFooter[locale].legal } as never,
      })
      log(`redesign: footer (${locale}) replaced`)
    }
  }
}

/** Posters into Media (cloud storage only) and focal points on the stills nobody has moved. */
async function applyMedia(payload: Payload, log: Log) {
  if (!canUploadPhotos()) {
    log('redesign: no cloud storage, the slides keep no poster')
    return {}
  }
  const ids = await uploadPosters(payload)
  for (const [name, focus] of Object.entries(stillFocus)) {
    for (const doc of await findUploads(payload, name)) {
      // 50/50 is Payload's default: an editor who moved the point keeps it.
      const untouched = (doc.focalX ?? 50) === 50 && (doc.focalY ?? 50) === 50
      if (!untouched || (doc.focalX === focus.focalX && doc.focalY === focus.focalY)) continue
      await payload.update({ collection: 'media', id: doc.id, data: focus, context })
      log(`redesign: focal point on ${doc.filename}`)
    }
  }
  return ids
}

/** A page by its Romanian path, read in one language (the English path differs). */
async function pageIn(payload: Payload, where: object, locale: Locale) {
  const { docs } = await payload.find({
    collection: 'pages',
    where: where as never,
    locale: 'ro',
    depth: 0,
    limit: 1,
    draft: true,
  })
  if (!docs[0]) return undefined
  return payload.findByID({ collection: 'pages', id: docs[0].id, locale, depth: 0, draft: true })
}

type PageDoc = NonNullable<Awaited<ReturnType<typeof pageIn>>>

async function savePage(payload: Payload, page: PageDoc, locale: Locale, data: object) {
  await payload.update({
    collection: 'pages',
    id: page.id,
    locale,
    context,
    data: { ...data, ...keepUrl(page.path, page.slug) } as never,
    draft: page._status === 'draft',
  })
}

async function applyHome(payload: Payload, media: Record<string, number>, log: Log) {
  for (const locale of locales) {
    const page = await pageIn(payload, { isHome: { equals: true } }, locale)
    if (!page) continue
    const layout = (page.layout ?? []) as Block[]
    if (!hasSlides(layout)) {
      await savePage(payload, page, locale, {
        layout: homeLayout(locale, media),
        faq: homeFaqFor(locale),
        seo: homeSeo[locale],
      })
      log(`redesign: home (${locale}) slider, FAQ and SEO written`)
      continue
    }
    const filled = withPosters(layout, locale, media)
    if (filled !== layout) {
      await savePage(payload, page, locale, { layout: filled })
      log(`redesign: home (${locale}) posters added`)
    }
  }
}

async function applyBases(payload: Payload, log: Log) {
  const edits: [string, (l: Block[]) => Block[]][] = [
    ['/cereale', withoutBaseList],
    ['/despre/cifre', withFiguresMap],
  ]
  for (const [path, edit] of edits) {
    for (const locale of locales) {
      const page = await pageIn(payload, { path: { equals: path } }, locale)
      if (!page) continue
      const layout = (page.layout ?? []) as Block[]
      // An English page with no blocks of its own has nothing to edit.
      if (!layout.length) continue
      const next = edit(layout)
      if (next === layout) continue
      await savePage(payload, page, locale, { layout: next })
      log(`redesign: bases on ${page.path} (${locale}) updated`)
    }
  }
}

export async function applyRedesign(payload: Payload, log: Log = console.log) {
  await applyMenus(payload, log)
  const media = await applyMedia(payload, log)
  await applyHome(payload, media, log)
  await applyBases(payload, log)
}
