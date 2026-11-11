/** Icon names that content (Payload blocks) can pick; Sections.tsx maps each to its icon. */
export const sectionIconKeys = [
  'silo',
  'truck',
  'pin',
  'leaf',
  'scale',
  'drop',
  'coins',
  'clock',
  'handshake',
  'document',
  'phone',
  'mail',
  'wheat',
  'maize',
  'sunflower',
  'rapeseed',
  'barley',
] as const
export type SectionIcon = (typeof sectionIconKeys)[number]

/**
 * Shop category icons (Categories `icon`; `categories.tsx` draws them). Kept apart from the
 * section icons: a category picks from the shop's own set.
 */
export const categoryIconKeys = [
  'seed',
  'protection',
  'herbicide',
  'fungicide',
  'insecticide',
  'seed-treatment',
  'adjuvant',
  'growth',
  'fertiliser',
  'foliar',
  'bio',
  'other',
] as const
export type CategoryIcon = (typeof categoryIconKeys)[number]
