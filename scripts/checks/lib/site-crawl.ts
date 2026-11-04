/**
 * Crawls the running site (`next start` or `next dev`) from its sitemap index and follows
 * internal links. Shared by `check:seo` and `check:figures`.
 */
import * as cheerio from 'cheerio'

export type CrawledPage = {
  url: string
  status: number
  location?: string
  html?: string
  inSitemap: boolean
}

const PRIVATE = /^\/(admin|api|next)(\/|$)/
const NOT_PAGES = /\.(xml|txt|json|svg|png|jpe?g|webp|avif|ico|pdf|mp4|webm|css|js)$/i

export async function fetchText(url: string) {
  const res = await fetch(url, { redirect: 'manual' })
  return {
    status: res.status,
    location: res.headers.get('location') ?? undefined,
    text: await res.text(),
  }
}

/** Every `<loc>` in the sitemap index and its segments. */
export async function sitemapUrls(base: string): Promise<string[]> {
  const index = await fetchText(`${base}/sitemap.xml`)
  if (index.status !== 200) throw new Error(`/sitemap.xml → ${index.status}`)
  const $index = cheerio.load(index.text, { xml: true })
  const segments = $index('sitemap > loc')
    .map((_, el) => $index(el).text().trim())
    .get()
  const urls: string[] = []
  for (const segment of segments) {
    const res = await fetchText(rebase(segment, base))
    if (res.status !== 200) throw new Error(`${segment} → ${res.status}`)
    const $ = cheerio.load(res.text, { xml: true })
    urls.push(
      ...$('url > loc')
        .map((_, el) => $(el).text().trim())
        .get(),
    )
  }
  return urls
}

/** Maps an absolute URL on the site's public origin onto the crawl base. */
export function rebase(url: string, base: string): string {
  const u = new URL(url)
  return `${base}${u.pathname}${u.search}`
}

export async function crawl(base: string, origin: string, concurrency = 4): Promise<CrawledPage[]> {
  const fromSitemap = new Set((await sitemapUrls(base)).map((u) => new URL(u).pathname))
  const queue = [...new Set([...fromSitemap, '/', '/en'])]
  const seen = new Set<string>(queue)
  const pages: CrawledPage[] = []

  async function visit(path: string) {
    const res = await fetchText(`${base}${path}`)
    const page: CrawledPage = {
      url: path,
      status: res.status,
      location: res.location,
      inSitemap: fromSitemap.has(path),
    }
    if (res.status === 200) {
      page.html = res.text
      for (const href of internalLinks(res.text, origin, base)) {
        if (!seen.has(href)) {
          seen.add(href)
          queue.push(href)
        }
      }
    }
    pages.push(page)
  }

  while (queue.length) {
    await Promise.all(queue.splice(0, concurrency).map(visit))
  }
  return pages.sort((a, b) => a.url.localeCompare(b.url))
}

/** Same-site page paths linked from an HTML document (no fragments, private or file URLs). */
export function internalLinks(html: string, origin: string, base: string): string[] {
  const $ = cheerio.load(html)
  const out = new Set<string>()
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? ''
    if (/^(mailto:|tel:|#|javascript:)/.test(href)) return
    let url: URL
    try {
      url = new URL(href, `${origin}/`)
    } catch {
      return
    }
    if (url.origin !== origin && url.origin !== base) return
    const path = decodeURIComponent(url.pathname)
    if (PRIVATE.test(path) || NOT_PAGES.test(path)) return
    out.add(path)
  })
  return [...out]
}
