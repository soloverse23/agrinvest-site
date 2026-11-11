import { locales, type Locale } from '@/i18n/config'
import { categoryPath, hubPath } from '@/i18n/routes'
import {
  listBrands,
  listCategories,
  listIngredients,
  listProducts,
  listShopCrops,
} from '@/lib/content/shop'
import { cardLine } from '@/components/templates/ShopParts'

export const revalidate = 3600

/**
 * The shop search's suggestion index: `/shop-index.json?l=ro`. Small on purpose (about 10 KB),
 * fetched once on the first focus of the landing search. Products carry name, path, brand and
 * a short line; the other terms carry their hub and how many products they hold.
 */
export async function GET(request: Request) {
  const asked = new URL(request.url).searchParams.get('l')
  const locale: Locale = (locales as readonly string[]).includes(asked ?? '')
    ? (asked as Locale)
    : 'ro'
  const [products, crops, brands, ingredients, categories] = await Promise.all([
    listProducts(locale),
    listShopCrops(locale),
    listBrands(locale),
    listIngredients(locale),
    listCategories(locale),
  ])
  const count = (test: (p: (typeof products)[number]) => boolean) => products.filter(test).length
  const t: [string, string, string, number][] = [
    ...categories
      .filter((c) => c.slug && c.name)
      .map((c): [string, string, string, number] => [
        'k',
        c.name,
        c.slug as string,
        count((p) => p.category.id === c.id || p.category.parent === c.id),
      ]),
    ...crops.map((c): [string, string, string, number] => [
      'c',
      c.name,
      c.slug,
      count((p) => p.crops.some((x) => x.id === c.id)),
    ]),
    ...brands.map((b): [string, string, string, number] => [
      'b',
      b.name,
      b.slug,
      count((p) => p.brand?.id === b.id),
    ]),
    ...ingredients.map((i): [string, string, string, number] => [
      'i',
      i.name,
      i.slug,
      count((p) => p.ingredients.some((x) => x.id === i.id)),
    ]),
  ]
  const body = {
    h: {
      p: categoryPath('', locale),
      k: categoryPath('', locale),
      c: hubPath('crop', '', locale),
      b: hubPath('brand', '', locale),
      i: hubPath('ingredient', '', locale),
    },
    p: products.map((p) => [
      p.name,
      `${p.category.slug}/${p.slug}`,
      p.brand?.name ?? '',
      (cardLine(p, locale) ?? '').slice(0, 36),
    ]),
    t: t.filter((x) => x[3] > 0),
  }
  return Response.json(body, {
    headers: {
      'cache-control': 'public, max-age=3600',
      'x-robots-tag': 'noindex',
    },
  })
}
