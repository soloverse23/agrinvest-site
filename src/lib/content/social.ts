import { unstable_cache } from 'next/cache'

import { tags } from '@/lib/revalidate'
import type { Media } from '@/payload-types'

import { payloadClient } from './payload'
import { focusOf, type Focus } from '@ds/lib/media'

export type SocialPostData = {
  id: number
  url: string
  text: string
  date: string
  image: { src: string; alt: string; focus?: Focus } | null
}

/** The newest visible LinkedIn posts (Phase 7), staff-picked. */
export const listSocialPosts = unstable_cache(
  async (limit: number): Promise<SocialPostData[]> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'social-posts',
      overrideAccess: false,
      depth: 1,
      sort: '-postedAt',
      limit,
      pagination: false,
    })
    return docs.map((d) => ({
      id: d.id,
      url: d.url,
      text: d.text,
      date: d.postedAt,
      image:
        typeof d.image === 'object' && d.image?.url
          ? {
              src: d.image.url,
              alt: (d.image as Media).alt ?? '',
              focus: focusOf(d.image as Media),
            }
          : null,
    }))
  },
  ['social-posts'],
  { tags: [tags.social] },
)
