import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { companyChain, companyServices } from '@/lib/company'

import { storyLocale } from '../fixtures/story'
import { BaseMap, type MapBase } from './BaseMap'
import { SeasonChain, ServiceList } from './Company'
import { project } from './map/projection'

const meta: Meta = { title: 'Patterns/Company', parameters: { layout: 'fullscreen' } }
export default meta
type Story = StoryObj

const Page = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto max-w-page px-4 py-8 md:px-8">{children}</div>
)

/** The 17 seeded bases (positions as entered in Payload). */
const sample: [string, string, number, number, number | null, string[]][] = [
  ['Stolnici', 'AG', 24.8181, 44.9284, 8500, ['reception', 'storage']],
  ['Știubei', 'AG', 24.8224, 44.7896, 5000, ['reception', 'storage']],
  ['Traian', 'BR', 27.911, 45.2003, 6500, ['reception', 'cleaning', 'storage']],
  ['Grădiștea', 'BR', 27.9052, 45.3369, 13000, ['reception', 'storage']],
  ['Pogoanele', 'BZ', 26.7739, 45.079, 86000, ['reception', 'drying', 'storage']],
  ['Cetate', 'DJ', 23.7569, 44.2478, 7000, ['reception', 'drying']],
  ['Foltești', 'GL', 28.1098, 45.4354, 10000, ['reception', 'storage']],
  ['Vedea', 'GR', 26.07, 43.9, 17500, ['reception', 'storage']],
  ['Mihăilești', 'GR', 26.0699, 43.904, 13500, ['reception', 'storage']],
  ['Sărățuica', 'IL', 27.3066, 44.6277, 18000, ['reception', 'drying', 'storage']],
  ['Fulga', 'PH', 25.9754, 44.8684, 13000, ['reception', 'storage']],
  ['Strejnicu', 'PH', 26.12, 44.9413, 8000, ['reception', 'storage']],
  ['Bărăitaru', 'PH', 26.1196, 44.9467, 6000, ['reception', 'storage']],
  ['Valea Nucarilor', 'TL', 28.7495, 45.2491, 2000, ['reception', 'storage']],
  ['Slobozia Mândră', 'TR', 25.4299, 43.9727, 8000, ['reception', 'storage']],
  ['Balaci', 'TR', 25.2724, 44.0354, 10000, ['reception', 'drying', 'cleaning', 'storage']],
  ['Crețești', 'VS', 27.6738, 46.7062, 20000, ['reception', 'storage']],
]
const bases: MapBase[] = sample.map(([name, county, lng, lat, capacity, services], i) => {
  const [x, y] = project(lng, lat)
  const slug = name.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, '-')
  return { id: String(i), slug, name, county, capacity, services, x, y }
})

/** The storage page: the bases as dots; a county's box on hover or tap. */
export const Map: Story = {
  name: 'Base map',
  render: (_, { globals }) => (
    <Page>
      <BaseMap locale={storyLocale(globals)} bases={bases} />
    </Page>
  ),
}

/** A narrow screen: the box opens on tap. */
export const MapNarrow: Story = {
  name: 'Base map, phone',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: (_, { globals }) => (
    <div className="max-w-sm px-4 py-8">
      <BaseMap locale={storyLocale(globals)} bases={bases} />
    </div>
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

/** The services page (/despre): the whole package in season order. */
export const Services: Story = {
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    const { services, kicker, title, intro } = companyServices(locale)
    return (
      <div className="py-8">
        <ServiceList kicker={kicker} title={title} intro={intro} services={services} />
      </div>
    )
  },
}
