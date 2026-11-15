import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { needIcons } from '@ds/icons/finance'
import { ArrowRightIcon } from '@ds/icons/icons'
import { GuaranteeTable, RepaymentCalendar, SourceList, WorkedExample } from '@ds/patterns/Finance'
import {
  ConsultantBand,
  ConsultantButton,
  CreditBox,
  CreditCards,
  CreditLayout,
  FitPair,
  MoreDetails,
  QuestionLinks,
} from '@ds/patterns/FinanceGuide'
import { ProductSection, ProductTabs } from '@ds/patterns/ProductDetail'
import { Steps } from '@ds/patterns/Sections'
import { FactText, resolveFacts } from '@/components/FactText'
import { FinanceConsultant } from '@/components/FinanceConsultant'
import { FinanceNav } from '@/components/FinanceNav'
import { JsonLd } from '@/components/JsonLd'
import { Crumbs } from '@/components/PageParts'
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
import { getFigures, getSeoDefaults, type Figures } from '@/lib/content/globals'
import {
  getFinanceProduct,
  listFinanceProducts,
  listQuestions,
  productAlternates,
} from '@/lib/content/finance'
import { calendarRows } from '@/lib/finance/calendar'
import { byFinanceOrder, groupFor } from '@/lib/finance/groups'
import { needOfProduct, needs } from '@/lib/finance/needs'
import { borrowerLabels, guaranteeLabels, type BorrowerKind } from '@/lib/finance/options'
import { formatDate } from '@/lib/format'
import { breadcrumbs, loanOrCredit, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'
import type { FinanceProduct } from '@/payload-types'

/**
 * One credit: `/finantare/{slug}`, `/finantare/credit-investitii/{slug}` and the English twins
 * (route files in `src/app/(frontend)/[locale]/{finantare,financing}`). Phase 7g: built like a
 * shop product page. The credit box carries the H1, the key terms and the consultant; on the
 * left the answer, who it fits and what it finances; then the example, the steps, the
 * guarantees, the questions that point at it, and the long text closed under "Detalii".
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

/** A card's line: the answer's first sentence, unless it holds a register fact (shown marked). */
const firstSentence = (text?: string | null) => {
  const first = text?.split(/(?<=\.)\s/)[0]
  return first && !first.includes('{{') ? first : undefined
}

/** "PFA, II, IF, SRL, SA, societăți agricole": the abbreviation where a label has one. */
function borrowersLine(kinds: BorrowerKind[], locale: Locale) {
  return kinds
    .map((k) => {
      const label = borrowerLabels[k][locale]
      return /\(([A-Z]+)\)/.exec(label)?.[1] ?? label.toLowerCase()
    })
    .join(', ')
}

function specRows(product: FinanceProduct, group: string, figures: Figures, locale: Locale) {
  const s = financeGuideUi[locale].credit.specs
  const rows: { label: string; value: ReactNode }[] = []
  const borrowers = (product.borrowers ?? []) as BorrowerKind[]
  if (borrowers.length) rows.push({ label: s.borrowers, value: borrowersLine(borrowers, locale) })
  rows.push({
    label: s.repayment,
    value: product.harvestCalendar !== false ? s.repaymentHarvest : s.repaymentIncome,
  })
  const years = figures['F5.term']
  if (group === 'invest' && years?.status === 'confirmed' && typeof years.number === 'number')
    rows.push({ label: s.term, value: s.termInvest(years.number) })
  else if (group === 'season') rows.push({ label: s.term, value: s.termSeason })
  const guarantees = product.guarantees ?? []
  if (guarantees.length)
    rows.push({
      label: s.guarantees,
      value: guarantees.map((g) => guaranteeLabels[g.kind][locale]).join(', '),
    })
  rows.push({ label: s.currency, value: s.lei })
  return rows
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
  const g = financeGuideUi[locale]
  const c = g.credit
  const [figures, products, questions] = await Promise.all([
    getFigures(locale),
    listFinanceProducts(locale),
    listQuestions(locale),
  ])
  const ctx = { figures, locale }
  const key = product.key
  const url = financeProductPath(product.slug as string, locale, parent?.slug)
  const crumbs = [
    { name: t.section, url: financePath(locale) },
    ...(parent
      ? [{ name: parent.title, url: financeProductPath(parent.slug as string, locale) }]
      : []),
    { name: product.title, url },
  ]
  const answer = resolveFacts(product.answer, figures)
  const group = groupFor(product.slug as string, parent?.slug)
  const need = needOfProduct(key) ?? needOfProduct(parent?.key)
  const apply = financeRoutePath('apply', locale)

  // Sub-credits of a parent ("Alege ce finanțezi"), with the icon of their need.
  const children = products
    .filter((p) => p.parentSlug === (product.slug as string))
    .map((p) => {
      const n = needs.find((x) => x.product === p.key)
      const Icon = n ? needIcons[n.icon] : null
      return {
        href: financeProductPath(p.slug, locale, product.slug as string),
        title: p.title,
        line: n?.line[locale],
        icon: Icon ? <Icon /> : undefined,
      }
    })

  const own = questions.filter((q) => q.product === product.id)
  const fromChildren = questions.filter((q) =>
    products.some((p) => p.id === q.product && p.parentSlug === (product.slug as string)),
  )
  const asked = [...own, ...fromChildren].slice(0, 8)

  const relatedProducts = (product.relatedProducts ?? []).flatMap((r) =>
    typeof r === 'object' ? [r] : [],
  )
  const peers = byFinanceOrder(
    products.filter(
      (p) =>
        !p.parentSlug && p.slug !== (parent?.slug ?? product.slug) && groupFor(p.slug) === group,
    ),
  )
  const more = (
    relatedProducts.length
      ? relatedProducts.map((r) => ({
          href: financeProductPath(r.slug as string, locale, parentOf(r)?.slug),
          title: r.title,
          line: firstSentence(r.answer),
        }))
      : peers.map((p) => ({
          href: financeProductPath(p.slug, locale, p.parentSlug),
          title: p.title,
          line: firstSentence(p.answer),
        }))
  ).slice(0, 4)
  const relatedGuides = (product.relatedGuides ?? []).flatMap((r) =>
    typeof r === 'object' ? [r] : [],
  )
  const sources = product.sources ?? []
  const example = product.example
  const hasGuarantees = (product.guarantees?.length ?? 0) > 0
  const tabs = [
    ...(example?.title ? [{ id: 'exemplu', label: c.tabs.example }] : []),
    { id: 'pasi', label: c.tabs.process },
    ...(hasGuarantees ? [{ id: 'garantii', label: c.tabs.guarantees }] : []),
    ...(asked.length ? [{ id: 'intrebari', label: c.tabs.questions }] : []),
    { id: 'detalii', label: c.tabs.details },
  ]
  const approved = product.review?.legalStatus === 'legal-approved'

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
            confirmed: product.review?.status === 'confirmed',
          }),
          breadcrumbs(locale, ui[locale].home, crumbs),
        ]}
      />
      <FinanceNav locale={locale} current="credits" need={need} />
      <CreditLayout
        breadcrumbs={<Crumbs locale={locale} items={crumbs} />}
        box={
          <CreditBox
            kicker={c.kicker}
            title={product.title}
            specs={specRows(product, group, figures, locale)}
            primary={
              <ConsultantButton href={apply} need={need} icon={<ArrowRightIcon />} fullWidth>
                {g.consultant}
              </ConsultantButton>
            }
            secondary={{
              href: `${financeRoutePath('simulator', locale)}${need ? `?nevoie=${need}` : ''}`,
              label: c.simulate,
            }}
            note={approved ? g.terms : t.reviewNote.body}
          />
        }
        lead={
          <>
            <p className="text-lead text-ink">
              <FactText text={product.answer} figures={figures} locale={locale} />
            </p>
            <FitPair
              fits={{ title: c.fits, body: <Prose data={product.fits} ctx={ctx} /> }}
              notFor={{ title: c.notFor, body: <Prose data={product.notFor} ctx={ctx} /> }}
            />
            {children.length > 0 ? (
              <section className="grid gap-4" aria-labelledby="alege">
                <h2 id="alege" className="text-h3 font-semibold">
                  {c.choose}
                </h2>
                <CreditCards items={children} />
              </section>
            ) : (
              <section className="grid gap-3" aria-labelledby="finanteaza">
                <h2 id="finanteaza" className="text-h3 font-semibold">
                  {c.finances}
                </h2>
                <Prose data={product.finances} ctx={ctx} />
              </section>
            )}
          </>
        }
      >
        <ProductTabs label={c.tabs.label} items={tabs} />
        {example?.title && (
          <div id="exemplu">
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
          </div>
        )}
        <ProductSection id="pasi" title={t.process}>
          <Steps
            items={(product.process ?? []).map((s) => ({
              title: s.title,
              body: <FactText text={s.body} figures={figures} locale={locale} />,
            }))}
          />
        </ProductSection>
        {hasGuarantees && (
          <ProductSection id="garantii" title={t.guarantees}>
            <GuaranteeTable
              caption={t.guarantees}
              heads={[t.guarantee, t.guaranteeNote]}
              rows={(product.guarantees ?? []).map((gr) => ({
                kind: guaranteeLabels[gr.kind][locale],
                note: gr.note,
              }))}
            />
          </ProductSection>
        )}
        {asked.length > 0 && (
          <ProductSection id="intrebari" title={c.questionsTitle}>
            <QuestionLinks
              items={asked.map((q) => ({ href: questionPath(q.slug, locale), title: q.title }))}
            />
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-small">
              <Link
                href={financeRoutePath('questions', locale)}
                className="font-semibold text-accent underline-offset-2 hover:underline"
              >
                {c.questionsMore}
              </Link>
              {relatedGuides.map((rg) => (
                <Link
                  key={rg.id}
                  href={guidePath(rg.slug as string, locale)}
                  className="text-accent underline underline-offset-2"
                >
                  {rg.title}
                </Link>
              ))}
            </div>
          </ProductSection>
        )}
        <ProductSection id="detalii" title={c.detailsTitle} lead={c.detailsLead}>
          <MoreDetails summary={c.detailsOpen}>
            {children.length > 0 && (
              <section className="grid gap-3">
                <h3 className="text-h4 font-semibold">{t.finances}</h3>
                <Prose data={product.finances} ctx={ctx} />
              </section>
            )}
            <section className="grid gap-3">
              <h3 className="text-h4 font-semibold">{t.repayment}</h3>
              <Prose data={product.repayment} ctx={ctx} />
              {product.harvestCalendar !== false && (
                <RepaymentCalendar
                  caption={t.calendar.title}
                  heads={[t.calendar.season, t.calendar.crops, t.calendar.when]}
                  rows={calendarRows(locale)}
                />
              )}
            </section>
            <section className="grid gap-3">
              <h3 className="text-h4 font-semibold">{t.risks}</h3>
              <Prose data={product.risks} ctx={ctx} />
            </section>
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
          </MoreDetails>
        </ProductSection>
      </CreditLayout>

      <div className="mx-auto mt-20 grid max-w-page gap-16 px-4 md:mt-28 md:px-8">
        {more.length > 0 && (
          <section className="grid gap-5" aria-labelledby="inrudite">
            <h2 id="inrudite" className="text-h3 font-semibold">
              {c.related}
            </h2>
            <CreditCards items={more} />
          </section>
        )}
        <ConsultantBand
          kicker={c.kicker}
          title={c.bandTitle}
          body={c.bandBody}
          action={
            <ConsultantButton href={apply} need={need} variant="lime" icon={<ArrowRightIcon />}>
              {g.consultant}
            </ConsultantButton>
          }
          secondary={{
            href: `${financeRoutePath('simulator', locale)}${need ? `?nevoie=${need}` : ''}`,
            label: g.nav.simulator,
          }}
        />
      </div>
      <FinanceConsultant
        locale={locale}
        sourcePath={url}
        need={need}
        credit={key}
        creditSlug={product.slug as string}
      />
    </SiteShell>
  )
}
