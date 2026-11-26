import {
  financeRoutes,
  priceRoutes,
  sections as routes,
  shopRoutes,
  type Section,
} from '@/i18n/routes'
import type { Locale } from '@/i18n/config'

/**
 * What a staff member edits from a public page: the document that page shows, a global, or a
 * whole section (prices are rows, not one document). Order matters: the first is the main one.
 */
export type PageTarget =
  | { kind: 'doc'; collection: string; slug: string; section?: string }
  | { kind: 'page'; path: string }
  | { kind: 'global'; global: string }
  | { kind: 'list'; collection: string }

const reservedFinance = (word: string, locale: Locale) =>
  Object.values(financeRoutes).some((r) => r[locale] === word)

const reservedPrice = (word: string, locale: Locale) =>
  Object.values(priceRoutes).some((r) => r[locale] === word)

/** The section a locale-relative path starts with, and the rest of its segments. */
function split(path: string, locale: Locale): { section: Section | null; rest: string[] } {
  const [first, ...rest] = path.split('/').filter(Boolean)
  const section =
    (Object.keys(routes) as Section[]).find((s) => routes[s][locale] === `/${first}`) ?? null
  return { section, rest: section ? rest : [first, ...rest].filter(Boolean) }
}

/**
 * The editable things behind a public path (`/magazin/erbicide/wing-p`, locale `ro`). Pure, so
 * it follows `src/i18n/routes.ts` and is tested without a database. Anything that is not a
 * section route is a CMS page, looked up by its path.
 */
export function targetsFor(locale: Locale, path: string): PageTarget[] {
  const { section, rest } = split(path, locale)
  const [a, b] = rest
  const doc = (collection: string, slug: string, guideSection?: string): PageTarget => ({
    kind: 'doc',
    collection,
    slug,
    ...(guideSection ? { section: guideSection } : {}),
  })

  switch (section) {
    case null:
      return [{ kind: 'page', path: path || '/' }]
    case 'shop': {
      if (!a) return [{ kind: 'global', global: 'shop-home' }]
      if (a === shopRoutes.search[locale]) return []
      if (a === shopRoutes.brand[locale]) return b ? [doc('brands', b)] : []
      if (a === shopRoutes.ingredient[locale]) return b ? [doc('active-ingredients', b)] : []
      if (a === shopRoutes.crop[locale]) return b ? [doc('crops', b)] : []
      return b ? [doc('products', b)] : [doc('categories', a)]
    }
    case 'finance': {
      if (!a) return []
      if (a === financeRoutes.guides[locale]) return b ? [doc('guides', b, 'finantare')] : []
      if (a === financeRoutes.questions[locale])
        return b
          ? [doc('finance-questions', b)]
          : [
              doc('guides', a, 'pagina-finantare'),
              { kind: 'list', collection: 'finance-questions' },
            ]
      if (reservedFinance(a, locale)) return [doc('guides', a, 'pagina-finantare')]
      return [doc('finance-products', b ?? a)]
    }
    case 'guides':
      return b ? [doc('guides', b, 'ghid')] : []
    case 'news':
      // `/stiri/zi/{date}` is a daily edition, built by the news job.
      return a && !b ? [doc('guides', a, 'stiri')] : []
    case 'market':
      return a ? [doc('guides', a, 'piata')] : []
    case 'authors':
      return a ? [doc('people', a)] : []
    case 'crops':
      return a ? [doc('crops', a), { kind: 'list', collection: 'buy-prices' }] : []
    case 'prices':
      if (a && reservedPrice(a, locale)) return []
      return [{ kind: 'list', collection: 'buy-prices' }]
    case 'diesel':
      return [{ kind: 'list', collection: 'diesel-prices' }]
    default:
      return []
  }
}
