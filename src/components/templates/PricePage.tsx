import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArrowRightIcon } from '@ds/icons/icons'
import { FinanceLinks } from '@ds/patterns/Finance'
import { LineChart } from '@ds/patterns/LineChart'
import { SubscribeFormLazy } from '@ds/patterns/Lazy'
import { CropBadge } from '@ds/patterns/parts'
import { Callout, SectionHeading } from '@ds/patterns/Sections'
import { GrainPrices } from '@ds/patterns/widgets/GrainPrices'
import { NetPriceMini } from '@ds/patterns/widgets/NetPriceMini'
import type { WidgetState } from '@ds/patterns/widgets/types'
import { Badge } from '@ds/primitives/Badge'
import { Button } from '@ds/primitives/Button'
import { JsonLd } from '@/components/JsonLd'
import { ToolLinks } from '@/components/ToolLinks'
import { PageTitle } from '@/components/PageParts'
import { LeadFormBlock } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import { financeUi } from '@/i18n/finance'
import { pricesUi } from '@/i18n/prices'
import {
  cropPath,
  cropPricePath,
  marketNotePath,
  marketPath,
  netPricePath,
  pricesPath,
  sections,
} from '@/i18n/routes'
import { fixedUrl, ui } from '@/i18n/ui'
import { financeLinks } from '@/lib/content/finance'
import { getSeoDefaults } from '@/lib/content/globals'
import { listCrops } from '@/lib/content/locations'
import { listMarketNotes } from '@/lib/content/market'
import type { Alternates } from '@/lib/content/pages'
import { formatDate, formatNumber } from '@/lib/format'
import { seriesLabel, type SeriesLine } from '@/lib/prices/grain'
import { grainItems, grainOverview, type CropOverview } from '@/lib/prices/overview'
import { breadcrumbs, dataset, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'
import { marketSources } from '@/lib/sources'
import { subscribe } from '@/lib/subscriptions/actions'

/**
 * Grain prices (Phase 5.2): the hub `/preturi` (`/en/prices`) and one page per grain crop,
 * `/preturi/{crop}` (`/en/prices/{crop}`). Agrinvest's price shows only from published
 * `BuyPrices` rows, otherwise "price on request"; the market series are the EU's weekly prices
 * for Romania, each with its source and date.
 */

export const CC_BY = 'https://creativecommons.org/licenses/by/4.0/'
const eu = marketSources['eu-agrifood']

export const hubAlternates: Alternates = { ro: pricesPath('ro'), en: pricesPath('en') }

const unitOf = (line: SeriesLine) => `${line.currency === 'EUR' ? '€' : line.currency}/${line.unit}`

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
  // Empty: nothing to show at all. Stale: only market data, and all of it old.
  const state: WidgetState =
    !own && !latest
      ? 'empty'
      : !own && overview.every((c) => c.state !== 'ready')
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
      source: latest ? { name: eu.name, url: eu.url, date: latest } : undefined,
      link: { href: pricesPath(locale), label: pricesUi[locale].widget.grainLink },
    },
  }
}

