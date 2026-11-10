import type { Locale } from '@/i18n/config'

/**
 * The widget contract (Phase 5). Every tool widget is a server component that takes plain
 * props like these, never loads data itself, and renders something useful in each state:
 *
 * - `ready`: current data.
 * - `stale`: the last good data, older than its source's cadence; the date is shown plainly.
 * - `empty`: no data yet (no published Agrinvest price, a source that never answered). The
 *   widget says so and offers the next step (call, send a request); it never shows a zero
 *   or an invented number.
 *
 * Loaders in `src/lib/{prices,diesel,weather,news}/` build these props; the page decides
 * where the widget goes. See `README.md` in this folder.
 */
export type WidgetState = 'ready' | 'stale' | 'empty'

/** Where the numbers come from, shown under every widget that shows data. */
export type WidgetSource = {
  name: string
  url?: string
  /** Date of the data itself (the week, the bulletin), not of the fetch. */
  date?: Date
}

export type WidgetLink = { href: string; label: string }

export type WidgetBaseProps = {
  locale: Locale
  title: string
  state: WidgetState
  source?: WidgetSource
  /** The tool's own page or the next step. */
  link?: WidgetLink
  /** Heading level of the title: 2 when the widget sits right under the page title, else 3. */
  level?: 2 | 3
  className?: string
}

/** Fixed wording of the frame, in both languages. */
export const widgetCopy: Record<
  Locale,
  { source: string; asOf: string; stale: string; empty: string }
> = {
  ro: {
    source: 'Sursa',
    asOf: 'Date din',
    stale: 'Nu avem date mai noi',
    empty: 'Nu avem încă date pentru aici.',
  },
  en: {
    source: 'Source',
    asOf: 'Data from',
    stale: 'No newer data yet',
    empty: 'There is no data for this yet.',
  },
}
