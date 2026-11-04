import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'
import { preload } from 'react-dom'

import { AnalyticsLazy } from '@/components/AnalyticsLazy'
import { isLocale, locales } from '@/i18n/config'
import { fixedUrl } from '@/i18n/ui'
import { getSeoDefaults } from '@/lib/content/globals'
import { SITE_INDEXABLE, SITE_URL } from '@/lib/site'
import '../globals.css'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

const skip = { ro: 'Sari la conținut', en: 'Skip to content' }

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const seo = isLocale(locale) ? await getSeoDefaults(locale) : null
  return {
    metadataBase: new URL(SITE_URL),
    title: seo?.siteName ?? 'Agrinvest',
    // Pre-launch: nothing is indexed until Phase 8 sets SITE_INDEXABLE=true.
    robots: { index: SITE_INDEXABLE, follow: SITE_INDEXABLE },
    verification: {
      google: seo?.verification?.google || undefined,
      other: seo?.verification?.bing ? { 'msvalidate.01': seo.verification.bing } : undefined,
    },
    icons: { icon: '/brand/logo-mark.svg' },
  }
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
  const gaId = (await getSeoDefaults(locale)).analytics?.ga4
  // The one font file (Romanian + English subset), fetched with the HTML so it is usually in
  // time for the first render (font-display: optional never swaps it in later).
  preload('/fonts/onest-ro-wght.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  })

  return (
    <html lang={locale}>
      <body>
        <a
          href="#main"
          className="sr-only rounded-md bg-raised px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        >
          {skip[locale]}
        </a>
        {children}
        {gaId && (
          <AnalyticsLazy gaId={gaId} locale={locale} privacyHref={fixedUrl('privacy', locale)} />
        )}
      </body>
    </html>
  )
}
