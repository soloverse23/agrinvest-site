import type { Product } from '@/payload-types'

/**
 * Shop rules as plain functions, shared by the collections, the admin and the checks.
 * A product here is whatever is known so far: every field may be missing.
 */
type ProductData = Partial<Product>
type Variant = NonNullable<Product['variants']>[number]

const filled = (value: unknown) =>
  Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== ''

/** Lei per litre or per kilogram, so pack sizes compare. Null for seeds and pieces. */
export function unitPriceOf(variant: Partial<Pick<Variant, 'price' | 'size' | 'unit'>>) {
  const { price, size, unit } = variant
  if (!price || !size || !unit) return null
  const factor = { l: 1, ml: 0.001, kg: 1, g: 0.001, t: 1000 }[unit as string]
  return factor ? Math.round((price / (size * factor)) * 100) / 100 : null
}

export const gapOptions = [
  { label: { ro: 'Ambalaje', en: 'Pack sizes' }, value: 'variants' },
  { label: { ro: 'Categorie', en: 'Category' }, value: 'category' },
  { label: { ro: 'Producător', en: 'Brand' }, value: 'brand' },
  { label: { ro: 'Culturi', en: 'Crops' }, value: 'crops' },
  { label: { ro: 'Rezumat', en: 'Summary' }, value: 'summary' },
  { label: { ro: 'Descriere', en: 'Description' }, value: 'description' },
  { label: { ro: 'Fotografii', en: 'Photos' }, value: 'gallery' },
  { label: { ro: 'Date tehnice', en: 'Technical data' }, value: 'technical' },
  { label: { ro: 'Doze', en: 'Doses' }, value: 'doses' },
  { label: { ro: 'Documente', en: 'Documents' }, value: 'documents' },
  { label: { ro: 'Preț neconfirmat', en: 'Price not confirmed' }, value: 'price-unconfirmed' },
  {
    label: { ro: 'Date tehnice neconfirmate', en: 'Technical data not confirmed' },
    value: 'technical-unconfirmed',
  },
  { label: { ro: 'Doze neconfirmate', en: 'Doses not confirmed' }, value: 'doses-unconfirmed' },
] as const

export type Gap = (typeof gapOptions)[number]['value']

/** What each product type needs before its technical and dose data count as complete. */
function typeGaps(p: ProductData): Gap[] {
  const gaps: Gap[] = []
  if (p.productType === 'protection') {
    const { activeIngredients, formulation, registrationNumber, doses } = p.protection ?? {}
    if (![activeIngredients, formulation, registrationNumber].every(filled)) gaps.push('technical')
    if (!filled(doses)) gaps.push('doses')
  }
  if (p.productType === 'seed') {
    const { species, variety, sowingRate } = p.seed ?? {}
    if (![species, variety].every(filled)) gaps.push('technical')
    if (!filled(sowingRate)) gaps.push('doses')
  }
  if (p.productType === 'fertiliser') {
    const { nutrients, form, rates } = p.fertiliser ?? {}
    if (![nutrients, form].every(filled)) gaps.push('technical')
    if (!filled(rates)) gaps.push('doses')
  }
  return gaps
}

/** Everything still missing or unconfirmed on a product, for the admin and `check:products`. */
export function productGaps(p: ProductData): Gap[] {
  const gaps: Gap[] = []
  if (!filled(p.variants)) gaps.push('variants')
  if (!filled(p.primaryCategory)) gaps.push('category')
  if (!filled(p.brand)) gaps.push('brand')
  if (!filled(p.crops)) gaps.push('crops')
  if (!filled(p.summary)) gaps.push('summary')
  if (!filled(p.description)) gaps.push('description')
  if (!filled(p.gallery)) gaps.push('gallery')
  gaps.push(...typeGaps(p))
  if (!filled(p.documents)) gaps.push('documents')
  if (p.verification?.price?.status !== 'confirmed') gaps.push('price-unconfirmed')
  if (p.verification?.technical?.status !== 'confirmed') gaps.push('technical-unconfirmed')
  if (p.verification?.doses?.status !== 'confirmed') gaps.push('doses-unconfirmed')
  return gaps
}

/** Why a product may not move from `pilot` to `live`. Empty means it may. */
export function liveBlockers(p: ProductData, now = new Date()): string[] {
  const blockers: string[] = []
  if (!filled(p.variants) || p.variants?.some((v) => !filled(v.price)))
    blockers.push('Every pack size needs a price.')
  if (p.verification?.price?.status !== 'confirmed')
    blockers.push('Agrinvest has not confirmed the price and stock.')
  if (p.productType === 'protection') {
    const { registrationNumber, registrationValidUntil } = p.protection ?? {}
    if (!registrationNumber) blockers.push('The registration number is missing.')
    if (registrationValidUntil && new Date(registrationValidUntil) < now)
      blockers.push('The registration has expired.')
  }
  return blockers
}

/** A hub needs at least this many products, so thin pages stay out of the index. */
export const hubMinProducts = 3

/** Whether a category, brand, crop or ingredient hub may be indexed. */
export function isHubIndexable(hub: {
  indexable?: boolean | null
  intro?: null | string
  noindex?: boolean | null
  productCount: number
}): boolean {
  return (
    Boolean(hub.indexable) &&
    !hub.noindex &&
    Boolean(hub.intro?.trim()) &&
    hub.productCount >= hubMinProducts
  )
}

/** Hub and route words a category slug may not use: `/magazin/{categorie}` shares their level. */
export const reservedCategorySlugs = [
  'cultura',
  'substanta-activa',
  'producator',
  'cautare',
  'crop',
  'active-ingredient',
  'brand',
  'search',
] as const
