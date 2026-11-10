import type { Locale } from '@/i18n/config'
import {
  basePath,
  categoryPath,
  cropPath,
  cropPricePath,
  dieselPath,
  fertiliserPricesPath,
  newsPath,
  marketPath,
  netPricePath,
  pricesPath,
  financeRoutePath,
  financeRoutes,
  hubPath,
  productPath,
  shopPath,
} from '@/i18n/routes'
import {
  allGuideAlternates,
  allProductAlternates,
  getFinancePage,
  listGuides,
} from '@/lib/content/finance'
import { listBases, listCrops } from '@/lib/content/locations'
import { allMarketNoteAlternates, listMarketNotes } from '@/lib/content/market'
import { listHeadlines } from '@/lib/news/load'
import { alternatesOf, listPages, type Alternates } from '@/lib/content/pages'
import {
  hubIndexable,
  inCategory,
  listBrands,
  listCategories,
  listIngredients,
  listProducts,
  listShopCrops,
} from '@/lib/content/shop'
import { absoluteUrl } from '@/lib/site'

/**
 * Segmented sitemaps. Later phases add segments (products, articles…) here.
 * Every URL carries its hreflang alternates when it has a pair.
 */
export type SitemapEntry = { url: string; lastModified?: string; alternates: Alternates }

const entries = (alternates: Alternates, lastModified?: string): SitemapEntry[] =>
  Object.values(alternates).map((url) => ({ url, lastModified, alternates }))

