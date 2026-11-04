'use client'

import dynamic from 'next/dynamic'

/**
 * Analytics in its own chunk: it renders nothing on the server, and without a GA4 ID in SEO
 * defaults the layout does not mount it, so the site ships none of this code.
 */
export const AnalyticsLazy = dynamic(() => import('./Analytics').then((m) => m.Analytics), {
  ssr: false,
})
