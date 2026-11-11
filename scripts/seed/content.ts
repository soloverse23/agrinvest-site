/**
 * Romanian page content: blocks and FAQ per page. The copy is a draft rewritten from the
 * old site (agrinvest.ro, read 2026-11-03) for Agrinvest to review. The English site has the
 * same pages and blocks (content-en.ts).
 *
 * Numbers and other register facts are never typed: `{{KEY}}` renders the figures register
 * value with its "to confirm" marker (src/components/FactText.tsx).
 */
import type { Page } from '@/payload-types'

import { homeFaqFor, homeLayout } from './home'
import { rt } from './richtext'

type Blocks = NonNullable<Page['layout']>
type Faq = NonNullable<Page['faq']>
export type Ctx = {
  people: Record<string, number>
  /** Media ids by frame name; empty when the local footage is not available (CI). */
  media: Record<string, number | undefined>
}
type Content = { ro: Blocks; faq?: { ro: Faq } }

const q = (question: string, answer: string) => ({ question, answer })

const figures = (keys: string[]) => ({
  blockType: 'figureStrip' as const,
  items: keys.map((figure) => ({ figure })),
})

export function contentFor(key: string, ctx: Ctx): Content | null {
  const { people, media } = ctx
  switch (key) {
    case 'home':
      // Phase 7b: the hero slider only; the sections below it are drawn in code.
      return { ro: homeLayout('ro', media), faq: { ro: homeFaqFor('ro') } }

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
            keys: ['C1', 'C5', 'C4', 'C7', 'C8', 'C10'],
          },
          {
            blockType: 'figureTable',
            kicker: 'Depozitare',
            heading: 'Baze și capacitate',
            keys: ['S1', 'S2'],
          },
          { blockType: 'baseList', showMap: true },
          { blockType: 'figureTable', kicker: 'Logistică', heading: 'Flota', keys: ['L1', 'L2'] },
          {
            blockType: 'figureTable',
            kicker: 'Finanțare',
            heading: 'Agrinvest Credit IFN',
            keys: [
              'F1',
              'F2.cui',
              'F2.reg',
              'F3',
              'F4.reply',
              'F4.money',
              'F5.term',
              'F5.instalments',
              'F6',
            ],
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
                link: { label: 'Finanțarea stocurilor', href: '/finantare/finantare-stocuri' },
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
              'Capacitatea totală este de {{S2}}, în {{S1}} silozuri și depozite de cereale.',
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
- Răspuns {{F4.reply}}
- Durată și rambursare: {{F5.term}}, {{F5.instalments}}
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
        faq: {
          ro: [
            q('În cât timp primesc răspuns la cerere?', 'Răspunsul vine {{F4.reply}}.'),
            q('Pe ce perioadă pot lua un credit?', '{{F5.term}}, {{F5.instalments}}.'),
            q(
              'Ce garanții acceptați?',
              'Bilete la ordin, culturi, utilaje agricole, subvenții APIA, contracte de vânzare a cerealelor sau ipoteci imobiliare.',
            ),
            q('În ce monedă se acordă creditele?', 'Toate finanțările se acordă în lei.'),
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
                body: 'Parteneriate pe termen lung.',
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
            keys: ['C3', 'C9.email'],
          },
          {
            blockType: 'leadForm',
            leadType: 'general',
            extraFields: ['company', 'county'],
            heading: 'Scrie-ne',
            body: 'Cererea ajunge direct la persoana care se ocupă de ea.',
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
