import type { ReactNode, SVGProps } from 'react'

/**
 * Agrinvest line icons: 24 × 24 grid, 1.75 stroke, round caps and joins, colour from `currentColor`.
 * Decorative by default; pass `label` when the icon carries meaning on its own.
 */
export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { label?: string }

export function icon(name: string, body: ReactNode) {
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
