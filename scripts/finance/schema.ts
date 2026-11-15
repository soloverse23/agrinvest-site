/**
 * Shape of the reviewed finance files: `data/finance/products/{key}.json`,
 * `data/finance/guides/{key}.json`, `data/finance/questions/{key}.json` and
 * `data/finance/hub.json`.
 *
 * What the shape enforces: every section exists in both languages, and a file can never say a
 * page is reviewed or approved. Only the IFN and its lawyer do that, in the admin. Text is
 * Markdown; facts about Agrinvest are `{{KEY}}`, never typed.
 */
import { z } from 'zod'

import { borrowerKinds, documentAudiences, guaranteeKinds } from '../../src/lib/finance/options'
import { questionTopics } from '../../src/lib/finance/topics'

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

/**
 * The hub's title band and SEO. Its sections (need tiles, finder, steps, popular questions)
 * are code since Phase 7g (`FinanceHubPage`), so the CMS page keeps no blocks or FAQ.
 */
const hubText = z.strictObject({
  title: text,
  summary: text,
  seo: seoText,
})

export const hubFile = z.strictObject({
  text: z.strictObject({ ro: hubText, en: hubText }),
})
export type HubFile = z.infer<typeof hubFile>

const questionText = z.strictObject({
  /** The question as a farmer types it. */
  title: text,
  slug: key,
  /** Two or three sentences that answer on their own. Plain text with `{{KEY}}` facts. */
  answer: text,
  /** What changes the answer from one farm to another. */
  factors: z.array(text).min(2).max(6),
  /** Optional Markdown: an example or a short table. */
  practice: text.optional(),
  seo: seoText,
})

export const questionFile = z.strictObject({
  key,
  topic: z.enum(questionTopics),
  order: z.number().int().default(100),
  popular: z.boolean().default(false),
  /** The matching credit's key. */
  product: key,
  /** The library guide that explains the topic at length, by key. */
  guide: key.optional(),
  related: z.array(key).max(6).default([]),
  sources: z.array(sourceRow).min(1),
  text: z.strictObject({ ro: questionText, en: questionText }),
})
export type QuestionFile = z.infer<typeof questionFile>
