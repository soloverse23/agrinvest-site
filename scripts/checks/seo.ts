/**
 * SEO checker for the running site (ported from HamidHosseini `scripts/check/seo.ts`, which
 * read a static `dist/`; this one crawls the server from its sitemaps and links).
 *
 *   npm run build && npm start   # in another terminal
 *   npm run check:seo [-- http://localhost:3100]
 *
 * Errors (exit 1): status, H1 count, title/description length and uniqueness, canonical,
 * reciprocal hreflang + x-default, html lang, JSON-LD validity and expected types, broken
 * internal links, sitemap entries that are not 200 or not canonical.
 * Warnings: links through redirects, keyword-cluster linking (docs/audit/keyword-map.csv).
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import * as cheerio from 'cheerio'

import { crawl, type CrawledPage } from './lib/site-crawl'

const base = (process.argv[2] ?? 'http://localhost:3100').replace(/\/$/, '')
const origin = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? base).origin
const indexable = process.env.SITE_INDEXABLE === 'true'

const errors = new Map<string, string[]>()
const warnings = new Map<string, string[]>()
const report = (bag: Map<string, string[]>, kind: string, msg: string) =>
  bag.set(kind, [...(bag.get(kind) ?? []), msg])
const error = (kind: string, msg: string) => report(errors, kind, msg)
const warn = (kind: string, msg: string) => report(warnings, kind, msg)

const abs = (path: string) => (path === '/' ? `${origin}/` : `${origin}${path}`)
/** Next.js writes the home URL without its trailing slash; both forms are the same URL. */
const same = (a: string, b: string) => a.replace(/\/$/, '') === b.replace(/\/$/, '')
const lists = (hrefs: Iterable<string>, path: string) => [...hrefs].some((h) => same(h, abs(path)))
const pathOf = (url: string) => {
  const u = new URL(url)
  return u.origin === origin ? decodeURIComponent(u.pathname) || '/' : null
}

/** JSON-LD types every template must carry. */
function expectedTypes(path: string): string[] {
  if (path === '/' || path === '/en') return ['Organization', 'WebSite', 'WebPage']
  if (path.startsWith('/baze/')) return ['LocalBusiness', 'BreadcrumbList']
  return ['WebPage', 'BreadcrumbList']
}

function collectTypes(node: unknown, out: Set<string>) {
  if (Array.isArray(node)) return node.forEach((n) => collectTypes(n, out))
  if (!node || typeof node !== 'object') return
  const obj = node as Record<string, unknown>
  const type = obj['@type']
  if (typeof type === 'string') out.add(type)
  if (Array.isArray(type)) type.forEach((t) => typeof t === 'string' && out.add(t))
  if (obj['@graph']) collectTypes(obj['@graph'], out)
}

type Parsed = {
  page: CrawledPage
  title: string
  description: string
  canonical?: string
  hreflang: Map<string, string>
}

const pages = await crawl(base, origin)
const byPath = new Map(pages.map((p) => [p.url, p]))
const parsed = new Map<string, Parsed>()

for (const page of pages) {
  if (page.status === 308 || page.status === 307 || page.status === 301) {
    warn('redirecting link', `${page.url} → ${page.location}`)
    continue
  }
  if (page.status !== 200 || !page.html) {
    error('broken page', `${page.url} → ${page.status}`)
    continue
  }
  const $ = cheerio.load(page.html)
  const p = page.url

  const h1 = $('h1').length
  if (h1 !== 1) error('h1 count', `${p}: ${h1}`)
  else if (!$('h1').text().trim()) error('h1 empty', p)

  const lang = $('html').attr('lang')
  const expectedLang = p === '/en' || p.startsWith('/en/') ? 'en' : 'ro'
  if (lang !== expectedLang) error('html lang', `${p}: "${lang}" (expected ${expectedLang})`)

  const title = $('head title').first().text().trim()
  if (title.length < 30 || title.length > 60)
    error('title length', `${p}: ${title.length} "${title}"`)
  const description = $('meta[name="description"]').attr('content')?.trim() ?? ''
  if (description.length < 70 || description.length > 160)
    error('description length', `${p}: ${description.length}`)

  const canonical = $('link[rel="canonical"]').attr('href')
  if (!canonical) error('canonical', `${p}: missing`)
  else if (pathOf(canonical) === null) error('canonical', `${p}: off-origin ${canonical}`)
  else if (!same(canonical, abs(p))) error('canonical', `${p}: points to ${canonical}`)

  const hreflang = new Map<string, string>()
  $('link[rel="alternate"][hreflang], link[rel="alternate"][hrefLang]').each((_, el) => {
    const l = $(el).attr('hreflang') ?? $(el).attr('hrefLang')
    const href = $(el).attr('href')
    if (l && href) hreflang.set(l, href)
  })
  if (hreflang.size) {
    if (!hreflang.has('x-default')) error('hreflang', `${p}: no x-default`)
    if (!lists(hreflang.values(), p)) error('hreflang', `${p}: does not list itself`)
  }

  const types = new Set<string>()
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      collectTypes(JSON.parse($(el).text()), types)
    } catch {
      error('json-ld', `${p}: invalid JSON`)
    }
  })
  for (const t of expectedTypes(p)) if (!types.has(t)) error('json-ld', `${p}: missing ${t}`)

  const robots = $('meta[name="robots"]').attr('content') ?? ''
  if (indexable && page.inSitemap && /noindex/.test(robots))
    error('sitemap', `${p}: in the sitemap but noindex`)
  if (!indexable && !/noindex/.test(robots)) error('robots', `${p}: indexable before launch`)

  parsed.set(p, { page, title, description, canonical, hreflang })
}

