import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'

import { RepaymentSchedule, ReviewNote, SourceList } from '@ds/patterns/Finance'
import { Callout } from '@ds/patterns/Sections'
import { Button } from '@ds/primitives/Button'
import { CheckboxField, SelectField, TextField } from '@ds/primitives/Field'
import { ArrowRightIcon } from '@ds/icons/icons'
import { schemaFaq } from '@/components/FactText'
import { JsonLd } from '@/components/JsonLd'
import { Faq, PageTitle } from '@/components/PageParts'
import { Prose } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import { financeUi } from '@/i18n/finance'
import { financePath, financeRoutePath, financeRoutes, guidePath } from '@/i18n/routes'
import { ui } from '@/i18n/ui'
import { getFinancePage } from '@/lib/content/finance'
import { getFigures, type Figures } from '@/lib/content/globals'
import { harvestCropLabels, harvestCrops } from '@/lib/finance/calendar'
import { maxTermMonths } from '@/lib/finance/choices'
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
  children,
}: {
  locale: Locale
  tool: Tool
  page: Page
  figures: Figures
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
}: {
  locale: Locale
  parsed: Parsed
  schedule: Schedule
  url: string
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
        <Button href={applyHref} icon={<ArrowRightIcon />}>
          {t.applyWith}
        </Button>
        <Button href="#simulator" variant="secondary">
          {t.change}
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
  const parsed = parseSimulator(params, maxMonths, today)
  const schedule = parsed.input ? buildSchedule(parsed.input) : undefined
  const url = financeRoutePath('simulator', locale)
  return (
    <ToolFrame locale={locale} tool="simulator" page={page} figures={figures}>
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
          {schedule ? (
            <SimulatorResult locale={locale} parsed={parsed} schedule={schedule} url={url} />
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
