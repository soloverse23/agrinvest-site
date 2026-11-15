import { COUNTIES } from '@ds/patterns/map/counties'

/**
 * The agriculture lexicon behind the news ranking (decision 0011). Pure: no I/O.
 *
 * Text is matched without diacritics and case, at the start of a word, so a stem such as
 * `subventi` matches "subvenții" and "subvenție". A stem ending in `$` must be the whole word
 * ("afir$" is the agency, not "afirmă"). Each topic has a weight from 0.5 to 3; generic farming (0.5) alone never makes a story important.
 * `anchor` topics are clearly about farming; a general outlet's item is kept only when it
 * matches at least one anchor (so "import de mașini" does not pass on "import").
 */

export type NewsTopic =
  'preturi' | 'subventii' | 'vreme' | 'inputuri' | 'boli' | 'comert' | 'finantare' | 'ferma'

type TopicDef = { weight: number; anchor: boolean; stems: string[] }

export const topics: Record<NewsTopic, TopicDef> = {
  preturi: {
    weight: 3,
    anchor: true,
    stems: [
      'grau',
      'porumb',
      'floarea-soarelui',
      'floarea soarelui',
      'rapit',
      'orz',
      'ovaz',
      'soia$',
      'cereal',
      'recolt',
      'bursa de cereale',
      'oleaginoase',
      'wheat',
      'corn$',
      'maize',
      'grain',
      'barley',
      'sunflower',
      'rapeseed',
      'soybean',
      'oilseed',
      'harvest',
      'crop',
    ],
  },
  subventii: {
    weight: 3,
    anchor: true,
    stems: [
      'apia$',
      'afir$',
      'subventi',
      'plata in avans',
      'platile in avans',
      'plati directe',
      'politica agricola comuna',
      'planul national strategic',
      'pndr$',
      'ajutor de stat',
      'sprijin financiar',
      'schema de sprijin',
      'fonduri europene pentru agricultura',
      'subsid',
      'common agricultural policy',
      'farm aid',
      'direct payments',
    ],
  },
  vreme: {
    weight: 3,
    anchor: false,
    stems: [
      'secet',
      'inghet',
      'grindin',
      'inundat',
      'calamit',
      'despagubir',
      'canicul',
      'vreme extrema',
      'stare de alerta',
      'drought',
      'frost',
      'hail',
      'flood',
      'heatwave',
      'heat wave',
    ],
  },
  inputuri: {
    weight: 2,
    anchor: false,
    stems: [
      'ingrasamint',
      'ingrasamant',
      'uree',
      'azotat',
      'fertiliz',
      'pesticid',
      'erbicid',
      'fungicid',
      'insecticid',
      'samant',
      'seminte',
      'motorin',
      'fertilizer',
      'fertiliser',
      'urea',
      'potash',
      'pesticide',
      'herbicide',
      'seed',
      'diesel',
    ],
  },
  boli: {
    weight: 2,
    anchor: true,
    stems: [
      'pesta porcina',
      'gripa aviara',
      'febra aftoas',
      'ansvsa$',
      'boala animal',
      'daunator',
      'swine fever',
      'bird flu',
      'avian influenza',
      'foot-and-mouth',
      'livestock disease',
    ],
  },
  comert: {
    weight: 2,
    anchor: false,
    stems: [
      'import',
      'export',
      'mercosur',
      'tarif',
      'taxe vamale',
      'embargo',
      'coridor',
      'tariff',
      'trade deal',
      'trade$',
    ],
  },
  finantare: {
    weight: 2,
    anchor: false,
    stems: [
      'credit agricol',
      'credite pentru fermieri',
      'imprumut',
      'dobanz',
      'garantii',
      'leasing',
      'farm loan',
      'farm credit',
    ],
  },
  ferma: {
    weight: 0.5,
    anchor: true,
    stems: [
      'fermier',
      'agricol',
      'agricultur',
      'ferma',
      'ferme',
      'zootehn',
      'irigat',
      'teren agricol',
      'madr$',
      'ministerul agriculturii',
      'agroaliment',
      'legum',
      'fruct',
      'lapte',
      'carne$',
      'carnii',
      'carnea',
      'farmer',
      'farming',
      'agricultur',
      'agri-food',
      'agrifood',
      'livestock',
      'irrigation',
      'dairy',
    ],
  },
}

