export function GET() {
  const key = process.env.INDEXNOW_KEY
  return key ? new Response(key) : new Response('Not found', { status: 404 })
}
