import type { ArrayField, CollectionAfterChangeHook, CollectionConfig, Field } from 'payload'

import { isStaff, isStaffField, publishedOrStaff } from '@/access'
import { faq, seo, slug } from '@/fields'
import { enrichmentLedger, shopGroup, verified } from '@/fields/shop'
import { revalidate, tags } from '@/lib/revalidate'
import { gapOptions, liveBlockers, productGaps, unitPriceOf } from '@/lib/shop/rules'
import type { Product } from '@/payload-types'

const ofType = (type: Product['productType']) => (data: Partial<Product>) =>
  data?.productType === type

const text = (name: string, ro: string, en: string, localized = true): Field => ({
  name,
  type: 'text',
  localized,
  label: { ro, en },
})

const note = (name: string, ro: string, en: string): Field => ({
  name,
  type: 'textarea',
  localized: true,
  label: { ro, en },
})

const number = (name: string, ro: string, en: string): Field => ({
  name,
  type: 'number',
  min: 0,
  label: { ro, en },
})

/** Crops of a dose row: the wording of the source, and the relation that drives the filters. */
const cropColumns: Field[] = [
  {
    type: 'row',
    fields: [
      text('cropText', 'Cultură, ca în sursă', 'Crop, as in the source'),
      { name: 'crops', type: 'relationship', relationTo: 'crops', hasMany: true },
    ],
  },
]

/** A dose as printed on the label, which is what the page shows, and its parsed numbers. */
const amountColumns = (name: 'dose' | 'rate'): Field[] => [
  text(`${name}Text`, 'Doză, ca în sursă', 'Dose, as in the source'),
  {
    type: 'row',
    fields: [
      number(`${name}Min`, 'Doză minimă', 'Minimum'),
      number(`${name}Max`, 'Doză maximă', 'Maximum'),
      text(`${name}Unit`, 'Unitate (l/ha…)', 'Unit (l/ha…)', false),
    ],
  },
]

/** SKUs identify a pack across orders and price history, so they are unique shop-wide. */
const validateVariants: ArrayField['validate'] = async (value, { id, req }) => {
  const skus = ((value ?? []) as { sku?: string }[]).flatMap((v) => (v.sku ? [v.sku] : []))
  if (new Set(skus).size !== skus.length) return 'Two pack sizes use the same SKU.'
  if (!skus.length) return true
  const { docs } = await req.payload.find({
    collection: 'products',
    where: {
      and: [{ 'variants.sku': { in: skus } }, ...(id ? [{ id: { not_equals: id } }] : [])],
    },
    depth: 0,
    limit: 1,
    pagination: false,
    req,
  })
  return docs.length ? `SKU already used by "${docs[0].name}".` : true
}

const variants: ArrayField = {
  name: 'variants',
  type: 'array',
  label: { ro: 'Ambalaje', en: 'Pack sizes' },
  labels: {
    singular: { ro: 'Ambalaj', en: 'Pack size' },
    plural: { ro: 'Ambalaje', en: 'Pack sizes' },
  },
  validate: validateVariants,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'sku', type: 'text', required: true, index: true },
        {
          name: 'size',
          type: 'number',
          required: true,
          min: 0,
          label: { ro: 'Cantitate', en: 'Size' },
        },
        {
          name: 'unit',
          type: 'select',
          required: true,
          label: { ro: 'Unitate', en: 'Unit' },
          options: [
            'l',
            'ml',
            'kg',
            'g',
            't',
            { label: { ro: 'boabe', en: 'seeds' }, value: 'seeds' },
            { label: { ro: 'bucăți', en: 'pieces' }, value: 'pieces' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          min: 0,
          label: { ro: 'Preț (lei)', en: 'Price (lei)' },
        },
        {
          name: 'vatRate',
          type: 'number',
          min: 0,
          max: 100,
          label: { ro: 'TVA (%)', en: 'VAT (%)' },
          admin: { description: 'Empty until Agrinvest confirms it.' },
        },
        {
          name: 'stock',
          type: 'select',
          required: true,
          defaultValue: 'in-stock',
          label: { ro: 'Stoc', en: 'Stock' },
          options: [
            { label: { ro: 'În stoc', en: 'In stock' }, value: 'in-stock' },
            { label: { ro: 'La cerere', en: 'On request' }, value: 'on-request' },
            { label: { ro: 'Indisponibil', en: 'Out of stock' }, value: 'out-of-stock' },
          ],
        },
        {
          name: 'unitPrice',
          type: 'number',
          label: { ro: 'Preț pe l sau kg', en: 'Price per l or kg' },
          admin: { readOnly: true, description: 'Calculated on save.' },
          hooks: { beforeChange: [({ siblingData }) => unitPriceOf(siblingData)] },
        },
      ],
    },
  ],
}

