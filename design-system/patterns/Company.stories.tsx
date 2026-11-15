import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { companyChain, nextStep } from '@/lib/company'

import { storyLocale } from '../fixtures/story'
import { BaseMap, type MapBase } from './BaseMap'
import { SeasonChain, SeasonNext } from './Company'
import { project } from './map/projection'

const meta: Meta = { title: 'Patterns/Company', parameters: { layout: 'fullscreen' } }
export default meta
type Story = StoryObj

const Page = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto max-w-page px-4 py-8 md:px-8">{children}</div>
)

const sample: [string, string, number, number, number | null, string[]][] = [
  ['Pogoanele', 'BZ', 26.99, 44.91, 30000, ['reception', 'drying', 'storage']],
  ['Balaci', 'TR', 24.92, 44.35, 10000, ['reception', 'drying', 'cleaning', 'storage']],
  ['Fetești', 'IL', 27.83, 44.39, 18000, ['reception', 'storage']],
  ['Traian', 'BR', 27.75, 45.03, 12000, ['reception', 'cleaning', 'storage']],
  ['Strejnicu', 'PH', 25.96, 44.92, null, ['reception', 'storage']],
  ['Cetate', 'DJ', 23.06, 44.1, 8000, ['reception', 'drying']],
]
const bases: MapBase[] = sample.map(([name, county, lng, lat, capacity, services], i) => {
  const [x, y] = project(lng, lat)
  return { id: String(i), name, href: '#', county, capacity, services, x, y, lat, lng }
})

/** The storage page: every base, the service filter and the county list. */
export const Map: Story = {
  name: 'Base map',
  render: (_, { globals }) => (
    <Page>
      <BaseMap locale={storyLocale(globals)} bases={bases} />
    </Page>
  ),
}

/** A base page: zoomed on its base, with the nearest bases. */
export const MapCurrent: Story = {
  name: 'Base map, on a base page',
  render: (_, { globals }) => (
    <Page>
      <BaseMap locale={storyLocale(globals)} bases={bases} current="1" />
    </Page>
  ),
}

const storage = (locale: 'ro' | 'en') => (locale === 'ro' ? '/depozitare' : '/en/storage')

/** The company title band's chain, on the storage page: reception and storage lit. */
export const Chain: Story = {
  name: 'Season chain',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    const chain = companyChain(locale, storage(locale))!
    return (
      <Page>
        <div className="max-w-xl">
          <SeasonChain
            title={chain.title}
            steps={chain.steps}
            here={storage(locale)}
            hereLabel={locale === 'ro' ? 'Pagina aceasta' : 'This page'}
            again={
              locale === 'ro'
                ? 'Și sezonul următor începe din nou.'
                : 'And the next season starts again.'
            }
          />
        </div>
      </Page>
    )
  },
}

/** The end of a company page: the next step and the pages around it. */
export const Next: Story = {
  name: 'Season next step',
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    const step = nextStep(locale, storage(locale))!
    return (
      <div className="py-8">
        <SeasonNext
          next={{ ...step, kicker: locale === 'ro' ? 'Pasul următor' : 'Next step' }}
          pager={{
            label: 'Company',
            prev: { kicker: '←', label: locale === 'ro' ? 'Cifre' : 'Figures', href: '#' },
            next: { kicker: '→', label: locale === 'ro' ? 'Logistică' : 'Logistics', href: '#' },
          }}
        />
      </div>
    )
  },
}
