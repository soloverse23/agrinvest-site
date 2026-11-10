import type {
  BreadcrumbList,
  FAQPage,
  ItemList,
  LocalBusiness,
  Organization,
  Person,
  Product,
  VideoObject,
  WebPage,
  WebSite,
  WithContext,
  Article,
  DefinedTermSet,
  LoanOrCredit,
  Dataset,
} from 'schema-dts'

import { localePath, type Locale } from '@/i18n/config'
import type { Figure } from '@/lib/content/globals'
import { absoluteUrl } from '@/lib/site'

/**
 * JSON-LD builders. Facts (identifiers, phones, addresses) come from the figures register;
 * a fact is only stated in structured data once it is confirmed, so search engines never
 * receive a value Agrinvest has not approved.
 */

type Figures = Record<string, Figure>

export const ORG_ID = `${absoluteUrl('/')}#organization`
export const IFN_ID = `${absoluteUrl('/')}#ifn`
export const WEBSITE_ID = `${absoluteUrl('/')}#website`

/** A confirmed figure's value, or undefined. */
const confirmed = (figures: Figures, key: string) =>
  figures[key]?.status === 'confirmed' ? figures[key].value : undefined

export function organization(input: {
  figures: Figures
  legalName?: string | null
  ifnLegalName?: string | null
  sameAs?: string[]
}): WithContext<Organization> {
  const { figures } = input
  const founded = confirmed(figures, 'C1')
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'Agrinvest',
    legalName: input.legalName ?? undefined,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/brand/logo-mark.svg'),
    telephone: confirmed(figures, 'C9.phone'),
    email: confirmed(figures, 'C9.email'),
    foundingDate: founded?.match(/\d{4}/)?.[0],
    sameAs: input.sameAs?.length ? input.sameAs : undefined,
    subOrganization: {
      '@type': 'FinancialService',
      '@id': IFN_ID,
      name: input.ifnLegalName ?? 'Agrinvest Credit IFN SA',
      url: absoluteUrl('/finantare'),
      taxID: confirmed(figures, 'F2.cui'),
      telephone: confirmed(figures, 'F8.phone'),
      email: confirmed(figures, 'F8.email'),
      parentOrganization: { '@id': ORG_ID },
    },
  }
}

export function website(locale: Locale, name = 'Agrinvest'): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name,
    url: absoluteUrl(localePath('/', locale)),
    inLanguage: locale,
    publisher: { '@id': ORG_ID },
  }
}

export function webPage(input: {
  url: string
  name: string
  description?: string | null
  locale: Locale
  dateModified?: string
}): WithContext<WebPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': absoluteUrl(input.url),
    url: absoluteUrl(input.url),
    name: input.name,
    description: input.description ?? undefined,
    inLanguage: input.locale,
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORG_ID },
    dateModified: input.dateModified,
  }
}

/** Home is always the first crumb. `items` are the pages below it, last = current page. */
export function breadcrumbs(
  locale: Locale,
  home: string,
  items: { name: string; url: string }[],
): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: home, url: localePath('/', locale) }, ...items].map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  }
}

export function faqPage(items: { question: string; answer: string }[]): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  }
}

const dayNames = {
  Mo: 'Monday',
  Tu: 'Tuesday',
  We: 'Wednesday',
  Th: 'Thursday',
  Fr: 'Friday',
  Sa: 'Saturday',
  Su: 'Sunday',
} as const

type BaseInput = {
  name: string
  slug: string
  locationStatus?: string | null
  contactStatus?: string | null
  address?: { street?: string | null; locality?: string | null; postalCode?: string | null } | null
  county?: { name: string } | number | null
  geo?: { lat?: number | null; lng?: number | null } | null
  phone?: string | null
  hours?: { days: (keyof typeof dayNames)[]; opens: string; closes: string }[] | null
}

/**
 * LocalBusiness for a base. Address, geo, phone and hours are stated only once their group
 * is confirmed; until then the base is described by name and parent organisation only.
 */
export function localBusiness(base: BaseInput, url: string): WithContext<LocalBusiness> {
  const located = base.locationStatus === 'confirmed'
  const reachable = base.contactStatus === 'confirmed'
  const county = typeof base.county === 'object' && base.county ? base.county.name : undefined
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${absoluteUrl(url)}#base`,
    name: `Agrinvest ${base.name}`,
    url: absoluteUrl(url),
    parentOrganization: { '@id': ORG_ID },
    address:
      located && base.address?.locality
        ? {
            '@type': 'PostalAddress',
            streetAddress: base.address.street ?? undefined,
            addressLocality: base.address.locality,
            postalCode: base.address.postalCode ?? undefined,
            addressRegion: county,
            addressCountry: 'RO',
          }
        : undefined,
    geo:
      located && base.geo?.lat != null && base.geo?.lng != null
        ? { '@type': 'GeoCoordinates', latitude: base.geo.lat, longitude: base.geo.lng }
        : undefined,
    telephone: reachable ? (base.phone ?? undefined) : undefined,
    openingHoursSpecification:
      reachable && base.hours?.length
        ? base.hours.map((h) => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: h.days.map((d) => `https://schema.org/${dayNames[d]}` as const),
            opens: h.opens,
            closes: h.closes,
          }))
        : undefined,
  }
}

export function person(input: {
  name: string
  role?: string | null
  url?: string
  sameAs?: string[]
}): WithContext<Person> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: input.name,
    jobTitle: input.role ?? undefined,
    url: input.url ? absoluteUrl(input.url) : undefined,
    worksFor: { '@id': ORG_ID },
    sameAs: input.sameAs?.length ? input.sameAs : undefined,
  }
}

