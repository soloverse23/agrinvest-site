/**
 * Phase 2.2 page content: blocks and FAQ per page and language. Romanian copy is a draft
 * rewritten from the old site (agrinvest.ro, read 2026-11-03) for Agrinvest to review.
 * English layouts are short placeholders until 2.3 writes the business-led English site.
 *
 * Numbers and other register facts are never typed: `{{KEY}}` renders the figures register
 * value with its "to confirm" marker (src/components/FactText.tsx).
 */
import type { Page } from '@/payload-types'

import { rt } from './richtext'

type Blocks = NonNullable<Page['layout']>
type Faq = NonNullable<Page['faq']>
export type Ctx = {
  people: Record<string, number>
  /** Media ids by frame name; empty when the local footage is not available (CI). */
  media: Record<string, number | undefined>
}
type Content = { ro: Blocks; en?: Blocks; faq?: { ro: Faq; en?: Faq } }

const q = (question: string, answer: string) => ({ question, answer })

const figures = (keys: string[]) => ({
  blockType: 'figureStrip' as const,
  items: keys.map((figure) => ({ figure })),
})

export function contentFor(key: string, ctx: Ctx): Content | null {
  const { people, media } = ctx
  switch (key) {
    case 'home':
      return {
        ro: [
          {
            blockType: 'hero',
            eyebrow: 'Cereale · Depozitare · Finanțare · Logistică',
            title: 'Cumpărăm, depozităm și finanțăm recolta ta.',
            accent: 'recolta ta',
            lead: 'Cumpărăm cereale direct de la fermieri, le recepționăm în bazele noastre, le transportăm cu flota proprie și finanțăm producția prin Agrinvest Credit IFN.',
            image: media['harvest-sunflower'],
            primary: { label: 'Vinde cereale', href: '/cereale' },
            secondary: { label: 'Vorbește cu noi', href: '/contact' },
            needs: [
              { link: { label: 'Vinde cereale', href: '/cereale' }, hint: 'Plata {{C8}}' },
              {
                link: { label: 'Depozitare', href: '/depozitare' },
                hint: 'Recepție, uscare, păstrare',
              },
              { link: { label: 'Finanțare', href: '/finantare' }, hint: 'Rate după recoltă' },
              {
                link: { label: 'Logistică', href: '/logistica' },
                hint: 'Transport cu flota proprie',
              },
            ],
          },
          figures(['S1', 'S2', 'L1']),
          {
            blockType: 'serviceGrid',
            kicker: 'Ce facem',
            heading: 'Tot ce are nevoie ferma, de la un singur partener',
            lead: 'Lucrăm direct cu fermierii, de la semănat până la vânzarea recoltei. Fiecare serviciu se leagă de celelalte, așa că vorbești cu o singură echipă.',
            items: [
              {
                icon: 'wheat',
                title: 'Comerț cu cereale',
                body: 'Cumpărăm grâu, porumb, floarea-soarelui, rapiță, orz și alte culturi, la recoltă sau din stoc.',
                link: { label: 'Vinde cereale', href: '/cereale' },
              },
              {
                icon: 'silo',
                title: 'Depozitare și uscare',
                body: 'Recepție, cântărire, precurățare și uscare în bazele noastre, cu acces direct la vânzare.',
                link: { label: 'Vezi bazele', href: '/depozitare' },
              },
              {
                icon: 'coins',
                title: 'Finanțare agricolă',
                body: 'Credite pentru producție și investiții prin Agrinvest Credit IFN, cu rate aliniate la recoltă.',
                link: { label: 'Despre finanțare', href: '/finantare' },
              },
              {
                icon: 'truck',
                title: 'Transport și logistică',
                body: 'Ridicăm cerealele de la fermă și livrăm semințe, îngrășăminte și produse de protecția plantelor.',
                link: { label: 'Logistică', href: '/logistica' },
              },
              {
                icon: 'handshake',
                title: 'Golden Relationship',
                body: 'Un program prin care sprijinim fermele aflate în dificultate să își revină și să crească din nou.',
                link: { label: 'Despre program', href: '/golden-relationship' },
              },
              {
                icon: 'leaf',
                title: 'Consultanță tehnică',
                body: 'Agronomii noștri te ajută să alegi tehnologia potrivită pentru fiecare cultură și fiecare sezon.',
                link: { label: 'Vorbește cu un agronom', href: '/contact' },
              },
            ],
          },
          {
            blockType: 'baseList',
            kicker: 'Baze',
            heading: 'Livrezi la baza cea mai apropiată',
            lead: 'Bazele de recepție și depozitare sunt în județele din sudul și estul țării. Fiecare bază are pagina ei, cu serviciile și datele de contact.',
            showMap: true,
          },
          {
            blockType: 'steps',
            kicker: 'Pas cu pas',
            heading: 'Cum vinzi cereale la Agrinvest',
            items: [
              {
                title: 'Ne spui ce ai',
                body: 'Cultura, cantitatea, unde se află marfa și când e gata. Prin telefon sau prin formular.',
              },
              {
                title: 'Primești prețul',
                body: 'Reprezentantul din zona ta îți dă prețul pentru baza cea mai apropiată și condițiile de livrare.',
              },
              {
                title: 'Livrezi sau ridicăm noi',
                body: 'Aduci marfa la bază sau o ridicăm de la fermă cu camioanele noastre.',
              },
              {
                title: 'Recepție și plată',
                body: 'Marfa e cântărită și analizată la recepție, iar plata se face {{C8}}.',
              },
            ],
          },
          {
            blockType: 'storySection',
            kicker: 'Golden Relationship',
            heading: 'Când un an greu nu trebuie să însemne sfârșitul fermei',
            body: rt(
              'Prin programul Golden Relationship, Agrinvest și Agrinvest Credit IFN lucrează alături de fermierii aflați într-o situație dificilă, dar care au o șansă reală de redresare.\n\nO echipă de specialiști (financiari, juridici, tehnici și comerciali) face împreună cu fermierul un plan de redresare și rămâne alături de el și după ce perioada grea a trecut.\n\n[Află cum funcționează programul](/golden-relationship)',
            ),
            media: media.combine,
          },
          {
            blockType: 'financeBand',
            kicker: 'Agrinvest Credit IFN',
            heading: 'Finanțare cu rate după recoltă',
            lead: 'Credite în lei pentru producție și investiții, cu răspuns {{F4}}. Rambursezi în ritmul fermei: {{F5}}.',
            primary: { label: 'Despre finanțare', href: '/finantare' },
            secondary: { label: 'Cere o ofertă', href: '/finantare#cerere' },
            instalments: [
              { when: 'Rata 1 · după recolta de vară', label: 'grâu, orz, rapiță' },
              { when: 'Rata 2 · după recolta de toamnă', label: 'porumb, floarea-soarelui' },
            ],
          },
          {
            blockType: 'ctaBand',
            tone: 'surface',
            heading: 'Ai o întrebare? Îți răspunde direct omul responsabil.',
            body: 'Spune-ne de ce ai nevoie: vânzare de cereale, depozitare, transport sau finanțare. Cererea ajunge direct la persoana care se ocupă de ea.',
            primary: { label: 'Contactează-ne', href: '/contact' },
          },
        ],
        en: [
          {
            blockType: 'hero',
            eyebrow: 'Grain · Storage · Financing · Logistics',
            title: 'Romanian grain, from the farm to your contract.',
            accent: 'from the farm',
            lead: 'Agrinvest buys grain directly from Romanian farmers, stores it in its own bases, moves it with its own fleet and finances production through Agrinvest Credit IFN.',
            image: media['harvest-sunflower'],
            primary: { label: 'Grain storage', href: '/en/storage' },
            secondary: { label: 'Contact us', href: '/en/contact' },
            needs: [
              {
                link: { label: 'Storage', href: '/en/storage' },
                hint: 'Reception, drying, storage',
              },
              { link: { label: 'Financing', href: '/en/financing' }, hint: 'Agrinvest Credit IFN' },
              {
                link: { label: 'Partners', href: '/en/partners' },
                hint: 'Inputs, processing, trade',
              },
              { link: { label: 'About', href: '/en/about' }, hint: 'A Romanian-owned group' },
            ],
          },
          figures(['S1', 'S2', 'L1']),
          {
            blockType: 'ctaBand',
            tone: 'surface',
            heading: 'Talk to the person responsible',
            body: 'Your enquiry goes straight to the team that handles it: grain, storage, logistics or financing.',
            primary: { label: 'Contact us', href: '/en/contact' },
          },
        ],
        faq: {
          ro: [
            q(
              'Ce cereale cumpără Agrinvest?',
              'Cumpărăm {{C7}}, direct de la fermieri, la recoltă sau din stoc.',
            ),
            q(
              'Când primesc banii pentru cereale?',
              'Plata se face {{C8}}, după cântărire și analiza calității.',
            ),
            q(
              'Unde sunt bazele Agrinvest?',
              'Bazele de recepție și depozitare sunt în județele din sudul și estul țării. Lista completă, cu pagina fiecărei baze, este pe pagina Depozitare.',
            ),
          ],
        },
      }

    case 'despre':
      return {
        ro: [
          {
            blockType: 'richText',
            content: rt(`## Cum a început

Agrinvest a pornit în {{C1}}, ca firmă care lucra direct cu fermierii din zonă. De atunci s-a extins an de an: astăzi activitatea este coordonată din București, iar ținta noastră este să fim activi în toată țara.

Am crescut investind constant în oameni, în baze de depozitare și silozuri, în utilaje agricole și în producția de semințe.

## Ce facem astăzi

- Distribuție de inputuri agricole, organice și convenționale
- [Comerț cu cereale](/cereale): cumpărăm recolta direct de la fermieri
- Semințe din producție proprie și de la parteneri
- Consultanță tehnică pentru fermieri
- [Finanțare](/finantare) prin Agrinvest Credit IFN
- [Transport](/logistica) cu flota proprie
- [Depozitare](/depozitare) în bazele proprii
- Motorină

## Capital românesc

Agrinvest are capital {{C5}}. Credem că agricultura românească crește repede doar prin efortul comun al oamenilor ei, așa că am construit fiecare serviciu în jurul fermierilor cu care lucrăm.`),
          },
          { ...figures(['S1', 'S2', 'L1']), kicker: 'În cifre', heading: 'Agrinvest pe scurt' },
          {
            blockType: 'storySection',
            kicker: 'Echipa',
            heading: 'Oameni care cunosc fermele din zona lor',
            reverse: true,
            body: rt(
              'Reprezentanții de vânzări, agronomii, șoferii și echipele din baze lucrează în aceleași zone cu fermierii pe care îi servesc. Știu culturile, drumurile și oamenii.\n\nCând suni la Agrinvest, vorbești cu cineva care poate rezolva, nu cu un centru de apeluri.',
            ),
            media: media.team,
          },
          {
            blockType: 'ctaBand',
            tone: 'surface',
            heading: 'Toate cifrele, cu sursa lor',
            body: 'Baze, capacitate, flotă și finanțare: fiecare valoare are sursa și starea verificării.',
            primary: { label: 'Agrinvest în cifre', href: '/despre/cifre' },
            secondary: { label: 'Contact', href: '/contact' },
          },
        ],
        en: [
          {
            blockType: 'richText',
            content: rt(
              'Agrinvest started in {{C1}} and is now run from Bucharest. The group trades grain, stores it in its own bases, moves it with its own fleet, supplies farm inputs and finances farmers through Agrinvest Credit IFN.\n\nAgrinvest is {{C5}} owned.',
            ),
          },
          figures(['S1', 'S2', 'L1']),
        ],
        faq: {
          ro: [
            q('De când există Agrinvest?', 'Agrinvest a pornit în {{C1}}.'),
            q('Cine deține Agrinvest?', 'Agrinvest are capital {{C5}}.'),
            q(
              'Ce este Agrinvest Credit IFN?',
              'Instituția financiară nebancară a grupului, înscrisă în Registrul Special al BNR, care finanțează fermierii din {{F3}}.',
            ),
          ],
        },
      }

    case 'cifre':
      return {
        ro: [
          {
            blockType: 'callout',
            tone: 'note',
            title: 'Cum citești tabelul',
            body: 'Fiecare valoare are sursa ei. Valorile marcate „de confirmat” sunt în curs de verificare cu echipa Agrinvest și pot fi actualizate.',
          },
          {
            blockType: 'figureTable',
            kicker: 'Companie',
            heading: 'Despre companie',
            keys: ['C1', 'C5', 'C4', 'C7', 'C8'],
          },
          {
            blockType: 'figureTable',
            kicker: 'Depozitare',
            heading: 'Baze și capacitate',
            keys: ['S1', 'S2'],
          },
          { blockType: 'figureTable', kicker: 'Logistică', heading: 'Flota', keys: ['L1', 'L2'] },
          {
            blockType: 'figureTable',
            kicker: 'Finanțare',
            heading: 'Agrinvest Credit IFN',
            keys: ['F1', 'F2.cui', 'F2.reg', 'F3', 'F4', 'F5', 'F6'],
          },
          {
            blockType: 'figureTable',
            kicker: 'Programe',
            heading: 'Golden Relationship',
            keys: ['P1'],
          },
        ],
        faq: {
          ro: [
            q(
              'De unde vin cifrele de pe această pagină?',
              'Din registrul de cifre Agrinvest: fiecare valoare are sursa și starea verificării. Valorile se actualizează când echipa le confirmă.',
            ),
          ],
        },
      }

    case 'cereale':
      return {
        ro: [
          {
            blockType: 'steps',
            kicker: 'Pas cu pas',
            heading: 'Cum vinzi cereale la Agrinvest',
            items: [
              {
                title: 'Ne spui ce ai',
                body: 'Cultura, cantitatea, unde se află marfa și când e gata de livrare.',
              },
              {
                title: 'Primești prețul',
                body: 'Reprezentantul din zona ta îți dă prețul pentru baza cea mai apropiată.',
              },
              {
                title: 'Livrezi sau ridicăm noi',
                body: 'Aduci marfa la bază sau o ridicăm de la fermă cu flota proprie.',
              },
              {
                title: 'Recepție și plată',
                body: 'Cântărire și analiza calității la recepție; plata se face {{C8}}.',
              },
            ],
          },
          {
            blockType: 'cropList',
            kicker: 'Culturi',
            heading: 'Ce cumpărăm',
            lead: 'Cumpărăm {{C7}}. Alege cultura ca să vezi cum se face recepția și cum se stabilește prețul.',
          },
          {
            blockType: 'baseList',
            kicker: 'Baze',
            heading: 'Baza cea mai apropiată de ferma ta',
            showMap: true,
          },
          {
            blockType: 'leadForm',
            leadType: 'vanzare-cereale',
            extraFields: ['county', 'crop'],
            heading: 'Cere o ofertă de preț',
            body: 'Spune-ne cultura, cantitatea și județul. Te sună reprezentantul de vânzări din zona ta.',
          },
        ],
        faq: {
          ro: [
            q('Ce cereale cumpără Agrinvest?', 'Cumpărăm {{C7}}.'),
            q(
              'Când primesc banii pentru cereale?',
              'Plata se face {{C8}}, după cântărire și analiza calității.',
            ),
            q(
              'Puteți ridica cerealele de la fermă?',
              'Da. Când ne ceri, transportăm cerealele cu flota proprie de la fermă la bază.',
            ),
            q(
              'Cum se stabilește prețul?',
              'Prețul depinde de cultură, de calitatea mărfii (umiditate, impurități, masă hectolitrică), de bază și de piața zilei. Sună-ne sau trimite formularul și îți dăm prețul pentru baza cea mai apropiată.',
            ),
          ],
        },
      }

    case 'depozitare':
      return {
        ro: [
          figures(['S1', 'S2']),
          {
            blockType: 'serviceGrid',
            kicker: 'Servicii',
            heading: 'Ce se întâmplă cu recolta ta la bază',
            columns: '3',
            items: [
              {
                icon: 'scale',
                title: 'Recepție și cântărire',
                body: 'Marfa e cântărită și analizată la sosire: umiditate, impurități și masă hectolitrică.',
              },
              {
                icon: 'leaf',
                title: 'Precurățare',
                body: 'Scoatem impuritățile înainte de depozitare, ca marfa să se păstreze și să se vândă mai bine.',
              },
              {
                icon: 'drop',
                title: 'Uscare',
                body: 'Cerealele prea umede sunt uscate până la umiditatea de depozitare.',
                link: { label: 'Despre uscare', href: '/depozitare/uscare' },
              },
              {
                icon: 'silo',
                title: 'Depozitare',
                body: 'Recolta stă în siguranță în silozurile noastre până alegi momentul vânzării.',
              },
              {
                icon: 'wheat',
                title: 'Vânzare din stoc',
                body: 'Vinzi direct din bază, fără alt transport, când prețul ți se potrivește.',
                link: { label: 'Vinde cereale', href: '/cereale' },
              },
              {
                icon: 'coins',
                title: 'Finanțare',
                body: 'Ai nevoie de bani până la vânzare? Vorbește cu Agrinvest Credit IFN.',
                link: { label: 'Finanțare', href: '/finantare' },
              },
            ],
          },
          {
            blockType: 'baseList',
            kicker: 'Baze',
            heading: 'Bazele de depozitare',
            lead: 'Alege o bază ca să vezi capacitatea, serviciile și cum ajungi acolo.',
            showMap: true,
          },
          {
            blockType: 'leadForm',
            leadType: 'depozitare',
            extraFields: ['crop', 'base'],
            heading: 'Rezervă loc de depozitare',
            body: 'Spune-ne cultura, cantitatea și baza preferată. Te contactăm cu condițiile.',
          },
        ],
        en: [
          figures(['S1', 'S2']),
          {
            blockType: 'baseList',
            heading: 'Our storage bases',
            showMap: true,
          },
          {
            blockType: 'ctaBand',
            tone: 'surface',
            heading: 'Storage or grain enquiries',
            primary: { label: 'Contact us', href: '/en/contact' },
          },
        ],
        faq: {
          ro: [
            q(
              'Ce servicii oferă bazele Agrinvest?',
              'Recepție și cântărire, analiza calității, precurățare, uscare și depozitare. Serviciile exacte ale fiecărei baze sunt pe pagina ei.',
            ),
            q(
              'Pot păstra cerealele la bază și să le vând mai târziu?',
              'Da. Depozitarea îți lasă timp să alegi momentul vânzării, iar vânzarea se face direct din bază.',
            ),
            q(
              'Care este capacitatea totală de depozitare?',
              'Capacitatea totală este de {{S2}}, în {{S1}} baze.',
            ),
          ],
        },
      }

    case 'uscare':
      return {
        ro: [
          {
            blockType: 'richText',
            content: rt(`## De ce contează umiditatea

Cerealele recoltate prea umede se încing și se depreciază în depozit. Umiditatea peste limita de recepție scade și prețul, pentru că marfa trebuie uscată înainte să poată fi păstrată sau vândută.

## Ce facem la recepție

La sosirea în bază luăm o probă și măsurăm umiditatea și impuritățile. Dacă marfa are nevoie, o precurățăm și o uscăm până la umiditatea de depozitare, în aceeași bază. Nu mai cauți un uscător liber în plin sezon și nu mai muți marfa de colo-colo.

## După uscare

Marfa uscată intră în [depozitare](/depozitare) sau poate fi [vândută direct din bază](/cereale).`),
          },
          {
            blockType: 'steps',
            heading: 'Uscarea, pe scurt',
            items: [
              { title: 'Probă la recepție', body: 'Măsurăm umiditatea și impuritățile.' },
              { title: 'Precurățare', body: 'Scoatem impuritățile înainte de uscare.' },
              { title: 'Uscare', body: 'Aducem marfa la umiditatea de depozitare.' },
              { title: 'Depozitare sau vânzare', body: 'Alegi ce faci mai departe cu recolta.' },
            ],
          },
          {
            blockType: 'storySection',
            heading: 'Recepție rapidă în plin sezon',
            body: rt(
              'În vârf de recoltă, fiecare oră contează. Bazele noastre primesc marfa, o analizează și o pregătesc pentru depozitare, ca tu să te întorci în câmp.',
            ),
            media: media['grain-reception'],
          },
          {
            blockType: 'leadForm',
            leadType: 'depozitare',
            extraFields: ['crop', 'base'],
            heading: 'Întreabă de uscare și depozitare',
          },
        ],
        faq: {
          ro: [
            q(
              'Unde se face uscarea?',
              'În bazele Agrinvest care au uscător, la recepție. Serviciile fiecărei baze sunt pe pagina ei.',
            ),
            q(
              'Cum se stabilește costul uscării?',
              'Costul depinde de cât de umedă este marfa față de umiditatea de depozitare. Îl afli la recepție sau de la reprezentantul din zona ta.',
            ),
          ],
        },
      }

    case 'finantare':
      return {
        ro: [
          {
            blockType: 'richText',
            content: rt(`## Cine suntem

Agrinvest Credit IFN este instituția financiară nebancară a grupului Agrinvest, înscrisă în Registrul Special al BNR. Finanțăm fermierii din {{F3}}.

## Pentru cine

Produsele noastre sunt gândite mai ales pentru fermierii mici și mijlocii, care au acces greu la creditul bancar clasic: persoane fizice autorizate, întreprinderi individuale și familiale, societăți comerciale și societăți agricole.

## Ce finanțăm

- Credite pe termen scurt pentru ciclul de producție: semințe, îngrășăminte, tratamente, lucrări
- Credite pentru investiții: utilaje agricole, spații de depozitare, irigații, ferme vegetale sau zootehnice, teren agricol

## Condiții

- Finanțare în lei, cu documentație simplă
- Răspuns {{F4}}
- Durată și rambursare: {{F5}}, corelate cu recoltele
- Garanții acceptate: bilete la ordin, culturi, utilaje agricole, subvenții APIA, contracte de vânzare a cerealelor, ipoteci imobiliare`),
          },
          {
            blockType: 'financeBand',
            kicker: 'Rambursare',
            heading: 'Plătești când vinzi recolta',
            lead: 'Ratele se stabilesc împreună cu tine, după momentul în care încasezi banii pe recoltă.',
            primary: { label: 'Cere o ofertă', href: '/finantare#cerere' },
            secondary: { label: 'Contact', href: '/contact' },
            instalments: [
              { when: 'Rata 1 · după recolta de vară', label: 'grâu, orz, rapiță' },
              { when: 'Rata 2 · după recolta de toamnă', label: 'porumb, floarea-soarelui' },
            ],
          },
          {
            blockType: 'figureTable',
            kicker: 'Identificare',
            heading: 'Datele Agrinvest Credit IFN',
            keys: ['F1', 'F2.cui', 'F2.reg', 'F3', 'F8.phone', 'F8.email'],
          },
          {
            blockType: 'leadForm',
            leadType: 'finantare',
            extraFields: ['company', 'county'],
            heading: 'Cere o ofertă de finanțare',
            body: 'Spune-ne ce vrei să finanțezi și suprafața lucrată. Te contactează echipa Agrinvest Credit IFN.',
          },
        ],
        en: [
          {
            blockType: 'richText',
            content: rt(
              'Agrinvest Credit IFN is the non-bank lender of the Agrinvest group, listed in the National Bank of Romania Special Register and lending to farmers since {{F3}}. It finances the production cycle and farm investments, in lei, with repayments aligned to the harvest.',
            ),
          },
          {
            blockType: 'figureTable',
            heading: 'Company details',
            keys: ['F1', 'F2.cui', 'F2.reg', 'F3'],
          },
        ],
        faq: {
          ro: [
            q('În cât timp primesc răspuns la cerere?', 'Răspunsul vine {{F4}}.'),
            q('Pe ce perioadă pot lua un credit?', '{{F5}}.'),
            q(
              'Ce garanții acceptați?',
              'Bilete la ordin, culturi, utilaje agricole, subvenții APIA, contracte de vânzare a cerealelor sau ipoteci imobiliare.',
            ),
            q('În ce monedă se acordă creditele?', 'Toate finanțările se acordă în lei.'),
          ],
        },
      }

    case 'golden-relationship':
      return {
        ro: [
          {
            blockType: 'richText',
            content: rt(`## Pentru cine este programul

Golden Relationship (#AGR) se adresează fermierilor ale căror afaceri trec printr-o perioadă grea, dar care au o șansă reală de redresare. Nu oferim doar o soluție de moment: construim un parteneriat pe termen lung, ca ferma să crească din nou.

## Cum lucrăm

Agrinvest și Agrinvest Credit IFN pun la dispoziția fermierului o echipă cu experiență financiară, juridică, tehnică, managerială și comercială. Împreună cu el facem un plan de redresare și îl urmărim pas cu pas.

După perioada critică rămânem alături: consultanță tehnică, comercială și financiară și ajutor pentru a vinde recolta cât mai bine.

## Programul în prezent

În program sunt integrate {{P1}}. Programul este coordonat de ing. Dan N. Săvoiu, inginer agronom cu experiență îndelungată în agribusiness-ul din România.`),
          },
          {
            blockType: 'steps',
            kicker: 'Pas cu pas',
            heading: 'Cum funcționează Golden Relationship',
            items: [
              {
                title: 'Analiza fermei',
                body: 'Ne uităm împreună la culturi, datorii, utilaje și piață.',
              },
              {
                title: 'Planul de redresare',
                body: 'Stabilim ce se schimbă, în ce ordine și cu ce resurse.',
              },
              {
                title: 'Sprijin în sezon',
                body: 'Inputuri, finanțare și consultanță tehnică, la timp.',
              },
              { title: 'Valorificarea recoltei', body: 'Te ajutăm să vinzi recolta cât mai bine.' },
            ],
          },
          {
            blockType: 'videoEmbed',
            kicker: 'Povești din program',
            heading: 'Fermieri din Golden Relationship',
            youtubeId: 'JOzMUJPyy40',
            title: 'Agrinvest Golden Relationship – Constanța',
            uploadDate: '2022-09-06',
            duration: 'PT11M7S',
          },
          {
            blockType: 'ctaBand',
            heading: 'Ferma ta trece printr-o perioadă grea?',
            body: 'Vorbește cu noi. Discuția este confidențială și te ajută să vezi ce opțiuni ai.',
            primary: { label: 'Contactează-ne', href: '/contact' },
          },
        ],
        faq: {
          ro: [
            q(
              'Cine poate intra în programul Golden Relationship?',
              'Fermierii care trec printr-o perioadă grea, dar au o șansă reală de redresare. Fiecare caz este analizat împreună cu fermierul.',
            ),
            q(
              'Cine coordonează programul?',
              'Programul este coordonat de ing. Dan N. Săvoiu, inginer agronom.',
            ),
          ],
        },
      }

    case 'logistica':
      return {
        ro: [
          {
            blockType: 'serviceGrid',
            kicker: 'Servicii',
            heading: 'Ce transportăm',
            columns: '3',
            items: [
              {
                icon: 'wheat',
                title: 'Cereale de la fermă la bază',
                body: 'Ridicăm recolta de la fermă când ne ceri, ca să nu cauți transport în plin sezon.',
              },
              {
                icon: 'truck',
                title: 'Inputuri la fermă',
                body: 'Livrăm semințe, îngrășăminte și produse de protecția plantelor.',
              },
              {
                icon: 'drop',
                title: 'Îngrășăminte lichide',
                body: 'Transport dedicat pentru îngrășăminte lichide.',
              },
            ],
          },
          {
            blockType: 'figureTable',
            kicker: 'Flota',
            heading: 'Flota proprie',
            keys: ['L1', 'L2'],
          },
          {
            blockType: 'storySection',
            heading: 'Plata imediat după recepție',
            body: rt(
              'Avem capacitate mare de depozitare și putem prelua cantități mari de cereale și plante tehnice. Pentru fermier, avantajul este simplu: plata se face {{C8}}.',
            ),
            media: media.fleet,
            reverse: true,
          },
          {
            blockType: 'contactCards',
            heading: 'Cu cine vorbești',
            cards: [{ person: people.logistics, need: 'Transport și logistică' }],
          },
          {
            blockType: 'leadForm',
            leadType: 'logistica',
            extraFields: ['county'],
            heading: 'Cere transport',
            body: 'Spune-ne ce transporți, de unde și când. Te contactează departamentul de logistică.',
          },
        ],
        faq: {
          ro: [
            q(
              'Pot cere transport doar pentru cereale?',
              'Transportăm cereale de la fermă la bază și livrăm inputuri la fermă: semințe, îngrășăminte și produse de protecția plantelor.',
            ),
            q('Câte camioane are Agrinvest?', 'Flota proprie are {{L1}} camioane.'),
          ],
        },
      }

    case 'parteneri':
      return {
        ro: [
          {
            blockType: 'serviceGrid',
            kicker: 'Parteneriate',
            heading: 'Cu cine lucrăm',
            lead: 'Agrinvest leagă fermierii de piață. Căutăm parteneri care vor să ajungă la fermieri sau să cumpere de la ei.',
            columns: '2',
            items: [
              {
                icon: 'leaf',
                title: 'Producători de inputuri',
                body: 'Semințe, îngrășăminte și produse de protecția plantelor, distribuite prin rețeaua noastră de vânzări și consultanță.',
              },
              {
                icon: 'wheat',
                title: 'Procesatori și traderi',
                body: 'Cereale și plante tehnice din bazele noastre, cu logistică proprie.',
              },
              {
                icon: 'coins',
                title: 'Finanțatori',
                body: 'Bănci și instituții care susțin finanțarea fermierilor prin Agrinvest Credit IFN.',
              },
              {
                icon: 'handshake',
                title: 'Fermieri',
                body: 'Parteneriate pe termen lung, inclusiv prin programul Golden Relationship.',
                link: { label: 'Golden Relationship', href: '/golden-relationship' },
              },
            ],
          },
          {
            blockType: 'leadForm',
            leadType: 'parteneri',
            extraFields: ['company'],
            heading: 'Propune un parteneriat',
            body: 'Spune-ne cine ești și ce propui. Te contactăm în câteva zile lucrătoare.',
          },
        ],
        en: [
          {
            blockType: 'serviceGrid',
            heading: 'Who we work with',
            columns: '2',
            items: [
              {
                icon: 'leaf',
                title: 'Input makers',
                body: 'Seeds, fertilisers and crop protection, sold through our sales and agronomy network.',
              },
              {
                icon: 'wheat',
                title: 'Processors and grain buyers',
                body: 'Grain and oilseeds from our bases, with our own logistics.',
              },
              {
                icon: 'coins',
                title: 'Lenders',
                body: 'Banks and institutions funding farmers through Agrinvest Credit IFN.',
              },
              {
                icon: 'handshake',
                title: 'Farmers',
                body: 'Long-term partnerships, including the Golden Relationship programme.',
              },
            ],
          },
          {
            blockType: 'leadForm',
            leadType: 'parteneri',
            extraFields: ['company'],
            heading: 'Propose a partnership',
          },
        ],
        faq: {
          ro: [
            q(
              'Cum devin partener Agrinvest?',
              'Completează formularul de pe această pagină cu firma și propunerea ta. Te contactăm în câteva zile lucrătoare.',
            ),
          ],
        },
      }

    case 'cariere':
      return {
        ro: [
          {
            blockType: 'serviceGrid',
            kicker: 'Echipe',
            heading: 'Unde poți lucra',
            lead: 'Căutăm oameni care cunosc agricultura sau vor să o învețe, în teren, în baze și la birou.',
            columns: '3',
            items: [
              {
                icon: 'handshake',
                title: 'Vânzări',
                body: 'Reprezentanți care lucrează direct cu fermierii din zona lor.',
              },
              {
                icon: 'leaf',
                title: 'Agronomie',
                body: 'Ingineri agronomi pentru consultanță tehnică în câmp.',
              },
              {
                icon: 'truck',
                title: 'Logistică',
                body: 'Șoferi și dispeceri pentru flota proprie.',
              },
              { icon: 'silo', title: 'Baze', body: 'Operatori de recepție, uscare și depozitare.' },
              {
                icon: 'coins',
                title: 'Finanțare',
                body: 'Analiști și consilieri de credit la Agrinvest Credit IFN.',
              },
              {
                icon: 'document',
                title: 'Birou',
                body: 'Achiziții, contabilitate și administrativ.',
              },
            ],
          },
          {
            blockType: 'leadForm',
            leadType: 'cariere',
            extraFields: ['county'],
            heading: 'Trimite-ne datele tale',
            body: 'Spune-ne ce vrei să faci și în ce zonă. Te contactăm când avem un post potrivit.',
          },
        ],
        faq: {
          ro: [
            q(
              'Cum aplic pentru un loc de muncă la Agrinvest?',
              'Completează formularul de pe această pagină cu zona și domeniul în care vrei să lucrezi. Te contactăm când avem un post potrivit.',
            ),
          ],
        },
      }

    case 'contact':
      return {
        ro: [
          {
            blockType: 'contactCards',
            kicker: 'După nevoie',
            heading: 'Cu cine vorbești',
            cards: [
              { person: people.office, need: 'Cereale, depozitare, inputuri' },
              { person: people.ifn, need: 'Finanțare' },
              { person: people.logistics, need: 'Transport și logistică' },
            ],
          },
          {
            blockType: 'figureTable',
            kicker: 'Birouri',
            heading: 'Unde ne găsești',
            keys: ['C2', 'C3', 'C9.phone', 'C9.email'],
          },
          {
            blockType: 'leadForm',
            leadType: 'general',
            extraFields: ['company', 'county'],
            heading: 'Scrie-ne',
            body: 'Cererea ajunge direct la persoana care se ocupă de ea.',
          },
        ],
        en: [
          {
            blockType: 'contactCards',
            heading: 'Who to talk to',
            cards: [
              { person: people.office, need: 'Grain, storage, inputs' },
              { person: people.ifn, need: 'Financing' },
            ],
          },
          {
            blockType: 'leadForm',
            leadType: 'general',
            extraFields: ['company'],
            heading: 'Write to us',
          },
        ],
        faq: {
          ro: [
            q(
              'Cât de repede primesc răspuns?',
              'Te contactăm cât mai curând în timpul programului. Cererea ajunge direct la persoana responsabilă de subiectul ales.',
            ),
          ],
        },
      }

    case 'confidentialitate':
      return {
        ro: [
          {
            blockType: 'callout',
            tone: 'warning',
            title: 'Text în lucru',
            body: 'Această politică este o schiță și va fi validată de Agrinvest înainte de lansarea site-ului.',
          },
          {
            blockType: 'richText',
            content: rt(`## Ce date colectăm

Când completezi un formular pe acest site, colectăm numele, telefonul, adresa de e-mail și, dacă le adaugi, firma, județul, cultura și mesajul tău.

## De ce le folosim

Folosim datele doar ca să răspundem cererii tale: ofertă de preț, depozitare, transport, finanțare, parteneriat sau un loc de muncă. Nu le vindem și nu le folosim pentru reclame fără acordul tău.

## Cât timp le păstrăm

Păstrăm datele cât este nevoie pentru a răspunde cererii și pentru obligațiile legale ale companiei.

## Drepturile tale

Poți cere oricând acces la datele tale, corectarea sau ștergerea lor. Scrie-ne la [dpo@agrinvest.ro](mailto:dpo@agrinvest.ro).`),
          },
        ],
        en: [
          {
            blockType: 'callout',
            tone: 'warning',
            title: 'Draft',
            body: 'This policy is a draft and will be approved by Agrinvest before launch.',
          },
          {
            blockType: 'richText',
            content: rt(
              'We use the details you send through our forms (name, phone, email and your message) only to answer your enquiry. To access, correct or delete your data, write to [dpo@agrinvest.ro](mailto:dpo@agrinvest.ro).',
            ),
          },
        ],
      }

    default:
      return null
  }
}

