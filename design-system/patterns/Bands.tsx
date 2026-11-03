import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import { formatNumber } from '@/lib/format'

import { ArrowRightIcon, PinIcon, SiloIcon, TruckIcon } from '../icons/icons'
import { Button } from '../primitives/Button'

const figureIcons: Record<string, ReactNode> = {
  bases: <PinIcon />,
  capacity: <SiloIcon />,
  trucks: <TruckIcon />,
}

/** Company figures (from the figures register) as an editorial row with dividers. */
export function FigureStrip({
  locale,
  items,
}: {
  locale: Locale
  items: readonly { key: string; value: number; unit?: string; label: string }[]
}) {
  return (
    <dl className="grid divide-y divide-line border-y border-line md:grid-cols-3 md:divide-x md:divide-y-0">
      {items.map((item) => (
        <div
          key={item.key}
          className="flex flex-col-reverse gap-2 py-6 md:px-8 md:py-8 md:first:pl-0"
        >
          <dt className="flex items-center gap-2 text-small text-muted">
            <span className="size-5 text-accent *:size-full" aria-hidden="true">
              {figureIcons[item.key]}
            </span>
            {item.label}
          </dt>
          <dd className="text-h1 font-semibold tabular-nums">
            {formatNumber(item.value, locale)}
            {item.unit && (
              <span className="ml-1.5 text-h3 font-medium text-muted">{item.unit}</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Financing call to action. The timeline shows the real repayment pattern: at most two
 * instalments a year, after the summer and autumn harvests (figures register F5).
 */
export function FinanceBand({
  kicker,
  title,
  body,
  cta,
  secondary,
  instalments,
}: {
  kicker: string
  title: string
  body: string
  cta: { href: string; label: string }
  secondary: { href: string; label: string }
  instalments: { when: string; label: string }[]
}) {
  return (
    <section className="grid gap-12 rounded-xl bg-forest px-6 py-10 text-on-forest md:px-12 md:py-14 lg:grid-cols-12 lg:items-center lg:gap-16 lg:px-16">
      <div className="grid gap-5 lg:col-span-6">
        <p className="flex items-center gap-3 text-small font-medium text-lime">
          <span className="h-px w-10 bg-lime" aria-hidden="true" />
          {kicker}
        </p>
        <h2 className="text-h1 font-semibold text-balance">{title}</h2>
        <p className="max-w-xl text-lead text-on-forest-muted">{body}</p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Button href={cta.href} variant="lime" icon={<ArrowRightIcon />}>
            {cta.label}
          </Button>
          <Button href={secondary.href} variant="on-dark">
            {secondary.label}
          </Button>
        </div>
      </div>
      <ol className="relative grid gap-8 border-l border-on-forest/20 pl-8 lg:col-span-6">
        {instalments.map((step, i) => (
          <li key={step.when} className="relative">
            <span
              className="absolute top-0.5 -left-11 inline-flex size-6 items-center justify-center rounded-full bg-lime text-caption font-semibold text-forest tabular-nums"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <p className="text-h4 font-semibold">{step.when}</p>
            <p className="mt-1 text-on-forest-muted">{step.label}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
