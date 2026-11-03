/**
 * Builds the county outlines for BaseMap from Natural Earth admin-1 (public domain):
 * projects each Romanian county and simplifies it (Douglas–Peucker). Writes
 * - public/maps/romania-counties.svg: the outlines, one <path id="BZ"> per county inside
 *   <g id="all">, without fill or stroke so the page styles them through <use>;
 * - design-system/patterns/map/counties.ts: codes, names and centroids for the component.
 *
 * Run: npm run brand:map. Downloads the source (~40 MB) to .cache/geo/ the first time.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { HEIGHT, WIDTH, project } from '../../design-system/patterns/map/projection'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const cached = path.join(root, '.cache/geo/ne_admin1.geojson')
const out = path.join(root, 'design-system/patterns/map/counties.ts')
const svgOut = path.join(root, 'public/maps/romania-counties.svg')
const SOURCE =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson'
/** Simplification tolerance in map units (1000 wide; shown at most ~700 px, so about 1 px). */
const TOLERANCE = 1.4

/** County names with Romanian diacritics (Natural Earth drops them), by ISO 3166-2 code. */
const NAMES: Record<string, string> = {
  AB: 'Alba',
  AG: 'Argeș',
  AR: 'Arad',
  B: 'București',
  BC: 'Bacău',
  BH: 'Bihor',
  BN: 'Bistrița-Năsăud',
  BR: 'Brăila',
  BT: 'Botoșani',
  BV: 'Brașov',
  BZ: 'Buzău',
  CJ: 'Cluj',
  CL: 'Călărași',
  CS: 'Caraș-Severin',
  CT: 'Constanța',
  CV: 'Covasna',
  DB: 'Dâmbovița',
  DJ: 'Dolj',
  GJ: 'Gorj',
  GL: 'Galați',
  GR: 'Giurgiu',
  HD: 'Hunedoara',
  HR: 'Harghita',
  IF: 'Ilfov',
  IL: 'Ialomița',
  IS: 'Iași',
  MH: 'Mehedinți',
  MM: 'Maramureș',
  MS: 'Mureș',
  NT: 'Neamț',
  OT: 'Olt',
  PH: 'Prahova',
  SB: 'Sibiu',
  SJ: 'Sălaj',
  SM: 'Satu Mare',
  SV: 'Suceava',
  TL: 'Tulcea',
  TM: 'Timiș',
  TR: 'Teleorman',
  VL: 'Vâlcea',
  VN: 'Vrancea',
  VS: 'Vaslui',
}

type Point = [number, number]
type Feature = {
  properties: { adm0_a3: string; iso_3166_2: string; name: string }
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: number[][][] | number[][][][] }
}

async function source(): Promise<{ features: Feature[] }> {
  const text = await fs.readFile(cached, 'utf8').catch(async () => {
    const res = await fetch(SOURCE)
    if (!res.ok) throw new Error(`Natural Earth download failed: ${res.status}`)
    const body = await res.text()
    await fs.mkdir(path.dirname(cached), { recursive: true })
    await fs.writeFile(cached, body)
    return body
  })
  return JSON.parse(text)
}

function distance([x, y]: Point, [x1, y1]: Point, [x2, y2]: Point): number {
  const [dx, dy] = [x2 - x1, y2 - y1]
  const len = dx * dx + dy * dy
  const t = len ? Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / len)) : 0
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy))
}

function simplify(points: Point[]): Point[] {
  if (points.length < 3) return points
  let [max, index] = [0, 0]
  for (let i = 1; i < points.length - 1; i++) {
    const d = distance(points[i], points[0], points[points.length - 1])
    if (d > max) [max, index] = [d, i]
  }
  if (max <= TOLERANCE) return [points[0], points[points.length - 1]]
  return [...simplify(points.slice(0, index + 1)).slice(0, -1), ...simplify(points.slice(index))]
}

/** Simplified ring as an SVG path, in integer units with relative steps (shorter output). */
const ring = (coords: number[][]) => {
  const pts = simplify(coords.map(([lng, lat]) => project(lng, lat)))
    .map(([x, y]): Point => [Math.round(x), Math.round(y)])
    .filter(([x, y], i, all) => i === 0 || x !== all[i - 1][0] || y !== all[i - 1][1])
  if (pts.length < 3) return ''
  const steps = pts.slice(1).map(([x, y], i) => `${x - pts[i][0]} ${y - pts[i][1]}`)
  return `M${pts[0][0]} ${pts[0][1]}l${steps.join(' ')}z`
}

/** Area-weighted centroid of the largest ring, for labels and fallback points. */
function centroid(coords: number[][]): Point {
  const pts = coords.map(([lng, lat]) => project(lng, lat))
  let [a, cx, cy] = [0, 0, 0]
  for (let i = 0; i < pts.length - 1; i++) {
    const [[x0, y0], [x1, y1]] = [pts[i], pts[i + 1]]
    const f = x0 * y1 - x1 * y0
    a += f
    cx += (x0 + x1) * f
    cy += (y0 + y1) * f
  }
  return [Math.round(cx / (3 * a)), Math.round(cy / (3 * a))]
}

const { features } = await source()
const counties = features
  .filter((f) => f.properties.adm0_a3 === 'ROU')
  .map((f) => {
    const polygons = (
      f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
    ) as number[][][][]
    const largest = polygons.map((p) => p[0]).sort((a, b) => b.length - a.length)[0]
    return {
      code: f.properties.iso_3166_2.replace('RO-', ''),
      name: NAMES[f.properties.iso_3166_2.replace('RO-', '')] ?? f.properties.name,
      d: polygons.map((p) => ring(p[0])).join(''),
      at: centroid(largest),
    }
  })
  .sort((a, b) => a.code.localeCompare(b.code))

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}"><g id="all" stroke-linejoin="round" stroke-width="1">${counties
  .map((c) => `<path id="${c.code}" d="${c.d}" vector-effect="non-scaling-stroke"/>`)
  .join('')}</g></svg>
`
await fs.mkdir(path.dirname(svgOut), { recursive: true })
await fs.writeFile(svgOut, svg)

const body = `/* Generated by scripts/brand/build-map.ts (npm run brand:map) from Natural Earth admin-1
   (public domain). Do not edit. Outlines: public/maps/romania-counties.svg. */

export const MAP_WIDTH = ${WIDTH}
export const MAP_HEIGHT = ${HEIGHT}
export const MAP_SRC = '/maps/romania-counties.svg'

/** Romanian counties (ISO 3166-2 code without "RO-"; B = Bucharest) and their centroids. */
export const COUNTIES: readonly { code: string; name: string; at: [number, number] }[] = ${JSON.stringify(counties.map(({ code, name, at }) => ({ code, name, at })))}
`
await fs.writeFile(out, body)
console.log(
  `${path.relative(root, svgOut)}: ${counties.length} counties, ${(svg.length / 1024).toFixed(1)} KB`,
)
