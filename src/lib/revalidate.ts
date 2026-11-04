import { revalidateTag } from 'next/cache'

/** Cache tags shared by the data loaders (`src/lib/content`) and the Payload hooks. */
export const tags = {
  pages: 'pages',
  bases: 'bases',
  crops: 'crops',
  counties: 'counties',
  people: 'people',
  global: (slug: string) => `global:${slug}`,
} as const

/**
 * Marks tagged data stale after a content change. Hooks also run outside a Next request
 * (seed scripts, tests), where there is no cache to revalidate; those calls are skipped.
 */
export function revalidate(...list: string[]): void {
  for (const tag of list) {
    try {
      revalidateTag(tag, 'max')
    } catch {
      // Not inside a Next.js server context.
    }
  }
}
