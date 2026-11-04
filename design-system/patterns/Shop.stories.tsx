import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { shopUi } from '@/i18n/shop'

import { storyLocale } from '../fixtures/story'
import {
  DocumentList,
  DoseTable,
  FacetPanel,
  PackTable,
  ProductGallery,
  ShopTile,
  SpecSheet,
} from './Shop'

const meta: Meta = { title: 'Patterns/Shop', parameters: { layout: 'fullscreen' } }
export default meta
type Story = StoryObj

const Page = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto grid max-w-page gap-8 px-4 py-8 md:px-8">{children}</div>
)

/** Links, so filters work without JavaScript. Counts respect the other active filters. */
export const Facets: Story = {
  render: (_, { globals }) => {
    const t = shopUi[storyLocale(globals)]
    return (
      <Page>
        <div className="max-w-xs">
          <FacetPanel
            title={t.filters}
            clear={{ href: '#', label: t.clear }}
            groups={[
              {
                key: 'crop',
                label: t.crop,
                options: [
                  { label: 'Grâu', href: '#grau', count: 12, active: true },
                  { label: 'Porumb', href: '#porumb', count: 7, active: false },
                ],
              },
              {
                key: 'stock',
                label: t.stock,
                options: [{ label: t.inStockOnly, href: '#stoc', count: 9, active: false }],
              },
            ]}
          />
        </div>
      </Page>
    )
  },
}

/** No photo yet: the page keeps its layout. */
export const GalleryWithoutPhotos: Story = {
  render: () => (
    <Page>
      <div className="max-w-md">
        <ProductGallery images={[]} />
      </div>
    </Page>
  ),
}

/** All pack sizes and prices at once: no selector, no JavaScript. Stacks on phones. */
export const Packs: Story = {
  render: (_, { globals }) => {
    const t = shopUi[storyLocale(globals)]
    return (
      <Page>
        <PackTable
          caption={t.packsCaption('Amino')}
          labels={{ pack: t.pack, price: t.price, unitPrice: t.unitPrice, stock: t.stock }}
          rows={[
            {
              key: '1',
              pack: '1 l',
              price: '99 lei',
              unitPrice: '99 lei/l',
              stock: { label: t.inStock, available: true },
            },
            {
              key: '2',
              pack: '20 l',
              price: '1.580 lei',
              unitPrice: '79 lei/l',
              stock: { label: t.outOfStock, available: false },
            },
          ]}
        />
      </Page>
    )
  },
}

export const Doses: Story = {
  render: (_, { globals }) => {
    const t = shopUi[storyLocale(globals)]
    return (
      <Page>
        <DoseTable
          caption={t.dosesCaption('Orius 25 EW')}
          labels={t.dose}
          rows={[
            {
              key: '1',
              crop: 'Grâu',
              target: 'Făinare, rugini',
              timing: 'La apariția bolii',
              dose: '0,5 l/ha',
              water: '200–400 l/ha',
              waiting: t.days(35),
            },
            { key: '2', crop: 'Rapiță', dose: '0,75–1 l/ha' },
          ]}
        />
      </Page>
    )
  },
}

export const Specs: Story = {
  render: (_, { globals }) => {
    const t = shopUi[storyLocale(globals)]
    return (
      <Page>
        <SpecSheet
          rows={[
            { label: t.spec.ingredients, value: 'Tebuconazol 250 g/l' },
            { label: t.spec.formulation, value: 'EW' },
            { label: t.spec.use, value: t.spec.professional },
          ]}
        />
      </Page>
    )
  },
}

export const Documents: Story = {
  render: (_, { globals }) => {
    const t = shopUi[storyLocale(globals)]
    return (
      <Page>
        <DocumentList
          items={[
            { href: '#a', title: 'Orius 25 EW', kind: t.documentKinds.technical },
            { href: '#b', title: 'Orius 25 EW', kind: t.documentKinds.safety },
          ]}
        />
      </Page>
    )
  },
}

export const Tiles: Story = {
  render: (_, { globals }) => {
    const t = shopUi[storyLocale(globals)]
    return (
      <Page>
        <ul className="grid gap-3 sm:grid-cols-3">
          <li>
            <ShopTile href="#" title="Erbicide" meta={t.products(18)} />
          </li>
          <li>
            <ShopTile href="#" title="Fungicide" meta={t.products(1)} />
          </li>
        </ul>
      </Page>
    )
  },
}
