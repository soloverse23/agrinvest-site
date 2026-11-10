/**
 * Internal links of the knowledge hub (Phase 6 exit: "internal links are verified by a script").
 *
 *   npm run build && npm start   # in another terminal
 *   npm run check:articles [-- http://localhost:3100]
 *
 * Errors (exit 1):
 * - a guide or news piece links to a page that does not answer 200 (no redirects either);
 * - a guide does not link to its pillar page or to at least one money page (shop, prices,
 *   grain, storage, finance, diesel, bases);
 * - a pillar page misses one of its guides, or the hub misses a live pillar.
 * Report: the `/ghiduri/*` targets of the keyword map that are live, and those still to write.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import * as cheerio from 'cheerio'

import { fetchText, sitemapUrls } from './lib/site-crawl'
import { sections } from '../../src/i18n/routes'

const base = (process.argv[2] ?? 'http://localhost:3100').replace(/\/$/, '')
const errors: string[] = []
const status = new Map<string, number>()

async function statusOf(path: string) {
  if (!status.has(path)) status.set(path, (await fetchText(`${base}${path}`)).status)
  return status.get(path) as number
}

function links(html: string): string[] {
  const $ = cheerio.load(html)
  const out = new Set<string>()
  // Only the page body: header and footer are checked by check:seo.
  $('main a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? ''
    if (!href.startsWith('/') || href.startsWith('//')) return
    const path = href.split('#')[0].split('?')[0]
    if (path && !path.startsWith('/_next') && !path.startsWith('/api/')) out.add(path)
  })
  return [...out]
}

const money = [
  ...Object.values(sections.shop),
  ...Object.values(sections.prices),
  ...Object.values(sections.crops),
  ...Object.values(sections.finance),
  ...Object.values(sections.diesel),
  ...Object.values(sections.bases),
  '/depozitare',
  '/storage',
].flatMap((p) => [p, `/en${p}`])
const isMoney = (path: string) => money.some((m) => path === m || path.startsWith(`${m}/`))

const guidesRo = sections.guides.ro
const guidesEn = `/en${sections.guides.en}`
const depth = (path: string) => {
  const root = path.startsWith(guidesEn)
    ? guidesEn
    : path.startsWith(`${guidesRo}/`) || path === guidesRo
      ? guidesRo
      : null
  return root === null ? -1 : path.slice(root.length).split('/').filter(Boolean).length
}
const newsArticle = (path: string) =>
  [sections.news.ro, `/en${sections.news.en}`].some(
    (p) => path.startsWith(`${p}/`) && path.slice(p.length + 1).length > 0,
  )

const urls = (await sitemapUrls(base)).map((u) => new URL(u).pathname)
const hubs = urls.filter((p) => depth(p) === 0)
const pillars = urls.filter((p) => depth(p) === 1)
const guides = urls.filter((p) => depth(p) === 2)
const news = urls.filter(newsArticle)

const html = new Map<string, string>()
for (const path of [...hubs, ...pillars, ...guides, ...news]) {
  const page = await fetchText(`${base}${path}`)
  status.set(path, page.status)
  if (page.status !== 200) errors.push(`${path} → ${page.status}`)
  else html.set(path, page.text)
}

for (const path of [...guides, ...news]) {
  const out = links(html.get(path) ?? '')
  for (const target of out) {
    const code = await statusOf(target)
    if (code !== 200) errors.push(`${path} links to ${target} (${code})`)
  }
  if (!guides.includes(path)) continue
  const pillar = path.split('/').slice(0, -1).join('/')
  if (!out.includes(pillar)) errors.push(`${path} does not link to its pillar ${pillar}`)
  if (!out.some(isMoney))
    errors.push(`${path} links to no shop, price, grain, storage or finance page`)
}

for (const pillar of pillars) {
  const out = links(html.get(pillar) ?? '')
  for (const g of guides.filter((g) => g.startsWith(`${pillar}/`)))
    if (!out.includes(g)) errors.push(`${pillar} does not list ${g}`)
  for (const target of out) {
    const code = await statusOf(target)
    if (code !== 200) errors.push(`${pillar} links to ${target} (${code})`)
  }
}

for (const hub of hubs) {
  const out = links(html.get(hub) ?? '')
  const prefix = hub === guidesEn ? guidesEn : guidesRo
  for (const p of pillars.filter((p) => p.startsWith(`${prefix}/`)))
    if (!out.includes(p)) errors.push(`${hub} does not link to ${p}`)
}

// Keyword-map targets under /ghiduri: live or still to write.
const csv = readFileSync(resolve('docs/audit/keyword-map.csv'), 'utf8').split('\n').slice(1)
const targets = [
  ...new Set(
    csv
      .map((line) => line.split(',')[10])
      .filter((u) => u?.startsWith(`${guidesRo}/`) || u?.startsWith(`${guidesEn}/`)),
  ),
]
const live = targets.filter((t) => guides.includes(t))

console.log(
  `Guides: ${hubs.length} hubs, ${pillars.length} pillars, ${guides.length} guides, ${news.length} news pieces; ${status.size} URLs checked.`,
)
console.log(`Keyword map: ${live.length} of ${targets.length} guide targets are live.`)
for (const t of targets.filter((t) => !live.includes(t))) console.log(`  to write: ${t}`)
if (errors.length) {
  console.error(`\n${errors.length} error(s):`)
  for (const e of errors) console.error(`  ${e}`)
  process.exit(1)
}
console.log('No errors.')
