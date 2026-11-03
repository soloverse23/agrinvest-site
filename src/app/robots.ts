import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/lib/site'

/**
 * Search engines and AI crawlers may read every public page (indexing is controlled per page
 * by the robots meta tag, noindex until launch). Admin, API and preview routes are private.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/next/'] }],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  }
}
