/**
 * Fixture data for CI's end-to-end tests only: `npm run seed:ci`, after `npm run seed`. Never
 * part of a deploy (`prepare-database.sh` does not run it), because it publishes sample prices.
 *
 * The seed leaves out what Agrinvest has not confirmed: buy prices, the diesel price, and the county of each base
 * (S4). Several pages are built on exactly that data (the header ticker and its diesel price, the home
 * price rail and live panel, the county map), so their tests need rows to look at. Idempotent: nothing is
 * written once any buy price exists or the base already has a county.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })

const day = (ago: number) => new Date(Date.now() - ago * 86_400_000).toISOString().slice(0, 10)

const existing = await payload.count({ collection: 'buy-prices' })
if (existing.totalDocs === 0) {
  const crops = await payload.find({
    collection: 'crops',
    where: { isGrain: { equals: true } },
    depth: 0,
    pagination: false,
  })
  let created = 0
  for (const crop of crops.docs.slice(0, 3))
    for (const [ago, price] of [
      [3, 1000],
      [1, 1020],
    ] as const) {
      await payload.create({
        collection: 'buy-prices',
        data: {
          crop: crop.id,
          price: price + created,
          basis: 'la-baza',
          validFrom: day(ago),
          source: 'manual',
          status: 'published',
        },
        context: { skipAlerts: true },
      })
      created++
    }
  console.log(`ci fixtures: ${created} buy prices`)
} else console.log('ci fixtures: buy prices already there')

const diesel = await payload.count({ collection: 'diesel-prices' })
if (diesel.totalDocs === 0) {
  await payload.create({
    collection: 'diesel-prices',
    data: { price: 6.5, vat: 'fara-tva', validFrom: day(1), status: 'published' },
  })
  console.log('ci fixtures: 1 diesel price')
} else console.log('ci fixtures: diesel price already there')

const county = (
  await payload.find({
    collection: 'counties',
    where: { code: { equals: 'BZ' } },
    depth: 0,
    limit: 1,
  })
).docs[0]
const base = (
  await payload.find({
    collection: 'bases',
    where: { slug: { equals: 'pogoanele' } },
    depth: 0,
    limit: 1,
  })
).docs[0]
if (county && base && !base.county) {
  await payload.update({ collection: 'bases', id: base.id, data: { county: county.id } })
  console.log('ci fixtures: Pogoanele linked to Buzău')
} else console.log('ci fixtures: base county already set (or missing)')
process.exit(0)
