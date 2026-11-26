import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { LeadFormState } from '@/lib/leads/state'

import { ArrowRightIcon } from '../icons/icons'
import { storyLocale } from '../fixtures/story'
import { ConsultantDialog, type ConsultantDialogProps } from './ConsultantDialog'
import {
  ConsultantBand,
  ConsultantButton,
  CreditBox,
  CreditCards,
  FactorList,
  FitPair,
  HeroPhoto,
  MoreDetails,
  NeedTiles,
  QuestionLinks,
  ShortAnswer,
} from './FinanceGuide'
import { QuestionSearch } from './QuestionSearch'

/**
 * The finance section as a guide (Phase 7g). One action everywhere: "Vorbește cu un
 * consultant", a link to the detailed application that opens the consultant drawer when
 * JavaScript runs. Accessibility: tiles and cards are single links (the whole card is the
 * hit area, one tab stop); the finder's pills are native radios; the drawer is a native modal
 * dialog (focus stays inside, Escape closes, the backdrop closes); "Detalii" is a native
 * disclosure, so every word stays in the HTML.
 */
const meta: Meta = { title: 'Patterns/Finance guide', parameters: { layout: 'padded' } }
export default meta
type Story = StoryObj

const tiles = [
  {
    id: 'season',
    photo: '/media/finance/season.webp',
    label: 'Campania agricolă',
    line: 'Semințe, îngrășăminte, motorină și lucrări, plătite după recoltă.',
    also: { href: '#', label: 'Inputuri cu plata la recoltă' },
  },
  {
    id: 'machinery',
    photo: '/media/finance/machinery.webp',
    label: 'Un tractor sau alt utilaj',
    line: 'Tractoare, combine și echipamente, cu rate după recoltă.',
  },
  {
    id: 'irrigation',
    photo: '/media/finance/irrigation.webp',
    label: 'Irigații',
    line: 'Pompe, conducte și pivoți.',
  },
  {
    id: 'debts',
    photo: '/media/finance/debts.webp',
    label: 'Datorii greu de plătit',
    line: 'Rate mai mici, pe o perioadă mai lungă, și un plan realist.',
  },
]

export const Hub: Story = {
  render: () => (
    <div className="grid max-w-page gap-12">
      <HeroPhoto
        src="/media/finance/hero.webp"
        alt="Combină care descarcă grâul în remorca unui tractor"
        facts={[
          { value: '24 h', label: 'răspuns de la dosarul complet' },
          { value: '10 ani', label: 'durata maximă la investiții' },
          { value: '2 rate/an', label: 'după recoltele de vară și toamnă' },
          { value: '500+', label: 'fermieri finanțați' },
        ]}
      />
      <NeedTiles tiles={tiles.map((t) => ({ ...t, href: '#' }))} />
    </div>
  ),
}

export const CreditPage: Story = {
  render: () => (
    <div className="grid max-w-page gap-10 lg:grid-cols-12">
      <div className="grid content-start gap-8 lg:col-span-7">
        <p className="text-lead">
          Creditul de producție acoperă cheltuielile unui an agricol și se rambursează după recoltă.
        </p>
        <FitPair
          fits={{ title: 'Se potrivește dacă', body: 'Plătești mult primăvara și toamna.' }}
          notFor={{ title: 'Nu se potrivește dacă', body: 'Vrei să cumperi un utilaj.' }}
        />
        <CreditCards
          items={[
            { href: '#', title: 'Credit pentru utilaje agricole', line: 'Tractoare și combine.' },
            { href: '#', title: 'Credit pentru irigații', line: 'Pompe, conducte și pivoți.' },
          ]}
        />
        <MoreDetails summary="Citește detaliile">
          <p>Textul lung al paginii, închis până când fermierul îl deschide.</p>
        </MoreDetails>
      </div>
      <div className="lg:col-span-5">
        <CreditBox
          kicker="Agrinvest Credit IFN"
          title="Credit pentru producție agricolă"
          specs={[
            { label: 'Pentru', value: 'PFA, II, IF, SRL, SA' },
            { label: 'Rambursare', value: 'după recoltă, maximum 2 rate pe an' },
            { label: 'Moneda', value: 'lei' },
          ]}
          primary={
            <ConsultantButton href="#" icon={<ArrowRightIcon />} fullWidth>
              Vorbește cu un consultant
            </ConsultantButton>
          }
          secondary={{ href: '#', label: 'Vezi cum ar cădea ratele' }}
          note="Condițiile se stabilesc pentru fiecare fermă, după analiză."
        />
      </div>
    </div>
  ),
}

