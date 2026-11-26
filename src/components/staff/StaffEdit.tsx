'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Locale } from '@/i18n/config'

type Bar = React.ComponentType<{ path: string; locale: Locale }>

/**
 * "Edit this page" for signed-in staff. Visitors get only this loader: it reads the
 * `ag-staff` flag that the proxy sets for panel sessions and loads the bar only when it is there.
 */
export function StaffEdit({ locale }: { locale: Locale }) {
  const path = usePathname()
  const [Bar, setBar] = useState<Bar | null>(null)

  useEffect(() => {
    if (!/(?:^|;\s*)ag-staff=1/.test(document.cookie)) return
    void import('./StaffEditBar').then((m) => setBar(() => m.StaffEditBar))
  }, [])

  return Bar ? <Bar path={path} locale={locale} /> : null
}
