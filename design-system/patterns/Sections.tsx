import Link from 'next/link'
import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import { formatDate } from '@/lib/format'

import {
  ArrowRightIcon,
  BarleyIcon,
  ChevronDownIcon,
  ClockIcon,
  CoinsIcon,
  DocumentIcon,
  DropIcon,
  HandshakeIcon,
  LeafIcon,
  MailIcon,
  MaizeIcon,
  PhoneIcon,
  PinIcon,
  RapeseedIcon,
  ScaleIcon,
  SiloIcon,
  SunflowerIcon,
  TruckIcon,
  WheatIcon,
  type IconProps,
} from '../icons/icons'
import type { SectionIcon } from '../icons/keys'
import { cx } from '../lib/cx'
import { type Focus } from '../lib/media'
import { Button } from '../primitives/Button'
import { Photo } from './Photo'

/** Icon keys that content (Payload blocks) can choose for cards and steps. */
export const sectionIcons = {
  silo: SiloIcon,
  truck: TruckIcon,
  pin: PinIcon,
  leaf: LeafIcon,
  scale: ScaleIcon,
  drop: DropIcon,
  coins: CoinsIcon,
  clock: ClockIcon,
  handshake: HandshakeIcon,
  document: DocumentIcon,
  phone: PhoneIcon,
  mail: MailIcon,
  wheat: WheatIcon,
  maize: MaizeIcon,
  sunflower: SunflowerIcon,
  rapeseed: RapeseedIcon,
  barley: BarleyIcon,
} satisfies Record<SectionIcon, (props: IconProps) => ReactNode>
export type { SectionIcon }

const IconDisc = ({ icon, tone = 'lime' }: { icon: SectionIcon; tone?: 'lime' | 'accent' }) => {
  const Icon = sectionIcons[icon]
  return (
    <span
      className={cx(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-lg',
        tone === 'lime' ? 'bg-lime-soft text-forest' : 'bg-accent-soft text-accent',
      )}
      aria-hidden="true"
    >
      <Icon className="size-6" />
    </span>
  )
}

/** Thin lime rule + label above a heading (the "kicker"). */
export function Kicker({
  children,
  tone = 'paper',
}: {
  children: ReactNode
  tone?: 'paper' | 'forest'
}) {
  return (
    <p
      className={cx(
        'flex items-center gap-3 text-small font-medium',
        tone === 'forest' ? 'text-lime' : 'text-accent',
      )}
    >
      <span
        className={cx('h-px w-10', tone === 'forest' ? 'bg-lime' : 'bg-accent')}
        aria-hidden="true"
      />
      {children}
    </p>
  )
}

/** Section opening: kicker, H2 (or H3), lead and an optional action on the right. */
export function SectionHeading({
  id,
  kicker,
  title,
  lead,
  action,
  as: Heading = 'h2',
  className,
}: {
  id?: string
  kicker?: string | null
  title: string
  lead?: ReactNode
  action?: { href: string; label: string } | null
  as?: 'h2' | 'h3'
  className?: string
}) {
  return (
    <div
      className={cx(
        'flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10',
        className,
      )}
    >
      <div className="grid max-w-3xl gap-3">
        {kicker && <Kicker>{kicker}</Kicker>}
        <Heading id={id} className="scroll-mt-24 text-h2 font-semibold text-balance">
          {title}
        </Heading>
        {lead && <p className="text-lead text-muted">{lead}</p>}
      </div>
      {action && (
        <Button href={action.href} variant="secondary" icon={<ArrowRightIcon />} className="w-fit">
          {action.label}
        </Button>
      )}
    </div>
  )
}

