import { Fragment } from 'react'

import type { Locale } from '@/i18n/config'
import type { Figures } from '@/lib/content/globals'

import { FactMark } from './Fact'

/** `{{KEY}}` in content text refers to a figures register value (e.g. `{{C8}}`). */
const FACT = /\{\{([A-Z][A-Za-z0-9.]*)\}\}/g

export const hasFacts = (text: string) => text.includes('{{')

/** Keys referenced in a text. */
export const factKeys = (text: string): string[] => [...text.matchAll(FACT)].map((m) => m[1])

/**
 * Plain text with every `{{KEY}}` replaced by its value, for metadata and JSON-LD.
 * `confirmed` is false when any referenced value is not confirmed (or missing), so callers
 * can leave such text out of structured data.
 */
export function resolveFacts(text: string, figures: Figures) {
  let confirmed = true
  const resolved = text.replace(FACT, (_, key: string) => {
    const figure = figures[key]
    if (figure?.status !== 'confirmed') confirmed = false
    return figure?.value ?? key
  })
  return { text: resolved, confirmed }
}

/**
 * Renders content text with its register facts: each `{{KEY}}` becomes the value, tagged for
 * `check:figures` and marked "to confirm" while the site is in preview.
 */
export function FactText({
  text,
  figures,
  locale,
}: {
  text: string
  figures: Figures
  locale: Locale
}) {
  if (!hasFacts(text)) return <>{text}</>
  const parts = text.split(FACT)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 0 ? (
          <Fragment key={i}>{part}</Fragment>
        ) : (
          <Fragment key={i}>
            {figures[part]?.value ?? `[${part}]`}
            <FactMark figure={figures[part]} locale={locale} />
          </Fragment>
        ),
      )}
    </>
  )
}

/**
 * FAQ items for FAQPage JSON-LD: facts resolved to plain text, and any answer that relies on
 * an unconfirmed value left out (structured data states a fact only once it is confirmed).
 */
export function schemaFaq(
  items: { question: string; answer: string }[] | null | undefined,
  figures: Figures,
) {
  return (items ?? []).flatMap((item) => {
    const question = resolveFacts(item.question, figures)
    const answer = resolveFacts(item.answer, figures)
    return question.confirmed && answer.confirmed
      ? [{ question: question.text, answer: answer.text }]
      : []
  })
}
