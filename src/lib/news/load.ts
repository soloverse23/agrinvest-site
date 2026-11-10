import { unstable_cache } from 'next/cache'

import { payloadClient } from '@/lib/content/payload'
import { tags } from '@/lib/revalidate'
import { newsSources } from '@/lib/sources'

export type Headline = {
  id: number
  title: string
  url: string
  source: string
  publishedAt: string
  excerpt?: string | null
}

/**
 * The latest headlines from the feeds. Every item shows unless staff hide it (`ascuns`): the
 * feeds are licence-checked (decision 0008) and only carry title, date, link and the excerpt
 * the publisher allows. Public reads only.
 */
export const listHeadlines = unstable_cache(
  async (limit: number): Promise<Headline[]> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'news-items',
      where: { status: { not_equals: 'ascuns' } },
      sort: '-publishedAt',
      limit,
      depth: 0,
      overrideAccess: false,
    })
    return docs.map((d) => ({
      id: d.id,
      title: d.title,
      url: d.url,
      source: newsSources[d.source]?.name ?? d.source,
      publishedAt: d.publishedAt,
      excerpt: newsSources[d.source]?.excerptMax ? d.excerpt : null,
    }))
  },
  ['news:headlines'],
  { tags: [tags.news] },
)
