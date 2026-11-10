/**
 * Public data sources for the farmer tools, as checked on 2026-11-10 (decision 0008, phase 5
 * doc, "Source check"). Each entry records what the terms allow; jobs, pages and `check:tools`
 * read it from here. A source that is not listed here is not used: BRM, Agrimedia, Agro TV
 * and the ANM warnings feed were dropped because their terms forbid reuse without written
 * consent.
 */

export type MarketSource = 'eu-agrifood' | 'eu-fertiliser' | 'eu-oil-bulletin'

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
} as const

export type NewsSource = 'revista-ferma' | 'agrointel'

export type NewsSourceInfo = {
  name: string
  site: string
  feed: string
  terms: string
  /**
   * Longest feed excerpt we may show, in characters; 0 means headline, date and link only.
   * Agrointel allows quotes up to 500 characters with an active, followed link to the original.
   * Revista Ferma's terms say nothing on reuse, so only the headline and link are shown.
   */
  excerptMax: number
}

export const newsSources: Record<NewsSource, NewsSourceInfo> = {
  'revista-ferma': {
    name: 'Revista Ferma',
    site: 'https://revista-ferma.ro',
    feed: 'https://revista-ferma.ro/feed/',
    terms: 'https://revista-ferma.ro/termene-si-conditii/',
    excerptMax: 0,
  },
  agrointel: {
    name: 'Agrointel',
    site: 'https://agrointel.ro',
    feed: 'https://agrointel.ro/feed',
    terms: 'https://agrointel.ro/conditii',
    excerptMax: 500,
  },
}

export const newsSourceKeys = Object.keys(newsSources) as NewsSource[]

/** Sent with every fetch, so the publishers can see who reads their feeds. */
export const fetchHeaders = {
  'user-agent': 'AgrinvestSite/1.0 (+https://agrinvest.ro)',
  accept: '*/*',
}
