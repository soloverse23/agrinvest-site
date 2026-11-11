import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { Locale } from '@/i18n/config'
import { shopUi } from '@/i18n/shop'
import type { QuickAddState } from '@/lib/commerce/state'
import type { PackOption } from '@/lib/shop/dose'

import { storyLocale } from '../fixtures/story'
import { DoseCalculator, type CalcUse, type DoseCalculatorProps } from './DoseCalculator'

/**
 * The dose calculator's states (7c.4). Every number comes from the label row's parsed
 * `doseMin`/`doseMax`/`doseUnit`; a row without them shows its text and the consultant link.
 * Doses and prices here are SAMPLE data.
 */
const meta: Meta = { title: 'Patterns/Dose calculator', parameters: { layout: 'padded' } }
export default meta
type Story = StoryObj

const l = (locale: Locale, ro: string, en: string) => (locale === 'ro' ? ro : en)

const later =
  <T,>(result: T) =>
  async (): Promise<T> =>
    new Promise((r) => setTimeout(() => r(result), 400))

const kgPacks: PackOption[] = [
  { sku: 'A-1', size: 1, unit: 'kg', price: 178.5, stock: 'in-stock' },
  { sku: 'A-5', size: 5, unit: 'kg', price: 862, stock: 'in-stock' },
]
const lPacks: PackOption[] = [
  { sku: 'B-1', size: 1, unit: 'l', price: 64, stock: 'in-stock' },
  { sku: 'B-5', size: 5, unit: 'l', price: 290, stock: 'in-stock' },
  { sku: 'B-20', size: 20, unit: 'l', price: 1080, stock: 'out-of-stock' },
]

type Case = {
  title: { ro: string; en: string }
  uses: (locale: Locale) => CalcUse[]
  packs: PackOption[]
  initial?: DoseCalculatorProps['initial']
  state?: QuickAddState
}

const cases: Case[] = [
  {
    title: { ro: 'Doză la hectar, cu rezultat', en: 'Dose per hectare, with a result' },
    uses: (locale) => [
      {
        id: 'w',
        label: l(locale, 'Grâu, orz · BBCH 51–69', 'Wheat, barley · BBCH 51–69'),
        doseText: '0,15–0,3 kg/ha',
        min: 0.15,
        max: 0.3,
        unit: 'kg/ha',
        water: '200–400 l/ha',
      },
      {
        id: 'r',
        label: l(locale, 'Rapiță · BBCH 51–59', 'Rapeseed · BBCH 51–59'),
        doseText: '0,15 kg/ha',
        min: 0.15,
        max: 0.15,
        unit: 'kg/ha',
      },
    ],
    packs: kgPacks,
    initial: { area: 40 },
  },
  {
    title: { ro: 'Doză în procente (cu apa)', en: 'Percentage dose (with the water)' },
    uses: (locale) => [
      {
        id: 'p',
        label: l(locale, 'Toate culturile · adjuvant', 'All crops · adjuvant'),
        doseText: '0,1–0,2%',
        min: 0.1,
        max: 0.2,
        unit: '%',
        water: '200–300 l/ha',
      },
    ],
    packs: lPacks,
    initial: { area: 60, dose: 0.1, water: 250 },
  },
  {
    title: { ro: 'Doză la tona de sămânță', en: 'Dose per tonne of seed' },
    uses: (locale) => [
      {
        id: 't',
        label: l(locale, 'Grâu · tratament sămânță', 'Wheat · seed treatment'),
        doseText: '1,5–2 l/t',
        min: 1.5,
        max: 2,
        unit: 'l/t',
      },
    ],
    packs: lPacks,
    initial: { area: 12 },
  },
  {
    title: { ro: 'Rând fără numere', en: 'A row without numbers' },
    uses: (locale) => [
      {
        id: 'n',
        label: l(locale, 'Porumb · la apariția dăunătorului', 'Maize · when the pest appears'),
        doseText: l(locale, 'conform etichetei, după dăunător', 'as per label, by pest'),
      },
    ],
    packs: kgPacks,
  },
  {
    title: { ro: 'Niciun ambalaj în stoc', en: 'No pack in stock' },
    uses: (locale) => [
      {
        id: 's',
        label: l(locale, 'Grâu de toamnă · semănat', 'Winter wheat · sowing'),
        doseText: '200–220 kg/ha',
        min: 200,
        max: 220,
        unit: 'kg/ha',
      },
    ],
    packs: [{ sku: 'S-800', size: 800, unit: 'kg', price: null, stock: 'on-request' }],
    initial: { area: 25 },
  },
  {
    title: { ro: 'După „Adaugă în coș”', en: 'After “Add to cart”' },
    uses: (locale) => [
      {
        id: 'a',
        label: l(locale, 'Floarea-soarelui · BBCH 14–18', 'Sunflower · BBCH 14–18'),
        doseText: '1–1,5 l/ha',
        min: 1,
        max: 1.5,
        unit: 'l/ha',
        water: '200–300 l/ha',
      },
    ],
    packs: lPacks,
    initial: { area: 23, dose: 1.2 },
    state: { status: 'added', count: 7 },
  },
]

function States({ locale }: { locale: Locale }) {
  const P = shopUi[locale].product
  return (
    <div className="mx-auto grid max-w-3xl gap-10 bg-paper text-ink">
      {cases.map((c) => (
        <section key={c.title.en} className="grid gap-3">
          <h2 className="text-caption font-semibold tracking-wide text-muted uppercase">
            {c.title[locale]}
          </h2>
          <DoseCalculator
            locale={locale}
            uses={c.uses(locale)}
            packs={c.packs}
            cartHref={l(locale, '/cos', '/en/cart')}
            consultHref="#cerere"
            action={later<QuickAddState>({ status: 'added', count: 3 })}
            initial={c.initial}
            initialState={c.state}
            labels={{
              ...P.calc,
              adding: P.adding,
              added: P.added,
              viewCart: P.viewCart,
              failed: P.failed,
            }}
          />
        </section>
      ))}
    </div>
  )
}

export const AllStates: Story = {
  name: 'States',
  render: (_, { globals }) => <States locale={storyLocale(globals)} />,
}
