import { useId } from 'react'

import { aPath, halo, leafGradient, leafPath, leafStops, lime, viewBox } from './geometry'

export type LogoMarkProps = {
  /** `colour`: the brand greens. `mono`: one colour, taken from CSS `color`. */
  variant?: 'colour' | 'mono'
  /** Accessible name. Pass an empty string when the mark sits next to the visible name. */
  title?: string
  className?: string
}

/** The Agrinvest "A" with leaf. Size it with width or height; the aspect ratio is fixed. */
export function LogoMark({ variant = 'colour', title = 'Agrinvest', className }: LogoMarkProps) {
  const id = useId()
  const maskId = `${id}-halo`
  const gradientId = `${id}-leaf`
  const mono = variant === 'mono'

  return (
    <svg
      viewBox={viewBox}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="300">
          <rect width="300" height="300" fill="#fff" />
          <path d={leafPath} fill="#000" stroke="#000" strokeWidth={halo} strokeLinejoin="round" />
        </mask>
        {!mono && (
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1={leafGradient.x1}
            x2={leafGradient.x2}
            y1="0"
            y2="0"
          >
            {leafStops.map((stop) => (
              <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>
        )}
      </defs>
      <path d={aPath} fill={mono ? 'currentColor' : lime} mask={`url(#${maskId})`} />
      <path d={leafPath} fill={mono ? 'currentColor' : `url(#${gradientId})`} />
    </svg>
  )
}