export async function pricesHubMetadata(locale: Locale): Promise<Metadata> {
  const t = pricesUi[locale].hub
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

export async function PricesHubPage({ locale }: { locale: Locale }) {
  const p = pricesUi[locale]
  const t = p.hub
  const url = pricesPath(locale)
  const [{ overview, props }, notes, finance, mini] = await Promise.all([
    grainPricesProps(locale, t.tableTitle),
    listMarketNotes(locale),
    financeItems(locale),
    netPriceMiniProps(locale),
  ])
  const note = notes[0]
  const crumbs = [{ name: p.section, url }]
  const lines = overview.flatMap((c) => c.lines)
  return (
    <SiteShell locale={locale} alternates={hubAlternates}>
      <JsonLd
        data={[
          webPage({ url, name: t.seoTitle, description: t.description, locale }),
          breadcrumbs(locale, ui[locale].home, crumbs),
          dataset({
            url,
            name: p.dataset.hubName,
            description: p.dataset.hubDescription,
            locale,
            temporalCoverage: coverage(lines),
            variables: overview.map((c) => c.name),
            sources: [{ name: eu.name, url: eu.url, license: CC_BY }],
          }),
        ]}
      />
      <PageTitle locale={locale} title={t.title} summary={t.summary} crumbs={crumbs} />
      <div className="mx-auto mt-12 grid max-w-page gap-10 px-4 md:mt-16 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <GrainPrices {...props} level={2} />
        </div>
        <div className="grid content-start gap-6 lg:col-span-5">
          <section className="grid gap-3 rounded-lg bg-surface p-5 ring-1 ring-line">
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
          <NetPriceMini {...mini} />
        </div>
      </div>
      <div className="mt-16 grid gap-16 md:mt-24">
        <section className="mx-auto w-full max-w-page px-4 md:px-8">
          <SectionHeading kicker={ui[locale].crops} title={p.crop.others} className="mb-8" />
          <CropLinks locale={locale} overview={overview} />
        </section>
        <FinanceLinks kicker={p.crop.financeKicker} title={p.crop.financeTitle} items={finance} />
      </div>
      <ToolLinks locale={locale} current={pricesPath(locale)} />
    </SiteShell>
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
  const [finance, mini] = await Promise.all([
    financeItems(locale),
    netPriceMiniProps(locale, crop.key),
  ])
  const crumbs = [
    { name: p.section, url: pricesPath(locale) },
    { name: crop.name, url: crop.href },
  ]
  const title = t.title(lower)
  const lastDate = crop.latest?.date
  const leadPath = `${sections.prices[locale]}/${crop.slug}`
  const updated = crop.range?.date ?? lastDate
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
            temporalCoverage: coverage(crop.lines),
            dateModified: updated?.toISOString(),
            variables: [
              p.hub.agrinvest,
              ...crop.lines.map((l) => `${seriesLabel(l.series)} (${l.market})`),
            ],
            sources: [
              { name: 'Agrinvest', url: crop.href },
              ...(crop.lines.length ? [{ name: eu.name, url: eu.url, license: CC_BY }] : []),
            ],
          }),
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
          <>
            <Button href="#cerere" icon={<ArrowRightIcon />}>
              {t.askPrice}
            </Button>
            <Button href="#alerta" variant="secondary">
              {p.alert.submit}
            </Button>
          </>
        }
      />

      <div className="mx-auto mt-12 grid max-w-page gap-16 px-4 md:mt-16 md:px-8">
        <section aria-labelledby="pret-agrinvest" className="grid gap-5">
          <SectionHeading id="pret-agrinvest" title={t.agrinvestTitle} lead={t.agrinvestLead} />
          {crop.bases.length ? (
            <BaseTable locale={locale} rows={crop.bases} />
          ) : (
            <Callout tone="note" title={t.onRequest}>
              {t.onRequestBody}
            </Callout>
          )}
        </section>

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
                    {formatNumber(crop.latest.value, locale)} {unitOf(crop.lines[0])}
                  </strong>{' '}
                  ({formatDate(crop.latest.date, locale)}), {crop.latest.change > 0 ? '+' : ''}
                  {formatNumber(crop.latest.change, locale)} {t.change}.
                </p>
              )}
              <LineChart
                title={t.marketTitle}
                unit={unitOf(crop.lines[0])}
                locale={locale}
                labels={t.chart}
                series={crop.lines.map((l, i) => ({
                  label: `${seriesLabel(l.series)}, ${l.market}`,
                  points: l.points,
                  tone: (['accent', 'info', 'muted'] as const)[i],
                }))}
              />
            </>
          ) : (
            <p className="max-w-text text-body text-muted">{t.marketEmpty}</p>
          )}
          <p className="text-caption text-muted">
            <a href={eu.url} rel="noopener" className="underline underline-offset-2">
              {eu.attribution[locale]}
            </a>
            {lastDate && ` · ${formatDate(lastDate, locale)}`} ·{' '}
            <a href={CC_BY} rel="license noopener" className="underline underline-offset-2">
              CC BY 4.0
            </a>
          </p>
        </section>
      </div>

      <div className="mt-16 grid gap-20 md:mt-24 md:gap-28">
        <LeadFormBlock
          block={{
            leadType: 'vanzare-cereale',
            extraFields: ['county', 'crop', 'base'],
            heading: t.sellTitle(lower),
            body: t.sellBody,
          }}
          preset={{ crop: String(crop.id) }}
          locale={locale}
          path={leadPath}
        />
        <section className="mx-auto grid w-full max-w-page gap-8 px-4 md:px-8 lg:grid-cols-12">
          <div
            id="alerta"
            className="scroll-mt-24 rounded-xl bg-raised p-6 shadow-raised ring-1 ring-line md:p-8 lg:col-span-7"
          >
            <SubscribeFormLazy
              locale={locale}
              action={subscribe}
              heading={t.alertTitle(lower)}
              body={t.alertBody}
              crop={String(crop.id)}
              sourcePath={crop.href}
              privacyHref={fixedUrl('privacy', locale)}
              labels={p.alert}
            />
          </div>
          <div className="lg:col-span-5">
            <NetPriceMini {...mini} />
          </div>
        </section>
        <FinanceLinks kicker={t.financeKicker} title={t.financeTitle} items={finance} />
        <section className="mx-auto w-full max-w-page px-4 md:px-8">
          <SectionHeading kicker={u.crops} title={t.others} className="mb-8" />
          <CropLinks locale={locale} overview={overview} except={crop.id} />
          <p className="mt-6 text-small">
            <Link href={cropPath(crop.slug, locale)} className="font-semibold text-accent">
              {t.cropPage(lower)}
            </Link>
          </p>
        </section>
      </div>
      <ToolLinks locale={locale} current={crop.href} />
    </SiteShell>
  )
}

function BaseTable({ locale, rows }: { locale: Locale; rows: CropOverview['bases'] }) {
  const t = pricesUi[locale].crop
  return (
    <div className="overflow-hidden rounded-lg bg-raised shadow-soft ring-1 ring-line">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{t.agrinvestTitle}</caption>
        <thead>
          <tr className="bg-surface text-small text-muted">
            <th scope="col" className="py-3 pr-3 pl-4 font-medium md:pl-6">
              {t.base}
            </th>
            <th scope="col" className="px-3 py-3 text-right font-medium">
              {t.price}
            </th>
            <th scope="col" className="hidden px-3 py-3 font-medium md:table-cell">
              {t.basis}
            </th>
            <th scope="col" className="py-3 pr-4 pl-3 font-medium md:pr-6">
              {t.validFrom}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.base?.id ?? 'all'} className="border-t border-line align-top">
              <th scope="row" className="py-3 pr-3 pl-4 font-semibold md:pl-6">
                {r.base?.name ?? t.allBases}
                {r.note && (
                  <span className="block text-caption font-normal text-muted">{r.note}</span>
                )}
              </th>
              <td className="px-3 py-3 text-right font-semibold whitespace-nowrap tabular-nums">
                {formatNumber(r.price, locale, 0)}{' '}
                <span className="text-caption font-normal text-muted">lei/t</span>
              </td>
              <td className="hidden px-3 py-3 text-small text-muted md:table-cell">
                {t.basisLabel[r.basis]}
              </td>
              <td className="py-3 pr-4 pl-3 text-small whitespace-nowrap text-muted md:pr-6">
                {formatDate(new Date(r.validFrom), locale)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
