import type { Metadata } from 'next'

import { CartTable, OrderSummary, type CartRow } from '@ds/patterns/Commerce'
import { FinanceCallout } from '@ds/patterns/Finance'
import { Button } from '@ds/primitives/Button'
import { FactText } from '@/components/FactText'
import { JsonLd } from '@/components/JsonLd'
import { PageTitle } from '@/components/PageParts'
import { LeadFormBlock } from '@/components/RenderBlocks'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import { commerceUi } from '@/i18n/commerce'
import { financeUi } from '@/i18n/finance'
import { cartPath, checkoutPath, financeRoutePath, productPath, shopPath } from '@/i18n/routes'
import { ui } from '@/i18n/ui'
import { updateCartLine } from '@/lib/commerce/actions'
import { pricedCart } from '@/lib/commerce/cart'
import { financeLinks } from '@/lib/content/finance'
import { getFigures } from '@/lib/content/globals'
import { AMOUNT_MIN } from '@/lib/finance/simulator'
import { formatQuantity } from '@/lib/format'
import { breadcrumbs, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'

import { packLabel } from './ShopParts'

const alternates = { ro: cartPath('ro'), en: cartPath('en') }

export function cartMetadata(locale: Locale): Metadata {
  const t = commerceUi[locale]
  return buildMetadata({
    locale,
    title: t.cartTitle,
    seoTitle: t.seoCart,
    description: t.seoCartDescription,
    noindex: true,
    alternates,
  })
}

/** The cart: personal, rendered per request, never indexed. Prices are read from the products. */
export async function CartPage({ locale }: { locale: Locale }) {
  const t = commerceUi[locale]
  const [cart, figures, finance] = await Promise.all([
    pricedCart(locale),
    getFigures(locale),
    financeLinks(['inputuri-plata-la-recolta', 'credit-productie'], locale),
  ])
  const f = financeUi[locale].crossSell
  const inputsFinance = finance['inputuri-plata-la-recolta'] ?? finance['credit-productie']
  // The simulator opens with the cart's total when it is a sensible loan amount.
  const simulate =
    cart.total >= AMOUNT_MIN
      ? {
          href: `${financeRoutePath('simulator', locale)}?suma=${Math.round(cart.total)}`,
          label: f.cartSimulate(formatQuantity(Math.round(cart.total), 'lei', locale, 0)),
        }
      : { href: financeRoutePath('simulator', locale), label: financeUi[locale].tools.simulate }
  const money = (value: number | null) =>
    value === null ? '–' : formatQuantity(value, 'lei', locale)
  const rows: CartRow[] = cart.lines.map((l) => ({
    sku: l.sku,
    name: l.name ?? l.sku,
    href: l.slug && l.category ? productPath(l.category, l.slug, locale) : undefined,
    pack: l.size && l.unit ? packLabel({ size: l.size, unit: l.unit }, locale) : null,
    unitPrice: money(l.unitPrice),
    lineTotal: money(l.lineTotal),
    quantity: l.quantity,
    problem: l.problem ? t.problems[l.problem] : null,
  }))
  const ids = cart.lines.flatMap((l) => l.productId ?? [])
  return (
    <SiteShell locale={locale} alternates={alternates}>
      <JsonLd
        data={[
          webPage({
            url: cartPath(locale),
            name: t.cartTitle,
            description: t.seoCartDescription,
            locale,
          }),
          breadcrumbs(locale, ui[locale].home, [{ name: t.cartTitle, url: cartPath(locale) }]),
        ]}
      />
      <PageTitle
        locale={locale}
        title={t.cartTitle}
        summary={t.cartSummary}
        crumbs={[{ name: t.cartTitle, url: cartPath(locale) }]}
      />
      <div className="mx-auto mt-10 max-w-page px-4 md:px-8">
        {rows.length === 0 ? (
          <div className="grid justify-items-start gap-4 rounded-lg bg-surface p-6">
            <p>{t.empty}</p>
            <Button href={shopPath(locale)}>{t.toShop}</Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <CartTable
                rows={rows}
                action={updateCartLine}
                locale={locale}
                labels={{
                  quantity: t.quantity,
                  update: t.update,
                  remove: t.remove,
                  each: t.each,
                }}
              />
            </div>
            <div className="lg:col-span-4">
              <OrderSummary
                title={t.summary}
                rows={[
                  { label: t.products, value: money(cart.total) },
                  { label: t.delivery, value: t.deliveryValue },
                ]}
                total={{ label: t.total, value: money(cart.total) }}
                note={cart.canOrder ? t.totalNote : t.fixCart}
                action={
                  cart.canOrder ? { href: checkoutPath(locale), label: t.toCheckout } : undefined
                }
              />
              {inputsFinance && (
                <div className="mt-6">
                  <FinanceCallout
                    kicker={f.cartKicker}
                    title={f.cartTitle}
                    body={<FactText text={f.cartBody} figures={figures} locale={locale} />}
                    steps={[...f.steps]}
                    primary={{ href: inputsFinance.href, label: f.cartPrimary }}
                    secondary={simulate}
                    note={f.cartNote}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {rows.length > 0 && (
        <div className="mt-20">
          <LeadFormBlock
            block={{
              leadType: 'inputuri',
              extraFields: ['county'],
              heading: t.bulkTitle,
              body: t.bulkBody,
            }}
            locale={locale}
            path={locale === 'ro' ? '/cos' : '/cart'}
            products={ids}
          />
        </div>
      )}
    </SiteShell>
  )
}
