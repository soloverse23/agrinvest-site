import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import type { GhsCode } from '@ds/icons/ghs'
import type { BuyPack } from '@ds/patterns/BuyForm'
import { OrderNotice } from '@ds/patterns/Commerce'
import type { CalcUse } from '@ds/patterns/DoseCalculator'
import { FinanceHint } from '@ds/patterns/Finance'
import { BuyFormLazy, DoseCalculatorLazy, QuickRequestLazy } from '@ds/patterns/Lazy'
import {
  BuyBox,
  DocumentTiles,
  DoseUseCards,
  FoldedText,
  HelpBand,
  KeyFacts,
  PackSummary,
  ProductLayout,
  ProductMedia,
  ProductSection,
  ProductShelf,
  ProductTabs,
  SafetyPanel,
  SpecGroups,
  Spectrum,
  type DoseUse,
  type KeyFact,
  type MediaBadge,
} from '@ds/patterns/ProductDetail'
import { Accordion, Updated } from '@ds/patterns/Sections'
import { FactText } from '@/components/FactText'
import { JsonLd } from '@/components/JsonLd'
import { Crumbs } from '@/components/PageParts'
import { Prose } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import { commerceUi } from '@/i18n/commerce'
import { financeUi } from '@/i18n/finance'
import { type Locale } from '@/i18n/config'
import { cartPath, categoryPath, hubPath, productPath, shopPath } from '@/i18n/routes'
import { fillSlots, fitTitle, shopUi } from '@/i18n/shop'
import { fixedUrl, ui } from '@/i18n/ui'
import { addManyToCart, quickAddToCart } from '@/lib/commerce/actions'
import { financeLinks } from '@/lib/content/finance'
import { getFigures, getSeoDefaults } from '@/lib/content/globals'
import type { Alternates } from '@/lib/content/pages'
import { getProduct, listCategories, listProducts } from '@/lib/content/shop'
import { formatDate, formatNumber, formatQuantity } from '@/lib/format'
import { submitQuickRequest } from '@/lib/leads/actions'
import { breadcrumbs, faqPage, product as productSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'
import { inStock, type ProductCardData } from '@/lib/shop/catalogue'
import { parseSowingRate, type PackOption } from '@/lib/shop/dose'
import { orderBlock } from '@/lib/shop/rules'
import { absoluteUrl } from '@/lib/site'
import type { Crop, Media, ProductDocument, Target } from '@/payload-types'

import { ingredientLine, packLabel, PriceMark, ProductGrid, unitPriceLabel } from './ShopParts'

/** One product: `/magazin/{categorie}/{produs}`, `/en/shop/{category}/{product}`. */

const other = (locale: Locale): Locale => (locale === 'ro' ? 'en' : 'ro')

export async function productParams(locale: Locale) {
  return (await listProducts(locale)).map((p) => ({ category: p.category.slug, product: p.slug }))
}

async function resolve(locale: Locale, categorySlug: string, slug: string) {
  const [cards, twins, categories] = await Promise.all([
    listProducts(locale),
    listProducts(other(locale)),
    listCategories(locale),
  ])
  const card = cards.find((p) => p.slug === slug)
  // The category is part of the address: any other one is not this page.
  if (!card || card.category.slug !== categorySlug) return null
  const doc = await getProduct(slug, locale)
  if (!doc) return null
  const twin = twins.find((p) => p.id === card.id)
  const alternates: Alternates = {
    [locale]: productPath(card.category.slug, slug, locale),
    ...(twin ? { [other(locale)]: productPath(twin.category.slug, slug, other(locale)) } : {}),
  }
  const parent = categories.find(
    (c) => c.id === categories.find((x) => x.id === card.category.id)?.parent,
  )
  return { card, doc, alternates, parent, cards }
}

type Found = NonNullable<Awaited<ReturnType<typeof resolve>>>

/** The page's answer sentence. English falls back to one built from the product's data. */
function summaryOf({ card, doc }: Found, locale: Locale) {
  const t = shopUi[locale]
  if (doc.summary) return doc.summary
  const type = t.types[card.productType].toLowerCase()
  const line = ingredientLine(card, locale)
  if (locale === 'ro')
    return `${card.name}: ${type}${line ? ` pe bază de ${line.toLowerCase()}` : ''}, în categoria ${card.category.name.toLowerCase()}.`
  return `${card.name}: ${type}${line ? ` based on ${line.toLowerCase()}` : ''}, in the ${card.category.name.toLowerCase()} category.`
}

export async function productMetadata(
  locale: Locale,
  category: string,
  slug: string,
): Promise<Metadata> {
  const found = await resolve(locale, category, slug)
  if (!found) return {}
  const { card, doc, alternates } = found
  const t = shopUi[locale]
  const seo = await getSeoDefaults(locale)
  const summary = doc.summary?.trim()
  const fallback = t.seo.productDescription(card.name, t.types[card.productType])
  const description =
    doc.seo?.description ||
    (summary && summary.length >= 70
      ? summary.length <= 155
        ? summary
        : `${summary.slice(0, 152).replace(/\s+\S*$/, '')}…`
      : fallback)
  const photo = doc.gallery?.[0]
  return buildMetadata({
    locale,
    title: card.name,
    seoTitle:
      doc.seo?.title ||
      fitTitle(card.productType === 'seed' ? t.seo.seed(card.name) : t.seo.product(card.name)),
    description,
    siteName: seo.siteName,
    image: doc.seo?.image ?? (typeof photo === 'object' ? photo : null) ?? seo.ogImage,
    noindex: doc.seo?.noindex,
    alternates,
  })
}

type Doc = Found['doc']
type Row = { label: string; value: React.ReactNode }

const named = (items: (number | Crop)[] | null | undefined) =>
  (items ?? []).flatMap((c) => (typeof c === 'object' ? c.name : []))

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Technical facts in the page's groups. Only what is known appears; empty groups drop out. */
function specGroups({ card, doc }: Found, locale: Locale) {
  const t = shopUi[locale]
  const s = t.spec
  const g = t.product.specGroups
  const groups: { title: string; rows: Row[] }[] = []
  const group = (title: string, rows: [string, React.ReactNode][]) => {
    const kept = rows
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([label, value]) => ({ label, value }))
    if (kept.length) groups.push({ title, rows: kept })
  }
  const link = (href: string, label: string) => (
    <Link href={href} className="inline-flex min-h-8 items-center">
      {label}
    </Link>
  )
  const crops = card.crops.length ? (
    <span className="flex flex-wrap gap-x-3">
      {card.crops.map((c) => (
        <span key={c.id}>{link(hubPath('crop', c.slug, locale), c.name)}</span>
      ))}
    </span>
  ) : null
  const ingredients = card.ingredients.length ? (
    <ul className="grid gap-1">
      {card.ingredients.map((i) => (
        <li key={i.id}>
          {link(hubPath('ingredient', i.slug, locale), capitalise(i.name))}
          {i.concentration != null && ` ${formatNumber(i.concentration, locale)} ${i.unit ?? ''}`}
        </li>
      ))}
    </ul>
  ) : null
  group(g.identity, [
    [s.brand, card.brand ? link(hubPath('brand', card.brand.slug, locale), card.brand.name) : null],
    [s.type, t.types[card.productType]],
    [s.ingredients, ingredients],
    [s.crops, crops],
  ])
  const { protection: p, seed, fertiliser: f } = doc
  if (doc.productType === 'protection') {
    group(g.formulation, [
      [s.formulation, p?.formulation],
      [s.compatibility, p?.compatibility],
    ])
    group(g.action, [
      [s.mode, p?.modeOfAction],
      [s.resistance, p?.resistanceGroup],
      [s.toxicity, p?.toxicityClass],
    ])
    group(g.registration, [
      [s.registration, p?.registrationNumber],
      [
        s.validUntil,
        p?.registrationValidUntil ? formatDate(new Date(p.registrationValidUntil), locale) : null,
      ],
      [s.use, p?.professionalUse ? s.professional : null],
    ])
  }
  if (doc.productType === 'seed')
    group(g.seed, [
      [s.species, seed?.species],
      [s.variety, seed?.variety],
      [s.fao, seed?.faoGroup],
      [s.maturity, seed?.maturity],
      [s.density, seed?.sowingDensity],
      [s.rate, seed?.sowingRate],
      [s.yield, seed?.yieldPotential],
      [s.resistances, seed?.resistances],
      [s.zones, seed?.recommendedZones],
      [s.treatment, seed?.seedTreatment],
    ])
  if (doc.productType === 'fertiliser')
    group(g.nutrition, [
      [
        s.composition,
        f?.nutrients?.length
          ? f.nutrients.map((n) => `${n.nutrient} ${n.percent ?? ''}%`).join(' · ')
          : null,
      ],
      [s.form, f?.form],
      [s.granule, f?.granuleSize],
      [s.storage, f?.storage],
    ])
  return groups
}

