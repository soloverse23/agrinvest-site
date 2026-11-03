import { localePath, type Locale } from '@/i18n/config'
import { listBases, listCrops } from '@/lib/content/locations'
import { alternatesOf, listPages, type Alternates } from '@/lib/content/pages'
import { absoluteUrl } from '@/lib/site'

/**
 * Segmented sitemaps. Later phases add segments (products, articles…) here.
 * Every URL carries its hreflang alternates when it has a pair.
 */
export type SitemapEntry = { url: string; lastModified?: string; alternates: Alternates }

export const segments = {
  pages: async (): Promise<SitemapEntry[]> =>
    (await listPages())
      .filter((p) => !p.noindex)
      .flatMap((p) => {
        const alternates = alternatesOf(p)
        return Object.values(alternates).map((url) => ({
          url,
          lastModified: p.updatedAt,
          alternates,
        }))
      }),
  bases: async (): Promise<SitemapEntry[]> =>
    (await listBases('ro'))
      .filter((b) => !b.seo?.noindex)
      .map((b) => {
        const url = localePath(`/baze/${b.slug}`, 'ro')
        return { url, lastModified: b.updatedAt, alternates: { ro: url } }
      }),
  crops: async (): Promise<SitemapEntry[]> =>
    (await listCrops('ro'))
      .filter((c) => !c.seo?.noindex)
      .map((c) => {
        const url = localePath(`/cereale/${c.slug}`, 'ro')
        return { url, lastModified: c.updatedAt, alternates: { ro: url } }
      }),
} satisfies Record<string, () => Promise<SitemapEntry[]>>

export type SegmentName = keyof typeof segments
export const isSegment = (name: string): name is SegmentName => name in segments

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function urlsetXml(entries: SitemapEntry[]): string {
  const urls = entries.map((e) => {
    const pairs = Object.entries(e.alternates) as [Locale, string][]
    const links =
      pairs.length > 1
        ? [
            ...pairs.map(
              ([l, href]) =>
                `<xhtml:link rel="alternate" hreflang="${l}" href="${escape(absoluteUrl(href))}"/>`,
            ),
            ...(e.alternates.ro
              ? [
                  `<xhtml:link rel="alternate" hreflang="x-default" href="${escape(absoluteUrl(e.alternates.ro))}"/>`,
                ]
              : []),
          ]
        : []
    return [
      '<url>',
      `<loc>${escape(absoluteUrl(e.url))}</loc>`,
      e.lastModified ? `<lastmod>${e.lastModified.slice(0, 10)}</lastmod>` : '',
      ...links,
      '</url>',
    ].join('')
  })
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
}

export function indexXml(names: string[]): string {
  const items = names.map(
    (n) => `<sitemap><loc>${escape(absoluteUrl(`/sitemaps/${n}.xml`))}</loc></sitemap>`,
  )
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join('\n')}\n</sitemapindex>\n`
}

export const xmlResponse = (body: string) =>
  new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
