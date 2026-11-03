import type { CropKey } from '../fixtures/sample'
import {
  BarleyIcon,
  MaizeIcon,
  RapeseedIcon,
  SunflowerIcon,
  WheatIcon,
  type IconProps,
} from '../icons/icons'
import { LogoMark } from '../brand/LogoMark'
import { cx } from '../lib/cx'

const cropIcons = {
  wheat: WheatIcon,
  maize: MaizeIcon,
  sunflower: SunflowerIcon,
  rapeseed: RapeseedIcon,
  barley: BarleyIcon,
}

/** The crop's line icon in a soft lime disc. */
export function CropBadge({ crop, size = 'md' }: { crop: CropKey; size?: 'sm' | 'md' }) {
  const Icon: (props: IconProps) => React.ReactNode = cropIcons[crop]
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-md bg-lime-soft text-forest',
        size === 'sm' ? 'size-8' : 'size-11',
      )}
      aria-hidden="true"
    >
      <Icon className={size === 'sm' ? 'size-5' : 'size-6'} />
    </span>
  )
}

/** Small area chart that stretches to its container width. Colour from `currentColor`. */
export function Sparkline({
  values,
  label,
  className,
}: {
  values: number[]
  label: string
  className?: string
}) {
  const [w, h, pad] = [120, 40, 3]
  const [min, max] = [Math.min(...values), Math.max(...values)]
  const span = max - min || 1
  const pts = values.map((v, i) => [
    (i * w) / (values.length - 1),
    h - pad - ((v - min) * (h - pad * 2)) / span,
  ])
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
      className={cx('block h-10 w-full', className)}
    >
      <path d={`${line} L${w} ${h} L0 ${h} Z`} fill="currentColor" fillOpacity={0.1} />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/** Logo mark + wordmark. `tone="light"` for dark backgrounds. */
export function Lockup({
  tone = 'dark',
  className,
}: {
  tone?: 'dark' | 'light'
  className?: string
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-2.5',
        tone === 'light' ? 'text-on-forest' : 'text-ink',
        className,
      )}
    >
      <LogoMark variant={tone === 'light' ? 'mono' : 'colour'} className="h-8 w-auto" title="" />
      <span className="text-h4 font-semibold tracking-tight">Agrinvest</span>
    </span>
  )
}
