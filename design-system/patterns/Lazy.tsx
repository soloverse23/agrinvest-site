'use client'

import dynamic from 'next/dynamic'

/**
 * Client patterns in their own chunks. Pages render them on the server as usual, but only
 * pages that contain one download its code, which keeps the shared bundle in budget.
 */
export const BaseMapLazy = dynamic(() => import('./BaseMap').then((m) => m.BaseMap))
export const VideoEmbedLazy = dynamic(() => import('./VideoEmbed').then((m) => m.VideoEmbed))
export const LeadFormLazy = dynamic(() => import('./LeadForm').then((m) => m.LeadForm))
