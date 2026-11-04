import Link from 'next/link'

import { Button } from '../primitives/Button'

export type ConsentBannerProps = {
  title: string
  body: string
  accept: string
  reject: string
  privacy: { href: string; label: string }
  onAccept: () => void
  onReject: () => void
}

/**
 * Cookie consent for statistics, fixed at the bottom of the screen (it never moves the
 * page, so no layout shift). Refusing is as easy and as visible as accepting.
 */
export function ConsentBanner({
  title,
  body,
  accept,
  reject,
  privacy,
  onAccept,
  onReject,
}: ConsentBannerProps) {
  return (
    <section
      role="dialog"
      aria-label={title}
      className="fixed inset-x-4 bottom-4 z-50 grid gap-3 rounded-xl bg-raised p-5 shadow-floating ring-1 ring-line md:right-auto md:left-8 md:max-w-md"
    >
      <p className="font-semibold">{title}</p>
      <p className="text-small text-muted">
        {body}{' '}
        <Link href={privacy.href} prefetch={false} className="font-medium">
          {privacy.label}
        </Link>
      </p>
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Button variant="secondary" size="sm" onClick={onReject}>
          {reject}
        </Button>
        <Button variant="primary" size="sm" onClick={onAccept}>
          {accept}
        </Button>
      </div>
    </section>
  )
}
