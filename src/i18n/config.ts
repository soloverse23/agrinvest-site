/**
 * Site locales. Romanian is the default and is served without a prefix (`/`);
 * English lives under `/en`. `src/proxy.ts` enforces this.
 */
export const locales = ['ro', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'ro'

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value)

/** Public path for a locale-relative path: `('/despre', 'ro')` → `/despre`, `('/about', 'en')` → `/en/about`. */
export const localePath = (path: string, locale: Locale): string => {
  const clean = path === '/' ? '' : path
  return locale === defaultLocale ? clean || '/' : `/${locale}${clean}`
}

/** A request or document locale as a site locale; `all`, unknown or missing → the default. */
export const localeOf = (value: string | null | undefined): Locale =>
  value && isLocale(value) ? value : defaultLocale
