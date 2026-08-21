import { adminSession } from '@/lib/admin'
import { path } from '@/lib/i18n/routes'
import { sendPush } from '@/lib/push'

export async function POST(): Promise<Response> {
  const session = await adminSession()
  if (!session) return new Response(null, { status: 404 })

  const sent = await sendPush(
    {
      title: 'Prueba de aviso',
      body: 'Si lees esto en el móvil, los avisos de pedido llegarán igual.',
      url: path('es', '/gestion'),
      tag: 'bonsai-prueba',
    },
    'de prueba',
  )

  return Response.json({ ok: sent > 0, sent }, { headers: { 'Cache-Control': 'no-store' } })
}
