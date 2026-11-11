import Link from 'next/link'
import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import { formatDate } from '@/lib/format'

import type { CropKey } from '../fixtures/sample'
import { ArrowRightIcon } from '../icons/icons'
import { HeroCopy, type HeroProps } from './Hero'
import type { CarouselLabels } from './HeroCarousel'
import { CarouselNavLazy as CarouselNav, HeroCarouselLazy as HeroCarousel } from './Lazy'
import { Photo } from './Photo'
import { QuoteStrip, type Quote } from './QuoteStrip'

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
  rows: {
    crop: CropKey
    name: string
    price: number
    change: number
    href: string
    /** The last 30 days, oldest first (trend line). */
    points?: number[]
  }[]
  /** Diesel: Agrinvest's own price, else the EU Oil Bulletin average. */
  fuel?: {
    name: string
    price: number
    unit: string
    change?: number
    href: string
    points?: number[]
  } | null
  /** The ‹ › buttons' names, when the prices don't fit. */
  nav: { prev: string; next: string }
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

/**
 * Today's prices as a quote strip: each price links to its own page, with its 30-day line and
 * the change in lei and percent. On phones the row swipes sideways.
 */
function PriceRail({ locale, prices }: { locale: Locale; prices: HeroRailPrices }) {
  const quotes: Quote[] = [
    ...prices.rows.map((r) => ({
      key: r.crop,
      name: r.name,
      href: r.href,
      price: r.price,
      unit: prices.unit,
      change: r.change,
      points: r.points,
    })),
    ...(prices.fuel
      ? [{ key: 'diesel', ...prices.fuel, decimals: 2, fuel: true, showUnit: true } satisfies Quote]
      : []),
  ]
  return (
    <aside
      aria-label={prices.title}
      className="grid gap-2 border-t border-on-forest/20 py-3 md:py-4 lg:flex lg:items-center lg:gap-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 lg:w-48 lg:flex-nowrap lg:shrink-0 lg:flex-col lg:items-start lg:gap-1 lg:border-r lg:border-on-forest/15 lg:pr-5">
        <h2 className="text-small font-semibold whitespace-nowrap">{prices.title}</h2>
        <p className="order-last basis-full text-caption text-on-forest-muted lg:order-none lg:basis-auto">
          {formatDate(prices.date, locale)} · {prices.unit}
          <span className="hidden lg:block">{prices.place}</span>
        </p>
        <Link
          href={prices.all.href}
          className="inline-flex shrink-0 items-center gap-1.5 text-caption font-semibold text-lime no-underline hover:underline lg:pt-1 lg:text-small"
        >
          {prices.all.label}
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
      <QuoteStrip
        id="hero-prices"
        locale={locale}
        quotes={quotes}
        variant="hero"
        nav={
          <CarouselNav
            track="hero-prices"
            labels={prices.nav}
            tone="forest"
            hideIdle
            className="hidden shrink-0 md:flex"
          />
        }
        className="-mx-3 min-w-0 flex-1 lg:mx-0"
      />
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
