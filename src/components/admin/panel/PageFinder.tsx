'use client'

import { useConfig } from '@payloadcms/ui'
import React, { useEffect, useId, useState } from 'react'

import type { FoundRow } from '@/lib/panel/find'

const text = {
  label: { ro: 'Găsește pagina', en: 'Find the page' },
  placeholder: {
    ro: 'Lipește linkul de pe site sau scrie titlul…',
    en: 'Paste the link from the site or type the title…',
  },
  searching: { ro: 'Caut…', en: 'Searching…' },
  none: {
    ro: 'Nu am găsit nimic în secțiunile tale. Verifică linkul sau încearcă alt cuvânt din titlu.',
    en: 'Nothing found in your sections. Check the link or try another word from the title.',
  },
  english: { ro: 'versiunea în engleză', en: 'English version' },
}

type Lang = 'ro' | 'en'

/** The finder on the panel home: a pasted site link or a title, results as edit links. */
export function PageFinder({ lang }: { lang: Lang }) {
  const { config } = useConfig()
  const id = useId()
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState<FoundRow[] | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setBusy(true)
      try {
        const res = await fetch(
          `${config.serverURL}${config.routes.api}/panel/find?q=${encodeURIComponent(q)}`,
          { credentials: 'include', signal: controller.signal },
        )
        const data = (await res.json()) as { rows?: FoundRow[] }
        setRows(data.rows ?? [])
      } catch {
        if (!controller.signal.aborted) setRows([])
      } finally {
        if (!controller.signal.aborted) setBusy(false)
      }
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, config.serverURL, config.routes.api])

  // Fewer than two letters: no results shown, whatever the last search returned.
  const shown = query.trim().length >= 2 ? rows : null

  return (
    <div className="panel-finder">
      <label className="panel-finder__label" htmlFor={id}>
        {text.label[lang]}
      </label>
      <input
        id={id}
        className="panel-finder__input"
        type="search"
        autoComplete="off"
        autoFocus
        placeholder={text.placeholder[lang]}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && shown?.[0]) window.location.assign(shown[0].href)
        }}
      />
      <div className="panel-finder__results" aria-live="polite">
        {busy && shown !== null && <p className="panel-finder__note">{text.searching[lang]}</p>}
        {!busy && shown?.length === 0 && <p className="panel-finder__note">{text.none[lang]}</p>}
        {!busy && shown && shown.length > 0 && (
          <ul>
            {shown.map((row) => (
              <li key={row.href}>
                <a href={row.href}>
                  <span className="panel-finder__title">{row.title}</span>
                  <span className="panel-finder__meta">
                    {row.section}
                    {row.locale === 'en' ? ` · ${text.english[lang]}` : ''}
                  </span>
                  {row.status && (
                    <span className={`panel-status panel-status--${row.status.tone}`}>
                      {row.status.label}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
