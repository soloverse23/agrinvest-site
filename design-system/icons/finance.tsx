import type { ReactNode } from 'react'

import type { IconProps } from './factory'
import { icon } from './factory'
import { CoinsIcon, DropIcon, ScaleIcon, SiloIcon, WheatIcon } from './icons'

/**
 * The finance need icons (Phase 7g). Server components only, like `server.tsx`: the shared
 * client module `icons.tsx` sits at its bundle budget.
 */
export const TractorIcon = icon(
  'TractorIcon',
  <>
    <path d="M4 15V9h7l2 5" />
    <path d="M11 9V5.5h4L16.5 11H20l1 3" />
    <circle cx="7" cy="16.5" r="3" />
    <circle cx="18" cy="17.5" r="2" />
    <path d="M10 17h6" />
  </>,
)
export const FieldIcon = icon(
  'FieldIcon',
  <>
    <path d="M3 19 8 9h8l5 10z" />
    <path d="M10.5 9 9 19M13.5 9l1.5 10M5.5 14h13" />
    <path d="M12 3.5v3M9.5 5h5" />
  </>,
)
export const LifebuoyIcon = icon(
  'LifebuoyIcon',
  <>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="m6 6 3.5 3.5M14.5 14.5 18 18M18 6l-3.5 3.5M9.5 14.5 6 18" />
  </>,
)
export const QuestionIcon = icon(
  'QuestionIcon',
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.4M12 16.8v.2" />
  </>,
)
export const BookIcon = icon(
  'BookIcon',
  <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5zM4 20.5V5.5M20 20.5V5.5" />,
)

export const needIcons: Record<
  'wheat' | 'tractor' | 'drop' | 'silo' | 'field' | 'coins' | 'scale' | 'lifebuoy',
  (props: IconProps) => ReactNode
> = {
  wheat: WheatIcon,
  tractor: TractorIcon,
  drop: DropIcon,
  silo: SiloIcon,
  field: FieldIcon,
  coins: CoinsIcon,
  scale: ScaleIcon,
  lifebuoy: LifebuoyIcon,
}
