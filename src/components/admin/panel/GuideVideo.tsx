'use client'

import React, { useRef, useState } from 'react'

export type Chapter = { at: number; label: string }
export type GuideVideoItem = {
  key: string
  label: string
  src: string
  poster: string
  chapters: Chapter[]
}

const time = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

/**
 * The department's guide video with its chapters; a click on a chapter plays from there. With
 * several videos (the admin, or an account in two departments) a row of tabs picks one.
 */
export function GuideVideo({ videos, title }: { videos: GuideVideoItem[]; title: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [index, setIndex] = useState(0)
  const [now, setNow] = useState(0)
  const video = videos[index] ?? videos[0]
  if (!video) return null
  const current = video.chapters.reduce((acc, c, i) => (now >= c.at ? i : acc), 0)

  return (
    <div className="guide-video">
      {videos.length > 1 && (
        <div className="guide-video__tabs" role="tablist">
          {videos.map((v, i) => (
            <button
              key={v.key}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={i === index ? 'is-current' : undefined}
              onClick={() => {
                setIndex(i)
                setNow(0)
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}
      <div className="guide-video__body">
        <div className="guide-video__frame">
          <video
            key={video.src}
            ref={ref}
            src={video.src}
            poster={video.poster}
            controls
            preload="none"
            playsInline
            aria-label={`${title}: ${video.label}`}
            onTimeUpdate={(e) => setNow(e.currentTarget.currentTime)}
          />
        </div>
        <ol className="guide-video__chapters">
          {video.chapters.map((c, i) => (
            <li key={`${c.at}-${c.label}`}>
              <button
                type="button"
                className={i === current && now > 0 ? 'is-current' : undefined}
                onClick={() => {
                  const v = ref.current
                  if (!v) return
                  v.currentTime = c.at
                  void v.play()
                }}
              >
                <span className="guide-video__time">{time(c.at)}</span>
                <span>{c.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
