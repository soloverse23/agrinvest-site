'use client'

import { useAuth } from '@payloadcms/ui'
import React, { useEffect } from 'react'

/**
 * Marks the panel as `simple` for department accounts and `full` for the admin, so the panel
 * styles can hide the technical parts (API tab, column picker) from people who only edit text.
 */
export function PanelMode({ children }: { children?: React.ReactNode }) {
  const { user } = useAuth<{ roles?: string[] | null }>()
  const mode = user?.roles?.includes('admin') ? 'full' : 'simple'
  useEffect(() => {
    document.documentElement.dataset.panel = mode
  }, [mode])
  return <>{children}</>
}
