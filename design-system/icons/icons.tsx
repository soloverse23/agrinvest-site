import type { ReactNode, SVGProps } from 'react'

/**
 * Agrinvest line icons: 24 × 24 grid, 1.75 stroke, round caps and joins, colour from `currentColor`.
 * Decorative by default; pass `label` when the icon carries meaning on its own.
 */
export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { label?: string }

function icon(name: string, body: ReactNode) {
  function Icon({ label, className = 'size-6', ...props }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        focusable="false"
        {...props}
      >
        {body}
      </svg>
    )
  }
  Icon.displayName = name
  return Icon
}

const grain = (y: number, side: 1 | -1) =>
  `M12 ${y}c${-2.2 * side} -0.4 ${-3.4 * side} -1.9 ${-3.4 * side} -3.6c${2.1 * side} 0.3 ${3.4 * side} 1.6 ${3.4 * side} 3.6z`

/* Crops */
export const WheatIcon = icon(
  'WheatIcon',
  <>
    <path d="M12 22V6" />
    {[9, 12.5, 16].map((y) => (
      <g key={y}>
        <path d={grain(y, 1)} />
        <path d={grain(y, -1)} />
      </g>
    ))}
    <path d="M12 6c-1.1-1-1.1-2.6 0-3.6 1.1 1 1.1 2.6 0 3.6z" />
  </>,
)

export const BarleyIcon = icon(
  'BarleyIcon',
  <>
    <path d="M12 22V7" />
    {[10, 13.5, 17].map((y) => (
      <g key={y}>
        <path d={grain(y, 1)} />
        <path d={grain(y, -1)} />
      </g>
    ))}
    <path d="M8.6 6.4 6.5 2M15.4 6.4 17.5 2M12 7V1.5" />
  </>,
)

export const MaizeIcon = icon(
  'MaizeIcon',
  <>
    <path d="M12 3c2.4 0 3.8 3.2 3.8 7.6S14.4 18 12 18s-3.8-3-3.8-7.4S9.6 3 12 3z" />
    <path d="M9.6 7.5h4.8M8.9 11h6.2M9.3 14.5h5.4M12 3.5v14" />
    <path d="M8.4 12.5C6.6 14.6 5.8 17.6 6.4 21c1.9-1 3.6-2.6 4.8-4.4M15.6 12.5c1.8 2.1 2.6 5.1 2 8.5-1.9-1-3.6-2.6-4.8-4.4" />
  </>,
)

export const SunflowerIcon = icon(
  'SunflowerIcon',
  <>
    <circle cx="12" cy="9" r="2.6" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
      <ellipse key={a} cx="12" cy="3.6" rx="1.4" ry="2" transform={`rotate(${a} 12 9)`} />
    ))}
    <path d="M12 14.5V22M12 19c1.6-1.8 3.6-2.1 5-1.2-1 1.8-3 2.3-5 1.2z" />
  </>,
)

export const RapeseedIcon = icon(
  'RapeseedIcon',
  <>
    <circle cx="12" cy="4" r="1.6" />
    <circle cx="9.4" cy="6.6" r="1.6" />
    <circle cx="14.6" cy="6.6" r="1.6" />
    <circle cx="12" cy="9.2" r="1.6" />
    <path d="M12 11v11M12 16.5l-4-3.2M12 14.5l4-2.4" />
    <circle cx="7" cy="12.5" r="1.2" />
    <circle cx="17" cy="11.4" r="1.2" />
  </>,
)

/* UI */
export const ArrowRightIcon = icon('ArrowRightIcon', <path d="M5 12h14M13 6l6 6-6 6" />)
export const ChevronDownIcon = icon('ChevronDownIcon', <path d="m6 9 6 6 6-6" />)
export const MenuIcon = icon('MenuIcon', <path d="M4 7h16M4 12h16M4 17h10" />)
export const CheckIcon = icon('CheckIcon', <path d="m5 12.5 4.5 4.5L19 7.5" />)
export const PhoneIcon = icon(
  'PhoneIcon',
  <path d="M6.5 3.5h2.6l1.4 4.1-2 1.4a12 12 0 0 0 6.5 6.5l1.4-2 4.1 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" />,
)
export const CartIcon = icon(
  'CartIcon',
  <>
    <path d="M3 4h2.2l2.3 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2" />
    <circle cx="9.5" cy="20" r="1.2" />
    <circle cx="17" cy="20" r="1.2" />
  </>,
)
export const SiloIcon = icon(
  'SiloIcon',
  <path d="M5 21V9.5C5 6.5 7 4 9.5 4S14 6.5 14 9.5V21M5 10h9M5 14h9M5 18h9M14 21h5V12.5L16.5 10 14 12.5M3 21h18" />,
)
export const TruckIcon = icon(
  'TruckIcon',
  <>
    <path d="M2.5 6h11v10h-11zM13.5 9.5h4l3 3.5V16h-7" />
    <circle cx="6.5" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </>,
)
export const PinIcon = icon(
  'PinIcon',
  <>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.4" />
  </>,
)
export const LeafIcon = icon(
  'LeafIcon',
  <path d="M5 19C5 10 10.5 5 20 4.5 19.5 14 14.5 19 5.5 19.5M5 19l7-7" />,
)
export const ScaleIcon = icon(
  'ScaleIcon',
  <path d="M12 4v16M8 20h8M5 7h14M5 7l-2.5 6a2.5 2.5 0 0 0 5 0zM19 7l-2.5 6a2.5 2.5 0 0 0 5 0z" />,
)
export const DropIcon = icon(
  'DropIcon',
  <path d="M12 3.5s-6 6.4-6 10.6a6 6 0 0 0 12 0C18 9.9 12 3.5 12 3.5zM9.2 14.5a2.9 2.9 0 0 0 2.6 2.7" />,
)
export const CoinsIcon = icon(
  'CoinsIcon',
  <>
    <ellipse cx="9" cy="7" rx="5.5" ry="2.5" />
    <path d="M3.5 7v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V7M3.5 11v4c0 1.4 2.5 2.5 5.5 2.5 1 0 2-.1 2.8-.4" />
    <ellipse cx="15.5" cy="15" rx="5" ry="2.3" />
    <path d="M10.5 15v2.7c0 1.3 2.2 2.3 5 2.3s5-1 5-2.3V15" />
  </>,
)
export const ClockIcon = icon(
  'ClockIcon',
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </>,
)
export const HandshakeIcon = icon(
  'HandshakeIcon',
  <path d="M2.5 8.5 6 6l3 1.5L12 6l3 1.5L18 6l3.5 2.5M2.5 8.5V14l3 1.5M21.5 8.5V14l-5 3.5-2.5-1.5M5.5 15.5l3 2.5 1.5-1.2 1.5 1.2 1.5-1.2L14 16M9 7.5l-1.5 3a1.5 1.5 0 0 0 2.4 1.6L12 10l4.5 4" />,
)
export const MailIcon = icon(
  'MailIcon',
  <>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </>,
)
export const DocumentIcon = icon(
  'DocumentIcon',
  <path d="M6 3.5h8l4 4v13H6zM14 3.5v4h4M9 12h6M9 15.5h6" />,
)
export const PlayIcon = icon('PlayIcon', <path d="M8 5.5v13l10.5-6.5z" />)
