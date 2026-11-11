import { unstable_cache } from 'next/cache'

import type { Locale } from '@/i18n/config'
import { tags } from '@/lib/revalidate'
import type { ProductCardData, Ref, ShopPromo } from '@/lib/shop/catalogue'
import { doseSummary } from '@/lib/shop/dose'
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

/** Changes with the reviewed product data (see `next.config.ts`), so a deploy never serves old cache. */
const epoch = process.env.ENRICHMENT_EPOCH ?? 'dev'

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
    nutrients: (p.fertiliser?.nutrients ?? []).flatMap((n) =>
      n.nutrient ? [{ nutrient: n.nutrient, percent: n.percent }] : [],
    ),
    form: p.fertiliser?.form ?? p.seed?.variety ?? null,
    order: {
      saleStopped: Boolean(p.saleBlock?.trim()),
      ghs06: Boolean(p.protection?.ghs06),
      registered: Boolean(p.protection?.registrationNumber),
      validUntil: p.protection?.registrationValidUntil ?? null,
    },
    variants: (p.variants ?? []).map((v) => ({
      sku: v.sku,
      size: v.size,
      unit: v.unit,
      price: v.price,
      unitPrice: v.unitPrice,
      stock: v.stock,
    })),
    image: photo?.url ? { url: photo.url, alt: photo.alt } : null,
    dose: doseSummary([
      ...(p.protection?.doses ?? []).map((d) => ({
        min: d.doseMin,
        max: d.doseMax,
        unit: d.doseUnit,
      })),
      ...(p.fertiliser?.rates ?? []).map((r) => ({
        min: r.rateMin,
        max: r.rateMax,
        unit: r.rateUnit,
      })),
    ]),
    createdAt: p.createdAt,
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
        saleBlock: true,
        protection: {
          activeIngredients: true,
          formulation: true,
          ghs06: true,
          registrationNumber: true,
          registrationValidUntil: true,
          doses: { doseMin: true, doseMax: true, doseUnit: true },
        },
        fertiliser: {
          nutrients: true,
          form: true,
          rates: { rateMin: true, rateMax: true, rateUnit: true },
        },
        seed: { variety: true },
        createdAt: true,
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
  [`shop:products:v2:${epoch}`],
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
  [`shop:product:${epoch}`],
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
  [`shop:categories:${epoch}`],
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
  [`shop:crops:${epoch}`],
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
  [`shop:brands:${epoch}`],
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
  [`shop:ingredients:${epoch}`],
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

/** A line of the shop menu: its slug, name and how many products it holds. */
export type MenuCount = { slug: string; name: string; count: number }

export type ShopMenu = {
  /** Every published product. */
  total: number
  /** Top-level categories with their non-empty subcategories. */
  categories: (MenuCount & { children: MenuCount[] })[]
  /** Crops with products, most products first. */
  crops: MenuCount[]
  /** Brands with products, most products first. */
  brands: MenuCount[]
}

const byCount = (a: MenuCount, b: MenuCount) => b.count - a.count || a.name.localeCompare(b.name)

/**
 * What the header's shop panel shows, counted from the published products at render time, so
 * the numbers never go stale. Names the language does not have yet are left out.
 */
export const getShopMenu = unstable_cache(
  async (locale: Locale): Promise<ShopMenu> => {
    const [categories, products, crops, brands] = await Promise.all([
      listCategories(locale),
      listProducts(locale),
      listShopCrops(locale),
      listBrands(locale),
    ])
    const named = categories.filter((c) => c.slug && c.name)
    const parentOf = (c: Category) => object<Category>(c.parent)?.id ?? (c.parent as number | null)
    const line = (c: Category): MenuCount => ({
      slug: c.slug as string,
      name: c.name,
      count: inCategory(products, c).length,
    })
    return {
      total: products.length,
      categories: named
        .filter((c) => !parentOf(c))
        .map((c) => ({
          ...line(c),
          children: named
            .filter((child) => parentOf(child) === c.id)
            .map(line)
            .filter((child) => child.count > 0),
        }))
        .filter((c) => c.count > 0),
      crops: crops
        .filter((c) => c.slug && c.name)
        .map((c) => ({
          slug: c.slug,
          name: c.name,
          count: products.filter((p) => p.crops.some((pc) => pc.id === c.id)).length,
        }))
        .filter((c) => c.count > 0)
        .sort(byCount),
      brands: brands
        .filter((b) => b.slug && b.name)
        .map((b) => ({
          slug: b.slug,
          name: b.name,
          count: products.filter((p) => p.brand?.id === b.id).length,
        }))
        .filter((b) => b.count > 0)
        .sort(byCount),
    }
  },
  [`shop:menu:${epoch}`],
  { tags: shopTags },
)

/** The shop landing's promo card and featured products (ShopHome global). */
export const getShopHome = unstable_cache(
  async (locale: Locale): Promise<{ promo: ShopPromo | null; featured: number[] }> => {
    const payload = await payloadClient()
    const doc = await payload.findGlobal({
      slug: 'shop-home',
      locale,
      fallbackLocale: false,
      depth: 1,
      populate: { media: { url: true, alt: true, filename: true }, products: { slug: true } },
    })
    const image = object<Media>(doc.promo?.image)
    return {
      promo: doc.promo
        ? {
            ...doc.promo,
            image: image?.url ? { url: image.url, alt: image.alt } : null,
          }
        : null,
      // Featured products resolve against the published catalogue, so a draft never shows.
      featured: (doc.featured ?? []).map((p) => (typeof p === 'object' ? p.id : p)),
    }
  },
  [`global:shop-home:${epoch}`],
  { tags: [tags.global('shop-home')] },
)
