import type { Block, Field } from 'payload'

import { sectionIconKeys } from '@ds/icons/keys'
import { link } from '@/fields'
import { leadTypeOptions } from '@/lib/leads/types'

/**
 * Page blocks. Each block maps to one design-system pattern (rendered by
 * `src/components/RenderBlocks.tsx`). Figures are referenced by register key, never typed.
 */

/** Opening of a section: kicker, H2, lead (the SectionHeading pattern). */
const sectionHead = (required = false): Field[] => [
  {
    type: 'row',
    fields: [
      { name: 'kicker', type: 'text', localized: true, admin: { width: '35%' } },
      { name: 'heading', type: 'text', localized: true, required },
    ],
  },
  { name: 'lead', type: 'textarea', localized: true },
]

const iconField: Field = {
  name: 'icon',
  type: 'select',
  options: [...sectionIconKeys],
}

export const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  fields: [
    { name: 'eyebrow', type: 'text', localized: true },
    { name: 'title', type: 'text', localized: true, required: true },
    {
      name: 'accent',
      type: 'text',
      localized: true,
      admin: { description: 'Part of the title set in the accent colour.' },
    },
    { name: 'lead', type: 'textarea', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Optional loop (≤ 8 MB). The image is the poster and the reduced-motion still.',
      },
    },
    link('primary'),
    link('secondary'),
    {
      name: 'needs',
      type: 'array',
      maxRows: 4,
      admin: {
        description: 'Entry points by need on the bottom rail (replaced by prices in Phase 5).',
      },
      fields: [link('link', true), { name: 'hint', type: 'text', localized: true }],
    },
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  interfaceName: 'RichTextBlock',
  fields: [{ name: 'content', type: 'richText', localized: true, required: true }],
}

export const FigureStripBlock: Block = {
  slug: 'figureStrip',
  interfaceName: 'FigureStripBlock',
  fields: [
    ...sectionHead(),
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      fields: [
        {
          name: 'figure',
          type: 'text',
          required: true,
          admin: { description: 'Figures register key, e.g. S1 or L1.' },
        },
        { name: 'label', type: 'text', localized: true },
      ],
    },
    { name: 'countUp', type: 'checkbox', defaultValue: false },
  ],
}

export const ServiceGridBlock: Block = {
  slug: 'serviceGrid',
  interfaceName: 'ServiceGridBlock',
  fields: [
    ...sectionHead(),
    { name: 'columns', type: 'select', defaultValue: '3', options: ['2', '3', '4'] },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', localized: true, required: true },
        { name: 'body', type: 'textarea', localized: true },
        iconField,
        link('link'),
      ],
    },
  ],
}

export const StepsBlock: Block = {
  slug: 'steps',
  interfaceName: 'StepsBlock',
  fields: [
    ...sectionHead(true),
    {
      name: 'items',
      type: 'array',
      minRows: 2,
      maxRows: 6,
      fields: [
        { name: 'title', type: 'text', localized: true, required: true },
        { name: 'body', type: 'textarea', localized: true },
      ],
    },
  ],
}

export const FinanceBandBlock: Block = {
  slug: 'financeBand',
  interfaceName: 'FinanceBandBlock',
  fields: [
    ...sectionHead(true),
    link('primary', true),
    link('secondary'),
    {
      name: 'instalments',
      type: 'array',
      maxRows: 4,
      admin: { description: 'The repayment timeline (figures register F5).' },
      fields: [
        { name: 'when', type: 'text', localized: true, required: true },
        { name: 'label', type: 'text', localized: true, required: true },
      ],
    },
  ],
}

export const FigureTableBlock: Block = {
  slug: 'figureTable',
  interfaceName: 'FigureTableBlock',
  fields: [
    ...sectionHead(),
    {
      name: 'keys',
      type: 'text',
      hasMany: true,
      admin: { description: 'Register keys to show, in order. Empty = the whole register.' },
    },
  ],
}

