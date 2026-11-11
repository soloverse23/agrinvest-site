import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Thing, WithContext } from 'schema-dts'

import { schemaFaq } from '@/components/FactText'
import { Faq, PageTitle } from '@/components/PageParts'
import { JsonLd } from '@/components/JsonLd'
import { RenderBlocks } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import { HomeCompany, HomeFinanceTools } from '@/components/HomeCompany'
import { HomeLive } from '@/components/HomeLive'
import { HomeShop } from '@/components/HomeShop'
import { pricesUi } from '@/i18n/prices'
import { cropPricePath, dieselPath, pricesPath } from '@/i18n/routes'
import { toolsUi } from '@/i18n/tools'
import { dieselTicker } from '@/lib/diesel/load'
import { agrinvestRail } from '@/lib/prices/overview'
import { isLocale, localePath, type Locale } from '@/i18n/config'
import { ui } from '@/i18n/ui'
import { getFigures, getSeoDefaults } from '@/lib/content/globals'
import { getPage, pageParams, trailOf } from '@/lib/content/pages'
import { buildMetadata } from '@/lib/seo/metadata'
import { breadcrumbs, faqPage, organization, webPage, website } from '@/lib/schema'

type Props = { params: Promise<{ locale: string; path?: string[] }> }

export const dynamicParams = true

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return (await pageParams())
    .filter((p) => p.locale === params.locale)
    .map((p) => ({ path: p.path }))
}

async function resolve(props: Props) {
  const { locale, path = [] } = await props.params
  if (!isLocale(locale)) return null
  const { isEnabled: draft } = await draftMode()
  const pagePath = `/${path.map(decodeURIComponent).join('/')}`
  const found = await getPage(pagePath, locale, draft)
  return found ? { ...found, locale, pagePath } : null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const found = await resolve(props)
  if (!found) return {}
  const { page, alternates, locale } = found
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: page.title,
    seoTitle: page.seo?.title,
    titleTemplate: seo.titleTemplate,
    siteName: seo.siteName,
    description: page.seo?.description || page.summary || seo.description,
    image: page.seo?.image ?? seo.ogImage,
    noindex: page.seo?.noindex,
    alternates,
  })
}

export default async function CmsPage(props: Props) {
  const found = await resolve(props)
  if (!found) notFound()
  const { page, alternates, locale, pagePath } = found
  const url = localePath(pagePath, locale)
  const crumbs = trailOf(page, locale)
  const heroFirst = page.layout?.[0]?.blockType === 'hero'
  // Home: Agrinvest's published prices on the hero rail; without any, the hero keeps its links.
  const [rail, fuel] =
    page.isHome && heroFirst
      ? await Promise.all([agrinvestRail(locale), dieselTicker(locale)])
      : [null, null]
  const r = pricesUi[locale].rail
  const heroPrices = rail
    ? {
        title: r.title,
        place: r.place,
        unit: 'lei/t',
        date: rail.date,
        all: { href: pricesPath(locale), label: pricesUi[locale].widget.grainLink },
        // Each price opens its own page; diesel rides along (the slider's rail shows it).
        rows: rail.rows.map((row) => ({ ...row, href: cropPricePath(row.slug, locale) })),
        fuel: fuel
          ? { ...fuel, name: toolsUi[locale].today.diesel, href: dieselPath(locale) }
          : null,
      }
    : undefined

  return (
    <SiteShell
      locale={locale}
      alternates={alternates}
      overlay={heroFirst}
      // Home has its own prices (the hero rail and the live panel): no ticker there.
      ticker={!(page.isHome && heroFirst)}
    >
      <PageJsonLd page={page} locale={locale} url={url} crumbs={crumbs} />
      {!heroFirst && (
        <PageTitle
          locale={locale}
          title={page.title}
          summary={page.summary}
          updatedAt={page.updatedAt}
          crumbs={crumbs}
        />
      )}
      {page.isHome && heroFirst ? (
        // Home (Phase 7b): the hero slider, then sections drawn in code: live prices and
        // updates, the shop, financing and tools, the company. The CMS keeps only the hero.
        <>
          <RenderBlocks
            blocks={page.layout?.slice(0, 1)}
            locale={locale}
            path={pagePath}
            heroPrices={heroPrices}
          />
          <div className="mt-12 grid gap-20 md:mt-16 md:gap-28">
            <HomeLive locale={locale} />
            <HomeShop locale={locale} />
            <HomeFinanceTools locale={locale} />
            <HomeCompany locale={locale} />
          </div>
        </>
      ) : (
        <div className={heroFirst ? undefined : 'mt-16 md:mt-24'}>
          <RenderBlocks blocks={page.layout} locale={locale} path={pagePath} />
        </div>
      )}
      <Faq locale={locale} items={page.faq} />
    </SiteShell>
  )
}

async function PageJsonLd({
  page,
  locale,
  url,
  crumbs,
}: {
  page: NonNullable<Awaited<ReturnType<typeof getPage>>>['page']
  locale: Locale
  url: string
  crumbs: { name: string; url: string }[]
}) {
  const figures = await getFigures(locale)
  const data: WithContext<Thing>[] = [
    webPage({
      url,
      name: page.seo?.title || page.title,
      description: page.summary,
      locale,
      dateModified: page.updatedAt,
    }),
  ]
  if (page.isHome) {
    const seo = await getSeoDefaults(locale)
    data.push(
      organization({
        figures,
        legalName: seo.organization?.legalName,
        ifnLegalName: seo.organization?.ifnLegalName,
        sameAs: seo.organization?.sameAs?.map((s) => s.url),
      }),
      website(locale, seo.siteName),
    )
  } else {
    data.push(breadcrumbs(locale, ui[locale].home, crumbs))
  }
  const faq = schemaFaq(page.faq, figures)
  if (faq.length) data.push(faqPage(faq))
  return <JsonLd data={data} />
}
