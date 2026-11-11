import { icon } from './factory'

/**
 * Icons that only server components may import (the header ticker, the home sections). They
 * live apart from `icons.tsx` because that module is shared with client components and sits at
 * its bundle budget: a client component importing this file would put it in the shared chunk.
 */
export const FuelIcon = icon(
  'FuelIcon',
  <>
    <path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
    <path d="M3 21h12M7 8h4" />
    <path d="M14 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V9l-3-3" />
  </>,
)

export const SearchIcon = icon(
  'SearchIcon',
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </>,
)

/** Price trend marks for the header strip: shape carries the meaning, colour only supports it. */
export const TrendUpIcon = icon('TrendUpIcon', <path d="M12 19V6M6.5 11.5 12 6l5.5 5.5" />)
export const TrendDownIcon = icon('TrendDownIcon', <path d="M12 5v13M6.5 12.5 12 18l5.5-5.5" />)
export const TrendFlatIcon = icon('TrendFlatIcon', <path d="M6 12h12" />)

export const CalculatorIcon = icon(
  'CalculatorIcon',
  <>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M8 7h8M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01M8.5 15h.01M12 15h.01M15.5 15h.01M8.5 18h.01M12 18h3.5" />
  </>,
)

/** Shop listings (Phase 7c.3): the grid/list view toggle, the phone filter button, close. */
export const GridIcon = icon(
  'GridIcon',
  <>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </>,
)

export const ListIcon = icon(
  'ListIcon',
  <>
    <rect x="4" y="4.5" width="5" height="5" rx="1.2" />
    <rect x="4" y="14.5" width="5" height="5" rx="1.2" />
    <path d="M12 6h8M12 8.5h5M12 16h8M12 18.5h5" />
  </>,
)

export const FilterIcon = icon(
  'FilterIcon',
  <>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </>,
)

export const CloseIcon = icon('CloseIcon', <path d="M6 6l12 12M18 6 6 18" />)
