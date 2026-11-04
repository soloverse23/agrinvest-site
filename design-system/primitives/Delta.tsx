import type { Locale } from '@/i18n/config'
import { direction, formatNumber, formatSigned } from '@/lib/format'

import { cx } from '../lib/cx'

const styles = {
  up: 'bg-up-soft text-up',
  down: 'bg-down-soft text-down',
  flat: 'bg-flat-soft text-flat',
}
const marks = { up: '▲', down: '▼', flat: '–' }
const spoken = {
  ro: { up: 'în creștere cu', down: 'în scădere cu', flat: 'neschimbat' },
  en: { up: 'up', down: 'down', flat: 'unchanged' },
}

/**
 * Price change as a soft pill: arrow + sign + value. Never colour alone.
 * Screen readers hear "up 15" / "în creștere cu 15".
 */
export function Delta({
  value,
  locale,
  unit,
  size = 'md',
  className,
}: {
  value: number
  locale: Locale
  unit?: string
  size?: 'sm' | 'md'
  className?: string
}) {
  const dir = direction(value)
  const shown = `${formatSigned(value, locale)}${unit ? `\u00a0${unit}` : ''}`
  const said =
    dir === 'flat'
      ? spoken[locale].flat
      : `${spoken[locale][dir]} ${formatNumber(Math.abs(value), locale)}${unit ? ` ${unit}` : ''}`
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-sm font-semibold tabular-nums whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-caption' : 'px-2.5 py-1 text-small',
        styles[dir],
        className,
      )}
    >
      <span aria-hidden="true" className="inline-block scale-75">
        {marks[dir]}
      </span>
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{said}</span>
    </span>
  )
}
