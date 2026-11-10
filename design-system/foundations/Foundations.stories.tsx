import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { storyLocale } from '../fixtures/story'
import * as LineIcons from '../icons/icons'
import { ExternalLinkIcon, socialIcons } from '../icons/social'

const meta: Meta = {
  title: 'Foundations',
  parameters: {
    docs: {
      description: {
        component:
          'Tokens live in `design-system/tokens/tokens.css` and reach components only through Tailwind utilities (`bg-paper`, `text-muted`, `rounded-lg`, `shadow-raised`). `npm run check:contrast` verifies every text/background pair against WCAG AA.',
      },
    },
  },
}
export default meta
type Story = StoryObj

const groups: {
  title: string
  tokens: { name: string; className: string; note: string; dark?: boolean }[]
}[] = [
  {
    title: 'Neutrals',
    tokens: [
      { name: 'paper', className: 'bg-paper', note: 'Page' },
      { name: 'surface', className: 'bg-surface', note: 'Tinted areas' },
      { name: 'raised', className: 'bg-raised', note: 'Cards, inputs' },
      { name: 'line', className: 'bg-line', note: 'Soft dividers' },
      { name: 'line-strong', className: 'bg-line-strong', note: 'Table rules' },
      { name: 'field-line', className: 'bg-field-line', note: 'Input borders', dark: true },
      { name: 'subtle', className: 'bg-subtle', note: 'Captions', dark: true },
      { name: 'muted', className: 'bg-muted', note: 'Secondary text', dark: true },
      { name: 'ink', className: 'bg-ink', note: 'Text', dark: true },
    ],
  },
  {
    title: 'Brand',
    tokens: [
      { name: 'forest', className: 'bg-forest', note: 'Brand bands', dark: true },
      { name: 'forest-raised', className: 'bg-forest-raised', note: 'Cards on forest', dark: true },
      { name: 'accent', className: 'bg-accent', note: 'Actions, links', dark: true },
      { name: 'accent-soft', className: 'bg-accent-soft', note: 'Selected, hover' },
      { name: 'lime', className: 'bg-lime', note: 'From the logo: CTAs on forest' },
      { name: 'lime-soft', className: 'bg-lime-soft', note: 'Crop discs, dose' },
    ],
  },
  {
    title: 'Data and states',
    tokens: [
      { name: 'up', className: 'bg-up', note: 'Price up', dark: true },
      { name: 'down', className: 'bg-down', note: 'Price down', dark: true },
      { name: 'warning', className: 'bg-warning', note: 'Warning text', dark: true },
      { name: 'info', className: 'bg-info', note: 'Info text', dark: true },
      { name: 'up-soft', className: 'bg-up-soft', note: 'Up pill' },
      { name: 'down-soft', className: 'bg-down-soft', note: 'Down pill' },
      { name: 'warning-soft', className: 'bg-warning-soft', note: 'Warning pill' },
      { name: 'info-soft', className: 'bg-info-soft', note: 'Info pill' },
    ],
  },
]

