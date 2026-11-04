import Link from 'next/link'
import type { ReactNode } from 'react'

import { ChevronDownIcon, DocumentIcon, LeafIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { Badge } from '../primitives/Badge'
import { Photo } from './Photo'

/** One filter of a listing. Options are plain links, so filters work without JavaScript. */
export type FacetGroup = {
  key: string
  label: string
  options: { label: string; href: string; count: number; active: boolean }[]
}

/**
 * Filters of a shop listing, rendered on the server. Filter URLs stay out of the index, so
 * their links are `nofollow`. On phones the panel folds into one disclosure.
 */
export function FacetPanel({
  title,
  groups,
  clear,
}: {
  title: string
  groups: FacetGroup[]
  clear?: { href: string; label: string }
}) {
  const visible = groups.filter((g) => g.options.length)
  if (!visible.length) return null
  return (
    <details
      open
      className="group rounded-lg bg-raised p-5 shadow-soft ring-1 ring-line [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer items-center justify-between gap-3 font-semibold">
        {title}
        <ChevronDownIcon
          className="size-5 text-muted transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="mt-4 grid gap-6">
        {clear && (
          <Link
            href={clear.href}
            rel="nofollow"
            className="text-small font-medium text-accent no-underline hover:underline"
          >
            {clear.label}
          </Link>
        )}
        {visible.map((group) => (
          <section key={group.key} aria-label={group.label} className="grid gap-2">
            <h2 className="text-caption font-medium text-muted">{group.label}</h2>
            <ul className="grid gap-1">
              {group.options.map((option) => (
                <li key={option.href}>
                  <Link
                    href={option.href}
                    rel="nofollow"
                    aria-current={option.active ? 'true' : undefined}
                    className={cx(
                      'flex min-h-9 items-center justify-between gap-3 rounded-sm px-2 text-small no-underline hover:bg-surface',
                      option.active ? 'bg-accent-soft font-semibold text-ink' : 'text-ink',
                    )}
                  >
                    <span>{option.label}</span>
                    <span className="text-caption text-muted tabular-nums">{option.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </details>
  )
}

/** Product photos: the first large, the others beside it. The page works without any. */
export function ProductGallery({ images }: { images: { url: string; alt: string }[] }) {
  const [first, ...rest] = images
  return (
    <div className="grid gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-surface ring-1 ring-line">
        {first ? (
          <Photo
            src={first.url}
            alt={first.alt}
            fill
            priority
            sizes="(min-width: 1024px) 480px, 90vw"
            className="object-contain p-8 mix-blend-multiply"
          />
        ) : (
          <LeafIcon
            className="absolute inset-0 m-auto size-24 text-line-strong"
            aria-hidden="true"
          />
        )}
      </div>
      {rest.length > 0 && (
        <ul className="grid grid-cols-4 gap-3">
          {rest.map((image) => (
            <li
              key={image.url}
              className="relative aspect-square overflow-hidden rounded-md bg-surface ring-1 ring-line"
            >
              <Photo
                src={image.url}
                alt={image.alt}
                fill
                sizes="120px"
                className="object-contain p-2 mix-blend-multiply"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export type PackRow = {
  key: string
  pack: string
  price: ReactNode
  unitPrice?: string
  stock: { label: string; available: boolean }
  action?: ReactNode
}

/**
 * Every pack size with its price and stock, side by side. Shown as a table instead of a
 * selector: all prices are in the HTML and comparing packs needs no JavaScript.
 */
export function PackTable({
  caption,
  labels,
  rows,
}: {
  caption: string
  labels: { pack: string; price: string; unitPrice: string; stock: string }
  rows: PackRow[]
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-raised shadow-soft ring-1 ring-line">
      <table className="w-full text-left text-small">
        <caption className="sr-only">{caption}</caption>
        <thead className="hidden bg-surface text-caption text-muted md:table-header-group">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.pack}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.price}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.unitPrice}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.stock}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.key} className="grid gap-1 px-4 py-4 md:table-row md:p-0">
              <th scope="row" className="font-semibold md:px-4 md:py-3">
                {row.pack}
              </th>
              <td className="text-h4 font-semibold tabular-nums md:px-4 md:py-3">{row.price}</td>
              <td className="text-caption text-muted tabular-nums md:px-4 md:py-3">
                {row.unitPrice}
              </td>
              <td className="md:px-4 md:py-3">
                <Badge tone={row.stock.available ? 'accent' : 'warning'} dot>
                  {row.stock.label}
                </Badge>
                {row.action}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Labelled technical facts of a product. Empty rows are left out by the caller. */
export function SpecSheet({
  rows,
  className,
}: {
  rows: { label: string; value: ReactNode }[]
  className?: string
}) {
  return (
    <dl
      className={cx(
        'divide-y divide-line overflow-hidden rounded-lg bg-raised text-small shadow-soft ring-1 ring-line',
        className,
      )}
    >
      {rows.map((row) => (
        <div key={row.label} className="grid gap-1 px-5 py-3 sm:grid-cols-3 sm:gap-4">
          <dt className="text-muted">{row.label}</dt>
          <dd className="font-medium sm:col-span-2">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export type DoseRow = {
  key: string
  crop: string
  target?: string | null
  timing?: string | null
  dose: string
  water?: string | null
  waiting?: string | null
}

/**
 * Doses as the label gives them. A table from 768 px; on phones each row stacks, with the
 * dose first, so nothing scrolls sideways.
 */
export function DoseTable({
  caption,
  labels,
  rows,
}: {
  caption: string
  labels: {
    crop: string
    target: string
    timing: string
    dose: string
    water: string
    waiting: string
  }
  rows: DoseRow[]
}) {
  const has = (key: keyof DoseRow) => rows.some((r) => r[key])
  const columns = (['target', 'timing', 'water', 'waiting'] as const).filter(has)
  return (
    <div className="overflow-hidden rounded-lg bg-raised shadow-soft ring-1 ring-line">
      <table className="w-full text-left text-small">
        <caption className="sr-only">{caption}</caption>
        <thead className="hidden bg-surface text-caption text-muted md:table-header-group">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.crop}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.dose}
            </th>
            {columns.map((c) => (
              <th key={c} scope="col" className="px-4 py-3 font-medium">
                {labels[c]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.key} className="grid gap-1 px-4 py-4 align-top md:table-row md:p-0">
              <th scope="row" className="font-semibold md:px-4 md:py-3">
                {row.crop}
              </th>
              <td className="font-semibold text-forest tabular-nums md:px-4 md:py-3">
                <span className="font-normal text-muted md:sr-only">{labels.dose}: </span>
                {row.dose}
              </td>
              {columns.map((c) => (
                <td
                  key={c}
                  className={cx(
                    'text-muted md:px-4 md:py-3',
                    c === 'waiting' && 'md:whitespace-nowrap',
                    !row[c] && 'hidden md:table-cell',
                  )}
                >
                  {row[c] && (
                    <>
                      <span className="md:sr-only">{labels[c]}: </span>
                      {row[c]}
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Technical sheets, safety data sheets and labels of a product. */
export function DocumentList({
  items,
}: {
  items: { href: string; title: string; kind: string; external?: boolean }[]
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.href}>
          <a
            href={item.href}
            {...(item.external ? { rel: 'noopener', target: '_blank' } : {})}
            className="flex items-center gap-3 rounded-lg bg-raised p-4 no-underline shadow-soft ring-1 ring-line hover:ring-accent"
          >
            <DocumentIcon className="size-6 shrink-0 text-accent" aria-hidden="true" />
            <span className="grid">
              <span className="font-semibold text-ink">{item.title}</span>
              <span className="text-caption text-muted">{item.kind}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

/** A link tile to a category, crop or brand, with how many products it holds. */
export function ShopTile({
  href,
  title,
  meta,
  icon,
}: {
  href: string
  title: string
  meta?: string
  icon?: ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex h-full items-center gap-3 rounded-lg bg-raised p-4 no-underline shadow-soft ring-1 ring-line hover:ring-accent"
    >
      {icon}
      <span className="grid">
        <span className="font-semibold text-ink">{title}</span>
        {meta && <span className="text-caption text-muted">{meta}</span>}
      </span>
    </Link>
  )
}
