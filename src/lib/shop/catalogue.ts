import type { Locale } from '@/i18n/config'

import { orderBlock, type OrderBlock } from './rules'

/**
 * Listing logic over the catalogue. A product card carries what a listing needs, so filters,
 * counts and search run on one cached list: the catalogue is a few hundred products at most.
 */
export type Ref = { id: number; slug: string; name: string }

export type ProductCardData = {
  id: number
  slug: string
  name: string
  summary?: string | null
  productType: 'protection' | 'seed' | 'fertiliser' | 'other'
  commerceStatus: 'pilot' | 'live'
  category: Ref & { parent?: number | null }
  secondary: number[]
  brand?: Ref | null
  crops: Ref[]
  ingredients: (Ref & { concentration?: number | null; unit?: string | null })[]
  formulation?: string | null
  /** Fertiliser composition (N, P2O5…), for the card's line under the name. */
  nutrients?: { nutrient: string; percent?: number | null }[]
  /** Fertiliser form or seed variety: the second key chip after the formulation. */
  form?: string | null
  /** What `orderBlock` needs, so a card can tell whether it may offer add to cart. */
  order?: {
    saleStopped: boolean
    ghs06: boolean
    registered: boolean
    validUntil?: string | null
  }
  variants: {
    sku: string
    size: number
    unit: string
    price?: number | null
    unitPrice?: number | null
    stock: 'in-stock' | 'on-request' | 'out-of-stock'
  }[]
  image?: { url: string; alt: string } | null
  /**
   * The label dose for the list view, from the numeric dose (protection) or rate (fertiliser)
   * rows in the unit most rows use. None when no row has a number.
   */
  dose?: { min: number; max: number; unit: string } | null
  createdAt?: string
  updatedAt: string
}

export type FacetKey = 'crop' | 'brand' | 'ingredient' | 'formulation' | 'stock' | 'price'

/** Query parameter of each filter, per language. */
export const facetParams: Record<FacetKey, Record<Locale, string>> = {
  crop: { ro: 'cultura', en: 'crop' },
  brand: { ro: 'producator', en: 'brand' },
  ingredient: { ro: 'substanta', en: 'ingredient' },
  formulation: { ro: 'formulare', en: 'formulation' },
  stock: { ro: 'stoc', en: 'stock' },
  price: { ro: 'pret', en: 'price' },
}

/** Price presets in lei, on the cheapest pack: the lower bound counts, the upper does not. */
export const priceRanges = ['0-100', '100-300', '300-1000', '1000-'] as const
export type PriceRange = (typeof priceRanges)[number]

const isPriceRange = (value: string): value is PriceRange =>
  (priceRanges as readonly string[]).includes(value)

export type Filters = Partial<Record<FacetKey, string>>

export type SearchParams = Record<string, string | string[] | undefined>

/** The active filters of a URL. Unknown parameters and price ranges are ignored. */
export function readFilters(params: SearchParams, locale: Locale): Filters {
  const filters: Filters = {}
  for (const key of Object.keys(facetParams) as FacetKey[]) {
    const value = params[facetParams[key][locale]]
    if (typeof value !== 'string' || !value) continue
    if (key === 'price' && !isPriceRange(value)) continue
    filters[key] = value
  }
  return filters
}

/** Sort orders after "relevance" (the default, no parameter), with their URL value per language. */
export const sortValues = {
  'price-asc': { ro: 'pret', en: 'price' },
  'price-desc': { ro: 'pret-desc', en: 'price-desc' },
  'unit-price': { ro: 'pret-unitar', en: 'unit-price' },
  name: { ro: 'nume', en: 'name' },
  newest: { ro: 'noi', en: 'newest' },
} as const satisfies Record<string, Record<Locale, string>>

export type SortKey = 'relevance' | keyof typeof sortValues

/** Sort, view and page parameters, per language, next to the filters. */
export const listingParams = {
  sort: { ro: 'ordine', en: 'sort' },
  view: { ro: 'afisare', en: 'view' },
  page: { ro: 'pagina', en: 'page' },
} as const

