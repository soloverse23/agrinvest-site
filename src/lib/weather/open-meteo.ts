/**
 * Open-Meteo forecast client. The free API (`api.open-meteo.com`) is for non-commercial use
 * only, so production needs a paid key: set `OPEN_METEO_API_KEY` and, with it,
 * `OPEN_METEO_BASE_URL=https://customer-api.open-meteo.com` (decision 0008). Data is
 * CC BY 4.0; pages credit "Weather data by Open-Meteo.com".
 *
 * Forecasts are not stored. Each fetch is cached for an hour, and coordinates are rounded to
 * 0.1° (about 10 km) so nearby visitors share the cache and no exact location is kept.
 */

export const hourlyVars = [
  'temperature_2m',
  'relative_humidity_2m',
  'precipitation',
  'wind_speed_10m',
  'soil_temperature_0cm',
  'soil_moisture_0_to_1cm',
  'et0_fao_evapotranspiration',
] as const

export const dailyVars = [
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'et0_fao_evapotranspiration',
] as const

export type HourlyPoint = { time: string } & Record<(typeof hourlyVars)[number], number | null>
export type DailyPoint = { date: string } & Record<(typeof dailyVars)[number], number | null>
export type Forecast = {
  latitude: number
  longitude: number
  timezone: string
  hourly: HourlyPoint[]
  daily: DailyPoint[]
}

export const weatherAttribution = {
  text: 'Weather data by Open-Meteo.com',
  url: 'https://open-meteo.com/',
  licence: 'CC BY 4.0',
}

export const roundCoord = (value: number) => Math.round(value * 10) / 10

export function weatherConfig(env: Record<string, string | undefined> = process.env) {
  const key = env.OPEN_METEO_API_KEY?.trim() || undefined
  const base = (
    env.OPEN_METEO_BASE_URL?.trim() ||
    (key ? 'https://customer-api.open-meteo.com' : 'https://api.open-meteo.com')
  ).replace(/\/+$/, '')
  /** True only with a paid key: the free tier may not serve a commercial site. */
  return { base, key, commercial: Boolean(key) }
}

export function forecastUrl(lat: number, lon: number, days = 14, config = weatherConfig()): string {
  const params = new URLSearchParams({
    latitude: roundCoord(lat).toFixed(1),
    longitude: roundCoord(lon).toFixed(1),
    hourly: hourlyVars.join(','),
    daily: dailyVars.join(','),
    timezone: 'Europe/Bucharest',
    forecast_days: String(Math.min(16, Math.max(1, days))),
  })
  if (config.key) params.set('apikey', config.key)
  return `${config.base}/v1/forecast?${params}`
}

type Raw = {
  latitude: number
  longitude: number
  timezone: string
  hourly?: Record<string, (number | null)[] | string[]>
  daily?: Record<string, (number | null)[] | string[]>
}

const columns = <K extends string>(
  block: Raw['hourly'],
  vars: readonly K[],
  timeKey: 'time' | 'date',
) => {
  const time = (block?.time ?? []) as string[]
  return time.map((t, i) => {
    const point: Record<string, unknown> = { [timeKey]: t }
    for (const v of vars) {
      const value = (block?.[v] as (number | null)[] | undefined)?.[i]
      point[v] = typeof value === 'number' ? value : null
    }
    return point
  })
}

/** The API's column arrays turned into one object per hour and per day. */
export function parseForecast(raw: unknown): Forecast {
  const r = raw as Raw
  if (typeof r?.latitude !== 'number' || !Array.isArray(r.hourly?.time))
    throw new Error('Open-Meteo: unexpected response')
  return {
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
    hourly: columns(r.hourly, hourlyVars, 'time') as HourlyPoint[],
    daily: columns(r.daily, dailyVars, 'date') as DailyPoint[],
  }
}

/** The forecast for a point, or null when the service fails (the page then hides weather). */
export async function fetchForecast(lat: number, lon: number, days = 14): Promise<Forecast | null> {
  try {
    const res = await fetch(forecastUrl(lat, lon, days), {
      next: { revalidate: 3600, tags: ['weather'] },
    })
    if (!res.ok) return null
    return parseForecast(await res.json())
  } catch {
    return null
  }
}
