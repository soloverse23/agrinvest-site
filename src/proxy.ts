import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { defaultLocale, locales } from './i18n/config'

/**
 * Locale routing.
 * - `/en/...` is served as is.
 * - `/ro/...` permanently redirects to the unprefixed URL, so each page has one canonical address.
 * - Every other path is rewritten internally to `/ro/...`.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const [, first] = pathname.split('/')

  if (first === defaultLocale) {
    const stripped = pathname.slice(defaultLocale.length + 1) || '/'
    return NextResponse.redirect(new URL(stripped + search, request.url), 308)
  }

  if ((locales as readonly string[]).includes(first)) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  // Skip Payload (admin + API), Next internals and files with an extension.
  matcher: ['/((?!admin|api|_next|.*\\..*).*)'],
}
