import type { ReactNode } from 'react'

import { SiteHeader } from '@ds/patterns/SiteHeader'
import { localePath, type Locale } from '@/i18n/config'
import { fixedUrl, ui } from '@/i18n/ui'
import { getFigures, getFooter, getNavigation } from '@/lib/content/globals'
import type { Alternates } from '@/lib/content/pages'

import { Fact } from './Fact'

/**
 * Header, main and footer for every public page. The footer here is the 2.1 scaffold;
 * the SiteFooter pattern replaces it in 2.2.
 */
export async function SiteShell({
  locale,
  alternates,
  children,
}: {
  locale: Locale
  alternates: Alternates
  children: ReactNode
}) {
  const [nav, footer, figures] = await Promise.all([
    getNavigation(locale),
    getFooter(locale),
    getFigures(locale),
  ])
  const t = ui[locale]
  const items = (nav.items ?? []).map((i) => ({ href: i.link.href, label: i.link.label }))
  const self = alternates[locale]
  const current = items.find((i) => self === i.href || self?.startsWith(`${i.href}/`))?.href
  const phone = figures['C9.phone']?.value
  const email = figures['C9.email']?.value

  return (
    <>
      <SiteHeader
        locale={locale}
        nav={items}
        current={current}
        alternates={alternates}
        cta={{
          href: nav.cta?.href || fixedUrl('contact', locale),
          label: nav.cta?.label || t.contact,
        }}
        labels={{ menu: t.menu, main: t.mainNav, language: t.language }}
      />
      <main id="main">{children}</main>
      <footer className="mt-24 border-t border-line bg-surface">
        <div className="mx-auto grid max-w-page gap-8 px-4 py-12 md:grid-cols-3 md:px-8">
          <nav aria-label={t.mainNav}>
            <ul className="grid gap-2 text-small">
              <li>
                <a href={localePath('/', locale)}>{t.home}</a>
              </li>
              {items.map((i) => (
                <li key={i.href}>
                  <a href={i.href}>{i.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          {(footer.columns ?? []).map((col) => (
            <div key={col.id} className="grid content-start gap-2 text-small">
              <p className="font-semibold">{col.title}</p>
              {(col.links ?? []).map((l) => (
                <a key={l.id} href={l.link.href}>
                  {l.link.label}
                </a>
              ))}
            </div>
          ))}
          <address className="grid content-start gap-2 text-small not-italic">
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, '')}`}>
                <Fact k="C9.phone" locale={locale} />
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`}>
                <Fact k="C9.email" locale={locale} />
              </a>
            )}
            <a href={fixedUrl('privacy', locale)}>{t.privacy}</a>
          </address>
        </div>
        {footer.legal && (
          <p className="mx-auto max-w-page px-4 pb-10 text-caption text-muted md:px-8">
            {footer.legal}
          </p>
        )}
      </footer>
    </>
  )
}
