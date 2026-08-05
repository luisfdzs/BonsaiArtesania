'use server'

import { ObjectId } from 'mongodb'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/auth'
import { isAdmin } from '@/lib/admin'
import { sendCancelledOrderEmail } from '@/lib/email'
import { locales } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { notifyCancelledOrder } from '@/lib/notify'
import { orders } from '@/lib/schema'

/**
 * Cancelar un pedido, lo único que el cliente puede cambiar de uno.
 *
 * Los tres cierres son del servidor, y ninguno se puede sustituir por esconder el
 * botón —una acción de servidor es un endpoint público—:
 *
 * 1. **El userId sale de la sesión, nunca del formulario.** Del formulario llega
 *    sólo el número de pedido, y va en el filtro junto al userId: adivinar el
 *    número de un pedido ajeno no sirve de nada porque la consulta no lo
 *    encuentra.
 * 2. **El estado también va en el filtro.** No se lee el pedido, se comprueba en
 *    memoria y se escribe después: eso deja una rendija entre la lectura y la
 *    escritura por la que dos peticiones a la vez —o una lanzada a mano justo
 *    cuando Ana lo mete en el taller— podrían cancelar algo ya empezado. Con el
 *    estado en el filtro, Mongo sólo cambia el documento si sigue estando en
 *    «Pedido»; si no, no toca nada y aquí no hay nada que revalidar.
 * 3. **La cuenta del taller no pasa.** Ana gestiona los pedidos de todo el mundo
 *    desde `/gestion` y no tiene pedidos propios; ver `lib/admin.ts`.
 *
 * De «Pedido» a «Cancelado» y a ningún otro sitio. Ver `canCustomerCancel`.
 */
export async function cancelOrder(formData: FormData): Promise<void> {
  const session = await getSession()
  if (!session?.user?.id) throw new Error('No hay sesión')
  if (await isAdmin()) throw new Error('No autorizado')

  const number = String(formData.get('number') ?? '')
  if (!number) return

  const now = new Date()
  const collection = await orders()

  const order = await collection.findOneAndUpdate(
    { number, userId: new ObjectId(session.user.id), status: 'pendiente_pago' },
    {
      $set: { status: 'cancelado', updatedAt: now },
      // Quién lo canceló queda en el historial, que es lo que se mira para
      // responder «¿qué pasó con mi pedido?». En castellano y no traducido: la
      // nota la lee Ana en el panel, igual que las que escribe ella.
      $push: {
        history: { status: 'cancelado', at: now, note: 'Cancelado por el cliente desde la web' },
      },
    },
    { returnDocument: 'after' },
  )

  if (!order) return

  for (const locale of locales) {
    revalidatePath(path(locale, '/cuenta/pedidos'))
    revalidatePath(path(locale, `/cuenta/pedidos/${number}`))
    revalidatePath(path(locale, '/gestion'))
    revalidatePath(path(locale, `/gestion/pedidos/${number}`))
  }

  // Los dos avisos, en paralelo y sin esperar a que salgan bien: la cancelación
  // ya está guardada y ninguno de los dos puede deshacerla. Ninguno lanza.
  await Promise.all([notifyCancelledOrder(order), sendCancelledOrderEmail(order)])
}
