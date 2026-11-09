import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import {
  GuaranteeTable,
  RepaymentCalendar,
  ReviewNote,
  SourceList,
  WorkedExample,
} from '@ds/patterns/Finance'
import { CtaBand, SectionHeading, Steps } from '@ds/patterns/Sections'
import { FactText, resolveFacts, schemaFaq } from '@/components/FactText'
import { JsonLd } from '@/components/JsonLd'
import { Faq, PageTitle } from '@/components/PageParts'
import { Prose } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import { financeUi } from '@/i18n/finance'
import { financePath, financeProductPath, financeRoutePath, guidePath } from '@/i18n/routes'
import { fixedUrl, ui } from '@/i18n/ui'
import { getFigures, getSeoDefaults } from '@/lib/content/globals'
import { getFinanceProduct, listFinanceProducts, productAlternates } from '@/lib/content/finance'
import { calendarRows } from '@/lib/finance/calendar'
import { guaranteeLabels } from '@/lib/finance/options'
import { formatDate } from '@/lib/format'
import { breadcrumbs, faqPage, loanOrCredit, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'
import type { FinanceProduct } from '@/payload-types'

/**
 * One credit product: `/finantare/{slug}`, `/finantare/credit-investitii/{slug}` and the English
 * twins (route files in `src/app/(frontend)/[locale]/{finantare,financing}`). The sections are
 * fields, so every product answers the same questions.
 */
const parentOf = (p: FinanceProduct) => (typeof p.parent === 'object' ? p.parent : null)

async function resolve(locale: Locale, slug: string, parentSlug?: string) {
  const product = await getFinanceProduct(slug, locale)
  if (!product) return null
  const parent = parentOf(product)
  // A nested page lives only under its parent, and a top-level page only at the top.
  if ((parent?.slug ?? undefined) !== parentSlug) return null
  return { product, parent }
}

export const topProductParams = async (locale: Locale) =>
  (await listFinanceProducts(locale)).filter((p) => !p.parentSlug).map((p) => ({ product: p.slug }))

export const childProductParams = async (locale: Locale) =>
  (await listFinanceProducts(locale))
    .filter((p) => p.parentSlug)
    .map((p) => ({ product: p.parentSlug as string, child: p.slug }))

export async function financeProductMetadata(
  locale: Locale,
  slug: string,
  parentSlug?: string,
): Promise<Metadata> {
  const found = await resolve(locale, slug, parentSlug)
  if (!found) return {}
  const { product } = found
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: product.title,
    seoTitle: product.seo?.title,
    titleTemplate: seo.titleTemplate,
    siteName: seo.siteName,
    description: product.seo?.description ?? '',
    image: product.seo?.image ?? seo.ogImage,
    noindex: product.seo?.noindex,
    alternates: await productAlternates(product.id),
  })
}

function Part({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4">
      <SectionHeading title={title} />
      {children}
    </section>
  )
}