type LabelRow = {
  key: string
  crop: string
  timing?: string | null
  bbch?: string | null
  dose: string
  min?: number | null
  max?: number | null
  unit?: string | null
  water?: string | null
  phi?: number | null
  maxTreatments?: number | null
  targets: Target[]
  notes?: string | null
}

/**
 * The label's dose rows in the source's words, with their parsed numbers. Text not yet
 * translated is empty in English, so a row then falls back to the Romanian label text.
 */
function labelRows({ doc }: Found, romanian: Doc | null): LabelRow[] {
  const doses = doc.protection?.doses ?? []
  if (doses.length)
    return doses.flatMap((row, i) => {
      const crop = row.cropText || named(row.crops as (number | Crop)[]).join(', ')
      const dose = row.doseText || romanian?.protection?.doses?.[i]?.doseText
      if (!crop || !dose) return []
      return [
        {
          key: row.id ?? String(i),
          crop,
          timing: row.timing,
          bbch: row.bbch,
          dose,
          min: row.doseMin,
          max: row.doseMax,
          unit: row.doseUnit,
          water: row.waterVolume,
          phi: row.waitingPeriod,
          maxTreatments: row.maxTreatments,
          targets: ((row.target ?? []) as (number | Target)[]).filter(
            (x): x is Target => typeof x === 'object',
          ),
          notes: row.notes,
        },
      ]
    })
  const rates = doc.fertiliser?.rates ?? []
  if (rates.length)
    return rates.flatMap((row, i) => {
      const crop = row.cropText || named(row.crops as (number | Crop)[]).join(', ')
      const dose = row.rateText || romanian?.fertiliser?.rates?.[i]?.rateText
      if (!crop || !dose) return []
      return [
        {
          key: row.id ?? String(i),
          crop,
          timing: row.timing,
          dose,
          min: row.rateMin,
          max: row.rateMax,
          unit: row.rateUnit,
          targets: [],
        },
      ]
    })
  // Seeds: one use, only when the sowing rate is stated per hectare.
  const sowing = doc.seed?.sowingRate || romanian?.seed?.sowingRate
  const rate = parseSowingRate(sowing)
  if (sowing && rate)
    return [
      {
        key: 'sowing',
        crop: doc.seed?.species || doc.name,
        dose: sowing,
        min: rate.min,
        max: rate.max,
        unit: rate.unit === 'kg' ? 'kg/ha' : 'seeds/ha',
        targets: [],
      },
    ]
  return []
}

