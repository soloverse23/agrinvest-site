import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { GuaranteeTable, RepaymentCalendar, ReviewNote, SourceList, WorkedExample } from './Finance'

const meta: Meta = { title: 'Patterns/Finance' }
export default meta

/** Accessibility: every table has a caption; rows stack below 768 px instead of scrolling. */
export const Review: StoryObj = {
  render: () => (
    <ReviewNote title="Condiții în curs de confirmare">
      Această pagină nu este o ofertă de credit.
    </ReviewNote>
  ),
}

export const Sources: StoryObj = {
  render: () => (
    <SourceList
      title="Surse"
      lead="Informațiile publice din această pagină vin din:"
      retrieved="consultat la"
      items={[
        { title: 'FGCR: De trei ori subvenția', url: 'https://fgcr.ro/', date: '5 nov. 2026' },
      ]}
    />
  ),
}

export const Example: StoryObj = {
  render: () => (
    <WorkedExample
      kicker="Exemplu"
      title="Fermă de 200 ha, grâu și porumb"
      note="Exemplu cu cifre rotunjite, fără dobândă și costuri. Nu este o ofertă."
      rows={[
        { label: 'Sumă', value: '500.000 lei' },
        { label: 'Rate pe an', value: '2' },
      ]}
    >
      <p className="text-muted">O fermă vrea un utilaj nou.</p>
    </WorkedExample>
  ),
}

export const Guarantees: StoryObj = {
  render: () => (
    <GuaranteeTable
      caption="Garanții acceptate"
      heads={['Garanție', 'Ce înseamnă']}
      rows={[{ kind: 'Utilaje agricole', note: 'Utilajul rămâne în garanție până la rambursare.' }]}
    />
  ),
}

export const Calendar: StoryObj = {
  render: () => (
    <RepaymentCalendar
      caption="Când cad ratele"
      heads={['Rata', 'Culturi', 'Perioadă']}
      rows={[{ label: 'După recolta de vară', crops: 'grâu, orz, rapiță', when: 'iulie–august' }]}
    />
  ),
}
