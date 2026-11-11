import type { Metadata } from 'next'
import Link from 'next/link'

import { ArticleCard } from '@ds/patterns/Articles'
import { LeadFormLazy, SubscribeFormLazy } from '@ds/patterns/Lazy'
import { LineChart } from '@ds/patterns/LineChart'
import { Callout, SectionHeading } from '@ds/patterns/Sections'
import { JsonLd } from '@/components/JsonLd'
import { PageTitle } from '@/components/PageParts'
import { SiteShell } from '@/components/SiteShell'
import { localePath, type Locale } from '@/i18n/config'
import { pricesUi } from '@/i18n/prices'
import {
  categoryPath,
  dieselPath,
  fertiliserPricesPath,
  marketNotePath,
  marketPath,
  newsPath,
  pricesPath,
  productPath,
  sections,
} from '@/i18n/routes'
import { articlesUi } from '@/i18n/articles'
import { toolsUi } from '@/i18n/tools'
import { fixedUrl, ui } from '@/i18n/ui'
import { getSeoDefaults } from '@/lib/content/globals'
import { listCounties } from '@/lib/content/locations'
import { listArticles } from '@/lib/content/articles'
import { listMarketNotes } from '@/lib/content/market'
import type { Alternates } from '@/lib/content/pages'
import { listCategories, listProducts } from '@/lib/content/shop'
import { getDieselPrice, nationalDiesel } from '@/lib/diesel/load'
import { formatDate, formatNumber, formatShortDate } from '@/lib/format'
import { submitLead } from '@/lib/leads/actions'
import { listHeadlines } from '@/lib/news/load'
import { breadcrumbs, dataset, itemList, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'
import { marketSources } from '@/lib/sources'
import { subscribe } from '@/lib/subscriptions/actions'

import { packLabel, PriceMark, unitPriceLabel } from './ShopParts'
import { CC_BY } from './PricePage'
import { ToolLinks } from '@/components/ToolLinks'
import { innerUi } from '@/i18n/inner'

/**
 * Fertiliser prices (5.3), diesel (5.4) and news (5.6): one page each, in both languages. Kept
 * deliberately simple: the numbers come from the shop, `DieselPrices`, the Oil Bulletin and
 * the feeds, each with its source and date.
 */

async function meta(
  locale: Locale,
  t: { title: string; seoTitle: string; description: string },
  alternates: Alternates,
  noindex = false,
): Promise<Metadata> {
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: t.title,
    seoTitle: t.seoTitle,
    siteName: seo.siteName,
    description: t.description,
    image: seo.ogImage,
    alternates,
    noindex,
  })
}

/* ------------------------------------------------------------------ fertilisers */

export const fertiliserAlternates: Alternates = {
  ro: fertiliserPricesPath('ro'),
  en: fertiliserPricesPath('en'),
}

/** The shop's fertiliser categories, by their Romanian slug. */
const fertiliserCategories = ['ingrasaminte', 'fertilizanti-foliare']

async function fertiliserProducts(locale: Locale) {
  const [ro, mine, products] = await Promise.all([
    listCategories('ro'),
    listCategories(locale),
    listProducts(locale),
  ])
  const ids = new Set(
    ro.filter((c) => fertiliserCategories.includes(c.slug as string)).map((c) => c.id),
  )
  const groups = mine
    .filter((c) => ids.has(c.id))
    .map((c) => ({
      id: c.id,
      name: c.name,
      href: categoryPath(c.slug as string, locale),
      products: products
        .filter(
          (p) => p.category.id === c.id || p.category.parent === c.id || p.secondary.includes(c.id),
        )
        .sort((a, b) => a.name.localeCompare(b.name, locale)),
    }))
    .filter((g) => g.products.length)
  return groups
}

export const fertiliserMetadata = (locale: Locale) =>
  meta(locale, toolsUi[locale].fert, fertiliserAlternates)

