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
  prices: { ro: '/preturi', en: '/prices' },
  market: { ro: '/piata', en: '/market' },
  diesel: { ro: '/motorina', en: '/diesel' },
  news: { ro: '/stiri', en: '/news' },
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

/** Price routes that are not crops. Their words are reserved: no crop slug may use them. */
export const priceRoutes = {
  netPrice: { ro: 'calculator-pret-net', en: 'net-price-calculator' },
  fertilisers: { ro: 'ingrasaminte', en: 'fertilisers' },
} as const satisfies Record<string, Record<Locale, string>>

/** Price hub: `/preturi`, `/en/prices`. */
export const pricesPath = (locale: Locale) => localePath(sections.prices[locale], locale)

/** One crop's prices: `/preturi/grau`, `/en/prices/wheat` (the crop's own slug). */
export const cropPricePath = (slug: string, locale: Locale) =>
  localePath(`${sections.prices[locale]}/${slug}`, locale)

/** The net-price calculator: `/preturi/calculator-pret-net`, `/en/prices/net-price-calculator`. */
export const netPricePath = (locale: Locale) =>
  localePath(`${sections.prices[locale]}/${priceRoutes.netPrice[locale]}`, locale)

/** Weekly market notes: `/piata`, `/en/market`. */
export const marketPath = (locale: Locale) => localePath(sections.market[locale], locale)

/** One market note: `/piata/nota-2026-11-09`, `/en/market/note-2026-11-09`. */
export const marketNotePath = (slug: string, locale: Locale) =>
  localePath(`${sections.market[locale]}/${slug}`, locale)

/** Fertiliser prices: `/preturi/ingrasaminte`, `/en/prices/fertilisers`. */
export const fertiliserPricesPath = (locale: Locale) =>
  localePath(`${sections.prices[locale]}/${priceRoutes.fertilisers[locale]}`, locale)

/** Diesel: `/motorina`, `/en/diesel`. */
export const dieselPath = (locale: Locale) => localePath(sections.diesel[locale], locale)

/** News: `/stiri`, `/en/news`. */
export const newsPath = (locale: Locale) => localePath(sections.news[locale], locale)
