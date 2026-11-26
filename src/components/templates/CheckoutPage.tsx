import type { Metadata } from 'next'

import { CheckoutForm } from '@ds/patterns/CheckoutForm'
import { CardMarks } from '@ds/patterns/PaymentMarks'
import { JsonLd } from '@/components/JsonLd'
import { Crumbs } from '@/components/PageParts'
import { sellerContacts, sellerLines } from '@/components/Seller'
import { SiteShell } from '@/components/SiteShell'
import type { Locale } from '@/i18n/config'
import { commerceUi } from '@/i18n/commerce'
import { cartPath, checkoutPath, shopPath } from '@/i18n/routes'
import { fixedUrl, ui } from '@/i18n/ui'
import { lookupCompany, placeOrder } from '@/lib/commerce/actions'
import { pricedCart } from '@/lib/commerce/cart'
import { getFigures } from '@/lib/content/globals'
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
  const [cart, counties, bases, figures] = await Promise.all([
    pricedCart(locale),
    listCounties(),
    listBases(locale),
    getFigures(locale),
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
      <CheckoutForm
        locale={locale}
        action={placeOrder}
        lookup={lookupCompany}
        counties={counties.map((c) => ({ value: String(c.id), label: c.name }))}
        bases={bases.map((b) => ({ value: String(b.id), label: b.name }))}
        needsCertificate={cart.needsCertificate}
        hasProtection={cart.hasProtection}
        empty={cart.lines.length === 0}
        lines={cart.lines.map((l) => ({
          sku: l.sku,
          name: l.name ?? l.sku,
          pack:
            l.size && l.unit
              ? (packLabel({ size: l.size, unit: l.unit }, locale) ?? undefined)
              : undefined,
          quantity: l.quantity,
          total: l.lineTotal === null ? '–' : money(l.lineTotal),
        }))}
        total={money(cart.total)}
        crumbs={
          <Crumbs
            locale={locale}
            items={[
              { name: t.cartTitle, url: cartPath(locale) },
              { name: t.checkoutTitle, url: checkoutPath(locale) },
            ]}
          />
        }
        sourcePath={checkoutPath(locale)}
        privacyHref={fixedUrl('privacy', locale)}
        termsHref={fixedUrl('terms', locale)}
        shopHref={shopPath(locale)}
        cartHref={cartPath(locale)}
        contactHref={fixedUrl('contact', locale)}
        cardMarks={<CardMarks label={t.cards} />}
        seller={
          <>
            {sellerLines(figures, locale).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            <p className="flex flex-wrap gap-x-3">
              {sellerContacts(figures, locale).map((c) => (
                <a key={c.href} href={c.href} className="font-medium text-accent">
                  <span className="sr-only">{c.label}: </span>
                  {c.value}
                </a>
              ))}
            </p>
            <p className="flex flex-wrap gap-x-3">
              <a href={fixedUrl('terms', locale)}>{t.terms}</a>
              <a href={fixedUrl('returns', locale)}>{t.returns}</a>
              <a href={fixedUrl('complaints', locale)}>{t.complaints}</a>
              <a href="https://anpc.ro/">{t.anpc}</a>
            </p>
          </>
        }
      />
    </SiteShell>
  )
}
