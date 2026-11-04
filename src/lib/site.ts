/**
 * Site-wide settings read from the environment.
 * `SITE_INDEXABLE` stays false until the launch phase (Phase 8): every page is noindex,
 * unconfirmed figures show a marker, and IndexNow does not ping.
 */
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL

/** Public origin: the configured URL, else Vercel's production domain, else local dev. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (vercelHost ? `https://${vercelHost}` : 'http://localhost:3100')
).replace(/\/$/, '')

export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === 'true'

/** Absolute URL for a site path: `/despre` → `https://agrinvest.ro/despre`. */
export const absoluteUrl = (path: string): string =>
  path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