export async function FinanceProductPage({
  locale,
  slug,
  parentSlug,
}: {
  locale: Locale
  slug: string
  parentSlug?: string
}) {
  const found = await resolve(locale, slug, parentSlug)
  if (!found) notFound()
  const { product, parent } = found
  const t = financeUi[locale]
  const figures = await getFigures(locale)
  const ctx = { figures, locale }
  const url = financeProductPath(product.slug as string, locale, parent?.slug)
  const crumbs = [
    { name: t.section, url: financePath(locale) },
    ...(parent
      ? [{ name: parent.title, url: financeProductPath(parent.slug as string, locale) }]
      : []),
    { name: product.title, url },
  ]
  const answer = resolveFacts(product.answer, figures)
  const faq = schemaFaq(product.faq, figures)
  const siblings = (await listFinanceProducts(locale)).filter(
    (p) => p.parentSlug === (product.slug as string),
  )
  const relatedProducts = (product.relatedProducts ?? []).flatMap((r) =>
    typeof r === 'object' ? [r] : [],
  )
  const relatedGuides = (product.relatedGuides ?? []).flatMap((g) =>
    typeof g === 'object' ? [g] : [],
  )
  const sources = product.sources ?? []
  const example = product.example
  const confirmed = product.review?.status === 'confirmed'

  return (
    <SiteShell locale={locale} alternates={await productAlternates(product.id)}>
      <JsonLd
        data={[
          webPage({
            url,
            name: product.seo?.title || product.title,
            description: answer.confirmed ? answer.text : product.seo?.description,
            locale,
            dateModified: product.updatedAt,
          }),
          loanOrCredit({
            url,
            name: product.title,
            description: product.seo?.description,
            termMonths: product.limits?.termMonths,
            amountMax: product.limits?.amountMax,
            confirmed,
          }),
          breadcrumbs(locale, ui[locale].home, crumbs),
          ...(faq.length ? [faqPage(faq)] : []),
        ]}
      />
      <PageTitle
        locale={locale}
        title={product.title}
        summary={<FactText text={product.answer} figures={figures} locale={locale} />}
        updatedAt={product.updatedAt}
        crumbs={crumbs}
        kicker={t.section}
      />
      <div className="mx-auto mt-12 grid max-w-page gap-12 px-4 md:mt-16 md:px-8 lg:grid-cols-12">
        <div className="grid min-w-0 gap-12 lg:col-span-8">
          {product.review?.legalStatus !== 'legal-approved' && (
            <ReviewNote title={t.reviewNote.title}>{t.reviewNote.body}</ReviewNote>
          )}
          <Part title={t.fits}>
            <Prose data={product.fits} ctx={ctx} />
          </Part>
          <Part title={t.notFor}>
            <Prose data={product.notFor} ctx={ctx} />
          </Part>
          <Part title={t.finances}>
            <Prose data={product.finances} ctx={ctx} />
          </Part>
          {siblings.length > 0 && (
            <ul className="grid gap-3 md:grid-cols-2">
              {siblings.map((c) => (
                <li key={c.id} className="rounded-lg bg-raised p-5 ring-1 ring-line">
                  <Link
                    href={financeProductPath(c.slug, locale, product.slug as string)}
                    className="font-semibold text-ink"
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Part title={t.repayment}>
            <Prose data={product.repayment} ctx={ctx} />
            {product.harvestCalendar !== false && (
              <RepaymentCalendar
                caption={t.calendar.title}
                heads={[t.calendar.season, t.calendar.crops, t.calendar.when]}
                rows={calendarRows(locale)}
              />
            )}
          </Part>
          <WorkedExample
            kicker={t.example}
            title={example.title}
            note={t.exampleNote}
            rows={(example.rows ?? []).map((r) => ({
              label: r.label,
              value: <FactText text={r.value} figures={figures} locale={locale} />,
            }))}
          >
            <Prose data={example.scenario} ctx={ctx} />
          </WorkedExample>
          {(product.guarantees?.length ?? 0) > 0 && (
            <Part title={t.guarantees}>
              <GuaranteeTable
                caption={t.guarantees}
                heads={[t.guarantee, t.guaranteeNote]}
                rows={(product.guarantees ?? []).map((g) => ({
                  kind: guaranteeLabels[g.kind][locale],
                  note: g.note,
                }))}
              />
            </Part>
          )}
          <Part title={t.documents}>
            <p className="max-w-text text-muted">{t.documentsBody}</p>
          </Part>
          <Part title={t.process}>
            <Steps
              items={(product.process ?? []).map((s) => ({
                title: s.title,
                body: <FactText text={s.body} figures={figures} locale={locale} />,
              }))}
            />
          </Part>
          <Part title={t.risks}>
            <Prose data={product.risks} ctx={ctx} />
          </Part>
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
        {(relatedProducts.length > 0 || relatedGuides.length > 0) && (
          <aside className="grid content-start gap-6 lg:sticky lg:top-24 lg:col-span-3 lg:col-start-10">
            {relatedProducts.length > 0 && (
              <nav aria-label={t.relatedProducts} className="grid gap-2 text-small">
                <p className="font-semibold text-ink">{t.relatedProducts}</p>
                {relatedProducts.map((r) => {
                  const up = parentOf(r)
                  return (
                    <Link
                      key={r.id}
                      href={financeProductPath(r.slug as string, locale, up?.slug)}
                      className="text-accent underline underline-offset-2"
                    >
                      {r.title}
                    </Link>
                  )
                })}
              </nav>
            )}
            {relatedGuides.length > 0 && (
              <nav aria-label={t.guides} className="grid gap-2 text-small">
                <p className="font-semibold text-ink">{t.guides}</p>
                {relatedGuides.map((g) => (
                  <Link
                    key={g.id}
                    href={guidePath(g.slug as string, locale)}
                    className="text-accent underline underline-offset-2"
                  >
                    {g.title}
                  </Link>
                ))}
              </nav>
            )}
          </aside>
        )}
      </div>
      <Faq locale={locale} items={product.faq} />
      <div className="mx-auto mt-20 grid max-w-page gap-4 px-4 md:mt-28 md:px-8">
        <CtaBand
          kicker={t.tools.kicker}
          title={t.tools.title}
          body={t.tools.body}
          primary={{
            href: `${financeRoutePath('apply', locale)}?produs=${product.slug as string}`,
            label: t.tools.apply,
          }}
          secondary={{ href: financeRoutePath('simulator', locale), label: t.tools.simulate }}
        />
        <p className="text-small text-muted">
          {t.tools.talk}{' '}
          <Link
            href={fixedUrl('contact', locale)}
            className="text-accent underline underline-offset-2"
          >
            {t.tools.talkLink}
          </Link>
        </p>
      </div>
    </SiteShell>
  )
}