export function videoObject(input: {
  youtubeId: string
  title: string
  description?: string | null
  thumbnailUrl?: string | null
  uploadDate?: string | null
  duration?: string | null
}): WithContext<VideoObject> {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: input.title,
    description: input.description ?? input.title,
    thumbnailUrl: input.thumbnailUrl ?? `https://i.ytimg.com/vi/${input.youtubeId}/hqdefault.jpg`,
    uploadDate: input.uploadDate ?? undefined,
    duration: input.duration ?? undefined,
    embedUrl: `https://www.youtube-nocookie.com/embed/${input.youtubeId}`,
    contentUrl: `https://www.youtube.com/watch?v=${input.youtubeId}`,
    publisher: { '@id': ORG_ID },
  }
}

const availability = {
  'in-stock': 'https://schema.org/InStock',
  'on-request': 'https://schema.org/PreOrder',
  'out-of-stock': 'https://schema.org/OutOfStock',
} as const

/**
 * A product. Offers state a price and stock, so they appear only for `confirmed` products;
 * pilot products publish their identity and nothing Agrinvest has not approved.
 */
export function product(input: {
  url: string
  name: string
  description: string
  image: string[]
  brand?: string | null
  category: string
  sku?: string
  variants: {
    sku: string
    price?: number | null
    stock: keyof typeof availability
  }[]
  confirmed: boolean
}): WithContext<Product> {
  const url = absoluteUrl(input.url)
  const priced = input.variants.flatMap((v) => (v.price != null ? [{ ...v, price: v.price }] : []))
  const prices = priced.map((v) => v.price)
  const offers =
    !input.confirmed || !priced.length
      ? undefined
      : priced.length === 1
        ? {
            '@type': 'Offer' as const,
            url,
            sku: priced[0].sku,
            price: priced[0].price,
            priceCurrency: 'RON',
            availability: availability[priced[0].stock],
            seller: { '@id': ORG_ID },
          }
        : {
            '@type': 'AggregateOffer' as const,
            url,
            priceCurrency: 'RON',
            lowPrice: Math.min(...prices),
            highPrice: Math.max(...prices),
            offerCount: priced.length,
          }
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: input.name,
    url,
    description: input.description,
    image: input.image.length ? input.image : undefined,
    sku: input.sku,
    category: input.category,
    brand: input.brand ? { '@type': 'Brand', name: input.brand } : undefined,
    offers,
  }
}

/** The products of a listing, in the order shown. */
export function itemList(items: { name: string; url: string }[]): WithContext<ItemList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.url),
    })),
  }
}

/** A guide. Sources are listed as citations, so an answer can be traced. */
export function article(input: {
  url: string
  headline: string
  description?: string | null
  locale: Locale
  dateModified?: string
  datePublished?: string
  authorName?: string | null
  citations?: string[]
}): WithContext<Article> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${absoluteUrl(input.url)}#article`,
    url: absoluteUrl(input.url),
    headline: input.headline,
    description: input.description ?? undefined,
    inLanguage: input.locale,
    dateModified: input.dateModified,
    datePublished: input.datePublished,
    author: input.authorName
      ? { '@type': 'Organization', name: input.authorName }
      : { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    citation: input.citations?.length ? input.citations : undefined,
  }
}

/** The glossary. */
export function definedTermSet(input: {
  url: string
  name: string
  locale: Locale
  terms: { term: string; definition: string }[]
}): WithContext<DefinedTermSet> {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${absoluteUrl(input.url)}#terms`,
    name: input.name,
    inLanguage: input.locale,
    hasDefinedTerm: input.terms.map((t) => ({
      '@type': 'DefinedTerm',
      name: t.term,
      description: t.definition,
    })),
  }
}

/** A credit product. A term or amount appears only once the IFN has confirmed it. */
export function loanOrCredit(input: {
  url: string
  name: string
  description?: string | null
  termMonths?: number | null
  amountMax?: number | null
  confirmed: boolean
}): WithContext<LoanOrCredit> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LoanOrCredit',
    '@id': `${absoluteUrl(input.url)}#product`,
    url: absoluteUrl(input.url),
    name: input.name,
    description: input.description ?? undefined,
    currency: 'RON',
    provider: { '@id': IFN_ID },
    loanTerm:
      input.confirmed && input.termMonths
        ? { '@type': 'QuantitativeValue', value: input.termMonths, unitCode: 'MON' }
        : undefined,
    amount:
      input.confirmed && input.amountMax
        ? { '@type': 'MonetaryAmount', maxValue: input.amountMax, currency: 'RON' }
        : undefined,
  }
}

/**
 * A price page's data (Phase 5.2): what it measures, the period it covers, where each series
 * comes from and under which licence. `temporalCoverage` is an ISO interval ("2025-11-10/2026-11-09").
 * Agrinvest's own prices are published by the organisation; public series name their source.
 */
export function dataset(input: {
  url: string
  name: string
  description: string
  locale: Locale
  temporalCoverage?: string
  dateModified?: string
  keywords?: string[]
  variables: string[]
  sources: { name: string; url: string; license?: string }[]
}): WithContext<Dataset> {
  const licences = [...new Set(input.sources.flatMap((s) => (s.license ? [s.license] : [])))]
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${absoluteUrl(input.url)}#dataset`,
    url: absoluteUrl(input.url),
    name: input.name,
    description: input.description,
    inLanguage: input.locale,
    creator: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    isAccessibleForFree: true,
    temporalCoverage: input.temporalCoverage,
    dateModified: input.dateModified,
    keywords: input.keywords,
    variableMeasured: input.variables,
    license: licences.length === 1 ? licences[0] : licences.length ? licences : undefined,
    isBasedOn: input.sources.map((s) => ({
      '@type': 'Dataset' as const,
      name: s.name,
      url: s.url,
      ...(s.license ? { license: s.license } : {}),
    })),
  }
}
