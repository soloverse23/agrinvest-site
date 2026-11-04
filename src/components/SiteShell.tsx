import type { ReactNode } from 'react'

import { SiteFooter } from '@ds/patterns/SiteFooter'
import { SiteHeader } from '@ds/patterns/SiteHeader'
import { localePath, type Locale } from '@/i18n/config'
import { fixedUrl, ui } from '@/i18n/ui'
import { getFigures, getFooter, getNavigation, getSeoDefaults } from '@/lib/content/globals'
import type { Alternates } from '@/lib/content/pages'

import { CookieSettings } from './CookieSettings'
import { FactMark } from './Fact'

/** Social profiles by host, for the footer labels. */
const socialName = (url: string) =>
  [
    ['facebook', 'Facebook'],
    ['instagram', 'Instagram'],
    ['linkedin', 'LinkedIn'],
    ['tiktok', 'TikTok'],
    ['youtube', 'YouTube'],
  ].find(([host]) => url.includes(host))?.[1] ?? url

/**
 * Header, main and footer for every public page. `overlay`: the page opens with a
 * full-bleed hero, so the header sits transparent on top of it.
 */
export async function SiteShell({
  locale,
  alternates,
  overlay,
  children,
}: {
  locale: Locale
  alternates: Alternates
  overlay?: boolean
  children: ReactNode
}) {
  const [nav, footer, figures, seo] = await Promise.all([
    getNavigation(locale),
    getFooter(locale),
    getFigures(locale),
    getSeoDefaults(locale),
  ])
  const t = ui[locale]
  const items = (nav.items ?? []).map((i) => ({
    href: i.link.href,
    label: i.link.label,
    blurb: i.blurb,
    children: (i.children ?? []).map((c) => ({
      href: c.link.href,
      label: c.link.label,
      description: c.description,
    })),
  }))
  const self = alternates[locale]
  const current = items.find((i) => self === i.href || self?.startsWith(`${i.href}/`))?.href
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
      cta={{
        href: nav.cta?.href || fixedUrl('contact', locale),
        label: nav.cta?.label || t.contact,
      }}
      labels={{ menu: t.menu, main: t.mainNav, language: t.language, all: t.allIn, call: t.call }}
    />
  )

  return (
    <>
      {overlay ? <div className="absolute inset-x-0 top-0 z-30">{header}</div> : header}
      <main id="main">{children}</main>
      <SiteFooter
        homeHref={localePath('/', locale)}
        about={t.about}
        labels={{ contact: t.contactUs, social: t.social, footer: t.footer }}
        contact={[
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
        bottomLinks={[{ href: fixedUrl('privacy', locale), label: t.privacy }]}
        extra={seo.analytics?.ga4 ? <CookieSettings label={t.cookies} /> : undefined}
      />
    </>
  )
}
