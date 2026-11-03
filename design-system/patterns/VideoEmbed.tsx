'use client'

import Image from 'next/image'
import { useState } from 'react'

import { PlayIcon } from '../icons/icons'

export type VideoEmbedProps = {
  youtubeId: string
  title: string
  /** Poster: the CMS image, or YouTube's own thumbnail when there is none. */
  poster?: { src: string; alt: string } | null
  caption?: string | null
  labels: { play: string; watch: string }
}

/**
 * YouTube video that loads only on click (privacy-enhanced domain): until then the page
 * carries a poster and a link, no player scripts and no third-party cookies.
 * Without JavaScript the poster links to the video on YouTube.
 */
export function VideoEmbed({ youtubeId, title, poster, caption, labels }: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false)
  const watchUrl = `https://www.youtube.com/watch?v=${youtubeId}`
  const thumb = poster ?? { src: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`, alt: '' }

  return (
    <figure className="grid gap-3">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-ink">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            className="absolute inset-0 size-full"
          />
        ) : (
          <a
            href={watchUrl}
            onClick={(e) => {
              e.preventDefault()
              setPlaying(true)
            }}
            className="group absolute inset-0 block text-on-forest"
          >
            <Image
              src={thumb.src}
              alt={thumb.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              unoptimized={!poster}
              className="object-cover opacity-85 transition-opacity duration-300 group-hover:opacity-100"
            />
            <span className="absolute inset-0 bg-linear-to-t from-ink/70 to-transparent" />
            <span className="absolute bottom-5 left-5 flex items-center gap-3">
              <span className="inline-flex size-14 items-center justify-center rounded-full bg-lime text-forest transition-transform duration-150 ease-move group-hover:scale-105">
                <PlayIcon className="size-6 translate-x-0.5 fill-current" />
              </span>
              <span className="grid text-left">
                <span className="text-small font-semibold">{labels.play}</span>
                <span className="text-caption text-on-forest-muted">{title}</span>
              </span>
            </span>
          </a>
        )}
      </div>
      {caption && <figcaption className="text-small text-muted">{caption}</figcaption>}
    </figure>
  )
}
