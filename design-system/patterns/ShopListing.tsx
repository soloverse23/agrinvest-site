import Link from 'next/link'
import type { ReactNode } from 'react'

import { formatQuantity } from '@/lib/format'

import { CategoryGlyph } from '../icons/categories'
import { CheckIcon, ChevronDownIcon, LeafIcon } from '../icons/icons'
import { CloseIcon, FilterIcon, GridIcon, ListIcon } from '../icons/server'
import { cx } from '../lib/cx'
import { Photo } from './Photo'
import type { ProductCardProps } from './ProductCard'

/**
 * Shop listings (Phase 7c.3): category, crop, brand, active-ingredient and search pages share
 * one template. Everything here renders on the server. Filters, sort, view and pages are plain
 * links, so a listing works without JavaScript; the phone filter drawer is a `<details>`.
 * Filter, sort, view and page URLs stay out of the index, so their links are `nofollow`.
 */

const wrap = 'mx-auto w-full max-w-page px-4 md:px-8'
const summaryReset = 'cursor-pointer list-none [&::-webkit-details-marker]:hidden'

/* ------------------------------------------------------------------------------------------ */

export type ListingChip = { href: string; label: string; count: number; active?: boolean }
export type ListingTile = { href: string; label: string; count: string; icon?: string | null }

/**
 * The listing's header: breadcrumbs, the page's only H1, the intro (its first sentences, the
 * rest behind "mai mult", still in the HTML) and either subcategory tiles (a top category) or
 * sibling chips (a subcategory).
 */
