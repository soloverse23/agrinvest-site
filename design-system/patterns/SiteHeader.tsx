import Link from 'next/link'

import { localePath, type Locale } from '@/i18n/config'

import type { CropKey } from '../fixtures/sample'
import { ChevronDownIcon, MenuIcon, PhoneIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { Button } from '../primitives/Button'
import { CartLink } from './CartLink'
import { MegaMenu } from './MegaMenu'
import {
  groupChildren,
  LinksPanel,
  PanelFrame,
  ShopPanel,
  type NavItem,
  type ShopPanelData,
} from './MenuPanels'
import { linkBase, linkState } from './nav-styles'
import { Lockup } from './parts'
import { QuoteStrip, type Quote } from './QuoteStrip'

export type { NavChild, NavItem, ShopPanelData } from './MenuPanels'

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
  /** What the shop panel lists (live categories with counts); without it that item shows its links. */
  shop?: ShopPanelData
  /** href of a section whose panel starts open (stories and screenshots). */
  openPanel?: string
  /** `overlay`: transparent, light text, for drawing over a hero photo. */
  tone?: 'default' | 'overlay'
  /**
   * Public URL of this page in each language. A language without an equivalent page
   * links to that language's home.
   */
  alternates?: Partial<Record<Locale, string>>
  /** Optional strip above the header with today's prices and the phone number. */
  ticker?: {
    crops: {
      crop: CropKey
      name: string
      price: number
      change: number
      href: string
      /** The last 30 days, oldest first (trend line). */
      points?: number[]
    }[]
    /** Diesel as one more price, with a fuel icon. */
    fuel?: {
      name: string
      price: number
      unit: string
      change?: number
      href: string
      points?: number[]
    }
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
  shop,
  openPanel,
}: SiteHeaderProps) {
  const overlay = tone === 'overlay'
  // Diesel sits after the first three crops, as it always has.
  const quotes: Quote[] = ticker
    ? ticker.crops.map((c) => ({
        key: c.crop,
        name: c.name,
        href: c.href,
        price: c.price,
        unit: 'lei/t',
        change: c.change,
        points: c.points,
      }))
    : []
  if (ticker?.fuel)
    quotes.splice(Math.min(3, quotes.length), 0, {
      key: 'diesel',
      ...ticker.fuel,
      decimals: 2,
      fuel: true,
      showUnit: true,
    })
  const mega = nav.map((item) => {
    const shopPanel = item.panel === 'shop' && shop
    const hasPanel = shopPanel || !!item.children?.length
    return {
      href: item.href,
      label: item.label,
      panel: hasPanel ? (
        <PanelFrame>
          {shopPanel ? (
            <ShopPanel item={item} shop={shop} />
          ) : (
            <LinksPanel item={item} phone={phone} labels={labels} />
          )}
        </PanelFrame>
      ) : undefined,
    }
  })
  return (
    <div className={cx(overlay && 'relative z-30')}>
      {ticker && (
        <div className="bg-forest text-caption text-on-forest">
          <div className="mx-auto flex h-10 max-w-page items-center gap-4 px-4 md:gap-6 md:px-8">
            <QuoteStrip
              id="ticker-prices"
              locale={locale}
              quotes={quotes}
              variant="bar"
              className="-ml-4 flex-1 md:-ml-8"
            />
            {ticker.link && (
              <Link
                href={ticker.link.href}
                className="hidden shrink-0 font-semibold text-lime no-underline hover:underline lg:inline"
              >
                {ticker.link.label}
              </Link>
            )}
            {ticker.phone && (
              <a
                href={`tel:${ticker.phone!.replace(/\s/g, '')}`}
                aria-label={ticker.phone}
                className="flex shrink-0 items-center gap-2 font-medium text-on-forest no-underline hover:text-lime"
              >
                <PhoneIcon className="size-4" />
                <span className="hidden tabular-nums md:inline">{ticker.phone}</span>
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
          <MegaMenu
            items={mega}
            current={current}
            overlay={overlay}
            label={labels.main}
            initialOpen={openPanel}
          />
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
                className="absolute inset-x-4 top-full z-20 mt-2 max-h-[75dvh] overflow-y-auto rounded-lg bg-raised p-2 shadow-floating ring-1 ring-line md:left-auto md:w-80"
              >
                <ul className="grid">
                  {nav.map((item) => {
                    const active = item.href === current
                    if (!item.children?.length)
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            className={cx(linkBase, linkState(active), 'h-12 w-full text-body')}
                          >
                            {item.label}
                          </Link>
                        </li>
                      )
                    // A section with sub-pages folds open on its own, with no script. Its
                    // links are in the page either way.
                    return (
                      <li key={item.href}>
                        <details open={active} className="group/item">
                          <summary
                            className={cx(
                              linkBase,
                              linkState(active),
                              'h-12 w-full cursor-pointer list-none justify-between text-body',
                            )}
                          >
                            {item.label}
                            <ChevronDownIcon className="size-4 opacity-60 transition-transform duration-150 group-open/item:rotate-180" />
                          </summary>
                          <ul className="mb-1 ml-3.5 grid border-l border-line pl-2">
                            <li>
                              <Link
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={cx(
                                  linkBase,
                                  linkState(false),
                                  'h-11 w-full font-semibold text-accent',
                                )}
                              >
                                {labels.all ? `${labels.all}: ${item.label}` : item.label}
                              </Link>
                            </li>
                            {groupChildren(item.children).map((group) => (
                              <li key={group.title ?? ''}>
                                {group.title && (
                                  <p className="px-3.5 pb-1 pt-3 text-caption font-semibold uppercase tracking-wide text-muted">
                                    {group.title}
                                  </p>
                                )}
                                <ul className="grid">
                                  {group.items.map((child) => (
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
                              </li>
                            ))}
                          </ul>
                        </details>
                      </li>
                    )
                  })}
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
