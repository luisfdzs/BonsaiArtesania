'use server'

import { revalidatePath } from 'next/cache'
import { adminSession } from '@/lib/admin'
import { locales } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { notifyOrderStatus } from '@/lib/notify'
import { NOTE_MAX_LENGTH, ORDER_STATUS_FLOW } from '@/lib/order-status'
import { orders, users, type OrderStatus } from '@/lib/schema'

/**
 * Acciones del panel. Todas empiezan comprobando que quien las llama es
 * administrador: una acción de servidor es un endpoint público, así que esconder
 * el botón no protege nada.
 *
 * Son también las únicas de la web que un cliente no puede llamar nunca. Las del
 * carrito y las del pedido son lo contrario —cualquiera con cuenta las usa—, y
 * por eso ellas llevan la comprobación inversa: que quien llama **no** sea la
 * cuenta del taller. Ver `lib/admin.ts`.
 */

export async function updateOrderStatus(formData: FormData): Promise<void> {
  if (!(await adminSession())) throw new Error('No autorizado')

  const number = String(formData.get('number') ?? '')
  const status = String(formData.get('status') ?? '') as OrderStatus
  const note = String(formData.get('note') ?? '')
    .trim()
    .slice(0, NOTE_MAX_LENGTH)

  // La lista válida es la misma que pinta el desplegable, importada y no copiada:
  // si mañana se añade un estado, no puede quedarse fuera de la validación.
  if (!ORDER_STATUS_FLOW.includes(status)) return

  const collection = await orders()
  const order = await collection.findOne({ number })
  if (!order) return

  const now = new Date()
  await collection.updateOne(
    { number },
    {
      $set: { status, updatedAt: now },
      // El historial es lo que permite responder «¿qué pasó con mi pedido?».
      $push: { history: { status, at: now, note: note || undefined } },
    },
  )

  // Y le suena en el móvil a quien espera el pedido, si tiene la web instalada y
  // los avisos puestos. Después de guardar y nunca antes: el estado es lo que hay
  // que dejar a salvo, y un aviso que no sale no puede dejarlo a medias —de eso se
  // encarga `notifyOrderStatus`, que no lanza—.
  //
  // El correo se busca por la cuenta del pedido y no se saca de la dirección de
  // envío: la dirección puede ser de un regalo para otra persona, y el aviso es
  // para quien hizo el pedido.
  if (status !== order.status) {
    try {
      const cuenta = await (
        await users()
      ).findOne({ _id: order.userId }, { projection: { email: 1 } })
      if (cuenta?.email) await notifyOrderStatus(order, status, cuenta.email)
    } catch (error) {
      console.error(`[gestion] No se pudo avisar del estado del pedido ${number}:`, error)
    }
  }

  // En los dos idiomas: el panel lo puede tener Ana abierto en cualquiera de
  // ellos, y la lista del cliente existe en los dos.
  for (const locale of locales) {
    revalidatePath(path(locale, '/gestion'))
    revalidatePath(path(locale, `/gestion/pedidos/${number}`))
    revalidatePath(path(locale, '/cuenta/pedidos'))
  }
}
