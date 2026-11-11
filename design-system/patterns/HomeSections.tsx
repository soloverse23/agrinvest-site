import Link from 'next/link'
import type { ReactNode } from 'react'

import { CategoryGlyph } from '../icons/categories'
import { ArrowRightIcon, CoinsIcon, DropIcon, type IconProps } from '../icons/icons'
import type { CategoryIcon } from '../icons/keys'
import { CalculatorIcon, FuelIcon } from '../icons/server'
import { cx } from '../lib/cx'
import { Button } from '../primitives/Button'
import { Photo } from './Photo'
import { Kicker, SectionHeading, sectionIcons, type SectionIcon } from './Sections'

/**
 * The home page's sections below the live panel (Phase 7b): the shop showcase, financing and
 * tools in one row, and the company section. Server components only; every link is in the
 * HTML. Copy comes from `src/i18n/home.ts`, facts arrive already rendered (`<FactText>`).
 */

const wrap = 'mx-auto w-full max-w-page px-4 md:px-8'

const arrowLink =
  'group inline-flex items-center gap-1.5 text-small font-semibold text-accent no-underline hover:underline'

function Arrow() {
  return (
    <ArrowRightIcon className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
  )
}

/* ------------------------------------------------------------------------------------------ */

export type ShowcaseCategory = {
  href: string
  title: string
  /** "17 produse" */
  count: string
  icon: CategoryIcon
  /** Up to three product photos from the category (packshots on white). */
  images: { src: string; alt: string }[]
  /** Two or three subcategories. */
  links: { href: string; label: string }[]
}

export type ShopShowcaseProps = {
  id?: string
  kicker: string
  title: string
  categories: ShowcaseCategory[]
  crops: { label: string; items: { href: string; label: string }[] }
  /** Product cards (`ProductCard`), rendered by the caller so prices keep their markers. */
  products: { label: string; cards: ReactNode[] }
  all: { href: string; label: string }
  className?: string
}

/** Where each packshot sits in a tile's photo well: back left, back right, front centre. */
const packSpots = [
  'left-[8%] top-[14%] w-[38%] -rotate-6',
  'right-[8%] top-[10%] w-[38%] rotate-6',
  'left-1/2 bottom-[6%] w-[44%] -translate-x-1/2',
]