const listValue = { ro: 'lista', en: 'list' } as const

/** Products per listing page. */
export const PAGE_SIZE = 24

/** What a listing URL asks for: filters, sort, view and page. Page is not clamped here. */
export type ListingState = {
  filters: Filters
  sort: SortKey
  view: 'grid' | 'list'
  page: number
}

export function readListing(params: SearchParams, locale: Locale): ListingState {
  const one = (name: string) => (typeof params[name] === 'string' ? (params[name] as string) : '')
  const sortParam = one(listingParams.sort[locale])
  const sort =
    (Object.keys(sortValues) as (keyof typeof sortValues)[]).find(
      (k) => sortValues[k][locale] === sortParam,
    ) ?? 'relevance'
  const page = Number(one(listingParams.page[locale]))
  return {
    filters: readFilters(params, locale),
    sort,
    view: one(listingParams.view[locale]) === listValue[locale] ? 'list' : 'grid',
    page: Number.isInteger(page) && page > 1 ? page : 1,
  }
}

/**
 * Whether a URL carries any filter, sort, view or page parameter. Such URLs stay out of the
 * index with the clean listing as canonical, whatever the value (`?pagina=1` included).
 */
export function hasListingParams(params: SearchParams, locale: Locale) {
  return [
    ...Object.values(facetParams).map((p) => p[locale]),
    ...Object.values(listingParams).map((p) => p[locale]),
  ].some((name) => typeof params[name] === 'string')
}

/**
 * A listing URL. Parameters keep a fixed order (filters, sort, view, page) so equal states
 * give equal URLs. `extra` carries the search query first.
 */
export function listingHref(
  path: string,
  state: ListingState,
  locale: Locale,
  extra?: Record<string, string>,
) {
  const query = new URLSearchParams(extra)
  for (const key of Object.keys(facetParams) as FacetKey[]) {
    const value = state.filters[key]
    if (value) query.set(facetParams[key][locale], value)
  }
  if (state.sort !== 'relevance')
    query.set(listingParams.sort[locale], sortValues[state.sort][locale])
  if (state.view === 'list') query.set(listingParams.view[locale], listValue[locale])
  if (state.page > 1) query.set(listingParams.page[locale], String(state.page))
  const q = query.toString()
  return q ? `${path}?${q}` : path
}

/** The state with one filter switched on or off; a filter change goes back to page 1. */
export function toggleFilter(state: ListingState, key: FacetKey, value: string): ListingState {
  const filters: Filters = { ...state.filters }
  if (filters[key] === value) delete filters[key]
  else filters[key] = value
  return { ...state, filters, page: 1 }
}

export const inStock = (p: ProductCardData) => p.variants.some((v) => v.stock === 'in-stock')

/** OUG 53/2025 and sale-stop checks on card data, the same rules the cart applies. */
export function cardOrderBlock(p: ProductCardData, now = new Date()): OrderBlock | null {
  const o = p.order
  return orderBlock(
    {
      productType: p.productType,
      saleBlock: o?.saleStopped ? 'stopped' : null,
      protection: {
        ghs06: o?.ghs06,
        registrationNumber: o?.registered ? 'yes' : null,
        registrationValidUntil: o?.validUntil,
      },
      category: p.category.slug,
    },
    now,
  )
}

/**
 * What a card offers (Phase 7c): quick add for a single buyable pack; "choose a pack" when there
 * are several; the quick request when nothing can be bought online (no price, on request, out
 * of stock or blocked by the rules). The cart checks again on every add.
 */
export type CardAction =
  | { kind: 'add'; sku: string }
  | { kind: 'choose' }
  | { kind: 'request'; reason: 'no-price' | 'on-request' | 'out-of-stock' | OrderBlock }

