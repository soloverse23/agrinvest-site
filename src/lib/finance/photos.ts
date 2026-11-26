import type { Locale } from '@/i18n/config'
import type { NeedId } from './needs'

/**
 * The finance hub's photos (2026-11-26): free-licence photographs (CC0 or public domain)
 * found through Openverse, not Agrinvest's own farms or people. The files are in
 * `public/media/finance`, cropped to 3:2. `source` is where each one was found, to check its
 * licence again.
 */
type FinancePhoto = { src: string; credit: string; source: string }

const file = (name: string) => `/media/finance/${name}.webp`

export const financeHeroPhoto: FinancePhoto & { alt: Record<Locale, string> } = {
  src: file('hero'),
  alt: {
    ro: 'Combină care descarcă grâul în remorca unui tractor',
    en: 'A combine unloading wheat into a tractor trailer',
  },
  credit: 'rawpixel (CC0)',
  source: 'https://www.rawpixel.com/image/6112940/photo-image-public-domain-plant-nature',
}

export const needPhotos: Record<NeedId, FinancePhoto> = {
  season: {
    src: file('season'),
    credit: 'USDA (public domain)',
    source: 'https://www.flickr.com/photos/41284017@N08/54674568923',
  },
  machinery: {
    src: file('machinery'),
    credit: 'rawpixel (CC0)',
    source: 'https://www.rawpixel.com/image/6113328/photo-image-public-domain-nature-free',
  },
  irrigation: {
    src: file('irrigation'),
    credit: 'Alabama Extension (CC0)',
    source: 'https://www.flickr.com/photos/184594136@N08/51487520948',
  },
  storage: {
    src: file('storage'),
    credit: 'rawpixel (CC0)',
    source: 'https://www.rawpixel.com/image/6050543/free-public-domain-cc0-photo',
  },
  land: {
    src: file('land'),
    credit: 'Michał Bielejewski (StockSnap, CC0)',
    source: 'https://stocksnap.io/photo/wheat-grass-A9RQ3TJO31',
  },
  apia: {
    src: file('apia'),
    credit: 'Designecologist (StockSnap, CC0)',
    source: 'https://stocksnap.io/photo/sunflower-field-WLBC00ACIK',
  },
  grain: {
    src: file('grain'),
    credit: 'rawpixel (CC0)',
    source: 'https://www.rawpixel.com/image/5918393/image-public-domain-food-free',
  },
  debts: {
    src: file('debts'),
    credit: 'rawpixel (CC0)',
    source: 'https://www.rawpixel.com/image/5926299/photo-image-public-domain-hand-person',
  },
}
