/**
 * Where each news source's photos live (owner exception, decision 0011 update 2026-11-15):
 * the feed's own image, shown as a small thumbnail through `next/image`. An image on any
 * other host is dropped. No imports: `next.config.ts` reads this list for `remotePatterns`.
 *
 * Agrointel and Reuters (Google News) carry no image in their feeds; their cards show the
 * source name instead.
 */
export type ImageHost = { hostname: string; pathname: string }

export const newsImageHosts: Record<string, ImageHost[]> = {
  zf: [{ hostname: 'storage0.dms.mpinteractiv.ro', pathname: '/media/**' }],
  profit: [{ hostname: 'i0.1616.ro', pathname: '/media/**' }],
  mediafax: [{ hostname: 'www.mediafax.ro', pathname: '/wp-content/uploads/**' }],
  g4media: [{ hostname: 'www.g4media.ro', pathname: '/wp-content/uploads/**' }],
  madr: [{ hostname: 'www.madr.ro', pathname: '/images/**' }],
  'ec-agri': [{ hostname: 'ec.europa.eu', pathname: '/newsroom/repository/picture/**' }],
  // Revista Ferma serves its images through Jetpack's CDN (i0–i2.wp.com/revista-ferma.ro/…).
  'revista-ferma': [
    { hostname: 'i0.wp.com', pathname: '/revista-ferma.ro/**' },
    { hostname: 'i1.wp.com', pathname: '/revista-ferma.ro/**' },
    { hostname: 'i2.wp.com', pathname: '/revista-ferma.ro/**' },
    { hostname: 'revista-ferma.ro', pathname: '/wp-content/uploads/**' },
  ],
}

/** Every allowed host, for `images.remotePatterns`. */
export const allNewsImageHosts: ImageHost[] = Object.values(newsImageHosts).flat()

const toRegExp = (glob: string) =>
  new RegExp(`^${glob.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '.*')}$`)

/** True when `url` is an https image on one of the source's hosts. */
export function imageAllowed(source: string, url: string): boolean {
  let u: URL
  try {
    u = new URL(url)
  } catch {
    return false
  }
  if (u.protocol !== 'https:') return false
  return (newsImageHosts[source] ?? []).some(
    (h) => u.hostname === h.hostname && toRegExp(h.pathname).test(u.pathname),
  )
}