export function ListingHeader({
  breadcrumbs,
  title,
  intro,
  updated,
  labels,
  tiles,
  chips,
  chipsLabel,
  search,
}: {
  breadcrumbs: ReactNode
  title: ReactNode
  /** `lead` shows at once; `rest` folds behind "mai mult". */
  intro?: { lead: string; rest?: string }
  updated?: ReactNode
  labels: { more: string; less: string }
  tiles?: ListingTile[]
  chips?: ListingChip[]
  chipsLabel?: string
  /** The search page's form, under the title. */
  search?: ReactNode
}) {
  return (
    <header className="border-b border-line bg-surface">
      <div className={cx(wrap, 'grid gap-5 pt-6 pb-8 md:pt-8 md:pb-10')}>
        {breadcrumbs}
        <div className="grid gap-3 pt-2 md:pt-4">
          <h1 className="text-h1 font-semibold text-balance">{title}</h1>
          {intro && (
            <div className="max-w-3xl text-body text-muted md:text-lead">
              <p className="inline">{intro.lead}</p>
              {intro.rest && (
                <details className="group inline">
                  <summary
                    className={cx(
                      summaryReset,
                      'ml-1 inline text-small font-medium text-accent hover:underline group-open:hidden',
                    )}
                  >
                    {labels.more}
                  </summary>
                  <span> {intro.rest}</span>
                </details>
              )}
            </div>
          )}
          {search}
          {updated}
        </div>

        {tiles && tiles.length > 0 && (
          <ul
            aria-label={chipsLabel}
            className="grid grid-cols-2 gap-2 pt-1 md:grid-cols-3 md:gap-3 xl:grid-cols-6"
          >
            {tiles.map((tile) => (
              <li key={tile.href}>
                <Link
                  href={tile.href}
                  className="group flex h-full items-center gap-3 rounded-lg bg-raised p-3 no-underline shadow-soft ring-1 ring-line transition duration-200 ease-move hover:shadow-raised hover:ring-accent"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-forest md:size-11">
                    <CategoryGlyph icon={tile.icon} className="size-5 md:size-6" />
                  </span>
                  <span className="grid min-w-0">
                    <span className="line-clamp-2 text-small leading-snug font-semibold text-ink md:text-body">
                      {tile.label}
                    </span>
                    <span className="text-caption text-muted">{tile.count}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {chips && chips.length > 0 && (
          <ul
            aria-label={chipsLabel}
            data-scroll-x
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
          >
            {chips.map((chip) => (
              <li key={chip.href} className="shrink-0">
                <Link
                  href={chip.href}
                  aria-current={chip.active ? 'page' : undefined}
                  className={cx(
                    'inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-small font-medium no-underline ring-1 transition-colors',
                    chip.active
                      ? 'bg-forest text-on-forest ring-forest'
                      : 'bg-raised text-ink ring-line hover:ring-accent',
                  )}
                >
                  {chip.label}
                  <span
                    className={cx(
                      'text-caption tabular-nums',
                      chip.active ? 'text-on-forest-muted' : 'text-subtle',
                    )}
                  >
                    {chip.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------------------------------ */

/**
 * Filters on the left from `lg`, results on the right. `aside` is the desktop facet panel;
 * the toolbar carries the phone drawer.
 */
export function ListingLayout({ aside, children }: { aside?: ReactNode; children: ReactNode }) {
  return (
    <div className={cx(wrap, 'mt-6 grid gap-8 md:mt-8 lg:grid-cols-12')}>
      {aside && <aside className="hidden lg:col-span-3 lg:block">{aside}</aside>}
      <div
        id="rezultate"
        className={cx(
          'grid min-w-0 content-start gap-5',
          aside ? 'lg:col-span-9' : 'lg:col-span-12',
        )}
      >
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------ */

export type SortOption = { href: string; label: string; active: boolean }
export type ActiveFilter = { href: string; label: string; group: string }

/**
 * Results count, sort, view toggle and the active filters. The count is a live region, so a
 * screen reader hears it after a filter link reloads the page.
 */
export function ListingToolbar({
  count,
  sort,
  view,
  active,
  clear,
  drawer,
  labels,
}: {
  count: string
  sort: SortOption[]
  view?: { grid: string; list: string; current: 'grid' | 'list' }
  active: ActiveFilter[]
  clear?: { href: string; label: string }
  /** The phone filter drawer (FilterDrawer), shown below `lg`. */
  drawer?: ReactNode
  labels: {
    sort: string
    view: string
    grid: string
    list: string
    active: string
    remove: (label: string) => string
  }
}) {
  const current = sort.find((s) => s.active) ?? sort[0]
  return (
    <div className="grid gap-3 border-b border-line pb-4">
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <p role="status" className="w-full text-small font-medium text-ink md:mr-auto md:w-auto">
          {count}
        </p>
        {drawer}
        {sort.length > 1 && (
          <details className="group relative flex-1 md:flex-none">
            <summary
              className={cx(
                summaryReset,
                'flex min-h-11 items-center justify-between gap-2 rounded-md bg-raised px-3 text-small ring-1 ring-line hover:ring-line-strong md:min-h-10',
              )}
            >
              <span className="truncate">
                <span className="hidden text-muted md:inline">{labels.sort}: </span>
                <span className="font-medium">{current?.label}</span>
              </span>
              <ChevronDownIcon
                className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <ul className="absolute right-0 z-30 mt-2 grid min-w-56 gap-0.5 rounded-lg bg-raised p-1.5 shadow-floating ring-1 ring-line">
              {sort.map((option) => (
                <li key={option.label}>
                  <Link
                    href={option.href}
                    rel="nofollow"
                    aria-current={option.active ? 'true' : undefined}
                    className={cx(
                      'flex min-h-10 items-center justify-between gap-3 rounded-sm px-3 text-small no-underline hover:bg-surface',
                      option.active ? 'font-semibold text-ink' : 'text-ink',
                    )}
                  >
                    {option.label}
                    {option.active && (
                      <CheckIcon className="size-4 text-accent" aria-hidden="true" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        )}
        {view && (
          <div
            role="group"
            aria-label={labels.view}
            className="inline-flex rounded-md bg-raised p-0.5 ring-1 ring-line"
          >
            {(['grid', 'list'] as const).map((mode) => {
              const Icon = mode === 'grid' ? GridIcon : ListIcon
              const on = view.current === mode
              return (
                <Link
                  key={mode}
                  href={view[mode]}
                  rel="nofollow"
                  aria-current={on ? 'true' : undefined}
                  title={labels[mode]}
                  className={cx(
                    'grid size-10 place-items-center rounded-sm no-underline md:size-9',
                    on ? 'bg-accent-soft text-forest' : 'text-muted hover:text-ink',
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  <span className="sr-only">{labels[mode]}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="sr-only">{labels.active}:</span>
          <ul className="contents">
            {active.map((filter) => (
              <li key={`${filter.group}:${filter.label}`}>
                <Link
                  href={filter.href}
                  rel="nofollow"
                  aria-label={labels.remove(`${filter.group}: ${filter.label}`)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-accent-soft py-1 pr-1.5 pl-3 text-small text-ink no-underline hover:ring-1 hover:ring-accent"
                >
                  <span className="text-muted">{filter.group}:</span>
                  <span className="font-medium">{filter.label}</span>
                  <span className="grid size-6 place-items-center rounded-full bg-raised text-muted">
                    <CloseIcon className="size-3.5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {clear && (
            <Link
              href={clear.href}
              rel="nofollow"
              className="ml-1 text-small font-medium text-accent no-underline hover:underline"
            >
              {clear.label}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------------------------------ */

export type FacetOption = { label: string; href: string; count: number; active: boolean }
export type FacetGroupV2 = {
  key: string
  label: string
  /** `toggle` for a yes/no filter (in stock); `radio` for one value of many. */
  kind?: 'radio' | 'toggle'
  options: FacetOption[]
}

const FOLD = 6

function FacetLink({ option, kind }: { option: FacetOption; kind: 'radio' | 'toggle' }) {
  return (
    <Link
      href={option.href}
      rel="nofollow"
      aria-current={option.active ? 'true' : undefined}
      className={cx(
        'flex min-h-10 items-center gap-2.5 rounded-sm px-2 text-small text-ink no-underline hover:bg-surface lg:min-h-9',
        option.active && 'font-semibold',
      )}
    >
      {kind === 'toggle' ? (
        <span
          aria-hidden="true"
          className={cx(
            'relative h-5 w-9 shrink-0 rounded-full transition-colors',
            option.active ? 'bg-accent' : 'bg-line-strong',
          )}
        >
          <span
            className={cx(
              'absolute top-0.5 size-4 rounded-full bg-raised shadow-soft transition-transform',
              option.active ? 'left-4.5' : 'left-0.5',
            )}
          />
        </span>
      ) : (
        <span
          aria-hidden="true"
          className={cx(
            'grid size-4 shrink-0 place-items-center rounded-full ring-1',
            option.active ? 'ring-accent' : 'ring-line-strong',
          )}
        >
          {option.active && <span className="size-2 rounded-full bg-accent" />}
        </span>
      )}
      <span className="min-w-0 flex-1">{option.label}</span>
      <span className="text-caption text-subtle tabular-nums">{option.count}</span>
    </Link>
  )
}

/**
 * Grouped, collapsible filters with counts. Each group folds after six options behind
 * "arată toate"; a group whose active option is folded opens on its own.
 */
export function FacetGroups({
  groups,
  labels,
}: {
  groups: FacetGroupV2[]
  labels: { showAll: (n: number) => string; less: string }
}) {
  const visible = groups.filter((g) => g.options.length)
  return (
    <div className="grid">
      {visible.map((group) => {
        const kind = group.kind ?? 'radio'
        const shown = group.options.slice(0, FOLD)
        const rest = group.options.slice(FOLD)
        const activeCount = group.options.filter((o) => o.active).length
        return (
          <details
            key={group.key}
            open
            className="group/facet border-b border-line py-3 first:pt-0 last:border-b-0 last:pb-0"
          >
            <summary
              className={cx(summaryReset, 'flex min-h-10 items-center justify-between gap-3')}
            >
              <h2 className="flex items-center gap-2 text-small font-semibold text-ink">
                {group.label}
                {activeCount > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-accent text-caption text-on-accent">
                    {activeCount}
                  </span>
                )}
              </h2>
              <ChevronDownIcon
                className="size-4 text-muted transition-transform group-open/facet:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <ul className="mt-1 grid gap-0.5">
              {shown.map((option) => (
                <li key={option.label}>
                  <FacetLink option={option} kind={kind} />
                </li>
              ))}
            </ul>
            {rest.length > 0 && (
              <details className="group/more" open={rest.some((o) => o.active) || undefined}>
                <summary
                  className={cx(
                    summaryReset,
                    'mt-1 inline-flex min-h-9 items-center gap-1 px-2 text-small font-medium text-accent hover:underline',
                  )}
                >
                  <span className="group-open/more:hidden">
                    {labels.showAll(group.options.length)}
                  </span>
                  <span className="hidden group-open/more:inline">{labels.less}</span>
                  <ChevronDownIcon
                    className="size-4 transition-transform group-open/more:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <ul className="grid gap-0.5">
                  {rest.map((option) => (
                    <li key={option.label}>
                      <FacetLink option={option} kind={kind} />
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </details>
        )
      })}
    </div>
  )
}

/** The desktop facet panel: a card with the title, "Șterge filtrele" and the groups. */
export function FacetCard({
  title,
  clear,
  children,
}: {
  title: string
  clear?: { href: string; label: string }
  children: ReactNode
}) {
  return (
    <section
      aria-label={title}
      className="grid gap-4 rounded-lg bg-raised p-5 shadow-soft ring-1 ring-line"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="flex items-center gap-2 font-semibold">
          <FilterIcon className="size-5 text-muted" aria-hidden="true" />
          {title}
        </p>
        {clear && (
          <Link
            href={clear.href}
            rel="nofollow"
            className="text-small font-medium text-accent no-underline hover:underline"
          >
            {clear.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

/**
 * Phone filters: a "Filtre (n)" button that opens a full-height panel. It is a `<details>`,
 * so it works without JavaScript. Open, its summary becomes the bottom "Vezi 23 de produse"
 * bar that closes it. Below `lg` only; the desktop panel is FacetCard.
 */
export function FilterDrawer({
  title,
  button,
  results,
  clear,
  open,
  children,
}: {
  title: string
  /** "Filtre (2)". */
  button: string
  /** "Vezi 23 de produse". */
  results: string
  clear?: { href: string; label: string }
  /** Stories only: show the drawer open. */
  open?: boolean
  children: ReactNode
}) {
  return (
    <details data-filter-drawer open={open} className="group/drawer flex-1 md:flex-none lg:hidden">
      <summary
        className={cx(
          summaryReset,
          'flex min-h-11 items-center justify-center gap-2 rounded-md bg-forest px-4 text-small font-semibold text-on-forest hover:bg-forest-raised md:min-h-10',
          'group-open/drawer:fixed group-open/drawer:inset-x-4 group-open/drawer:bottom-4 group-open/drawer:z-50 group-open/drawer:min-h-12 group-open/drawer:shadow-floating',
        )}
      >
        <span className="flex items-center gap-2 group-open/drawer:hidden">
          <FilterIcon className="size-5" aria-hidden="true" />
          {button}
        </span>
        <span className="hidden group-open/drawer:inline">{results}</span>
      </summary>
      <div role="region" aria-label={title} className="fixed inset-0 z-40 flex flex-col bg-paper">
        <div className="flex min-h-14 items-center justify-between gap-3 border-b border-line px-4">
          <p className="flex items-center gap-2 text-h4 font-semibold">
            <FilterIcon className="size-5 text-muted" aria-hidden="true" />
            {title}
          </p>
          {clear && (
            <Link
              href={clear.href}
              rel="nofollow"
              className="text-small font-medium text-accent no-underline hover:underline"
            >
              {clear.label}
            </Link>
          )}
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-24">{children}</div>
      </div>
    </details>
  )
}

/* ------------------------------------------------------------------------------------------ */

const stockTone = {
  'in-stock': 'bg-accent',
  'on-request': 'bg-warning',
  'out-of-stock': 'bg-line-strong',
} as const

export type ProductRowProps = ProductCardProps & {
  /** The label dose, e.g. "1–1,5 l/ha"; only from label data. */
  dose?: string
  crops?: string[]
  rowLabels: { dose: string; crops: string; moreCrops: (n: number) => string }
}

/**
 * The list view's row: a smaller packshot, the line, the dose and the crops a farmer compares,
 * the price and the same action as the card.
 */
export function ProductRow(p: ProductRowProps) {
  const { labels, locale } = p
  const stockLabel = {
    'in-stock': labels.inStock,
    'on-request': labels.onRequest,
    'out-of-stock': labels.outOfStock,
  }[p.stock]
  const crops = p.crops ?? []
  return (
    <article
      className={cx(
        'group relative flex flex-wrap gap-x-4 gap-y-3 rounded-lg bg-raised p-3 shadow-soft ring-1 ring-line transition duration-200 ease-move hover:shadow-raised hover:ring-line-strong md:flex-nowrap md:gap-6 md:p-4',
        p.className,
      )}
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-surface md:size-32">
        {p.image ? (
          <Photo
            src={p.image}
            alt=""
            fill
            sizes="128px"
            className="object-contain p-2 mix-blend-multiply md:p-3"
          />
        ) : (
          <LeafIcon
            className="absolute inset-0 m-auto size-10 text-line-strong"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="grid min-w-0 flex-1 content-start gap-1.5">
        {p.brand && (
          <p className="text-caption font-medium tracking-wide text-subtle uppercase">{p.brand}</p>
        )}
        <h3 className="text-body leading-snug font-semibold md:text-h4">
          <Link href={p.href} className="no-underline after:absolute after:inset-0">
            {p.name}
          </Link>
        </h3>
        {p.line && <p className="line-clamp-2 text-caption text-muted md:text-small">{p.line}</p>}
        <dl className="mt-1 hidden gap-x-6 gap-y-1 text-small md:flex md:flex-wrap">
          {p.dose && (
            <div className="flex gap-1.5">
              <dt className="text-muted">{p.rowLabels.dose}:</dt>
              <dd className="font-semibold text-forest tabular-nums">{p.dose}</dd>
            </div>
          )}
          {crops.length > 0 && (
            <div className="flex gap-1.5">
              <dt className="text-muted">{p.rowLabels.crops}:</dt>
              <dd>
                {crops.slice(0, 4).join(', ')}
                {crops.length > 4 && (
                  <span className="text-muted"> {p.rowLabels.moreCrops(crops.length - 4)}</span>
                )}
              </dd>
            </div>
          )}
          {p.pack && (
            <div className="flex gap-1.5">
              <dd className="text-subtle tabular-nums">{p.pack}</dd>
            </div>
          )}
        </dl>
        {/* Phones: the dose only, it is what the row is for. */}
        {p.dose && (
          <p className="text-caption md:hidden">
            <span className="text-muted">{p.rowLabels.dose}: </span>
            <span className="font-semibold text-forest tabular-nums">{p.dose}</span>
          </p>
        )}
      </div>

      <div className="flex w-full items-end justify-between gap-3 border-t border-line pt-3 md:grid md:w-52 md:shrink-0 md:content-start md:justify-stretch md:gap-2 md:border-0 md:pt-0">
        <div className="grid gap-0.5">
          <span className="flex items-center gap-1.5 text-caption text-muted">
            <span className={cx('size-2 rounded-full', stockTone[p.stock])} aria-hidden="true" />
            {stockLabel}
          </span>
          <div className="flex flex-wrap items-baseline gap-x-1.5">
            {p.price != null ? (
              <>
                {p.fromPrice && <span className="text-caption text-muted">{labels.from}</span>}
                <span className="text-h4 font-semibold tabular-nums md:text-h3">
                  {formatQuantity(p.price, 'lei', locale)}
                </span>
                {p.priceNote}
              </>
            ) : (
              <span className="text-small font-semibold">{labels.askPrice}</span>
            )}
          </div>
          {p.unitPrice && (
            <span className="text-caption text-muted tabular-nums">{p.unitPrice}</span>
          )}
        </div>
        <div className="relative z-10 grid w-40 gap-2 md:w-full">
          {p.action}
          {p.extra}
        </div>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------------------------------ */

/**
 * Page links at 24 products a page. Page 2 onwards is noindex with the first page as its
 * canonical (the facet rules); the links carry `rel` prev and next.
 */
export function Pagination({
  page,
  pages,
  href,
  labels,
}: {
  page: number
  pages: number
  href: (page: number) => string
  labels: { nav: string; prev: string; next: string; page: (n: number, of: number) => string }
}) {
  if (pages < 2) return null
  const numbers = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1,
  )
  const step =
    'inline-flex min-h-11 items-center gap-1.5 rounded-md px-4 text-small font-medium no-underline'
  return (
    <nav
      aria-label={labels.nav}
      className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-6"
    >
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          rel="prev"
          className={cx(step, 'bg-raised text-ink ring-1 ring-line hover:ring-accent')}
        >
          <ChevronDownIcon className="size-4 rotate-90" aria-hidden="true" />
          {labels.prev}
        </Link>
      ) : (
        <span className={cx(step, 'text-subtle')} aria-hidden="true">
          <ChevronDownIcon className="size-4 rotate-90" />
          {labels.prev}
        </span>
      )}
      <ol className="hidden items-center gap-1 md:flex">
        {numbers.map((n, i) => (
          <li key={n} className="flex items-center gap-1">
            {i > 0 && n - numbers[i - 1] > 1 && <span className="px-1 text-subtle">…</span>}
            <Link
              href={href(n)}
              aria-current={n === page ? 'page' : undefined}
              aria-label={labels.page(n, pages)}
              className={cx(
                'grid size-11 place-items-center rounded-md text-small font-semibold no-underline tabular-nums',
                n === page ? 'bg-forest text-on-forest' : 'text-ink hover:bg-surface',
              )}
            >
              {n}
            </Link>
          </li>
        ))}
      </ol>
      <p className="text-small text-muted md:hidden">{labels.page(page, pages)}</p>
      {page < pages ? (
        <Link
          href={href(page + 1)}
          rel="next"
          className={cx(step, 'bg-raised text-ink ring-1 ring-line hover:ring-accent')}
        >
          {labels.next}
          <ChevronDownIcon className="size-4 -rotate-90" aria-hidden="true" />
        </Link>
      ) : (
        <span className={cx(step, 'text-subtle')} aria-hidden="true">
          {labels.next}
          <ChevronDownIcon className="size-4 -rotate-90" />
        </span>
      )}
    </nav>
  )
}

/** No product matches: the quick request ("Nu găsești? Lasă telefonul") and a way back. */
export function ListingEmpty({
  title,
  text,
  request,
  clear,
}: {
  title: string
  text: string
  /** The inline QuickRequest. */
  request: ReactNode
  clear?: { href: string; label: string }
}) {
  return (
    <section className="grid gap-4 rounded-xl bg-raised p-6 shadow-soft ring-1 ring-line md:grid-cols-12 md:gap-8 md:p-8">
      <div className="grid content-start gap-2 md:col-span-5">
        <h2 className="text-h3 font-semibold">{title}</h2>
        <p className="text-muted">{text}</p>
        {clear && (
          <Link
            href={clear.href}
            rel="nofollow"
            className="text-small font-medium text-accent no-underline hover:underline"
          >
            {clear.label}
          </Link>
        )}
      </div>
      <div className="md:col-span-7 md:self-center">{request}</div>
    </section>
  )
}
