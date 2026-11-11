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
