import { absoluteUrl, SITE_INDEXABLE, SITE_URL } from '@/lib/site'

/**
 * Tells Bing/Yandex (IndexNow) that URLs changed. Only once the site is indexable and a key
 * is set; the key is served at `/indexnow.txt`. Failures are logged, never thrown.
 */
export async function pingIndexNow(paths: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY
  if (!SITE_INDEXABLE || !key || !paths.length) return
  try {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key,
        keyLocation: absoluteUrl('/indexnow.txt'),
        urlList: paths.map(absoluteUrl),
      }),
    })
  } catch (error) {
    console.error('IndexNow ping failed', error)
  }
}