export function Breadcrumbs({
  label,
  items,
}: {
  label: string
  /** Full trail including home; the last item is the current page. */
  items: { name: string; url: string }[]
}) {
  if (items.length < 2) return null
  return (
    <nav aria-label={label} className="text-small text-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => (
          <li key={item.url} className="flex items-center gap-2">
            {i > 0 && (
              <ChevronDownIcon className="size-3.5 -rotate-90 text-subtle" aria-hidden="true" />
            )}
            {i === items.length - 1 ? (
              <span aria-current="page" className="text-ink">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.url}
                className="text-muted no-underline hover:text-ink hover:underline"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function Updated({ locale, label, date }: { locale: Locale; label: string; date: string }) {
  return (
    <p className="flex items-center gap-1.5 text-caption text-subtle">
      <ClockIcon className="size-3.5" />
      {label} <time dateTime={date.slice(0, 10)}>{formatDate(new Date(date), locale)}</time>
    </p>
  )
}

/**
 * Header of content pages: breadcrumbs, the page's only H1, the answer summary (AEO) and the
 * update date. `aside` holds key facts next to the title on wide screens.
 */
export function PageHeader({
  breadcrumbs,
  kicker,
  title,
  summary,
  updated,
  actions,
  aside,
}: {
  breadcrumbs?: ReactNode
  kicker?: string | null
  title: ReactNode
  summary?: ReactNode
  updated?: ReactNode
  actions?: ReactNode
  aside?: ReactNode
}) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto grid max-w-page gap-10 px-4 pt-8 pb-12 md:px-8 md:pt-10 md:pb-16 lg:grid-cols-12 lg:items-end">
        <div className={cx('grid gap-5', aside ? 'lg:col-span-7' : 'lg:col-span-9')}>
          {breadcrumbs}
          <div className="grid gap-4 pt-4 md:pt-8">
            {kicker && <Kicker>{kicker}</Kicker>}
            <h1 className="text-h1 font-semibold text-balance">{title}</h1>
          </div>
          {summary && <p className="max-w-2xl text-lead text-muted">{summary}</p>}
          {actions && <div className="flex flex-wrap gap-3 pt-1">{actions}</div>}
          {updated}
        </div>
        {aside && <div className="lg:col-span-5">{aside}</div>}
      </div>
    </header>
  )
}

/** Labelled key facts (capacity, county, payment…) as a compact card. */
export function KeyFacts({
  title,
  items,
  className,
}: {
  title?: string
  items: { label: string; value: ReactNode; icon?: SectionIcon }[]
  className?: string
}) {
  return (
    <section
      aria-label={title}
      className={cx('rounded-xl bg-raised p-6 shadow-soft ring-1 ring-line md:p-7', className)}
    >
      {title && <h2 className="mb-4 text-small font-semibold text-muted">{title}</h2>}
      <dl className="grid divide-y divide-line">
        {items.map((item) => {
          const Icon = item.icon ? sectionIcons[item.icon] : null
          return (
            <div key={item.label} className="grid gap-1 py-3.5 first:pt-0 last:pb-0">
              <dt className="flex items-center gap-2 text-small text-muted">
                {Icon && <Icon className="size-4 text-accent" />}
                {item.label}
              </dt>
              <dd className="text-h4 font-semibold tabular-nums">{item.value}</dd>
            </div>
          )
        })}
      </dl>
    </section>
  )
}

/** FAQ as native disclosure widgets: works without JavaScript, every answer is in the HTML. */
export function Accordion({
  items,
}: {
  items: { id?: string | null; question: string; answer: ReactNode }[]
}) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((q, i) => (
        <details key={q.id ?? q.question} className="group" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-h4 font-semibold hover:text-accent">
            <h3 className="text-h4 font-semibold">{q.question}</h3>
            <ChevronDownIcon className="mt-0.5 size-5 shrink-0 text-accent transition-transform duration-150 group-open:rotate-180" />
          </summary>
          <div className="max-w-3xl pb-6 text-muted">{q.answer}</div>
        </details>
      ))}
    </div>
  )
}

