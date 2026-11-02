import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { isLocale, locales } from '@/i18n/config'
import '../globals.css'

export const dynamicParams = false

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Agrinvest',
  // Pre-launch: nothing is indexed until Phase 8 flips this.
  robots: { index: false, follow: false },
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  )
}
