import Link from 'next/link'
import type { ReactNode } from 'react'

import { ArrowRightIcon, PhoneIcon } from '../icons/icons'
import { SearchIcon } from '../icons/server'
import { cx } from '../lib/cx'

/* Server components: the panels of the desktop menu. They carry the links in the HTML that
   crawlers read; the client MegaMenu only opens and closes them. */

export type NavChild = {
  href: string
  label: string
  description?: string | null
  /** Column heading; children with the same heading share a column. */
  group?: string | null
}

export type NavItem = {
  href: string
  label: string
  /** One sentence for the menu panel. */
  blurb?: string | null
  /** `shop`: the panel is built from the live categories (`SiteHeaderProps.shop`). */
  panel?: 'links' | 'shop' | null
  /** A card beside the links. */
  promo?: { title: string; text?: string | null; href: string; label: string } | null
  /** Sub-pages: shown in the desktop panel and in the mobile menu. */
  children?: NavChild[]
}

export type ShopMenuLine = { href: string; label: string; count: number }

export type ShopPanelData = {
  all: { href: string; label: string; count: number }
  categories: (ShopMenuLine & { children: ShopMenuLine[] })[]
  crops: ShopMenuLine[]
  brands: ShopMenuLine[]
  search: { action: string; name: string }
  labels: { crops: string; brands: string; search: string; placeholder: string }
}

export type PanelLabels = { all?: string; call?: string }

/** The children in columns, in the order their headings first appear. */
export function groupChildren(children: NavChild[]) {
  const groups: { title: string | null; items: NavChild[] }[] = []
  for (const child of children) {
    const title = child.group || null
    const group = groups.find((g) => g.title === title)
    if (group) group.items.push(child)
    else groups.push({ title, items: [child] })
  }
  return groups
}