/** Cards for services or reasons: icon, title, text, optional link. */
export function ServiceGrid({
  items,
  columns = 3,
}: {
  items: {
    id?: string | null
    icon?: SectionIcon | null
    title: string
    body?: string | null
    href?: string | null
    linkLabel?: string | null
  }[]
  columns?: 2 | 3 | 4
}) {
  return (
    <ul
      className={cx(
        'grid gap-4 md:gap-5',
        columns === 2 && 'md:grid-cols-2',
        columns === 3 && 'md:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'md:grid-cols-2 lg:grid-cols-4',
      )}
    >
      {items.map((item) => {
        const body = (
          <>
            {item.icon && <IconDisc icon={item.icon} />}
            <h3 className="text-h4 font-semibold">{item.title}</h3>
            {item.body && <p className="text-small text-muted">{item.body}</p>}
            {item.href && (
              <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-small font-semibold text-accent">
                {item.linkLabel}
                <ArrowRightIcon className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </span>
            )}
          </>
        )
        const card =
          'group flex h-full flex-col gap-3 rounded-lg bg-raised p-6 shadow-soft ring-1 ring-line'
        return (
          <li key={item.id ?? item.title}>
            {item.href ? (
              <Link
                href={item.href}
                className={cx(
                  card,
                  'text-ink no-underline transition duration-150 ease-move hover:-translate-y-0.5 hover:shadow-raised',
                )}
              >
                {body}
              </Link>
            ) : (
              <div className={card}>{body}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** Numbered steps ("how it works"), horizontal from 1024 px. */
export function Steps({
  items,
}: {
  items: { id?: string | null; title: string; body?: ReactNode }[]
}) {
  return (
    <ol
      className={cx(
        'grid gap-6 md:grid-cols-2',
        items.length === 3 && 'lg:grid-cols-3',
        items.length >= 4 && 'lg:grid-cols-4',
      )}
    >
      {items.map((step, i) => (
        <li
          key={step.id ?? step.title}
          className="grid content-start gap-3 border-t-2 border-accent pt-5"
        >
          <span className="text-caption font-semibold text-accent tabular-nums">
            {String(i + 1).padStart(2, '0')}
          </span>
          <h3 className="text-h4 font-semibold">{step.title}</h3>
          {step.body && <p className="text-small text-muted">{step.body}</p>}
        </li>
      ))}
    </ol>
  )
}

/** Call to action band: forest (default) or a quiet surface version. */
export function CtaBand({
  tone = 'forest',
  kicker,
  title,
  body,
  primary,
  secondary,
}: {
  tone?: 'forest' | 'surface'
  kicker?: string | null
  title: string
  body?: string | null
  primary: { href: string; label: string }
  secondary?: { href: string; label: string } | null
}) {
  const forest = tone === 'forest'
  return (
    <section
      className={cx(
        'grid gap-8 rounded-xl px-6 py-10 md:px-12 md:py-14 lg:grid-cols-12 lg:items-center',
        forest ? 'bg-forest text-on-forest' : 'bg-surface ring-1 ring-line',
      )}
    >
      <div className="grid gap-4 lg:col-span-8">
        {kicker && <Kicker tone={forest ? 'forest' : 'paper'}>{kicker}</Kicker>}
        <h2 className="text-h2 font-semibold text-balance">{title}</h2>
        {body && (
          <p className={cx('max-w-2xl text-lead', forest ? 'text-on-forest-muted' : 'text-muted')}>
            {body}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
        <Button href={primary.href} variant={forest ? 'lime' : 'primary'} icon={<ArrowRightIcon />}>
          {primary.label}
        </Button>
        {secondary && (
          <Button href={secondary.href} variant={forest ? 'on-dark' : 'secondary'}>
            {secondary.label}
          </Button>
        )}
      </div>
    </section>
  )
}

const calloutTones = {
  info: 'bg-info-soft border-info',
  note: 'bg-lime-soft border-accent',
  warning: 'bg-warning-soft border-warning',
}

/** Short aside in running text. */
export function Callout({
  tone = 'info',
  title,
  children,
}: {
  tone?: keyof typeof calloutTones
  title?: string | null
  children: ReactNode
}) {
  return (
    <aside className={cx('rounded-lg border-l-4 px-6 py-5', calloutTones[tone])}>
      {title && <p className="mb-1 font-semibold">{title}</p>}
      <div className="text-ink">{children}</div>
    </aside>
  )
}

/** Text beside a documentary photo, with an optional pull quote. */
export function StorySection({
  kicker,
  title,
  children,
  quote,
  image,
  reverse,
}: {
  kicker?: string | null
  title: string
  children?: ReactNode
  quote?: { text: string; name?: string | null; role?: string | null } | null
  image?: { src: string; alt: string; width: number; height: number; focus?: Focus } | null
  reverse?: boolean
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-16">
      <div className={cx('grid gap-5 lg:col-span-6', reverse && 'lg:order-2')}>
        {kicker && <Kicker>{kicker}</Kicker>}
        <h2 className="text-h2 font-semibold text-balance">{title}</h2>
        {children && <div className="grid gap-4 text-muted">{children}</div>}
        {quote && (
          <blockquote className="mt-2 grid gap-3 border-l-4 border-lime pl-5">
            <p className="text-lead text-ink">„{quote.text}”</p>
            {quote.name && (
              <footer className="text-small text-muted">
                <span className="font-semibold text-ink">{quote.name}</span>
                {quote.role && `, ${quote.role}`}
              </footer>
            )}
          </blockquote>
        )}
      </div>
      {image && (
        <div className="lg:col-span-6">
          <Photo
            src={image.src}
            alt={image.alt}
            focus={image.focus}
            width={image.width}
            height={image.height}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-4/3 w-full rounded-xl object-cover saturate-90"
          />
        </div>
      )}
    </div>
  )
}

/** People to talk to, by need. Phone and email appear only when the person agreed. */
export function ContactCards({
  people,
  labels,
}: {
  people: {
    id: string | number
    name: string
    role?: string | null
    need?: string | null
    phone?: string | null
    email?: string | null
  }[]
  labels: { call: string; write: string }
}) {
  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {people.map((p) => (
        <li
          key={p.id}
          className="grid content-start gap-4 rounded-lg bg-raised p-6 shadow-soft ring-1 ring-line"
        >
          <div className="grid gap-1">
            {p.need && <p className="text-caption font-medium text-accent">{p.need}</p>}
            <p className="text-h4 font-semibold">{p.name}</p>
            {p.role && <p className="text-small text-muted">{p.role}</p>}
          </div>
          {(p.phone || p.email) && (
            <div className="grid gap-2 border-t border-line pt-4 text-small">
              {p.phone && (
                <a
                  href={`tel:${p.phone.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-2 font-semibold text-ink no-underline hover:text-accent"
                >
                  <PhoneIcon className="size-4 text-accent" />
                  <span className="sr-only">{labels.call}: </span>
                  <span className="tabular-nums">{p.phone}</span>
                </a>
              )}
              {p.email && (
                <a
                  href={`mailto:${p.email}`}
                  className="inline-flex items-center gap-2 font-semibold text-ink no-underline hover:text-accent"
                >
                  <MailIcon className="size-4 text-accent" />
                  <span className="sr-only">{labels.write}: </span>
                  {p.email}
                </a>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

/** In-page contents for long pages: anchors to the H2s. */
export function Toc({ label, items }: { label: string; items: { id: string; title: string }[] }) {
  if (items.length < 3) return null
  return (
    <nav aria-label={label} className="grid gap-3">
      <p className="text-small font-semibold text-muted">{label}</p>
      <ol className="grid gap-1 border-l border-line">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="-ml-px block border-l-2 border-transparent py-1 pl-4 text-small text-muted no-underline hover:border-accent hover:text-ink"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
