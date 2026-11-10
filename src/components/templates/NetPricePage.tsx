import type { Metadata } from 'next'

import { ArrowRightIcon } from '@ds/icons/icons'
import { ReviewNote, SourceList } from '@ds/patterns/Finance'
import { Callout } from '@ds/patterns/Sections'
import { Button } from '@ds/primitives/Button'
import { SelectField, TextField } from '@ds/primitives/Field'
import { JsonLd } from '@/components/JsonLd'
import { ToolLinks } from '@/components/ToolLinks'
import { PageTitle } from '@/components/PageParts'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import { pricesUi } from '@/i18n/prices'
import { cropPricePath, netPricePath, pricesPath } from '@/i18n/routes'
import { fixedUrl, ui } from '@/i18n/ui'
import { getSeoDefaults } from '@/lib/content/globals'
import { listCrops } from '@/lib/content/locations'
import type { Alternates } from '@/lib/content/pages'
import { formatDate, formatNumber, formatQuantity } from '@/lib/format'
import {
  netPrice,
  netPriceParams,
  parseNetPrice,
  type NetPriceResult,
  type Parsed,
  type RawParams,
} from '@/lib/prices/net-price'
import { netPriceRules, netPriceSources } from '@/lib/prices/net-price-rules'
import { breadcrumbs, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'

/**
 * `/preturi/calculator-pret-net` and `/en/prices/net-price-calculator`: a GET form that posts
 * back to the page and works without JavaScript. A URL with parameters is noindex, with the
 * canonical on the clean page.
 */
export const netPriceAlternates: Alternates = { ro: netPricePath('ro'), en: netPricePath('en') }

export const hasNetPriceParams = (params: RawParams) =>
  netPriceParams.some((p) => params[p] !== undefined)

export async function netPriceMetadata(locale: Locale, noindex = false): Promise<Metadata> {
  const t = pricesUi[locale].calc
  const seo = await getSeoDefaults(locale)
  return buildMetadata({
    locale,
    title: t.title,
    seoTitle: t.seoTitle,
    siteName: seo.siteName,
    description: t.description,
    image: seo.ogImage,
    alternates: netPriceAlternates,
    noindex,
  })
}

function Form({
  locale,
  parsed,
  crops,
}: {
  locale: Locale
  parsed: Parsed
  crops: { value: string; label: string }[]
}) {
  const t = pricesUi[locale].calc
  const e = (p: keyof typeof t.errors) => (parsed.errors[p] ? t.errors[p] : undefined)
  const v = parsed.values
  return (
    <form
      id="calculator"
      method="get"
      action={`${netPricePath(locale)}#rezultat`}
      noValidate
      className="grid content-start gap-5 rounded-lg bg-surface p-5 ring-1 ring-line md:p-6"
    >
      <h2 className="text-h4 font-semibold text-ink">{t.form}</h2>
      <SelectField
        name="cultura"
        label={t.crop}
        defaultValue={v.cultura}
        error={e('cultura')}
        options={[{ value: '', label: t.choose }, ...crops]}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="cantitate"
          label={t.quantity}
          inputMode="decimal"
          suffix="t"
          defaultValue={v.cantitate}
          error={e('cantitate')}
        />
        <TextField
          name="pret"
          label={t.price}
          inputMode="decimal"
          suffix="lei/t"
          defaultValue={v.pret}
          error={e('pret')}
        />
        <TextField
          name="umiditate"
          label={t.moisture}
          inputMode="decimal"
          suffix="%"
          defaultValue={v.umiditate}
          error={e('umiditate')}
        />
        <TextField
          name="impuritati"
          label={t.impurities}
          inputMode="decimal"
          suffix="%"
          defaultValue={v.impuritati}
          error={e('impuritati')}
        />
        <TextField
          name="hl"
          label={t.hectolitre}
          inputMode="decimal"
          suffix="kg/hl"
          defaultValue={v.hl}
          error={e('hl')}
          className="sm:col-span-2"
        />
      </div>
      <fieldset className="grid gap-4 border-t border-line pt-5">
        <legend className="mb-1 text-small font-medium text-ink">{t.limits}</legend>
        <p className="text-caption text-muted">{t.limitsHint}</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="umiditate_baza"
            label={t.baseMoisture}
            inputMode="decimal"
            suffix="%"
            defaultValue={v.umiditate_baza}
            error={e('umiditate_baza')}
          />
          <TextField
            name="impuritati_baza"
            label={t.baseImpurities}
            inputMode="decimal"
            suffix="%"
            defaultValue={v.impuritati_baza}
            error={e('impuritati_baza')}
          />
          <TextField
            name="hl_minim"
            label={t.minHectolitre}
            inputMode="decimal"
            suffix="kg/hl"
            defaultValue={v.hl_minim}
            error={e('hl_minim')}
            className="sm:col-span-2"
          />
        </div>
      </fieldset>
      <Button type="submit" icon={<ArrowRightIcon />}>
        {t.submit}
      </Button>
    </form>
  )
}

function Result({
  locale,
  result,
  minHectolitre,
}: {
  locale: Locale
  result: NetPriceResult
  minHectolitre?: number
}) {
  const t = pricesUi[locale].calc
  const tonnes = (v: number) => formatQuantity(v, 't', locale, 3)
  const lei = (v: number) => formatQuantity(v, 'lei', locale, 0)
  const rows: [string, string, string?][] = [
    [t.rows.gross, tonnes(result.gross.quantity)],
    [
      t.rows.moisture,
      `− ${tonnes(result.moisture.deducted)}`,
      `${formatNumber(result.moisture.percent, locale)} %`,
    ],
    [
      t.rows.impurities,
      `− ${tonnes(result.impurities.deducted)}`,
      `${formatNumber(result.impurities.percent, locale)} %`,
    ],
    [t.rows.net, tonnes(result.net.quantity)],
    [t.rows.grossValue, lei(result.gross.value)],
    [t.rows.netValue, lei(result.net.value)],
    [t.rows.perTonne, `${formatNumber(result.net.pricePerGrossTonne, locale, 0)} lei/t`],
  ]
  return (
    <div className="grid gap-5">
      <dl className="grid divide-y divide-line overflow-hidden rounded-lg bg-raised shadow-soft ring-1 ring-line">
        {rows.map(([label, value, note], i) => (
          <div
            key={label}
            className={`flex items-baseline justify-between gap-4 px-5 py-3 ${i === 3 || i === 5 ? 'bg-accent-soft font-semibold' : ''}`}
          >
            <dt className="text-small text-ink">
              {label}
              {note && <span className="ml-2 text-caption text-muted">({note})</span>}
            </dt>
            <dd className="text-right tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      {result.lowHectolitre && minHectolitre !== undefined && (
        <Callout
          tone="warning"
          title={netPriceRules.find((r) => r.id === 'hectolitre')!.title[locale]}
        >
          {t.lowHl(formatNumber(minHectolitre, locale))}
        </Callout>
      )}
    </div>
  )
}

export async function NetPricePage({ locale, params }: { locale: Locale; params: RawParams }) {
  const p = pricesUi[locale]
  const t = p.calc
  const crops = await listCrops(locale)
  const parsed = parseNetPrice(
    params,
    (key) => crops.find((c) => c.key === key)?.quality ?? undefined,
    crops.map((c) => c.key),
  )
  const result = parsed.input ? netPrice(parsed.input) : undefined
  const url = netPricePath(locale)
  const crumbs = [
    { name: p.section, url: pricesPath(locale) },
    { name: t.title, url },
  ]
  const crop = crops.find((c) => c.key === parsed.input?.crop)
  const sourceUrl = (id: string, href: string) =>
    id === 'reception-limits' ? fixedUrl('grain', locale) : href
  return (
    <SiteShell locale={locale} alternates={netPriceAlternates}>
      <JsonLd
        data={[
          webPage({ url, name: t.seoTitle, description: t.description, locale }),
          breadcrumbs(locale, ui[locale].home, crumbs),
        ]}
      />
      <PageTitle
        locale={locale}
        title={t.title}
        summary={t.summary}
        crumbs={crumbs}
        kicker={p.section}
      />
      <div className="mx-auto mt-10 grid max-w-page gap-8 px-4 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Form
            locale={locale}
            parsed={parsed}
            crops={crops.map((c) => ({ value: c.key, label: c.name }))}
          />
        </div>
        <section
          id="rezultat"
          aria-labelledby="rezultat-titlu"
          className="grid scroll-mt-24 content-start gap-5 lg:col-span-7"
        >
          <h2 id="rezultat-titlu" className="text-h3 font-semibold text-ink">
            {t.resultTitle}
          </h2>
          {result ? (
            <Result locale={locale} result={result} minHectolitre={parsed.input?.minHectolitre} />
          ) : (
            <p className="text-body text-muted">{t.intro}</p>
          )}
          <ReviewNote title={t.resultTitle}>{t.note}</ReviewNote>
          {crop && (
            <div>
              <Button
                href={`${cropPricePath(crop.slug as string, locale)}#cerere`}
                variant="secondary"
              >
                {t.sell}
              </Button>
            </div>
          )}
        </section>
      </div>
      <section
        aria-labelledby="reguli"
        className="mx-auto mt-16 grid max-w-page gap-8 px-4 md:mt-20 md:px-8"
      >
        <h2 id="reguli" className="text-h3 font-semibold">
          {t.rulesTitle}
        </h2>
        <ol className="grid max-w-text gap-6">
          {netPriceRules.map((rule) => (
            <li key={rule.id} id={`regula-${rule.id}`} className="grid gap-2">
              <h3 className="text-h4 font-semibold">{rule.title[locale]}</h3>
              <p className="text-body text-muted">{rule.body[locale]}</p>
              <p className="text-caption text-muted">
                {t.sources}:{' '}
                {rule.sources.map((id, i) => {
                  const s = netPriceSources.find((x) => x.id === id)!
                  const n = netPriceSources.indexOf(s) + 1
                  return (
                    <span key={id}>
                      {i > 0 && ', '}
                      <a
                        href={sourceUrl(id, s.url)}
                        rel="noopener"
                        className="underline underline-offset-2"
                      >
                        [{n}] {s.title[locale]}
                      </a>
                    </span>
                  )
                })}
              </p>
            </li>
          ))}
        </ol>
        <div className="max-w-text">
          <SourceList
            title={t.sources}
            retrieved={t.checked}
            items={netPriceSources.map((s) => ({
              title: s.title[locale],
              url: sourceUrl(s.id, s.url),
              date: formatDate(new Date(s.checked), locale),
            }))}
          />
        </div>
      </section>
      <ToolLinks locale={locale} current={url} />
    </SiteShell>
  )
}
