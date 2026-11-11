import { QuickAddLazy, QuickRequestLazy } from '@ds/patterns/Lazy'
import { ChoosePack, ProductCard, type ProductCardProps } from '@ds/patterns/ProductCard'
import { ProductRow } from '@ds/patterns/ShopListing'
import { FactMark } from '@/components/Fact'
import type { Locale } from '@/i18n/config'
import { cartPath, productPath } from '@/i18n/routes'
import { shopUi } from '@/i18n/shop'
import { fixedUrl } from '@/i18n/ui'
import { quickAddToCart } from '@/lib/commerce/actions'
import { formatNumber } from '@/lib/format'
import { submitQuickRequest } from '@/lib/leads/actions'
import { cardAction, inStock, type ProductCardData } from '@/lib/shop/catalogue'

const units: Record<string, Record<Locale, string>> = {
  seeds: { ro: 'boabe', en: 'seeds' },
  pieces: { ro: 'buc.', en: 'pcs' },
}

/** "10 l", "1.500.000 boabe". A pack of unknown size has no label. */
export function packLabel(v: { size: number; unit: string }, locale: Locale) {
  if (v.unit === 'pieces' && v.size === 1) return null
  return `${formatNumber(v.size, locale)} ${units[v.unit]?.[locale] ?? v.unit}`
}

const perUnit = (unit: string) => (['l', 'ml'].includes(unit) ? 'l' : 'kg')

export function unitPriceLabel(v: { unit: string; unitPrice?: number | null }, locale: Locale) {
  return v.unitPrice != null
    ? `${formatNumber(v.unitPrice, locale)} lei/${perUnit(v.unit)}`
    : undefined
}

/** Tags a price for `check:figures`, with the "to confirm" marker while it is a pilot one. */
export const PriceMark = ({
  product,
  locale,
}: {
  product: Pick<ProductCardData, 'slug' | 'commerceStatus'>
  locale: Locale
}) => (
  <FactMark
    locale={locale}
    figure={
      {
        key: `product:${product.slug}:price`,
        status: product.commerceStatus === 'live' ? 'confirmed' : 'to-confirm',
      } as never
    }
  />
)

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const ingredientLine = (p: ProductCardData, locale: Locale) =>
  p.ingredients
    .map((i) =>
      [
        capitalise(i.name),
        i.concentration != null
          ? `${formatNumber(i.concentration, locale)}${i.unit === '%' ? '%' : ` ${i.unit ?? ''}`}`
          : null,
      ]
        .filter(Boolean)
        .join(' '),
    )
    .join(' + ')

/** The card's line under the name: active ingredients, the main nutrients, or the crops. */
export function cardLine(p: ProductCardData, locale: Locale) {
  if (p.ingredients.length) return ingredientLine(p, locale)
  if (p.nutrients?.length)
    return p.nutrients
      .slice(0, 4)
      .map((n) =>
        n.percent != null ? `${n.nutrient} ${formatNumber(n.percent, locale)}%` : n.nutrient,
      )
      .join(' · ')
  return undefined
}

const cardStock = (p: ProductCardData) =>
  inStock(p)
    ? 'in-stock'
    : p.variants.some((v) => v.stock === 'on-request')
      ? 'on-request'
      : 'out-of-stock'

/** The label dose for a listing row: "0,33–0,44 l/ha", "0,05%". */
export function doseLabel(dose: ProductCardData['dose'], locale: Locale) {
  if (!dose) return undefined
  const range =
    dose.min === dose.max
      ? formatNumber(dose.min, locale)
      : `${formatNumber(dose.min, locale)}–${formatNumber(dose.max, locale)}`
  return dose.unit === '%' ? `${range}%` : `${range} ${dose.unit}`
}

/**
 * What a card and a list row share. The action follows `cardAction`: quick add for one
 * buyable pack, "choose a pack" for several, the quick request when it cannot be bought online.
 */