export const topicKeys = Object.keys(topics) as NewsTopic[]

/** Lowercase, no diacritics (ș ț ă â î and the cedilla forms), single spaces. */
export function normalise(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[„”"“'’`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** One regex per topic: any stem at the start of a word. */
const stemPattern = (stem: string) =>
  stem.endsWith('$') ? `${escape(stem.slice(0, -1))}(?![a-z])` : escape(stem)

const topicPatterns = Object.fromEntries(
  topicKeys.map((k) => [
    k,
    new RegExp(`(?:^|[^a-z0-9])(?:${topics[k].stems.map(stemPattern).join('|')})`),
  ]),
) as Record<NewsTopic, RegExp>

/**
 * Items that match the lexicon but are not news for farmers: market-data and quote pages that
 * the Reuters search returns, horoscopes, betting.
 */
const excluded = /(?:stock price|share price|latest news\b|\(\w+\.\w+\)|horoscop|pariuri|loto)/

/** True when an item should never be kept, whatever it matches. */
export const isExcluded = (text: string) => excluded.test(normalise(text))

/** Prefixes that place a story in Romania: the country and its farm institutions. */
const romaniaStems = ['romani', 'romane', 'romanesc', 'bucurest', 'constanta']
/**
 * County names as whole words. "Alba" is left out: in Romanian it is also "white", and a
 * story about Alba still names Romania or an institution.
 */
const countyWords = COUNTIES.map((c) => normalise(c.name)).filter((n) => n !== 'alba')
const romaniaPattern = new RegExp(
  `(?:^|[^a-z0-9])(?:(?:${romaniaStems.map(escape).join('|')})|(?:roman|madr|apia|afir|ansvsa|${countyWords
    .map(escape)
    .join('|')})(?![a-z]))`,
)
/**
 * The wider area that moves Romanian prices: the EU, the Black Sea and the neighbours.
 * "eu" counts only in English: in Romanian it means "I".
 */
const regionWords = (lang: 'ro' | 'en') =>
  new RegExp(
    `(?:^|[^a-z0-9])(?:${[
      'ue',
      'uniunea europeana',
      'comisia europeana',
      'bruxelles',
      'marea neagra',
      'black sea',
      'european',
      'ucrain',
      'ukrain',
      'bulgari',
      'moldov',
      'serbi',
      'ungari',
      'hungar',
      ...(lang === 'en' ? ['eu'] : []),
    ]
      .map(escape)
      .join('|')})`,
  )
const regionPattern = { ro: regionWords('ro'), en: regionWords('en') }

export type Classification = {
  topics: NewsTopic[]
  /** The highest weight among the matched topics; 0 when none matched. */
  topicWeight: number
  /** True when at least one matched topic is about farming itself. */
  anchored: boolean
  /** 1.5 Romania, 1.2 EU / Black Sea region, 1 elsewhere. */
  relevance: number
}

/** Classifies a headline (and the excerpt we may show) against the lexicon. */
export function classify(text: string, lang: 'ro' | 'en' = 'ro'): Classification {
  const t = ` ${normalise(text)} `
  const found = topicKeys.filter((k) => topicPatterns[k].test(t))
  const rom = romaniaPattern.test(t)
  return {
    topics: found,
    topicWeight: found.reduce((m, k) => Math.max(m, topics[k].weight), 0),
    anchored: found.some((k) => topics[k].anchor),
    relevance: rom ? 1.5 : regionPattern[lang].test(t) ? 1.2 : 1,
  }
}