const columns = { 1: 'grid-cols-2', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-2' } as const

const heading = 'text-caption font-semibold uppercase tracking-wide text-muted'

function Promo({ promo }: { promo: NonNullable<NavItem['promo']> }) {
  return (
    <div className="grid content-start gap-3 rounded-lg bg-forest p-6 text-on-forest">
      <p className="text-h4 font-semibold">{promo.title}</p>
      {promo.text && <p className="text-small text-on-forest-muted">{promo.text}</p>}
      <Link
        href={promo.href}
        className="inline-flex items-center gap-1.5 text-small font-semibold text-lime no-underline hover:underline"
      >
        {promo.label}
        <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  )
}

/** Blurb, link to the section and phone: the quiet card beside every panel. */
function Aside({ item, phone, labels }: { item: NavItem; phone?: string; labels: PanelLabels }) {
  return (
    <div className="col-span-3 grid content-start gap-4">
      {item.promo && <Promo promo={item.promo} />}
      <div className="grid content-start gap-4 rounded-lg bg-surface p-6">
        {item.blurb && <p className="text-small text-muted">{item.blurb}</p>}
        <Link
          href={item.href}
          className="inline-flex items-center gap-1.5 text-small font-semibold text-accent no-underline hover:underline"
        >
          {labels.all ?? item.label}
          <ArrowRightIcon className="size-4" />
        </Link>
        {phone && (
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="inline-flex items-center gap-2 text-small font-semibold text-ink no-underline hover:text-accent"
          >
            <PhoneIcon className="size-4 text-accent" />
            <span>
              {labels.call && <span className="font-normal text-muted">{labels.call} </span>}
              <span className="tabular-nums">{phone}</span>
            </span>
          </a>
        )}
      </div>
    </div>
  )
}

/** Sub-pages in columns under headings, with the section's answer on the right. */
export function LinksPanel({
  item,
  phone,
  labels,
}: {
  item: NavItem
  phone?: string
  labels: PanelLabels
}) {
  const groups = groupChildren(item.children ?? [])
  const grouped = groups.some((g) => g.title)
  return (
    <>
      <div
        className={cx(
          'col-span-9 grid content-start gap-x-6 gap-y-8',
          columns[Math.min(groups.length, 4) as 1 | 2 | 3 | 4],
        )}
      >
        {groups.map((group) => (
          <div key={group.title ?? ''} className="grid content-start gap-1">
            {group.title && <p className={cx(heading, 'px-4 pb-1')}>{group.title}</p>}
            <ul className={cx('grid gap-0.5', !grouped && 'grid-cols-2 gap-1')}>
              {group.items.map((child) => (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    className="grid gap-0.5 rounded-lg px-4 py-2.5 no-underline transition-colors duration-150 hover:bg-surface"
                  >
                    <span className="font-semibold text-ink">{child.label}</span>
                    {child.description && (
                      <span className="text-small text-muted">{child.description}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Aside item={item} phone={phone} labels={labels} />
    </>
  )
}

const lineLink =
  'flex items-baseline justify-between gap-3 rounded-md px-3 py-1.5 text-small no-underline transition-colors duration-150 hover:bg-surface'

/** A product count beside a shop link; screen readers hear it as part of the link text. */
function Count({ n }: { n: number }) {
  return <span className="text-caption font-normal tabular-nums text-muted">{n}</span>
}

function CategoryBlock({ category }: { category: ShopPanelData['categories'][number] }) {
  return (
    <div className="grid content-start gap-1">
      <Link
        href={category.href}
        className="flex items-baseline justify-between gap-3 rounded-md px-3 py-1.5 font-semibold text-ink no-underline transition-colors duration-150 hover:bg-surface"
      >
        {category.label}
        <Count n={category.count} />
      </Link>
      {category.children.length > 0 && (
        <ul className="grid gap-0.5">
          {category.children.map((c) => (
            <li key={c.href}>
              <Link href={c.href} className={cx(lineLink, 'text-body')}>
                <span className="text-small text-ink">{c.label}</span>
                <Count n={c.count} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * The shop panel: categories with their subcategories and counts, crops, brands and a search
 * box (a plain GET form, so it works without JavaScript), with the promo card beside them.
 */
export function ShopPanel({ item, shop }: { item: NavItem; shop: ShopPanelData }) {
  // The category with the most subcategories gets a column; the others share one, so the
  // columns stay about as tall as each other.
  const long = shop.categories.reduce<ShopPanelData['categories'][number] | undefined>(
    (best, c) => (!best || c.children.length > best.children.length ? c : best),
    undefined,
  )
  const short = shop.categories.filter((c) => c !== long)
  return (
    <>
      <div className="col-span-9 grid content-start gap-6">
        <div className="flex items-center gap-4">
          <form
            action={shop.search.action}
            method="get"
            role="search"
            className="relative min-w-0 flex-1"
          >
            <label htmlFor="menu-shop-search" className="sr-only">
              {shop.labels.search}
            </label>
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted" />
            <input
              id="menu-shop-search"
              type="search"
              name={shop.search.name}
              placeholder={shop.labels.placeholder}
              className="h-11 w-full rounded-md bg-surface pl-11 pr-4 text-small text-ink ring-1 ring-line placeholder:text-muted focus:ring-2 focus:ring-accent"
            />
          </form>
          <Link
            href={shop.all.href}
            className="inline-flex shrink-0 items-center gap-1.5 text-small font-semibold text-accent no-underline hover:underline"
          >
            {shop.all.label}
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-x-6 gap-y-6">
          <div className="grid content-start gap-5">
            {short.map((c) => (
              <CategoryBlock key={c.href} category={c} />
            ))}
          </div>
          <div className="grid content-start gap-5">
            {long && <CategoryBlock category={long} />}
          </div>
          <div className="grid content-start gap-2">
            <p className={cx(heading, 'px-3 pb-1')}>{shop.labels.crops}</p>
            <ul className="flex flex-wrap gap-1.5 px-1">
              {shop.crops.map((c) => (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    className="inline-flex rounded-full bg-surface px-3 py-1 text-small font-medium text-ink no-underline ring-1 ring-line transition-colors duration-150 hover:bg-accent-soft hover:text-accent hover:ring-accent"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid content-start gap-1">
            <p className={cx(heading, 'px-3 pb-1')}>{shop.labels.brands}</p>
            <ul className="grid gap-0.5">
              {shop.brands.map((b) => (
                <li key={b.href}>
                  <Link href={b.href} className={lineLink}>
                    <span className="text-ink">{b.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="col-span-3 grid content-start gap-4">
        {item.promo && <Promo promo={item.promo} />}
      </div>
    </>
  )
}

/** Wraps a panel's content in the card. */
export function PanelFrame({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-8 rounded-xl bg-raised p-8 text-ink shadow-floating ring-1 ring-line">
      {children}
    </div>
  )
}
