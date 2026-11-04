import type { Metadata } from 'next'

import { CheckoutForm } from '@ds/patterns/CheckoutForm'
import { OrderSummary } from '@ds/patterns/Commerce'
import { JsonLd } from '@/components/JsonLd'
import { PageTitle } from '@/components/PageParts'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import { commerceUi } from '@/i18n/commerce'
import { cartPath, checkoutPath, shopPath } from '@/i18n/routes'
import { fixedUrl, ui } from '@/i18n/ui'
import { lookupCompany, placeOrder } from '@/lib/commerce/actions'
import { pricedCart } from '@/lib/commerce/cart'
import { listBases, listCounties } from '@/lib/content/locations'
import { formatQuantity } from '@/lib/format'
import { breadcrumbs, webPage } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo/metadata'

import { packLabel } from './ShopParts'

const alternates = { ro: checkoutPath('ro'), en: checkoutPath('en') }

export function checkoutMetadata(locale: Locale): Metadata {
  const t = commerceUi[locale]
  return buildMetadata({
    locale,
    title: t.checkoutTitle,
    seoTitle: t.seoCheckout,
    description: t.seoCheckoutDescription,
    noindex: true,
    alternates,
  })
}

/**
 * Checkout: personal, rendered per request, never indexed. It keeps rendering once the cart is
 * empty, because the confirmation appears in the form after the order empties the cart.
 */
export async function CheckoutPage({ locale }: { locale: Locale }) {
  const t = commerceUi[locale]
  const [cart, counties, bases] = await Promise.all([
    pricedCart(locale),
    listCounties(),
    listBases(locale),
  ])
  const money = (value: number) => formatQuantity(value, 'lei', locale)
  return (
    <SiteShell locale={locale} alternates={alternates}>
      <JsonLd
        data={[
          webPage({
            url: checkoutPath(locale),
            name: t.checkoutTitle,
            description: t.seoCheckoutDescription,
            locale,
          }),
          breadcrumbs(locale, ui[locale].home, [
            { name: t.cartTitle, url: cartPath(locale) },
            { name: t.checkoutTitle, url: checkoutPath(locale) },
          ]),
        ]}
      />
      <PageTitle
        locale={locale}
        title={t.checkoutTitle}
        summary={t.checkoutSummary}
        crumbs={[
          { name: t.cartTitle, url: cartPath(locale) },
          { name: t.checkoutTitle, url: checkoutPath(locale) },
        ]}
      />
      <div className="mx-auto mt-10 grid max-w-page gap-8 px-4 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <CheckoutForm
            locale={locale}
            action={placeOrder}
            lookup={lookupCompany}
            counties={counties.map((c) => ({ value: String(c.id), label: c.name }))}
            bases={bases.map((b) => ({ value: String(b.id), label: b.name }))}
            needsCertificate={cart.needsCertificate}
            hasProtection={cart.hasProtection}
            empty={cart.lines.length === 0}
            sourcePath={checkoutPath(locale)}
            privacyHref={fixedUrl('privacy', locale)}
            termsHref={fixedUrl('terms', locale)}
            shopHref={shopPath(locale)}
          />
        </div>
        {cart.lines.length > 0 && (
          <div className="lg:col-span-4">
            <OrderSummary
              title={t.summary}
              rows={cart.lines.map((l) => ({
                label: [
                  `${l.quantity} × ${l.name ?? l.sku}`,
                  l.size && l.unit ? packLabel({ size: l.size, unit: l.unit }, locale) : null,
                ]
                  .filter(Boolean)
                  .join(', '),
                value: l.lineTotal === null ? '–' : money(l.lineTotal),
              }))}
              total={{ label: t.total, value: money(cart.total) }}
              note={t.totalNote}
            />
          </div>
        )}
      </div>
    </SiteShell>
  )
}
