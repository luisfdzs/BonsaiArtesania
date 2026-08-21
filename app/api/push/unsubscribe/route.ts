import { z } from 'zod'
import { adminSession } from '@/lib/admin'
import { removeSubscription } from '@/lib/push'

const schema = z.object({ endpoint: z.url().max(1000) })

export async function POST(request: Request): Promise<Response> {
  const session = await adminSession()
  if (!session) return new Response(null, { status: 404 })

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 })

  await removeSubscription(parsed.data.endpoint)

  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