export const Question: Story = {
  render: () => (
    <div className="grid max-w-3xl gap-10">
      <ShortAnswer label="Răspunsul pe scurt">
        <p>Da. Persoanele fizice autorizate pot cere credit, la fel ca societățile.</p>
      </ShortAnswer>
      <FactorList
        title="Ce decide la tine"
        lead="Condițiile diferă de la o fermă la alta."
        items={['dacă ferma are CUI și de când', 'ce încasări poate arăta']}
      />
      <QuestionLinks
        items={[
          { href: '#', title: 'Cine poate lua un credit agricol?' },
          { href: '#', title: 'Ce documente trebuie pentru un credit agricol?' },
        ]}
      />
      <QuestionLinks
        variant="cards"
        items={[
          {
            href: '#',
            title: 'Ce garanții acceptă Agrinvest Credit IFN?',
            answer: 'Bilete la ordin, culturi, subvenții APIA.',
          },
          {
            href: '#',
            title: 'Cum funcționează ratele după recoltă?',
            answer: 'Ratele se pun când încasezi.',
          },
        ]}
      />
      <ConsultantBand
        kicker="Agrinvest Credit IFN"
        title="Vrei un răspuns pentru ferma ta?"
        body="Un consultant te sună și îți spune ce se poate în cazul tău."
        action={
          <ConsultantButton href="#" variant="lime" icon={<ArrowRightIcon />}>
            Vorbește cu un consultant
          </ConsultantButton>
        }
      />
    </div>
  ),
}

export const Search: Story = {
  render: () => (
    <div className="grid max-w-xl gap-6">
      <QuestionSearch
        label="Caută o întrebare"
        placeholder="de exemplu: PFA"
        empty="Nicio întrebare."
      />
      <section data-topic="eligibility" className="grid gap-2">
        <h2 className="text-h4 font-semibold">Cine poate lua credit</h2>
        <ul className="grid gap-1">
          <li data-question="Pot lua credit agricol ca PFA?">Pot lua credit agricol ca PFA?</li>
          <li data-question="Cine poate lua un credit agricol?">
            Cine poate lua un credit agricol?
          </li>
        </ul>
      </section>
    </div>
  ),
}

const stub =
  (result: LeadFormState): ConsultantDialogProps['action'] =>
  async () =>
    new Promise((r) => setTimeout(() => r(result), 400))

const dialog = (locale: 'ro' | 'en'): ConsultantDialogProps => ({
  locale,
  action: stub({ status: 'success' }),
  sourcePath: '/finantare/credit-productie',
  privacyHref: locale === 'ro' ? '/confidentialitate' : '/en/privacy',
  needs: [
    { id: 'season', label: locale === 'ro' ? 'Campania agricolă' : 'The farming season' },
    { id: 'machinery', label: locale === 'ro' ? 'Un tractor sau alt utilaj' : 'A tractor' },
  ],
  defaultNeed: 'season',
  credit: 'credit-productie',
  applyHref: '/finantare/aplica?produs=credit-productie',
  reply: locale === 'ro' ? 'în 24 h de la dosarul complet' : 'within 24 hours of a complete file',
  open: true,
})

export const ConsultantDrawer: Story = {
  render: (_, { globals }) => <ConsultantDialog {...dialog(storyLocale(globals))} />,
}

export const ConsultantDrawerSent: Story = {
  render: (_, { globals }) => (
    <ConsultantDialog {...dialog(storyLocale(globals))} initialState={{ status: 'success' }} />
  ),
}