/** Key facts for the buy box: ingredients, formulation, resistance group, PHI, crops. */
function keyFacts({ card, doc }: Found, rows: LabelRow[], locale: Locale): KeyFact[] {
  const P = shopUi[locale].product
  const facts: KeyFact[] = card.ingredients.map((i) => ({
    label: [
      capitalise(i.name),
      i.concentration != null
        ? `${formatNumber(i.concentration, locale)}${i.unit === '%' ? '%' : ` ${i.unit ?? ''}`}`
        : null,
    ]
      .filter(Boolean)
      .join(' '),
    href: hubPath('ingredient', i.slug, locale),
    strong: true,
  }))
  if (!facts.length && card.nutrients?.length)
    facts.push({
      label: card.nutrients
        .slice(0, 3)
        .map((n) =>
          n.percent != null ? `${n.nutrient} ${formatNumber(n.percent, locale)}%` : n.nutrient,
        )
        .join(' · '),
      strong: true,
    })
  if (card.formulation) facts.push({ label: card.formulation })
  else if (card.form) facts.push({ label: card.form })
  if (doc.protection?.resistanceGroup) facts.push({ label: doc.protection.resistanceGroup })
  const phis = rows.flatMap((r) => (r.phi != null ? [r.phi] : []))
  if (phis.length) {
    const min = Math.min(...phis)
    const max = Math.max(...phis)
    facts.push({
      label: min === max ? fillSlots(P.phi, { n: min }) : fillSlots(P.phiRange, { min, max }),
    })
  }
  card.crops
    .slice(0, 3)
    .forEach((c) => facts.push({ label: c.name, href: hubPath('crop', c.slug, locale) }))
  const rest = card.crops.slice(3)
  if (rest.length)
    facts.push({
      label: fillSlots(P.moreCrops, { n: rest.length }),
      href: '#date-tehnice',
      title: rest.map((c) => c.name).join(', '),
    })
  return facts
}

