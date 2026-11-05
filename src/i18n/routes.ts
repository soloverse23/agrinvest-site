import { localePath, type Locale } from './config'

/**
 * Prefixes of the collection routes (bases and crops are not CMS pages), per language.
 * Each prefix has its own route folder under `src/app/(frontend)/[locale]/`, which serves
 * only its own language.
 */
export const sections = {
  bases: { ro: '/baze', en: '/bases' },
  crops: { ro: '/cereale', en: '/grain' },
  shop: { ro: '/magazin', en: '/shop' },
  finance: { ro: '/finantare', en: '/financing' },
} as const satisfies Record<string, Record<Locale, string>>

export type Section = keyof typeof sections

/** Public URL of a base page: `/baze/pogoanele`, `/en/bases/pogoanele`. */
export const basePath = (slug: string, locale: Locale) =>
  localePath(`${sections.bases[locale]}/${slug}`, locale)

/** Public URL of a crop page: `/cereale/grau`, `/en/grain/wheat`. */
export const cropPath = (slug: string, locale: Locale) =>
  localePath(`${sections.crops[locale]}/${slug}`, locale)

/** Shop home: `/magazin`, `/en/shop`. */
export const shopPath = (locale: Locale) => localePath(sections.shop[locale], locale)

/** Shop category: `/magazin/erbicide`, `/en/shop/herbicides`. */
export const categoryPath = (slug: string, locale: Locale) =>
  localePath(`${sections.shop[locale]}/${slug}`, locale)

/** Product: `/magazin/erbicide/wing-p`, `/en/shop/herbicides/wing-p`. */
export const productPath = (category: string, slug: string, locale: Locale) =>
  localePath(`${sections.shop[locale]}/${category}/${slug}`, locale)

/** Cart and checkout. Personal pages: never indexed. */
export const cartPath = (locale: Locale) => localePath(locale === 'ro' ? '/cos' : '/cart', locale)
export const checkoutPath = (locale: Locale) =>
  localePath(locale === 'ro' ? '/comanda' : '/checkout', locale)

/** Second-level shop routes. Their words are reserved: no category may use them. */
export const shopRoutes = {
  crop: { ro: 'cultura', en: 'crop' },
  ingredient: { ro: 'substanta-activa', en: 'active-ingredient' },
  brand: { ro: 'producator', en: 'brand' },
  search: { ro: 'cautare', en: 'search' },
} as const satisfies Record<string, Record<Locale, string>>

export type HubKind = Exclude<keyof typeof shopRoutes, 'search'>

/** Hub by crop, active ingredient or brand: `/magazin/cultura/grau`. */
export const hubPath = (kind: HubKind, slug: string, locale: Locale) =>
  localePath(`${sections.shop[locale]}/${shopRoutes[kind][locale]}/${slug}`, locale)

export const searchPath = (locale: Locale) =>
  localePath(`${sections.shop[locale]}/${shopRoutes.search[locale]}`, locale)

/** Finance routes that are not products. Their words are reserved: no product may use them. */
export const financeRoutes = {
  guides: { ro: 'ghiduri', en: 'guides' },
  simulator: { ro: 'simulator', en: 'simulator' },
  eligibility: { ro: 'eligibilitate', en: 'eligibility' },
  documents: { ro: 'documente', en: 'documents' },
  apply: { ro: 'aplica', en: 'apply' },
  faq: { ro: 'intrebari-frecvente', en: 'faq' },
  about: { ro: 'despre-ifn', en: 'about-ifn' },
} as const satisfies Record<string, Record<Locale, string>>

export const reservedFinanceSlugs = new Set(
  Object.values(financeRoutes).flatMap((r) => Object.values(r) as string[]),
)

/** Finance section: `/finantare`, `/en/financing`. */
export const financePath = (locale: Locale) => localePath(sections.finance[locale], locale)

/** A finance product, or one nested under another: `/finantare/credit-investitii/utilaje`. */
export const financeProductPath = (slug: string, locale: Locale, parentSlug?: string | null) =>
  localePath(`${sections.finance[locale]}/${parentSlug ? `${parentSlug}/` : ''}${slug}`, locale)

/** A fixed finance page: `/finantare/simulator`, `/en/financing/about-ifn`. */
export const financeRoutePath = (route: keyof typeof financeRoutes, locale: Locale) =>
  localePath(`${sections.finance[locale]}/${financeRoutes[route][locale]}`, locale)

/** A guide: `/finantare/ghiduri/glosar`, `/en/financing/guides/glossary`. */
export const guidePath = (slug: string, locale: Locale) =>
  localePath(`${sections.finance[locale]}/${financeRoutes.guides[locale]}/${slug}`, locale)
