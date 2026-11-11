import { preload } from 'react-dom'

import { cx } from '../lib/cx'
import { TALL, WIDE, type Focus } from '../lib/media'

/** Next's default image widths; the image optimizer accepts only configured sizes. */
const WIDTHS = [640, 750, 828, 1080, 1200, 1920]

type PhotoProps = {
  src: string
  alt: string
  /** Quality from `images.qualities` in next.config.ts. */
  quality?: 60 | 75
  sizes?: string
  /** Fills the nearest positioned parent. */
  fill?: boolean
  width?: number
  height?: number
  /** The page's largest image: loads eagerly and is preloaded. */
  priority?: boolean
  /** A portrait crop for screens held upright (art direction), served as it is. */
  tall?: string
  /** The point to keep in view when `object-cover` crops the photo (the media's focal point). */
  focus?: Focus
  className?: string
}

/**
 * An optimised photo rendered entirely on the server. It writes the `/_next/image` srcset
 * itself because importing anything from `next/image`, even `getImageProps`, puts its client
 * component in the page's JavaScript. Only Payload media is optimised (`images.localPatterns`
 * in next.config.ts); any other source is served as it is.
 */
export function Photo({
  src,
  alt,
  quality = 75,
  sizes = '100vw',
  fill,
  width,
  height,
  priority,
  tall,
  focus,
  className,
}: PhotoProps) {
  const optimised = src.startsWith('/api/media/')
  const url = (w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${quality}`
  const srcSet = optimised ? WIDTHS.map((w) => `${url(w)} ${w}w`).join(', ') : undefined
  const fallback = optimised ? url(WIDTHS[WIDTHS.length - 1]) : src

  if (priority && !tall) {
    preload(fallback, {
      as: 'image',
      fetchPriority: 'high',
      imageSrcSet: srcSet,
      imageSizes: srcSet ? sizes : undefined,
    })
  }
  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- see the note above
    <img
      src={fallback}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={cx(fill && 'absolute inset-0 size-full', className)}
      style={focus ? { objectPosition: `${focus.x}% ${focus.y}%` } : undefined}
    />
  )
  if (!tall) return img
  // `preload()` takes no media query, so each crop gets its own preload link: a phone fetches
  // only the tall one. React hoists the links into the head.
  return (
    <>
      {priority && (
        <>
          <link rel="preload" as="image" href={tall} media={TALL} fetchPriority="high" />
          <link
            rel="preload"
            as="image"
            href={fallback}
            imageSrcSet={srcSet}
            imageSizes={srcSet ? sizes : undefined}
            media={WIDE}
            fetchPriority="high"
          />
        </>
      )}
      <picture>
        <source media={TALL} srcSet={tall} />
        {img}
      </picture>
    </>
  )
}
