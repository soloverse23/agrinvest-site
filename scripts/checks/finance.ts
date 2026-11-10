/**
 * `npm run check:finance`: the finance content gate (Phase 4.6). Reads the reviewed files in
 * `data/finance` for the content rules and the database only for what the admin decides
 * (review status, register facts).
 *
 * Always fails: a near-empty page, too few FAQ on a product, a page too close to a sibling, a
 * forbidden claim, an Agrinvest rate, a page with fewer than 2 internal links.
 * Warns now, fails with SITE_INDEXABLE=true: a page not legally approved, a review older than
 * 12 months, an unconfirmed register fact on the page.
 */
import { join } from 'node:path'

import config from '@payload-config'
import { getPayload } from 'payload'

import { contentErrors, loadFinanceFiles, strings, type File } from '../finance/gate'

const strict = process.env.SITE_INDEXABLE === 'true'
const dir = join(process.cwd(), 'data/finance')

const errors: string[] = []
const warnings: string[] = []

async function reviewRules(files: File[]) {
  const payload = await getPayload({ config })
  const later = (s: string) => (strict ? errors : warnings).push(s)
  const yearAgo = new Date(Date.now() - 365 * 24 * 3600 * 1000)
  const figures = await payload.findGlobal({ slug: 'figures', depth: 0 })
  const unconfirmed = new Set(
    ((figures as { rows?: { key: string; status: string }[] }).rows ?? [])
      .filter((r) => r.status !== 'confirmed')
      .map((r) => r.key),
  )
  for (const collection of ['finance-products', 'guides'] as const) {
    // Guides also hold news and the market note (Phase 5); only finance guides need legal review.
    const where =
      collection === 'guides' ? { section: { in: ['finantare', 'pagina-finantare'] } } : undefined
    const { docs } = await payload.find({ collection, depth: 0, pagination: false, where })
    for (const doc of docs as {
      key?: string
      review?: { legalStatus?: string; reviewedAt?: string }
    }[]) {
      const at = doc.key ?? '?'
      if (doc.review?.legalStatus !== 'legal-approved') later(`${at}: not legally approved`)
      else if (!doc.review.reviewedAt || new Date(doc.review.reviewedAt) < yearAgo)
        later(`${at}: review older than 12 months`)
    }
  }
  for (const f of files) {
    const keys = new Set(
      [
        ...strings(f.text)
          .join(' ')
          .matchAll(/\{\{([A-Z][A-Za-z0-9.]*)\}\}/g),
      ].map((m) => m[1]),
    )
    const open = [...keys].filter((k) => unconfirmed.has(k))
    if (open.length) later(`${f.key}: unconfirmed fact(s) ${open.join(', ')}`)
  }
}

const files = loadFinanceFiles(dir)
errors.push(...contentErrors(files))
await reviewRules(files)

for (const w of warnings) console.log(`warning ${w}`)
for (const e of errors) console.log(`error   ${e}`)
console.log(
  `\nChecked ${files.length} finance files: ${errors.length} error(s), ${warnings.length} warning(s)` +
    `${strict ? '.' : ' (review warnings fail once SITE_INDEXABLE=true)'}`,
)
process.exit(errors.length ? 1 : 0)
