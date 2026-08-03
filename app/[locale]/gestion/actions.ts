'use server'

import { revalidatePath } from 'next/cache'
import { adminSession } from '@/lib/admin'
import { ORDER_STATUS_FLOW } from '@/lib/order-status'
import { orders, type OrderStatus } from '@/lib/schema'

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
  const note = String(formData.get('note') ?? '').trim()

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

  revalidatePath('/gestion')
  revalidatePath(`/gestion/pedidos/${number}`)
  revalidatePath('/cuenta/pedidos')
}
