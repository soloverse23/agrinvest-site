import { marketSeries } from '@/lib/markets/load'
import { isMarketKey, markets } from '@/lib/markets/registry'

/**
 * One market's whole history for the chart island (`MarketChart`): `{ points: [[day, value]] }`,
 * the day in UTC milliseconds, oldest first. Read-only public data, cached by the CDN for an
 * hour (the fetch jobs run at most daily). The pages never wait on it: they render their own
 * numbers, a static line and a table on the server.
 */
export async function GET(_request: Request, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params
  if (!isMarketKey(key)) return Response.json({ error: 'Unknown market' }, { status: 404 })
  const points = await marketSeries(key)
  const m = markets[key]
  return Response.json(
    { key, currency: m.currency, unit: m.unit, decimals: m.decimals, points },
    {
      headers: {
        'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  )
}
