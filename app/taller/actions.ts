'use server'

import { revalidatePath } from 'next/cache'
import { adminSession } from '@/lib/admin'
import { getProduct } from '@/content/products'
import { ORDER_STATUS_FLOW } from '@/lib/order-status'
import { orders, type OrderStatus } from '@/lib/schema'
import { releaseStock, setStock } from '@/lib/stock'

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

  // Cancelar devuelve las unidades al stock; si no, una pieza quedaría retenida
  // para siempre por un pedido que no va a salir. Sólo la primera vez: cancelar
  // dos veces no debe sumar dos veces.
  if (status === 'cancelado' && order.status !== 'cancelado') {
    await releaseStock(order.items.map((item) => ({ slug: item.slug, qty: item.qty })))
  }

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

export async function updateStock(formData: FormData): Promise<void> {
  if (!(await adminSession())) throw new Error('No autorizado')

  const slug = String(formData.get('slug') ?? '')
  const available = Number(formData.get('available'))

  // El slug tiene que existir en el catálogo: así el panel no puede crear
  // existencias de piezas fantasma por una errata.
  if (!getProduct(slug)) return
  if (!Number.isInteger(available) || available < 0 || available > 999) return

  await setStock(slug, available)

  revalidatePath('/taller/stock')
  revalidatePath('/carrito')
}
