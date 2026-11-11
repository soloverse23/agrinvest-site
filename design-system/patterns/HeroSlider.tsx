import Link from 'next/link'
import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import { formatDate, formatNumber } from '@/lib/format'

import type { CropKey } from '../fixtures/sample'
import { ArrowRightIcon } from '../icons/icons'
import { FuelIcon } from '../icons/server'
import { Delta } from '../primitives/Delta'
import { HeroCopy, type HeroProps } from './Hero'
import type { CarouselLabels } from './HeroCarousel'
import { HeroCarouselLazy as HeroCarousel } from './Lazy'
import { Photo } from './Photo'

export type HeroSlide = {
  eyebrow: string
  title: string
  accent?: string
  lead?: ReactNode
  primary?: { href: string; label: string } | null
  secondary?: { href: string; label: string } | null
  /** The still: the first slide's is the page's LCP image. */
  poster?: { src: string; alt: string } | null
  /**
   * Base path of the silent loops, e.g. `/media/hero/grain` (scripts/brand/clips.ts): `.webm`
   * and `.mp4` for wide screens, `-tall.*` for phones, `-tall.webp` the phone poster.
   */
  clip?: string | null
}

export type HeroRailPrices = {
  title: string
  place: string
  unit: string
  date: Date
  all: { href: string; label: string }
  rows: { crop: CropKey; name: string; price: number; change: number; href: string }[]
  /** Diesel: Agrinvest's own price, else the EU Oil Bulletin average. */
  fuel?: { name: string; price: number; unit: string; change?: number; href: string } | null
}

export type HeroSliderProps = {
  locale: Locale
  /** The site header, drawn over the footage (SiteHeader with tone="overlay"). */
  header?: ReactNode
  slides: HeroSlide[]
  labels: CarouselLabels
  /** Seconds per slide. */
  seconds?: number
  /** Today's prices on the rail under the slides; the same on every slide. */
  prices?: HeroRailPrices
  /** Quick links on the rail while no prices are published. */
  needs?: HeroProps['needs']
  /** The first slide's heading: h1 when the slider opens the page. The others are h2. */
  as?: 'h1' | 'h2'
  /** Posters only and rotation paused, as under reduced motion (stories, previews). */
  still?: boolean
}

/**
 * Home hero with three slides (grain, shop, financing) over silent footage, and a rail of
 * today's prices that stays put while the slides change. Every slide is in the HTML; the
 * first slide's headline is the page's only H1, the others are H2. The first poster is the
 * LCP image; the loops come later and only where motion is welcome (HeroCarousel).
 */
