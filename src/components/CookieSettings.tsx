'use client'

import { OPEN_EVENT } from '@/lib/consent'

/** Footer link that reopens the consent banner. Kept apart so it does not pull in Analytics. */
export function CookieSettings({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className="cursor-pointer text-on-forest-muted hover:text-on-forest"
    >
      {label}
    </button>
  )
}