export function cardAction(p: ProductCardData, now = new Date()): CardAction {
  const block = cardOrderBlock(p, now)
  if (block) return { kind: 'request', reason: block }
  const buyable = p.variants.filter((v) => v.stock === 'in-stock' && v.price != null)
  if (buyable.length === 1) return { kind: 'add', sku: buyable[0].sku }
  if (buyable.length) return { kind: 'choose' }
  if (p.variants.some((v) => v.stock === 'in-stock')) return { kind: 'request', reason: 'no-price' }
  if (p.variants.some((v) => v.stock === 'on-request'))
    return { kind: 'request', reason: 'on-request' }
  return { kind: 'request', reason: p.variants.length ? 'out-of-stock' : 'no-price' }
}

const matches = (p: ProductCardData, key: FacetKey, value: string) => {
  if (key === 'crop') return p.crops.some((c) => c.slug === value)
  if (key === 'brand') return p.brand?.slug === value
  if (key === 'ingredient') return p.ingredients.some((i) => i.slug === value)
  if (key === 'formulation') return p.formulation === value
  if (key === 'price') return priceRangeOf(p) === value
  return inStock(p)
}

export const applyFilters = (products: ProductCardData[], filters: Filters) =>
  products.filter((p) =>
    (Object.entries(filters) as [FacetKey, string][]).every(([key, value]) =>
      matches(p, key, value),
    ),
  )

/** In stock first, then by name in the page's language: the "relevance" order. */
export const sortProducts = (products: ProductCardData[], locale: Locale) =>
  [...products].sort(
    (a, b) => Number(inStock(b)) - Number(inStock(a)) || a.name.localeCompare(b.name, locale),
  )

/** The cheapest pack's price, or null when no pack has one. */
export const lowestPrice = (p: ProductCardData) =>
  p.variants.reduce<number | null>(
    (low, v) => (v.price != null && (low == null || v.price < low) ? v.price : low),
    null,
  )

const lowestUnitPrice = (p: ProductCardData) =>
  p.variants.reduce<number | null>(
    (low, v) => (v.unitPrice != null && (low == null || v.unitPrice < low) ? v.unitPrice : low),
    null,
  )

/** The price preset a product falls in, by its cheapest pack. */
export function priceRangeOf(p: ProductCardData): PriceRange | null {
  const price = lowestPrice(p)
  if (price == null) return null
  if (price < 100) return '0-100'
  if (price < 300) return '100-300'
  if (price < 1000) return '300-1000'
  return '1000-'
}

/**
 * A listing in the chosen order. Products without the number a sort uses (no price, no unit
 * price) go last, in the relevance order; ties fall back to the relevance order too.
 */
export function sortListing(products: ProductCardData[], sort: SortKey, locale: Locale) {
  const base = sortProducts(products, locale)
  const rank = new Map(base.map((p, i) => [p.id, i]))
  const byRank = (a: ProductCardData, b: ProductCardData) =>
    (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0)
  const byNumber = (value: (p: ProductCardData) => number | null, dir: 1 | -1) =>
    [...base].sort((a, b) => {
      const x = value(a)
      const y = value(b)
      if (x == null || y == null) return Number(x == null) - Number(y == null) || byRank(a, b)
      return (x - y) * dir || byRank(a, b)
    })
  switch (sort) {
    case 'price-asc':
      return byNumber(lowestPrice, 1)
    case 'price-desc':
      return byNumber(lowestPrice, -1)
    case 'unit-price':
      return byNumber(lowestUnitPrice, 1)
    case 'name':
      return [...base].sort((a, b) => a.name.localeCompare(b.name, locale) || byRank(a, b))
    case 'newest':
      return [...base].sort(
        (a, b) =>
          (b.createdAt ?? b.updatedAt).localeCompare(a.createdAt ?? a.updatedAt) || byRank(a, b),
      )
    default:
      return base
  }
}

