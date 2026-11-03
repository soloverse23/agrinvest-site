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
