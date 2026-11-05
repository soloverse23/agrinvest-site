/**
 * Shape of the reviewed finance files: `data/finance/products/{key}.json`,
 * `data/finance/guides/{key}.json` and `data/finance/hub.json`.
 *
 * What the shape enforces: every section exists in both languages, and a file can never say a
 * page is reviewed or approved. Only the IFN and its lawyer do that, in the admin. Text is
 * Markdown; facts about Agrinvest are `{{KEY}}`, never typed.
 */
import { z } from 'zod'

import { borrowerKinds, documentAudiences, guaranteeKinds } from '../../src/lib/finance/options'

const text = z.string().trim().min(1)
const key = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

const faqRow = z.strictObject({ question: text, answer: text })
const seoText = z.strictObject({ title: text, description: text })

export const sourceRow = z.strictObject({ title: text, url: z.url(), retrieved: day })

const links = {
  relatedProducts: z.array(key).default([]),
  relatedGuides: z.array(key).default([]),
  sources: z.array(sourceRow).default([]),
}

const productText = z.strictObject({
  title: text,
  slug: key,
  answer: text,
  fits: text,
  notFor: text,
  finances: text,
  repayment: text,
  example: z.strictObject({
    title: text,
    scenario: text,
    rows: z.array(z.strictObject({ label: text, value: text })).min(1),
  }),
  risks: text,
  guarantees: z.array(z.strictObject({ kind: z.enum(guaranteeKinds), note: text })),
  documents: z.array(z.strictObject({ audience: z.enum(documentAudiences), label: text })),
  process: z.array(z.strictObject({ title: text, body: text })),
  faq: z.array(faqRow),
  seo: seoText,
})

export const productFile = z.strictObject({
  key,
  parent: key.optional(),
  order: z.number().int().default(100),
  harvestCalendar: z.boolean().default(true),
  borrowers: z.array(z.enum(borrowerKinds)).default([]),
  /** The name of a person in the admin. */
  advisor: text.optional(),
  ...links,
  text: z.strictObject({ ro: productText, en: productText }),
})
export type ProductFile = z.infer<typeof productFile>

const guideText = z.strictObject({
  title: text,
  slug: key,
  summary: text,
  body: text,
  terms: z.array(z.strictObject({ term: text, definition: text })).default([]),
  faq: z.array(faqRow).default([]),
  seo: seoText,
})

export const guideFile = z.strictObject({
  key,
  section: z.enum(['finantare', 'pagina-finantare']).default('finantare'),
  author: text.optional(),
  reviewer: text.optional(),
  ...links,
  text: z.strictObject({ ro: guideText, en: guideText }),
})
export type GuideFile = z.infer<typeof guideFile>

const hubText = z.strictObject({
  title: text,
  summary: text,
  /** Page blocks. `content` of a `richText` block is Markdown. */
  layout: z.array(z.looseObject({ blockType: text })).min(1),
  faq: z.array(faqRow).default([]),
  seo: seoText,
})

export const hubFile = z.strictObject({
  text: z.strictObject({ ro: hubText, en: hubText }),
})
export type HubFile = z.infer<typeof hubFile>
