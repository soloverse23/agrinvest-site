import type { Locale } from '@/i18n/config'

/** The Locale toolbar value in a story's globals. */
export const storyLocale = (globals: Record<string, unknown>): Locale =>
  globals.locale === 'en' ? 'en' : 'ro'
