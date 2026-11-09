import { localePath } from '@/i18n/config'
import {
  basePath,
  categoryPath,
  cropPath,
  financeProductPath,
  financeRoutePath,
  financeRoutes,
  guidePath,
  productPath,
} from '@/i18n/routes'
import { getFinancePage, listFinanceProducts, listGuides } from '@/lib/content/finance'
import { getSeoDefaults } from '@/lib/content/globals'
import { listBases, listCrops } from '@/lib/content/locations'
import { payloadClient } from '@/lib/content/payload'
import { listCategories, listProducts } from '@/lib/content/shop'
import { absoluteUrl } from '@/lib/site'

export const revalidate = 3600

/**
 * `llms.txt`: a plain index of the site for language-model tools. A help, not a substitute
 * for crawlable pages and sitemaps; built from the same published content.
 */
export async function GET() {
  const payload = await payloadClient()
  const [seoRo, seoEn, bases, cropsRo, cropsEn, categoriesRo, categoriesEn, products] =
    await Promise.all([
      getSeoDefaults('ro'),
      getSeoDefaults('en'),
      listBases('ro'),
      listCrops('ro'),
      listCrops('en'),
      listCategories('ro'),
      listCategories('en'),
      listProducts('ro'),
    ])
  const section = async (locale: 'ro' | 'en') => {
    const { docs } = await payload.find({
      collection: 'pages',
      locale,
      depth: 0,
      limit: 500,
      pagination: false,
      overrideAccess: false,
      where: { languages: { contains: locale }, 'seo.noindex': { not_equals: true } },
      select: { title: true, path: true, summary: true },
      sort: 'path',
    })
    return docs
      .filter((d) => d.path)
      .map(
        (d) =>
          `- [${d.title}](${absoluteUrl(localePath(d.path as string, locale))})${d.summary ? `: ${d.summary}` : ''}`,
      )
  }
  const [ro, en, guidesRo, guidesEn, productsRo, productsEn] = await Promise.all([
    section('ro'),
    section('en'),
    listGuides('ro'),
    listGuides('en'),
    listFinanceProducts('ro'),
    listFinanceProducts('en'),
  ])
  /** The finance tools: their text pages, when published. */
  const tools = async (locale: 'ro' | 'en') =>
    (
      await Promise.all(
        (['simulator', 'apply'] as const).map(async (route) => {
          const page = await getFinancePage(financeRoutes[route][locale], locale)
          return page
            ? [
                `- [${page.title}](${absoluteUrl(financeRoutePath(route, locale))}): ${page.summary}`,
              ]
            : []
        }),
      )
    ).flat()
  const [toolsRo, toolsEn] = await Promise.all([tools('ro'), tools('en')])
  const productLine = (locale: 'ro' | 'en') => (p: (typeof productsRo)[number]) =>
    `- [${p.title}](${absoluteUrl(financeProductPath(p.slug, locale, p.parentSlug))})`
  const guideLine = (locale: 'ro' | 'en') => (g: (typeof guidesRo)[number]) =>
    `- [${g.title}](${absoluteUrl(guidePath(g.slug, locale))}): ${g.summary}`

  const body = [
    `# ${seoRo.siteName}`,
    '',
    `> ${seoRo.description ?? ''}`,
    '',
    `${seoEn.description ?? ''}`,
    '',
    '## Pagini (română)',
    ...ro,
    '',
    '## Pages (English)',
    ...en,
    '',
    '## Credite (Agrinvest Credit IFN)',
    ...productsRo.map(productLine('ro')),
    ...toolsRo,
    '',
    '## Credit products (Agrinvest Credit IFN)',
    ...productsEn.map(productLine('en')),
    ...toolsEn,
    '',
    '## Ghiduri de finanțare',
    ...guidesRo.map(guideLine('ro')),
    '',
    '## Financing guides',
    ...guidesEn.map(guideLine('en')),
    '',
    '## Baze de depozitare · Storage bases',
    ...bases.map(
      (b) =>
        `- [Baza ${b.name}](${absoluteUrl(basePath(b.slug, 'ro'))}) · [${b.name} base](${absoluteUrl(basePath(b.slug, 'en'))})`,
    ),
    '',
    '## Cereale · Grain',
    ...cropsRo.map((c) => {
      const en = cropsEn.find((e) => e.id === c.id)
      return `- [${c.name}](${absoluteUrl(cropPath(c.slug, 'ro'))})${en ? ` · [${en.name}](${absoluteUrl(cropPath(en.slug, 'en'))})` : ''}`
    }),
    '',
    '## Magazin · Shop',
    ...categoriesRo.map((c) => {
      const en = categoriesEn.find((e) => e.id === c.id)
      return `- [${c.name}](${absoluteUrl(categoryPath(c.slug, 'ro'))})${en ? ` · [${en.name}](${absoluteUrl(categoryPath(en.slug, 'en'))})` : ''}`
    }),
    '',
    '## Produse · Products',
    ...products.map(
      (p) => `- [${p.name}](${absoluteUrl(productPath(p.category.slug, p.slug, 'ro'))})`,
    ),
    '',
  ].join('\n')

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
