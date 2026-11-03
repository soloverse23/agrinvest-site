/**
 * Checks that every text/background pair the design system uses meets WCAG AA, reading the
 * colours straight from design-system/tokens/tokens.css. Add a pair here whenever a component
 * puts a new text colour on a new background.
 *
 * Run: npm run check:contrast
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

/** [text, background, minimum ratio]. 4.5 for text, 3 for large text and UI boundaries. */
const PAIRS: [string, string, number][] = [
  ['ink', 'paper', 4.5],
  ['ink', 'surface', 4.5],
  ['ink', 'raised', 4.5],
  ['muted', 'paper', 4.5],
  ['muted', 'surface', 4.5],
  ['muted', 'raised', 4.5],
  ['subtle', 'raised', 4.5],
  ['subtle', 'surface', 4.5],
  ['accent', 'paper', 4.5],
  ['accent', 'raised', 4.5],
  ['accent', 'accent-soft', 4.5],
  ['on-accent', 'accent', 4.5],
  ['on-accent', 'accent-hover', 4.5],
  ['on-forest', 'forest', 4.5],
  ['on-forest', 'forest-raised', 4.5],
  ['on-forest-muted', 'forest', 4.5],
  ['on-forest-muted', 'forest-raised', 4.5],
  ['lime', 'forest', 4.5],
  ['forest', 'lime', 4.5],
  ['forest', 'lime-hover', 4.5],
  ['forest', 'lime-soft', 4.5],
  ['up', 'up-soft', 4.5],
  ['down', 'down-soft', 4.5],
  ['flat', 'flat-soft', 4.5],
  ['up', 'raised', 4.5],
  ['down', 'raised', 4.5],
  ['warning', 'warning-soft', 4.5],
  ['info', 'info-soft', 4.5],
  ['danger', 'danger-soft', 4.5],
  ['danger', 'raised', 4.5],
  ['field-line', 'raised', 3],
]

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

async function main() {
  const css = await fs.readFile(path.join(root, 'design-system/tokens/tokens.css'), 'utf8')
  const colours = new Map(
    [...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6})\b/gi)].map(([, name, hex]) => [
      name,
      hex,
    ]),
  )
  let failed = 0
  for (const [text, bg, min] of PAIRS) {
    const [a, b] = [colours.get(text), colours.get(bg)]
    if (!a || !b) throw new Error(`Unknown colour token: ${!a ? text : bg}`)
    const ratio = contrast(a, b)
    const ok = ratio >= min
    if (!ok) failed++
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  ${`${text} on ${bg}`.padEnd(34)} ${ratio.toFixed(2)} (min ${min})`,
    )
  }
  console.log(`\n${PAIRS.length - failed}/${PAIRS.length} pairs pass`)
  if (failed) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
