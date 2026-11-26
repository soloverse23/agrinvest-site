import type { I18nClient } from '@payloadcms/translations'
import React from 'react'

import { LogoMark } from '@ds/brand/LogoMark'

type Props = { i18n?: I18nClient }

const langOf = (i18n?: I18nClient) => (i18n?.language === 'en' ? 'en' : 'ro')

const text = {
  kicker: { ro: 'Panoul echipei', en: 'Team panel' },
  title: {
    ro: 'Tot ce scrie pe site, la un click distanță.',
    en: 'Everything on the site, one click away.',
  },
  points: {
    ro: [
      'Găsești pagina după linkul de pe site.',
      'Schimbi textul și îl publici în câteva secunde.',
      'Fiecare departament vede doar ce îi aparține.',
    ],
    en: [
      'Find a page by its link on the site.',
      'Change the text and publish it in seconds.',
      'Each department sees only its own sections.',
    ],
  },
  heading: { ro: 'Intră în panou', en: 'Sign in' },
  hint: {
    ro: 'Folosește numele de utilizator și parola departamentului tău.',
    en: 'Use your department’s username and password.',
  },
  help: {
    ro: 'Ai uitat parola? Cere-i administratorului una nouă.',
    en: 'Forgot the password? Ask the administrator for a new one.',
  },
}

/** Login screen, left side: the brand panel over a field photo (wide screens only). */
export function LoginAside({ i18n }: Props) {
  const lang = langOf(i18n)
  return (
    <aside className="login-aside" aria-hidden="false">
      <div className="login-aside__brand">
        <LogoMark title="" variant="mono" className="login-aside__mark" />
        <span>Agrinvest</span>
      </div>
      <div className="login-aside__body">
        <p className="login-aside__kicker">{text.kicker[lang]}</p>
        <h2 className="login-aside__title">{text.title[lang]}</h2>
        <ul className="login-aside__points">
          {text.points[lang].map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
      <p className="login-aside__foot">agrinvest.ro</p>
    </aside>
  )
}

/** Login screen, above the form: a heading and who signs in with what. */
export function LoginIntro({ i18n }: Props) {
  const lang = langOf(i18n)
  return (
    <div className="login-intro">
      <h1>{text.heading[lang]}</h1>
      <p>{text.hint[lang]}</p>
    </div>
  )
}

/** Login screen, under the form. */
export function LoginHelp({ i18n }: Props) {
  return <p className="login-help">{text.help[langOf(i18n)]}</p>
}
