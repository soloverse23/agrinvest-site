/**
 * Lists every figures register value shown on the site that Agrinvest has not confirmed.
 * Warns before launch; fails once SITE_INDEXABLE=true (Phase 8).
 *
 *   npm run check:figures [-- http://localhost:3100]
 */
import * as cheerio from 'cheerio'

import { crawl } from './lib/site-crawl'

const base = (process.argv[2] ?? 'http://localhost:3100').replace(/\/$/, '')
const origin = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? base).origin
const strict = process.env.SITE_INDEXABLE === 'true'

const open = new Map<string, { status: string; pages: Set<string> }>()
for (const page of await crawl(base, origin)) {
  if (!page.html) continue
  const $ = cheerio.load(page.html)
  $('[data-fact-status]').each((_, el) => {
    const status = $(el).attr('data-fact-status') ?? 'missing'
    if (status === 'confirmed') return
    const key = $(el).attr('data-fact') || '(unknown key)'
    const entry = open.get(key) ?? { status, pages: new Set<string>() }
    entry.pages.add(page.url)
    open.set(key, entry)
  })
}

const keys = [...open.keys()].sort()
for (const key of keys) {
  const { status, pages } = open.get(key)!
  console.log(
    `${key.padEnd(28)} ${status.padEnd(11)} ${pages.size} page(s): ${[...pages].slice(0, 4).join(', ')}${pages.size > 4 ? ' …' : ''}`,
  )
}
console.log(
  `\n${keys.length} unconfirmed figure(s) shown on the site.${strict ? '' : ' (warning only until launch)'}`,
)
process.exit(strict && keys.length ? 1 : 0)
