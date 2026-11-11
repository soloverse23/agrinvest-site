import Link from 'next/link'
import type { ComponentType, ReactNode } from 'react'

import { CategoryGlyph } from '../icons/categories'
import type { CategoryIcon } from '../icons/keys'
import {
  ArrowRightIcon,
  BarleyIcon,
  ChevronDownIcon,
  CoinsIcon,
  DocumentIcon,
  HandshakeIcon,
  LeafIcon,
  MaizeIcon,
  PinIcon,
  RapeseedIcon,
  SunflowerIcon,
  WheatIcon,
  type IconProps,
} from '../icons/icons'
import { cx } from '../lib/cx'
import { Photo } from './Photo'
import { Kicker } from './Sections'

const wrap = 'mx-auto w-full max-w-page px-4 md:px-8'

/* ------------------------------------------------------------------------------------------ */

export type ShopHeroProps = {
  /** Home → Magazin, on the forest band. */
  crumbs: { label: string; items: { name: string; url: string }[] }
  kicker: string
  /** The page's H1, unchanged from Phase 3 ("Magazin de inputuri agricole"). */
  title: string
  /** Live counts, e.g. ["97 de produse", "71 în stoc"]. */
  counts: string[]
  /** The search island (ShopSearch). */
  search: ReactNode
  crops: {
    label: string
    items: { href: string; label: string }[]
    all: { href: string; label: string }
  }
  /** The promo card (PromoCard), right of the search; under it on phones. */
  promo?: ReactNode
  /** The category rail, pulled up over the band's lower edge. */
  rail?: ReactNode
}

/**
 * The shop landing's search-first band (Phase 7c): breadcrumb, H1 and live counts, a large
 * search, crop quick-picks and the seasonal promo card; the category rail overlaps its foot.
 */