const protection: Field = {
  name: 'protection',
  type: 'group',
  label: { ro: 'Protecția plantelor', en: 'Crop protection' },
  admin: { condition: ofType('protection') },
  fields: [
    {
      name: 'activeIngredients',
      type: 'array',
      // The default table name makes its foreign key longer than Postgres's 63 characters.
      dbName: 'product_ingredients',
      label: { ro: 'Substanțe active', en: 'Active ingredients' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'ingredient',
              type: 'relationship',
              relationTo: 'active-ingredients',
              required: true,
            },
            number('concentration', 'Concentrație', 'Concentration'),
            text('unit', 'Unitate (g/l, g/kg, %)', 'Unit (g/l, g/kg, %)', false),
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        text('formulation', 'Formulare (SC, EC…)', 'Formulation (SC, EC…)', false),
        text('registrationNumber', 'Număr de omologare', 'Registration number', false),
        {
          name: 'registrationValidUntil',
          type: 'date',
          label: { ro: 'Omologare valabilă până la', en: 'Registration valid until' },
        },
      ],
    },
    {
      name: 'doses',
      type: 'array',
      label: { ro: 'Tabel de doze', en: 'Dose table' },
      admin: { description: 'From the label or the official register only. Never inferred.' },
      fields: [
        ...cropColumns,
        {
          type: 'row',
          fields: [
            text('targetText', 'Ținte, ca în sursă', 'Targets, as in the source'),
            { name: 'target', type: 'relationship', relationTo: 'targets', hasMany: true },
          ],
        },
        {
          type: 'row',
          fields: [
            text('timing', 'Moment de aplicare', 'Timing'),
            text('bbch', 'Stadiu BBCH', 'BBCH stage', false),
          ],
        },
        ...amountColumns('dose'),
        {
          type: 'row',
          fields: [
            text('waterVolume', 'Volum de apă', 'Water volume', false),
            number('maxTreatments', 'Tratamente maxime', 'Maximum treatments'),
            number('waitingPeriod', 'Pauză (zile)', 'Waiting period (days)'),
          ],
        },
        note('notes', 'Observații', 'Notes'),
      ],
    },
    note('modeOfAction', 'Mod de acțiune', 'Mode of action'),
    {
      type: 'row',
      fields: [
        text('resistanceGroup', 'Grupă de rezistență', 'Resistance group', false),
        text('toxicityClass', 'Clasă de toxicitate', 'Toxicity class', false),
      ],
    },
    note('safety', 'Toxicitate și siguranță', 'Toxicity and safety'),
    {
      name: 'professionalUse',
      type: 'checkbox',
      defaultValue: true,
      label: { ro: 'Uz profesional', en: 'Professional use' },
      admin: { description: 'Checkout asks for the buyer’s certificate.' },
    },
    note('compatibility', 'Compatibilitate', 'Compatibility'),
  ],
}

const seed: Field = {
  name: 'seed',
  type: 'group',
  label: { ro: 'Semințe', en: 'Seeds' },
  admin: { condition: ofType('seed') },
  fields: [
    {
      type: 'row',
      fields: [
        text('species', 'Specie', 'Species'),
        text('variety', 'Soi sau hibrid', 'Variety or hybrid', false),
        text('faoGroup', 'Grupă FAO', 'FAO group', false),
      ],
    },
    {
      type: 'row',
      fields: [
        text('maturity', 'Maturitate', 'Maturity'),
        text('sowingDensity', 'Densitate de semănat', 'Sowing density'),
        text('sowingRate', 'Semințe sau kg la hectar', 'Seeds or kg per hectare'),
      ],
    },
    note('yieldPotential', 'Potențial de producție', 'Yield potential'),
    note('resistances', 'Rezistențe și toleranțe', 'Resistances and tolerances'),
    note('recommendedZones', 'Zone recomandate', 'Recommended zones'),
    note('seedTreatment', 'Tratament sămânță', 'Seed treatment'),
  ],
}

