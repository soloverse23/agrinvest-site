/**
 * Exports every product from the old shop's public WooCommerce Store API.
 * Outputs:
 *   docs/audit/products-raw.json     full API records (source for the Phase 3 pilot import)
 *   docs/audit/products-summary.csv  one row per product: price, stock, and which data is present or missing
 *   data/raw/media/products/…        product images (gitignored)
 *
 *   npm run audit:products
 */
import fs from 'node:fs/promises'
import path from 'node:path'

import * as cheerio from 'cheerio'

import { auditDir, get, pool, rawDir, rel, writeCsv, writeJson } from './lib'

const API = 'https://agrinvestshop.ro/wp-json/wc/store/v1/products'

type StoreProduct = {
  id: number
  name: string
  slug: string
  permalink: string
  sku: string
  short_description: string
  description: string
  prices: { price: string; regular_price: string; sale_price: string; currency_minor_unit: number }
  is_in_stock: boolean
  categories: { name: string; slug: string }[]
  tags: { name: string }[]
  attributes: { name: string; terms: { name: string }[] }[]
  images: { id: number; src: string; alt: string }[]
}

async function fetchAll(): Promise<StoreProduct[]> {
  const all: StoreProduct[] = []
  for (let page = 1; ; page++) {
    const res = await get(`${API}?per_page=100&page=${page}`, { redirect: 'follow' })
    if (!res.ok) throw new Error(`${API} page ${page} → ${res.status}`)
    const batch = (await res.json()) as StoreProduct[]
    all.push(...batch)
    const totalPages = Number(res.headers.get('x-wp-totalpages') ?? 1)
    if (page >= totalPages || batch.length === 0) return all
  }
}

const text = (html: string) => cheerio.load(html).text().replace(/\s+/g, ' ').trim()
const money = (value: string, minor: number) => (value ? Number(value) / 10 ** minor : '')

/** Signals of structured agronomic data hidden in the free-text description. */
function detect(description: string) {
  const plain = text(description)
  return {
    hasDoseInfo: /l\/ha|kg\/ha|ml\/ha|doz/i.test(plain),
    hasActiveIngredient: /g\/l|g\/kg|substan[țţt][ăa] activ/i.test(plain),
    hasTable: /<table/i.test(description),
    hasPdf: /\.pdf/i.test(description),
    hasBbch: /bbch/i.test(plain),
    hasWaitingPeriod: /pauz[ăa]|timp de a[șş]teptare/i.test(plain),
  }
}

const products = await fetchAll()
console.log(`${products.length} products`)

await writeJson(path.join(auditDir, 'products-raw.json'), products)

const rows = products.map((p) => {
  const minor = p.prices.currency_minor_unit
  const signals = detect(p.description)
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    url: p.permalink,
    categories: p.categories.map((c) => c.name).join(' | '),
    price: money(p.prices.price, minor),
    regularPrice: money(p.prices.regular_price, minor),
    salePrice:
      p.prices.sale_price !== p.prices.regular_price ? money(p.prices.sale_price, minor) : '',
    inStock: p.is_in_stock,
    sku: p.sku,
    attributes: p.attributes
      .map((a) => `${a.name}: ${a.terms.map((t) => t.name).join('/')}`)
      .join(' | '),
    images: p.images.length,
    imagesWithAlt: p.images.filter((i) => i.alt.trim()).length,
    shortDescriptionWords: text(p.short_description).split(' ').filter(Boolean).length,
    descriptionWords: text(p.description).split(' ').filter(Boolean).length,
    ...signals,
  }
})
const csv = path.join(auditDir, 'products-summary.csv')
await writeCsv(csv, rows)
console.log(`wrote ${rel(csv)}`)

const mediaDir = path.join(rawDir, 'media/products')
await fs.mkdir(mediaDir, { recursive: true })
const images = products.flatMap((p) =>
  p.images.map((img, i) => ({
    src: img.src,
    file: `${p.slug}-${i + 1}${path.extname(new URL(img.src).pathname)}`,
  })),
)
let saved = 0
await pool(images, 3, 150, async ({ src, file }) => {
  const target = path.join(mediaDir, file)
  try {
    await fs.access(target)
    return
  } catch {}
  const res = await get(src, { redirect: 'follow' })
  if (!res.ok) return console.warn(`image ${src} → ${res.status}`)
  await fs.writeFile(target, Buffer.from(await res.arrayBuffer()))
  saved++
})
console.log(`${images.length} images (${saved} downloaded) in ${rel(mediaDir)}`)
