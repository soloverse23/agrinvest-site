import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AddToCartForm, OrderNotice } from '@ds/patterns/Commerce'
import { SectionHeading, Updated } from '@ds/patterns/Sections'
import {
  DocumentList,
  DoseTable,
  PackTable,
  ProductGallery,
  SpecSheet,
  type DoseRow,
} from '@ds/patterns/Shop'
import { Button } from '@ds/primitives/Button'
import { JsonLd } from '@/components/JsonLd'
import { Crumbs, Faq } from '@/components/PageParts'
import { LeadFormBlock, Prose } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import { commerceUi } from '@/i18n/commerce'
import { type Locale } from '@/i18n/config'
import { categoryPath, hubPath, productPath, sections, shopPath } from '@/i18n/routes'
import { fitTitle, shopUi } from '@/i18n/shop'
import { ui } from '@/i18n/ui'
import { addToCart } from '@/lib/commerce/actions'
import { getFigures, getSeoDefaults } from '@/lib/content/globals'
import type { Alternates } from '@/lib/content/pages'
import { getProduct, listCategories, listProducts } from '@/lib/content/shop'
import { formatDate, formatQuantity } from '@/lib/format'
import { breadcrumbs, faqPage, product as productSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'
import { orderBlock } from '@/lib/shop/rules'
import { absoluteUrl } from '@/lib/site'
import type { Crop, Media, ProductDocument } from '@/payload-types'

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

const named = (items: (number | Crop)[] | null | undefined) =>
  (items ?? []).flatMap((c) => (typeof c === 'object' ? c.name : []))

/** Technical facts of the product's type. Only what is known appears. */
function specRows({ card, doc }: Found, locale: Locale) {
  const t = shopUi[locale]
  const s = t.spec
  const rows: { label: string; value: React.ReactNode }[] = []
  const add = (label: string, value: React.ReactNode) => {
    if (value !== null && value !== undefined && value !== '') rows.push({ label, value })
  }
  add(
    s.brand,
    card.brand ? (
      <Link
        href={hubPath('brand', card.brand.slug, locale)}
        className="inline-flex min-h-8 items-center"
      >
        {card.brand.name}
      </Link>
    ) : null,
  )
  add(s.type, t.types[card.productType])
  if (card.ingredients.length)
    add(
      s.ingredients,
      <ul className="grid gap-1">
        {card.ingredients.map((i) => (
          <li key={i.id}>
            <Link
              href={hubPath('ingredient', i.slug, locale)}
              className="inline-flex min-h-8 items-center"
            >
              {i.name.charAt(0).toUpperCase() + i.name.slice(1)}
            </Link>
            {i.concentration != null && ` ${i.concentration} ${i.unit ?? ''}`}
          </li>
        ))}
      </ul>,
    )
  const { protection: p, seed, fertiliser: f } = doc
  if (doc.productType === 'protection') {
    add(s.formulation, p?.formulation)
    add(s.registration, p?.registrationNumber)
    if (p?.registrationValidUntil)
      add(s.validUntil, formatDate(new Date(p.registrationValidUntil), locale))
    add(s.mode, p?.modeOfAction)
    add(s.resistance, p?.resistanceGroup)
    add(s.toxicity, p?.toxicityClass)
    add(s.compatibility, p?.compatibility)
    if (p?.professionalUse) add(s.use, s.professional)
  }
  if (doc.productType === 'seed') {
    add(s.species, seed?.species)
    add(s.variety, seed?.variety)
    add(s.fao, seed?.faoGroup)
    add(s.maturity, seed?.maturity)
    add(s.density, seed?.sowingDensity)
    add(s.rate, seed?.sowingRate)
    add(s.yield, seed?.yieldPotential)
    add(s.resistances, seed?.resistances)
    add(s.zones, seed?.recommendedZones)
    add(s.treatment, seed?.seedTreatment)
  }
  if (doc.productType === 'fertiliser') {
    if (f?.nutrients?.length)
      add(s.composition, f.nutrients.map((n) => `${n.nutrient} ${n.percent ?? ''}%`).join(' · '))
    add(s.form, f?.form)
    add(s.granule, f?.granuleSize)
    add(s.storage, f?.storage)
  }
  if (card.crops.length)
    add(
      s.crops,
      <span className="flex flex-wrap gap-x-3">
        {card.crops.map((c) => (
          <Link
            key={c.id}
            href={hubPath('crop', c.slug, locale)}
            className="inline-flex min-h-8 items-center"
          >
            {c.name}
          </Link>
        ))}
      </span>,
    )
  return rows
}

/**
 * Dose rows in the source's words. Text not yet translated is empty in English, so a row
 * then shows the crops it is linked to and the dose as printed on the Romanian label.
 */
function doseRows({ doc }: Found, locale: Locale, romanian: Found['doc'] | null): DoseRow[] {
  const t = shopUi[locale]
  const local = doc.protection?.doses ?? []
  if (local.length)
    return local.flatMap((row, i) => {
      const crop = row.cropText || named(row.crops as (number | Crop)[]).join(', ')
      const dose = row.doseText || romanian?.protection?.doses?.[i]?.doseText
      if (!crop || !dose) return []
      return [
        {
          key: row.id ?? String(i),
          crop,
          target: row.targetText,
          timing: row.timing,
          dose,
          water: row.waterVolume,
          waiting: row.waitingPeriod != null ? t.days(row.waitingPeriod) : null,
        },
      ]
    })
  return (doc.fertiliser?.rates ?? []).flatMap((row, i) => {
    const crop = row.cropText || named(row.crops as (number | Crop)[]).join(', ')
    const dose = row.rateText || romanian?.fertiliser?.rates?.[i]?.rateText
    if (!crop || !dose) return []
    return [{ key: row.id ?? String(i), crop, timing: row.timing, dose }]
  })
}

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
  const u = ui[locale]
  const path = productPath(card.category.slug, slug, locale)
  const [figures, romanian] = await Promise.all([
    getFigures(locale),
    locale === 'ro' ? null : getProduct(slug, 'ro'),
  ])
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
  const specs = specRows(found, locale)
  const doses = doseRows(found, locale, romanian)
  const documents = (doc.documents ?? []).flatMap((d) => {
    const file = d as ProductDocument | number
    return typeof file === 'object' && file.url
      ? [{ href: file.url, title: file.title, kind: t.documentKinds[file.kind] }]
      : []
  })
  const related = cards
    .filter((p) => p.category.id === card.category.id && p.id !== card.id)
    .slice(0, 3)
  const stock = {
    'in-stock': t.inStock,
    'on-request': t.onRequest,
    'out-of-stock': t.outOfStock,
  }
  const safety = doc.protection?.safety
  const c = commerceUi[locale]
  const block = orderBlock({ ...doc, category: card.category.slug })
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
      <div className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-page gap-8 px-4 pt-8 pb-12 md:px-8 md:pt-10">
          <Crumbs locale={locale} items={crumbs} />
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <ProductGallery images={images} />
            </div>
            <div className="grid content-start gap-5 lg:col-span-7">
              <h1 className="text-h1 font-semibold text-balance">{card.name}</h1>
              <p className="max-w-2xl text-lead text-muted">{summary}</p>
              <PackTable
                caption={t.packsCaption(card.name)}
                labels={{ pack: t.pack, price: t.price, unitPrice: t.unitPrice, stock: t.stock }}
                rows={card.variants.map((v) => ({
                  key: v.sku,
                  pack: packLabel(v, locale) ?? t.packUnknown,
                  price: (
                    <>
                      {v.price != null ? formatQuantity(v.price, 'lei', locale) : t.askPrice}
                      <PriceMark product={card} locale={locale} />
                    </>
                  ),
                  unitPrice: unitPriceLabel(v, locale),
                  stock: { label: stock[v.stock], available: v.stock === 'in-stock' },
                  action:
                    !block && v.stock !== 'out-of-stock' && v.price != null ? (
                      <AddToCartForm
                        action={addToCart}
                        sku={v.sku}
                        locale={locale}
                        labels={{ add: c.add, quantity: c.quantity }}
                      />
                    ) : undefined,
                }))}
              />
              {block && (
                <OrderNotice title={c.blockTitle}>
                  {block === 'sale-stopped' ? doc.saleBlock : c.blockReasons[block]}
                </OrderNotice>
              )}
              <p className="text-caption text-muted">{t.priceNote}</p>
              <div className="flex flex-wrap gap-3">
                <Button href="#cerere">{t.requestQuote}</Button>
              </div>
              <Updated locale={locale} label={u.updated} date={doc.updatedAt} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-20 md:mt-20 md:gap-24">
        <section className="mx-auto grid w-full max-w-page gap-8 px-4 md:px-8 lg:grid-cols-12">
          <SectionHeading
            id="date-tehnice"
            kicker={t.specsKicker}
            title={t.specs}
            className="lg:col-span-4 lg:self-start"
          />
          <SpecSheet rows={specs} className="lg:col-span-8" />
        </section>

        {card.productType !== 'seed' && (
          <section className="mx-auto grid w-full max-w-page gap-8 px-4 md:px-8">
            <SectionHeading
              id="doze"
              kicker={t.dosesKicker}
              title={t.doses}
              lead={doses.length ? t.doseNote : t.noDoses}
            />
            {doses.length > 0 && (
              <DoseTable caption={t.dosesCaption(card.name)} labels={t.dose} rows={doses} />
            )}
          </section>
        )}

        {doc.description && (
          <section className="mx-auto grid w-full max-w-page gap-8 px-4 md:px-8 lg:grid-cols-12">
            <SectionHeading
              id="descriere"
              kicker={t.aboutKicker}
              title={t.about}
              className="lg:col-span-4 lg:self-start"
            />
            <div className="lg:col-span-8">
              <Prose data={doc.description} ctx={{ figures, locale }} />
            </div>
          </section>
        )}

        {safety && (
          <section className="mx-auto grid w-full max-w-page gap-6 px-4 md:px-8">
            <SectionHeading title={t.safety} />
            <p className="max-w-3xl text-muted">{safety}</p>
          </section>
        )}

        {documents.length > 0 && (
          <section className="mx-auto grid w-full max-w-page gap-6 px-4 md:px-8">
            <SectionHeading title={t.documents} />
            <DocumentList items={documents} />
          </section>
        )}
      </div>

      <Faq locale={locale} items={doc.faq} />

      <div className="mt-20 md:mt-24">
        <LeadFormBlock
          block={{
            leadType: 'inputuri',
            extraFields: ['county'],
            heading: t.formTitle(card.name),
            body: t.formBody,
          }}
          locale={locale}
          path={`${sections.shop[locale]}/${card.category.slug}/${slug}`}
          products={[card.id]}
        />
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-20 grid max-w-page gap-8 px-4 md:mt-24 md:px-8">
          <SectionHeading title={t.related} />
          <ProductGrid products={related} locale={locale} />
        </section>
      )}
    </SiteShell>
  )
}
