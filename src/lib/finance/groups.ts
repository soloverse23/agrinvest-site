/**
 * How the finance section is ordered for a farmer: by need, in three groups. The hub, the
 * product pages ("other credits in this group") and the menu all read this one map, so a new
 * product is placed in one spot. Products are placed by slug; any product missing from the
 * map falls into `special` so it never disappears from the hub.
 */
export const financeGroupIds = ['season', 'invest', 'special'] as const
export type FinanceGroupId = (typeof financeGroupIds)[number]

export const financeGroupOf: Record<string, FinanceGroupId> = {
  'credit-productie': 'season',
  'inputuri-plata-la-recolta': 'season',
  'subventii-apia': 'season',
  'credit-contracte-cereale': 'season',
  'credit-investitii': 'invest',
  'finantare-stocuri': 'special',
  'industrie-alimentara': 'special',
  restructurare: 'special',
}

/** The group of a top-level product; a nested one belongs to its parent's group. */
export const groupFor = (slug: string, parentSlug?: string | null): FinanceGroupId =>
  financeGroupOf[parentSlug ?? slug] ?? 'special'

/** Order inside a group (the order of the map), then the rest in the order given. */
const rank = (slug: string) => {
  const i = Object.keys(financeGroupOf).indexOf(slug)
  return i < 0 ? 99 : i
}
export const byFinanceOrder = <T extends { slug: string }>(list: T[]): T[] =>
  [...list].sort((a, b) => rank(a.slug) - rank(b.slug))

/**
 * Guides in the order a farmer meets the questions: what a credit costs, who lends, what a
 * lender looks at, guarantees, machinery and grants, subsidies, selling, hard times, terms.
 */
const guideJourney = [
  'costul-real-al-creditului',
  'ifn-sau-banca',
  'cum-analizeaza-finantatorul-ferma',
  'fonduri-garantare',
  'credit-sau-leasing-utilaje',
  'credit-sau-grant-afir',
  'credit-adeverinta-apia',
  'plata-subventii-apia',
  'cand-vinzi-recolta',
  'insolventa-sau-restructurare',
  'glosar',
]
const guideRank = (slug: string) => {
  const i = guideJourney.indexOf(slug)
  return i < 0 ? guideJourney.length : i
}
export const byGuideJourney = <T extends { slug: string }>(list: T[]): T[] =>
  [...list].sort((a, b) => guideRank(a.slug) - guideRank(b.slug))
