import type { Locale } from '@/i18n/config'

/**
 * Topics of the finance questions (`/finantare/intrebari`), in the order a farmer meets them:
 * can I borrow, what it costs, what I pledge, how I repay, how it goes, then the special cases.
 * The questions index groups by these; a question picks one.
 */
export const questionTopics = [
  'eligibility',
  'cost',
  'guarantees',
  'repayment',
  'process',
  'apia',
  'investment',
  'grain',
  'hardship',
  'ifn',
] as const
export type QuestionTopic = (typeof questionTopics)[number]

export const questionTopicLabels: Record<QuestionTopic, Record<Locale, string>> = {
  eligibility: { ro: 'Cine poate lua credit', en: 'Who can borrow' },
  cost: { ro: 'Cât costă', en: 'What it costs' },
  guarantees: { ro: 'Garanții', en: 'Guarantees' },
  repayment: { ro: 'Rambursare', en: 'Repayment' },
  process: { ro: 'Cererea și banii', en: 'Applying and getting the money' },
  apia: { ro: 'APIA și subvenții', en: 'APIA and subsidies' },
  investment: { ro: 'Utilaje și investiții', en: 'Machinery and investment' },
  grain: { ro: 'Cereale, stocuri și inputuri', en: 'Grain, stock and inputs' },
  hardship: { ro: 'Când e greu', en: 'When things are hard' },
  ifn: { ro: 'Despre IFN', en: 'About the IFN' },
}

export const isQuestionTopic = (value: unknown): value is QuestionTopic =>
  (questionTopics as readonly unknown[]).includes(value)
