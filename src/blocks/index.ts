import type { Block } from 'payload'

import { link } from '@/fields'
import { leadTypeOptions } from '@/lib/leads/types'

/**
 * Page blocks. Each block maps to one design-system pattern (rendered by
 * `src/components/RenderBlocks.tsx`). Figures are referenced by register key, never typed.
 */

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
    { name: 'heading', type: 'text', localized: true },
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
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', localized: true, required: true },
        { name: 'body', type: 'textarea', localized: true },
        {
          name: 'icon',
          type: 'select',
          options: ['wheat', 'silo', 'truck', 'pin', 'leaf', 'cart', 'phone'],
        },
        link('link'),
      ],
    },
  ],
}

export const StorySectionBlock: Block = {
  slug: 'storySection',
  interfaceName: 'StorySectionBlock',
  fields: [
    { name: 'heading', type: 'text', localized: true, required: true },
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
    { name: 'heading', type: 'text', localized: true },
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
    { name: 'heading', type: 'text', localized: true },
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
    { name: 'heading', type: 'text', localized: true },
    { name: 'people', type: 'relationship', relationTo: 'people', hasMany: true, required: true },
  ],
}

export const VideoEmbedBlock: Block = {
  slug: 'videoEmbed',
  interfaceName: 'VideoEmbedBlock',
  fields: [
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
  ServiceGridBlock,
  StorySectionBlock,
  BaseListBlock,
  CropListBlock,
  CtaBandBlock,
  LeadFormBlock,
  ContactCardsBlock,
  VideoEmbedBlock,
  CalloutBlock,
]
