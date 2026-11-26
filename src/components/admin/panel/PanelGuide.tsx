import React from 'react'

import type { DepartmentRole } from '@/access/departments'
import type { PanelLang } from '@/lib/panel/sections'

import { departments } from '@/access/departments'
import videos from '@/lib/panel/guide-videos.json'

import { GuideVideo, type GuideVideoItem } from './GuideVideo'
import { SearchIcon, SectionIcon } from './PanelIcons'

type L = { ro: string; en: string }

const t = {
  kicker: { ro: 'Ghid', en: 'Guide' },
  title: { ro: 'Cum lucrezi cu panoul', en: 'How to work with the panel' },
  lead: {
    ro: 'Un minut de video despre secțiunile tale: cum ajungi la ele, cum schimbi textul și cum publici. Nu ai cum să strici site-ul: linkurile sunt blocate, nimic nu se șterge, orice versiune poate fi readusă.',
    en: 'A one-minute video (in Romanian) about your sections: how to reach them, edit and publish. You cannot break the site: links are locked, nothing is deleted, every version can be restored.',
  },
  more: {
    ro: 'Ghidul scris: drumul unei modificări, pașii și întrebările frecvente',
    en: 'The written guide: how a change goes live, the steps and common questions',
  },
  video: { ro: 'Video: cum lucrezi cu panoul', en: 'Video: working with the panel' },
  flow: { ro: 'Drumul unei modificări', en: 'How a change reaches the site' },
  statuses: { ro: 'Ce înseamnă stările', en: 'What the statuses mean' },
  stepsTitle: { ro: 'Pas cu pas', en: 'Step by step' },
  faqTitle: { ro: 'Întrebări frecvente', en: 'Common questions' },
  tipsTitle: { ro: 'Pentru departamentul tău', en: 'For your department' },
  safe: { ro: 'Ce e protejat', en: 'What is protected' },
}

const flow: { icon: string; title: L; text: L; mock: 'search' | 'list' | 'edit' | 'save' }[] = [
  {
    icon: 'search',
    title: { ro: 'Găsește', en: 'Find' },
    text: {
      ro: 'Lipește linkul de pe site sau scrie un cuvânt din titlu.',
      en: 'Paste the link from the site or type a word of the title.',
    },
    mock: 'search',
  },
  {
    icon: 'page',
    title: { ro: 'Deschide', en: 'Open' },
    text: { ro: 'Apasă pe rezultat: se deschide pagina.', en: 'Click the result: the page opens.' },
    mock: 'list',
  },
  {
    icon: 'book',
    title: { ro: 'Schimbă textul', en: 'Edit the text' },
    text: {
      ro: 'Scrii direct în câmpuri, ca într-un document.',
      en: 'Type straight into the fields, like in a document.',
    },
    mock: 'edit',
  },
  {
    icon: 'shop',
    title: { ro: 'Salvează sau publică', en: 'Save or publish' },
    text: {
      ro: 'Ciorna rămâne în panou; „Publică pe site” o arată tuturor.',
      en: 'A draft stays in the panel; “Publish” shows it to everyone.',
    },
    mock: 'save',
  },
]

const statuses: { tone: string; name: L; text: L }[] = [
  {
    tone: 'live',
    name: { ro: 'Publicat', en: 'Published' },
    text: { ro: 'Vizitatorii văd exact acest text.', en: 'Visitors see exactly this text.' },
  },
  {
    tone: 'changed',
    name: { ro: 'Modificat, nepublicat', en: 'Changed' },
    text: {
      ro: 'Pe site e încă varianta veche; ai o ciornă nouă salvată.',
      en: 'The site still shows the old text; a new draft is saved.',
    },
  },
  {
    tone: 'draft',
    name: { ro: 'Ciornă', en: 'Draft' },
    text: {
      ro: 'Există doar în panou, nu apare pe site.',
      en: 'Only in the panel, not on the site.',
    },
  },
]

