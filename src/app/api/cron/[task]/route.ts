import { timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'
import type { TypedJobs } from 'payload'

import { payloadClient } from '@/lib/content/payload'
import { jobTaskSlugs } from '@/lib/jobs/tasks'

/**
 * Runs one background task (`src/lib/jobs/tasks.ts`) through Payload's job queue. Vercel
 * Cron calls it with GET and `Authorization: Bearer $CRON_SECRET` on the schedules in
 * `vercel.json`. Without `CRON_SECRET` the route refuses every call, so it cannot be
 * triggered on a deployment that was never given a secret.
 */
export const maxDuration = 60

function authorised(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const given = Buffer.from(request.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${secret}`)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

type TaskSlug = keyof TypedJobs['tasks']

export async function GET(request: NextRequest, ctx: { params: Promise<{ task: string }> }) {
  if (!authorised(request)) return Response.json({ error: 'Unauthorised' }, { status: 401 })
  const { task } = await ctx.params
  if (!(jobTaskSlugs as string[]).includes(task))
    return Response.json({ error: 'Unknown task' }, { status: 404 })

  const payload = await payloadClient()
  const job = await payload.jobs.queue({ task: task as TaskSlug, input: {} })
  await payload.jobs.runByID({ id: job.id, silent: { info: true } })

  // A completed job is deleted (`deleteJobOnComplete`); one still there failed, with its error.
  const left = await payload.find({
    collection: 'payload-jobs',
    where: { id: { equals: job.id } },
    depth: 0,
    limit: 1,
  })
  if (left.docs[0]) return Response.json({ task, ok: false, job: job.id }, { status: 500 })
  return Response.json({ task, ok: true })
}
