import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArrowRightIcon } from '@ds/icons/icons'
import { SourceList } from '@ds/patterns/Finance'
import {
  ConsultantBand,
  ConsultantButton,
  FactorList,
  QuestionLinks,
  ShortAnswer,
} from '@ds/patterns/FinanceGuide'
import { FactText, schemaFaq } from '@/components/FactText'
import { FinanceConsultant } from '@/components/FinanceConsultant'
import { FinanceNav } from '@/components/FinanceNav'
import { JsonLd } from '@/components/JsonLd'
import { PageTitle } from '@/components/PageParts'
import { Prose } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import { financeUi } from '@/i18n/finance'
import { financeGuideUi } from '@/i18n/finance-guide'
import {
  financePath,
  financeProductPath,
  financeRoutePath,
  guidePath,
  questionPath,
} from '@/i18n/routes'
import { ui } from '@/i18n/ui'
import {
  getQuestion,
  listFinanceProducts,
  listQuestions,
  questionAlternates,
} from '@/lib/content/finance'
import { getFigures, getSeoDefaults } from '@/lib/content/globals'
import { needOfProduct } from '@/lib/finance/needs'
import { questionTopicLabels } from '@/lib/finance/topics'
import { formatDate } from '@/lib/format'
import { breadcrumbs, faqPage, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'

/**
 * One farmer question (`/finantare/intrebari/{slug}`), Phase 7g: the short answer an
 * assistant can quote, what decides it for a given farm, an example when the sources allow,
 * then the matching credit and the consultant. Questions are listed on their credit's page.
 */
export const questionParams = async (locale: Locale) =>
  (await listQuestions(locale)).map((q) => ({ slug: q.slug }))

export async function questionMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const q = await getQuestion(slug, locale)
  if (!q) return {}
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: q.title,
    seoTitle: q.seo?.title,
    titleTemplate: seo.titleTemplate,
    siteName: seo.siteName,
    description: q.seo?.description || q.answer,
    image: q.seo?.image ?? seo.ogImage,
    noindex: q.seo?.noindex,
    alternates: await questionAlternates(q.id),
  })
}

export async function FinanceQuestionPage({ locale, slug }: { locale: Locale; slug: string }) {
  const q = await getQuestion(slug, locale)
  if (!q) notFound()
  const t = financeUi[locale]
  const g = financeGuideUi[locale]
  const tq = g.question
  const [figures, products, questions] = await Promise.all([
    getFigures(locale),
    listFinanceProducts(locale),
    listQuestions(locale),
  ])
  const url = questionPath(q.slug as string, locale)
  const crumbs = [
    { name: t.section, url: financePath(locale) },
    { name: g.nav.questions, url: financeRoutePath('questions', locale) },
    { name: q.title, url },
  ]
  const productId = typeof q.product === 'object' ? q.product?.id : q.product
  const credit = products.find((p) => p.id === productId)
  const creditKey = typeof q.product === 'object' ? q.product?.key : credit?.key
  const need = needOfProduct(creditKey)
  const guide = typeof q.guide === 'object' ? q.guide : null
  const relatedIds = (q.related ?? []).map((r) => (typeof r === 'object' ? r.id : r))
  const related = [
    ...relatedIds.flatMap((id) => questions.find((x) => x.id === id) ?? []),
    // Then others of the same topic, so a page always offers a next question.
    ...questions.filter((x) => x.topic === q.topic && x.id !== q.id && !relatedIds.includes(x.id)),
  ].slice(0, 5)
  const factors = (q.factors ?? []).map((f) => f.text)
  const sources = q.sources ?? []
  const apply = financeRoutePath('apply', locale)
  const faq = schemaFaq([{ question: q.title, answer: q.answer }], figures)

  return (
    <SiteShell locale={locale} alternates={await questionAlternates(q.id)}>
      <JsonLd
        data={[
          webPage({ url, name: q.seo?.title || q.title, locale, dateModified: q.updatedAt }),
          breadcrumbs(locale, ui[locale].home, crumbs),
          ...(faq.length ? [faqPage(faq)] : []),
        ]}
      />
      <PageTitle
        locale={locale}
        title={q.title}
        updatedAt={q.updatedAt}
        crumbs={crumbs}
        kicker={questionTopicLabels[q.topic][locale]}
      />
      <FinanceNav locale={locale} current="questions" need={need} />
      <div className="mx-auto mt-10 grid max-w-page gap-12 px-4 md:mt-14 md:px-8 lg:grid-cols-12 lg:gap-14">
        <article className="grid min-w-0 content-start gap-12 lg:col-span-8">
          <ShortAnswer label={tq.short}>
            <p>
              <FactText text={q.answer} figures={figures} locale={locale} />
            </p>
          </ShortAnswer>
          {factors.length > 0 && (
            <FactorList
              title={tq.factors}
              lead={tq.factorsLead}
              items={factors.map((f, i) => (
                <FactText key={i} text={f} figures={figures} locale={locale} />
              ))}
            />
          )}
          {q.practice && (
            <section className="grid gap-4">
              <h2 className="text-h3 font-semibold">{tq.practice}</h2>
              <Prose data={q.practice} ctx={{ figures, locale }} />
            </section>
          )}
          {guide?.slug && (
            <p className="text-body text-muted">
              {tq.guide}:{' '}
              <Link
                href={guidePath(guide.slug, locale)}
                className="font-semibold text-accent underline underline-offset-2"
              >
                {guide.title}
              </Link>
            </p>
          )}
          {related.length > 0 && (
            <section className="grid gap-4">
              <h2 className="text-h3 font-semibold">{tq.related}</h2>
              <QuestionLinks
                items={related.map((r) => ({ href: questionPath(r.slug, locale), title: r.title }))}
              />
            </section>
          )}
        </article>
        <aside className="grid content-start gap-5 lg:sticky lg:top-6 lg:col-span-4 lg:self-start">
          {credit && (
            <div className="grid gap-4 rounded-lg bg-raised p-5 shadow-soft ring-1 ring-line md:p-6">
              <p className="text-caption font-semibold tracking-wide text-accent uppercase">
                {tq.credit}
              </p>
              <p className="text-h4 font-semibold text-balance">{credit.title}</p>
              <p className="line-clamp-4 text-small text-muted">
                <FactText text={credit.answer} figures={figures} locale={locale} />
              </p>
              <div className="grid gap-2">
                <ConsultantButton href={apply} need={need} icon={<ArrowRightIcon />} fullWidth>
                  {g.consultant}
                </ConsultantButton>
                <Link
                  href={financeProductPath(credit.slug, locale, credit.parentSlug)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md font-semibold text-accent no-underline ring-1 ring-line hover:bg-surface"
                >
                  {tq.creditCta}
                </Link>
              </div>
              <p className="text-caption text-muted">{g.terms}</p>
            </div>
          )}
        </aside>
      </div>
      <div className="mx-auto mt-20 grid max-w-page gap-12 px-4 md:mt-24 md:px-8">
        <ConsultantBand
          kicker={g.credit.kicker}
          title={tq.bandTitle}
          body={tq.bandBody}
          action={
            <ConsultantButton href={apply} need={need} variant="lime" icon={<ArrowRightIcon />}>
              {g.consultant}
            </ConsultantButton>
          }
        />
        {sources.length > 0 && (
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
        )}
      </div>
      <FinanceConsultant
        locale={locale}
        sourcePath={url}
        need={need}
        credit={creditKey ?? undefined}
        creditSlug={credit?.slug}
      />
    </SiteShell>
  )
}
