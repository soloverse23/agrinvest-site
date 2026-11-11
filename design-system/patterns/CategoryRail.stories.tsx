import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { Locale } from '@/i18n/config'

import { categoryIcons } from '../icons/categories'
import { categoryIconKeys } from '../icons/keys'
import { storyLocale } from '../fixtures/story'
import { CategoryRail, type RailCategory } from './CategoryRail'

/**
 * Category rail for the shop landing (Phase 7c) and the shop's category icon set. One scrolling
 * row on phones; from `lg` the tiles share the width and list their subcategories on hover or
 * keyboard focus. Counts are sample data.
 */
const meta: Meta = { title: 'Patterns/Category rail', parameters: { layout: 'padded' } }
export default meta
type Story = StoryObj

const l = (locale: Locale, ro: string, en: string) => (locale === 'ro' ? ro : en)
const count = (locale: Locale, n: number) => l(locale, `${n} produse`, `${n} products`)

const items = (locale: Locale): RailCategory[] => [
  {
    href: '/magazin/seminte',
    label: l(locale, 'Semințe', 'Seeds'),
    count: count(locale, 18),
    icon: 'seed',
  },
  {
    href: '/magazin/protectia-plantelor',
    label: l(locale, 'Protecția plantelor', 'Crop protection'),
    count: count(locale, 34),
    icon: 'protection',
    children: [
      { href: '/magazin/erbicide', label: l(locale, 'Erbicide', 'Herbicides') },
      { href: '/magazin/fungicide', label: l(locale, 'Fungicide', 'Fungicides') },
      { href: '/magazin/insecticide', label: l(locale, 'Insecticide', 'Insecticides') },
    ],
  },
  {
    href: '/magazin/erbicide',
    label: l(locale, 'Erbicide', 'Herbicides'),
    count: count(locale, 12),
    icon: 'herbicide',
  },
  {
    href: '/magazin/fungicide',
    label: l(locale, 'Fungicide', 'Fungicides'),
    count: count(locale, 9),
    icon: 'fungicide',
  },
  {
    href: '/magazin/insecticide',
    label: l(locale, 'Insecticide', 'Insecticides'),
    count: count(locale, 7),
    icon: 'insecticide',
  },
  {
    href: '/magazin/nutritie',
    label: l(locale, 'Nutriție', 'Plant nutrition'),
    count: count(locale, 20),
    icon: 'fertiliser',
    children: [
      { href: '/magazin/ingrasaminte', label: l(locale, 'Îngrășăminte', 'Fertilisers') },
      {
        href: '/magazin/fertilizanti-foliare',
        label: l(locale, 'Fertilizanți foliari', 'Foliar fertilisers'),
      },
    ],
  },
  {
    href: '/magazin/agricultura-bio',
    label: l(locale, 'Agricultură bio', 'Organic farming'),
    count: count(locale, 6),
    icon: 'bio',
  },
]

export const Rail: Story = {
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <div className="mx-auto max-w-page pb-40">
        <CategoryRail label={l(locale, 'Categorii', 'Categories')} items={items(locale)} />
      </div>
    )
  },
}

/** Every icon a category can pick (Categories `icon`). */
export const IconSet: Story = {
  name: 'Icon set',
  render: () => (
    <ul className="grid max-w-3xl grid-cols-3 gap-4 md:grid-cols-6">
      {categoryIconKeys.map((key) => {
        const Glyph = categoryIcons[key]
        return (
          <li
            key={key}
            className="grid justify-items-center gap-2 rounded-lg bg-raised p-4 ring-1 ring-line"
          >
            <span className="grid size-12 place-items-center rounded-md bg-accent-soft text-accent">
              <Glyph className="size-7" />
            </span>
            <code className="text-caption text-muted">{key}</code>
          </li>
        )
      })}
    </ul>
  ),
}
