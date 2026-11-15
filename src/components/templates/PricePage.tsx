import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArrowRightIcon } from '@ds/icons/icons'
import { FinanceLinks } from '@ds/patterns/Finance'
import { LineChart } from '@ds/patterns/LineChart'
import { CropBadge } from '@ds/patterns/parts'
import { SectionHeading } from '@ds/patterns/Sections'
import { GrainPrices } from '@ds/patterns/widgets/GrainPrices'
import type { WidgetState } from '@ds/patterns/widgets/types'
import { Badge } from '@ds/primitives/Badge'
import { Button } from '@ds/primitives/Button'
import { JsonLd } from '@/components/JsonLd'
import { ToolLinks } from '@/components/ToolLinks'
import { PageTitle } from '@/components/PageParts'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import { financeUi } from '@/i18n/finance'
import { marketsUi } from '@/i18n/markets'
import { pricesUi } from '@/i18n/prices'
import {
  cropPath,
  cropPricePath,
  marketNotePath,
  marketPath,
  netPricePath,
  pricesPath,
} from '@/i18n/routes'
import { ui } from '@/i18n/ui'
import { financeLinks } from '@/lib/content/finance'
import { getSeoDefaults } from '@/lib/content/globals'
import { listCrops } from '@/lib/content/locations'
import { listMarketNotes } from '@/lib/content/market'
import type { Alternates } from '@/lib/content/pages'
import { formatDate, formatNumber } from '@/lib/format'
import { latestRates } from '@/lib/markets/load'
import { cropMarkets } from '@/lib/markets/registry'
import { seriesLabel, type SeriesLine } from '@/lib/prices/grain'
import { grainItems, grainOverview, type CropOverview } from '@/lib/prices/overview'
import { showOwnPrices } from '@/lib/prices/visibility'
import { breadcrumbs, dataset, faqPage, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'
import { marketSources } from '@/lib/sources'

import {
  coverageOf,
  latestOf,
  MarketBlock,
  MarketFaq,
  MarketHistory,
  MarketHub,
  marketViews,
  pricesHubMetadata,
  RelatedMarkets,
  sourcesOf,
  unitOf,
} from './MarketPages'

/**
 * Grain prices: the hub `/preturi` (`/en/prices`, now the Phase 7f market dashboard in
 * `MarketPages`) and one page per grain crop, `/preturi/{crop}` (`/en/prices/{crop}`): the EU's
 * weekly prices for Romania and the crop's world benchmark (World Bank, monthly). Agrinvest's
 * own prices are hidden while `showOwnPrices` is off (`@/lib/prices/visibility`).
 */

export const CC_BY = 'https://creativecommons.org/licenses/by/4.0/'
const eu = marketSources['eu-agrifood']

const unitOfLine = (line: SeriesLine) =>
  `${line.currency === 'EUR' ? '€' : line.currency}/${line.unit}`

/** `2025-11-10/2026-11-09` from the lines' first and last points. */
function coverage(lines: SeriesLine[]) {
  const dates = lines.flatMap((l) => l.points.map((p) => p.date.getTime()))
  if (!dates.length) return undefined
  const day = (t: number) => new Date(t).toISOString().slice(0, 10)
  return `${day(Math.min(...dates))}/${day(Math.max(...dates))}`
}

function financeItems(locale: Locale) {
  const f = financeUi[locale].crossSell
  return financeLinks(['finantare-stocuri', 'credit-contracte-cereale'], locale).then((links) =>
    [
      links['finantare-stocuri'] && { ...links['finantare-stocuri'], body: f.stock },
      links['credit-contracte-cereale'] && {
        ...links['credit-contracte-cereale'],
        body: f.contract,
      },
    ].filter((x) => !!x),
  )
}

const widgetLabels = (locale: Locale) => {
  const w = pricesUi[locale].widget
  return { agrinvest: w.agrinvest, market: w.eu, onRequest: w.onRequest, empty: w.empty }
}

export async function netPriceMiniProps(locale: Locale, crop?: string) {
  const c = pricesUi[locale].calc
  const crops = await listCrops(locale)
  return {
    locale,
    title: pricesUi[locale].widget.netTitle,
    action: netPricePath(locale),
    crop,
    crops: crops.map((x) => ({ value: x.key, label: x.name })),
    link: { href: netPricePath(locale), label: pricesUi[locale].widget.netLink },
    labels: {
      crop: c.crop,
      choose: c.choose,
      quantity: c.quantity,
      price: c.price,
      moisture: c.moisture,
      impurities: c.impurities,
      submit: c.submit,
    },
  }
}

/** The grain-prices widget's props; also used by the `toolWidget` block. */
export async function grainPricesProps(locale: Locale, title?: string) {
  const overview = await grainOverview(locale)
  const items = grainItems(overview)
  const latest = overview
    .flatMap((c) => (c.latest ? [c.latest.date] : []))
    .sort((a, b) => +b - +a)[0]
  const own = overview.some((c) => c.range)
  // Every crop is listed, with its price or "la cerere" and a link to its page. Stale only
  // when there is market data but all of it is old and no Agrinvest price is published.
  const state: WidgetState = !items.length
    ? 'empty'
    : !own && latest && overview.every((c) => c.state !== 'ready')
      ? 'stale'
      : 'ready'
  return {
    overview,
    props: {
      locale,
      title: title ?? pricesUi[locale].widget.grainTitle,
      state,
      items,
      labels: widgetLabels(locale),
      own: showOwnPrices,
      source: latest ? { name: eu.name, url: eu.url, date: latest } : undefined,
      link: { href: pricesPath(locale), label: pricesUi[locale].widget.grainLink },
    },
  }
}

export { pricesHubMetadata }

/**
 * The hub (Phase 7f): the market dashboard, with the EU's weekly grain prices for Romania after
 * the world grain tiles (when the EU portal has data), then the market note and finance.
 */
export async function PricesHubPage({ locale }: { locale: Locale }) {
  const p = pricesUi[locale]
  const t = p.hub
  const m = marketsUi[locale].hub
  const [{ overview, props }, notes, finance] = await Promise.all([
    grainPricesProps(locale, m.grainLocal),
    listMarketNotes(locale),
    financeItems(locale),
  ])
  const note = notes[0]
  const hasEu = overview.some((c) => c.lines.length)
  return (
    <MarketHub
      locale={locale}
      afterGrain={
        hasEu ? (
          <div className="grid gap-3 lg:max-w-3xl">
            <GrainPrices {...props} level={3} />
            <p className="text-caption text-muted">{m.grainLocalLead}</p>
          </div>
        ) : null
      }
      after={
        <>
          <section className="grid gap-3 rounded-lg bg-surface p-5 ring-1 ring-line md:max-w-3xl">
            <p className="text-small font-medium text-accent">{t.noteKicker}</p>
            {note ? (
              <>
                <h2 className="text-h4 font-semibold">
                  <Link href={marketNotePath(note.slug, locale)} className="text-ink">
                    {note.title}
                  </Link>
                </h2>
                <p className="text-small text-muted">{note.summary}</p>
              </>
            ) : (
              <>
                <h2 className="text-h4 font-semibold">{t.noteTitle}</h2>
                <p className="text-small text-muted">{p.market.empty}</p>
              </>
            )}
            <Link href={marketPath(locale)} className="text-small font-semibold text-accent">
              {t.allNotes}
            </Link>
          </section>
          <FinanceLinks kicker={p.crop.financeKicker} title={p.crop.financeTitle} items={finance} />
        </>
      }
    />
  )
}

function CropLinks({
  locale,
  overview,
  except,
}: {
  locale: Locale
  overview: CropOverview[]
  except?: number
}) {
  return (
    <ul className="flex flex-wrap gap-3">
      {overview
        .filter((c) => c.id !== except)
        .map((c) => (
          <li key={c.id}>
            <Link
              href={c.href}
              className="flex items-center gap-3 rounded-lg bg-raised py-2 pr-4 pl-2 font-semibold text-ink no-underline shadow-soft ring-1 ring-line hover:ring-accent"
            >
              <CropBadge crop={c.key} size="sm" />
              {pricesUi[locale].crop.title(c.name.toLocaleLowerCase(locale))}
            </Link>
          </li>
        ))}
    </ul>
  )
}

export async function cropPriceParams(locale: Locale) {
  return (await listCrops(locale)).map((c) => ({ crop: c.slug as string }))
}

async function resolveCrop(locale: Locale, slug: string) {
  const overview = await grainOverview(locale)
  const crop = overview.find((c) => c.slug === slug)
  if (!crop) return null
  const other: Locale = locale === 'ro' ? 'en' : 'ro'
  const twin = (await listCrops(other)).find((c) => c.id === crop.id)
  const alternates: Alternates = {
    [locale]: crop.href,
    ...(twin ? { [other]: cropPricePath(twin.slug as string, other) } : {}),
  }
  // Romanian names are lower-cased inside a sentence; English keeps the capital.
  const lower = locale === 'ro' ? crop.name.toLocaleLowerCase('ro') : crop.name
  return { crop, overview, alternates, lower }
}

export async function cropPriceMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const found = await resolveCrop(locale, slug)
  if (!found) return {}
  const t = pricesUi[locale].crop
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: t.title(found.lower),
    seoTitle: t.seoTitle(found.lower),
    siteName: seo.siteName,
    description: t.description(found.lower),
    image: seo.ogImage,
    alternates: found.alternates,
  })
}