function cardProps(
  p: ProductCardData,
  locale: Locale,
  sourcePath?: string,
  linkOnly?: boolean,
): ProductCardProps {
  const t = shopUi[locale]
  const href = productPath(p.category.slug, p.slug, locale)
  const priced = p.variants.filter((v) => v.price != null)
  const cheapest = [...priced].sort((a, b) => (a.price as number) - (b.price as number))[0]
  const packs = p.variants.flatMap((v) => packLabel(v, locale) ?? [])
  const found = cardAction(p)
  // On a product page's shelves a buyable card links to its page: no quick add island there.
  const action = linkOnly && found.kind === 'add' ? ({ kind: 'choose' } as const) : found
  const crops = p.crops
    .slice(0, 2)
    .map((c) => c.name)
    .join(', ')
  return {
    locale,
    href,
    name: p.name,
    brand: p.brand?.name,
    pack: packs.join(' · ') || undefined,
    image: p.image?.url,
    line: cardLine(p, locale) || undefined,
    chips: [p.formulation ?? p.form, crops].filter((c): c is string => Boolean(c)),
    price: cheapest?.price,
    fromPrice: priced.length > 1,
    priceNote: cheapest ? <PriceMark product={p} locale={locale} /> : undefined,
    unitPrice: cheapest ? unitPriceLabel(cheapest, locale) : undefined,
    stock: cardStock(p),
    labels: {
      inStock: t.inStock,
      onRequest: t.onRequest,
      outOfStock: t.outOfStock,
      from: t.from,
      askPrice: t.askPrice,
    },
    action:
      action.kind === 'add' ? (
        <QuickAddLazy
          locale={locale}
          sku={action.sku}
          action={quickAddToCart}
          cartHref={cartPath(locale)}
          labels={t.card}
        />
      ) : action.kind === 'choose' ? (
        <ChoosePack href={href} label={found.kind === 'add' ? t.details : t.card.choose} />
      ) : (
        <QuickRequestLazy
          locale={locale}
          action={submitQuickRequest}
          layout="compact"
          sourcePath={sourcePath ?? href}
          privacyHref={fixedUrl('privacy', locale)}
          products={[p.id]}
          label={
            action.reason === 'no-price' ||
            action.reason === 'on-request' ||
            action.reason === 'out-of-stock'
              ? t.card.requestLabel
              : t.card.blockedLabel
          }
          submitLabel={t.card.request}
        />
      ),
  }
}

/** A catalogue product as a shop card (grid view). */
export function ShopCard({
  product,
  locale,
  className,
  sourcePath,
  linkOnly,
}: {
  product: ProductCardData
  locale: Locale
  className?: string
  /** The page the card is on, stored with a quick request. Defaults to the product page. */
  sourcePath?: string
  /** "Vezi produsul" instead of the quick add (a product page's shelves). */
  linkOnly?: boolean
}) {
  return <ProductCard {...cardProps(product, locale, sourcePath, linkOnly)} className={className} />
}

/** A catalogue product as a list row: the card's data plus the label dose and all crops. */
export function ShopRow({
  product,
  locale,
  sourcePath,
}: {
  product: ProductCardData
  locale: Locale
  sourcePath?: string
}) {
  const L = shopUi[locale].listing
  return (
    <ProductRow
      {...cardProps(product, locale, sourcePath)}
      dose={doseLabel(product.dose, locale)}
      crops={product.crops.map((c) => c.name)}
      rowLabels={{ dose: L.dose, crops: L.crops, moreCrops: L.moreCrops }}
    />
  )
}

export function ProductGrid({
  products,
  locale,
  columns = 'md:grid-cols-3 xl:grid-cols-4',
  sourcePath,
  linkOnly,
}: {
  products: ProductCardData[]
  locale: Locale
  columns?: string
  sourcePath?: string
  linkOnly?: boolean
}) {
  return (
    <ul className={`grid grid-cols-2 gap-3 md:gap-5 ${columns}`}>
      {products.map((p) => (
        <li key={p.id}>
          <ShopCard
            product={p}
            locale={locale}
            className="h-full"
            sourcePath={sourcePath}
            linkOnly={linkOnly}
          />
        </li>
      ))}
    </ul>
  )
}

/** The list view: one row per product. */
export function ProductList({
  products,
  locale,
  sourcePath,
}: {
  products: ProductCardData[]
  locale: Locale
  sourcePath?: string
}) {
  return (
    <ul className="grid gap-3">
      {products.map((p) => (
        <li key={p.id}>
          <ShopRow product={p} locale={locale} sourcePath={sourcePath} />
        </li>
      ))}
    </ul>
  )
}
