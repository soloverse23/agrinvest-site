import React from 'react'

import { icon, type IconProps } from '@ds/icons/factory'
import { BookIcon, QuestionIcon } from '@ds/icons/finance'
import {
  CartIcon,
  CoinsIcon,
  DocumentIcon,
  DropIcon,
  PhoneIcon,
  SiloIcon,
  WheatIcon,
} from '@ds/icons/icons'

/* Panel-only line icons, drawn on the design system's 24 × 24 grid. */
const PageIcon = icon(
  'PageIcon',
  <>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </>,
)
const ChatIcon = icon('ChatIcon', <path d="M4 5h16v11H9l-5 4z M8 9.5h8M8 12.5h5" />)
const PeopleIcon = icon(
  'PeopleIcon',
  <>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M16 14.2c2.8.2 5 2.6 5 5.8" />
  </>,
)
const ImageIcon = icon(
  'ImageIcon',
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="9.5" r="1.8" />
    <path d="m4 18 5-5 4 4 3-3 4 4" />
  </>,
)
const BoxIcon = icon(
  'BoxIcon',
  <>
    <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
    <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
  </>,
)
const GridIcon = icon(
  'GridIcon',
  <>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </>,
)
const TagIcon = icon(
  'TagIcon',
  <>
    <path d="M3 12V4h8l10 10-8 8z" />
    <circle cx="7.5" cy="8.5" r="1.4" />
  </>,
)
const ShopIcon = icon(
  'ShopIcon',
  <>
    <path d="M4 9h16l-1.5-5h-13zM5 9v11h14V9" />
    <path d="M10 20v-6h4v6" />
  </>,
)
const InboxIcon = icon(
  'InboxIcon',
  <>
    <path d="M3 13l3-8h12l3 8v6H3z" />
    <path d="M3 13h5l1.5 3h5L16 13h5" />
  </>,
)
const FuelIcon = icon(
  'FuelIcon',
  <>
    <path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h14M8 8h4" />
    <path d="M15 10h2a2 2 0 0 1 2 2v4a1.5 1.5 0 0 0 3 0V8l-3-3" />
  </>,
)
export const HomeIcon = icon('HomeIcon', <path d="M4 11 12 4l8 7M6 9.5V20h12V9.5M10 20v-5h4v5" />)
export const HelpIcon = icon(
  'HelpIcon',
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01" />
  </>,
)
export const GearIcon = icon(
  'GearIcon',
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
  </>,
)
export const SearchIcon = icon(
  'SearchIcon',
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </>,
)

const icons: Record<string, (props: IconProps) => React.ReactNode> = {
  page: PageIcon,
  silo: SiloIcon,
  book: BookIcon,
  chat: ChatIcon,
  people: PeopleIcon,
  image: ImageIcon,
  box: BoxIcon,
  grid: GridIcon,
  tag: TagIcon,
  drop: DropIcon,
  cart: CartIcon,
  shop: ShopIcon,
  file: DocumentIcon,
  inbox: InboxIcon,
  coins: CoinsIcon,
  question: QuestionIcon,
  wheat: WheatIcon,
  fuel: FuelIcon,
  phone: PhoneIcon,
  home: HomeIcon,
  help: HelpIcon,
  search: SearchIcon,
  gear: GearIcon,
}

/** The icon for a key of `sectionIcon`, or a plain page. */
export function SectionIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = (name && icons[name]) || PageIcon
  return <Icon className={className ?? 'panel-ico'} />
}
