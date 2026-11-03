'use client'

import dynamic from 'next/dynamic'

import type { LeadFormProps } from './LeadForm'

/**
 * LeadForm in its own chunk. Pages render it on the server as usual, but only pages that
 * contain a form download its code; the rest of the site never ships it.
 */
const LeadForm = dynamic(() => import('./LeadForm').then((m) => m.LeadForm))

export function LeadFormLazy(props: LeadFormProps) {
  return <LeadForm {...props} />
}
