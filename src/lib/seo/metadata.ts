import type { Metadata } from 'next'

import { defaultLocale, type Locale } from '@/i18n/config'
import type { Alternates } from '@/lib/content/pages'
import { absoluteUrl, SITE_INDEXABLE } from '@/lib/site'
import type { Media } from '@/payload-types'

const ogLocale: Record<Locale, string> = { ro: 'ro_RO', en: 'en_GB' }

export type MetadataInput = {
  locale: Locale
  /** Full title tag; used as is. */
  seoTitle?: string | null
  /** Page title; the site's title template is applied. */
  title: string
  titleTemplate?: string | null
  siteName?: string | null
  description?: string | null
  /** Public URL of this page in each language it exists in (includes the current one). */
  alternates: Alternates
  image?: Media | number | null
  noindex?: boolean | null
  type?: 'website' | 'article'
}

/**
 * Title, description, canonical, hreflang (+ x-default → the Romanian page), Open Graph and
 * Twitter tags for an indexable page. Robots stay noindex until `SITE_INDEXABLE` (Phase 8).
 */
export function buildMetadata(input: MetadataInput): Metadata {
  const {
    locale,
    alternates,
    titleTemplate = '%s · Agrinvest',
    siteName = 'Agrinvest',
    description,
  } = input
  const title = input.seoTitle || (titleTemplate ?? '%s').replace('%s', input.title) || input.title
  const self = alternates[locale]
  const canonical = self ? absoluteUrl(self) : undefined

  const languages: Record<string, string> = {}
  const pairs = Object.entries(alternates) as [Locale, string][]
  if (pairs.length > 1) {
    for (const [l, href] of pairs) languages[l] = absoluteUrl(href)
    const fallback = alternates[defaultLocale]
    if (fallback) languages['x-default'] = absoluteUrl(fallback)
  }

  const image =
    input.image && typeof input.image === 'object' && input.image.url
      ? [
          {
            url: absoluteUrl(input.image.url),
            alt: input.image.alt,
            width: input.image.width ?? undefined,
            height: input.image.height ?? undefined,
          },
        ]
      : undefined
  const indexable = SITE_INDEXABLE && !input.noindex

  return {
    title: { absolute: title },
    description: description ?? undefined,
    alternates: { canonical, languages: Object.keys(languages).length ? languages : undefined },
    robots: { index: indexable, follow: indexable },
    openGraph: {
      type: input.type ?? 'website',
      url: canonical,
      siteName: siteName ?? undefined,
      title,
      description: description ?? undefined,
      locale: ogLocale[locale],
      alternateLocale: pairs.filter(([l]) => l !== locale).map(([l]) => ogLocale[l]),
      images: image,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description: description ?? undefined,
    },
  }
}
