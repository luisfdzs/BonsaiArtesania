'use server'

import { revalidatePath } from 'next/cache'
import { adminSession } from '@/lib/admin'
import { orders, type OrderStatus } from '@/lib/schema'

/**
 * Acciones del panel. Todas empiezan comprobando que quien las llama es
 * administrador: una acción de servidor es un endpoint público, así que esconder
 * el botón no protege nada.
 */

const VALID_STATUS: OrderStatus[] = [
  'pendiente_pago',
  'pagado',
  'preparando',
  'enviado',
  'entregado',
  'cancelado',
]

export async function updateOrderStatus(formData: FormData): Promise<void> {
  if (!(await adminSession())) throw new Error('No autorizado')

  const number = String(formData.get('number') ?? '')
  const status = String(formData.get('status') ?? '') as OrderStatus
  const note = String(formData.get('note') ?? '').trim()

  if (!VALID_STATUS.includes(status)) return

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

  revalidatePath('/taller')
  revalidatePath(`/taller/pedidos/${number}`)
  revalidatePath('/cuenta/pedidos')
}
