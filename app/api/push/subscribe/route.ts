import { z } from 'zod'
import { adminSession } from '@/lib/admin'
import { saveSubscription } from '@/lib/push'

const schema = z.object({
  endpoint: z.url().max(1000),
  keys: z.object({
    p256dh: z.string().min(1).max(400),
    auth: z.string().min(1).max(400),
  }),
})

export async function POST(request: Request): Promise<Response> {
  const session = await adminSession()
  const email = session?.user?.email
  if (!email) return new Response(null, { status: 404 })

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 })

  await saveSubscription(email, parsed.data, request.headers.get('user-agent'))

  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
