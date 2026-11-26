import type { ReactNode } from 'react'

import { AnpcMarks, CardMarks } from '@ds/patterns/PaymentMarks'
import { SiteFooter } from '@ds/patterns/SiteFooter'
import { headerScript, SiteHeader } from '@ds/patterns/SiteHeader'
import type { NavItem, ShopPanelData } from '@ds/patterns/SiteHeader'
import { commerceUi } from '@/i18n/commerce'
import { localePath, type Locale } from '@/i18n/config'
import { pricesUi } from '@/i18n/prices'
import { cartPath, categoryPath, hubPath, pricesPath, searchPath, shopPath } from '@/i18n/routes'
import { shopUi } from '@/i18n/shop'
import { fixedUrl, ui } from '@/i18n/ui'
import { getFigures, getFooter, getNavigation, getSeoDefaults } from '@/lib/content/globals'
import type { Alternates } from '@/lib/content/pages'
import { getShopMenu } from '@/lib/content/shop'
import { marketHrefs } from '@/lib/markets/links'
import { marketTicker } from '@/lib/markets/ticker'

import { CookieSettings } from './CookieSettings'
import { FactMark } from './Fact'
import { sellerContacts, sellerLines } from './Seller'

/** Social profiles by host, for the footer labels. */
const socialName = (url: string) =>
  [
    ['facebook', 'Facebook'],
    ['instagram', 'Instagram'],
    ['linkedin', 'LinkedIn'],
    ['tiktok', 'TikTok'],
    ['youtube', 'YouTube'],
  ].find(([host]) => url.includes(host))?.[1] ?? url

/** The shop panel's data: live categories with counts, crops, brands and the search. */
async function shopPanel(locale: Locale): Promise<ShopPanelData | undefined> {
  const menu = await getShopMenu(locale)
  if (!menu.categories.length) return undefined
  const t = shopUi[locale]
  return {
    all: { href: shopPath(locale), label: t.allProducts, count: menu.total },
    categories: menu.categories.map((c) => ({
      href: categoryPath(c.slug, locale),
      label: c.name,
      count: c.count,
      // Structure simplification (2026-11-26): the menu shows the three main categories only;
      // their types (herbicides, fungicides…) are the tiles and chips on the category page.
      children: [],
    })),
    crops: menu.crops.slice(0, 8).map((c) => ({
      href: hubPath('crop', c.slug, locale),
      label: c.name,
      count: c.count,
    })),
    brands: menu.brands.slice(0, 6).map((b) => ({
      href: hubPath('brand', b.slug, locale),
      label: b.name,
      count: b.count,
    })),
    search: { action: searchPath(locale), name: 'q' },
    labels: {
      crops: t.byCrop,
      brands: t.brands,
      search: t.searchLabel,
      placeholder: t.searchPlaceholder,
    },
  }
}

/**
 * Header, main and footer for every public page. `overlay`: the page opens with a
 * full-bleed hero, so the header sits transparent on top of it. `ticker={false}`: the page
 * already shows the prices (the home hero), so the strip above the header is left out.
 */