export function HeroSlider({
  locale,
  header,
  slides,
  labels,
  seconds = 7,
  prices,
  needs,
  as = 'h1',
  still,
}: HeroSliderProps) {
  return (
    <HeroCarousel
      labels={labels}
      still={still}
      interval={seconds * 1000}
      slides={slides.map((slide, i) => ({
        label: slide.eyebrow,
        clip: slide.clip,
        poster: slide.poster ? (
          <Photo
            src={slide.poster.src}
            alt=""
            fill
            priority={i === 0}
            tall={slide.clip ? `${slide.clip}-tall.webp` : undefined}
            sizes="100vw"
            quality={60}
            className="object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-forest" />
        ),
        content: (
          <HeroCopy
            eyebrow={slide.eyebrow}
            title={slide.title}
            accent={slide.accent}
            lead={slide.lead}
            primary={slide.primary}
            secondary={slide.secondary}
            as={i === 0 ? as : 'h2'}
            size="display"
          />
        ),
      }))}
      rail={
        prices ? (
          <PriceRail locale={locale} prices={prices} />
        ) : needs?.length ? (
          <QuickLinks needs={needs} label={labels.carousel} />
        ) : null
      }
    >
      {/* Scrims: top for the header, bottom and left for the text. Neutral, not green. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-ink/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-full bg-linear-to-t from-ink/95 via-ink/60 to-ink/10 md:h-4/5 md:to-transparent" />
        <div className="absolute inset-y-0 left-0 hidden w-2/3 bg-linear-to-r from-ink/50 to-transparent lg:block" />
      </div>
      {header}
    </HeroCarousel>
  )
}

/** Each price links to its own page; on phones the row scrolls sideways inside itself. */
function PriceRail({ locale, prices }: { locale: Locale; prices: HeroRailPrices }) {
  const item =
    'flex w-full min-w-32 shrink-0 snap-start flex-col gap-1 rounded-md px-3 py-2 text-on-forest no-underline ring-1 ring-on-forest/15 transition-colors duration-150 hover:bg-on-forest/10 hover:ring-on-forest/30 lg:min-w-0'
  return (
    <aside
      aria-label={prices.title}
      className="grid gap-3 border-t border-on-forest/20 py-4 md:py-5 lg:grid-cols-12 lg:items-center lg:gap-6"
    >
      <div className="flex items-baseline justify-between gap-4 lg:col-span-3 lg:grid lg:justify-start lg:gap-1">
        <h2 className="text-small font-semibold">{prices.title}</h2>
        <p className="text-caption text-on-forest-muted">
          {prices.place} · {formatDate(prices.date, locale)}
          <span className="block">{prices.unit}</span>
        </p>
        <Link
          href={prices.all.href}
          className="hidden items-center gap-1.5 pt-1 text-small font-semibold text-lime no-underline hover:underline lg:inline-flex"
        >
          {prices.all.label}
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
      <ul
        data-scroll-x
        className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0 lg:col-span-9 lg:grid lg:auto-cols-fr lg:grid-flow-col lg:overflow-visible"
      >
        {prices.rows.map((row) => (
          <li key={row.crop} className="flex shrink-0 lg:min-w-0">
            <Link href={row.href} className={item}>
              <span className="truncate text-caption text-on-forest-muted">{row.name}</span>
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-h4 font-semibold tabular-nums">
                  {formatNumber(row.price, locale)}
                </span>
                <Delta value={row.change} locale={locale} size="sm" />
              </span>
            </Link>
          </li>
        ))}
        {prices.fuel && (
          <li className="flex shrink-0 lg:min-w-0">
            <Link href={prices.fuel.href} className={item}>
              <span className="flex items-center gap-1.5 truncate text-caption text-on-forest-muted">
                <FuelIcon className="size-3.5 shrink-0 text-lime" />
                {prices.fuel.name}
              </span>
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-h4 font-semibold whitespace-nowrap tabular-nums">
                  {formatNumber(prices.fuel.price, locale, 2)}
                  <span className="ml-1 text-caption font-normal text-on-forest-muted">
                    {prices.fuel.unit}
                  </span>
                </span>
                {prices.fuel.change != null && (
                  <Delta value={prices.fuel.change} locale={locale} size="sm" />
                )}
              </span>
            </Link>
          </li>
        )}
        <li className="flex lg:hidden">
          <Link href={prices.all.href} className={`${item} justify-center font-semibold text-lime`}>
            <span className="inline-flex items-center gap-1.5 text-small">
              {prices.all.label}
              <ArrowRightIcon className="size-4" />
            </span>
          </Link>
        </li>
      </ul>
    </aside>
  )
}

function QuickLinks({ needs, label }: { needs: NonNullable<HeroProps['needs']>; label: string }) {
  return (
    <nav
      aria-label={label}
      className="grid border-t border-on-forest/20 sm:grid-cols-2 lg:grid-cols-4"
    >
      {needs.map((need) => (
        <Link
          key={need.href}
          href={need.href}
          className="group flex items-center justify-between gap-4 border-b border-on-forest/15 py-4 text-on-forest no-underline sm:odd:pr-6 lg:border-b-0 lg:px-6 lg:py-6 lg:first:pl-0 lg:not-first:border-l"
        >
          <span className="grid gap-0.5">
            <span className="font-semibold">{need.label}</span>
            {need.hint && <span className="text-caption text-on-forest-muted">{need.hint}</span>}
          </span>
          <ArrowRightIcon className="size-5 shrink-0 text-lime transition-transform duration-150 group-hover:translate-x-1" />
        </Link>
      ))}
    </nav>
  )
}
