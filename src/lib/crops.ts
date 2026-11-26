/**
 * Crops with their own icon and data colour in the design system, in the order of harvest.
 * Every list of them on the site follows this order (owner, 2026-11-26).
 */
export const grainKeys = ['barley', 'wheat', 'rapeseed', 'sunflower', 'maize'] as const

export type GrainKey = (typeof grainKeys)[number]

export const isGrainKey = (key: string): key is GrainKey =>
  (grainKeys as readonly string[]).includes(key)

/** A crop's place in the harvest order; any other crop comes after them. */
export const harvestRank = (key: string) =>
  isGrainKey(key) ? grainKeys.indexOf(key) : grainKeys.length

/** A copy in harvest order. Other crops keep the order they came in, at the end. */
export const byHarvest = <T extends { key?: string | null }>(crops: readonly T[]) =>
  [...crops].sort((a, b) => harvestRank(a.key ?? '') - harvestRank(b.key ?? ''))
