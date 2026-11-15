/**
 * Public data sources for the farmer tools, as checked on 2026-11-10 (decision 0008, phase 5
 * doc, "Source check"). Each entry records what the terms allow; jobs, pages and `check:tools`
 * read it from here. A source that is not listed here is not used: BRM, Agrimedia, Agro TV
 * and the ANM warnings feed were dropped because their terms forbid reuse without written
 * consent.
 */

export type MarketSource =
  'eu-agrifood' | 'eu-fertiliser' | 'eu-oil-bulletin' | 'eia-brent' | 'ecb' | 'world-bank'

export type SourceInfo = {
  name: string
  /** Page a visitor can follow to check the number. */
  url: string
  licence: string
  licenceUrl: string
  /** Attribution line shown with the data. */
  attribution: { ro: string; en: string }
  /** How often new data appears, in days. `check:tools` adds a margin. */
  cadenceDays: number
}

const euLicence = {
  licence: 'CC BY 4.0 (Commission Decision 2011/833/EU)',
  licenceUrl: 'https://commission.europa.eu/legal-notice_en',
}

export const marketSources: Record<MarketSource, SourceInfo> = {
  'eu-agrifood': {
    name: 'European Commission, Agri-food data portal',
    url: 'https://agridata.ec.europa.eu/extensions/DashboardCereals/ExtCerealsPrice.html',
    ...euLicence,
    attribution: {
      ro: 'Sursa: Comisia Europeană, portalul de date agroalimentare',
      en: 'Source: European Commission, Agri-food data portal',
    },
    cadenceDays: 7,
  },
  'eu-fertiliser': {
    name: 'European Commission, Agri-food data portal (fertiliser prices)',
    url: 'https://agridata.ec.europa.eu/extensions/DashboardFertiliser/FertiliserPrices.html',
    ...euLicence,
    attribution: {
      ro: 'Sursa: Comisia Europeană, prețurile îngrășămintelor în UE',
      en: 'Source: European Commission, EU fertiliser prices',
    },
    cadenceDays: 31,
  },
  'eu-oil-bulletin': {
    name: 'European Commission, Weekly Oil Bulletin',
    url: 'https://energy.ec.europa.eu/data-and-analysis/weekly-oil-bulletin_en',
    ...euLicence,
    attribution: {
      ro: 'Sursa: Comisia Europeană, Weekly Oil Bulletin',
      en: 'Source: European Commission, Weekly Oil Bulletin',
    },
    cadenceDays: 7,
  },
  // Phase 7f (checked 2026-11-15). EIA data is U.S. public domain; FRED serves the same
  // series as CSV without a key and asks to be cited with the original source.
  'eia-brent': {
    name: 'U.S. Energy Information Administration, Brent spot price (via FRED)',
    url: 'https://fred.stlouisfed.org/series/DCOILBRENTEU',
    licence: 'Public domain (U.S. EIA)',
    licenceUrl: 'https://www.eia.gov/about/copyrights_reuse.php',
    attribution: {
      ro: 'Sursa: U.S. Energy Information Administration, prin FRED (Federal Reserve Bank of St. Louis)',
      en: 'Source: U.S. Energy Information Administration, via FRED (Federal Reserve Bank of St. Louis)',
    },
    cadenceDays: 7,
  },
  ecb: {
    name: 'European Central Bank, euro foreign exchange reference rates',
    url: 'https://data.ecb.europa.eu/data/datasets/EXR',
    licence: 'Reuse permitted with the source cited (ECB)',
    licenceUrl: 'https://www.ecb.europa.eu/services/using-our-site/disclaimer/html/index.en.html',
    attribution: {
      ro: 'Sursa: Banca Centrală Europeană, cursuri de referință',
      en: 'Source: European Central Bank, euro reference rates',
    },
    cadenceDays: 4,
  },
  'world-bank': {
    name: 'World Bank, Commodity Price Data (The Pink Sheet)',
    url: 'https://www.worldbank.org/en/research/commodity-markets',
    licence: 'CC BY 4.0',
    licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
    attribution: {
      ro: 'Sursa: Banca Mondială, Commodity Price Data (Pink Sheet)',
      en: 'Source: World Bank, Commodity Price Data (Pink Sheet)',
    },
    cadenceDays: 45,
  },
}

export const marketSourceKeys = Object.keys(marketSources) as MarketSource[]

/** Endpoints. The agri-food API moved to `api.tech.ec.europa.eu` (old host redirects). */
export const endpoints = {
  agrifood: 'https://api.tech.ec.europa.eu/agrifood/api',
  /** Stable document id; the file behind it is replaced each week (filename date is stale). */
  oilBulletin:
    'https://energy.ec.europa.eu/document/download/264c2d0f-f161-4ea3-a777-78faae59bea0_en',
  /** "Price developments 2005 onwards" (about 4.5 MB): used once to fill the diesel history. */
  oilBulletinHistory:
    'https://energy.ec.europa.eu/document/download/906e60ca-8b6a-44e7-8589-652854d2fd3f_en',
  /** Daily Brent as CSV, `&cosd=YYYY-MM-DD` for the first day. */
  fredBrent: 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=DCOILBRENTEU',
  /** EUR/RON and EUR/USD, `&startPeriod=YYYY-MM-DD`. */
  ecbRates: 'https://data-api.ecb.europa.eu/service/data/EXR/D.RON+USD.EUR.SP00.A?format=csvdata',
  /**
   * The World Bank's commodity page. The monthly workbook's address changes with each release,
   * so the job reads the current link (`CMO-Historical-Data-Monthly.xlsx`) from this page.
   */
  worldBankPage: 'https://www.worldbank.org/en/research/commodity-markets',
} as const

