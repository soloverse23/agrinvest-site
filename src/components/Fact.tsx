import type { Locale } from '@/i18n/config'
import { getFigures, type Figure } from '@/lib/content/globals'
import { SITE_INDEXABLE } from '@/lib/site'

const markerText: Record<Locale, string> = { ro: 'de confirmat', en: 'to confirm' }

/**
 * Tags a figure on the page (`data-fact`, read by `check:figures`) and, while the site is
 * not indexable, shows a "to confirm" marker next to any value Agrinvest has not approved.
 */
export function FactMark({
  figure,
  locale,
  quiet,
}: {
  figure?: Figure
  locale: Locale
  /** Tag only, no visible marker: a shared marker is shown once nearby (e.g. above a list). */
  quiet?: boolean
}) {
  const status = figure?.status ?? 'missing'
  const open = status !== 'confirmed'
  return (
    <span data-fact={figure?.key} data-fact-status={status}>
      {open && !quiet && !SITE_INDEXABLE && (
        <span className="ml-1.5 inline-block rounded-sm bg-warning-soft px-1.5 align-middle text-caption font-medium text-warning">
          {markerText[locale]}
        </span>
      )}
    </span>
  )
}

/** A figures register value in running text: `<Fact k="S1" locale="ro" />` → `17`. */
export async function Fact({ k, locale }: { k: string; locale: Locale }) {
  const figure = (await getFigures(locale))[k]
  return (
    <>
      {figure?.value ?? `[${k}]`}
      <FactMark figure={figure} locale={locale} />
    </>
  )
}
