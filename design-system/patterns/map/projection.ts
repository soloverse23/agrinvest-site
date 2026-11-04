/**
 * Projection for the Romania map: equirectangular, scaled by cos(46°N) so the country keeps
 * its shape. Used by scripts/brand/build-map.ts for the county outlines and by BaseMap for
 * the base points, so both land in the same coordinates.
 */
export const BOUNDS = { west: 20.2, east: 29.75, north: 48.3, south: 43.6 } as const
export const WIDTH = 1000

const kx = Math.cos((46 * Math.PI) / 180)
const scale = WIDTH / ((BOUNDS.east - BOUNDS.west) * kx)

export const HEIGHT = Math.round((BOUNDS.north - BOUNDS.south) * scale)

/** Longitude/latitude → map units (x right, y down), rounded to 0.1. */
export function project(lng: number, lat: number): [number, number] {
  const x = (lng - BOUNDS.west) * kx * scale
  const y = (BOUNDS.north - lat) * scale
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10]
}