const steps: { title: L; text: L }[] = [
  {
    title: { ro: 'Intră în panou', en: 'Sign in' },
    text: {
      ro: 'Deschide agrinvest.ro/admin, scrie emailul și parola departamentului. Pagina de start arată doar secțiunile tale; meniul din stânga le grupează pe teme.',
      en: 'Open agrinvest.ro/admin and sign in with your department’s email and password. The home screen shows only your sections; the left menu groups them by topic.',
    },
  },
  {
    title: { ro: 'Găsește pagina văzută pe site', en: 'Find the page you saw' },
    text: {
      ro: 'Copiază adresa din browser (de pe site) și lipește-o în „Găsește pagina”. Sau scrie un cuvânt din titlu. Enter deschide primul rezultat.',
      en: 'Copy the address from the browser and paste it into “Find the page”, or type a word from the title. Enter opens the first result.',
    },
  },
  {
    title: { ro: 'Schimbă textul', en: 'Change the text' },
    text: {
      ro: 'Titlul și rezumatul sunt sus; textul lung e în „Content”. Câmpurile gri (slug, adresă, limbi) sunt blocate, ca linkurile să nu se schimbe.',
      en: 'Title and summary are at the top; the long text is under “Content”. Grey fields (slug, address, languages) are locked so links never change.',
    },
  },
  {
    title: { ro: 'Salvează ciorna', en: 'Save a draft' },
    text: {
      ro: '„Salvează ciorna” (sus, dreapta) păstrează munca fără s-o arate pe site. Poți reveni oricând și continua.',
      en: '“Save draft” (top right) keeps your work without showing it on the site. Come back and continue any time.',
    },
  },
  {
    title: { ro: 'Publică pe site', en: 'Publish' },
    text: {
      ro: '„Publică pe site” pune textul pe site în câteva secunde. Starea devine „Publicat”.',
      en: '“Publish changes” puts the text live within seconds. The status becomes “Published”.',
    },
  },
  {
    title: { ro: 'Engleza, separat', en: 'English, separately' },
    text: {
      ro: 'Sus, în dreapta, „Limba: Română” → alege English. Editezi aceeași pagină în engleză și o salvezi la fel.',
      en: 'Top right, “Language: Română” → choose English. Edit the same page in English and save it the same way.',
    },
  },
]

const faq: { q: L; a: L }[] = [
  {
    q: { ro: 'Am greșit. Cum revin?', en: 'I made a mistake. How do I go back?' },
    a: {
      ro: 'Deschide fila „Versiuni” a paginii, alege varianta bună și apasă „Readu această versiune”. Dacă n-ai publicat încă, „Renunță la modificări” revine la textul de pe site.',
      en: 'Open the page’s “Versions” tab, pick the good one and restore it. If you have not published yet, “Revert to published” brings back the live text.',
    },
  },
  {
    q: { ro: 'De ce nu pot șterge sau crea o pagină?', en: 'Why can’t I delete or create a page?' },
    a: {
      ro: 'Panoul e făcut pentru texte. Paginile noi și ștergerile le face administratorul, ca structura site-ului și linkurile să rămână stabile.',
      en: 'The panel is for text. New pages and deletions go through the administrator, so the site’s structure and links stay stable.',
    },
  },
  {
    q: { ro: 'Cât durează până apare pe site?', en: 'How long until it shows on the site?' },
    a: {
      ro: 'Câteva secunde după „Publică pe site”. Dacă nu vezi schimbarea, reîncarcă pagina site-ului.',
      en: 'A few seconds after publishing. If you do not see it, reload the site page.',
    },
  },
  {
    q: { ro: 'Cum schimb o imagine?', en: 'How do I change an image?' },
    a: {
      ro: 'În câmpul imaginii apasă pe imagine, apoi „Alege alta” sau încarcă un fișier nou. Scrie și textul alternativ (ce se vede în imagine).',
      en: 'Click the image in its field, then choose another or upload a new file. Add the alt text (what the image shows).',
    },
  },
  {
    q: { ro: 'Nu găsesc o pagină.', en: 'I can’t find a page.' },
    a: {
      ro: 'Probabil ține de alt departament: panoul îți arată doar secțiunile tale. Spune-i administratorului linkul.',
      en: 'It probably belongs to another department: you only see your own sections. Send the link to the administrator.',
    },
  },
]

