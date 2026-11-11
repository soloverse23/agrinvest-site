import Link from 'next/link'
import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import { formatDate } from '@/lib/format'

import { ArrowRightIcon, ClockIcon, LeafIcon } from '../icons/icons'
import { cx } from '../lib/cx'
import { type Focus } from '../lib/media'
import { Photo } from './Photo'

/**
 * Editorial patterns for the knowledge hub and Agrinvest news (Phase 6): article cards in three
 * sizes, the byline row, the author box and the pillar card. All server-rendered, no script.
 */

export type ArticleCardProps = {
  href: string
  title: string
  summary?: string | null
  kicker?: string | null
  locale: Locale
  /** ISO date shown under the title. */
  date?: string | null
  image?: { src: string; alt: string; focus?: Focus } | null
  /** `feature`: the lead story, image beside the text from md up. `compact`: a text row. */
  variant?: 'feature' | 'default' | 'compact'
  /** Heading level inside the page outline. */
  level?: 2 | 3
  /** The page's largest image (the lead story above the fold). */
  priority?: boolean
}

/** A tinted stand-in when a piece has no photo, so the grid keeps its rhythm. */
function Placeholder({ kicker }: { kicker?: string | null }) {
  return (
    <div className="flex h-full w-full items-end bg-forest p-5 text-on-forest">
      <LeafIcon aria-hidden className="absolute top-5 right-5 size-10 text-lime" />
      {kicker && (
        <span className="text-caption font-semibold tracking-wide uppercase">{kicker}</span>
      )}
    </div>
  )
}

export function ArticleCard({
  href,
  title,
  summary,
  kicker,
  locale,
  date,
  image,
  variant = 'default',
  level = 3,
  priority,
}: ArticleCardProps) {
  const Heading = level === 2 ? 'h2' : 'h3'
  const meta = (kicker || date) && (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-subtle">
      {kicker && (
        <span className="font-semibold tracking-wide text-accent uppercase">{kicker}</span>
      )}
      {date && <time dateTime={date}>{formatDate(new Date(date), locale)}</time>}
    </p>
  )

  if (variant === 'compact')
    return (
      <article className="group relative grid gap-1 py-4">
        {meta}
        <Heading className="text-body leading-snug font-semibold text-ink">
          <Link href={href} className="after:absolute after:inset-0 group-hover:text-accent">
            {title}
          </Link>
        </Heading>
      </article>
    )

  const feature = variant === 'feature'
  // A lead story without a photo is a text card: a big empty block would only add weight.
  const textOnly = feature && !image
  return (
    <article
      className={cx(
        'group relative grid overflow-hidden rounded-xl bg-raised ring-1 ring-line transition-shadow hover:shadow-raised',
        feature && !textOnly && 'md:grid-cols-12',
        textOnly && 'border-l-4 border-accent',
      )}
    >
      {!textOnly && (
        <div
          className={cx(
            'relative aspect-video overflow-hidden bg-surface',
            feature && 'md:col-span-7 md:aspect-auto md:min-h-80',
          )}
        >
          {image ? (
            <Photo
              src={image.src}
              alt={image.alt}
              focus={image.focus}
              fill
              priority={priority}
              sizes={feature ? '(min-width: 768px) 58vw, 100vw' : '(min-width: 1024px) 33vw, 100vw'}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <Placeholder kicker={kicker} />
          )}
        </div>
      )}
      <div
        className={cx(
          'grid content-start gap-3 p-5 md:p-6',
          feature && !textOnly && 'md:col-span-5 md:content-center md:gap-4 md:p-10',
          textOnly && 'max-w-4xl gap-4 md:p-10',
        )}
      >
        {meta}
        <Heading
          className={cx(
            'font-semibold text-balance text-ink',
            feature ? 'text-h3 md:text-h2' : 'text-h4',
          )}
        >
          <Link href={href} className="after:absolute after:inset-0 group-hover:text-accent">
            {title}
          </Link>
        </Heading>
        {summary && (
          <p className={cx('text-muted', feature ? 'text-body md:text-lead' : 'text-small')}>
            {summary}
          </p>
        )}
      </div>
    </article>
  )
}

export type Byline = {
  name: string
  href?: string | null
  role?: string | null
  photo?: { src: string; alt: string } | null
}

function Avatar({ person }: { person: Byline }) {
  if (person.photo)
    return (
      <span className="relative block size-11 shrink-0 overflow-hidden rounded-full bg-surface">
        <Photo src={person.photo.src} alt="" fill sizes="44px" className="object-cover" />
      </span>
    )
  const initials = person.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
  return (
    <span
      aria-hidden
      className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-soft text-small font-semibold text-accent"
    >
      {initials}
    </span>
  )
}

