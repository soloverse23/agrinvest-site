/** Crops with their own icon and data colour in the design system. */
export const grainKeys = ['wheat', 'maize', 'sunflower', 'rapeseed', 'barley'] as const

export type GrainKey = (typeof grainKeys)[number]

export const isGrainKey = (key: string): key is GrainKey =>
  (grainKeys as readonly string[]).includes(key)
