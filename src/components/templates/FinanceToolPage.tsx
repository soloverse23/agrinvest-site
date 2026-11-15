import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'

import { RepaymentSchedule, ReviewNote, SourceList } from '@ds/patterns/Finance'
import { Callout } from '@ds/patterns/Sections'
import { Button } from '@ds/primitives/Button'
import { CheckboxField, SelectField, TextField } from '@ds/primitives/Field'
import { ArrowRightIcon } from '@ds/icons/icons'
import { schemaFaq } from '@/components/FactText'
import { ConsultantButton } from '@ds/patterns/FinanceGuide'
import { FinanceConsultant } from '@/components/FinanceConsultant'
import { FinanceNav } from '@/components/FinanceNav'
import { JsonLd } from '@/components/JsonLd'
import { Faq, PageTitle } from '@/components/PageParts'
import { Prose } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import { financeUi } from '@/i18n/finance'
import { financeGuideUi } from '@/i18n/finance-guide'
import {
  financePath,
  financeProductPath,
  financeRoutePath,
  financeRoutes,
  guidePath,
} from '@/i18n/routes'
import { ui } from '@/i18n/ui'
import { getFinancePage, listFinanceProducts } from '@/lib/content/finance'
import { getFigures, type Figures } from '@/lib/content/globals'
import { harvestCropLabels, harvestCrops } from '@/lib/finance/calendar'
import { maxTermMonths } from '@/lib/finance/choices'
import { needById, type Need } from '@/lib/finance/needs'
import {
  applyQuery,
  buildSchedule,
  fromIndex,
  monthKey,
  parseSimulator,
  startOptions,
  type Parsed,
  type RawParams,
  type Schedule,
} from '@/lib/finance/simulator'
import { formatDate, formatPercent, formatQuantity } from '@/lib/format'
import { breadcrumbs, faqPage, webPage } from '@/lib/schema'

import { alternatesOf } from './FinanceFixedPage'

type Tool = 'simulator' | 'apply'
type Page = NonNullable<Awaited<ReturnType<typeof getFinancePage>>>

