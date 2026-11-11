import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ReviewNote, SourceList } from '@ds/patterns/Finance'
import { CtaBand, Toc } from '@ds/patterns/Sections'
import { schemaFaq } from '@/components/FactText'
import { FinanceNav } from '@/components/FinanceNav'
import { JsonLd } from '@/components/JsonLd'
import { Faq, PageTitle } from '@/components/PageParts'
import { headingsOf, Prose } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import { financeUi } from '@/i18n/finance'
import { financePath, financeProductPath, financeRoutePath, guidePath } from '@/i18n/routes'
import { ui } from '@/i18n/ui'
import { getFigures, getSeoDefaults } from '@/lib/content/globals'
import { getGuide, guideAlternates, listGuides } from '@/lib/content/finance'
import { formatDate } from '@/lib/format'
import { article, breadcrumbs, definedTermSet, faqPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'
import type { Guide, Person } from '@/payload-types'

/** One guide: `/finantare/ghiduri/{slug}`, `/en/financing/guides/{slug}`. */
export const guideParams = async (locale: Locale) =>
  (await listGuides(locale)).map((g) => ({ slug: g.slug }))

export async function guideMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const guide = await getGuide(slug, locale)
  if (!guide) return {}
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: guide.title,
    seoTitle: guide.seo?.title,
    titleTemplate: seo.titleTemplate,
    siteName: seo.siteName,
    description: guide.seo?.description || guide.summary,
    image: guide.seo?.image ?? seo.ogImage,
    noindex: guide.seo?.noindex,
    alternates: await guideAlternates(guide.id),
  })
}

const named = (p: Guide['author']) => (typeof p === 'object' ? (p as Person | null) : null)
const guidesOf = (list: Guide['relatedGuides']) =>
  (list ?? []).flatMap((g) => (typeof g === 'object' ? [g] : []))

export async function GuidePage({ locale, slug }: { locale: Locale; slug: string }) {
  const guide = await getGuide(slug, locale)
  if (!guide) notFound()
  const t = financeUi[locale]
  const figures = await getFigures(locale)
  const url = guidePath(guide.slug as string, locale)
  const crumbs = [
    { name: t.section, url: financePath(locale) },
    { name: t.guides, url: financeRoutePath('guides', locale) },
    { name: guide.title, url },
  ]
  const author = named(guide.author)
  const reviewer = named(guide.reviewer)
  const related = guidesOf(guide.relatedGuides)
  const products = (guide.relatedProducts ?? []).flatMap((p) => (typeof p === 'object' ? [p] : []))
  const headings = headingsOf(guide.body)
  const terms = guide.terms ?? []
  const faq = schemaFaq(guide.faq, figures)
  const sources = guide.sources ?? []

  return (
    <SiteShell locale={locale} alternates={await guideAlternates(guide.id)}>
      <JsonLd
        data={[
          article({
            url,
            headline: guide.title,
            description: guide.summary,
            locale,
            dateModified: guide.updatedAt,
            datePublished: guide.createdAt,
            authorName: author?.name,
            citations: sources.map((s) => s.url),
          }),
          breadcrumbs(locale, ui[locale].home, crumbs),
          ...(faq.length ? [faqPage(faq)] : []),
          ...(terms.length ? [definedTermSet({ url, name: guide.title, locale, terms })] : []),
        ]}
      />
      <PageTitle
        locale={locale}
        title={guide.title}
        summary={guide.summary}
        updatedAt={guide.updatedAt}
        crumbs={crumbs}
        kicker={t.guides}
      />
      <FinanceNav locale={locale} current="guides" />
      <div className="mx-auto mt-12 grid max-w-page gap-10 px-4 md:mt-16 md:px-8 lg:grid-cols-12">
        <aside className="lg:col-span-3 lg:row-start-1">
          <div className="grid gap-6 lg:sticky lg:top-24">
            <Toc label={t.contents} items={headings} />
            {(author || reviewer) && (
              <dl className="grid gap-2 text-small">
                {author && (
                  <div>
                    <dt className="text-subtle">{t.writtenBy}</dt>
                    <dd className="text-ink">{author.name}</dd>
                  </div>
                )}
                {reviewer && (
                  <div>
                    <dt className="text-subtle">{t.reviewedBy}</dt>
                    <dd className="text-ink">{reviewer.name}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </aside>
        <div className="grid min-w-0 gap-10 lg:col-span-8 lg:col-start-5">
          <ReviewNote title={t.guideNote.title}>{t.guideNote.body}</ReviewNote>
          <Prose data={guide.body} ctx={{ figures, locale }} />
          {terms.length > 0 && (
            <dl className="grid max-w-text gap-5 border-t border-line pt-8">
              {terms.map((term) => (
                <div key={term.term} className="grid gap-1">
                  <dt className="font-semibold text-ink">{term.term}</dt>
                  <dd className="text-muted">{term.definition}</dd>
                </div>
              ))}
            </dl>
          )}
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
      </div>
      <Faq locale={locale} items={guide.faq} />
      {products.length > 0 && (
        <section className="mx-auto mt-16 grid max-w-page gap-4 px-4 md:px-8">
          <h2 className="text-h3 font-semibold text-ink">{t.relatedProducts}</h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {products.map((p) => (
              <li key={p.id} className="rounded-lg bg-raised p-5 ring-1 ring-line">
                <Link
                  href={financeProductPath(
                    p.slug as string,
                    locale,
                    typeof p.parent === 'object' ? p.parent?.slug : null,
                  )}
                  className="font-semibold text-ink"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {related.length > 0 && (
        <section className="mx-auto mt-16 grid max-w-page gap-4 px-4 md:px-8">
          <h2 className="text-h3 font-semibold text-ink">{t.related}</h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {related.map((g) => (
              <li key={g.id} className="rounded-lg bg-raised p-5 ring-1 ring-line">
                <Link href={guidePath(g.slug as string, locale)} className="font-semibold text-ink">
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="mx-auto mt-16 grid max-w-page gap-4 px-4 md:mt-20 md:px-8">
        <CtaBand
          kicker={t.tools.kicker}
          title={t.tools.title}
          body={t.tools.body}
          primary={{ href: financeRoutePath('apply', locale), label: t.tools.apply }}
          secondary={{ href: financeRoutePath('simulator', locale), label: t.tools.simulate }}
        />
        <p className="text-small">
          <Link
            href={financeRoutePath('guides', locale)}
            className="text-accent underline underline-offset-2"
          >
            {t.page.allGuides}
          </Link>
        </p>
      </div>
    </SiteShell>
  )
}
