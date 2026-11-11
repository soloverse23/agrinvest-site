import type { Locale } from '@/i18n/config'

/**
 * Number, unit and date formatting for both locales (voice rules: docs/design-system.md).
 * Romanian: `1.020 lei/t`, `12,5%`, `2 nov. 2026`. A number and its unit never wrap apart.
 */
const NBSP = ' '
const MINUS = '−'

const intl: Record<Locale, string> = { ro: 'ro-RO', en: 'en-GB' }
const numberFormats = new Map<string, Intl.NumberFormat>()

function numberFormat(locale: Locale, options: Intl.NumberFormatOptions = {}): Intl.NumberFormat {
  const key = `${locale}:${JSON.stringify(options)}`
  let format = numberFormats.get(key)
  if (!format) {
    format = new Intl.NumberFormat(intl[locale], options)
    numberFormats.set(key, format)
  }
  return format
}

/** `1020` → `1.020` (ro) / `1,020` (en). */
export function formatNumber(value: number, locale: Locale, maxDecimals = 2): string {
  return numberFormat(locale, { maximumFractionDigits: maxDecimals }).format(value)
}

/** `1020, 'lei/t'` → `1.020 lei/t`, joined by a no-break space. */
export function formatQuantity(
  value: number,
  unit: string,
  locale: Locale,
  maxDecimals = 2,
): string {
  return `${formatNumber(value, locale, maxDecimals)}${NBSP}${unit}`
}

/** `12.5` → `12,5%` (ro) / `12.5%` (en). */
export function formatPercent(value: number, locale: Locale): string {
  return `${formatNumber(value, locale, 1)}%`
}

/** Change with an explicit sign: `+15`, `−10` (true minus), `±0`. */
export function formatSigned(value: number, locale: Locale): string {
  const sign = value > 0 ? '+' : value < 0 ? MINUS : '±'
  return `${sign}${formatNumber(Math.abs(value), locale)}`
}

/** `2 nov. 2026` (ro) / `2 Nov 2026` (en). */
export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(intl[locale], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/** `2 nov.` (ro) / `2 Nov` (en): chart axes and dense tables. */
export function formatShortDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(intl[locale], { day: 'numeric', month: 'short' }).format(date)
}

/**
 * `11 nov., 09:40` (ro) / `11 Nov, 09:40` (en), in Romanian time; just the date at midnight,
 * which is how day-only sources (prices, feeds without a time) arrive. Absolute on purpose:
 * pages are cached, so "2 hours ago" would go stale.
 */
export function formatWhen(date: Date, locale: Locale): string {
  const zone = 'Europe/Bucharest'
  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: zone,
  }).format(date)
  const day = new Intl.DateTimeFormat(intl[locale], {
    day: 'numeric',
    month: 'short',
    timeZone: zone,
  }).format(date)
  return time === '00:00' || date.getUTCHours() + date.getUTCMinutes() === 0
    ? day
    : `${day}, ${time}`
}

export type Direction = 'up' | 'down' | 'flat'
export const direction = (value: number): Direction =>
  value > 0 ? 'up' : value < 0 ? 'down' : 'flat'