const fertiliser: Field = {
  name: 'fertiliser',
  type: 'group',
  label: { ro: 'Îngrășăminte', en: 'Fertilisers' },
  admin: { condition: ofType('fertiliser') },
  fields: [
    {
      name: 'nutrients',
      type: 'array',
      label: { ro: 'Compoziție', en: 'Composition' },
      admin: { description: 'N, P2O5, K2O, S and micronutrients.' },
      fields: [
        {
          type: 'row',
          fields: [
            text('nutrient', 'Element', 'Nutrient', false),
            number('percent', 'Conținut (%)', 'Content (%)'),
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        text('form', 'Formă', 'Form'),
        text('granuleSize', 'Granulație', 'Granule size', false),
      ],
    },
    {
      name: 'rates',
      type: 'array',
      label: { ro: 'Doze pe cultură', en: 'Rates by crop' },
      fields: [
        ...cropColumns,
        text('timing', 'Moment de aplicare', 'Timing'),
        ...amountColumns('rate'),
      ],
    },
    note('storage', 'Depozitare', 'Storage'),
  ],
}

/**
 * Records each published pack price that differs from its last record. It compares with the
 * history rather than the previous document, so draft saves in between cannot lose a change.
 */
const recordPrices: CollectionAfterChangeHook<Product> = async ({ doc, req }) => {
  if (doc._status !== 'published') return doc
  const { docs } = await req.payload.find({
    collection: 'price-history',
    where: { product: { equals: doc.id } },
    sort: 'date',
    depth: 0,
    pagination: false,
    req,
  })
  const last = new Map(docs.map((row) => [row.sku, row.price]))
  for (const { sku, price } of doc.variants ?? []) {
    if (price === null || price === undefined || last.get(sku) === price) continue
    await req.payload.create({
      collection: 'price-history',
      data: {
        product: doc.id,
        sku,
        price,
        date: new Date().toISOString(),
        source: doc.verification?.price?.source,
      },
      req,
    })
  }
  return doc
}

/**
 * The shop catalogue. `_status` decides whether a product is public; `commerceStatus` says
 * whether Agrinvest has confirmed it. A published `pilot` product is shown in full with its
 * current price and the "to confirm" marker (decision 0006).
 */
export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: { ro: 'Produs', en: 'Product' }, plural: { ro: 'Produse', en: 'Products' } },
  admin: {
    group: shopGroup,
    useAsTitle: 'name',
    defaultColumns: ['name', 'productType', 'commerceStatus', 'primaryCategory', 'brand', 'gaps'],
    listSearchableFields: ['name', 'slug', 'variants.sku'],
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    afterChange: [
      recordPrices,
      ({ doc }) => {
        revalidate(tags.products)
        return doc
      },
    ],
    afterDelete: [() => revalidate(tags.products)],
  },
  fields: [
    {
      name: 'commerceStatus',
      type: 'select',
      required: true,
      defaultValue: 'pilot',
      label: { ro: 'Stare comercială', en: 'Commerce status' },
      options: [
        { label: { ro: 'Pilot (neconfirmat)', en: 'Pilot (not confirmed)' }, value: 'pilot' },
        { label: { ro: 'Activ (confirmat)', en: 'Live (confirmed)' }, value: 'live' },
      ],
      admin: { position: 'sidebar' },
      validate: (value: unknown, { data }: { data: unknown }) => {
        if (value !== 'live') return true
        const blockers = liveBlockers(data as Partial<Product>)
        return blockers.length ? blockers.join(' ') : true
      },
    },
    {
      name: 'gaps',
      type: 'select',
      hasMany: true,
      virtual: true,
      label: { ro: 'De completat', en: 'To complete' },
      options: [...gapOptions],
      access: { read: isStaffField, create: () => false, update: () => false },
      admin: { position: 'sidebar', readOnly: true },
      hooks: { afterRead: [({ data }) => productGaps(data as Partial<Product>)] },
    },
    {
      name: 'legacySlugs',
      type: 'text',
      hasMany: true,
      label: { ro: 'Adrese vechi', en: 'Old slugs' },
      admin: { position: 'sidebar', description: 'Slugs on agrinvestshop.ro, for the redirects.' },
      access: { read: isStaffField },
    },
    slug('name'),
    enrichmentLedger,
    {
      type: 'tabs',
      tabs: [
        {
          label: { ro: 'Produs', en: 'Product' },
          fields: [
            { name: 'name', type: 'text', localized: true, required: true },
            {
              name: 'productType',
              type: 'select',
              required: true,
              label: { ro: 'Tip de produs', en: 'Product type' },
              options: [
                {
                  label: { ro: 'Protecția plantelor', en: 'Crop protection' },
                  value: 'protection',
                },
                { label: { ro: 'Semințe', en: 'Seeds' }, value: 'seed' },
                { label: { ro: 'Îngrășăminte', en: 'Fertilisers' }, value: 'fertiliser' },
                { label: { ro: 'Altele', en: 'Other' }, value: 'other' },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'primaryCategory',
                  type: 'relationship',
                  relationTo: 'categories',
                  index: true,
                  label: { ro: 'Categorie principală', en: 'Primary category' },
                  filterOptions: { role: { equals: 'category' } },
                  admin: { description: 'Sets the product URL.' },
                },
                {
                  name: 'secondaryCategories',
                  type: 'relationship',
                  relationTo: 'categories',
                  hasMany: true,
                  label: { ro: 'Categorii secundare', en: 'Secondary categories' },
                  filterOptions: { role: { in: ['category', 'theme'] } },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'brand',
                  type: 'relationship',
                  relationTo: 'brands',
                  index: true,
                  label: { ro: 'Producător', en: 'Brand' },
                },
                {
                  name: 'crops',
                  type: 'relationship',
                  relationTo: 'crops',
                  hasMany: true,
                  label: { ro: 'Culturi', en: 'Crops' },
                },
                {
                  name: 'targets',
                  type: 'relationship',
                  relationTo: 'targets',
                  hasMany: true,
                  label: { ro: 'Ținte', en: 'Targets' },
                },
              ],
            },
            {
              name: 'summary',
              type: 'textarea',
              localized: true,
              label: { ro: 'Rezumat', en: 'Summary' },
              admin: { description: 'The direct answer shown at the top of the page.' },
            },
            {
              name: 'description',
              type: 'richText',
              localized: true,
              label: { ro: 'Descriere', en: 'Description' },
            },
          ],
        },
        { label: { ro: 'Ambalaje și prețuri', en: 'Packs and prices' }, fields: [variants] },
        {
          label: { ro: 'Date tehnice', en: 'Technical data' },
          fields: [protection, seed, fertiliser],
        },
        {
          label: { ro: 'Media și documente', en: 'Media and documents' },
          fields: [
            {
              name: 'gallery',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: { ro: 'Fotografii', en: 'Photos' },
            },
            {
              name: 'documents',
              type: 'upload',
              relationTo: 'documents',
              hasMany: true,
              label: { ro: 'Documente', en: 'Documents' },
            },
          ],
        },
        {
          label: { ro: 'Conținut și SEO', en: 'Content and SEO' },
          fields: [
            faq,
            {
              name: 'related',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
              label: { ro: 'Produse asociate', en: 'Related products' },
              filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
            },
            seo,
          ],
        },
        {
          label: { ro: 'Verificare', en: 'Verification' },
          fields: [
            {
              name: 'verification',
              type: 'group',
              label: false,
              fields: [
                verified('price', { ro: 'Preț și stoc', en: 'Price and stock' }),
                verified('technical', { ro: 'Date tehnice', en: 'Technical data' }),
                verified('doses', { ro: 'Doze', en: 'Doses' }),
              ],
            },
            {
              name: 'sourceNotes',
              type: 'textarea',
              label: { ro: 'Note despre surse', en: 'Source notes' },
              access: { read: isStaffField },
              admin: { description: 'Internal. Never shown on the site.' },
            },
          ],
        },
      ],
    },
  ],
}
