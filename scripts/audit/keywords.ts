/**
 * Builds the keyword map from the keyword research in the 12-month plan
 * (../src/data/plan.ts in the proposal app, read-only) and assigns every keyword
 * a target URL in the new information architecture (docs/ROADMAP.md).
 * Output: docs/audit/keyword-map.csv
 *
 *   npm run audit:keywords
 *
 * The plan file lives outside this repo, so it is loaded at runtime (pass another path as
 * the first argument if needed) and its shape is declared here.
 */
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { auditDir, rel, root, writeCsv } from './lib'

type Kw = {
  kw: string
  intent: string
  vol: string
  diff: string
  pot: string
  page: string
  prio: number
}
type Audience = { name: { en: string }; clusters: { name: { en: string }; rows: Kw[] }[] }

const planPath = path.resolve(process.argv[2] ?? path.join(root, '../src/data/plan.ts'))
const { audiences } = (await import(pathToFileURL(planPath).href)) as { audiences: Audience[] }

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\[[^\]]*\]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const CROPS: [RegExp, string][] = [
  [/gr[aâ]u/i, 'grau'],
  [/porumb|corn/i, 'porumb'],
  [/floarea|sunflower/i, 'floarea-soarelui'],
  [/rapi[țţt]|rapeseed/i, 'rapita'],
  [/\borz|barley/i, 'orz'],
]
const crop = (kw: string) => CROPS.find(([re]) => re.test(kw))?.[1]

// Categories of the current shop (docs/audit/products-summary.csv); slugs stay provisional until Phase 3.
const SHOP_CATEGORIES: [RegExp, string][] = [
  [/erbicid/i, 'erbicide'],
  [/fungicid/i, 'fungicide'],
  [/insecticid/i, 'insecticide'],
  [/tratament s[aă]m[aâ]n[țţt]/i, 'tratament-samanta'],
  [/foliar/i, 'fertilizanti-foliare'],
]
// Seed crops the current shop stocks (wheat, barley, rapeseed, chickpea).
const STOCKED_SEED_CROPS = ['grau', 'orz', 'rapita']

/** Target URL on the new site for one keyword, plus a note when the rule needs a human look. */
function target(row: Kw): { url: string; note: string } {
  const { kw, page } = row
  const c = crop(kw)

  // Prices
  if (/la hectar/i.test(kw))
    return {
      url: `/ghiduri/${c ?? 'cereale'}/${slugify(kw)}`,
      note: 'article slug provisional (Phase 6 brief)',
    }
  if (page === '/piata/preturi') return { url: c ? `/preturi/${c}` : '/preturi', note: '' }
  if (page === '/piata' || page === '/en/market')
    return {
      url: page === '/en/market' ? '/en/market' : '/preturi',
      note: 'served by the weekly market note (Phase 5) linked from here',
    }
  if (/sc[aă]z[aă]m[aâ]nt/i.test(kw))
    return { url: '/preturi/calculator-pret-net', note: 'net-price calculator (Phase 5)' }

  // Grain
  if (page.startsWith('/cereale/[judet]'))
    return { url: '/cereale/judet/{judet}', note: 'only counties with a base' }
  if (page === '/cereale/contracte')
    return { url: '/cereale', note: 'also linked to /finantare/credit-contracte-cereale' }
  if (page.startsWith('/cereale')) return { url: page, note: '' }

  // Storage
  if (page === '/depozitare/[judet]') return { url: '/baze/{baza}', note: 'one page per silo base' }
  if (page.startsWith('/depozitare')) return { url: page, note: '' }

  // Shop
  if (page.startsWith('shop ›')) {
    if (/pre[țţt]/i.test(kw) && /[îi]ngr[aă][șş]/i.test(page))
      return {
        url: '/preturi/ingrasaminte',
        note: 'price page; product pages are the secondary target',
      }
    const category =
      SHOP_CATEGORIES.find(([re]) => re.test(kw))?.[1] ?? slugify(page.replace('shop ›', ''))
    const note = ['category slug provisional (Phase 3 taxonomy)']
    if (category === 'seminte' && c && !STOCKED_SEED_CROPS.includes(c))
      note.push(`no ${c} seed in the current shop`)
    return { url: `/magazin/${category}`, note: note.join('; ') }
  }
  if (page === 'shop') return { url: '/magazin', note: '' }

  // Diesel
  if (page === '/inputuri/motorina') return { url: '/motorina', note: '' }
  if (page === '/ghiduri/motorina')
    return { url: '/motorina/calculator-acciza', note: 'excise refund guide + calculator' }

  // Finance
  if (page === '/finantare') {
    if (/inputuri|plata la recolt/i.test(kw))
      return { url: '/finantare/inputuri-plata-la-recolta', note: '' }
    if (/capital de lucru/i.test(kw)) return { url: '/finantare/credit-productie', note: '' }
    return { url: '/finantare', note: '' }
  }
  if (page === '/ghiduri/apia')
    return /avans/i.test(kw)
      ? { url: '/finantare/subventii-apia', note: 'depends on IFN APIA-scheme confirmation' }
      : { url: '/finantare/ghiduri/plata-subventii-apia', note: '' }

  // Guides: /ghiduri/{pillar}/{keyword-slug}
  if (page.startsWith('/ghiduri/')) {
    const old = page.split('/')[2]
    const pillar = c ?? (old === 'calitate' || old === 'vanzare' ? 'vanzare' : old)
    return {
      url: `/ghiduri/${pillar}/${slugify(kw)}`,
      note: 'article slug provisional (Phase 6 brief)',
    }
  }

  // Brand, company, partners, English pages keep their planned paths.
  if (page === '/despre') return { url: '/despre', note: '' }
  return { url: page, note: '' }
}

const rows = audiences.flatMap((audience) =>
  audience.clusters.flatMap((cluster) =>
    cluster.rows.map((row) => {
      const t = target(row)
      return {
        keyword: row.kw,
        language: row.page.startsWith('/en') ? 'en' : 'ro',
        audience: audience.name.en,
        cluster: cluster.name.en,
        intent: row.intent,
        volumeTier: row.vol,
        difficulty: row.diff,
        potential: row.pot,
        priority: row.prio,
        plannerVolume: '',
        targetUrl: t.url,
        planPage: row.page,
        note: t.note,
      }
    }),
  ),
)

const csv = path.join(auditDir, 'keyword-map.csv')
await writeCsv(csv, rows)
console.log(
  `wrote ${rel(csv)}: ${rows.length} keywords, ${new Set(rows.map((r) => r.targetUrl)).size} target URLs`,
)