import type { IntermediateKey } from '@/lib/news/certs'

export type NewsSource =
  | 'revista-ferma'
  | 'agrointel'
  | 'reuters'
  | 'zf'
  | 'mediafax'
  | 'g4media'
  | 'profit'
  | 'madr'
  | 'ec-agri'

/**
 * How a source is treated by the ranking (`src/lib/news/score.ts`): official bodies and the
 * wire weigh most, then the farm press, then general outlets.
 */
export type NewsSourceKind = 'official' | 'wire' | 'farm' | 'general'

export type NewsSourceInfo = {
  name: string
  site: string
  feed: string
  terms: string
  /**
   * Longest feed excerpt we may show, in characters; 0 means headline, date and link only.
   * Each limit comes from the publisher's terms (decision 0011, source check).
   */
  excerptMax: number
  kind: NewsSourceKind
  /**
   * General outlets (and the Reuters search) publish everything; only items that match the
   * agriculture lexicon are kept. Farm and official sources keep every item.
   */
  filter: boolean
  /** Hosts the item links may point to (subdomains included). Google News links to news.google.com. */
  linkHosts: string[]
  /** Item language, for grouping (stories are grouped within one language). */
  lang: 'ro' | 'en'
  /** Owner exception to decision 0008 (Reuters through Google News). */
  exception?: string
  /** A public intermediate certificate the server forgets to send (`src/lib/news/certs.ts`). */
  extraCa?: IntermediateKey
}

const googleNewsQuery =
  'site:reuters.com (wheat OR corn OR grain OR fertilizer OR farmers OR "Black Sea" OR Romania) when:3d'

/** Every feed the site reads, as checked on 2026-11-15 (decision 0011). */
export const newsSources: Record<NewsSource, NewsSourceInfo> = {
  'revista-ferma': {
    name: 'Revista Ferma',
    site: 'https://revista-ferma.ro',
    feed: 'https://revista-ferma.ro/feed/',
    terms: 'https://revista-ferma.ro/termene-si-conditii/',
    excerptMax: 0,
    kind: 'farm',
    filter: false,
    linkHosts: ['revista-ferma.ro'],
    lang: 'ro',
  },
  agrointel: {
    name: 'Agrointel',
    site: 'https://agrointel.ro',
    feed: 'https://agrointel.ro/feed',
    terms: 'https://agrointel.ro/conditii',
    excerptMax: 500,
    kind: 'farm',
    filter: false,
    linkHosts: ['agrointel.ro'],
    lang: 'ro',
  },
  reuters: {
    name: 'Reuters',
    site: 'https://www.reuters.com',
    feed: `https://news.google.com/rss/search?q=${encodeURIComponent(googleNewsQuery)}&hl=en-US&gl=US&ceid=US:en`,
    terms: 'https://www.reuters.com/info-pages/terms-of-use/',
    excerptMax: 0,
    kind: 'wire',
    filter: true,
    linkHosts: ['news.google.com', 'reuters.com'],
    lang: 'en',
    exception: 'Google News feed, headline and link only (owner exception, decision 0011)',
  },
  zf: {
    name: 'Ziarul Financiar',
    site: 'https://www.zf.ro',
    feed: 'https://www.zf.ro/rss',
    terms: 'https://www.zf.ro/termeni-si-conditii',
    excerptMax: 250,
    kind: 'general',
    filter: true,
    linkHosts: ['zf.ro'],
    lang: 'ro',
  },
  mediafax: {
    name: 'Mediafax',
    site: 'https://www.mediafax.ro',
    feed: 'https://www.mediafax.ro/rss',
    terms: 'https://www.mediafax.ro/termeni-si-conditii',
    excerptMax: 250,
    kind: 'general',
    filter: true,
    linkHosts: ['mediafax.ro'],
    lang: 'ro',
  },
  g4media: {
    name: 'G4Media',
    site: 'https://www.g4media.ro',
    feed: 'https://www.g4media.ro/feed',
    terms: 'https://www.g4media.ro/about',
    excerptMax: 250,
    kind: 'general',
    filter: true,
    linkHosts: ['g4media.ro'],
    lang: 'ro',
  },
  profit: {
    name: 'Profit.ro',
    site: 'https://www.profit.ro',
    feed: 'https://www.profit.ro/rss',
    terms: 'https://www.profit.ro',
    excerptMax: 0,
    kind: 'general',
    filter: true,
    linkHosts: ['profit.ro'],
    lang: 'ro',
  },
  madr: {
    name: 'MADR',
    site: 'https://www.madr.ro',
    feed: 'https://www.madr.ro/comunicare.feed?type=rss',
    terms: 'https://www.madr.ro',
    excerptMax: 300,
    kind: 'official',
    filter: false,
    linkHosts: ['madr.ro'],
    lang: 'ro',
    extraCa: 'gogetssl-rsa-dv-ssl-ca-2',
  },
  'ec-agri': {
    name: 'Comisia Europeană (DG AGRI)',
    site: 'https://agriculture.ec.europa.eu',
    feed: 'https://ec.europa.eu/newsroom/agri/feed?item_type_id=&lang=en&orderby=item_date',
    terms: 'https://commission.europa.eu/legal-notice_en',
    excerptMax: 300,
    kind: 'official',
    filter: true,
    linkHosts: ['europa.eu'],
    lang: 'en',
  },
}

export const newsSourceKeys = Object.keys(newsSources) as NewsSource[]

/** Sent with every fetch, so the publishers can see who reads their feeds. */
export const fetchHeaders = {
  'user-agent': 'AgrinvestSite/1.0 (+https://agrinvest.ro)',
  accept: '*/*',
}
