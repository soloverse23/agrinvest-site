import type { ReactNode } from 'react'

import { icon, type IconProps } from './factory'
import type { CategoryIcon } from './keys'

/**
 * Shop category icons, in the house line style (24 × 24, 1.75 stroke). Server components only:
 * like `server.tsx`, this module stays out of the shared client chunk.
 */
const seed =
  'M12 20.5c-3.4 0-5.5-2.6-5.5-6C6.5 10.4 9 6.8 12 4.5c3 2.3 5.5 5.9 5.5 10 0 3.4-2.1 6-5.5 6z'
const leaf = 'M6 18C6 11 10 7 18 6.5 17.6 14 13.6 18 6.5 18.4M6 18l5.5-5.5'
const sprout =
  'M12 20v-7M12 13c-3.2 0-5-1.8-5-5 3.2 0 5 1.8 5 5zM12 11c0-3.2 1.8-5 5-5 0 3.2-1.8 5-5 5z'

export const SeedIcon = icon(
  'SeedIcon',
  <>
    <path d={seed} />
    <path d="M12 20.5V12" />
  </>,
)

export const ProtectionIcon = icon(
  'ProtectionIcon',
  <>
    <path d="M12 3 5 5.8v5.4c0 4.3 2.9 7.9 7 9.3 4.1-1.4 7-5 7-9.3V5.8z" />
    <path d="M9 15c0-3.2 1.9-5.3 6-5.5-.2 3.9-2.2 5.6-5.5 5.8M9 15l2.5-2.5" />
  </>,
)

export const HerbicideIcon = icon(
  'HerbicideIcon',
  <>
    <path d={sprout} />
    <path d="M4 20h16M4.5 4.5l15 15" />
  </>,
)

export const FungicideIcon = icon(
  'FungicideIcon',
  <>
    <path d="M3.5 11.5a8.5 8.5 0 0 1 17 0z" />
    <path d="M9.5 11.5v6a2.5 2.5 0 0 0 5 0v-6M8 7.5h.01M12 6h.01M16 7.5h.01" />
  </>,
)

export const InsecticideIcon = icon(
  'InsecticideIcon',
  <>
    <ellipse cx="12" cy="14" rx="4" ry="5.5" />
    <path d="M12 8.5v11M10 6.5 8.5 4.5M14 6.5l1.5-2M8 11.5H4.5M8 15.5l-3.5 1.5M16 11.5h3.5M16 15.5l3.5 1.5" />
  </>,
)

export const SeedTreatmentIcon = icon(
  'SeedTreatmentIcon',
  <>
    <path d="M9.5 20.5c-2.8 0-4.5-2.1-4.5-4.9C5 12.2 7 9.3 9.5 7.5c2.5 1.8 4.5 4.7 4.5 8.1 0 2.8-1.7 4.9-4.5 4.9z" />
    <path d="M17.5 3.5s-3 3.2-3 5.3a3 3 0 0 0 6 0c0-2.1-3-5.3-3-5.3z" />
  </>,
)

export const AdjuvantIcon = icon(
  'AdjuvantIcon',
  <>
    <path d="M9 4.5s-4.5 4.8-4.5 8a4.5 4.5 0 0 0 9 0c0-3.2-4.5-8-4.5-8z" />
    <path d="M15.5 9.5s4 4.2 4 7a4 4 0 0 1-6.6 3" />
  </>,
)

export const GrowthIcon = icon(
  'GrowthIcon',
  <>
    <path d={sprout} />
    <path d="M4 20h16M19 13V3.5M16.5 6 19 3.5 21.5 6" />
  </>,
)

export const FertiliserIcon = icon(
  'FertiliserIcon',
  <>
    <path d="M8 3.5h8l-1.2 3.5H9.2zM9.2 7c-2.4 1.8-3.7 5-3.7 8.5 0 2.8 1.2 5 3 5h7c1.8 0 3-2.2 3-5 0-3.5-1.3-6.7-3.7-8.5" />
    <path d="M10 13.5h.01M14 13.5h.01M12 16.5h.01" />
  </>,
)

export const FoliarIcon = icon(
  'FoliarIcon',
  <>
    <path d={leaf} />
    <path d="M18 14.5s-2.2 2.4-2.2 3.9a2.2 2.2 0 0 0 4.4 0c0-1.5-2.2-3.9-2.2-3.9zM4 4.5h.01M7 3.5h.01M5.5 7h.01" />
  </>,
)

export const BioIcon = icon(
  'BioIcon',
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.5 15.5c0-4 2.4-6.6 7.5-7-.3 4.9-2.8 7.1-7 7.4M8.5 15.5l3.5-3.5" />
  </>,
)

export const OtherIcon = icon(
  'OtherIcon',
  <>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </>,
)

export const categoryIcons: Record<CategoryIcon, (props: IconProps) => ReactNode> = {
  seed: SeedIcon,
  protection: ProtectionIcon,
  herbicide: HerbicideIcon,
  fungicide: FungicideIcon,
  insecticide: InsecticideIcon,
  'seed-treatment': SeedTreatmentIcon,
  adjuvant: AdjuvantIcon,
  growth: GrowthIcon,
  fertiliser: FertiliserIcon,
  foliar: FoliarIcon,
  bio: BioIcon,
  other: OtherIcon,
}

/** The icon for a stored value; anything unknown or empty draws the neutral one. */
export function CategoryGlyph({ icon: key, ...props }: IconProps & { icon?: string | null }) {
  const Glyph = categoryIcons[key as CategoryIcon] ?? OtherIcon
  return <Glyph {...props} />
}
