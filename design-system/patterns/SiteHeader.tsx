import Link from 'next/link'

import { localePath, type Locale } from '@/i18n/config'
import { formatNumber } from '@/lib/format'

import type { CropKey } from '../fixtures/sample'
import { MenuIcon, PhoneIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { Button } from '../primitives/Button'
import { Delta } from '../primitives/Delta'
import { CartLink } from './CartLink'
import { MegaMenu } from './MegaMenu'
import { linkBase, linkState } from './nav-styles'
import { Lockup } from './parts'

export type NavItem = {
  href: string
  label: string
  /** One sentence for the menu panel. */
  blurb?: string | null
  /** Sub-pages: shown in the desktop panel and indented in the mobile menu. */
  children?: { href: string; label: string; description?: string | null }[]
}

export type SiteHeaderProps = {
  locale: Locale
  nav: NavItem[]
  /** href of the current section, marked with aria-current. */
  current?: string
  cta: { href: string; label: string }
  /** The shop cart; its count is a tiny client island. */
  cart?: { href: string; label: string }
  labels: { menu: string; main: string; language: string; all?: string; call?: string }
  /** Phone in the menu panels ("call us"), from the figures register. */
  phone?: string
  /** `overlay`: transparent, light text, for drawing over a hero photo. */
  tone?: 'default' | 'overlay'
  /**
   * Public URL of this page in each language. A language without an equivalent page
   * links to that language's home.
   */
  alternates?: Partial<Record<Locale, string>>
  /** Optional strip above the header with today's prices and the phone number. */
  ticker?: {
    crops: { crop: CropKey; name: string; price: number; change: number }[]
    phone?: string
    /** Where the prices link to, and its label for screen readers. */
    link?: { href: string; label: string }
  }
}

/** Site header: logo, sections, language, one call to action. Mobile menu needs no JavaScript. */
export function SiteHeader({
  locale,
  nav,
  current,
  cta,
  cart,
  labels,
  tone = 'default',
  ticker,
  alternates = {},
  phone,
}: SiteHeaderProps) {
  const overlay = tone === 'overlay'
  return (
    <div className={cx(overlay && 'relative z-30')}>
      {ticker && (
        <div className="bg-forest text-caption text-on-forest">
          <div className="mx-auto flex h-10 max-w-page items-center gap-6 px-4 md:px-8">
            <ul className="flex min-w-0 items-center gap-5 overflow-hidden">
              {ticker.crops.map((c, i) => (
                <li
                  key={c.crop}
                  className={cx(
                    'flex items-center gap-2 whitespace-nowrap',
                    i > 0 && 'hidden md:flex',
                  )}
                >
                  <span className="text-on-forest-muted">{c.name}</span>
                  <span className="font-semibold tabular-nums">
                    {formatNumber(c.price, locale)}
                  </span>
                  <Delta value={c.change} locale={locale} size="sm" />
                </li>
              ))}
            </ul>
            {ticker.link && (
              <Link
                href={ticker.link.href}
                className="ml-auto shrink-0 font-semibold text-lime no-underline hover:underline"
              >
                {ticker.link.label}
              </Link>
            )}
            {ticker.phone && (
              <a
                href={`tel:${ticker.phone!.replace(/\s/g, '')}`}
                className={cx(
                  'flex shrink-0 items-center gap-2 font-medium text-on-forest no-underline hover:text-lime',
                  !ticker.link && 'ml-auto',
                )}
              >
                <PhoneIcon className="size-4" />
                <span className="tabular-nums">{ticker.phone}</span>
              </a>
            )}
          </div>
        </div>
      )}
      <header
        className={overlay ? 'border-b border-on-forest/15' : 'border-b border-line bg-paper'}
      >
        <div className="relative mx-auto flex h-18 max-w-page items-center gap-6 px-4 md:px-8">
          <Link href={localePath('/', locale)} className="no-underline" aria-label="Agrinvest">
            <Lockup tone={overlay ? 'light' : 'dark'} />
          </Link>
          <MegaMenu nav={nav} current={current} overlay={overlay} phone={phone} labels={labels} />
          <div className="ml-auto flex items-center gap-3">
            <div
              role="group"
              aria-label={labels.language}
              className={cx(
                'hidden rounded-md p-1 md:flex',
                overlay ? 'bg-on-forest/10' : 'bg-surface',
              )}
            >
              {(['ro', 'en'] as const).map((l) => (
                <Link
                  key={l}
                  href={alternates[l] ?? localePath('/', l)}
                  lang={l}
                  aria-current={l === locale ? 'true' : undefined}
                  className={cx(
                    'inline-flex h-8 items-center rounded-sm px-3 text-caption font-semibold uppercase no-underline',
                    l === locale
                      ? 'bg-raised text-ink shadow-soft'
                      : overlay
                        ? 'text-on-forest/85 hover:text-on-forest'
                        : 'text-muted hover:text-ink',
                  )}
                >
                  {l}
                </Link>
              ))}
            </div>
            {cart && <CartLink href={cart.href} label={cart.label} overlay={overlay} />}
            <Button
              href={cta.href}
              size="sm"
              variant={overlay ? 'lime' : 'primary'}
              className="hidden md:inline-flex"
            >
              {cta.label}
            </Button>
            <details className="group lg:hidden">
              <summary
                className={cx(
                  'flex size-11 cursor-pointer list-none items-center justify-center rounded-md ring-1 ring-inset',
                  overlay
                    ? 'bg-on-forest/10 text-on-forest ring-on-forest/30'
                    : 'bg-raised ring-line-strong',
                )}
              >
                <MenuIcon className="size-5" />
                <span className="sr-only">{labels.menu}</span>
              </summary>
              <nav
                aria-label={labels.main}
                className="absolute inset-x-4 top-full z-20 mt-2 rounded-lg bg-raised p-2 shadow-floating ring-1 ring-line md:left-auto md:w-80"
              >
                <ul className="grid">
                  {nav.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={item.href === current ? 'page' : undefined}
                        className={cx(
                          linkBase,
                          linkState(item.href === current),
                          'h-12 w-full text-body',
                        )}
                      >
                        {item.label}
                      </Link>
                      {!!item.children?.length && (
                        <ul className="mb-1 ml-3.5 grid border-l border-line pl-2">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                aria-current={child.href === current ? 'page' : undefined}
                                className={cx(
                                  linkBase,
                                  linkState(child.href === current),
                                  'h-11 w-full',
                                )}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
                <Button href={cta.href} fullWidth className="mt-2 md:hidden">
                  {cta.label}
                </Button>
              </nav>
            </details>
          </div>
        </div>
      </header>
    </div>
  )
}
