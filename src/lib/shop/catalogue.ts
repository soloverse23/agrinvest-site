import type { Locale } from '@/i18n/config'

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
  variants: {
    sku: string
    size: number
    unit: string
    price?: number | null
    unitPrice?: number | null
    stock: 'in-stock' | 'on-request' | 'out-of-stock'
  }[]
  image?: { url: string; alt: string } | null
  updatedAt: string
}

export type FacetKey = 'crop' | 'brand' | 'ingredient' | 'formulation' | 'stock'

/** Query parameter of each filter, per language. */
export const facetParams: Record<FacetKey, Record<Locale, string>> = {
  crop: { ro: 'cultura', en: 'crop' },
  brand: { ro: 'producator', en: 'brand' },
  ingredient: { ro: 'substanta', en: 'ingredient' },
  formulation: { ro: 'formulare', en: 'formulation' },
  stock: { ro: 'stoc', en: 'stock' },
}

export type Filters = Partial<Record<FacetKey, string>>

export type SearchParams = Record<string, string | string[] | undefined>

/** The active filters of a URL. Unknown parameters are ignored. */
export function readFilters(params: SearchParams, locale: Locale): Filters {
  const filters: Filters = {}
  for (const key of Object.keys(facetParams) as FacetKey[]) {
    const value = params[facetParams[key][locale]]
    if (typeof value === 'string' && value) filters[key] = value
  }
  return filters
}

export const inStock = (p: ProductCardData) => p.variants.some((v) => v.stock === 'in-stock')

const matches = (p: ProductCardData, key: FacetKey, value: string) => {
  if (key === 'crop') return p.crops.some((c) => c.slug === value)
  if (key === 'brand') return p.brand?.slug === value
  if (key === 'ingredient') return p.ingredients.some((i) => i.slug === value)
  if (key === 'formulation') return p.formulation === value
  return inStock(p)
}

export const applyFilters = (products: ProductCardData[], filters: Filters) =>
  products.filter((p) =>
    (Object.entries(filters) as [FacetKey, string][]).every(([key, value]) =>
      matches(p, key, value),
    ),
  )

/** In stock first, then by name in the page's language. */
export const sortProducts = (products: ProductCardData[], locale: Locale) =>
  [...products].sort(
    (a, b) => Number(inStock(b)) - Number(inStock(a)) || a.name.localeCompare(b.name, locale),
  )

const optionsOf = (p: ProductCardData, key: FacetKey): { value: string; label: string }[] => {
  if (key === 'crop') return p.crops.map((c) => ({ value: c.slug, label: c.name }))
  if (key === 'brand') return p.brand ? [{ value: p.brand.slug, label: p.brand.name }] : []
  if (key === 'ingredient') return p.ingredients.map((i) => ({ value: i.slug, label: i.name }))
  if (key === 'formulation')
    return p.formulation ? [{ value: p.formulation, label: p.formulation }] : []
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

/** The URL with one filter switched on or off. */
export function facetHref(
  path: string,
  filters: Filters,
  key: FacetKey,
  value: string,
  locale: Locale,
) {
  const next: Filters = { ...filters }
  if (next[key] === value) delete next[key]
  else next[key] = value
  const query = new URLSearchParams(
    (Object.entries(next) as [FacetKey, string][]).map(([k, v]) => [facetParams[k][locale], v]),
  ).toString()
  return query ? `${path}?${query}` : path
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