export async function CropPricePage({ locale, slug }: { locale: Locale; slug: string }) {
  const found = await resolveCrop(locale, slug)
  if (!found) notFound()
  const { crop, overview, alternates, lower } = found
  const p = pricesUi[locale]
  const t = p.crop
  const u = ui[locale]
  const [finance, views, rates] = await Promise.all([
    financeItems(locale),
    marketViews(cropMarkets[crop.key], locale),
    latestRates(),
  ])
  const crumbs = [
    { name: p.section, url: pricesPath(locale) },
    { name: crop.name, url: crop.href },
  ]
  const title = t.title(lower)
  const lastDate = crop.latest?.date
  const world = latestOf(views)
  const updated = [lastDate, world].filter((d): d is Date => !!d).sort((a, b) => +b - +a)[0]
  const faq = t.faq(lower).filter((f) => views.length || !f.world)
  return (
    <SiteShell locale={locale} alternates={alternates}>
      <JsonLd
        data={[
          webPage({
            url: crop.href,
            name: t.seoTitle(lower),
            description: t.description(lower),
            locale,
            dateModified: updated?.toISOString(),
          }),
          breadcrumbs(locale, u.home, crumbs),
          dataset({
            url: crop.href,
            name: p.dataset.name(lower),
            description: p.dataset.description(lower),
            locale,
            temporalCoverage: coverage(crop.lines) ?? coverageOf(views),
            dateModified: updated?.toISOString(),
            variables: [
              ...crop.lines.map((l) => `${seriesLabel(l.series)} (${l.market})`),
              ...views.map((v) => `${v.name} (${unitOf(v.m)})`),
            ],
            sources: [
              ...(crop.lines.length ? [{ name: eu.name, url: eu.url, license: CC_BY }] : []),
              ...sourcesOf(views).map((s) => ({ name: s.name, url: s.url, license: s.licenceUrl })),
            ],
          }),
          faqPage(faq.map((f) => ({ question: f.q, answer: f.a }))),
        ]}
      />
      <PageTitle
        locale={locale}
        title={title}
        summary={t.summary(lower)}
        updatedAt={updated?.toISOString()}
        crumbs={crumbs}
        kicker={p.section}
        actions={
          <Button href={cropPath(crop.slug, locale)} icon={<ArrowRightIcon />}>
            {marketsUi[locale].ui.sellGrain(lower)}
          </Button>
        }
      />

      <div className="mx-auto mt-12 grid max-w-page gap-16 px-4 md:mt-16 md:px-8">
        <section aria-labelledby="piata-ue" className="grid gap-5">
          <SectionHeading id="piata-ue" title={t.marketTitle} lead={t.marketLead} />
          {crop.state === 'stale' && lastDate && (
            <div>
              <Badge tone="warning" dot>
                {t.marketStale(formatDate(lastDate, locale))}
              </Badge>
            </div>
          )}
          {crop.lines.length ? (
            <>
              {crop.latest && (
                <p className="text-body">
                  {t.latest}:{' '}
                  <strong className="tabular-nums">
                    {formatNumber(crop.latest.value, locale)} {unitOfLine(crop.lines[0])}
                  </strong>{' '}
                  ({formatDate(crop.latest.date, locale)}), {crop.latest.change > 0 ? '+' : ''}
                  {formatNumber(crop.latest.change, locale)} {t.change}.
                </p>
              )}
              <LineChart
                title={t.marketTitle}
                unit={unitOfLine(crop.lines[0])}
                locale={locale}
                labels={t.chart}
                series={crop.lines.map((l, i) => ({
                  label: `${seriesLabel(l.series)}, ${l.market}`,
                  points: l.points,
                  tone: (['accent', 'info', 'muted'] as const)[i],
                }))}
              />
              <p className="text-caption text-muted">
                <a href={eu.url} rel="noopener" className="underline underline-offset-2">
                  {eu.attribution[locale]}
                </a>
                {lastDate && ` · ${formatDate(lastDate, locale)}`} ·{' '}
                <a href={CC_BY} rel="license noopener" className="underline underline-offset-2">
                  CC BY 4.0
                </a>
              </p>
            </>
          ) : (
            <p className="max-w-text text-body text-muted">{t.marketEmpty}</p>
          )}
        </section>

        {views.length > 0 && (
          <section aria-labelledby="piata-mondiala" className="grid gap-5">
            <SectionHeading id="piata-mondiala" title={t.worldTitle} lead={t.worldLead} />
            <MarketBlock views={views} locale={locale} rates={rates} headingLevel={3} />
          </section>
        )}
        <MarketHistory views={views} locale={locale} />
        <MarketFaq items={faq} locale={locale} />
      </div>

      <div className="mt-16 grid gap-20 md:mt-24 md:gap-28">
        <FinanceLinks kicker={t.financeKicker} title={t.financeTitle} items={finance} />
        <section className="mx-auto grid w-full max-w-page gap-12 px-4 md:px-8">
          <div>
            <SectionHeading kicker={u.crops} title={t.others} className="mb-8" />
            <CropLinks locale={locale} overview={overview} except={crop.id} />
            <p className="mt-6 text-small">
              <Link href={cropPath(crop.slug, locale)} className="font-semibold text-accent">
                {t.cropPage(lower)}
              </Link>
            </p>
          </div>
          <RelatedMarkets locale={locale} current={crop.href} />
        </section>
      </div>
      <ToolLinks locale={locale} current={crop.href} />
    </SiteShell>
  )
}