function CategoryTile({ c }: { c: ShowcaseCategory }) {
  return (
    <li className="group relative flex flex-col overflow-hidden rounded-xl bg-raised shadow-soft ring-1 ring-line transition duration-200 ease-move hover:shadow-raised hover:ring-line-strong">
      <div
        className="relative aspect-2/1 overflow-hidden bg-surface md:aspect-16/10"
        aria-hidden="true"
      >
        {c.images.length ? (
          c.images.slice(0, 3).map((img, i) => (
            <div
              key={img.src}
              className={cx(
                'absolute aspect-square rounded-lg bg-raised p-2 shadow-raised ring-1 ring-line transition-transform duration-300 ease-move',
                packSpots[c.images.length === 1 ? 2 : i],
                i === 2 && 'group-hover:-translate-y-1',
              )}
            >
              <Photo
                src={img.src}
                alt=""
                fill
                sizes="160px"
                className="object-contain p-2 mix-blend-multiply"
              />
            </div>
          ))
        ) : (
          <CategoryGlyph
            icon={c.icon}
            className="absolute inset-0 m-auto size-16 text-line-strong"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-h3 font-semibold">
            <Link href={c.href} className="no-underline after:absolute after:inset-0">
              {c.title}
            </Link>
          </h3>
          <span className="mt-1.5 shrink-0 rounded-full bg-accent-soft px-2.5 py-0.5 text-caption font-semibold text-accent tabular-nums">
            {c.count}
          </span>
        </div>
        {c.links.length > 0 && (
          <ul className="relative z-10 mt-auto flex flex-wrap gap-x-4 gap-y-1.5">
            {c.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={arrowLink}>
                  {l.label}
                  <Arrow />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

/**
 * The shop on the home page: three large category tiles, crop chips, then six products in a
 * row that scrolls sideways and snaps (no script; it is a plain overflow list).
 */
export function ShopShowcase({
  id = 'magazin',
  kicker,
  title,
  categories,
  crops,
  products,
  all,
  className,
}: ShopShowcaseProps) {
  return (
    <section aria-labelledby={id} className={cx(wrap, 'grid gap-8 md:gap-10', className)}>
      <SectionHeading id={id} kicker={kicker} title={title} action={all} />

      <ul className="grid gap-5 md:grid-cols-3">
        {categories.map((c) => (
          <CategoryTile key={c.href} c={c} />
        ))}
      </ul>

      {crops.items.length > 0 && (
        <nav aria-label={crops.label} className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-small font-semibold text-muted">{crops.label}</span>
          {crops.items.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-full bg-raised px-3.5 py-1.5 text-small font-medium text-ink no-underline ring-1 ring-line transition-colors duration-150 ring-inset hover:bg-accent-soft hover:text-accent hover:ring-accent"
            >
              {c.label}
            </Link>
          ))}
        </nav>
      )}

      {products.cards.length > 0 && (
        <div className="grid gap-4">
          <h3 className="text-h4 font-semibold">{products.label}</h3>
          <ul
            data-scroll-x
            className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pb-4 md:-mx-8 md:scroll-px-8 md:px-8"
          >
            {products.cards.map((card, i) => (
              <li key={i} className="flex w-4/5 shrink-0 snap-start sm:w-2/5 lg:w-[30%]">
                {card}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------------------------------ */

export type ToolKey = 'netPrice' | 'simulator' | 'fertilisers' | 'diesel'

const toolIcons: Record<ToolKey, (props: IconProps) => ReactNode> = {
  netPrice: CalculatorIcon,
  simulator: CoinsIcon,
  fertilisers: DropIcon,
  diesel: FuelIcon,
}

export type FinanceToolsRowProps = {
  finance: {
    kicker: string
    title: string
    /** Shown after the title, e.g. the "to confirm" marker of register F5. */
    note?: ReactNode
    instalments: readonly { when: string; label: string }[]
    cta: { href: string; label: string }
  }
  tools: {
    title: string
    items: { key: ToolKey; href: string; label: string }[]
    all: { href: string; label: string }
  }
  className?: string
}

/**
 * Financing (7/12) and the farm tools (5/12) side by side. The finance box shows the shape
 * of the credit instead of describing it: two instalments, after the two harvests.
 */
export function FinanceToolsRow({ finance, tools, className }: FinanceToolsRowProps) {
  return (
    <div className={cx(wrap, 'grid gap-5 lg:grid-cols-12', className)}>
      <section
        aria-labelledby="finantare"
        className="relative grid gap-8 overflow-hidden rounded-xl bg-forest p-6 text-on-forest md:p-10 lg:col-span-7"
      >
        <div className="grid gap-4">
          <Kicker tone="forest">{finance.kicker}</Kicker>
          <h2 id="finantare" className="text-display font-semibold text-balance">
            {finance.title}
            {finance.note}
          </h2>
        </div>
        <ol className="relative grid grid-cols-2 gap-4">
          <span
            className="absolute top-5 right-[25%] left-[25%] border-t-2 border-dashed border-lime/50"
            aria-hidden="true"
          />
          {finance.instalments.map((step, i) => (
            <li key={step.when} className="relative grid justify-items-center gap-3 text-center">
              <span
                className="inline-flex size-10 items-center justify-center rounded-full bg-lime text-h4 font-semibold text-forest tabular-nums ring-4 ring-forest"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <span className="grid gap-0.5">
                <span className="text-h3 font-semibold">{step.when}</span>
                <span className="text-small text-on-forest-muted">{step.label}</span>
              </span>
            </li>
          ))}
        </ol>
        <Button href={finance.cta.href} variant="lime" icon={<ArrowRightIcon />} className="w-fit">
          {finance.cta.label}
        </Button>
      </section>

      <section
        aria-labelledby="unelte"
        className="grid content-start gap-6 rounded-xl bg-surface p-6 md:p-10 lg:col-span-5"
      >
        <h2 id="unelte" className="text-h2 font-semibold">
          {tools.title}
        </h2>
        <ul className="grid grid-cols-2 gap-3">
          {tools.items.map((t) => {
            const Icon = toolIcons[t.key]
            return (
              <li key={t.key}>
                <Link
                  href={t.href}
                  className="group flex h-full flex-col gap-3 rounded-lg bg-raised p-4 text-ink no-underline shadow-soft ring-1 ring-line transition duration-150 ease-move hover:-translate-y-0.5 hover:shadow-raised hover:ring-accent"
                >
                  <span
                    className="inline-flex size-11 items-center justify-center rounded-lg bg-lime-soft text-forest transition-colors duration-150 group-hover:bg-lime"
                    aria-hidden="true"
                  >
                    <Icon className="size-6" />
                  </span>
                  <span className="flex items-end justify-between gap-2 text-small leading-snug font-semibold">
                    {t.label}
                    <ArrowRightIcon className="size-4 shrink-0 text-accent transition-transform duration-150 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        <Link href={tools.all.href} className={arrowLink}>
          {tools.all.label}
          <Arrow />
        </Link>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------ */

export type CompanySectionProps = {
  id?: string
  kicker: string
  title: string
  /** Register values, already rendered with their markers. */
  figures: { key: string; value: ReactNode; label: string }[]
  tiles: { href: string; title: string; line: ReactNode; icon: SectionIcon }[]
  className?: string
}

/** Agrinvest in one section: a headline, four register figures and four ways in. */
export function CompanySection({
  id = 'agrinvest',
  kicker,
  title,
  figures,
  tiles,
  className,
}: CompanySectionProps) {
  return (
    <section aria-labelledby={id} className={cx(wrap, 'grid gap-10 md:gap-12', className)}>
      <div className="grid max-w-3xl gap-3">
        <Kicker>{kicker}</Kicker>
        <h2 id={id} className="text-h1 font-semibold text-balance">
          {title}
        </h2>
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
        {figures.map((f) => (
          <div key={f.key} className="grid gap-1">
            <dt className="order-2 text-small text-muted">{f.label}</dt>
            <dd className="order-1 text-h2 font-semibold whitespace-nowrap">{f.value}</dd>
          </div>
        ))}
      </dl>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => {
          const Icon = sectionIcons[t.icon]
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className="group flex h-full items-start gap-4 rounded-lg bg-raised p-4 text-ink no-underline shadow-soft ring-1 ring-line transition duration-150 ease-move hover:-translate-y-0.5 hover:shadow-raised hover:ring-accent sm:flex-col sm:p-5"
              >
                <span
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent"
                  aria-hidden="true"
                >
                  <Icon className="size-6" />
                </span>
                <span className="grid flex-1 gap-1">
                  <span className="flex items-center justify-between gap-2 text-h4 font-semibold">
                    {t.title}
                    <ArrowRightIcon className="size-4 shrink-0 text-accent transition-transform duration-150 group-hover:translate-x-0.5" />
                  </span>
                  <span className="text-small text-muted">{t.line}</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
