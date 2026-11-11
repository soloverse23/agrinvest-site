import type { ReactNode } from 'react'

import { cx } from '../lib/cx'

/**
 * GHS hazard pictograms for the product page's safety section (server only). A red-bordered
 * diamond with a black symbol, as on the label. These are simplified drawings for the design
 * stage: the official UNECE artwork replaces them before launch (open point in 7c.4).
 */
export type GhsCode =
  'GHS01' | 'GHS02' | 'GHS03' | 'GHS04' | 'GHS05' | 'GHS06' | 'GHS07' | 'GHS08' | 'GHS09'

const symbols: Record<GhsCode, ReactNode> = {
  // Exploding bomb
  GHS01: (
    <>
      <circle cx="46" cy="56" r="11" />
      <path d="M57 45l8-8M62 55h9M56 33l2-7M44 31l-2-7M33 40l-6-5M66 66l6 5" strokeWidth="4" />
    </>
  ),
  // Flame
  GHS02: (
    <>
      <path d="M50 26c4 10 14 14 14 28a14 14 0 0 1-28 0c0-7 4-11 7-14 0 6 3 8 5 8-2-8 0-16 2-22z" />
      <path d="M32 72h36" strokeWidth="4" />
    </>
  ),
  // Flame over circle
  GHS03: (
    <>
      <circle cx="50" cy="60" r="11" className="fill-none" strokeWidth="5" />
      <path d="M50 26c3 6 9 9 9 17a9 9 0 0 1-18 0c0-4 3-7 5-9 0 4 2 5 3 5-1-5 0-9 1-13z" />
      <path d="M32 76h36" strokeWidth="4" />
    </>
  ),
  // Gas cylinder
  GHS04: <rect x="30" y="44" width="40" height="14" rx="7" transform="rotate(-20 50 51)" />,
  // Corrosion: two tubes pouring onto a surface and a hand
  GHS05: (
    <>
      <path d="M33 30l10 4-4 10-10-4zM57 34l10-4 4 10-10 4z" />
      <path d="M37 48v6M63 48v6" strokeWidth="3" />
      <path d="M28 64h18v6H28zM54 62c6 0 14 2 18 6l-2 4H54z" />
    </>
  ),
  // Skull and crossbones
  GHS06: (
    <>
      <path d="M50 28c-10 0-16 7-16 15 0 6 3 9 6 11v5h20v-5c3-2 6-5 6-11 0-8-6-15-16-15z" />
      <circle cx="44" cy="44" r="3.5" className="fill-raised stroke-none" />
      <circle cx="56" cy="44" r="3.5" className="fill-raised stroke-none" />
      <path d="M33 64l34 10M67 64L33 74" strokeWidth="5" />
    </>
  ),
  // Exclamation mark
  GHS07: (
    <>
      <path d="M45 28h10l-2 30h-6z" />
      <circle cx="50" cy="68" r="5" />
    </>
  ),
  // Health hazard: a bust with a star on the chest
  GHS08: (
    <>
      <circle cx="50" cy="34" r="7" />
      <path d="M34 74c0-14 6-24 16-24s16 10 16 24z" />
      <path
        d="M50 54l2.5 6h6l-5 4 2 6-5.5-4-5.5 4 2-6-5-4h6z"
        className="fill-raised stroke-raised"
        strokeWidth="1"
      />
    </>
  ),
  // Environment: a bare tree and a dead fish
  GHS09: (
    <>
      <path d="M40 66V38M40 46l-8-8M40 52l8-8" className="fill-none" strokeWidth="4" />
      <path d="M48 66c4-5 12-6 18-2l5-4v12l-5-4c-6 4-14 3-18-2z" />
      <path d="M30 74h42" strokeWidth="3" />
    </>
  ),
}

export function GhsPictogram({
  code,
  label,
  className,
}: {
  code: GhsCode
  /** What it means, for screen readers: e.g. "GHS07: iritant". */
  label: string
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={label}
      className={cx('size-16', className)}
      focusable="false"
    >
      <title>{label}</title>
      <path
        d="M50 4 96 50 50 96 4 50z"
        className="fill-raised stroke-danger"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <g className="fill-ink stroke-ink" strokeLinecap="round" strokeLinejoin="round">
        {symbols[code]}
      </g>
    </svg>
  )
}

export const ghsCodes = Object.keys(symbols) as GhsCode[]
