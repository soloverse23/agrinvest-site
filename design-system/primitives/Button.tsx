import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

import { cx } from '../lib/cx'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'lime' | 'on-dark'
export type ButtonSize = 'sm' | 'md' | 'lg'

type Common = {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Icon after the label (e.g. an arrow). Decorative. */
  icon?: ReactNode
  /** Icon before the label. Decorative. */
  leadingIcon?: ReactNode
  fullWidth?: boolean
  children: ReactNode
}

export type ButtonProps = Common &
  (
    | ({ href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'>)
    | ({ href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>)
  )

const base =
  'group inline-flex items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap no-underline transition duration-150 ease-move active:scale-98 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50'

const sizes: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-small',
  md: 'h-12 px-6 text-body',
  lg: 'h-14 px-7 text-lead',
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent shadow-soft hover:bg-accent-hover',
  secondary: 'bg-raised text-ink shadow-soft ring-1 ring-line-strong ring-inset hover:bg-surface',
  ghost: 'text-accent hover:bg-accent-soft',
  lime: 'bg-lime text-forest hover:bg-lime-hover',
  'on-dark': 'text-on-forest ring-1 ring-on-forest/40 ring-inset hover:bg-forest-raised',
}

/** Pill button. Renders a link when `href` is given (next/link for internal pages). */
export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  leadingIcon,
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps & { className?: string }) {
  const classes = cx(base, sizes[size], variants[variant], fullWidth && 'w-full', className)
  const content = (
    <>
      {leadingIcon && (
        <span className="-ml-1 inline-flex size-5 shrink-0 *:size-full" aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      <span>{children}</span>
      {icon && (
        <span
          className="-mr-1 inline-flex size-5 shrink-0 transition-transform *:size-full duration-150 ease-move group-hover:translate-x-0.5"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
    </>
  )

  if (props.href !== undefined) {
    const { href, ...rest } = props as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
    // Internal pages go through next/link; tel:, mailto: and external URLs stay plain links.
    return href.startsWith('/') ? (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    ) : (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    )
  }
  return (
    <button
      type="button"
      className={classes}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  )
}
