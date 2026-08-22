import { z } from 'zod'
import { getSession } from '@/auth'
import { saveSubscription } from '@/lib/push'

const schema = z.object({
  endpoint: z.url().max(1000),
  keys: z.object({
    p256dh: z.string().min(1).max(400),
    auth: z.string().min(1).max(400),
  }),
})

/**
 * Da de alta este dispositivo para los avisos de quien está dentro.
 *
 * Vale para cualquier cuenta y no sólo para el taller, que es como estaba. Los
 * avisos son de los dos lados: al taller le suena un pedido nuevo o una
 * cancelación, y al cliente le suena que su pedido ha cambiado de estado. Quién
 * recibe qué no se decide aquí sino al mandar, y siempre por correo: ver
 * `sendPush`.
 *
 * La suscripción se guarda con el correo de la sesión, así que un dispositivo
 * prestado no hereda los avisos de nadie: al entrar otra persona, su suscripción
 * pasa a su nombre —la clave es el `endpoint`, ver `saveSubscription`—.
 */
export async function POST(request: Request): Promise<Response> {
  const session = await getSession()
  const email = session?.user?.email
  if (!email) return new Response(null, { status: 404 })

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 })

  await saveSubscription(email, parsed.data, request.headers.get('user-agent'))

  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
