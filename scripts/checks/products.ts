/**
 * Reports the completeness of the product enrichment files (`data/products`) against the 72
 * imported products: what is filled, what is a named gap, what is unconfirmed, which data has no
 * source, and which protection products have a missing or expired registration.
 *
 *   npm run check:products
 *
 * Errors (broken rules, unknown references, missing files for imported products when
 * `--strict-files` is given) always fail. Unconfirmed data is a warning, and turns into a failure
 * for every `pilot` product once SITE_INDEXABLE=true: nothing launches unconfirmed.
 */
import { loadProductFiles, loadTargets } from '../products/apply'
import { auditProduct, type Audit } from '../products/audit'
import { loadHubFiles } from '../products/hubs'
import { planProducts } from '../import/woo-plan'

const strictIndex = process.env.SITE_INDEXABLE === 'true'
const strictFiles = process.argv.includes('--strict-files')

const plan = planProducts()
const files = new Map(loadProductFiles().map((f) => [f.slug, f]))
const ctx = {
  brands: new Set(loadHubFiles().brands.map((b) => b.slug as string)),
  targets: new Set(loadTargets().map((t) => t.slug)),
  today: new Date(),
}

const audits: Audit[] = []
const without: string[] = []
let errors = 0
for (const p of plan) {
  const file = files.get(p.slug)
  if (!file) {
    without.push(p.slug)
    continue
  }
  audits.push(auditProduct(file, file.productType ?? p.productType, ctx))
}
for (const slug of files.keys())
  if (!plan.some((p) => p.slug === slug)) {
    console.log(`ERROR  ${slug}: a file with no imported product`)
    errors++
  }

for (const a of audits) {
  console.log(`\n${a.slug}`)
  console.log(`  filled:  ${a.filled.join(', ')}`)
  if (a.gaps.length) console.log(`  gaps:    ${a.gaps.join(', ')}`)
  if (a.missingSources.length) console.log(`  NO SOURCE for: ${a.missingSources.join(', ')}`)
  for (const flag of a.flags) console.log(`  FLAG    ${flag}`)
  for (const e of a.errors) console.log(`  ERROR   ${e}`)
  errors += a.errors.length + a.missingSources.length
}

const pilots = audits.length + without.length
console.log(
  `\n${audits.length} of ${plan.length} products enriched, ${without.length} without a file, ` +
    `${audits.filter((a) => a.flags.length).length} flagged, ${errors} error(s).`,
)
console.log(
  `Every product is "to-confirm" on technical data, doses and price until Agrinvest confirms it` +
    `${strictIndex ? '.' : ' (warning only until SITE_INDEXABLE=true)'}`,
)
if (without.length && strictFiles) console.log(`Without a file: ${without.join(', ')}`)
let fail = errors > 0
if (strictFiles && without.length) fail = true
if (strictIndex && pilots > 0) {
  console.log(`FAIL: SITE_INDEXABLE=true but ${pilots} product(s) are still "pilot" (unconfirmed).`)
  fail = true
}
process.exit(fail ? 1 : 0)