const fileSize = (bytes: number, locale: Locale) =>
  bytes >= 1024 * 1024
    ? `${formatNumber(bytes / 1024 / 1024, locale, 1)} MB`
    : `${formatNumber(Math.max(1, Math.round(bytes / 1024)), locale, 0)} KB`

const stockOf = (p: ProductCardData) =>
  inStock(p)
    ? 'in-stock'
    : p.variants.some((v) => v.stock === 'on-request')
      ? 'on-request'
      : 'out-of-stock'

export async function ProductPage({
  locale,
  category,
  slug,
}: {
  locale: Locale
  category: string
  slug: string
}) {
  const found = await resolve(locale, category, slug)
  if (!found) notFound()
  const { card, doc, alternates, parent, cards } = found
  const t = shopUi[locale]
  const P = t.product
  const u = ui[locale]
  const c = commerceUi[locale]
  const path = productPath(card.category.slug, slug, locale)
  const [figures, romanian, finance] = await Promise.all([
    getFigures(locale),
    locale === 'ro' ? null : getProduct(slug, 'ro'),
    financeLinks(['inputuri-plata-la-recolta', 'credit-productie'], locale),
  ])
  // A hint, not an offer (4.5): the inputs page, or the production loan if it is not published.
  const inputsFinance = finance['inputuri-plata-la-recolta'] ?? finance['credit-productie']
  const summary = summaryOf(found, locale)
  const crumbs = [
    { name: t.shop, url: shopPath(locale) },
    ...(parent ? [{ name: parent.name, url: categoryPath(parent.slug, locale) }] : []),
    { name: card.category.name, url: categoryPath(card.category.slug, locale) },
    { name: card.name, url: path },
  ]
  const images = (doc.gallery ?? []).flatMap((m) => {
    const media = m as Media | number
    return typeof media === 'object' && media.url ? [{ url: media.url, alt: media.alt }] : []
  })
  const rows = labelRows(found, romanian)
  const specs = specGroups(found, locale)
  const documents = (doc.documents ?? []).flatMap((d) => {
    const file = d as ProductDocument | number
    if (typeof file !== 'object' || !file.url) return []
    const kind = t.documentKinds[file.kind]
    return [
      {
        href: file.url,
        title: file.title,
        meta: file.filesize ? P.documentSize(kind, fileSize(file.filesize, locale)) : kind,
      },
    ]
  })
  const block = orderBlock({ ...doc, category: card.category.slug })
  const protection = doc.productType === 'protection' ? doc.protection : null
  const stock = stockOf(card)
  const badges: MediaBadge[] = [
    ...(protection?.professionalUse ? [{ label: P.professional, tone: 'forest' as const }] : []),
    {
      label: { 'in-stock': t.inStock, 'on-request': t.onRequest, 'out-of-stock': t.outOfStock }[
        stock
      ],
      tone: stock === 'in-stock' ? 'accent' : stock === 'on-request' ? 'warning' : 'muted',
    },
  ]
  const packs: BuyPack[] = card.variants.map((v) => ({
    sku: v.sku,
    label: packLabel(v, locale) ?? t.packUnknown,
    price: v.price ?? null,
    unitPrice: unitPriceLabel(v, locale),
    stock: v.stock,
  }))
  const buyable = !block && packs.some((p) => p.price != null && p.stock !== 'out-of-stock')
  const mark = <PriceMark product={card} locale={locale} />
  const request = (label: string, submit: string, extra?: { quantity?: number }) => (
    <QuickRequestLazy
      locale={locale}
      action={submitQuickRequest}
      layout="inline"
      sourcePath={path}
      privacyHref={fixedUrl('privacy', locale)}
      products={[card.id]}
      label={label}
      submitLabel={submit}
      {...extra}
    />
  )

  // The calculator: every label row, numbers or not; packs are the product's own.
  const calcUses: CalcUse[] = rows.map((r) => ({
    id: r.key,
    label: [r.crop, r.bbch || r.timing].filter(Boolean).join(' · '),
    doseText: r.dose,
    min: r.min,
    max: r.max,
    unit: r.unit,
    water: r.water,
  }))
  const calcPacks: PackOption[] = card.variants.map((v) => ({
    sku: v.sku,
    size: v.size,
    unit: v.unit,
    price: v.price,
    stock: v.stock,
  }))
  const doseUses: DoseUse[] = rows.map((r) => ({
    key: r.key,
    crop: r.crop,
    timing: r.timing,
    bbch: r.bbch,
    dose: r.dose,
    water: r.water,
    phi: r.phi != null ? t.days(r.phi) : null,
    maxTreatments: r.maxTreatments != null ? P.doseUse.treatments(r.maxTreatments) : null,
    targets: r.targets.map((x) => ({ label: x.name })),
    notes: r.notes,
  }))

  // Spectrum: the targets linked on the dose rows, by kind, without repeats.
  const kinds = ['weed', 'disease', 'pest', 'deficiency'] as const
  const targets = new Map<number, Target>()
  rows.forEach((r) => r.targets.forEach((x) => targets.set(x.id, x)))
  const spectrum = kinds
    .map((kind) => ({
      kind,
      label: P.spectrum[kind],
      items: [...targets.values()].filter((x) => x.kind === kind).map((x) => ({ label: x.name })),
    }))
    .filter((g) => g.items.length)

  const hazardLines = (protection?.hazardStatements ?? '')
    .split('\n')
    .map((h) => h.trim())
    .filter(Boolean)
  const pictograms = ((protection?.ghsPictograms ?? []) as GhsCode[]).map((code) => ({
    code,
    label: P.ghs[code],
  }))
  const hasSafety = Boolean(
    protection &&
    (protection.signalWord ||
      pictograms.length ||
      hazardLines.length ||
      protection.bufferZone ||
      protection.safety),
  )

  const tabs = [
    ...(rows.length || card.productType !== 'seed' ? [{ id: 'doze', label: P.tab.doses }] : []),
    ...(specs.length ? [{ id: 'date-tehnice', label: P.tab.specs }] : []),
    ...(spectrum.length ? [{ id: 'spectru', label: P.tab.spectrum }] : []),
    ...(hasSafety ? [{ id: 'siguranta', label: P.tab.safety }] : []),
    ...(documents.length ? [{ id: 'documente', label: P.tab.documents }] : []),
    ...(doc.description ? [{ id: 'descriere', label: P.tab.description }] : []),
    ...(doc.faq?.length ? [{ id: 'intrebari', label: P.tab.faq }] : []),
  ]

  // Shelves: the same category, then staff's related products or the same crops elsewhere.
  const sameCategory = cards
    .filter((p) => p.category.id === card.category.id && p.id !== card.id)
    .slice(0, 4)
  const relatedIds = ((doc.related ?? []) as (number | { id: number })[]).map((r) =>
    typeof r === 'object' ? r.id : r,
  )
  const cropIds = new Set(card.crops.map((x) => x.id))
  const shown = new Set([card.id, ...sameCategory.map((p) => p.id)])
  const together = (
    relatedIds.length
      ? cards.filter((p) => relatedIds.includes(p.id))
      : cards.filter(
          (p) =>
            p.category.id !== card.category.id &&
            inStock(p) &&
            p.crops.some((x) => cropIds.has(x.id)),
        )
  )
    .filter((p) => !shown.has(p.id))
    .slice(0, 4)

  return (
    <SiteShell locale={locale} alternates={alternates}>
      <JsonLd
        data={[
          productSchema({
            url: path,
            name: card.name,
            description: summary,
            image: images.map((i) => absoluteUrl(i.url)),
            brand: card.brand?.name,
            category: card.category.name,
            sku: card.variants[0]?.sku,
            variants: card.variants,
            // Offers state a price and stock: only once Agrinvest has confirmed them.
            confirmed: card.commerceStatus === 'live',
          }),
          breadcrumbs(locale, u.home, crumbs),
          ...(doc.faq?.length ? [faqPage(doc.faq)] : []),
        ]}
      />
      <div className="grid gap-20 pb-8 md:gap-24">
        <ProductLayout
          breadcrumbs={<Crumbs locale={locale} items={crumbs} />}
          gallery={
            <ProductMedia
              id="galerie"
              images={images}
              badges={badges}
              labels={{
                photos: P.photos,
                zoom: P.zoom,
                close: P.close,
                prev: P.prev,
                next: P.next,
                photo: (n, total) => fillSlots(P.photo, { n, total }),
              }}
            />
          }
          buy={
            <BuyBox
              brand={
                card.brand
                  ? { name: card.brand.name, href: hubPath('brand', card.brand.slug, locale) }
                  : undefined
              }
              title={card.name}
              summary={summary}
              facts={<KeyFacts label={P.facts} items={keyFacts(found, rows, locale)} />}
              notice={
                block && (
                  <OrderNotice title={c.blockTitle}>
                    {block === 'sale-stopped' ? doc.saleBlock : c.blockReasons[block]}
                  </OrderNotice>
                )
              }
              form={
                buyable ? (
                  <BuyFormLazy
                    locale={locale}
                    name={card.name}
                    packs={packs}
                    action={quickAddToCart}
                    cartHref={cartPath(locale)}
                    priceMark={mark}
                    labels={{
                      packs: P.packs,
                      quantity: P.quantity,
                      decrease: P.decrease,
                      increase: P.increase,
                      lineTotal: P.lineTotal,
                      add: P.add,
                      adding: P.adding,
                      added: P.added,
                      viewCart: P.viewCart,
                      failed: P.failed,
                      unavailable: P.unavailable,
                      onRequest: P.onRequest,
                      inStock: t.inStock,
                      stockOnRequest: t.onRequest,
                    }}
                  />
                ) : (
                  <PackSummary
                    label={P.packs}
                    packs={packs.map((p) => ({
                      key: p.sku,
                      pack: p.label,
                      price:
                        p.price != null ? (
                          <>
                            {formatQuantity(p.price, 'lei', locale)}
                            {mark}
                          </>
                        ) : (
                          <span className="text-small">{P.onRequest}</span>
                        ),
                      unitPrice: p.unitPrice,
                    }))}
                  />
                )
              }
              calcLink={
                calcUses.some((x) => x.min != null || x.max != null)
                  ? { href: '#calculator', label: P.calcLink }
                  : undefined
              }
              request={
                buyable
                  ? request(P.bulkLabel, P.bulkSubmit)
                  : request(
                      block ? P.blockedLabel : t.card.requestLabel,
                      block ? P.bulkSubmit : t.card.request,
                    )
              }
              notes={
                <>
                  {inputsFinance && !block && (
                    <FinanceHint
                      text={financeUi[locale].crossSell.hint}
                      link={{
                        href: inputsFinance.href,
                        label: financeUi[locale].crossSell.hintLink,
                      }}
                    />
                  )}
                  <p>{t.priceNote}</p>
                  <Updated locale={locale} label={u.updated} date={doc.updatedAt} />
                </>
              }
            />
          }
        >
          {tabs.length > 1 && <ProductTabs label={P.tabs} items={tabs} />}

          {(rows.length > 0 || card.productType !== 'seed') && (
            <ProductSection id="doze" title={t.doses} lead={rows.length ? t.doseNote : t.noDoses}>
              {rows.length > 0 && (
                <>
                  <div id="calculator" className="scroll-mt-16">
                    <DoseCalculatorLazy
                      locale={locale}
                      uses={calcUses}
                      packs={calcPacks}
                      action={addManyToCart}
                      cartHref={cartPath(locale)}
                      consultHref="#cerere"
                      canOrder={!block}
                      labels={{
                        ...P.calc,
                        adding: P.adding,
                        added: P.added,
                        viewCart: P.viewCart,
                        failed: P.failed,
                      }}
                    />
                  </div>
                  <DoseUseCards
                    uses={doseUses}
                    labels={{ ...P.doseUse, more: (n) => fillSlots(P.doseUse.more, { n }) }}
                  />
                </>
              )}
            </ProductSection>
          )}

          {specs.length > 0 && (
            <ProductSection id="date-tehnice" title={t.specs}>
              <SpecGroups groups={specs} />
            </ProductSection>
          )}

          {spectrum.length > 0 && (
            <ProductSection id="spectru" title={P.tab.spectrum}>
              <Spectrum groups={spectrum} />
            </ProductSection>
          )}

          {hasSafety && protection && (
            <ProductSection id="siguranta" title={t.safety}>
              <SafetyPanel
                labels={P.safety}
                signal={
                  protection.signalWord
                    ? { label: P.safety[protection.signalWord], level: protection.signalWord }
                    : undefined
                }
                pictograms={pictograms}
                hazards={hazardLines}
                buffer={protection.bufferZone}
                fallback={protection.safety}
              />
            </ProductSection>
          )}

          {documents.length > 0 && (
            <ProductSection id="documente" title={t.documents}>
              <DocumentTiles items={documents} />
            </ProductSection>
          )}

          {doc.description && (
            <ProductSection id="descriere" title={t.about}>
              <FoldedText labels={{ more: P.readAll, less: P.readLess }}>
                <Prose data={doc.description} ctx={{ figures, locale }} />
              </FoldedText>
            </ProductSection>
          )}

          {doc.faq && doc.faq.length > 0 && (
            <ProductSection id="intrebari" title={P.tab.faq}>
              <Accordion
                items={doc.faq.map((q) => ({
                  id: q.id,
                  question: q.question,
                  answer: <FactText text={q.answer} figures={figures} locale={locale} />,
                }))}
              />
            </ProductSection>
          )}
        </ProductLayout>

        {sameCategory.length > 0 && (
          <ProductShelf title={P.sameCategory}>
            <ProductGrid
              products={sameCategory}
              locale={locale}
              columns="lg:grid-cols-4"
              linkOnly
            />
          </ProductShelf>
        )}

        {together.length > 0 && (
          <ProductShelf title={P.together}>
            <ProductGrid products={together} locale={locale} columns="lg:grid-cols-4" linkOnly />
          </ProductShelf>
        )}

        <HelpBand
          title={P.helpTitle}
          text={P.helpText}
          request={request(P.helpLabel, P.bulkSubmit)}
        />
      </div>
    </SiteShell>
  )
}
