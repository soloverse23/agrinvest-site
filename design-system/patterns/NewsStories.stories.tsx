import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { newsUi } from '@/i18n/news'

import { storyLocale } from '../fixtures/story'
import {
  ImportantNow,
  StoryRow,
  TopicChip,
  type StoryCardData,
  type StoryLabels,
} from './NewsStories'

const meta: Meta = { title: 'Patterns/News stories', parameters: { layout: 'padded' } }
export default meta
type Story = StoryObj

const labels = (locale: 'ro' | 'en'): StoryLabels => ({
  sources: newsUi[locale].sources,
  references: newsUi[locale].references,
  via: newsUi[locale].via,
})

/** Made-up stories for the design only; the links go nowhere. */
const at = (h: number) => new Date(Date.UTC(2026, 10, 15, h))
const sample: StoryCardData[] = [
  {
    key: '1',
    rank: 1,
    title: 'APIA începe plata în avans pentru fermieri de luni',
    href: '#',
    topic: { label: 'Subvenții', tone: 'support' },
    lang: 'ro',
    date: at(9),
    excerpt: {
      source: 'Agrointel',
      text: 'Fermierii care au depus cererile unice de plată primesc avansul din subvenții începând de luni, anunță agenția.',
    },
    sources: [
      { name: 'Agrointel', title: 'APIA începe plata în avans pentru fermieri de luni', url: '#a' },
      { name: 'MADR', title: 'Plata în avans pentru campania 2026 începe luni', url: '#b' },
      {
        name: 'Reuters',
        title: 'Romania starts farm subsidy advance payments',
        url: '#c',
        viaGoogle: true,
      },
    ],
  },
  {
    key: '2',
    rank: 2,
    title: 'Ukraine hopes for grain exports breakthrough',
    href: '#',
    topic: { label: 'Prețuri', tone: 'price' },
    lang: 'en',
    date: at(7),
    sources: [
      {
        name: 'Reuters',
        title: 'Ukraine hopes for grain exports breakthrough',
        url: '#d',
        viaGoogle: true,
      },
    ],
  },
  {
    key: '3',
    rank: 3,
    title: 'Seceta lovește culturile de rapiță din Dobrogea',
    href: '#',
    topic: { label: 'Vreme', tone: 'weather' },
    lang: 'ro',
    date: at(6),
    sources: [
      {
        name: 'Revista Ferma',
        title: 'Seceta lovește culturile de rapiță din Dobrogea',
        url: '#e',
      },
      { name: 'Ziarul Financiar', title: 'Rapița din Dobrogea, afectată de secetă', url: '#f' },
    ],
  },
  {
    key: '4',
    rank: 4,
    title: 'Comisia Europeană propune noi cote pentru importurile din Ucraina',
    href: '#',
    topic: { label: 'Comerț UE', tone: 'trade' },
    lang: 'ro',
    date: at(5),
    sources: [{ name: 'Mediafax', title: 'Noi cote pentru importurile din Ucraina', url: '#g' }],
  },
  {
    key: '5',
    rank: 5,
    title: 'Focar de pestă porcină africană confirmat în Tulcea',
    href: '#',
    topic: { label: 'Boli', tone: 'disease' },
    lang: 'ro',
    date: at(4),
    sources: [{ name: 'Agrointel', title: 'Focar de pestă porcină africană în Tulcea', url: '#h' }],
  },
]

/** `/stiri`: the lead story beside the next four. */
export const Important: Story = {
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <div className="max-w-page">
        <ImportantNow stories={sample} locale={locale} labels={labels(locale)} />
      </div>
    )
  },
}

/** A daily edition entry: every source with its own headline. */
export const EditionEntry: Story = {
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <div className="max-w-3xl">
        <StoryRow story={sample[0]} locale={locale} labels={labels(locale)} references level={2} />
      </div>
    )
  },
}

/** The topic chips in every tone. */
export const Chips: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <TopicChip label="Prețuri" tone="price" />
      <TopicChip label="Subvenții" tone="support" />
      <TopicChip label="Vreme" tone="weather" />
      <TopicChip label="Boli" tone="disease" />
      <TopicChip label="Comerț UE" tone="trade" />
      <TopicChip label="Fermă" tone="neutral" />
    </div>
  ),
}
