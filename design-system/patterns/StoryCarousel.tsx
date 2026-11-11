import Link from 'next/link'

import type { Locale } from '@/i18n/config'
import { formatDate } from '@/lib/format'

import { ArrowRightIcon, LeafIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { type Focus } from '../lib/media'
import { Button } from '../primitives/Button'
import { CarouselNavLazy } from './Lazy'
import { Photo } from './Photo'
import { Kicker } from './Sections'

/**
 * The home page's guides and news (under the shop): photo-led cards on a horizontal
 * scroll-snap track. Server-rendered, every link in the HTML; the only script is the arrow pair
 * (`CarouselNav`, its own chunk), and the track scrolls without it.
 */

export type StoryCard = {
  href: string
  title: string
  summary?: string | null
  /** The pillar ("Grâu") or "Știri Agrinvest". */
  kicker: string
  /** ISO date. */
  date?: string | null
  image?: { src: string; alt: string; focus?: Focus } | null
}

export type StoryCarouselProps = {
  id?: string
  locale: Locale
  kicker: string
  title: string
  stories: StoryCard[]
  all: { href: string; label: string }
  labels: { read: string; prev: string; next: string }
  className?: string
}

const wrap = 'mx-auto w-full max-w-page px-4 md:px-8'

function Card({ story, locale, read }: { story: StoryCard; locale: Locale; read: string }) {
  return (
    <article className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-xl bg-forest text-on-forest">
      {story.image ? (
        <Photo
          src={story.image.src}
          alt={story.image.alt}
          focus={story.image.focus}
          fill
          // A 16:9 photo cropped to a 4:5 card needs about 2.2× the card's width.
          sizes="(min-width: 1024px) 67vw, (min-width: 640px) 100vw, 182vw"
          className="-z-10 object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <LeafIcon aria-hidden className="absolute top-6 right-6 size-12 text-lime" />
      )}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-t from-ink/95 via-ink/60 via-40% to-ink/0 to-75%"
      />
      <span className="absolute top-4 left-4 rounded-full bg-paper/95 px-3 py-1 text-caption font-semibold text-ink">
        {story.kicker}
      </span>
      <div className="grid gap-3 p-5 md:p-6">
        {story.date && (
          <time dateTime={story.date} className="text-caption text-on-forest-muted">
            {formatDate(new Date(story.date), locale)}
          </time>
        )}
        <h3 className="text-h4 font-semibold text-balance">
          <Link
            href={story.href}
            className="text-on-forest no-underline after:absolute after:inset-0 focus-visible:outline-none after:focus-visible:rounded-xl after:focus-visible:ring-2 after:focus-visible:ring-lime"
          >
            {story.title}
          </Link>
        </h3>
        {story.summary && (
          <p className="line-clamp-2 text-small text-on-forest-muted">{story.summary}</p>
        )}
        <span
          aria-hidden
          className="inline-flex items-center gap-1.5 text-small font-semibold text-lime"
        >
          {read}
          <ArrowRightIcon className="size-4 transition-transform duration-150 group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  )
}

export function StoryCarousel({
  id = 'ghiduri',
  locale,
  kicker,
  title,
  stories,
  all,
  labels,
  className,
}: StoryCarouselProps) {
  if (!stories.length) return null
  const track = `${id}-track`
  return (
    <section
      aria-labelledby={id}
      className={cx('grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8 md:gap-10', className)}
    >
      <div className={cx(wrap, 'flex flex-col gap-5 md:flex-row md:items-end md:justify-between')}>
        <div className="grid max-w-3xl gap-3">
          <Kicker>{kicker}</Kicker>
          <h2 id={id} className="scroll-mt-24 text-h2 font-semibold text-balance">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <CarouselNavLazy track={track} labels={labels} className="hidden md:flex" />
          <Button href={all.href} variant="secondary" icon={<ArrowRightIcon />} className="w-fit">
            {all.label}
          </Button>
        </div>
      </div>
      <div className="mx-auto w-full max-w-page min-w-0">
        <ul
          id={track}
          className="flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:scroll-px-8 md:gap-5 md:px-8 [&::-webkit-scrollbar]:hidden"
        >
          {stories.map((s) => (
            <li key={s.href} className="w-[82%] shrink-0 snap-start sm:w-[45%] lg:w-[30%]">
              <Card story={s} locale={locale} read={labels.read} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
