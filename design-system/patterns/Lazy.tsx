'use client'

import dynamic from 'next/dynamic'

/**
 * Client patterns in their own chunks. Pages render them on the server as usual, but only
 * pages that contain one download its code, which keeps the shared bundle in budget.
 */
export const VideoEmbedLazy = dynamic(() => import('./VideoEmbed').then((m) => m.VideoEmbed))
export const LeadFormLazy = dynamic(() => import('./LeadForm').then((m) => m.LeadForm))
export const SubscribeFormLazy = dynamic(() =>
  import('./SubscribeForm').then((m) => m.SubscribeForm),
)
/** The home hero slider's island: only a page with a slider downloads it. */
export const HeroCarouselLazy = dynamic(() => import('./HeroCarousel').then((m) => m.HeroCarousel))
/** The home live panel's tab timer: only the home page downloads it. */
export const LiveRotatorLazy = dynamic(() => import('./LiveRotator').then((m) => m.LiveRotator))
/** The one-field quick request (decision 0010): only pages that offer it download it. */
export const QuickRequestLazy = dynamic(() => import('./QuickRequest').then((m) => m.QuickRequest))
/** A card's quick add to cart. */
export const QuickAddLazy = dynamic(() => import('./QuickAdd').then((m) => m.QuickAdd))
/** The shop landing's search with suggestions. */
export const ShopSearchLazy = dynamic(() => import('./ShopSearch').then((m) => m.ShopSearch))
/** The phone filter drawer's Escape and focus trap: only listings download it. */
export const DrawerKeysLazy = dynamic(() => import('./DrawerKeys').then((m) => m.DrawerKeys))
/** The product page's buy box form (packs, quantity, phone bar). */
export const BuyFormLazy = dynamic(() => import('./BuyForm').then((m) => m.BuyForm))
/** The product page's dose calculator. */
export const DoseCalculatorLazy = dynamic(() =>
  import('./DoseCalculator').then((m) => m.DoseCalculator),
)
/** The home guides carousel's arrows: only the home page downloads them. */
export const CarouselNavLazy = dynamic(() => import('./CarouselNav').then((m) => m.CarouselNav))
