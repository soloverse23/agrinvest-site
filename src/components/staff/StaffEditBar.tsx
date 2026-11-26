'use client'

import { StaffEditBar as Bar, type StaffEditLink } from '@ds/patterns/StaffEditBar'
import React, { useEffect, useState } from 'react'

import type { Locale } from '@/i18n/config'

/** Asks the panel what the signed-in account may edit on this page, then shows those links. */
export function StaffEditBar({ path, locale }: { path: string; locale: Locale }) {
  const [links, setLinks] = useState<StaffEditLink[]>([])
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    // The browser's own address: Romanian pages have no prefix there.
    fetch(`/api/panel/here?path=${encodeURIComponent(window.location.pathname)}`, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : { links: [] }))
      .then((data: { links?: StaffEditLink[] }) => setLinks(data.links ?? []))
      .catch(() => {
        if (!controller.signal.aborted) setLinks([])
      })
    return () => controller.abort()
  }, [path])

  return hidden ? null : <Bar links={links} locale={locale} onHide={() => setHidden(true)} />
}
