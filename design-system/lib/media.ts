/**
 * Screens held upright (phones, tablets in portrait) get the 9:16 cut of hero footage; the
 * others get 16:9. Posters and loops use the same queries, so the swap does not jump.
 */
export const TALL = '(max-aspect-ratio: 4/5)'
export const WIDE = '(min-aspect-ratio: 4/5)'

/** The point of a photo to keep in view when it is cropped, in % of its width and height. */
export type Focus = { x: number; y: number }

/**
 * A Media document's focal point (set in the admin), or undefined for the centre, so cropped
 * photos keep their subject on narrow screens.
 */
export function focusOf(
  media: { focalX?: number | null; focalY?: number | null } | null | undefined,
): Focus | undefined {
  const x = media?.focalX ?? 50
  const y = media?.focalY ?? 50
  return x === 50 && y === 50 ? undefined : { x, y }
}
