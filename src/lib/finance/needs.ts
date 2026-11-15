import type { Locale } from '@/i18n/config'

/**
 * What a farmer needs money for, in their words (Phase 7g). One map feeds the hub's need
 * tiles, the "Nu ești sigur?" finder, the consultant drawer's "Pentru ce?" choice and the
 * simulator's recommendation, so a need always leads to the same credit. Credits are named by
 * their file key (`data/finance/products`), which is the same in every language.
 */
export const needIds = [
  'season',
  'machinery',
  'irrigation',
  'storage',
  'land',
  'apia',
  'grain',
  'debts',
] as const
export type NeedId = (typeof needIds)[number]

export type NeedIcon =
  'wheat' | 'tractor' | 'drop' | 'silo' | 'field' | 'coins' | 'scale' | 'lifebuoy'

export type Need = {
  id: NeedId
  icon: NeedIcon
  /** The credit the tile leads to. */
  product: string
  /** A second credit for the same need, shown as a small link on the tile. */
  also?: string
  /** The finder's default term when the farmer gives none: a season, or an investment. */
  months: number
  label: Record<Locale, string>
  line: Record<Locale, string>
}

export const needs: Need[] = [
  {
    id: 'season',
    icon: 'wheat',
    product: 'credit-productie',
    also: 'inputuri-plata-la-recolta',
    months: 12,
    label: { ro: 'Campania agricolă', en: 'The farming season' },
    line: {
      ro: 'Semințe, îngrășăminte, motorină și lucrări, plătite după recoltă.',
      en: 'Seed, fertiliser, diesel and field work, paid after harvest.',
    },
  },
  {
    id: 'machinery',
    icon: 'tractor',
    product: 'utilaje',
    months: 60,
    label: { ro: 'Un tractor sau alt utilaj', en: 'A tractor or other machine' },
    line: {
      ro: 'Tractoare, combine și echipamente, cu rate după recoltă.',
      en: 'Tractors, combines and equipment, repaid after harvest.',
    },
  },
  {
    id: 'irrigation',
    icon: 'drop',
    product: 'irigatii',
    months: 60,
    label: { ro: 'Irigații', en: 'Irrigation' },
    line: {
      ro: 'Pompe, conducte și pivoți, ca proiect întreg.',
      en: 'Pumps, pipes and pivots, as one project.',
    },
  },
  {
    id: 'storage',
    icon: 'silo',
    product: 'depozitare',
    months: 60,
    label: { ro: 'Siloz sau depozit', en: 'A silo or store' },
    line: {
      ro: 'Spațiu propriu pentru recoltă, cu uscătoare.',
      en: 'Your own space for the harvest, dryers included.',
    },
  },
  {
    id: 'land',
    icon: 'field',
    product: 'teren-agricol',
    also: 'ferme',
    months: 96,
    label: { ro: 'Teren sau dezvoltarea fermei', en: 'Land, or growing the farm' },
    line: {
      ro: 'Teren agricol, grajduri și ferme vegetale sau zootehnice.',
      en: 'Farmland, barns, and crop or livestock farms.',
    },
  },
  {
    id: 'apia',
    icon: 'coins',
    product: 'subventii-apia',
    months: 12,
    label: { ro: 'Bani până plătește APIA', en: 'Cash until APIA pays' },
    line: {
      ro: 'Subvenția de încasat susține creditul.',
      en: 'The subsidy you are due backs the loan.',
    },
  },
  {
    id: 'grain',
    icon: 'scale',
    product: 'finantare-stocuri',
    also: 'credit-contracte-cereale',
    months: 12,
    label: { ro: 'Să nu vinzi la recoltă', en: 'Not selling at harvest' },
    line: {
      ro: 'Bani pe marfa din depozit sau pe un contract de vânzare.',
      en: 'Money on grain in store or on a sale contract.',
    },
  },
  {
    id: 'debts',
    icon: 'lifebuoy',
    product: 'restructurare',
    months: 60,
    label: { ro: 'Datorii greu de plătit', en: 'Debts that are hard to pay' },
    line: {
      ro: 'Rate mai mici, pe o perioadă mai lungă, și un plan realist.',
      en: 'Smaller instalments over longer, and a realistic plan.',
    },
  },
]

/** Credits that no tile leads to directly, shown as small links under the tiles. */
export const otherCredits = ['industrie-alimentara', 'credit-investitii'] as const

export const needById = (id: unknown): Need | undefined => needs.find((n) => n.id === id)

/** The need a credit page or question belongs to, so the drawer opens on the right choice. */
export const needOfProduct = (key: string | null | undefined): NeedId | undefined =>
  needs.find((n) => n.product === key || n.also === key)?.id
