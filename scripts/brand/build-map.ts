/**
 * Builds the county outlines for CountyMap from Natural Earth admin-1 (public domain):
 * projects each Romanian county and simplifies it (Douglas–Peucker). Writes
 * - public/maps/romania-counties.svg: the outlines, one <path id="BZ"> per county inside
 *   <g id="all">, without fill or stroke so the page styles them through <use>;
 * - public/maps/romania-context.svg: the neighbouring countries (one <path> each inside
 *   <g id="near">) and Romania's outline (<path id="RO">), from Natural Earth admin-0, cut to
 *   CONTEXT so the map can show the country among its neighbours and the Black Sea;
 * - design-system/patterns/map/counties.ts: codes, names and centroids for the component.
 *
 * Run: npm run brand:map. Downloads the sources (~40 + 13 MB) to .cache/geo/ the first time.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { CONTEXT, HEIGHT, WIDTH, project } from '../../design-system/patterns/map/projection'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const cached = path.join(root, '.cache/geo/ne_admin1.geojson')
const out = path.join(root, 'design-system/patterns/map/counties.ts')
const svgOut = path.join(root, 'public/maps/romania-counties.svg')
const contextOut = path.join(root, 'public/maps/romania-context.svg')
const SOURCE =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson'
const COUNTRIES_SOURCE =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson'
const countriesCached = path.join(root, '.cache/geo/ne_admin0.geojson')
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

async function source<F = Feature>(file = cached, url = SOURCE): Promise<{ features: F[] }> {
  const text = await fs.readFile(file, 'utf8').catch(async () => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Natural Earth download failed: ${res.status}`)
    const body = await res.text()
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(file, body)
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
const ring = (coords: number[][]) => projected(coords.map(([lng, lat]) => project(lng, lat)))

const projected = (points: Point[]) => {
  const pts = simplify(points)
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

/**
 * County areas in km², official figures (INS, Anuarul Statistic al României); they add up to
 * Romania's 238,391 km². Measuring the simplified outlines would be ~2% off.
 */
const AREAS: Record<string, number> = {
  AB: 6242,
  AR: 7754,
  AG: 6826,
  BC: 6621,
  BH: 7544,
  BN: 5355,
  BT: 4986,
  BV: 5363,
  BR: 4766,
  B: 238,
  BZ: 6103,
  CS: 8520,
  CL: 5088,
  CJ: 6674,
  CT: 7071,
  CV: 3710,
  DB: 4054,
  DJ: 7414,
  GL: 4466,
  GR: 3526,
  GJ: 5602,
  HR: 6639,
  HD: 7063,
  IL: 4453,
  IS: 5476,
  IF: 1583,
  MM: 6304,
  MH: 4933,
  MS: 6714,
  NT: 5896,
  OT: 5498,
  PH: 4716,
  SM: 4418,
  SJ: 3864,
  SB: 5432,
  SV: 8553,
  TR: 5790,
  TM: 8697,
  TL: 8499,
  VS: 5318,
  VL: 5765,
  VN: 4857,
}

/** A projected ring cut to the CONTEXT rectangle (Sutherland–Hodgman, one edge at a time). */
function clip(points: Point[]): Point[] {
  const { x0, y0, x1, y1 } = CONTEXT
  const edges: [(p: Point) => boolean, (a: Point, b: Point) => Point][] = [
    [(p) => p[0] >= x0, (a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])]],
    [(p) => p[0] <= x1, (a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= y0, (a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0]],
    [(p) => p[1] <= y1, (a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1]],
  ]
  let out = points
  for (const [inside, cross] of edges) {
    const input = out
    out = []
    input.forEach((p, i) => {
      const prev = input[(i + input.length - 1) % input.length]
      if (inside(p)) {
        if (!inside(prev)) out.push(cross(prev, p))
        out.push(p)
      } else if (inside(prev)) out.push(cross(prev, p))
    })
    if (!out.length) break
  }
  return out
}

type Country = {
  properties: { ADM0_A3: string }
  geometry: Feature['geometry']
}
const polygonsOf = (g: Feature['geometry']) =>
  (g.type === 'Polygon' ? [g.coordinates] : g.coordinates) as number[][][][]
const countryPath = (c: Country) =>
  polygonsOf(c.geometry)
    .map((p) => {
      const cut = clip(p[0].map(([lng, lat]) => project(lng, lat)))
      return cut.length < 3 ? '' : projected([...cut, cut[0]])
    })
    .join('')

const { features: countries } = await source<Country>(countriesCached, COUNTRIES_SOURCE)
const near = countries
  .filter((c) => c.properties.ADM0_A3 !== 'ROU')
  .map((c) => ({ code: c.properties.ADM0_A3, d: countryPath(c) }))
  .filter((c) => c.d)
  .sort((a, b) => a.code.localeCompare(b.code))
const romania = countries.find((c) => c.properties.ADM0_A3 === 'ROU')
if (!romania) throw new Error('Romania missing from admin-0')
const contextSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${CONTEXT.x0} ${CONTEXT.y0} ${CONTEXT.x1 - CONTEXT.x0} ${CONTEXT.y1 - CONTEXT.y0}"><g id="near" stroke-linejoin="round">${near
  .map((c) => `<path id="${c.code}" d="${c.d}" vector-effect="non-scaling-stroke"/>`)
  .join(
    '',
  )}</g><path id="RO" d="${countryPath(romania)}" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>
`

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
      km2: AREAS[f.properties.iso_3166_2.replace('RO-', '')],
    }
  })
  .sort((a, b) => a.code.localeCompare(b.code))

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}"><g id="all" stroke-linejoin="round" stroke-width="1">${counties
  .map((c) => `<path id="${c.code}" d="${c.d}" vector-effect="non-scaling-stroke"/>`)
  .join('')}</g></svg>
`
await fs.mkdir(path.dirname(svgOut), { recursive: true })
await fs.writeFile(svgOut, svg)
await fs.writeFile(contextOut, contextSvg)

const body = `/* Generated by scripts/brand/build-map.ts (npm run brand:map) from Natural Earth admin-1
   (public domain). Do not edit. Outlines: public/maps/romania-counties.svg. */

export const MAP_WIDTH = ${WIDTH}
export const MAP_HEIGHT = ${HEIGHT}
export const MAP_SRC = '/maps/romania-counties.svg'
/** Neighbouring countries (<g id="near">) and Romania's outline (#RO), cut to CONTEXT. */
export const CONTEXT_SRC = '/maps/romania-context.svg'

/** Romanian counties (ISO 3166-2 code without "RO-"; B = Bucharest): centroid, area (INS). */
export const COUNTIES: readonly { code: string; name: string; at: [number, number]; km2: number }[] = ${JSON.stringify(counties.map(({ code, name, at, km2 }) => ({ code, name, at, km2 })))}
`
await fs.writeFile(out, body)
console.log(
  `${path.relative(root, svgOut)}: ${counties.length} counties, ${(svg.length / 1024).toFixed(1)} KB`,
)
console.log(
  `${path.relative(root, contextOut)}: ${near.map((c) => c.code).join(' ')}, ${(contextSvg.length / 1024).toFixed(1)} KB`,
)