export const Colours: Story = {
  render: () => (
    <div className="grid gap-10">
      {groups.map((group) => (
        <section key={group.title} className="grid gap-4">
          <h2 className="text-h3 font-semibold">{group.title}</h2>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {group.tokens.map((t) => (
              <li
                key={t.name}
                className="overflow-hidden rounded-lg bg-raised shadow-soft ring-1 ring-line"
              >
                <div className={`h-20 ${t.className}`} />
                <div className="p-3">
                  <p className="text-small font-semibold">{t.name}</p>
                  <p className="text-caption text-muted">{t.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  ),
}

const scale = [
  ['display', 'text-display font-semibold'],
  ['h1', 'text-h1 font-semibold'],
  ['h2', 'text-h2 font-semibold'],
  ['h3', 'text-h3 font-semibold'],
  ['h4', 'text-h4 font-semibold'],
  ['lead', 'text-lead'],
  ['body', 'text-body'],
  ['small', 'text-small'],
  ['caption', 'text-caption'],
] as const

const specimen = {
  ro: {
    heading: 'Cumpărăm, depozităm și finanțăm recolta ta.',
    body: 'Plata se face imediat după recepție. Prețul de achiziție se stabilește pe bază, în funcție de umiditate și impurități: Ștefănești, Țăndărei, Însurăței.',
  },
  en: {
    heading: 'We buy, store and finance your harvest.',
    body: 'Payment is made right after reception. The buying price is set per base, adjusted for moisture and impurities.',
  },
}

export const Typography: Story = {
  render: (_, { globals }) => {
    const t = specimen[storyLocale(globals)]
    return (
      <div className="grid max-w-page gap-8">
        <p className="text-small text-muted">
          Onest, one family for headings, text and figures. Tabular figures (
          <code>tabular-nums</code>) for anything that is compared or updates.
        </p>
        <ul className="grid gap-6">
          {scale.map(([name, className]) => (
            <li
              key={name}
              className="grid gap-1 border-t border-line pt-4 md:grid-cols-12 md:gap-6"
            >
              <span className="text-caption text-muted md:col-span-2">{name}</span>
              <p className={`${className} md:col-span-10`}>
                {name.startsWith('h') || name === 'display' ? t.heading : t.body}
              </p>
            </li>
          ))}
        </ul>
        <div className="grid gap-2 rounded-lg bg-surface p-6">
          <p className="text-caption text-muted">Figures</p>
          <p className="flex flex-wrap gap-x-8 gap-y-2 text-figure font-semibold tabular-nums">
            <span>1.020 lei/t</span>
            <span>12,5%</span>
            <span>238.000 t</span>
            <span>3,5–4 l/ha</span>
          </p>
        </div>
      </div>
    )
  },
}

export const ShapeAndElevation: Story = {
  name: 'Shape and elevation',
  render: () => (
    <div className="grid gap-10">
      <section className="grid gap-4">
        <h2 className="text-h3 font-semibold">Radius</h2>
        <ul className="flex flex-wrap gap-4">
          {[
            ['xs', 'rounded-xs', 'Tags in tables'],
            ['sm', 'rounded-sm', 'Small controls'],
            ['md', 'rounded-md', 'Inputs'],
            ['lg', 'rounded-lg', 'Cards'],
            ['xl', 'rounded-xl', 'Panels, hero'],
            ['full', 'rounded-full', 'Buttons, chips'],
          ].map(([name, className, note]) => (
            <li key={name} className="grid justify-items-center gap-2">
              <div className={`size-24 bg-accent-soft ring-1 ring-accent/30 ${className}`} />
              <p className="text-small font-semibold">{name}</p>
              <p className="text-caption text-muted">{note}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="grid gap-4">
        <h2 className="text-h3 font-semibold">Elevation</h2>
        <ul className="grid gap-6 rounded-xl bg-surface p-8 md:grid-cols-3">
          {[
            ['soft', 'shadow-soft', 'Buttons, chips, small cards'],
            ['raised', 'shadow-raised', 'Cards and tables'],
            ['floating', 'shadow-floating', 'Menus, floating price card, hover'],
          ].map(([name, className, note]) => (
            <li key={name} className={`grid gap-1 rounded-lg bg-raised p-6 ${className}`}>
              <p className="font-semibold">{name}</p>
              <p className="text-small text-muted">{note}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  ),
}

/** Line icons plus the social set, which lives in its own module to stay out of client bundles. */
const Icons = {
  ...LineIcons,
  ...Object.fromEntries(Object.values(socialIcons).map((Icon) => [Icon.displayName, Icon])),
}

export const IconSet: Story = {
  name: 'Icons',
  render: () => (
    <ul className="grid grid-cols-3 gap-3 md:grid-cols-6">
      {Object.entries({ ...Icons, ExternalLinkIcon }).map(([name, Icon]) => (
        <li
          key={name}
          className="grid justify-items-center gap-2 rounded-lg bg-raised p-5 shadow-soft ring-1 ring-line"
        >
          <Icon className="size-8 text-forest" />
          <span className="text-caption text-muted">{name.replace('Icon', '')}</span>
        </li>
      ))}
    </ul>
  ),
}
