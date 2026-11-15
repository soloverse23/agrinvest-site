import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { ArrowRightIcon } from '@ds/icons/icons'
import { MarketChartLazy } from '@ds/patterns/Lazy'
import type { ChartRange, MarketChartTone } from '@ds/patterns/MarketChart'
import { HistoryTable, MarketHeadline, MarketTile, StaticLine, pctText } from '@ds/patterns/Markets'
import { SectionHeading } from '@ds/patterns/Sections'
import { Button } from '@ds/primitives/Button'
import { JsonLd } from '@/components/JsonLd'
import { PageTitle } from '@/components/PageParts'
import { SiteShell } from '@/components/SiteShell'
import { ToolLinks } from '@/components/ToolLinks'
import type { Locale } from '@/i18n/config'
import { marketsUi } from '@/i18n/markets'
import {
  cropPricePath,
  fertiliserPricesPath,
  dieselPath,
  marketPagePath,
  pricesPath,
} from '@/i18n/routes'
import { ui } from '@/i18n/ui'
import { getSeoDefaults } from '@/lib/content/globals'
import { listCrops } from '@/lib/content/locations'
import type { Alternates } from '@/lib/content/pages'
import { isGrainKey } from '@/lib/crops'
import { formatDate, formatFixed } from '@/lib/format'
import {
  converted,
  lastDays,
  latestRates,
  marketSeries,
  monthlyAverages,
  quoteOf,
  yearlyAverages,
  type Point,
  type Quote,
  type Rates,
} from '@/lib/markets/load'
import {
  hubGroups,
  marketPages,
  markets,
  type Market,
  type MarketKey,
  type MarketPageId,
  unitOf,
} from '@/lib/markets/registry'