const tips: Record<DepartmentRole, L[]> = {
  cereale: [
    {
      ro: 'Un preț nou: „Adaugă”, alege cultura și baza, scrie prețul și data, apoi „Publicat”.',
      en: 'A new price: create one, choose crop and base, type price and date, then “Published”.',
    },
    {
      ro: 'Prețul vechi nu se șterge: cel mai nou rând publicat e cel de pe site.',
      en: 'Old prices are not deleted: the newest published row is the one on the site.',
    },
    {
      ro: 'La „Cereri” vezi doar cererile de vânzare și depozitare: sună, apoi schimbă starea.',
      en: 'Under “Leads” you see only selling and storage requests: call, then change the status.',
    },
  ],
  comercial: [
    {
      ro: 'Prețul unui produs e la variantele lui (mărime, preț, stoc).',
      en: 'A product’s price is on its variants (size, price, stock).',
    },
    {
      ro: 'Un produs ascuns rămâne „Ciornă”; când e gata de vânzare, „Publică pe site”.',
      en: 'A hidden product stays a draft; publish it when it is ready to sell.',
    },
    {
      ro: 'La comenzi schimbi doar starea (Nouă, Confirmată, Livrată…) și notițele.',
      en: 'For orders you change only the status (New, Confirmed, Delivered…) and the notes.',
    },
  ],
  ifn: [
    {
      ro: 'Cererile de credit noi apar primele; schimbă starea după fiecare apel.',
      en: 'New credit applications come first; change the status after each call.',
    },
    {
      ro: 'Produsele și întrebările trec prin verificarea juridică: verifică în dreapta, la „Review”, starea juridică înainte de publicare.',
      en: 'Products and questions go through legal review: check the legal status under “Review” before publishing.',
    },
  ],
  logistica: [
    {
      ro: 'La „Cereri” vezi doar cererile de transport: sună, apoi schimbă starea și scrie o notiță.',
      en: 'Under “Leads” you see only transport requests: call, then change the status and add a note.',
    },
    {
      ro: 'Paginile tale sunt Logistică și Livrare: le găsești după linkul de pe site.',
      en: 'Your pages are Logistics and Delivery: find them by their link on the site.',
    },
  ],
  motorina: [
    {
      ro: 'Un preț nou: „Adaugă”, scrie prețul pe litru și data, apoi „Publicat”.',
      en: 'A new price: create one, type the price per litre and the date, then “Published”.',
    },
    {
      ro: 'Prețul vechi nu se șterge: cel mai nou rând publicat e cel de pe site.',
      en: 'Old prices are not deleted: the newest published row is the one on the site.',
    },
  ],
  continut: [
    {
      ro: 'Articolele și ghidurile au o secțiune (ghid, știre, notă de piață): o vezi în dreapta.',
      en: 'Articles and guides have a section (guide, news, market note), shown on the right.',
    },
    {
      ro: 'Cifrele despre Agrinvest apar ca {{C1}}: nu le scrie de mână, le schimbă administratorul.',
      en: 'Figures about Agrinvest appear as {{C1}}: do not type them, the administrator updates them.',
    },
  ],
}

function Mock({ kind }: { kind: (typeof flow)[number]['mock'] }) {
  if (kind === 'search')
    return (
      <div className="ig-mock ig-mock--search" aria-hidden>
        <SearchIcon className="ig-mock__ico" />
        <span className="ig-mock__url">agrinvest.ro/magazin/…</span>
      </div>
    )
  if (kind === 'list')
    return (
      <div className="ig-mock ig-mock--list" aria-hidden>
        <span className="ig-row ig-row--hit" />
        <span className="ig-row" />
        <span className="ig-row" />
      </div>
    )
  if (kind === 'edit')
    return (
      <div className="ig-mock ig-mock--edit" aria-hidden>
        <span className="ig-line" />
        <span className="ig-line ig-line--short" />
        <span className="ig-line ig-line--typing" />
      </div>
    )
  return (
    <div className="ig-mock ig-mock--save" aria-hidden>
      <span className="ig-btn">Ciornă</span>
      <span className="ig-btn ig-btn--go">Publică</span>
    </div>
  )
}