export function ShopHero({
  crumbs,
  kicker,
  title,
  counts,
  search,
  crops,
  promo,
  rail,
}: ShopHeroProps) {
  return (
    <div>
      <div className="bg-forest text-on-forest">
        <div
          className={cx(
            wrap,
            'grid grid-cols-1 gap-8 pt-6 pb-10 md:pt-8 lg:grid-cols-12 lg:items-center lg:gap-10 lg:pt-10',
            rail ? 'lg:pb-28' : 'lg:pb-16',
          )}
        >
          <nav aria-label={crumbs.label} className="text-small lg:col-span-12">
            <ol className="flex flex-wrap items-center gap-2">
              {crumbs.items.map((item, i) => (
                <li key={item.url} className="flex items-center gap-2">
                  {i > 0 && (
                    <ChevronDownIcon className="size-3.5 -rotate-90 text-on-forest-muted" />
                  )}
                  {i === crumbs.items.length - 1 ? (
                    <span aria-current="page">{item.name}</span>
                  ) : (
                    <Link
                      href={item.url}
                      className="text-on-forest-muted no-underline hover:text-on-forest hover:underline"
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className="grid min-w-0 gap-6 lg:col-span-8 lg:gap-7">
            <div className="grid gap-3">
              <Kicker tone="forest">{kicker}</Kicker>
              <h1 className="text-h1 font-semibold text-balance">{title}</h1>
              {counts.length > 0 && (
                <p className="flex flex-wrap gap-x-3 gap-y-1 text-lead text-on-forest-muted tabular-nums">
                  {counts.map((c, i) => (
                    <span key={c} className="flex items-center gap-3">
                      {i > 0 && <span aria-hidden="true">·</span>}
                      {c}
                    </span>
                  ))}
                </p>
              )}
            </div>
            {search}
            {crops.items.length > 0 && (
              <nav aria-label={crops.label} className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-small text-on-forest-muted">{crops.label}</span>
                {crops.items.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="rounded-full px-3.5 py-1.5 text-small font-medium text-on-forest no-underline ring-1 ring-on-forest/30 transition-colors duration-150 ring-inset hover:bg-forest-raised hover:ring-lime"
                  >
                    {c.label}
                  </Link>
                ))}
                <Link
                  href={crops.all.href}
                  className="inline-flex items-center gap-1 px-2 py-1.5 text-small font-semibold text-lime no-underline hover:underline"
                >
                  {crops.all.label}
                  <ArrowRightIcon className="size-4" />
                </Link>
              </nav>
            )}
          </div>

          {promo && <div className="lg:col-span-4">{promo}</div>}
        </div>
      </div>
      {rail && <div className={cx(wrap, 'relative z-10 mt-6 lg:-mt-16')}>{rail}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------------------------------ */

export type PromoCardProps = {
  kicker: string
  title: string
  text?: string | null
  href: string
  linkLabel: string
  /** The staff promo's image. */
  image?: { src: string; alt: string } | null
  /** The seasonal default shows the category's packshots instead of a photo. */
  packshots?: string[]
  icon?: CategoryIcon | null
}

/**
 * The hero's promo card: the staff promo from ShopHome while it runs, otherwise the seasonal
 * default (the category with the most in-stock products for the month). The whole card links.
 */
export function PromoCard({
  kicker,
  title,
  text,
  href,
  linkLabel,
  image,
  packshots,
  icon,
}: PromoCardProps) {
  return (
    <Link
      href={href}
      className="group grid overflow-hidden rounded-xl bg-forest-raised text-on-forest no-underline ring-1 ring-on-forest/15 transition duration-200 ease-move hover:ring-lime"
    >
      {image ? (
        <div className="relative aspect-[16/9] bg-surface">
          <Photo src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 30vw, 100vw" />
        </div>
      ) : packshots?.length ? (
        <div className="grid grid-cols-3 gap-px bg-forest">
          {packshots.slice(0, 3).map((src) => (
            <div key={src} className="aspect-square bg-raised p-3">
              {/* Packshots on white: decorative here, the products are named on their pages. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" className="size-full object-contain" />
            </div>
          ))}
        </div>
      ) : null}
      <div className="grid gap-2 p-5 md:p-6">
        <p className="flex items-center gap-2 text-small font-medium text-lime">
          {icon && <CategoryGlyph icon={icon} className="size-5" />}
          {kicker}
        </p>
        <p className="text-h3 font-semibold text-balance">{title}</p>
        {text && <p className="text-small text-on-forest-muted">{text}</p>}
        <span className="mt-2 inline-flex items-center gap-1.5 font-semibold text-lime">
          {linkLabel}
          <ArrowRightIcon className="size-5 transition-transform duration-150 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------------------------------ */

const cropIcons: Record<string, ComponentType<IconProps>> = {
  wheat: WheatIcon,
  maize: MaizeIcon,
  sunflower: SunflowerIcon,
  rapeseed: RapeseedIcon,
  barley: BarleyIcon,
}

export type CropTile = {
  href: string
  label: string
  /** "24 de produse" */
  count: string
  /** The crop's key (wheat, maize…); crops without a drawn icon get the leaf. */
  crop?: string | null
  /** Up to three product types for this crop, each a filtered listing. */
  links?: { href: string; label: string }[]
}

/** "Pe culturi": a tile per crop with its icon, count and the product types it has. */
export function CropTiles({ items }: { items: CropTile[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-6">
      {items.map((c) => {
        const Icon = (c.crop && cropIcons[c.crop]) || LeafIcon
        return (
          <li
            key={c.href}
            className="relative grid content-start gap-3 rounded-lg bg-raised p-4 shadow-soft ring-1 ring-line transition duration-200 ease-move hover:shadow-raised hover:ring-line-strong md:p-5"
          >
            <span className="grid size-12 place-items-center rounded-full bg-lime-soft text-forest">
              <Icon className="size-7" />
            </span>
            <span className="grid gap-0.5">
              <Link
                href={c.href}
                className="font-semibold text-ink no-underline after:absolute after:inset-0 hover:text-accent"
              >
                {c.label}
              </Link>
              <span className="text-caption text-muted tabular-nums">{c.count}</span>
            </span>
            {c.links?.length ? (
              <ul className="relative z-10 hidden flex-wrap gap-x-3 gap-y-1 text-caption md:flex">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-accent no-underline hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

/* ------------------------------------------------------------------------------------------ */

export type BrandItem = { href: string; name: string; count: string; logo?: string | null }

/** "Producători": the brands with products, as logo or name tiles linking to their hubs. */
export function BrandStrip({
  items,
  all,
}: {
  items: BrandItem[]
  all?: { href: string; label: string }
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
      {items.map((b, i) => (
        <li key={b.href} className={cx(i >= 5 && 'hidden md:block')}>
          <Link
            href={b.href}
            className="grid h-full min-h-24 place-items-center gap-1 rounded-lg bg-raised p-4 text-center no-underline ring-1 ring-line transition duration-200 ease-move hover:shadow-raised hover:ring-line-strong"
          >
            {b.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={b.logo}
                alt={b.name}
                loading="lazy"
                className="h-8 w-auto max-w-full object-contain"
              />
            ) : (
              <span className="text-h4 font-semibold tracking-tight text-ink">{b.name}</span>
            )}
            <span className="text-caption text-muted tabular-nums">{b.count}</span>
          </Link>
        </li>
      ))}
      {all && (
        <li>
          <Link
            href={all.href}
            className="flex h-full min-h-24 items-center justify-center gap-1.5 rounded-lg p-4 text-small font-semibold text-accent no-underline ring-1 ring-line ring-inset hover:bg-accent-soft"
          >
            {all.label}
            <ArrowRightIcon className="size-4" />
          </Link>
        </li>
      )}
    </ul>
  )
}

/* ------------------------------------------------------------------------------------------ */

const trustIcons = {
  consultant: HandshakeIcon,
  pickup: PinIcon,
  finance: CoinsIcon,
  certificate: DocumentIcon,
} satisfies Record<string, ComponentType<IconProps>>

export type TrustItem = {
  icon: keyof typeof trustIcons
  title: string
  /** May hold a `<Fact>` (the bases count comes from the Figures register). */
  text: ReactNode
  link?: { href: string; label: string } | null
}

/** Why buy here: four short reasons in a row on the surface band. */
export function TrustRow({ items }: { items: TrustItem[] }) {
  return (
    <ul className="grid gap-6 rounded-xl bg-surface p-6 md:grid-cols-2 md:p-8 lg:grid-cols-4 lg:gap-8">
      {items.map((t) => {
        const Icon = trustIcons[t.icon]
        return (
          <li key={t.title} className="grid content-start gap-3">
            <span className="grid size-11 place-items-center rounded-lg bg-accent-soft text-accent">
              <Icon className="size-6" />
            </span>
            <h3 className="font-semibold">{t.title}</h3>
            <p className="text-small text-muted">{t.text}</p>
            {t.link && (
              <Link
                href={t.link.href}
                className="inline-flex w-fit items-center gap-1 text-small font-semibold text-accent no-underline hover:underline"
              >
                {t.link.label}
                <ArrowRightIcon className="size-4" />
              </Link>
            )}
          </li>
        )
      })}
    </ul>
  )
}
