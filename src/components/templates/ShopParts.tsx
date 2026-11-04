import { ProductCard } from '@ds/patterns/ProductCard'
import { FactMark } from '@/components/Fact'
import type { Locale } from '@/i18n/config'
import { productPath } from '@/i18n/routes'
import { shopUi } from '@/i18n/shop'
import { formatNumber } from '@/lib/format'
import { inStock, type ProductCardData } from '@/lib/shop/catalogue'

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

export function ShopCard({
  product: p,
  locale,
  className,
}: {
  product: ProductCardData
  locale: Locale
  className?: string
}) {
  const t = shopUi[locale]
  const priced = p.variants.filter((v) => v.price != null)
  const cheapest = [...priced].sort((a, b) => (a.price as number) - (b.price as number))[0]
  const packs = p.variants.flatMap((v) => packLabel(v, locale) ?? [])
  return (
    <ProductCard
      locale={locale}
      href={productPath(p.category.slug, p.slug, locale)}
      name={p.name}
      pack={packs.join(' · ')}
      image={p.image?.url}
      category={p.category.name}
      active={ingredientLine(p, locale) || undefined}
      crops={
        p.crops
          .slice(0, 3)
          .map((c) => c.name)
          .join(', ') || undefined
      }
      price={cheapest?.price}
      fromPrice={priced.length > 1}
      priceNote={<PriceMark product={p} locale={locale} />}
      unitPrice={cheapest ? unitPriceLabel(cheapest, locale) : undefined}
      inStock={inStock(p)}
      className={className}
      labels={{
        crops: t.cropsLabel,
        dose: t.doseLabel,
        inStock: t.inStock,
        outOfStock: t.outOfStock,
        details: t.details,
        from: t.from,
        askPrice: t.askPrice,
      }}
    />
  )
}

export function ProductGrid({
  products,
  locale,
  columns = 'lg:grid-cols-3',
}: {
  products: ProductCardData[]
  locale: Locale
  columns?: string
}) {
  return (
    <ul className={`grid gap-5 sm:grid-cols-2 ${columns}`}>
      {products.map((p) => (
        <li key={p.id}>
          <ShopCard product={p} locale={locale} className="h-full" />
        </li>
      ))}
    </ul>
  )
}
