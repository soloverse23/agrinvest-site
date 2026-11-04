import { unstable_cache } from 'next/cache'

/**
 * Company data from ANAF's public VAT service. No key is needed. The version in the path
 * changes from time to time: `npm run check:anaf` runs on every deploy and warns when it does.
 * Any failure means the buyer types the company data by hand.
 */
export const ANAF_URL = 'https://webservicesp.anaf.ro/api/PlatitorTvaRest/v9/tva'

export type Company = { name: string; address: string; regCom: string }

type AnafResponse = {
  found?: { date_generale?: { denumire?: string; adresa?: string; nrRegCom?: string } }[]
}

/** The company, null when ANAF does not know it. Throws when the service cannot answer. */
export async function fetchCompany(
  cui: string,
  fetcher: typeof fetch = fetch,
  today = new Date(),
): Promise<Company | null> {
  const response = await fetcher(ANAF_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([{ cui: Number(cui), data: today.toISOString().slice(0, 10) }]),
    signal: AbortSignal.timeout(5000),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`ANAF answered ${response.status}`)
  const data = (await response.json()) as AnafResponse
  const general = data.found?.[0]?.date_generale
  if (!general?.denumire) return null
  return {
    name: general.denumire,
    address: general.adresa ?? '',
    regCom: general.nrRegCom ?? '',
  }
}

/** Cached for a day. A failure throws, so it is never cached. */
export const lookupCached = unstable_cache((cui: string) => fetchCompany(cui), ['anaf:company'], {
  revalidate: 86_400,
})
