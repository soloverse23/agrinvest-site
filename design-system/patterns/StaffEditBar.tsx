import React from 'react'

import type { Locale } from '@/i18n/config'

export type StaffEditLink = { label: string; href: string }

const text = {
  label: { ro: 'Editare pentru echipă', en: 'Staff editing' },
  tag: { ro: 'Echipă', en: 'Staff' },
  hide: { ro: 'Ascunde', en: 'Hide' },
}

const Pencil = ({ className }: { className: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className={`fill-none stroke-current stroke-2 ${className}`}
  >
    <path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const Arrow = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="size-4 shrink-0 fill-none stroke-current stroke-2 transition-transform group-hover:translate-x-0.5"
  >
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/**
 * Floating staff card for signed-in staff, bottom right, above the mobile buy and apply bars.
 * Blue, not the site green, so it never reads as part of the page itself. The first link
 * (the page) is the main button; further links (sections) sit under it. Visitors never see it.
 */
export function StaffEditBar({
  links,
  locale,
  onHide,
}: {
  links: StaffEditLink[]
  locale: Locale
  onHide?: () => void
}) {
  if (links.length === 0) return null
  const [main, ...rest] = links
  return (
    <nav
      aria-label={text.label[locale]}
      className="fixed right-4 bottom-24 z-40 w-[min(18rem,calc(100vw-2rem))] rounded-xl bg-info p-2 text-on-accent shadow-floating ring-2 ring-info-soft md:right-8 md:bottom-8"
    >
      <div className="flex items-center justify-between gap-2 py-1 pr-1 pl-2">
        <span className="inline-flex items-center gap-2 text-caption font-semibold tracking-wider text-info-soft uppercase">
          <span aria-hidden="true" className="size-2 rounded-full bg-info-soft" />
          {text.tag[locale]}
        </span>
        {onHide && (
          <button
            type="button"
            onClick={onHide}
            aria-label={text.hide[locale]}
            title={text.hide[locale]}
            className="grid size-8 place-items-center rounded-full text-info-soft hover:bg-on-accent/15 hover:text-on-accent"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-4 fill-none stroke-current stroke-2"
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      <a
        href={main.href}
        className="group flex min-h-12 items-center gap-3 rounded-md bg-raised px-4 text-body font-bold text-info hover:bg-info-soft"
      >
        <Pencil className="size-5 shrink-0" />
        <span className="flex-1">{main.label}</span>
        <Arrow />
      </a>
      {rest.length > 0 && (
        <ul className="mt-1">
          {rest.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="group flex min-h-11 items-center gap-3 rounded-md px-4 text-small font-semibold hover:bg-on-accent/15"
              >
                <Pencil className="size-4 shrink-0 text-info-soft" />
                <span className="flex-1">{link.label}</span>
                <Arrow />
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}
