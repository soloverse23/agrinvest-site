/**
 * Compares the rebuilt SVG mark with the source PNG at the source's own pixel scale.
 * Each pixel is classed as paper, lime or leaf. Mismatch = share of ink pixels whose class
 * differs, ignoring the source's own 1 px anti-aliased edge band. Fails above the threshold. Writes an overlay to data/raw/logo-diff.png for inspection.
 *
 * Run: npx tsx scripts/checks/logo-diff.ts
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp, { type Sharp } from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const brandDir = path.join(root, 'design-system/brand')
const THRESHOLD = 0.02

type Class = 0 | 1 | 2 // paper, lime, leaf

/** Lime has red well above blue; the leaf has green well above red. */
function classify(p: Buffer): Class {
  if (p[0] - p[2] > 50 && p[0] > 130) return 1
  if (p[1] - p[0] > 40 && p[0] < 130) return 2
  return 0
}

async function rgb(input: Sharp): Promise<Buffer> {
  return input.flatten({ background: '#ffffff' }).removeAlpha().raw().toBuffer()
}

async function main() {
  const svg = await fs.readFile(path.join(brandDir, 'logo-mark.svg'), 'utf8')
  const [vx, vy, vw, vh] = /viewBox="([^"]+)"/.exec(svg)![1].split(' ').map(Number)

  // Render the SVG at 1 unit = 1 source pixel, and crop the source to the same viewBox.
  const traced = await rgb(sharp(Buffer.from(svg), { density: 72 * 4 }).resize(vw, vh))
  const source = await rgb(
    sharp(path.join(brandDir, 'source-logo.png')).extract({
      left: vx,
      top: vy,
      width: vw,
      height: vh,
    }),
  )

  const classes = (img: Buffer) =>
    Array.from({ length: vw * vh }, (_, i) => classify(img.subarray(i * 3, i * 3 + 3)))
  const a = classes(traced)
  const b = classes(source)

  /** True when the source pixel and its 8 neighbours share one class (not an edge pixel). */
  const interior = (i: number) => {
    const [x, y] = [i % vw, Math.floor(i / vw)]
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const [nx, ny] = [x + dx, y + dy]
        if (nx < 0 || ny < 0 || nx >= vw || ny >= vh) continue
        if (b[ny * vw + nx] !== b[i]) return false
      }
    }
    return true
  }

  let ink = 0
  let off = 0
  const overlay = Buffer.alloc(vw * vh * 3, 255)
  for (let i = 0; i < vw * vh; i++) {
    if (a[i] === 0 && b[i] === 0) continue
    ink++
    if (a[i] !== b[i] && interior(i)) {
      off++
      overlay.set([220, 30, 30], i * 3)
    } else {
      overlay.set([200, 200, 200], i * 3)
    }
  }

  const mismatch = off / ink
  const out = path.join(root, 'data/raw/logo-diff.png')
  await fs.mkdir(path.dirname(out), { recursive: true })
  await sharp(overlay, { raw: { width: vw, height: vh, channels: 3 } })
    .resize(vw * 3, vh * 3, { kernel: 'nearest' })
    .png()
    .toFile(out)

  console.log(
    `Logo mismatch: ${(mismatch * 100).toFixed(2)}% of ${ink} ink pixels (limit ${THRESHOLD * 100}%). Overlay: ${path.relative(root, out)}`,
  )
  if (mismatch > THRESHOLD) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
