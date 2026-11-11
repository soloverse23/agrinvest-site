import type { Locale } from '@/i18n/config'
import { formatDate } from '@/lib/format'

import { ExternalLinkIcon, LinkedinIcon } from '../icons/social'
import { Photo } from './Photo'
import { type Focus } from '../lib/media'

export type SocialPostCardProps = {
  url: string
  text: string
  /** ISO date of the post. */
  date: string
  image?: { src: string; alt: string; focus?: Focus } | null
  locale: Locale
  labels: { network: string; view: string }
}

/**
 * A LinkedIn post as a card: network and date, the post image if it has one, the start of the
 * text, and one link back to the post. The whole card is the link; no third-party script loads.
 */
export function SocialPostCard({ url, text, date, image, locale, labels }: SocialPostCardProps) {
  return (
    <article className="group relative grid grid-rows-[auto_1fr] overflow-hidden rounded-xl bg-raised ring-1 ring-line transition-shadow hover:shadow-raised">
      {image && (
        <div className="relative aspect-video overflow-hidden bg-surface">
          <Photo
            src={image.src}
            alt={image.alt}
            focus={image.focus}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="grid content-start gap-3 p-5 md:p-6">
        <p className="flex items-center gap-2 text-caption text-subtle">
          <LinkedinIcon aria-hidden className="size-5 text-accent" />
          <span className="font-semibold text-ink">{labels.network}</span>
          <time dateTime={date}>{formatDate(new Date(date), locale)}</time>
        </p>
        <p className="line-clamp-6 text-body text-ink">{text}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener"
          className="mt-1 inline-flex w-fit items-center gap-2 text-small font-semibold text-accent no-underline after:absolute after:inset-0 group-hover:underline"
        >
          {labels.view}
          <ExternalLinkIcon aria-hidden className="size-4" />
        </a>
      </div>
    </article>
  )
}
