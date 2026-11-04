'use client'

import Script from 'next/script'
import { useEffect, useState, useSyncExternalStore } from 'react'

import { ConsentBanner } from '@ds/patterns/ConsentBanner'
import type { Locale } from '@/i18n/config'
import { CHANGE_EVENT, OPEN_EVENT } from '@/lib/consent'

/**
 * Statistics with consent. Google Analytics 4 loads only after the visitor accepts; before
 * that nothing is sent and no cookie is set. Consent Mode v2 starts every signal as denied
 * and grants analytics storage only (ads stay denied). The choice is kept for a year in the
 * `consent` cookie and can be changed from the footer ("Cookie settings").
 *
 * Events: generate_lead (with the lead type), call_click (tel: links), email_click (mailto:).
 * `order` is reserved for the shop (Phase 3).
 */
type Choice = 'granted' | 'denied'

const COOKIE = 'consent'

/** The saved choice as an external store: undefined on the server, so nothing renders there. */
const subscribe = (onChange: () => void) => {
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => window.removeEventListener(CHANGE_EVENT, onChange)
}

const copy = {
  ro: {
    title: 'Cookie-uri pentru statistici',
    body: 'Folosim Google Analytics ca să vedem ce pagini sunt utile, doar dacă ești de acord. Nu folosim cookie-uri pentru reclame.',
    accept: 'Accept',
    reject: 'Refuz',
    privacy: 'Detalii',
  },
  en: {
    title: 'Statistics cookies',
    body: 'We use Google Analytics to see which pages help, only if you agree. We do not use advertising cookies.',
    accept: 'Accept',
    reject: 'Refuse',
    privacy: 'Details',
  },
}

type Gtag = (...args: unknown[]) => void
declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: Gtag
  }
}

const readChoice = (): Choice | null => {
  const value = document.cookie.match(/(?:^|; )consent=(granted|denied)/)?.[1]
  return (value as Choice | undefined) ?? null
}

const saveChoice = (choice: Choice) => {
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${COOKIE}=${choice}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`
}

/** Removes Google Analytics cookies after consent is withdrawn. */
const clearGaCookies = () => {
  for (const name of document.cookie.split('; ').map((c) => c.split('=')[0])) {
    if (name === '_ga' || name.startsWith('_ga_')) {
      for (const domain of ['', `; domain=${location.hostname.replace(/^www\./, '.')}`]) {
        document.cookie = `${name}=; Max-Age=0; Path=/${domain}`
      }
    }
  }
}

export function Analytics({
  gaId,
  locale,
  privacyHref,
}: {
  gaId: string
  locale: Locale
  privacyHref: string
}) {
  // undefined on the server and during hydration: the banner never renders there (no CLS).
  const choice = useSyncExternalStore<Choice | null | undefined>(
    subscribe,
    readChoice,
    () => undefined,
  )
  const [reopened, setReopened] = useState(false)
  const open = choice === null || reopened

  useEffect(() => {
    const reopen = () => setReopened(true)
    window.addEventListener(OPEN_EVENT, reopen)
    return () => window.removeEventListener(OPEN_EVENT, reopen)
  }, [])

  useEffect(() => {
    if (choice !== 'granted') return
    const track = (name: string, params?: Record<string, unknown>) =>
      window.gtag?.('event', name, params)
    const onLead = (e: Event) =>
      track('generate_lead', { lead_type: (e as CustomEvent<{ type: string }>).detail?.type })
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href]')
      const href = link?.getAttribute('href') ?? ''
      if (href.startsWith('tel:')) track('call_click', { link_url: href })
      else if (href.startsWith('mailto:')) track('email_click', { link_url: href })
    }
    window.addEventListener('agrinvest:lead', onLead)
    document.addEventListener('click', onClick, { capture: true })
    return () => {
      window.removeEventListener('agrinvest:lead', onLead)
      document.removeEventListener('click', onClick, { capture: true })
    }
  }, [choice])

  const decide = (next: Choice) => {
    saveChoice(next)
    if (next === 'denied') {
      window.gtag?.('consent', 'update', { analytics_storage: 'denied' })
      clearGaCookies()
    }
    setReopened(false)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  const t = copy[locale]
  return (
    <>
      {choice === 'granted' && (
        <>
          <Script id="ga-consent" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});
gtag('consent','update',{analytics_storage:'granted'});
gtag('js',new Date());gtag('config',${JSON.stringify(gaId)});`}
          </Script>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
            strategy="afterInteractive"
          />
        </>
      )}
      {open && (
        <ConsentBanner
          title={t.title}
          body={t.body}
          accept={t.accept}
          reject={t.reject}
          privacy={{ href: privacyHref, label: t.privacy }}
          onAccept={() => decide('granted')}
          onReject={() => decide('denied')}
        />
      )}
    </>
  )
}