/**
 * The panel guide on the home screen: the department's own video (Romanian, recorded by
 * `scripts/panel/record-guide.mjs`), then the written guide folded: infographic, steps, tips, FAQ.
 */
export function PanelGuide({ lang, roles }: { lang: PanelLang; roles: DepartmentRole[] }) {
  const ownTips = roles.flatMap((r) => tips[r]).slice(0, 6)
  const recorded = videos as Record<string, { chapters: { at: number; label: string }[] }>
  const videoItems: GuideVideoItem[] = roles
    .filter((role) => recorded[role])
    .map((role) => ({
      key: role,
      label: departments[role].label[lang],
      src: `/panel/ghid-${role}.mp4`,
      poster: `/panel/ghid-${role}.jpg`,
      chapters: recorded[role].chapters,
    }))
  return (
    <section id="ghid" className="guide" aria-labelledby="ghid-title">
      <header className="guide__head">
        <p className="guide__kicker">{t.kicker[lang]}</p>
        <h2 id="ghid-title">{t.title[lang]}</h2>
        <p className="guide__lead">{t.lead[lang]}</p>
      </header>

      <GuideVideo videos={videoItems} title={t.video[lang]} />

      <details className="guide__more">
        <summary>{t.more[lang]}</summary>
        <h3 className="guide__sub">{t.flow[lang]}</h3>
        <ol className="ig-flow">
          {flow.map((step, i) => (
            <li key={step.mock} className="ig-step">
              <span className="ig-step__num">{i + 1}</span>
              <Mock kind={step.mock} />
              <strong className="ig-step__title">
                <SectionIcon name={step.icon} className="ig-step__ico" />
                {step.title[lang]}
              </strong>
              <span className="ig-step__text">{step.text[lang]}</span>
            </li>
          ))}
        </ol>

        <div className="guide__cols">
          <div className="guide__card">
            <h3>{t.statuses[lang]}</h3>
            <ul className="ig-status">
              {statuses.map((s) => (
                <li key={s.tone}>
                  <span className={`panel-status panel-status--${s.tone}`}>{s.name[lang]}</span>
                  <span>{s.text[lang]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="guide__card guide__card--safe">
            <h3>{t.safe[lang]}</h3>
            <ul className="guide__checks">
              <li>
                {lang === 'ro' ? 'Linkurile paginilor sunt blocate.' : 'Page links are locked.'}
              </li>
              <li>{lang === 'ro' ? 'Nimic nu se șterge din panou.' : 'Nothing gets deleted.'}</li>
              <li>
                {lang === 'ro'
                  ? 'Fiecare salvare devine o versiune pe care o poți readuce.'
                  : 'Every save becomes a version you can restore.'}
              </li>
              <li>
                {lang === 'ro'
                  ? 'Vezi și schimbi doar secțiunile departamentului tău.'
                  : 'You see and change only your department’s sections.'}
              </li>
            </ul>
          </div>
        </div>

        <div className="guide__cols">
          <div>
            <h3 className="guide__sub">{t.stepsTitle[lang]}</h3>
            <ol className="guide__steps">
              {steps.map((s) => (
                <li key={s.title.en}>
                  <strong>{s.title[lang]}</strong>
                  <p>{s.text[lang]}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            {ownTips.length > 0 && (
              <>
                <h3 className="guide__sub">{t.tipsTitle[lang]}</h3>
                <ul className="guide__tips">
                  {ownTips.map((tip) => (
                    <li key={tip.en}>{tip[lang]}</li>
                  ))}
                </ul>
              </>
            )}
            <h3 className="guide__sub">{t.faqTitle[lang]}</h3>
            <div className="guide__faq">
              {faq.map((f) => (
                <details key={f.q.en}>
                  <summary>{f.q[lang]}</summary>
                  <p>{f.a[lang]}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </details>
    </section>
  )
}
