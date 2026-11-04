import { unstable_cache } from 'next/cache'

import type { Locale } from '@/i18n/config'
import { tags } from '@/lib/revalidate'
import type { ProductCardData, Ref } from '@/lib/shop/catalogue'
import { isHubIndexable } from '@/lib/shop/rules'
import type { ActiveIngredient, Brand, Category, Crop, Media, Product } from '@/payload-types'

import { payloadClient } from './payload'

/**
 * Shop data. English reads use no language fallback: text not yet translated stays empty, so
 * Romanian never appears on an English page.
 */
const read = (locale: Locale) => ({
  locale,
  fallbackLocale: false as const,
  overrideAccess: false,
  pagination: false,
})

const shopTags = [
  tags.products,
  tags.categories,
  tags.brands,
  tags.ingredients,
  tags.crops,
  tags.targets,
]

const object = <T>(value: T | number | null | undefined): T | undefined =>
  value && typeof value === 'object' ? value : undefined

const ref = (doc: { id: number; slug: string; name: string }): Ref => ({
  id: doc.id,
  slug: doc.slug,
  name: doc.name,
})

function toCard(p: Product): ProductCardData | null {
  const category = object<Category>(p.primaryCategory)
  // A product is reachable only through its category, which holds its URL.
  if (!category?.slug) return null
  const brand = object<Brand>(p.brand)
  const photo = object<Media>(p.gallery?.[0])
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    summary: p.summary,
    productType: p.productType,
    commerceStatus: p.commerceStatus,
    category: { ...ref(category), parent: object<Category>(category.parent)?.id ?? null },
    secondary: (p.secondaryCategories ?? []).flatMap((c) => object<Category>(c)?.id ?? []),
    brand: brand?.slug ? ref(brand) : null,
    crops: (p.crops ?? []).flatMap((c) => {
      const crop = object<Crop>(c)
      return crop?.slug ? [ref(crop)] : []
    }),
    ingredients: (p.protection?.activeIngredients ?? []).flatMap((row) => {
      const ingredient = object<ActiveIngredient>(row.ingredient)
      return ingredient?.slug
        ? [{ ...ref(ingredient), concentration: row.concentration, unit: row.unit }]
        : []
    }),
    formulation: p.protection?.formulation,
    variants: (p.variants ?? []).map((v) => ({
      sku: v.sku,
      size: v.size,
      unit: v.unit,
      price: v.price,
      unitPrice: v.unitPrice,
      stock: v.stock,
    })),
    image: photo?.url ? { url: photo.url, alt: photo.alt } : null,
    updatedAt: p.updatedAt,
  }
}

export const listProducts = unstable_cache(
  async (locale: Locale): Promise<ProductCardData[]> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      ...read(locale),
      collection: 'products',
      depth: 2,
      limit: 1000,
      select: {
        slug: true,
        name: true,
        summary: true,
        productType: true,
        commerceStatus: true,
        primaryCategory: true,
        secondaryCategories: true,
        brand: true,
        crops: true,
        gallery: true,
        variants: true,
        protection: { activeIngredients: true, formulation: true },
        updatedAt: true,
      },
      populate: {
        categories: { slug: true, name: true, parent: true },
        brands: { slug: true, name: true },
        crops: { slug: true, name: true },
        'active-ingredients': { slug: true, name: true },
        // `url` is computed from the filename, so it needs it selected too.
        media: { url: true, alt: true, filename: true },
      },
    })
    return docs.flatMap((p) => toCard(p as Product) ?? [])
  },
  ['shop:products'],
  { tags: shopTags },
)

/** The whole product, for its own page. */
export const getProduct = unstable_cache(
  async (slug: string, locale: Locale) => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      ...read(locale),
      collection: 'products',
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
      populate: {
        products: { slug: true },
        categories: {
          slug: true,
          name: true,
          parent: true,
        },
      },
    })
    return docs[0] ?? null
  },
  ['shop:product'],
  { tags: shopTags },
)

export const listCategories = unstable_cache(
  async (locale: Locale) => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      ...read(locale),
      collection: 'categories',
      joins: false,
      depth: 0,
      limit: 100,
      sort: 'order',
    })
    return docs
  },
  ['shop:categories'],
  { tags: shopTags },
)

/** Products of a category: directly, through a child category, or as a secondary category. */
export const inCategory = (products: ProductCardData[], category: Category) =>
  products.filter(
    (p) =>
      p.category.id === category.id ||
      p.category.parent === category.id ||
      p.secondary.includes(category.id),
  )

/** All crops, with what their shop hub needs. `listCrops` holds only the grains. */
export const listShopCrops = unstable_cache(
  async (locale: Locale) => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      ...read(locale),
      collection: 'crops',
      depth: 0,
      limit: 100,
      sort: 'createdAt',
    })
    return docs
  },
  ['shop:crops'],
  { tags: shopTags },
)

export const listBrands = unstable_cache(
  async (locale: Locale) => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      ...read(locale),
      collection: 'brands',
      joins: false,
      depth: 1,
      limit: 500,
      sort: 'name',
    })
    return docs
  },
  ['shop:brands'],
  { tags: shopTags },
)

export const listIngredients = unstable_cache(
  async (locale: Locale) => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      ...read(locale),
      collection: 'active-ingredients',
      joins: false,
      depth: 0,
      limit: 1000,
      sort: 'name',
    })
    return docs
  },
  ['shop:ingredients'],
  { tags: shopTags },
)

type Hub = {
  indexable?: boolean | null
  intro?: string | null
  seo?: { noindex?: boolean | null } | null
}

/** Applies the hub rule to any document with the shared hub fields. */
export const hubIndexable = (hub: Hub, productCount: number) =>
  isHubIndexable({
    indexable: hub.indexable,
    intro: hub.intro,
    noindex: hub.seo?.noindex,
    productCount,
  })
