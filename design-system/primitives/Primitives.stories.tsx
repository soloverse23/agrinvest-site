import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { storyLocale } from '../fixtures/story'
import { ArrowRightIcon, CartIcon } from '../icons/icons'
import { Badge } from './Badge'
import { Button } from './Button'
import { Delta } from './Delta'
import { SelectField, TextField } from './Field'
import { SegmentedControl } from './SegmentedControl'

const meta: Meta = { title: 'Primitives' }
export default meta
type Story = StoryObj

const t = {
  ro: {
    primary: 'Vezi prețul de azi',
    secondary: 'Cere ofertă',
    ghost: 'Toate prețurile',
    add: 'Adaugă în coș',
    lime: 'Simulează finanțarea',
    onDark: 'Cum funcționează',
    disabled: 'Indisponibil',
  },
  en: {
    primary: 'See today’s price',
    secondary: 'Request a quote',
    ghost: 'All prices',
    add: 'Add to cart',
    lime: 'Simulate financing',
    onDark: 'How it works',
    disabled: 'Unavailable',
  },
}

/**
 * Pill buttons. `primary` for the one main action per view; `secondary` beside it; `ghost` for
 * tertiary links; `lime` and `on-dark` only on forest. Accessibility: 40/48/56 px tall, visible
 * focus ring, a link when `href` is set.
 */
export const Buttons: Story = {
  render: (_, { globals }) => {
    const l = t[storyLocale(globals)]
    return (
      <div className="grid gap-8">
        <div className="flex flex-wrap items-center gap-3">
          <Button icon={<ArrowRightIcon />}>{l.primary}</Button>
          <Button variant="secondary">{l.secondary}</Button>
          <Button variant="ghost" icon={<ArrowRightIcon />}>
            {l.ghost}
          </Button>
          <Button leadingIcon={<CartIcon />}>{l.add}</Button>
          <Button disabled>{l.disabled}</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">{l.primary}</Button>
          <Button size="md">{l.primary}</Button>
          <Button size="lg">{l.primary}</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-forest p-8">
          <Button variant="lime" icon={<ArrowRightIcon />}>
            {l.lime}
          </Button>
          <Button variant="on-dark">{l.onDark}</Button>
        </div>
      </div>
    )
  },
}

export const Badges: Story = {
  render: (_, { globals }) => {
    const ro = storyLocale(globals) === 'ro'
    return (
      <div className="flex flex-wrap gap-2">
        <Badge>{ro ? 'Erbicid' : 'Herbicide'}</Badge>
        <Badge tone="accent" dot>
          {ro ? 'În stoc' : 'In stock'}
        </Badge>
        <Badge tone="warning" dot>
          {ro ? 'La comandă' : 'On order'}
        </Badge>
        <Badge tone="lime">{ro ? 'Plata la recoltă' : 'Pay at harvest'}</Badge>
        <Badge tone="info">{ro ? 'Uz profesional' : 'Professional use'}</Badge>
        <Badge tone="danger">{ro ? 'Stoc epuizat' : 'Sold out'}</Badge>
        <Badge tone="forest">IFN</Badge>
      </div>
    )
  },
}

/** Price change: arrow + sign + value in a soft pill; screen readers hear "up 15". */
export const Deltas: Story = {
  render: (_, { globals }) => {
    const locale = storyLocale(globals)
    return (
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          <Delta value={15} locale={locale} />
          <Delta value={-10} locale={locale} />
          <Delta value={0} locale={locale} />
          <Delta value={30} locale={locale} unit="lei/t" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Delta value={15} locale={locale} size="sm" />
          <Delta value={-10} locale={locale} size="sm" />
          <Delta value={0} locale={locale} size="sm" />
        </div>
      </div>
    )
  },
}

/** Label above, hint under it, error below; unit inside the field. 48 px tall, 3:1 border. */
export const Fields: Story = {
  render: (_, { globals }) => {
    const ro = storyLocale(globals) === 'ro'
    return (
      <form className="grid max-w-xl gap-6 rounded-xl bg-raised p-6 shadow-raised md:p-8">
        <TextField
          label={ro ? 'Suprafață cultivată' : 'Area farmed'}
          suffix="ha"
          inputMode="decimal"
          placeholder="120"
        />
        <SelectField
          label={ro ? 'Cultura' : 'Crop'}
          hint={ro ? 'Prețul diferă pe cultură și pe bază.' : 'The price differs by crop and base.'}
          options={[
            { value: 'wheat', label: ro ? 'Grâu' : 'Wheat' },
            { value: 'maize', label: ro ? 'Porumb' : 'Maize' },
            { value: 'sunflower', label: ro ? 'Floarea-soarelui' : 'Sunflower' },
          ]}
        />
        <TextField
          label={ro ? 'Umiditate' : 'Moisture'}
          suffix="%"
          inputMode="decimal"
          defaultValue="18,5"
          error={
            ro
              ? 'Peste 14% se aplică scăzământ la uscare.'
              : 'Above 14%, a drying deduction applies.'
          }
        />
        <TextField
          label={ro ? 'Telefon' : 'Phone'}
          type="tel"
          autoComplete="tel"
          placeholder="07xx xxx xxx"
        />
      </form>
    )
  },
}

export const Segmented: Story = {
  name: 'Segmented control',
  render: (_, { globals }) => {
    const ro = storyLocale(globals) === 'ro'
    return (
      <div className="grid gap-4">
        <SegmentedControl
          label={ro ? 'Bază' : 'Base'}
          options={[
            { value: 'all', label: ro ? 'Toate bazele' : 'All bases' },
            { value: 'pogoanele', label: 'Pogoanele' },
            { value: 'cretesti', label: 'Crețești' },
            { value: 'saratuica', label: 'Sărățuica' },
          ]}
          defaultValue="pogoanele"
        />
        <SegmentedControl
          size="sm"
          label={ro ? 'Perioadă' : 'Period'}
          options={[
            { value: '7', label: ro ? '7 zile' : '7 days' },
            { value: '30', label: ro ? '30 de zile' : '30 days' },
            { value: '365', label: ro ? '1 an' : '1 year' },
          ]}
        />
      </div>
    )
  },
}