export const segments = {
  pages: async (): Promise<SitemapEntry[]> =>
    (await listPages())
      .filter((p) => !p.noindex)
      .flatMap((p) => {
        const alternates = alternatesOf(p)
        return Object.values(alternates).map((url) => ({
          url,
          lastModified: p.updatedAt,
          alternates,
        }))
      }),
  // Bases and crops exist in both languages (the base slug is shared, crop slugs are not).
  bases: async (): Promise<SitemapEntry[]> =>
    (await listBases('ro'))
      .filter((b) => !b.seo?.noindex)
      .flatMap((b) => {
        const alternates = { ro: basePath(b.slug, 'ro'), en: basePath(b.slug, 'en') }
        return Object.values(alternates).map((url) => ({
          url,
          lastModified: b.updatedAt,
          alternates,
        }))
      }),
  crops: async (): Promise<SitemapEntry[]> => {
    const [ro, en] = await Promise.all([listCrops('ro'), listCrops('en')])
    return ro
      .filter((c) => !c.seo?.noindex)
      .flatMap((c) => {
        const other = en.find((e) => e.id === c.id)
        const alternates: Alternates = {
          ro: cropPath(c.slug, 'ro'),
          ...(other ? { en: cropPath(other.slug, 'en') } : {}),
        }
        return Object.values(alternates).map((url) => ({
          url,
          lastModified: c.updatedAt,
          alternates,
        }))
      })
  },
  finance: async (): Promise<SitemapEntry[]> => {
    const [guides, list, products, about, faq, simulator, apply] = await Promise.all([
      allGuideAlternates(),
      listGuides('ro'),
      allProductAlternates(),
      getFinancePage(financeRoutes.about.ro, 'ro'),
      getFinancePage(financeRoutes.faq.ro, 'ro'),
      getFinancePage(financeRoutes.simulator.ro, 'ro'),
      getFinancePage(financeRoutes.apply.ro, 'ro'),
    ])
    const routeAlternates = (route: 'about' | 'faq' | 'simulator' | 'apply') => ({
      ro: financeRoutePath(route, 'ro'),
      en: financeRoutePath(route, 'en'),
    })
    const index = { ro: financeRoutePath('guides', 'ro'), en: financeRoutePath('guides', 'en') }
    return [
      ...(list.length ? entries(index) : []),
      ...guides.flatMap((alternates) => entries(alternates)),
      ...products.flatMap((alternates) => entries(alternates)),
      ...(about ? entries(routeAlternates('about')) : []),
      ...(faq ? entries(routeAlternates('faq')) : []),
      ...(simulator ? entries(routeAlternates('simulator')) : []),
      ...(apply ? entries(routeAlternates('apply')) : []),
    ]
  },
  // Prices and tools (Phase 5): grain hub and crops, calculator, fertilisers, diesel, news, notes.
  prices: async (): Promise<SitemapEntry[]> => {
    const [ro, en, notes, noteList, headlines] = await Promise.all([
      listCrops('ro'),
      listCrops('en'),
      allMarketNoteAlternates(),
      listMarketNotes('ro'),
      listHeadlines(1),
    ])
    return [
      ...entries({ ro: pricesPath('ro'), en: pricesPath('en') }),
      ...ro.flatMap((c) => {
        const twin = en.find((e) => e.id === c.id)
        return entries({
          ro: cropPricePath(c.slug as string, 'ro'),
          ...(twin ? { en: cropPricePath(twin.slug as string, 'en') } : {}),
        })
      }),
      ...entries({ ro: netPricePath('ro'), en: netPricePath('en') }),
      ...entries({ ro: fertiliserPricesPath('ro'), en: fertiliserPricesPath('en') }),
      ...entries({ ro: dieselPath('ro'), en: dieselPath('en') }),
      ...(headlines.length ? entries({ ro: newsPath('ro'), en: newsPath('en') }) : []),
      ...(noteList.length ? entries({ ro: marketPath('ro'), en: marketPath('en') }) : []),
      ...notes.flatMap((alternates) => entries(alternates)),
    ]
  },
  // Products share their slug across languages; their category slug is translated.
  products: async (): Promise<SitemapEntry[]> => {
    const [ro, en] = await Promise.all([listProducts('ro'), listProducts('en')])
    return ro.flatMap((p) => {
      const twin = en.find((e) => e.id === p.id)
      const alternates: Alternates = {
        ro: productPath(p.category.slug, p.slug, 'ro'),
        ...(twin ? { en: productPath(twin.category.slug, p.slug, 'en') } : {}),
      }
      return entries(alternates, p.updatedAt)
    })
  },
  // A listing is listed only when the hub rule allows indexing it.
  categories: async (): Promise<SitemapEntry[]> => {
    const [ro, en, products] = await Promise.all([
      listCategories('ro'),
      listCategories('en'),
      listProducts('ro'),
    ])
    const home = { ro: shopPath('ro'), en: shopPath('en') }
    return [
      ...entries(home),
      ...ro
        .filter((c) => hubIndexable(c, inCategory(products, c).length))
        .flatMap((c) => {
          const twin = en.find((e) => e.id === c.id)
          return entries(
            {
              ro: categoryPath(c.slug, 'ro'),
              ...(twin ? { en: categoryPath(twin.slug, 'en') } : {}),
            },
            c.updatedAt,
          )
        }),
    ]
  },
  hubs: async (): Promise<SitemapEntry[]> => {
    const [products, cropsRo, cropsEn, brands, ingredientsRo, ingredientsEn] = await Promise.all([
      listProducts('ro'),
      listShopCrops('ro'),
      listShopCrops('en'),
      listBrands('ro'),
      listIngredients('ro'),
      listIngredients('en'),
    ])
    const count = (test: (p: (typeof products)[number]) => boolean) => products.filter(test).length
    return [
      ...cropsRo.flatMap((c) => {
        if (
          !hubIndexable(
            c.shop ?? {},
            count((p) => p.crops.some((x) => x.id === c.id)),
          )
        )
          return []
        const twin = cropsEn.find((e) => e.id === c.id)
        return entries(
          {
            ro: hubPath('crop', c.slug, 'ro'),
            ...(twin ? { en: hubPath('crop', twin.slug, 'en') } : {}),
          },
          c.updatedAt,
        )
      }),
      ...brands.flatMap((b) =>
        hubIndexable(
          b,
          count((p) => p.brand?.id === b.id),
        )
          ? entries(
              { ro: hubPath('brand', b.slug, 'ro'), en: hubPath('brand', b.slug, 'en') },
              b.updatedAt,
            )
          : [],
      ),
      ...ingredientsRo.flatMap((i) => {
        if (
          !hubIndexable(
            i,
            count((p) => p.ingredients.some((x) => x.id === i.id)),
          )
        )
          return []
        const twin = ingredientsEn.find((e) => e.id === i.id)
        return entries(
          {
            ro: hubPath('ingredient', i.slug, 'ro'),
            ...(twin ? { en: hubPath('ingredient', twin.slug, 'en') } : {}),
          },
          i.updatedAt,
        )
      }),
    ]
  },
} satisfies Record<string, () => Promise<SitemapEntry[]>>

export type SegmentName = keyof typeof segments
export const isSegment = (name: string): name is SegmentName => name in segments

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function urlsetXml(entries: SitemapEntry[]): string {
  const urls = entries.map((e) => {
    const pairs = Object.entries(e.alternates) as [Locale, string][]
    const links =
      pairs.length > 1
        ? [
            ...pairs.map(
              ([l, href]) =>
                `<xhtml:link rel="alternate" hreflang="${l}" href="${escape(absoluteUrl(href))}"/>`,
            ),
            ...(e.alternates.ro
              ? [
                  `<xhtml:link rel="alternate" hreflang="x-default" href="${escape(absoluteUrl(e.alternates.ro))}"/>`,
                ]
              : []),
          ]
        : []
    return [
      '<url>',
      `<loc>${escape(absoluteUrl(e.url))}</loc>`,
      e.lastModified ? `<lastmod>${e.lastModified.slice(0, 10)}</lastmod>` : '',
      ...links,
      '</url>',
    ].join('')
  })
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
}

export function indexXml(names: string[]): string {
  const items = names.map(
    (n) => `<sitemap><loc>${escape(absoluteUrl(`/sitemaps/${n}.xml`))}</loc></sitemap>`,
  )
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join('\n')}\n</sitemapindex>\n`
}

export const xmlResponse = (body: string) =>
  new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