export { unitOf }
import { marketHrefs } from '@/lib/markets/links'
import { breadcrumbs, dataset, faqPage, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'
import { marketSources, type MarketSource } from '@/lib/sources'

/**
 * Phase 7f: the Prices hub (`/preturi`, `/en/prices`) as a market dashboard, and the market
 * pages (Brent, fuel, gas, exchange rates). The blocks here (headline, TradingView chart,
 * history) are reused by the crop and fertiliser price pages. Every number is rendered on the
 * server with its source and date; the chart island only adds interaction on top.
 */

const tones: MarketChartTone[] = ['accent', 'info', 'warning', 'muted']

const rangesOf: Record<Market['frequency'], { ranges: ChartRange[]; initial: ChartRange }> = {
  daily: { ranges: ['1M', '3M', '6M', '1Y', '5Y', 'MAX'], initial: '1Y' },
  weekly: { ranges: ['3M', '6M', '1Y', '5Y', 'MAX'], initial: '1Y' },
  monthly: { ranges: ['1Y', '5Y', 'MAX'], initial: '5Y' },
}
const initialDays: Record<ChartRange, number> = {
  '1M': 31,
  '3M': 92,
  '6M': 183,
  '1Y': 366,
  '5Y': 5 * 366,
  MAX: 100 * 366,
}

export type MarketView = {
  key: MarketKey
  m: Market
  name: string
  benchmark: string
  points: Point[]
  quote: Quote
}

/** The markets that have data, with their history and latest quote. */
export async function marketViews(keys: MarketKey[], locale: Locale): Promise<MarketView[]> {
  const t = marketsUi[locale].markets
  const all = await Promise.all(keys.map((k) => marketSeries(k)))
  return keys.flatMap((key, i) => {
    const points = all[i]!
    const quote = quoteOf(key, points)
    return quote
      ? [{ key, m: markets[key], name: t[key].name, benchmark: t[key].benchmark, points, quote }]
      : []
  })
}

/** `≈ 10,87 lei/l`, or undefined when the market has no farmer unit or no rate exists yet. */
export function approxOf(v: MarketView, value: number, rates: Rates | null, locale: Locale) {
  const c = converted(v.m, value, rates)
  if (c === null || !v.m.convert) return undefined
  return marketsUi[locale].ui.approx(
    `${formatFixed(c, locale, v.m.convert.decimals)} ${v.m.convert.unit}`,
  )
}

/** Each source behind `views`, once, for the captions and the Dataset's `isBasedOn`. */
export function sourcesOf(views: MarketView[]) {
  const keys = [...new Set(views.map((v) => v.m.store?.source ?? 'ecb'))] as MarketSource[]
  return keys.map((k) => marketSources[k])
}

/** `2016-01-04/2026-11-13` across the views' points. */
export function coverageOf(views: MarketView[]) {
  const days = views.flatMap((v) => [v.points[0]![0], v.quote.last[0]])
  if (!days.length) return undefined
  const iso = (t: number) => new Date(t).toISOString().slice(0, 10)
  return `${iso(Math.min(...days))}/${iso(Math.max(...days))}`
}

export const latestOf = (views: MarketView[]) =>
  views.length ? new Date(Math.max(...views.map((v) => v.quote.last[0]))) : undefined

/**
 * One chart block: the first market's headline, the others as small tiles, and a TradingView
 * chart with all of them (they share a unit). Below it, the source line.
 */
export function MarketBlock({
  views,
  locale,
  rates,
  headingLevel = 2,
  heading,
}: {
  views: MarketView[]
  locale: Locale
  rates: Rates | null
  headingLevel?: 2 | 3
  heading?: string
}) {
  const main = views[0]
  if (!main) return null
  const t = marketsUi[locale]
  const q = main.quote
  const { ranges, initial } = rangesOf[main.m.frequency]
  const unit = unitOf(main.m)
  const H = headingLevel === 2 ? 'h2' : 'h3'
  const stats = [
    q.yearPct !== null && { label: t.ui.year, value: pctText(q.yearPct, locale) },
    { label: t.ui.high, value: formatFixed(q.high, locale, main.m.decimals) },
    { label: t.ui.low, value: formatFixed(q.low, locale, main.m.decimals) },
    q.previous && {
      label: t.ui.change(t.ui.period[main.m.frequency]),
      value: `${(q.change ?? 0) > 0 ? '+' : (q.change ?? 0) < 0 ? '−' : '±'}${formatFixed(Math.abs(q.change ?? 0), locale, main.m.decimals)}`,
    },
  ].filter((s): s is { label: string; value: string } => !!s)
  return (
    <section aria-label={heading ?? main.name} className="grid gap-6">
      {heading && <H className="text-h3 font-semibold">{heading}</H>}
      <MarketHeadline
        locale={locale}
        name={main.name}
        value={q.last[1]}
        decimals={main.m.decimals}
        unit={unit}
        date={new Date(q.last[0])}
        change={q.change}
        changePct={q.changePct}
        changeLabel={t.ui.change(t.ui.period[main.m.frequency])}
        approx={approxOf(main, q.last[1], rates, locale)}
        stats={stats}
        benchmark={main.benchmark}
        labels={{ updated: t.ui.updated }}
      />
      {views.length > 1 && (
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {views.slice(1).map((v) => (
            <li key={v.key}>
              <MarketTile
                locale={locale}
                name={v.name}
                value={v.quote.last[1]}
                decimals={v.m.decimals}
                unit={unitOf(v.m)}
                date={new Date(v.quote.last[0])}
                changePct={v.quote.changePct}
                approx={approxOf(v, v.quote.last[1], rates, locale)}
                spark={lastDays(v.points, 366).map((p) => p[1])}
                open={t.ui.open}
              />
            </li>
          ))}
        </ul>
      )}
      <MarketChartLazy
        locale={locale}
        series={views.map((v, i) => ({ key: v.key, label: v.name, tone: tones[i]! }))}
        decimals={main.m.decimals}
        unit={unit}
        ranges={ranges}
        defaultRange={initial}
        labels={t.chart}
      >
        <StaticLine
          points={lastDays(main.points, initialDays[initial])}
          locale={locale}
          decimals={main.m.decimals}
        />
      </MarketChartLazy>
      <SourceLine views={views} locale={locale} />
    </section>
  )
}

export function SourceLine({ views, locale }: { views: MarketView[]; locale: Locale }) {
  return (
    <p className="text-caption text-muted">
      {sourcesOf(views).map((s, i) => (
        <span key={s.name}>
          {i > 0 && ' · '}
          <a href={s.url} rel="noopener" className="underline underline-offset-2">
            {s.attribution[locale]}
          </a>{' '}
          (
          <a href={s.licenceUrl} rel="license noopener" className="underline underline-offset-2">
            {marketsUi[locale].ui.licence}
          </a>
          )
        </span>
      ))}
    </p>
  )
}

const monthName = (month: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === 'ro' ? 'ro-RO' : 'en-GB', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${month}-01T00:00:00Z`))

/** Monthly averages for the last two years and yearly averages, one column per market. */
export function MarketHistory({
  views,
  locale,
  daily,
}: {
  views: MarketView[]
  locale: Locale
  /** Also list the last 30 days (exchange rates). */
  daily?: boolean
}) {
  if (!views.length) return null
  const t = marketsUi[locale].ui
  const decimals = Math.max(...views.map((v) => v.m.decimals))
  const head = (first: string) => [
    first,
    ...views.map((v) => (views.length > 1 ? `${v.name} (${unitOf(v.m)})` : unitOf(v.m))),
  ]
  const monthly = views.map(
    (v) => new Map(monthlyAverages(v.points).map((r) => [r.month, r.value])),
  )
  const months = [...new Set(views.flatMap((v) => monthlyAverages(v.points).map((r) => r.month)))]
    .sort()
    .reverse()
    .slice(0, 24)
  const yearly = views.map((v) => new Map(yearlyAverages(v.points).map((r) => [r.year, r.value])))
  const years = [...new Set(views.flatMap((v) => yearlyAverages(v.points).map((r) => r.year)))]
    .sort()
    .reverse()
  const days = daily ? lastDays(views[0]!.points, 30).reverse() : []
  const byDay = views.map((v) => new Map(v.points))
  return (
    <section aria-labelledby="istoric" className="grid gap-6">
      <SectionHeading id="istoric" title={t.history} lead={t.historyLead} />
      {daily && (
        <div className="grid gap-3">
          <h3 className="text-h4 font-semibold">{t.daily30}</h3>
          <HistoryTable
            caption={t.daily30}
            head={head(t.day)}
            rows={days.map(([d]) => ({
              label: formatDate(new Date(d), locale),
              values: byDay.map((m) => m.get(d) ?? null),
            }))}
            locale={locale}
            decimals={decimals}
          />
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid content-start gap-3">
          <h3 className="text-h4 font-semibold">{t.monthly}</h3>
          <HistoryTable
            caption={t.monthly}
            head={head(t.month)}
            rows={months.map((mo) => ({
              label: monthName(mo, locale),
              values: monthly.map((m) => m.get(mo) ?? null),
            }))}
            locale={locale}
            decimals={decimals}
          />
        </div>
        <div className="grid content-start gap-3">
          <h3 className="text-h4 font-semibold">{t.yearly}</h3>
          <HistoryTable
            caption={t.yearly}
            head={head(t.yearCol)}
            rows={years.map((y) => ({
              label: String(y),
              values: yearly.map((m) => m.get(y) ?? null),
            }))}
            locale={locale}
            decimals={decimals}
          />
        </div>
      </div>
    </section>
  )
}

export function MarketFaq({
  items,
  locale,
}: {
  items: readonly { q: string; a: string }[]
  locale: Locale
}) {
  if (!items.length) return null
  return (
    <section aria-labelledby="intrebari" className="grid gap-4">
      <SectionHeading id="intrebari" title={marketsUi[locale].ui.faq} />
      <div className="grid divide-y divide-line rounded-lg bg-raised shadow-soft ring-1 ring-line">
        {items.map((f) => (
          <details key={f.q} className="group px-4 py-3 md:px-6">
            <summary className="cursor-pointer font-semibold text-ink">{f.q}</summary>
            <p className="mt-2 max-w-text text-body text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export function MarketAbout({ title, body }: { title: string; body: readonly string[] }) {
  return (
    <section aria-labelledby="despre" className="grid max-w-text gap-3">
      <h2 id="despre" className="text-h3 font-semibold">
        {title}
      </h2>
      {body.map((p) => (
        <p key={p.slice(0, 32)} className="text-body text-muted">
          {p}
        </p>
      ))}
    </section>
  )
}

/** Links to every market page, except `current` (the cluster's internal links). */
export async function RelatedMarkets({ locale, current }: { locale: Locale; current: string }) {
  const t = marketsUi[locale]
  const crops = (await listCrops(locale)).filter((c) => isGrainKey(c.key))
  const links = [
    { href: marketPagePath('brent', locale), label: t.pages.brent.title },
    { href: marketPagePath('fuel', locale), label: t.pages.fuel.title },
    { href: marketPagePath('gas', locale), label: t.pages.gas.title },
    { href: marketPagePath('fx', locale), label: t.pages.fx.title },
    { href: fertiliserPricesPath(locale), label: t.groups.fertiliser.title },
    ...crops.map((c) => ({ href: cropPricePath(c.slug as string, locale), label: c.name })),
  ].filter((l) => l.href !== current)
  return (
    <nav aria-labelledby="alte-piete" className="grid gap-4">
      <h2 id="alte-piete" className="text-h3 font-semibold">
        {t.ui.related}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="inline-flex min-h-10 items-center rounded-full bg-raised px-4 text-small font-semibold text-ink no-underline ring-1 ring-line hover:ring-accent"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/* ------------------------------------------------------------------ hub */

export const hubAlternates: Alternates = { ro: pricesPath('ro'), en: pricesPath('en') }

export async function pricesHubMetadata(locale: Locale): Promise<Metadata> {
  const t = marketsUi[locale].hub
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: t.title,
    seoTitle: t.seoTitle,
    siteName: seo.siteName,
    description: t.description,
    image: seo.ogImage,
    alternates: hubAlternates,
  })
}

/** The hub's tiles, one group at a time. `first` goes above all groups (Romania's own prices matter most). */
export async function MarketHub({
  locale,
  first,
  after,
}: {
  locale: Locale
  first?: ReactNode
  after?: ReactNode
}) {
  const t = marketsUi[locale]
  const url = pricesPath(locale)
  const [groups, rates, hrefs] = await Promise.all([
    Promise.all(hubGroups.map((g) => marketViews(g.markets, locale))),
    latestRates(),
    marketHrefs(locale),
  ])
  const all = groups.flat()
  const crumbs = [{ name: t.section, url }]
  const updated = latestOf(all)
  return (
    <SiteShell locale={locale} alternates={hubAlternates}>
      <JsonLd
        data={[
          webPage({
            url,
            name: t.hub.seoTitle,
            description: t.hub.description,
            locale,
            dateModified: updated?.toISOString(),
          }),
          breadcrumbs(locale, ui[locale].home, crumbs),
          dataset({
            url,
            name: t.hub.dataset.name,
            description: t.hub.dataset.description,
            locale,
            temporalCoverage: coverageOf(all),
            dateModified: updated?.toISOString(),
            variables: all.map((v) => `${v.name} (${unitOf(v.m)})`),
            sources: sourcesOf(all).map((s) => ({
              name: s.name,
              url: s.url,
              license: s.licenceUrl,
            })),
          }),
        ]}
      />
      <PageTitle
        locale={locale}
        title={t.hub.title}
        summary={t.hub.summary}
        updatedAt={updated?.toISOString()}
        crumbs={crumbs}
      />
      <div className="mx-auto mt-12 grid max-w-page gap-16 px-4 md:mt-16 md:px-8">
        {first}
        {hubGroups.map((g, i) => (
          <section key={g.group} aria-labelledby={`grupa-${g.group}`} className="grid gap-6">
            <SectionHeading
              id={`grupa-${g.group}`}
              title={t.groups[g.group].title}
              lead={t.groups[g.group].lead}
            />
            {groups[i]!.length ? (
              <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
                {groups[i]!.map((v) => (
                  <li key={v.key}>
                    <MarketTile
                      locale={locale}
                      name={v.name}
                      href={hrefs[v.key]}
                      value={v.quote.last[1]}
                      decimals={v.m.decimals}
                      unit={unitOf(v.m)}
                      date={new Date(v.quote.last[0])}
                      changePct={v.quote.changePct}
                      approx={approxOf(v, v.quote.last[1], rates, locale)}
                      spark={lastDays(v.points, 366).map((p) => p[1])}
                      open={t.ui.open}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body text-muted">{t.ui.noData}</p>
            )}
            {groups[i]!.length > 0 && <SourceLine views={groups[i]!} locale={locale} />}
          </section>
        ))}
        {after}
      </div>
      <ToolLinks locale={locale} current={url} />
    </SiteShell>
  )
}

/* ------------------------------------------------------------------ market pages */

/** The chart blocks of each page: markets in one block share one chart and one unit. */
const pageBlocks: Record<MarketPageId, MarketKey[][]> = {
  brent: [marketPages.brent],
  fuel: [marketPages.fuel],
  gas: [marketPages.gas],
  fx: marketPages.fx.map((k) => [k]),
}

export const marketPageAlternates = (id: MarketPageId): Alternates => ({
  ro: marketPagePath(id, 'ro'),
  en: marketPagePath(id, 'en'),
})

export async function marketPageMetadata(id: MarketPageId, locale: Locale): Promise<Metadata> {
  const t = marketsUi[locale].pages[id]
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: t.title,
    seoTitle: t.seoTitle,
    siteName: seo.siteName,
    description: t.description,
    image: seo.ogImage,
    alternates: marketPageAlternates(id),
  })
}

export async function MarketPage({
  id,
  locale,
  actions,
}: {
  id: MarketPageId
  locale: Locale
  actions?: ReactNode
}) {
  const t = marketsUi[locale]
  const copy = t.pages[id]
  const url = marketPagePath(id, locale)
  const [blocks, rates] = await Promise.all([
    Promise.all(pageBlocks[id].map((keys) => marketViews(keys, locale))),
    latestRates(),
  ])
  const all = blocks.flat()
  const updated = latestOf(all)
  const crumbs = [
    { name: t.section, url: pricesPath(locale) },
    { name: copy.title, url },
  ]
  return (
    <SiteShell locale={locale} alternates={marketPageAlternates(id)}>
      <JsonLd
        data={[
          webPage({
            url,
            name: copy.seoTitle,
            description: copy.description,
            locale,
            dateModified: updated?.toISOString(),
          }),
          breadcrumbs(locale, ui[locale].home, crumbs),
          dataset({
            url,
            name: copy.dataset.name,
            description: copy.dataset.description,
            locale,
            temporalCoverage: coverageOf(all),
            dateModified: updated?.toISOString(),
            variables: all.map((v) => `${v.name} (${unitOf(v.m)})`),
            sources: sourcesOf(all).map((s) => ({
              name: s.name,
              url: s.url,
              license: s.licenceUrl,
            })),
          }),
          faqPage(copy.faq.map((f) => ({ question: f.q, answer: f.a }))),
        ]}
      />
      <PageTitle
        locale={locale}
        title={copy.title}
        summary={copy.summary}
        updatedAt={updated?.toISOString()}
        crumbs={crumbs}
        kicker={t.section}
        actions={actions}
      />
      <div className="mx-auto mt-12 grid max-w-page gap-16 px-4 md:mt-16 md:px-8">
        {all.length === 0 && <p className="text-body text-muted">{t.ui.noData}</p>}
        {blocks.map((views) => (
          <MarketBlock
            key={views[0]?.key ?? 'empty'}
            views={views}
            locale={locale}
            rates={rates}
            heading={id === 'fx' ? views[0]?.name : undefined}
          />
        ))}
        <MarketAbout {...copy.about} />
        <MarketHistory views={all} locale={locale} daily={id === 'fx'} />
        <MarketFaq items={copy.faq} locale={locale} />
        <RelatedMarkets locale={locale} current={url} />
      </div>
      <ToolLinks locale={locale} current={url} />
    </SiteShell>
  )
}

/** A market page as its route renders it: the fuel page offers Agrinvest's diesel delivery. */
export function MarketRoute({ id, locale }: { id: MarketPageId; locale: Locale }) {
  const actions =
    id === 'fuel' ? (
      <Button href={dieselPath(locale)} icon={<ArrowRightIcon />}>
        {marketsUi[locale].ui.dieselDelivery}
      </Button>
    ) : undefined
  return <MarketPage id={id} locale={locale} actions={actions} />
}
