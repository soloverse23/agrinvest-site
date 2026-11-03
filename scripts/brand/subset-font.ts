/**
 * Builds the site's web font and its @font-face rules.
 *
 * 1. `public/fonts/onest-ro-wght.woff2`: Onest (OFL, upstream variable TTF in
 *    design-system/brand/fonts-src/) cut down to the characters Romanian and English pages use,
 *    with the weight axis limited to the weights the design system uses (400–700). One file
 *    instead of Fontsource's Latin + Latin Extended pair: Romanian text needs both
 *    (ă â î ș ț live in Latin Extended), so every page fetched two fonts before its text settled.
 * 2. `src/app/(frontend)/fonts.css`: the Onest face (`font-display: optional`: used when the
 *    preloaded file arrives with the first render, never swapped in later, so text never
 *    rewraps; decision 0003) plus metric-matched fallback faces, which are what a slow first
 *    visit shows. Each fallback is a system font resized to Onest's widths and line metrics:
 *    - 'Onest Fallback': Arial (macOS, Windows) or Liberation Sans (Linux; same metrics as Arial).
 *    - 'Onest Fallback Roboto': Roboto (Android).
 *
 * Run: npm run brand:font. Needs network the first time (Roboto is cached in .cache/fonts/).
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import * as fontkit from 'fontkit'
import subsetFont from 'subset-font'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const source = path.join(root, 'design-system/brand/fonts-src/Onest[wght].ttf')
const woff2Out = path.join(root, 'public/fonts/onest-ro-wght.woff2')
const cssOut = path.join(root, 'src/app/(frontend)/fonts.css')
const cache = path.join(root, '.cache/fonts')

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i)).join('')

/** [from, to] code point ranges; the subset and the CSS unicode-range both come from here. */
const RANGES: [number, number][] = [
  [0x20, 0x7e], // Basic Latin
  [0xa0, 0x17f], // Latin-1 and Latin Extended-A: no-break space, ° ± ×, ă, é ö ő in names
  [0x218, 0x21b], // Ș ș Ț ț (comma below)
  [0x2009, 0x200a], // thin and hair space
  [0x2010, 0x2027], // dashes, quotes „ ” ‘ ’, bullet, ellipsis
  [0x202f, 0x202f], // narrow no-break space
  [0x2030, 0x203a], // ‰ ′ ″ ‹ ›
  [0x20ac, 0x20ac], // €
  [0x2122, 0x2122], // ™
  [0x2190, 0x2193], // arrows
  [0x2212, 0x2212], // minus
  [0x2215, 0x2215], // division slash
  [0x25b2, 0x25b2], // ▲
  [0x25bc, 0x25bc], // ▼
]

const hex = (n: number) => n.toString(16).toUpperCase().padStart(4, '0')
const unicodeRange = RANGES.map(([a, b]) => (a === b ? `U+${hex(a)}` : `U+${hex(a)}-${hex(b)}`))

type Fallback = {
  family: string
  /** Onest weight → the system face that stands in for it. */
  weights: Record<400 | 600, { local: string[]; file: string; wght?: number }>
}

/** Fallback system fonts, by family. Roboto is OFL and downloaded; Arial is read locally. */
const FALLBACKS: Fallback[] = [
  {
    family: 'Onest Fallback',
    weights: {
      400: {
        local: ['Arial', 'ArialMT', 'Liberation Sans', 'LiberationSans'],
        file: '/System/Library/Fonts/Supplemental/Arial.ttf',
      },
      600: {
        local: ['Arial Bold', 'Arial-BoldMT', 'Liberation Sans Bold', 'LiberationSans-Bold'],
        file: '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
      },
    },
  },
  {
    family: 'Onest Fallback Roboto',
    weights: {
      400: { local: ['Roboto', 'Roboto-Regular'], file: 'roboto', wght: 400 },
      600: { local: ['Roboto Bold', 'Roboto-Bold'], file: 'roboto', wght: 700 },
    },
  },
]

const ROBOTO_URL = 'https://github.com/google/fonts/raw/main/ofl/roboto/Roboto%5Bwdth%2Cwght%5D.ttf'

async function loadFont(file: string): Promise<fontkit.Font> {
  if (file !== 'roboto') return fontkit.create(await fs.readFile(file)) as fontkit.Font
  const cached = path.join(cache, 'Roboto[wdth,wght].ttf')
  const buffer = await fs.readFile(cached).catch(async () => {
    const res = await fetch(ROBOTO_URL)
    if (!res.ok) throw new Error(`Roboto download failed: ${res.status}`)
    const data = Buffer.from(await res.arrayBuffer())
    await fs.mkdir(cache, { recursive: true })
    await fs.writeFile(cached, data)
    return data
  })
  return fontkit.create(buffer) as fontkit.Font
}

/** Width of typical RO + EN copy, in ems, to size each fallback. */
const SAMPLE =
  'Agrinvest cumpără cereale direct de la fermieri, le depozitează în bazele proprii și ' +
  'finanțează producția. Grain storage and farm finance in Romania, 0123456789.'
const width = (f: fontkit.Font) => {
  const run = f.layout(SAMPLE)
  return run.positions.reduce((sum, p) => sum + p.xAdvance, 0) / f.unitsPerEm
}

const font = await fs.readFile(source)
const chars = RANGES.map(([a, b]) => range(a, b)).join('')
const woff2 = await subsetFont(font, chars, {
  targetFormat: 'woff2',
  variationAxes: { wght: { min: 400, max: 700 } },
})
await fs.writeFile(woff2Out, woff2)

const onest = fontkit.create(font) as fontkit.Font
const pct = (v: number) => `${(v * 100).toFixed(2)}%`
const faces = [
  `@font-face {
  font-family: 'Onest Variable';
  font-style: normal;
  font-display: optional;
  font-weight: 400 700;
  src: url('/fonts/onest-ro-wght.woff2') format('woff2-variations');
  unicode-range: ${unicodeRange.join(', ')};
}`,
]
for (const { family, weights } of FALLBACKS) {
  for (const [weight, spec] of Object.entries(weights)) {
    let system = await loadFont(spec.file)
    if (spec.wght) system = system.getVariation({ wght: spec.wght })
    const scale = width(onest.getVariation({ wght: Number(weight) })) / width(system)
    const em = (v: number) => pct(v / onest.unitsPerEm / scale)
    faces.push(`@font-face {
  font-family: '${family}';
  font-weight: ${weight === '400' ? '400 500' : '600 700'};
  src: ${spec.local.map((l) => `local('${l}')`).join(', ')};
  size-adjust: ${pct(scale)};
  ascent-override: ${em(onest.ascent)};
  descent-override: ${em(Math.abs(onest.descent))};
  line-gap-override: ${em(onest.lineGap)};
}`)
  }
}
await fs.writeFile(
  cssOut,
  `/* Generated by scripts/brand/subset-font.ts (npm run brand:font). Do not edit. */\n\n${faces.join('\n\n')}\n`,
)
console.log(`${path.relative(root, woff2Out)}: ${(woff2.length / 1024).toFixed(1)} KB`)
console.log(`${path.relative(root, cssOut)}: ${faces.length} faces`)
