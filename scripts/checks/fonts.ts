/**
 * Checks the design-system fonts for what Agrinvest text needs: Romanian Ș ș Ț ț with comma
 * below (U+0218–U+021B), the rest of the Romanian alphabet, and tabular figures: either a
 * `tnum` feature or digits that are tabular by default (all ten share one advance width).
 * Reads the latin-ext files that Fontsource ships (that subset carries the Romanian letters).
 *
 * Run: npm run check:fonts
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import * as fontkit from 'fontkit'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const modules = path.join(root, 'node_modules')

/**
 * The fonts the design system ships (decision 0002). Candidates rejected for lacking tabular
 * figures: Fraunces, Libre Franklin, Albert Sans, Lexend.
 */
export const CANDIDATES: Record<string, string> = {
  '@fontsource-variable/onest': 'Onest Variable',
}

const COMMA_BELOW = [0x0218, 0x0219, 0x021a, 0x021b] // Ș ș Ț ț
const ROMANIAN = [...'ĂăÂâÎî'].map((c) => c.codePointAt(0)!)
const BASIC = [...'0123456789,.%'].map((c) => c.codePointAt(0)!)

/** The upright latin-ext file: the variable `wght` axis file, or the static 400. */
async function fontFile(pkg: string): Promise<string> {
  const dir = path.join(modules, pkg, 'files')
  const files = await fs.readdir(dir)
  const pick =
    files.find((f) => f.endsWith('-latin-ext-wght-normal.woff2')) ??
    files.find((f) => f.endsWith('-latin-ext-opsz-normal.woff2')) ??
    files.find((f) => f.endsWith('-latin-ext-400-normal.woff2'))
  if (!pick) throw new Error(`${pkg}: no upright latin-ext file`)
  return path.join(dir, pick)
}

/** fontkit drops the subset's unsupported code points, so check latin + latin-ext together. */
async function latinFile(pkg: string, extFile: string): Promise<string | undefined> {
  const candidate = extFile.replace('-latin-ext-', '-latin-')
  return fs
    .access(candidate)
    .then(() => candidate)
    .catch(() => undefined)
}

async function check(pkg: string) {
  const ext = await fontFile(pkg)
  const latin = await latinFile(pkg, ext)
  const fonts = [ext, latin].filter(Boolean).map((f) => fontkit.openSync(f!) as fontkit.Font)
  const has = (cp: number) => fonts.some((font) => font.hasGlyphForCodePoint(cp))
  const features = new Set(fonts.flatMap((font) => font.availableFeatures))
  // Measure digits in the file that has them (the latin-ext subset may not).
  const digitFont = fonts.find((font) => font.hasGlyphForCodePoint(0x30)) ?? fonts[0]
  const digitWidths = new Set(
    [...'0123456789'].map((d) => digitFont.glyphForCodePoint(d.codePointAt(0)!).advanceWidth),
  )
  const tabular = features.has('tnum') ? 'tnum' : digitWidths.size === 1 ? 'default' : null

  const missing = [...COMMA_BELOW, ...ROMANIAN, ...BASIC]
    .filter((cp) => !has(cp))
    .map((cp) => String.fromCodePoint(cp))
  return { pkg, missing, tabular }
}

async function main() {
  const results = await Promise.all(Object.keys(CANDIDATES).map(check))
  let failed = 0
  for (const { pkg, missing, tabular } of results) {
    const ok = !missing.length && tabular
    if (!ok) failed++
    const notes = [
      missing.length ? `missing ${missing.join(' ')}` : '',
      tabular === 'tnum'
        ? 'tabular via tnum'
        : tabular
          ? 'tabular by default'
          : 'no tabular figures',
    ]
      .filter(Boolean)
      .join('; ')
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${CANDIDATES[pkg].padEnd(28)} ${notes}`)
  }
  console.log(`\n${results.length - failed}/${results.length} fonts pass`)
  if (failed) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
