import { ShopShowcase, type ShowcaseCategory } from '@ds/patterns/HomeSections'
import { JsonLd } from '@/components/JsonLd'
import { ShopCard } from '@/components/templates/ShopParts'
import type { Locale } from '@/i18n/config'
import { homeUi } from '@/i18n/home'
import { categoryPath, hubPath, shopPath } from '@/i18n/routes'
import { getShopMenu, listCategories, listProducts } from '@/lib/content/shop'
import { itemList } from '@/lib/schema'
import type { ProductCardData } from '@/lib/shop/catalogue'

const TILES = 3
const PICKS = 6
const icons = new Set(['leaf', 'drop', 'scale'])

/** The top-level category a product sits under. */
const topOf = (p: ProductCardData) => p.category.parent ?? p.category.id

/**
 * Six products for the strip: published, with a photo and a price, taken in turn from each
 * top-level category so one category cannot fill the row. Newest first within a category.
 */
export function pickProducts(products: ProductCardData[], count = PICKS) {
  const ready = products
    .filter((p) => p.image && p.variants.some((v) => v.price != null))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.name.localeCompare(b.name))
  const queues = new Map<number, ProductCardData[]>()
  for (const p of ready) queues.set(topOf(p), [...(queues.get(topOf(p)) ?? []), p])
  const picked: ProductCardData[] = []
  while (picked.length < count && [...queues.values()].some((q) => q.length)) {
    for (const q of queues.values()) {
      const next = q.shift()
      if (next && picked.length < count) picked.push(next)
    }
  }
  return picked
}

/** Home "Magazin Agrinvest": category tiles, crop chips and six products. */
export async function HomeShop({ locale }: { locale: Locale }) {
  const t = homeUi[locale].shop
  const [menu, products, categories] = await Promise.all([
    getShopMenu(locale),
    listProducts(locale),
    listCategories(locale),
  ])
  const docs = new Map(categories.map((c) => [c.slug, c]))

  const tiles: ShowcaseCategory[] = menu.categories.slice(0, TILES).map((c) => {
    const doc = docs.get(c.slug)
    const children = [...c.children].sort((a, b) => b.count - a.count)
    const inside = products.filter((p) => doc && topOf(p) === doc.id && p.image)
    // One photo per subcategory first, so the tile shows the category's range.
    const photos = [
      ...children.flatMap((child) => inside.find((p) => p.category.slug === child.slug) ?? []),
      ...inside,
    ]
    const images = [...new Map(photos.map((p) => [p.id, p])).values()].slice(0, 3)
    return {
      href: categoryPath(c.slug, locale),
      title: c.name,
      count: t.products(c.count),
      icon: (doc?.icon && icons.has(doc.icon) ? doc.icon : 'leaf') as ShowcaseCategory['icon'],
      images: images.map((p) => ({ src: p.image!.url, alt: p.image!.alt ?? '' })),
      links: children.slice(0, 3).map((child) => ({
        href: categoryPath(child.slug, locale),
        label: child.name,
      })),
    }
  })
  if (!tiles.length) return null

  const picks = pickProducts(products)
  return (
    <>
      <JsonLd data={[itemList(tiles.map((c) => ({ name: c.title, url: c.href })))]} />
      <ShopShowcase
        kicker={t.kicker}
        title={t.title}
        categories={tiles}
        crops={{
          label: t.crops,
          items: menu.crops.slice(0, 6).map((c) => ({
            href: hubPath('crop', c.slug, locale),
            label: c.name,
          })),
        }}
        products={{
          label: t.picks,
          cards: picks.map((p) => (
            <ShopCard key={p.id} product={p} locale={locale} className="w-full" />
          )),
        }}
        all={{ href: shopPath(locale), label: t.all }}
      />
    </>
  )
}