export async function SiteShell({
  locale,
  alternates,
  overlay,
  ticker = true,
  children,
}: {
  locale: Locale
  alternates: Alternates
  overlay?: boolean
  ticker?: boolean
  children: ReactNode
}) {
  const [nav, footer, figures, seo, markets, shop] = await Promise.all([
    getNavigation(locale),
    getFooter(locale),
    getFigures(locale),
    getSeoDefaults(locale),
    ticker ? marketHrefs(locale).then((hrefs) => marketTicker(locale, hrefs)) : null,
    shopPanel(locale),
  ])
  const t = ui[locale]
  const items: NavItem[] = (nav.items ?? []).map((i) => ({
    href: i.link.href,
    label: i.link.label,
    blurb: i.blurb,
    panel: i.panel,
    promo:
      i.promo?.title && i.promo.link?.href && i.promo.link.label
        ? {
            title: i.promo.title,
            text: i.promo.text,
            href: i.promo.link.href,
            label: i.promo.link.label,
          }
        : null,
    children: (i.children ?? []).map((c) => ({
      href: c.link.href,
      label: c.link.label,
      description: c.description,
      group: c.group,
    })),
  }))
  // The section whose address, or whose sub-page's address, the page is under.
  const self = alternates[locale]?.split('#')[0]
  const under = (href: string) => {
    const h = href.split('#')[0]
    return self === h || !!self?.startsWith(`${h}/`)
  }
  const current =
    items.find((i) => under(i.href))?.href ??
    items.find((i) => i.children?.some((c) => c.href !== i.href && under(c.href)))?.href
  const phone = figures['C9.phone']
  const email = figures['C9.email']

  const header = (
    <SiteHeader
      locale={locale}
      nav={items}
      current={current}
      alternates={alternates}
      tone={overlay ? 'overlay' : 'default'}
      // The menu repeats the phone without a marker, so only once it is confirmed.
      phone={phone?.status === 'confirmed' ? phone.value : undefined}
      shop={shop}
      cart={{ href: cartPath(locale), label: commerceUi[locale].cart }}
      // Market quotes (Phase 7f): Brent, EUR/RON, diesel, wheat, urea; hidden before any data.
      ticker={
        markets
          ? {
              quotes: markets.quotes,
              phone: phone?.status === 'confirmed' ? phone.value : undefined,
              link: { href: pricesPath(locale), label: pricesUi[locale].widget.grainLink },
            }
          : undefined
      }
      cta={{
        href: nav.cta?.href || fixedUrl('contact', locale),
        label: nav.cta?.label || t.contact,
      }}
      labels={{ menu: t.menu, main: t.mainNav, language: t.language, all: t.allIn, call: t.call }}
    />
  )

  return (
    <>
      {header}
      <script dangerouslySetInnerHTML={{ __html: headerScript }} />
      <main id="main">{children}</main>
      <SiteFooter
        homeHref={localePath('/', locale)}
        about={t.about}
        labels={{ contact: t.contactUs, social: t.social, footer: t.footer }}
        contact={[
          // The shop's order line and email first: ING WebPay asks for them on every page.
          ...sellerContacts(figures, locale),
          ...(phone
            ? [
                {
                  label: t.phone,
                  href: `tel:${phone.value.replace(/\s/g, '')}`,
                  value: (
                    <>
                      {phone.value}
                      <FactMark figure={phone} locale={locale} />
                    </>
                  ),
                },
              ]
            : []),
          ...(email
            ? [
                {
                  label: t.email,
                  href: `mailto:${email.value}`,
                  value: (
                    <>
                      {email.value}
                      <FactMark figure={email} locale={locale} />
                    </>
                  ),
                },
              ]
            : []),
        ]}
        columns={(footer.columns ?? []).map((col) => ({
          title: col.title,
          links: (col.links ?? []).map((l) => ({ href: l.link.href, label: l.link.label })),
        }))}
        social={(seo.organization?.sameAs ?? []).map((s) => ({
          href: s.url,
          label: socialName(s.url),
        }))}
        legal={footer.legal}
        company={sellerLines(figures, locale)}
        marks={
          <>
            <CardMarks label={commerceUi[locale].cards} />
            <AnpcMarks salLabel={commerceUi[locale].sal} />
          </>
        }
        bottomLinks={[
          { href: fixedUrl('privacy', locale), label: t.privacy },
          { href: fixedUrl('terms', locale), label: commerceUi[locale].terms },
          { href: fixedUrl('delivery', locale), label: commerceUi[locale].deliveryPage },
          { href: fixedUrl('returns', locale), label: commerceUi[locale].returns },
          { href: fixedUrl('cookies', locale), label: commerceUi[locale].cookiesPage },
          { href: fixedUrl('complaints', locale), label: commerceUi[locale].complaints },
          { href: 'https://anpc.ro/', label: commerceUi[locale].anpc },
        ]}
        extra={seo.analytics?.ga4 ? <CookieSettings label={t.cookies} /> : undefined}
      />
    </>
  )
}
