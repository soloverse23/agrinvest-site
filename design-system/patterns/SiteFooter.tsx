import Link from 'next/link'
import type { ReactNode } from 'react'

import { PhoneIcon } from '../icons/icons'
import { socialIcons, socialNetworkOf } from '../icons/social'
import { Lockup } from './parts'

export type SiteFooterProps = {
  homeHref: string
  /** One or two sentences under the logo. */
  about: string
  /** Contact lines (phone, email, address); values can carry a "to confirm" marker. */
  contact: { label: string; value: ReactNode; href?: string }[]
  columns: { title: string; links: { href: string; label: string }[] }[]
  social?: { href: string; label: string }[]
  /** Small print: legal names, registrations. */
  legal?: string | null
  bottomLinks?: { href: string; label: string }[]
  /** Extra controls next to the bottom links, e.g. the cookie settings button. */
  extra?: ReactNode
  labels: { contact: string; social: string; footer: string }
}

const isInternal = (href: string) => href.startsWith('/')

/**
 * Site footer on forest: the brand and how to reach us first, then the sections by need,
 * then legal identity. Server component; no JavaScript.
 */
export function SiteFooter({
  homeHref,
  about,
  contact,
  columns,
  social = [],
  legal,
  bottomLinks = [],
  extra,
  labels,
}: SiteFooterProps) {
  return (
    <footer aria-label={labels.footer} className="mt-24 bg-forest text-on-forest md:mt-32">
      <div className="mx-auto grid max-w-page gap-12 px-4 py-14 md:px-8 md:py-16 lg:grid-cols-12">
        <div className="grid content-start gap-6 lg:col-span-4">
          <Link href={homeHref} className="w-fit no-underline" aria-label="Agrinvest">
            <Lockup tone="light" />
          </Link>
          <p className="max-w-sm text-small text-on-forest-muted">{about}</p>
          <div className="grid gap-3">
            <h2 className="text-caption font-medium text-on-forest-muted">{labels.contact}</h2>
            <ul className="grid gap-2">
              {contact.map((c) => (
                <li key={c.label} className="text-small">
                  <span className="sr-only">{c.label}: </span>
                  {c.href ? (
                    <a
                      href={c.href}
                      className="inline-flex items-center gap-2 font-semibold text-on-forest no-underline hover:text-lime"
                    >
                      {c.href.startsWith('tel:') && <PhoneIcon className="size-4 text-lime" />}
                      <span className="tabular-nums">{c.value}</span>
                    </a>
                  ) : (
                    <span className="text-on-forest-muted">{c.value}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:col-span-8">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="grid content-start gap-3">
              <h2 className="text-caption font-medium text-on-forest-muted">{col.title}</h2>
              <ul className="grid gap-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      prefetch={false}
                      className="text-small text-on-forest no-underline hover:text-lime hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-on-forest/15">
        <div className="mx-auto grid max-w-page gap-4 px-4 py-6 text-caption text-on-forest-muted md:px-8 lg:grid-cols-12 lg:items-center">
          {legal && <p className="lg:col-span-7">{legal}</p>}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:col-span-5 lg:justify-end">
            {bottomLinks.map((l) =>
              isInternal(l.href) ? (
                <Link
                  key={l.href}
                  href={l.href}
                  prefetch={false}
                  className="text-on-forest-muted hover:text-on-forest"
                >
                  {l.label}
                </Link>
              ) : (
                <a key={l.href} href={l.href} className="text-on-forest-muted hover:text-on-forest">
                  {l.label}
                </a>
              ),
            )}
            {extra}
            {social.length > 0 && (
              <ul aria-label={labels.social} className="flex flex-wrap items-center gap-3">
                {social.map((s) => {
                  const network = socialNetworkOf(s.href)
                  const Icon = network ? socialIcons[network] : null
                  return (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        rel="me noopener"
                        aria-label={s.label}
                        title={s.label}
                        className="inline-flex size-9 items-center justify-center rounded-full text-on-forest-muted ring-1 ring-on-forest/20 transition-colors hover:text-lime hover:ring-lime"
                      >
                        {Icon ? <Icon className="size-5" /> : s.label}
                      </a>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
