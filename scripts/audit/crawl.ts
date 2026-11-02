/**
 * Crawls the sitemaps of the old sites and records the SEO state of every URL.
 * Output: docs/audit/content-inventory.csv (+ data/raw/crawl.json with full detail).
 *
 *   npm run audit:crawl
 */
import path from 'node:path'

import * as cheerio from 'cheerio'

import { auditDir, get, pool, rawDir, rel, writeCsv, writeJson } from './lib'

const SITES = [
  { site: 'agrinvest.ro', sitemap: 'https://agrinvest.ro/sitemap_index.xml' },
  { site: 'agrinvestshop.ro', sitemap: 'https://agrinvestshop.ro/sitemap.xml' },
]

type Entry = { site: string; url: string; sitemap: string; lastmod: string }

async function readSitemap(site: string, url: string, seen = new Set<string>()): Promise<Entry[]> {
  if (seen.has(url)) return []
  seen.add(url)
  const res = await get(url, { redirect: 'follow' })
  if (!res.ok) {
    console.warn(`sitemap ${url} → ${res.status}`)
    return []
  }
  const $ = cheerio.load(await res.text(), { xml: true })
  const children = $('sitemapindex > sitemap > loc')
    .map((_, el) => $(el).text().trim())
    .get()
  if (children.length) {
    const nested = await Promise.all(children.map((child) => readSitemap(site, child, seen)))
    return nested.flat()
  }
  return $('urlset > url')
    .map((_, el) => ({
      site,
      url: $(el).find('loc').first().text().trim(),
      sitemap: path.basename(new URL(url).pathname),
      lastmod: $(el).find('lastmod').first().text().trim(),
    }))
    .get()
}

// Theme demo content: Latin placeholder text and the shop theme's demo portfolio/blog.
const LATIN_PLACEHOLDER =
  /\b(lorem|ipsum|dolor|nullam|mauris|aliquam|curabitur|suspendisse|quisque|proin|vestibulum|integer sodales)\b/i
const DEMO_PATH = /\/portfolio\/|reinterprets|bookshelf/i

function classify(entry: Entry, title: string, description = ''): string {
  const { pathname } = new URL(entry.url)
  if (DEMO_PATH.test(pathname) || LATIN_PLACEHOLDER.test(`${title} ${description}`))
    return 'junk-demo'
  if (entry.site === 'agrinvestshop.ro') {
    if (pathname.startsWith('/shop/') && pathname.split('/').filter(Boolean).length >= 3)
      return 'product'
    if (pathname.startsWith('/categorie/')) return 'category'
  }
  if (/product|produs/i.test(entry.sitemap)) return 'product'
  if (/post/i.test(entry.sitemap)) return 'post'
  if (/categ|tag/i.test(entry.sitemap)) return 'taxonomy'
  return 'page'
}

/** Every schema.org @type declared in the page's JSON-LD blocks ("INVALID" for unparseable blocks). */
function jsonLd($: cheerio.CheerioAPI): string[] {
  const types: string[] = []
  const visit = (node: unknown) => {
    if (Array.isArray(node)) node.forEach(visit)
    else if (node && typeof node === 'object') {
      const t = (node as Record<string, unknown>)['@type']
      if (t) types.push(...(Array.isArray(t) ? t : [t]).map(String))
      Object.values(node).forEach(visit)
    }
  }
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      visit(JSON.parse($(el).text()))
    } catch {
      types.push('INVALID')
    }
  })
  return types
}

async function audit(entry: Entry) {
  const base = { ...entry, status: 0, location: '', type: '', title: '', metaDescription: '' }
  try {
    const res = await get(entry.url)
    const location = res.headers.get('location') ?? ''
    if (res.status !== 200) {
      return { ...base, status: res.status, location, type: classify(entry, '') }
    }
    const html = await res.text()
    const $ = cheerio.load(html)
    const jsonLdTypes = jsonLd($)
    $('script, style, noscript').remove()
    const title = $('title').first().text().trim()
    const metaDescription = $('meta[name="description"]').attr('content')?.trim() ?? ''
    const h1s = $('h1')
      .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
      .get()
    const words = $('main, article, .entry-content, body')
      .first()
      .text()
      .split(/\s+/)
      .filter(Boolean).length
    return {
      ...base,
      status: res.status,
      type: classify(entry, title, metaDescription),
      title,
      titleLength: title.length,
      metaDescription,
      h1Count: h1s.length,
      h1: h1s.join(' | '),
      canonical: $('link[rel="canonical"]').attr('href') ?? '',
      lang: $('html').attr('lang') ?? '',
      hreflang: $('link[rel="alternate"][hreflang]')
        .map((_, el) => $(el).attr('hreflang'))
        .get()
        .join(' '),
      robots: $('meta[name="robots"]').attr('content') ?? '',
      jsonLd: [...new Set(jsonLdTypes)].join(' '),
      wordCount: words,
      htmlKb: Math.round(html.length / 1024),
    }
  } catch (error) {
    return { ...base, status: -1, location: String(error), type: classify(entry, '') }
  }
}

const entries = (await Promise.all(SITES.map((s) => readSitemap(s.site, s.sitemap)))).flat()
const unique = [...new Map(entries.map((e) => [e.url, e])).values()]
console.log(`${unique.length} URLs in sitemaps`)

const rows = await pool(unique, 2, 400, async (entry, i) => {
  const row = await audit(entry)
  if ((i + 1) % 20 === 0) console.log(`  ${i + 1}/${unique.length}`)
  return row
})

const columns = [
  'site',
  'url',
  'status',
  'location',
  'type',
  'title',
  'titleLength',
  'metaDescription',
  'h1Count',
  'h1',
  'canonical',
  'lang',
  'hreflang',
  'robots',
  'jsonLd',
  'wordCount',
  'htmlKb',
  'lastmod',
  'sitemap',
] as const
const csvRows = rows.map((r) =>
  Object.fromEntries(columns.map((c) => [c, (r as Record<string, unknown>)[c] ?? ''])),
)

const csv = path.join(auditDir, 'content-inventory.csv')
await writeCsv(csv, csvRows)
await writeJson(path.join(rawDir, 'crawl.json'), rows)
console.log(`wrote ${rel(csv)}`)