/** Crop pages: short intro and FAQ per crop (reception standards come from Agrinvest). */
export const cropContent: Record<string, { season: string; intro: string }> = {
  wheat: {
    season: 'iulie',
    intro:
      'Cumpărăm grâu direct de la fermieri, la recoltă sau din stoc. Îl primim în bazele noastre, îl analizăm la recepție, iar plata se face {{C8}}.',
  },
  maize: {
    season: 'septembrie–noiembrie',
    intro:
      'Cumpărăm porumb direct de la fermieri, la recoltă sau din stoc. Porumbul recoltat umed îl putem usca în bazele cu uscător, iar plata se face {{C8}}.',
  },
  sunflower: {
    season: 'august–septembrie',
    intro:
      'Cumpărăm floarea-soarelui direct de la fermieri, la recoltă sau din stoc, cu recepție în bazele noastre și plata {{C8}}.',
  },
  rapeseed: {
    season: 'iunie–iulie',
    intro:
      'Cumpărăm rapiță direct de la fermieri, imediat după recoltare sau din stoc, cu recepție în bazele noastre și plata {{C8}}.',
  },
  barley: {
    season: 'iunie–iulie',
    intro:
      'Cumpărăm orz direct de la fermieri, la recoltă sau din stoc, cu recepție în bazele noastre și plata {{C8}}.',
  },
}

/** Generic crop FAQ, with the crop name filled in. */
export const cropFaq = (lower: string, season: string): Faq => [
  q(
    `Când cumpără Agrinvest ${lower}?`,
    `Tot anul: la recoltă (de regulă ${season}) și din stoc, din bazele noastre sau de la fermă.`,
  ),
  q(
    `Cum se stabilește prețul pentru ${lower}?`,
    `Prețul depinde de calitatea mărfii (umiditate, impurități, masă hectolitrică), de bază și de piața zilei. Sună-ne sau trimite formularul pentru prețul de azi.`,
  ),
  q(
    `Unde pot livra ${lower}?`,
    `La oricare dintre bazele Agrinvest. Alege baza cea mai apropiată de pe hartă.`,
  ),
  q(`Când primesc banii pentru ${lower}?`, `Plata se face {{C8}}.`),
]
