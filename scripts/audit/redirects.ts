/**
 * Drafts the redirect map from the content inventory: every old URL on both domains
 * gets a target on the new site (301) or is retired (410).
 * Inputs:  docs/audit/content-inventory.csv, docs/audit/products-raw.json
 * Output:  docs/audit/redirect-map.csv (status "draft" until reviewed)
 *
 *   npm run audit:redirects
 */
import fs from 'node:fs/promises'
import path from 'node:path'

import * as cheerio from 'cheerio'
import { parse } from 'csv-parse/sync'

import { auditDir, rel, writeCsv } from './lib'

type Inventory = { site: string; url: string; type: string; title: string }
type Product = { slug: string; name: string; categories: { slug: string }[] }

const inventory: Inventory[] = parse(
  await fs.readFile(path.join(auditDir, 'content-inventory.csv')),
  { columns: true, bom: true },
)
const products: Product[] = (
  JSON.parse(await fs.readFile(path.join(auditDir, 'products-raw.json'), 'utf8')) as Product[]
).map((p) => ({ ...p, name: cheerio.load(p.name).text() })) // names carry HTML entities

/** New URL of a shop product. Category slugs are provisional until the Phase 3 taxonomy. */
const productUrl = (p: Product) => `/magazin/${p.categories[0]?.slug ?? 'produse'}/${p.slug}`

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/ - agrinvest.*$/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/** Best shop product for an old agrinvest.ro product page, by name tokens. */
function matchProduct(title: string): Product | undefined {
  const wanted = normalize(title).split(' ').filter(Boolean)
  if (!wanted.length) return undefined
  let best: { p: Product; score: number } | undefined
  for (const p of products) {
    const have = new Set(normalize(p.name).split(' '))
    const score = wanted.filter((t) => have.has(t)).length / wanted.length
    if (score > (best?.score ?? 0)) best = { p, score }
  }
  return best && best.score >= 0.99 ? best.p : undefined
}

// Fixed pages, keyed by "site + pathname". Targets follow docs/ROADMAP.md (information architecture).
const FIXED: Record<string, string | 410> = {
  'agrinvest.ro/': '/',
  'agrinvest.ro/despre-noi/': '/despre',
  'agrinvest.ro/contact/': '/contact',
  'agrinvest.ro/birouri-pipera/': '/contact',
  'agrinvest.ro/servicii-ifn/': '/finantare',
  'agrinvest.ro/video/': '/video',
  'agrinvest.ro/trading-cereale/': '/cereale',
  'agrinvest.ro/silozuri/': '/depozitare',
  'agrinvest.ro/transport-si-logistica/': '/logistica',
  'agrinvest.ro/flota-proprie/': '/logistica',
  'agrinvest.ro/agrinvest-golden-relationships/': '/golden-relationship',
  'agrinvest.ro/produse-si-servicii/': '/magazin',
  'agrinvest.ro/produse-conventionale/': '/magazin',
  'agrinvest.ro/produse-bio/': '/magazin/agricultura-bio',
  'agrinvest.ro/seminte/': '/magazin/seminte',
  'agrinvest.ro/locations.kml': '/depozitare',
  'agrinvest.ro/politica-de-confidentialitate/': '/confidentialitate',
  'agrinvest.ro/politica-de-utilizare-a-cookie-urilor/': '/cookie-uri',
  'agrinvest.ro/politica-de-rezolvare-a-reclamatiilor-utilizatorilor-finali/': '/reclamatii',
  'agrinvestshop.ro/': '/magazin',
  'agrinvestshop.ro/shop/': '/magazin',
  'agrinvestshop.ro/blog/': '/ghiduri',
  'agrinvestshop.ro/reduceri/': '/magazin/oferte',
  'agrinvestshop.ro/suport/': '/magazin/cum-comand',
  'agrinvestshop.ro/cum-comand-produse/': '/magazin/cum-comand',
  'agrinvestshop.ro/refund_returns/': '/retur',
  'agrinvestshop.ro/termeni-si-conditii/': '/termeni-si-conditii',
  'agrinvestshop.ro/cookies/': '/cookie-uri',
  'agrinvestshop.ro/politica-de-utilizare-a-cookie-urilor/': '/cookie-uri',
  'agrinvestshop.ro/politica-de-confidentialitate/': '/confidentialitate',
  'agrinvestshop.ro/politica-de-rezolvare-a-reclamatiilor-utilizatorilor-finali/': '/reclamatii',
  'agrinvestshop.ro/contact/': '/contact',
  'agrinvestshop.ro/despre-noi/': '/despre',
  'agrinvestshop.ro/favorite/': 410,
  'agrinvestshop.ro/compara/': 410,
  'agrinvestshop.ro/starea-platii/': 410,
  'agrinvestshop.ro/collar-brings-back-coffee-brewing-ritual/': 410,
}

