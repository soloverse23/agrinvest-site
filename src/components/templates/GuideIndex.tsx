import type { Metadata } from 'next'
import Link from 'next/link'

import { FinanceNav } from '@/components/FinanceNav'
import { JsonLd } from '@/components/JsonLd'
import { PageTitle } from '@/components/PageParts'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import { financeUi } from '@/i18n/finance'
import { financePath, financeRoutePath, guidePath } from '@/i18n/routes'
import { ui } from '@/i18n/ui'
import { getSeoDefaults } from '@/lib/content/globals'
import { listGuides } from '@/lib/content/finance'
import { byGuideJourney } from '@/lib/finance/groups'
import { breadcrumbs, itemList, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'

/** All guides: `/finantare/ghiduri`, `/en/financing/guides`. */
const alternates = {
  ro: financeRoutePath('guides', 'ro'),
  en: financeRoutePath('guides', 'en'),
}

export async function guideIndexMetadata(locale: Locale): Promise<Metadata> {
  const t = financeUi[locale]
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: t.guidesTitle,
    seoTitle: t.guidesSeoTitle,
    titleTemplate: seo.titleTemplate,
    siteName: seo.siteName,
    description: t.guidesSummary,
    image: seo.ogImage,
    alternates,
  })
}

export async function GuideIndex({ locale }: { locale: Locale }) {
  const t = financeUi[locale]
  const guides = byGuideJourney(await listGuides(locale))
  const url = financeRoutePath('guides', locale)
  const crumbs = [
    { name: t.section, url: financePath(locale) },
    { name: t.guides, url },
  ]
  return (
    <SiteShell locale={locale} alternates={alternates}>
      <JsonLd
        data={[
          webPage({ url, name: t.guidesTitle, description: t.guidesSummary, locale }),
          breadcrumbs(locale, ui[locale].home, crumbs),
          itemList(guides.map((g) => ({ name: g.title, url: guidePath(g.slug, locale) }))),
        ]}
      />
      <PageTitle locale={locale} title={t.guidesTitle} summary={t.guidesSummary} crumbs={crumbs} />
      <FinanceNav locale={locale} current="guides" />
      <ul className="mx-auto mt-12 grid max-w-page gap-4 px-4 md:mt-16 md:grid-cols-2 md:px-8">
        {guides.map((g) => (
          <li key={g.id} className="grid gap-2 rounded-lg bg-raised p-6 ring-1 ring-line">
            <h2 className="text-h4 font-semibold">
              <Link href={guidePath(g.slug, locale)} className="text-ink">
                {g.title}
              </Link>
            </h2>
            <p className="text-small text-muted">{g.summary}</p>
          </li>
        ))}
      </ul>
    </SiteShell>
  )
}
