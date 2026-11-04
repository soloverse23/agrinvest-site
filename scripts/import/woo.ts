/**
 * Writes the planned products (`woo-plan.ts`) into Payload as `pilot`. Idempotent: products,
 * brands, ingredients and photos are upserted by slug or filename. Runs as part of
 * `npm run seed`. It overwrites product fields, so it is for development and first loads.
 */
import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Payload } from 'payload'

import { slugify } from '../../src/lib/slugify'
import { rt } from '../seed/richtext'
import { planProducts, type PlannedProduct } from './woo-plan'

const context = { skipChildren: true }
const photosDir = resolve('data/raw/media/products')

async function upsertBySlug(
  payload: Payload,
  collection: 'brands' | 'active-ingredients',
  data: { name: string; slug: string },
) {
  const { docs } = await payload.find({
    collection,
    where: { slug: { equals: data.slug } },
    locale: 'ro',
    limit: 1,
    depth: 0,
    draft: true,
  })
  if (docs[0]) return docs[0].id
  const doc = await payload.create({
    collection,
    locale: 'ro',
    data: { ...data, _status: 'published' } as never,
    context,
  })
  if (collection === 'active-ingredients')
    await payload.update({
      collection,
      id: doc.id,
      locale: 'en',
      data: { ...data, _status: 'published' } as never,
      context,
    })
  return doc.id
}

/** Product photos from the old shop. Local database only, and rights stay pending. */
async function photoOf(payload: Payload, product: PlannedProduct) {
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(process.env.DATABASE_URL ?? '')
  if (!local || !existsSync(photosDir)) return []
  const ids: number[] = []
  const files = readdirSync(photosDir)
  for (const { slug } of product.legacy) {
    const filename = files.find((f) => f.replace(/\.\w+$/, '') === `${slug}-1`)
    if (!filename) continue
    const found = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
    })
    const data = { alt: product.name.ro, rights: 'pending' as const, credit: 'agrinvestshop.ro' }
    const doc =
      found.docs[0] ??
      (await payload.create({
        collection: 'media',
        data,
        filePath: resolve(photosDir, filename),
        locale: 'ro',
      }))
    await payload.update({
      collection: 'media',
      id: doc.id,
      data: { alt: product.name.en },
      locale: 'en',
    })
    ids.push(doc.id)
  }
  return ids
}

export async function importProducts(payload: Payload) {
  const plan = planProducts()
  const find = async (collection: 'crops' | 'categories', field: string) => {
    const { docs } = await payload.find({
      collection,
      locale: 'ro',
      depth: 0,
      pagination: false,
      draft: true,
    })
    return new Map(docs.map((d) => [(d as unknown as Record<string, string>)[field], d.id]))
  }
  const crops = await find('crops', 'key')
  const categories = await find('categories', 'slug')
  const cropIds = (keys: string[]) => keys.flatMap((k) => crops.get(k) ?? [])

  for (const p of plan) {
    const ingredients = []
    for (const i of p.ingredients) {
      const id = await upsertBySlug(payload, 'active-ingredients', {
        name: i.name,
        slug: slugify(i.name),
      })
      ingredients.push({ ingredient: id, concentration: i.concentration, unit: i.unit })
    }
    const brand = p.brand
      ? await upsertBySlug(payload, 'brands', { name: p.brand, slug: slugify(p.brand) })
      : null
    const ro = {
      name: p.name.ro,
      slug: p.slug,
      legacySlugs: p.legacy.map((l) => l.slug),
      productType: p.productType,
      commerceStatus: 'pilot',
      primaryCategory: categories.get(p.category),
      secondaryCategories: p.secondary.flatMap((c) => categories.get(c) ?? []),
      brand,
      crops: cropIds(p.crops),
      summary: p.summary ?? null,
      description: p.description ? rt(p.description) : null,
      gallery: await photoOf(payload, p),
      variants: p.variants,
      protection:
        p.productType === 'protection'
          ? {
              activeIngredients: ingredients,
              formulation: p.formulation,
              doses: p.doses.map((d) => ({ ...d, crops: cropIds(d.crops) })),
            }
          : undefined,
      fertiliser:
        p.productType === 'fertiliser'
          ? {
              rates: p.doses.map((d) => ({
                cropText: d.cropText,
                crops: cropIds(d.crops),
                timing: d.timing,
                rateText: d.doseText,
                rateMin: d.doseMin,
                rateMax: d.doseMax,
                rateUnit: d.doseUnit,
              })),
            }
          : undefined,
      seed: p.productType === 'seed' ? { species: p.species?.ro, variety: p.variety } : undefined,
      verification: {
        price: { status: 'to-confirm', source: p.source },
        technical: { status: 'to-confirm', source: p.source },
        doses: { status: 'to-confirm', source: p.source },
      },
      sourceNotes: p.issues.join('\n') || null,
      _status: p.status,
    }
    const { docs } = await payload.find({
      collection: 'products',
      where: { slug: { equals: p.slug } },
      limit: 1,
      depth: 0,
      draft: true,
    })
    const draft = p.status === 'draft'
    const doc = docs[0]
      ? await payload.update({
          collection: 'products',
          id: docs[0].id,
          locale: 'ro',
          data: ro as never,
          context,
          draft,
        })
      : await payload.create({
          collection: 'products',
          locale: 'ro',
          data: ro as never,
          context,
          draft,
        })
    // Text not yet translated stays empty in English, so pages never show Romanian there.
    await payload.update({
      collection: 'products',
      id: doc.id,
      locale: 'en',
      data: {
        name: p.name.en,
        seed: p.species ? { species: p.species.en } : undefined,
        _status: p.status,
      } as never,
      context,
      draft,
    })
  }
  const merged = plan.reduce((n, p) => n + p.legacy.length, 0)
  console.log(`products: ${plan.length} from ${merged} old records, all pilot`)
}