// Reciprocal hreflang: every alternate must exist and point back.
for (const [p, info] of parsed) {
  for (const [l, href] of info.hreflang) {
    if (l === 'x-default') continue
    const other = pathOf(href)
    const target = other ? parsed.get(other) : undefined
    if (!target) error('hreflang', `${p}: ${l} → ${href} not found`)
    else if (!lists(target.hreflang.values(), p))
      error('hreflang', `${p}: ${l} → ${href} does not link back`)
  }
}

// Uniqueness.
for (const field of ['title', 'description'] as const) {
  const seen = new Map<string, string>()
  for (const [p, info] of parsed) {
    const value = info[field]
    if (!value) continue
    if (seen.has(value)) error(`duplicate ${field}`, `${p} = ${seen.get(value)}`)
    else seen.set(value, p)
  }
}

// Sitemap entries must be live pages.
for (const page of pages)
  if (page.inSitemap && page.status !== 200) error('sitemap', `${page.url} → ${page.status}`)

// Keyword clusters: a built target page links to at least one other page of its cluster.
const csv = readFileSync(resolve('docs/audit/keyword-map.csv'), 'utf8').replace(/^﻿/, '')
const [header, ...rows] = csv.trim().split('\n')
const cols = header.split(',')
const ci = cols.indexOf('cluster')
const ti = cols.indexOf('targetUrl')
const clusters = new Map<string, Set<string>>()
for (const row of rows) {
  const cells = row.split(',')
  const target = cells[ti]
  if (!target) continue
  clusters.set(cells[ci], (clusters.get(cells[ci]) ?? new Set()).add(target))
}
let built = 0
let planned = 0
for (const [cluster, targets] of clusters) {
  for (const target of targets) {
    planned++
    const info = parsed.get(target)
    if (!info) continue
    built++
    const $ = cheerio.load(info.page.html as string)
    const links = new Set(
      $('a[href]')
        .map((_, el) => $(el).attr('href'))
        .get(),
    )
    const peers = [...targets].filter((t) => t !== target && byPath.get(t)?.status === 200)
    if (peers.length && !peers.some((t) => links.has(t) || links.has(abs(t))))
      warn('keyword cluster', `${target} (${cluster}) links to none of: ${peers.join(', ')}`)
  }
}

// Report.
let count = 0
for (const [label, bag] of [
  ['ERROR', errors],
  ['warning', warnings],
] as const) {
  for (const [kind, list] of bag) {
    if (label === 'ERROR') count += list.length
    console.log(`\n${label} ${kind}: ${list.length}`)
    for (const msg of list.slice(0, 15)) console.log(`  ${msg}`)
    if (list.length > 15) console.log(`  … and ${list.length - 15} more`)
  }
}
console.log(
  `\nChecked ${parsed.size} pages (${pages.filter((p) => p.inSitemap).length} in sitemaps) on ${base}, canonical origin ${origin}: ${count} error(s).`,
)
console.log(`Keyword map: ${built} of ${planned} target URLs are built.`)
process.exit(count ? 1 : 0)