const personName = (p: Byline) =>
  p.href ? (
    <Link href={p.href} className="font-semibold text-ink underline-offset-2 hover:underline">
      {p.name}
    </Link>
  ) : (
    <span className="font-semibold text-ink">{p.name}</span>
  )

/** Who wrote it, who checked it, when, and how long it takes to read. */
export function ArticleByline({
  locale,
  author,
  reviewer,
  published,
  updated,
  minutes,
  labels,
}: {
  locale: Locale
  author?: Byline | null
  reviewer?: Byline | null
  published?: string | null
  updated?: string | null
  minutes?: number
  labels: { by: string; reviewedBy: string; updated: string; minutes: (n: number) => string }
}) {
  const changed =
    updated && published && updated.slice(0, 10) !== published.slice(0, 10) ? updated : null
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-line py-4 text-small">
      {author && (
        <div className="flex items-center gap-3">
          <Avatar person={author} />
          <div className="grid">
            <span className="text-caption text-subtle">{labels.by}</span>
            {personName(author)}
          </div>
        </div>
      )}
      {reviewer && (
        <div className="grid">
          <span className="text-caption text-subtle">{labels.reviewedBy}</span>
          {personName(reviewer)}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted md:ml-auto">
        {published && <time dateTime={published}>{formatDate(new Date(published), locale)}</time>}
        {changed && (
          <span>
            {labels.updated} <time dateTime={changed}>{formatDate(new Date(changed), locale)}</time>
          </span>
        )}
        {minutes ? (
          <span className="inline-flex items-center gap-1">
            <ClockIcon aria-hidden className="size-4" />
            {labels.minutes(minutes)}
          </span>
        ) : null}
      </div>
    </div>
  )
}

/** The author box under an article, and the head of an author page. */
export function AuthorCard({
  person,
  bio,
  credentials,
  link,
  heading,
}: {
  person: Byline
  bio?: string | null
  credentials?: string | null
  link?: { href: string; label: string } | null
  heading?: ReactNode
}) {
  return (
    <aside className="grid gap-4 rounded-xl bg-surface p-6 ring-1 ring-line md:grid-cols-[auto_1fr] md:gap-6 md:p-8">
      <Avatar person={person} />
      <div className="grid gap-2">
        {heading}
        <p className="text-body">
          {personName(person)}
          {person.role && <span className="text-muted"> · {person.role}</span>}
        </p>
        {credentials && <p className="text-small text-muted">{credentials}</p>}
        {bio && <p className="max-w-text text-small text-ink">{bio}</p>}
        {link && (
          <Link
            href={link.href}
            className="inline-flex w-fit items-center gap-1 text-small font-semibold text-accent"
          >
            {link.label}
            <ArrowRightIcon aria-hidden className="size-4" />
          </Link>
        )}
      </div>
    </aside>
  )
}

/** A pillar of the knowledge hub: name, one line, how many guides, and its money links. */
export function PillarCard({
  href,
  title,
  intro,
  count,
  icon,
}: {
  href: string
  title: string
  intro: string
  count: string
  icon?: ReactNode
}) {
  return (
    <article className="group relative grid content-start gap-3 rounded-xl bg-raised p-6 ring-1 ring-line transition-shadow hover:shadow-raised">
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent">
          {icon ?? <LeafIcon aria-hidden className="size-5" />}
        </span>
        <span className="text-caption text-subtle">{count}</span>
      </div>
      <h3 className="text-h4 font-semibold text-ink">
        <Link href={href} className="after:absolute after:inset-0 group-hover:text-accent">
          {title}
        </Link>
      </h3>
      <p className="text-small text-muted">{intro}</p>
    </article>
  )
}

/** A short list of next steps beside an article: crop page, price, shop, tool. */
export function NextSteps({
  title,
  links,
}: {
  title: string
  links: { href: string; label: string }[]
}) {
  if (!links.length) return null
  return (
    <nav aria-label={title} className="grid gap-3 rounded-lg bg-raised p-5 ring-1 ring-line">
      <p className="text-small font-semibold text-ink">{title}</p>
      <ul className="grid gap-1">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex items-center justify-between gap-2 rounded-md py-1.5 text-small text-ink hover:text-accent"
            >
              {l.label}
              <ArrowRightIcon aria-hidden className="size-4 shrink-0 text-accent" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