export async function FertiliserPricesPage({ locale }: { locale: Locale }) {
  const t = toolsUi[locale].fert
  const p = pricesUi[locale]
  const url = fertiliserPricesPath(locale)
  const groups = await fertiliserProducts(locale)
  const all = groups.flatMap((g) => g.products)
  const updated = all
    .map((x) => x.updatedAt)
    .sort()
    .pop()
  const crumbs = [
    { name: p.section, url: pricesPath(locale) },
    { name: t.title, url },
  ]
  return (
    <SiteShell locale={locale} alternates={fertiliserAlternates}>
      <JsonLd
        data={[
          webPage({
            url,
            name: t.seoTitle,
            description: t.description,
            locale,
            dateModified: updated,
          }),
          breadcrumbs(locale, ui[locale].home, crumbs),
          dataset({
            url,
            name: t.dataset,
            description: t.datasetDescription,
            locale,
            dateModified: updated,
            variables: all.map((x) => x.name),
            sources: [{ name: 'Agrinvest', url: localePath(sections.shop[locale], locale) }],
          }),
        ]}
      />
      <PageTitle
        locale={locale}
        title={t.title}
        summary={t.summary}
        updatedAt={updated}
        crumbs={crumbs}
        kicker={p.section}
      />
      <div className="mx-auto mt-12 grid max-w-page gap-12 px-4 md:mt-16 md:px-8">
        {groups.length === 0 && <p className="text-body text-muted">{t.empty}</p>}
        {groups.map((g) => (
          <section key={g.id} aria-labelledby={`grupa-${g.id}`} className="grid gap-4">
            <h2 id={`grupa-${g.id}`} className="text-h3 font-semibold">
              <Link href={g.href} className="text-ink">
                {g.name}
              </Link>
            </h2>
            <div className="overflow-hidden rounded-lg bg-raised shadow-soft ring-1 ring-line">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">
                  {t.title}: {g.name}
                </caption>
                <thead>
                  <tr className="bg-surface text-small text-muted">
                    <th scope="col" className="py-3 pr-3 pl-4 font-medium md:pl-6">
                      {t.product}
                    </th>
                    <th scope="col" className="hidden px-3 py-3 font-medium sm:table-cell">
                      {t.pack}
                    </th>
                    <th scope="col" className="px-3 py-3 text-right font-medium">
                      {t.price}
                    </th>
                    <th
                      scope="col"
                      className="hidden py-3 pr-4 pl-3 text-right font-medium md:table-cell md:pr-6"
                    >
                      {t.perUnit}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {g.products.flatMap((x) => {
                    const variants = x.variants.length ? x.variants : [null]
                    return variants.map((v, i) => (
                      <tr key={`${x.id}-${v?.sku ?? i}`} className="border-t border-line align-top">
                        <th scope="row" className="py-3 pr-3 pl-4 font-semibold md:pl-6">
                          {i === 0 ? (
                            <Link
                              href={productPath(x.category.slug, x.slug, locale)}
                              className="text-ink"
                            >
                              {x.name}
                            </Link>
                          ) : (
                            <span className="sr-only">{x.name}</span>
                          )}
                          {v && (
                            <span className="block text-caption font-normal text-muted sm:hidden">
                              {packLabel(v, locale)}
                            </span>
                          )}
                        </th>
                        <td className="hidden px-3 py-3 text-small text-muted sm:table-cell">
                          {v ? packLabel(v, locale) : ''}
                        </td>
                        <td className="px-3 py-3 text-right whitespace-nowrap tabular-nums">
                          {v?.price != null ? (
                            <>
                              {formatNumber(v.price, locale)} lei{' '}
                              <PriceMark product={x} locale={locale} />
                            </>
                          ) : (
                            <span className="text-small text-muted">{t.noPrice}</span>
                          )}
                        </td>
                        <td className="hidden py-3 pr-4 pl-3 text-right text-small whitespace-nowrap text-muted tabular-nums md:table-cell md:pr-6">
                          {v ? (unitPriceLabel(v, locale) ?? '') : ''}
                        </td>
                      </tr>
                    ))
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
        <p className="max-w-text text-small text-muted">{t.note}</p>
      </div>
      <ToolLinks locale={locale} current={url} />
    </SiteShell>
  )
}

/* ------------------------------------------------------------------ diesel */

export const dieselAlternates: Alternates = { ro: dieselPath('ro'), en: dieselPath('en') }

export const dieselMetadata = (locale: Locale) =>
  meta(locale, toolsUi[locale].diesel, dieselAlternates)

export async function DieselPage({ locale }: { locale: Locale }) {
  const t = toolsUi[locale].diesel
  const url = dieselPath(locale)
  const [own, series, counties] = await Promise.all([
    getDieselPrice(locale),
    nationalDiesel(),
    listCounties(),
  ])
  const last = series[series.length - 1]
  const source = marketSources['eu-oil-bulletin']
  const crumbs = [{ name: t.title, url }]
  const unit = last ? `€/${last.unit}` : '€/1000 l'
  const days = series.map((s) => s.date.toISOString().slice(0, 10))
  const updated = [own?.validFrom, last?.date.toISOString()].filter(Boolean).sort().pop()
  return (
    <SiteShell locale={locale} alternates={dieselAlternates}>
      <JsonLd
        data={[
          webPage({
            url,
            name: t.seoTitle,
            description: t.description,
            locale,
            dateModified: updated,
          }),
          breadcrumbs(locale, ui[locale].home, crumbs),
          dataset({
            url,
            name: t.dataset,
            description: t.datasetDescription,
            locale,
            temporalCoverage: days.length ? `${days[0]}/${days[days.length - 1]}` : undefined,
            dateModified: updated,
            variables: [t.ownTitle, t.nationalTitle],
            sources: [
              { name: 'Agrinvest', url },
              ...(last ? [{ name: source.name, url: source.url, license: CC_BY }] : []),
            ],
          }),
        ]}
      />
      <PageTitle
        locale={locale}
        title={t.title}
        summary={t.summary}
        updatedAt={updated}
        crumbs={crumbs}
        kicker={pricesUi[locale].section}
      />
      <div className="mx-auto mt-12 grid max-w-page gap-16 px-4 md:mt-16 md:px-8">
        <section aria-labelledby="pret-motorina" className="grid gap-5">
          <SectionHeading id="pret-motorina" title={t.ownTitle} lead={t.ownLead} />
          {own ? (
            <div className="grid max-w-text gap-2 rounded-lg bg-raised p-6 shadow-soft ring-1 ring-line">
              <p className="text-figure font-semibold tabular-nums">
                {formatNumber(own.price, locale)}{' '}
                <span className="text-body font-normal text-muted">lei/l, {t.vat[own.vat]}</span>
              </p>
              <p className="text-small text-muted">
                {t.validFrom} {formatDate(new Date(own.validFrom), locale)}
              </p>
              {own.minimumLitres != null && (
                <p className="text-small text-muted">
                  {t.minimum(formatNumber(own.minimumLitres, locale))}
                </p>
              )}
              {own.counties.length > 0 && (
                <p className="text-small text-muted">
                  {t.counties}: {own.counties.join(', ')}
                </p>
              )}
              {own.note && <p className="text-small text-muted">{own.note}</p>}
            </div>
          ) : (
            <Callout tone="note" title={t.onRequest}>
              {t.onRequestBody}
            </Callout>
          )}
        </section>
        <section aria-labelledby="pret-national" className="grid gap-5">
          <SectionHeading id="pret-national" title={t.nationalTitle} lead={t.nationalLead} />
          {last ? (
            <>
              <p className="text-body">
                {t.latest} ({formatDate(last.date, locale)}):{' '}
                <strong className="tabular-nums">
                  {formatNumber(last.value, locale)} {unit}
                </strong>
                , {t.perLitre(formatNumber(last.value / 1000, locale, 2))}.
              </p>
              <LineChart
                title={t.nationalTitle}
                unit={unit}
                locale={locale}
                labels={t.chart}
                decimals={0}
                series={[{ label: t.nationalTitle, points: series }]}
              />
            </>
          ) : (
            <p className="text-body text-muted">{t.empty}</p>
          )}
          <p className="text-caption text-muted">
            <a href={source.url} rel="noopener" className="underline underline-offset-2">
              {source.attribution[locale]}
            </a>
            {last && ` · ${formatDate(last.date, locale)}`} ·{' '}
            <a href={CC_BY} rel="license noopener" className="underline underline-offset-2">
              CC BY 4.0
            </a>
          </p>
        </section>
      </div>
      <section
        id="cerere"
        className="mx-auto mt-16 w-full max-w-page scroll-mt-24 px-4 md:mt-24 md:px-8"
      >
        <div className="mx-auto max-w-3xl rounded-xl bg-raised p-6 shadow-raised ring-1 ring-line md:p-10">
          <LeadFormLazy
            locale={locale}
            type="motorina"
            action={submitLead}
            heading={t.formTitle}
            body={t.formBody}
            extra={['county', 'quantity', 'deliveryDate']}
            options={{ county: counties.map((c) => ({ value: String(c.id), label: c.name })) }}
            sourcePath={url}
            privacyHref={fixedUrl('privacy', locale)}
          />
        </div>
      </section>
      <p className="mx-auto mt-10 w-full max-w-page px-4 md:px-8">
        <Link
          href={localePath(locale === 'ro' ? '/logistica' : '/logistics', locale)}
          className="font-semibold text-accent"
        >
          {t.logistics}
        </Link>
      </p>
      <ToolLinks locale={locale} current={url} />
    </SiteShell>
  )
}

/* ------------------------------------------------------------------ news */

export const newsAlternates: Alternates = { ro: newsPath('ro'), en: newsPath('en') }

export const newsMetadata = async (locale: Locale) => {
  const [headlines, own] = await Promise.all([listHeadlines(1), listArticles(locale, 'stiri')])
  return meta(locale, toolsUi[locale].news, newsAlternates, !headlines.length && !own.length)
}

/** The press feed shows this many headlines; the rest wait behind one button. */
const FEED_FIRST = 12

type Headline = Awaited<ReturnType<typeof listHeadlines>>[number]

/** A compact list: date and source, then the headline. The summary stays on the source. */
function HeadlineList({ headlines, locale }: { headlines: Headline[]; locale: Locale }) {
  return (
    <ol className="grid divide-y divide-line border-y border-line">
      {headlines.map((h) => {
        const date = new Date(h.publishedAt)
        return (
          <li key={h.id} className="grid gap-1 py-4 md:grid-cols-[9rem_1fr] md:gap-6">
            <div className="flex items-baseline gap-2 text-caption text-subtle md:grid md:content-start md:gap-0.5">
              <time dateTime={date.toISOString()} className="font-semibold text-ink">
                {formatShortDate(date, locale)}
              </time>
              <span>{h.source}</span>
            </div>
            <a
              href={h.url}
              rel="noopener"
              lang="ro"
              className="text-body leading-snug font-semibold text-ink hover:text-accent"
            >
              {h.title}
            </a>
          </li>
        )
      })}
    </ol>
  )
}

/**
 * `/stiri`: Agrinvest's own news first (a lead story and a grid of cards, written in the
 * admin), then the farm-press headlines beside the market notes and the newsletter.
 */
export async function NewsPage({ locale }: { locale: Locale }) {
  const t = toolsUi[locale].news
  const a = articlesUi[locale].news
  const p = pricesUi[locale]
  const url = newsPath(locale)
  const [headlines, notes, own] = await Promise.all([
    listHeadlines(40),
    listMarketNotes(locale),
    listArticles(locale, 'stiri'),
  ])
  const crumbs = [{ name: t.title, url }]
  const [lead, ...more] = own
  return (
    <SiteShell locale={locale} alternates={newsAlternates}>
      <JsonLd
        data={[
          webPage({ url, name: t.seoTitle, description: t.description, locale }),
          breadcrumbs(locale, ui[locale].home, crumbs),
          ...(headlines.length || own.length
            ? [
                itemList([
                  ...own.map((n) => ({ name: n.title, url: n.href })),
                  ...headlines.map((h) => ({ name: h.title, url: h.url })),
                ]),
              ]
            : []),
        ]}
      />
      <PageTitle locale={locale} title={t.title} summary={t.summary} crumbs={crumbs} />
      {lead && (
        <section
          aria-labelledby="agrinvest"
          className="mx-auto mt-12 grid max-w-page gap-8 px-4 md:mt-16 md:px-8"
        >
          <SectionHeading id="agrinvest" kicker={a.kicker} title={a.latest} />
          <ArticleCard
            variant="feature"
            locale={locale}
            href={lead.href}
            title={lead.title}
            summary={lead.summary}
            date={lead.date}
            image={lead.image}
            priority
          />
          {more.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {more.slice(0, 9).map((n) => (
                <ArticleCard
                  key={n.id}
                  locale={locale}
                  href={n.href}
                  title={n.title}
                  summary={n.summary}
                  date={n.date}
                  image={n.image}
                />
              ))}
            </div>
          )}
        </section>
      )}
      <div className="mx-auto mt-16 grid max-w-page gap-12 px-4 md:mt-20 md:px-8 lg:grid-cols-12">
        <section aria-labelledby="flux" className="grid content-start gap-6 lg:col-span-8">
          <h2 id="flux" className="text-h3 font-semibold">
            {t.feed}
          </h2>
          {headlines.length ? (
            <>
              <HeadlineList headlines={headlines.slice(0, FEED_FIRST)} locale={locale} />
              {headlines.length > FEED_FIRST && (
                <details className="group">
                  <summary className="inline-flex h-12 cursor-pointer list-none items-center rounded-md bg-raised px-6 font-semibold text-ink shadow-soft ring-1 ring-line-strong ring-inset group-open:hidden [&::-webkit-details-marker]:hidden">
                    {innerUi[locale].moreNews(headlines.length - FEED_FIRST)}
                  </summary>
                  <HeadlineList headlines={headlines.slice(FEED_FIRST)} locale={locale} />
                </details>
              )}
            </>
          ) : (
            <p className="text-body text-muted">{t.empty}</p>
          )}
        </section>
        <aside className="grid content-start gap-8 lg:col-span-4">
          <div className="grid gap-8 lg:sticky lg:top-24">
            <section
              aria-labelledby="note"
              className="grid gap-3 rounded-xl bg-surface p-6 ring-1 ring-line"
            >
              <h2 id="note" className="text-h4 font-semibold">
                {t.own}
              </h2>
              {notes.length ? (
                <ul className="grid gap-2">
                  {notes.slice(0, 5).map((n) => (
                    <li key={n.id}>
                      <Link
                        href={marketNotePath(n.slug, locale)}
                        className="text-small font-semibold text-ink hover:text-accent"
                      >
                        {n.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-small text-muted">{p.market.empty}</p>
              )}
              <Link href={marketPath(locale)} className="text-small font-semibold text-accent">
                {p.hub.allNotes}
              </Link>
            </section>
            <div
              id="buletin"
              className="scroll-mt-24 rounded-xl bg-raised p-6 shadow-soft ring-1 ring-line"
            >
              <SubscribeFormLazy
                locale={locale}
                action={subscribe}
                topic="newsletter"
                heading={t.newsletterTitle}
                body={t.newsletterBody}
                sourcePath={url}
                privacyHref={fixedUrl('privacy', locale)}
                labels={{ ...p.alert, submit: t.newsletterSubmit }}
              />
            </div>
          </div>
        </aside>
      </div>
      <ToolLinks locale={locale} current={url} />
    </SiteShell>
  )
}
