import { z } from 'zod'
import { getSession } from '@/auth'
import { removeSubscription } from '@/lib/push'

const schema = z.object({ endpoint: z.url().max(1000) })

/**
 * Da de baja este dispositivo. Como el alta, para cualquier cuenta.
 *
 * No se comprueba de quién era la suscripción: el `endpoint` lo da el navegador de
 * quien lo está pidiendo, y darse de baja de más no le hace daño a nadie —el peor
 * caso es que un aviso deje de sonar en un dispositivo y haya que volver a
 * activarlo—. Adivinar un `endpoint` ajeno, que son cadenas opacas de cientos de
 * caracteres, no es un camino que valga la pena cerrar con una consulta más.
 */
export async function POST(request: Request): Promise<Response> {
  const session = await getSession()
  if (!session?.user?.email) return new Response(null, { status: 404 })

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 })

  await removeSubscription(parsed.data.endpoint)

  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
