import React from 'react'

import type { Locale } from '@/i18n/config'

export type StaffEditLink = { label: string; href: string }

const text = {
  label: { ro: 'Editare pentru echipă', en: 'Staff editing' },
  hide: { ro: 'Ascunde', en: 'Hide' },
}

/**
 * Floating "Edit this page" links for signed-in staff, bottom right, above the mobile buy and
 * apply bars. Each link opens that document's edit screen in the panel. Visitors never see it.
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
  return (
    <nav
      aria-label={text.label[locale]}
      className="fixed right-4 bottom-24 z-40 flex flex-col items-end gap-2 md:right-8 md:bottom-8"
    >
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-small font-semibold text-on-accent shadow-floating hover:bg-accent-hover"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-4 fill-none stroke-current stroke-2"
          >
            <path
              d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {link.label}
        </a>
      ))}
      {onHide && (
        <button
          type="button"
          onClick={onHide}
          className="rounded-full bg-raised px-3 py-1 text-caption text-muted shadow-soft ring-1 ring-line"
        >
          {text.hide[locale]}
        </button>
      )}
    </nav>
  )
}
