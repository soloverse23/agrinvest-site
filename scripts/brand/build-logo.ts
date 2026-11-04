/**
 * Builds the Agrinvest mark as clean SVG geometry. The only source is a 300 px PNG
 * (design-system/brand/source-logo.png); every coordinate below was measured from it,
 * in the PNG's 300 × 300 pixel space. The A is straight edges with rounded corners; the
 * leaf is smooth curves through the measured edge points. The white halo around the leaf
 * and the vein are knockouts (masks), so the mark works on any background.
 * Replace with Agrinvest's own vector when it arrives.
 *
 * Run: npx tsx scripts/brand/build-logo.ts
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const brandDir = path.join(root, 'design-system/brand')

type Pt = [number, number]

// Colours sampled from fully covered pixels of the source.
const LIME = '#a8cf44'
const LEAF_STOPS = [
  { offset: 0, color: '#0a854c' },
  { offset: 0.45, color: '#00a056' },
  { offset: 1, color: '#0b834b' },
] as const
const LEAF_GRADIENT = { x1: 5, x2: 247 }
/** Width of the white gap between the leaf and the A, in source pixels. */
const HALO = 5

const f = (n: number) => +n.toFixed(2)
const pt = ([x, y]: Pt) => `${f(x)} ${f(y)}`

/** Cubic Bézier segments of a Catmull-Rom spline through `pts` (open ends). */
function spline(pts: Pt[]): string {
  let d = ''
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const [p1, p2] = [pts[i], pts[i + 1]]
    const p3 = pts[i + 2] ?? p2
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C ${pt(c1)} ${pt(c2)} ${pt(p2)}`
  }
  return d
}

/** Closed path through smooth runs; runs meet at sharp corners. */
function smoothPath(runs: Pt[][]): string {
  let d = `M ${pt(runs[0][0])}`
  for (const run of runs) d += spline(run)
  return d + ' Z'
}

/** Closed polygon with each corner rounded by radius r (quadratic corners). */
function roundedPolygon(corners: { p: Pt; r: number }[]): string {
  const n = corners.length
  const toward = (a: Pt, b: Pt, dist: number): Pt => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    return [a[0] + ((b[0] - a[0]) * dist) / len, a[1] + ((b[1] - a[1]) * dist) / len]
  }
  let d = ''
  corners.forEach(({ p, r }, i) => {
    const prev = corners[(i - 1 + n) % n].p
    const next = corners[(i + 1) % n].p
    const a = toward(p, prev, r)
    const b = toward(p, next, r)
    d += `${i === 0 ? 'M' : ' L'} ${pt(a)} Q ${pt(p)} ${pt(b)}`
  })
  return d + ' Z'
}

// The A: edge lines fitted to the measured rows (outer-left x = 188 − 0.568(y − 40), etc.).
const TOP = 33.5
const BOTTOM = 267.5
const leftOuter = (y: number) => 188 - 0.568 * (y - 40)
const leftInner = (y: number) => 199 - 0.544 * (y - 100)
const rightInner = (y: number) => 215 + 0.142 * (y - 100)
const rightOuter = (y: number) => 253 + 0.155 * (y - 40)
const apexY = 100 + (199 - 215) / (0.142 + 0.544)

const aPath = roundedPolygon([
  { p: [leftOuter(TOP), TOP], r: 9 },
  { p: [rightOuter(TOP), TOP], r: 7 },
  { p: [rightOuter(BOTTOM), BOTTOM], r: 7 },
  { p: [rightInner(BOTTOM), BOTTOM], r: 3 },
  { p: [rightInner(apexY), apexY], r: 5 },
  { p: [leftInner(BOTTOM), BOTTOM], r: 7 },
  { p: [leftOuter(BOTTOM), BOTTOM], r: 8 },
])

// The leaf: one silhouette whose outline runs into the vein from the right and back out.
const TIP: Pt = [5, 125.5]
const VEIN_START: Pt = [60, 157.5]
const STEM_JOIN: Pt = [221.5, 244]

const leafPath = smoothPath([
  // Top edge, round crescent cap, then the crescent's underside back along the vein.
  [
    TIP,
    [22, 132.5],
    [40, 138],
    [60, 142],
    [90, 146],
    [130, 149.5],
    [160, 155.5],
    [190, 164.5],
    [215, 178.5],
    [232, 192.5],
    [242, 203.5],
    [246.5, 213],
    [244, 221.5],
    [238, 228],
    [231, 227.5],
    [220, 212.5],
    [200, 195],
    [170, 182.5],
    [140, 173.5],
    [100, 166],
    [80, 162.5],
    VEIN_START,
  ],
  // Body top along the vein, then down the stem to its tip and back up its left side.
  [
    VEIN_START,
    [80, 163.2],
    [100, 168.5],
    [140, 178],
    [170, 188],
    [200, 204],
    [215, 218.5],
    [225, 233],
    [230.5, 246],
    [233, 256],
    [232, 263],
    [229, 265],
    [226, 261],
    [224.5, 251],
    STEM_JOIN,
  ],
  // Underside of the body back to the tip.
  [
    STEM_JOIN,
    [205, 246],
    [180, 244.5],
    [150, 236.5],
    [120, 226.5],
    [90, 211.5],
    [70, 197.5],
    [50, 180.5],
    [30, 159.5],
    [16, 141],
    [9, 132],
    TIP,
  ],
])

const VIEWBOX = '0 26 296 248'

function svg(fills: { a: string; leaf: string }, defs = ''): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" role="img" aria-label="Agrinvest">
  <defs>
    <mask id="agrinvest-halo" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="300">
      <rect width="300" height="300" fill="#fff"/>
      <path d="${leafPath}" fill="#000" stroke="#000" stroke-width="${HALO}" stroke-linejoin="round"/>
    </mask>${defs}
  </defs>
  <path fill="${fills.a}" mask="url(#agrinvest-halo)" d="${aPath}"/>
  <path fill="${fills.leaf}" d="${leafPath}"/>
</svg>
`
}

async function main() {
  const gradient = `
    <linearGradient id="agrinvest-leaf" gradientUnits="userSpaceOnUse" x1="${LEAF_GRADIENT.x1}" y1="0" x2="${LEAF_GRADIENT.x2}" y2="0">${LEAF_STOPS.map((s) => `<stop offset="${s.offset}" stop-color="${s.color}"/>`).join('')}</linearGradient>`

  const files: Record<string, string> = {
    'logo-mark.svg': svg({ a: LIME, leaf: 'url(#agrinvest-leaf)' }, gradient),
    'logo-mark-mono-dark.svg': svg({ a: '#1a1a1a', leaf: '#1a1a1a' }),
    'logo-mark-mono-light.svg': svg({ a: '#ffffff', leaf: '#ffffff' }),
  }
  for (const [name, content] of Object.entries(files)) {
    await fs.writeFile(path.join(brandDir, name), content)
  }
  // Geometry for the React component, so it needs no SVG loader.
  await fs.writeFile(
    path.join(brandDir, 'geometry.ts'),
    `// Generated by scripts/brand/build-logo.ts. Do not edit.
export const viewBox = '${VIEWBOX}'
export const lime = '${LIME}'
export const leafStops = ${JSON.stringify(LEAF_STOPS)} as const
export const leafGradient = ${JSON.stringify(LEAF_GRADIENT)} as const
export const halo = ${HALO}
export const aPath = '${aPath}'
export const leafPath = '${leafPath}'
`,
  )
  console.log(`Wrote ${Object.keys(files).join(', ')} and geometry.ts`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
