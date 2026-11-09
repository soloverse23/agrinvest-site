import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ReviewNote, SourceList } from '@ds/patterns/Finance'
import { schemaFaq } from '@/components/FactText'
import { JsonLd } from '@/components/JsonLd'
import { Faq, PageTitle } from '@/components/PageParts'
import { Prose } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import { financeUi } from '@/i18n/finance'
import { financePath, financeRoutePath, financeRoutes } from '@/i18n/routes'
import { ui } from '@/i18n/ui'
import { getFinancePage } from '@/lib/content/finance'
import { getFigures, getSeoDefaults } from '@/lib/content/globals'
import { formatDate } from '@/lib/format'
import { breadcrumbs, faqPage, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'

/** Fixed pages of the finance section, kept in Guides: about the IFN and the FAQ. */
type Route = 'about' | 'faq'
/** The tools have their text in Guides too (`FinanceToolPage`). */
type TextRoute = Route | 'simulator' | 'apply'

export const alternatesOf = (route: TextRoute) => ({
  ro: financeRoutePath(route, 'ro'),
  en: financeRoutePath(route, 'en'),
})

/** `noindex` for a URL with parameters; the canonical stays the clean page. */
export async function financeFixedMetadata(
  locale: Locale,
  route: TextRoute,
  noindex = false,
): Promise<Metadata> {
  const page = await getFinancePage(financeRoutes[route][locale], locale)
  if (!page) return {}
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: page.title,
    seoTitle: page.seo?.title,
    titleTemplate: seo.titleTemplate,
    siteName: seo.siteName,
    description: page.seo?.description || page.summary,
    image: seo.ogImage,
    alternates: alternatesOf(route),
    noindex,
  })
}

export async function FinanceFixedPage({ locale, route }: { locale: Locale; route: Route }) {
  const page = await getFinancePage(financeRoutes[route][locale], locale)
  if (!page) notFound()
  const t = financeUi[locale]
  const figures = await getFigures(locale)
  const url = financeRoutePath(route, locale)
  const crumbs = [
    { name: t.section, url: financePath(locale) },
    { name: page.title, url },
  ]
  const faq = schemaFaq(page.faq, figures)
  const sources = page.sources ?? []
  return (
    <SiteShell locale={locale} alternates={alternatesOf(route)}>
      <JsonLd
        data={[
          webPage({
            url,
            name: page.seo?.title || page.title,
            description: page.summary,
            locale,
            dateModified: page.updatedAt,
          }),
          breadcrumbs(locale, ui[locale].home, crumbs),
          ...(faq.length ? [faqPage(faq)] : []),
        ]}
      />
      <PageTitle
        locale={locale}
        title={page.title}
        summary={page.summary}
        updatedAt={page.updatedAt}
        crumbs={crumbs}
        kicker={t.section}
      />
      <div className="mx-auto mt-12 grid max-w-page gap-10 px-4 md:mt-16 md:px-8">
        {page.review?.legalStatus !== 'legal-approved' && (
          <div className="max-w-text">
            <ReviewNote title={t.reviewNote.title}>{t.reviewNote.body}</ReviewNote>
          </div>
        )}
        <Prose data={page.body} ctx={{ figures, locale }} />
      </div>
      <Faq locale={locale} items={page.faq} />
      {sources.length > 0 && (
        <div className="mx-auto mt-16 max-w-page px-4 md:px-8">
          <SourceList
            title={t.sources}
            lead={t.sourcesLead}
            retrieved={t.retrieved}
            items={sources.map((s) => ({
              title: s.title,
              url: s.url,
              date: formatDate(new Date(s.retrieved), locale),
            }))}
          />
        </div>
      )}
    </SiteShell>
  )
}