const monthName = (index: number, locale: Locale) => {
  const { year, month } = fromIndex(index)
  return new Intl.DateTimeFormat(locale === 'ro' ? 'ro-RO' : 'en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)))
}

/**
 * The frame both tools share: title, JSON-LD, the tool, then the page's own text, FAQ and
 * sources (a Guides entry with section `pagina-finantare`, reviewed like every finance page).
 */
export async function ToolFrame({
  locale,
  tool,
  page,
  figures,
  need,
  children,
}: {
  locale: Locale
  tool: Tool
  page: Page
  figures: Figures
  /** The need the visitor came with (the hub's finder), so the drawer opens on it. */
  need?: string
  children: ReactNode
}) {
  const t = financeUi[locale]
  const url = financeRoutePath(tool, locale)
  const crumbs = [
    { name: t.section, url: financePath(locale) },
    { name: page.title, url },
  ]
  const faq = schemaFaq(page.faq, figures)
  const sources = page.sources ?? []
  return (
    <SiteShell locale={locale} alternates={alternatesOf(tool)}>
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
      <FinanceNav
        locale={locale}
        current={tool === 'simulator' ? 'simulator' : undefined}
        need={need}
        action={tool !== 'apply'}
      />
      {children}
      <div className="mx-auto mt-16 grid max-w-page gap-10 px-4 md:mt-20 md:px-8">
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
      {/* The application page is the request form itself: no drawer there (script budget). */}
      {tool !== 'apply' && <FinanceConsultant locale={locale} sourcePath={url} need={need} />}
    </SiteShell>
  )
}

/** The form, as a plain GET form: it posts back to the page and needs no JavaScript. */
function SimulatorForm({
  locale,
  parsed,
  maxMonths,
  action,
  today,
}: {
  locale: Locale
  parsed: Parsed
  maxMonths: number
  action: string
  today: Date
}) {
  const t = financeUi[locale].simulator
  const e = parsed.errors
  return (
    <form
      id="simulator"
      method="get"
      action={`${action}#rezultat`}
      noValidate
      className="grid content-start gap-5 rounded-lg bg-surface p-5 ring-1 ring-line md:p-6"
    >
      <h2 className="text-h4 font-semibold text-ink">{t.form}</h2>
      <TextField
        name="suma"
        label={t.amount}
        inputMode="numeric"
        suffix="lei"
        defaultValue={parsed.values.suma}
        error={e.suma && t.errors.amount}
      />
      <TextField
        name="luni"
        label={t.months}
        hint={t.monthsHint(maxMonths)}
        inputMode="numeric"
        suffix={t.monthsUnit}
        defaultValue={parsed.values.luni}
        error={e.luni && t.errors.months(maxMonths)}
      />
      <fieldset className="grid gap-3">
        <legend className="mb-1.5 text-small font-medium text-ink">{t.crops}</legend>
        <p className="text-caption text-muted">{t.cropsHint}</p>
        <div className="grid grid-cols-2 gap-3">
          {harvestCrops.map((c) => (
            <CheckboxField
              key={c}
              name="culturi"
              value={c}
              label={harvestCropLabels[c][locale]}
              defaultChecked={parsed.values.culturi.includes(c)}
            />
          ))}
        </div>
        {e.culturi && <p className="text-caption font-medium text-danger">{t.errors.crops}</p>}
      </fieldset>
      <SelectField
        name="start"
        label={t.start}
        defaultValue={parsed.values.start}
        error={e.start && t.errors.start}
        options={startOptions(today).map((i) => ({
          value: monthKey(i),
          label: monthName(i, locale),
        }))}
      />
      <TextField
        name="dobanda"
        label={t.rate}
        hint={t.rateHint}
        inputMode="decimal"
        suffix="%"
        defaultValue={parsed.values.dobanda}
        error={e.dobanda && t.errors.rate}
      />
      <Button type="submit" icon={<ArrowRightIcon />}>
        {t.submit}
      </Button>
    </form>
  )
}

function SimulatorResult({
  locale,
  parsed,
  schedule,
  url,
  need,
}: {
  locale: Locale
  parsed: Parsed
  schedule: Schedule
  url: string
  need?: string
}) {
  const t = financeUi[locale].simulator
  const input = parsed.input!
  const lei = (v: number) => formatQuantity(v, 'lei', locale, 0)
  const summary = t.summary(lei(input.amount), input.months, monthName(input.start, locale))

  if (schedule.kind === 'no-harvest') {
    const query = new URLSearchParams({
      suma: String(input.amount),
      luni: String(schedule.monthsNeeded),
      culturi: input.crops.join(','),
      start: monthKey(input.start),
      ...(parsed.values.dobanda ? { dobanda: parsed.values.dobanda } : {}),
    })
    return (
      <div className="grid content-start gap-5">
        <p className="text-body text-muted">{summary}</p>
        <Callout tone="warning" title={t.resultTitle}>
          {t.noHarvest(
            monthName(input.start, locale),
            monthName(schedule.firstHarvest, locale),
            schedule.monthsNeeded,
          )}
        </Callout>
        <div>
          <Button href={`${url}?${query}#rezultat`} variant="secondary">
            {t.tryLonger(schedule.monthsNeeded)}
          </Button>
        </div>
      </div>
    )
  }

  const withRate = schedule.totalInterest !== undefined
  const heads = withRate ? [...t.heads, t.interestHead] : [...t.heads]
  const applyHref = `${financeRoutePath('apply', locale)}?${applyQuery(input)}`
  return (
    <div className="grid content-start gap-5">
      <p className="text-body text-muted">{summary}</p>
      <RepaymentSchedule
        caption={t.resultTitle}
        heads={heads}
        phoneHidden={[2]}
        rows={schedule.instalments.map((r) => ({
          key: String(r.index),
          cells: [
            <span key="h" className="grid">
              <span>{monthName(r.index, locale)}</span>
              <span className="text-caption font-normal text-muted">{t.season[r.season]}</span>
            </span>,
            lei(r.principal),
            lei(r.remaining),
            ...(withRate ? [lei(r.interest ?? 0)] : []),
          ],
        }))}
        totals={{
          label: t.total,
          cells: [lei(input.amount), '', ...(withRate ? [lei(schedule.totalInterest!)] : [])],
        }}
      />
      {withRate && (
        <p className="text-small text-muted">
          {t.interestNote(formatPercent(input.rate!, locale))}{' '}
          <a
            href={guidePath(
              locale === 'ro' ? 'costul-real-al-creditului' : 'true-cost-of-credit',
              locale,
            )}
            className="text-accent underline underline-offset-2"
          >
            {t.costLink}
          </a>
        </p>
      )}
      <ReviewNote title={t.noteTitle}>{t.noteBody}</ReviewNote>
      <div className="flex flex-wrap gap-3">
        <ConsultantButton href={applyHref} need={need} icon={<ArrowRightIcon />}>
          {financeGuideUi[locale].consultant}
        </ConsultantButton>
        <Button href={applyHref} variant="secondary">
          {t.applyWith}
        </Button>
        <Button href="#simulator" variant="ghost">
          {t.change}
        </Button>
      </div>
    </div>
  )
}

/** The finder's answer, above the schedule: the credit that fits the need. */
function NeedMatch({
  locale,
  need,
  title,
  href,
  noGrain,
}: {
  locale: Locale
  need: Need
  title: string
  href: string
  noGrain: boolean
}) {
  const t = financeGuideUi[locale]
  return (
    <div className="grid gap-3 rounded-lg border-l-4 border-accent bg-raised p-5 shadow-soft ring-1 ring-line">
      <p className="text-caption font-semibold tracking-wide text-accent uppercase">
        {t.simulatorMatch.kicker}
      </p>
      <p className="text-h4 font-semibold text-balance">{title}</p>
      <p className="text-small text-muted">{t.simulatorMatch.for(need.label[locale])}</p>
      {noGrain && <p className="text-small text-ink">{t.simulatorMatch.noGrain}</p>}
      <div className="flex flex-wrap gap-3 pt-1">
        {noGrain && (
          <ConsultantButton
            href={financeRoutePath('apply', locale)}
            need={need.id}
            size="sm"
            icon={<ArrowRightIcon />}
          >
            {t.consultant}
          </ConsultantButton>
        )}
        <Button href={href} variant="secondary" size="sm">
          {t.simulatorMatch.see}
        </Button>
      </div>
    </div>
  )
}

/** `/finantare/simulator`: rendered per request, as the result comes from the URL. */
export async function SimulatorPage({ locale, params }: { locale: Locale; params: RawParams }) {
  const page = await getFinancePage(financeRoutes.simulator[locale], locale)
  if (!page) notFound()
  const [figures, maxMonths] = await Promise.all([getFigures(locale), maxTermMonths(locale)])
  const today = new Date()
  // The hub's finder sends `nevoie` (a need) and maybe no term: the need gives a sensible one.
  const need = needById(Array.isArray(params.nevoie) ? params.nevoie[0] : params.nevoie)
  const crops = [params.culturi].flat().join(',')
  const noGrain = Boolean(need) && crops.split(',').includes('none')
  const filled: RawParams = noGrain
    ? {}
    : { ...params, ...(need && !params.luni ? { luni: String(need.months) } : {}) }
  const parsed = parseSimulator(filled, maxMonths, today)
  const schedule = parsed.input ? buildSchedule(parsed.input) : undefined
  const url = financeRoutePath('simulator', locale)
  const products = need ? await listFinanceProducts(locale) : []
  const match = need ? products.find((p) => p.key === need.product) : undefined
  return (
    <ToolFrame locale={locale} tool="simulator" page={page} figures={figures} need={need?.id}>
      <div className="mx-auto mt-10 grid max-w-page gap-8 px-4 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SimulatorForm
            locale={locale}
            parsed={parsed}
            maxMonths={maxMonths}
            action={url}
            today={today}
          />
        </div>
        <section
          id="rezultat"
          aria-label={financeUi[locale].simulator.resultTitle}
          className="grid content-start gap-4 lg:col-span-7"
        >
          <h2 className="text-h3 font-semibold text-ink">
            {financeUi[locale].simulator.resultTitle}
          </h2>
          {need && match && (
            <NeedMatch
              locale={locale}
              need={need}
              title={match.title}
              href={financeProductPath(match.slug, locale, match.parentSlug)}
              noGrain={noGrain}
            />
          )}
          {schedule ? (
            <SimulatorResult
              locale={locale}
              parsed={parsed}
              schedule={schedule}
              url={url}
              need={need?.id}
            />
          ) : (
            <ReviewNote title={financeUi[locale].simulator.noteTitle}>
              {financeUi[locale].simulator.noteBody}
            </ReviewNote>
          )}
        </section>
      </div>
    </ToolFrame>
  )
}