const optionsOf = (p: ProductCardData, key: FacetKey): { value: string; label: string }[] => {
  if (key === 'crop') return p.crops.map((c) => ({ value: c.slug, label: c.name }))
  if (key === 'brand') return p.brand ? [{ value: p.brand.slug, label: p.brand.name }] : []
  if (key === 'ingredient') return p.ingredients.map((i) => ({ value: i.slug, label: i.name }))
  if (key === 'formulation')
    return p.formulation ? [{ value: p.formulation, label: p.formulation }] : []
  if (key === 'price') {
    const range = priceRangeOf(p)
    return range ? [{ value: range, label: range }] : []
  }
  return inStock(p) ? [{ value: '1', label: '' }] : []
}

/**
 * Options of one filter with their counts. Each count respects the other active filters, so
 * no option leads to an empty page.
 */
export function facetOptions(products: ProductCardData[], key: FacetKey, filters: Filters) {
  const others = { ...filters }
  delete others[key]
  const counts = new Map<string, { value: string; label: string; count: number }>()
  for (const product of applyFilters(products, others))
    for (const option of optionsOf(product, key)) {
      const found = counts.get(option.value)
      if (found) found.count++
      else counts.set(option.value, { ...option, count: 1 })
    }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/** Every word must appear in the product's name, category, brand, crops or ingredients. */
export function searchProducts(products: ProductCardData[], query: string) {
  const words = fold(query).split(/\s+/).filter(Boolean)
  if (!words.length) return []
  return products.filter((p) => {
    const text = fold(
      [
        p.name,
        p.category.name,
        p.brand?.name,
        p.formulation,
        ...p.crops.map((c) => c.name),
        ...p.ingredients.map((i) => i.name),
      ]
        .filter(Boolean)
        .join(' '),
    )
    return words.every((w) => text.includes(w))
  })
}

/**
 * Product types a farmer buys in each month in Romania, most wanted first: seed and fertiliser
 * for autumn sowing, fertiliser over winter, protection through spring and summer. Only the
 * shop landing's default promo uses it; staff can always set their own (ShopHome).
 */
const seasonTypes: ProductCardData['productType'][][] = [
  ['fertiliser', 'seed'], // Jan
  ['fertiliser', 'seed'], // Feb
  ['protection', 'fertiliser', 'seed'], // Mar
  ['protection', 'seed', 'fertiliser'], // Apr
  ['protection', 'fertiliser'], // May
  ['protection', 'fertiliser'], // Jun
  ['protection', 'seed'], // Jul
  ['seed', 'fertiliser', 'protection'], // Aug
  ['seed', 'fertiliser', 'protection'], // Sep
  ['seed', 'fertiliser'], // Oct
  ['fertiliser', 'seed'], // Nov
  ['fertiliser', 'seed'], // Dec
]

/**
 * The default promo: the category with the most products in stock among the season's types.
 * Falls back to the category with the most products in stock overall; null on an empty shop.
 */
export function seasonalCategory(products: ProductCardData[], now = new Date()) {
  const counts = (types?: ProductCardData['productType'][]) => {
    const map = new Map<number, { category: ProductCardData['category']; count: number }>()
    for (const p of products)
      if (inStock(p) && (!types || types.includes(p.productType))) {
        const found = map.get(p.category.id)
        if (found) found.count++
        else map.set(p.category.id, { category: p.category, count: 1 })
      }
    return [...map.values()].sort(
      (a, b) => b.count - a.count || a.category.name.localeCompare(b.category.name),
    )
  }
  const top = counts(seasonTypes[now.getMonth()])[0] ?? counts()[0]
  return top ? { ...top.category, inStock: top.count } : null
}

export type ShopPromo = {
  kicker?: string | null
  title?: string | null
  text?: string | null
  link?: { label?: string | null; href?: string | null } | null
  image?: { url: string; alt: string } | null
  endsAt?: string | null
}

/** The staff promo while it is complete and its end day has not passed, else null. */
export function activePromo(promo: ShopPromo | null | undefined, now = new Date()) {
  if (!promo?.title?.trim() || !promo.link?.href?.trim()) return null
  if (promo.endsAt) {
    // The end date is a whole day: the card shows until that day is over.
    const end = new Date(promo.endsAt)
    end.setHours(23, 59, 59, 999)
    if (end < now) return null
  }
  return promo
}
