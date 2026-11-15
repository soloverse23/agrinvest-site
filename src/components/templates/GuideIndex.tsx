import type { Metadata } from 'next'

import { ArrowRightIcon } from '@ds/icons/icons'
import { ConsultantBand, ConsultantButton, LibraryCards } from '@ds/patterns/FinanceGuide'
import { SectionHeading } from '@ds/patterns/Sections'
import { FinanceConsultant } from '@/components/FinanceConsultant'
import { FinanceNav } from '@/components/FinanceNav'
import { JsonLd } from '@/components/JsonLd'
import { PageTitle } from '@/components/PageParts'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import { financeUi } from '@/i18n/finance'
import { financeGuideUi } from '@/i18n/finance-guide'
import { financePath, financeRoutePath, financeRoutes, guidePath } from '@/i18n/routes'
import { ui } from '@/i18n/ui'
import { getFinancePage, listGuides } from '@/lib/content/finance'
import { getSeoDefaults } from '@/lib/content/globals'
import { byGuideJourney } from '@/lib/finance/groups'
import { breadcrumbs, itemList, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'

/**
 * The finance library (`/finantare/ghiduri`, `/en/financing/guides`), Phase 7g: the long
 * guides in the order a farmer meets the questions, then the reference pages (glossary, about
 * the IFN). The guide pages guide; this page is where the detail lives.
 */
const alternates = {
  ro: financeRoutePath('guides', 'ro'),
  en: financeRoutePath('guides', 'en'),
}

/** The glossary is reference, not a guide: it sits with "about the IFN". */
const glossaryKey = { ro: 'glosar', en: 'glossary' }

export async function guideIndexMetadata(locale: Locale): Promise<Metadata> {
  const t = financeGuideUi[locale].library
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: t.title,
    seoTitle: t.seoTitle,
    titleTemplate: seo.titleTemplate,
    siteName: seo.siteName,
    description: t.summary,
    image: seo.ogImage,
    alternates,
  })
}

export async function GuideIndex({ locale }: { locale: Locale }) {
  const g = financeGuideUi[locale]
  const t = g.library
  const [all, about] = await Promise.all([
    listGuides(locale),
    getFinancePage(financeRoutes.about[locale], locale),
  ])
  const guides = byGuideJourney(all.filter((x) => x.slug !== glossaryKey[locale]))
  const glossary = all.find((x) => x.slug === glossaryKey[locale])
  const url = financeRoutePath('guides', locale)
  const crumbs = [
    { name: financeUi[locale].section, url: financePath(locale) },
    { name: g.nav.library, url },
  ]
  const reference = [
    ...(about
      ? [
          {
            href: financeRoutePath('about', locale),
            title: about.title,
            summary: t.about,
            tag: t.aboutTag,
          },
        ]
      : []),
    ...(glossary
      ? [
          {
            href: guidePath(glossary.slug, locale),
            title: glossary.title,
            summary: glossary.summary,
            tag: t.glossaryTag,
          },
        ]
      : []),
  ]
  const apply = financeRoutePath('apply', locale)

  return (
    <SiteShell locale={locale} alternates={alternates}>
      <JsonLd
        data={[
          webPage({ url, name: t.seoTitle, description: t.summary, locale }),
          breadcrumbs(locale, ui[locale].home, crumbs),
          itemList(all.map((x) => ({ name: x.title, url: guidePath(x.slug, locale) }))),
        ]}
      />
      <PageTitle locale={locale} title={t.title} summary={t.summary} crumbs={crumbs} />
      <FinanceNav locale={locale} current="library" />
      <div className="mx-auto mt-12 grid max-w-page gap-16 px-4 md:mt-16 md:gap-20 md:px-8">
        <section className="grid gap-6">
          <SectionHeading title={t.guides} />
          <LibraryCards
            items={guides.map((x) => ({
              href: guidePath(x.slug, locale),
              title: x.title,
              summary: x.summary,
              tag: t.guideTag,
            }))}
          />
        </section>
        {reference.length > 0 && (
          <section className="grid gap-6">
            <SectionHeading title={t.reference} />
            <LibraryCards items={reference} />
          </section>
        )}
        <ConsultantBand
          kicker={g.credit.kicker}
          title={g.hub.bandTitle}
          body={g.hub.bandBody}
          action={
            <ConsultantButton href={apply} variant="lime" icon={<ArrowRightIcon />}>
              {g.consultant}
            </ConsultantButton>
          }
          secondary={{ href: financeRoutePath('questions', locale), label: g.hub.questionsAll }}
        />
      </div>
      <FinanceConsultant locale={locale} sourcePath={url} />
    </SiteShell>
  )
}