type Row = {
  site: string
  oldUrl: string
  status: 301 | 410
  newUrl: string
  rule: string
  note: string
}
const rows: Row[] = []
const seen = new Set<string>()
const add = (row: Row) => {
  if (seen.has(row.oldUrl)) return
  seen.add(row.oldUrl)
  rows.push(row)
}

for (const item of inventory) {
  const { pathname } = new URL(item.url)
  const key = `${item.site}${pathname}`
  const base = { site: item.site, oldUrl: item.url }
  const fixed = FIXED[key]

  if (fixed !== undefined) {
    add(
      fixed === 410
        ? { ...base, status: 410, newUrl: '', rule: 'retired', note: 'utility or demo page' }
        : { ...base, status: 301, newUrl: fixed, rule: 'fixed', note: '' },
    )
  } else if (item.type === 'junk-demo') {
    add({
      ...base,
      status: 410,
      newUrl: '',
      rule: 'junk',
      note: 'theme demo / placeholder content',
    })
  } else if (item.site === 'agrinvestshop.ro' && item.type === 'product') {
    const p = products.find((x) => pathname.replace(/\/$/, '').endsWith(`/${x.slug}`))
    add(
      p
        ? { ...base, status: 301, newUrl: productUrl(p), rule: 'product', note: '' }
        : { ...base, status: 301, newUrl: '/magazin', rule: 'product-unmatched', note: 'REVIEW' },
    )
  } else if (item.site === 'agrinvest.ro' && item.type === 'taxonomy') {
    add({
      ...base,
      status: 410,
      newUrl: '',
      rule: 'junk',
      note: 'blog category of placeholder posts',
    })
  } else if (item.site === 'agrinvest.ro') {
    // Remaining agrinvest.ro pages are product pages duplicating the shop.
    const p = matchProduct(item.title)
    add(
      p
        ? {
            ...base,
            status: 301,
            newUrl: productUrl(p),
            rule: 'duplicate-product',
            note: `→ ${p.name}`,
          }
        : {
            ...base,
            status: 301,
            newUrl: '/magazin',
            rule: 'duplicate-product-unmatched',
            note: 'REVIEW: not in shop, candidate for the Phase 3 catalogue',
          },
    )
  } else {
    add({ ...base, status: 301, newUrl: '/magazin', rule: 'fallback', note: 'REVIEW' })
  }
}

// Shop category archives are not in the sitemap but are linked and indexed.
for (const slug of new Set(products.flatMap((p) => p.categories.map((c) => c.slug)))) {
  add({
    site: 'agrinvestshop.ro',
    oldUrl: `https://agrinvestshop.ro/categorie/${slug}/`,
    status: 301,
    newUrl: `/magazin/${slug}`,
    rule: 'category',
    note: 'not in sitemap; slug provisional',
  })
}

const csv = path.join(auditDir, 'redirect-map.csv')
await writeCsv(
  csv,
  rows.map((r) => ({ ...r, reviewStatus: 'draft' })),
)
const review = rows.filter((r) => r.note.startsWith('REVIEW')).length
console.log(
  `wrote ${rel(csv)}: ${rows.length} URLs, ${rows.filter((r) => r.status === 410).length} retired, ${review} to review`,
)
