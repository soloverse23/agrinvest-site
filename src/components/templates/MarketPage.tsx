import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { SourceList } from '@ds/patterns/Finance'
import { SectionHeading } from '@ds/patterns/Sections'
import { GrainPrices } from '@ds/patterns/widgets/GrainPrices'
import { JsonLd } from '@/components/JsonLd'
import { ToolLinks } from '@/components/ToolLinks'
import { PageTitle } from '@/components/PageParts'
import { Prose } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import { financeUi } from '@/i18n/finance'
import { pricesUi } from '@/i18n/prices'
import { marketNotePath, marketPath, pricesPath } from '@/i18n/routes'
import { ui } from '@/i18n/ui'
import { getFigures, getSeoDefaults } from '@/lib/content/globals'
import { getMarketNote, listMarketNotes, marketNoteAlternates } from '@/lib/content/market'
import type { Alternates } from '@/lib/content/pages'
import { formatDate } from '@/lib/format'
import { article, breadcrumbs, itemList, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'
import type { Person } from '@/payload-types'

import { grainPricesProps } from './PricePage'

/**
 * Weekly market notes: `/piata` and `/piata/{slug}`, `/en/market` and `/en/market/{slug}`.
 * Notes are `Guides` with section `piata`; the `draftMarketNote` job writes each week's draft
 * from the series and staff publish it.
 */
export const marketAlternates: Alternates = { ro: marketPath('ro'), en: marketPath('en') }

export async function marketMetadata(locale: Locale): Promise<Metadata> {
  const t = pricesUi[locale].market
  const [seo, notes] = await Promise.all([getSeoDefaults(locale), listMarketNotes(locale)])
  return buildMetadata({
    locale,
    title: t.title,
    seoTitle: t.seoTitle,
    siteName: seo.siteName,
    description: t.description,
    image: seo.ogImage,
    alternates: marketAlternates,
    // Nothing to read until the first note is published.
    noindex: !notes.length,
  })
}

export async function MarketIndexPage({ locale }: { locale: Locale }) {
  const p = pricesUi[locale]
  const t = p.market
  const url = marketPath(locale)
  const [notes, { props }] = await Promise.all([listMarketNotes(locale), grainPricesProps(locale)])
  const crumbs = [
    { name: p.section, url: pricesPath(locale) },
    { name: t.title, url },
  ]
  const [latest, ...older] = notes
  return (
    <SiteShell locale={locale} alternates={marketAlternates}>
      <JsonLd
        data={[
          webPage({ url, name: t.seoTitle, description: t.description, locale }),
          breadcrumbs(locale, ui[locale].home, crumbs),
          ...(notes.length
            ? [itemList(notes.map((n) => ({ name: n.title, url: marketNotePath(n.slug, locale) })))]
            : []),
        ]}
      />
      <PageTitle
        locale={locale}
        title={t.title}
        summary={t.summary}
        crumbs={crumbs}
        kicker={p.section}
      />
      <div className="mx-auto mt-12 grid max-w-page gap-10 px-4 md:mt-16 md:px-8 lg:grid-cols-12">
        <div className="grid content-start gap-8 lg:col-span-7">
          {latest ? (
            <section className="grid gap-3 rounded-lg bg-raised p-6 shadow-soft ring-1 ring-line">
              <p className="text-small font-medium text-accent">{t.latest}</p>
              <h2 className="text-h3 font-semibold">
                <Link href={marketNotePath(latest.slug, locale)} className="text-ink">
                  {latest.title}
                </Link>
              </h2>
              <p className="text-body text-muted">{latest.summary}</p>
            </section>
          ) : (
            <p className="text-body text-muted">{t.empty}</p>
          )}
          {older.length > 0 && (
            <section className="grid gap-4">
              <SectionHeading title={t.older} />
              <ul className="grid gap-3">
                {older.map((n) => (
                  <li key={n.id} className="grid gap-1">
                    <Link href={marketNotePath(n.slug, locale)} className="font-semibold text-ink">
                      {n.title}
                    </Link>
                    <span className="text-small text-muted">
                      {formatDate(new Date(n.date), locale)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <div className="lg:col-span-5">
          <GrainPrices {...props} level={2} />
        </div>
      </div>
      <ToolLinks locale={locale} current={url} />
    </SiteShell>
  )
}

export const marketNoteParams = async (locale: Locale) =>
  (await listMarketNotes(locale)).map((n) => ({ slug: n.slug }))

export async function marketNoteMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const note = await getMarketNote(slug, locale)
  if (!note) return {}
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: note.title,
    seoTitle: note.seo?.title,
    titleTemplate: seo.titleTemplate,
    siteName: seo.siteName,
    description: note.seo?.description || note.summary,
    image: note.seo?.image ?? seo.ogImage,
    noindex: note.seo?.noindex,
    alternates: await marketNoteAlternates(note.id),
    type: 'article',
  })
}

export async function MarketNotePage({ locale, slug }: { locale: Locale; slug: string }) {
  const note = await getMarketNote(slug, locale)
  if (!note) notFound()
  const p = pricesUi[locale]
  const f = financeUi[locale]
  const url = marketNotePath(note.slug as string, locale)
  const [figures, alternates] = await Promise.all([
    getFigures(locale),
    marketNoteAlternates(note.id),
  ])
  const crumbs = [
    { name: p.section, url: pricesPath(locale) },
    { name: p.market.title, url: marketPath(locale) },
    { name: note.title, url },
  ]
  const author = typeof note.author === 'object' ? (note.author as Person | null) : null
  const sources = note.sources ?? []
  return (
    <SiteShell locale={locale} alternates={alternates}>
      <JsonLd
        data={[
          article({
            url,
            headline: note.title,
            description: note.summary,
            locale,
            dateModified: note.updatedAt,
            datePublished: note.createdAt,
            authorName: author?.name,
            citations: sources.map((s) => s.url),
          }),
          breadcrumbs(locale, ui[locale].home, crumbs),
        ]}
      />
      <PageTitle
        locale={locale}
        title={note.title}
        summary={note.summary}
        updatedAt={note.updatedAt}
        crumbs={crumbs}
        kicker={p.market.title}
      />
      <div className="mx-auto mt-12 grid max-w-page gap-10 px-4 md:mt-16 md:px-8">
        <Prose data={note.body} ctx={{ figures, locale }} />
        <p>
          <Link href={pricesPath(locale)} className="font-semibold text-accent">
            {p.market.prices}
          </Link>
        </p>
        <div className="max-w-text">
          <SourceList
            title={f.sources}
            retrieved={f.retrieved}
            items={sources.map((s) => ({
              title: s.title,
              url: s.url,
              date: formatDate(new Date(s.retrieved), locale),
            }))}
          />
        </div>
      </div>
      <ToolLinks locale={locale} current={url} />
    </SiteShell>
  )
}