export const StorySectionBlock: Block = {
  slug: 'storySection',
  interfaceName: 'StorySectionBlock',
  fields: [
    { name: 'kicker', type: 'text', localized: true },
    { name: 'heading', type: 'text', localized: true, required: true },
    { name: 'reverse', type: 'checkbox', defaultValue: false },
    { name: 'body', type: 'richText', localized: true },
    { name: 'media', type: 'upload', relationTo: 'media' },
    { name: 'quote', type: 'textarea', localized: true },
    { name: 'person', type: 'relationship', relationTo: 'people' },
  ],
}

export const BaseListBlock: Block = {
  slug: 'baseList',
  interfaceName: 'BaseListBlock',
  fields: [
    ...sectionHead(),
    {
      name: 'counties',
      type: 'relationship',
      relationTo: 'counties',
      hasMany: true,
      admin: { description: 'Empty = all bases.' },
    },
    { name: 'showMap', type: 'checkbox', defaultValue: true },
  ],
}

export const CropListBlock: Block = {
  slug: 'cropList',
  interfaceName: 'CropListBlock',
  fields: [
    ...sectionHead(),
    {
      name: 'crops',
      type: 'relationship',
      relationTo: 'crops',
      hasMany: true,
      admin: { description: 'Empty = all crops.' },
    },
  ],
}

export const CtaBandBlock: Block = {
  slug: 'ctaBand',
  interfaceName: 'CtaBandBlock',
  fields: [
    { name: 'kicker', type: 'text', localized: true },
    { name: 'heading', type: 'text', localized: true, required: true },
    { name: 'body', type: 'textarea', localized: true },
    link('primary', true),
    link('secondary'),
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'forest',
      options: ['forest', 'surface'],
    },
  ],
}

export const LeadFormBlock: Block = {
  slug: 'leadForm',
  interfaceName: 'LeadFormBlock',
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'body', type: 'textarea', localized: true },
    { name: 'leadType', type: 'select', required: true, options: leadTypeOptions },
    {
      name: 'extraFields',
      type: 'select',
      hasMany: true,
      options: ['company', 'county', 'base', 'crop'],
    },
  ],
}

export const ContactCardsBlock: Block = {
  slug: 'contactCards',
  interfaceName: 'ContactCardsBlock',
  fields: [
    ...sectionHead(),
    {
      name: 'cards',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'person', type: 'relationship', relationTo: 'people', required: true },
        {
          name: 'need',
          type: 'text',
          localized: true,
          admin: { description: 'What to contact this person about, e.g. "Vânzare cereale".' },
        },
      ],
    },
  ],
}

export const VideoEmbedBlock: Block = {
  slug: 'videoEmbed',
  interfaceName: 'VideoEmbedBlock',
  fields: [
    ...sectionHead(),
    { name: 'youtubeId', type: 'text', required: true },
    { name: 'title', type: 'text', localized: true, required: true },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'poster', type: 'upload', relationTo: 'media' },
    { name: 'uploadDate', type: 'date' },
    { name: 'duration', type: 'text', admin: { description: 'ISO 8601, e.g. PT2M30S.' } },
  ],
}

export const CalloutBlock: Block = {
  slug: 'callout',
  interfaceName: 'CalloutBlock',
  fields: [
    { name: 'tone', type: 'select', defaultValue: 'info', options: ['info', 'note', 'warning'] },
    { name: 'title', type: 'text', localized: true },
    { name: 'body', type: 'textarea', localized: true, required: true },
  ],
}

export const pageBlocks: Block[] = [
  HeroBlock,
  RichTextBlock,
  FigureStripBlock,
  FigureTableBlock,
  ServiceGridBlock,
  StepsBlock,
  FinanceBandBlock,
  StorySectionBlock,
  BaseListBlock,
  CropListBlock,
  CtaBandBlock,
  LeadFormBlock,
  ContactCardsBlock,
  VideoEmbedBlock,
  CalloutBlock,
]
