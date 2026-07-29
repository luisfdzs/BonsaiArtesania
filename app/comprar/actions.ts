'use server'

import { ObjectId } from 'mongodb'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { readCart } from '@/lib/cart'
import { nextOrderNumber } from '@/lib/orders'
import { addresses, carts, orders, type OrderDoc } from '@/lib/schema'
import { reserveStock } from '@/lib/stock'
import { sendOrderEmails } from '@/lib/email'

export type CheckoutState = {
  ok?: boolean
  /** Número del pedido creado, para mostrarlo en el aviso de confirmación. */
  number?: string
  /** Resumen de a dónde va, para el mismo aviso. */
  shippingTo?: string
  error?: string
}

/**
 * Cierra el pedido.
 *
 * ⚠️ EL COBRO ESTÁ SIMULADO. Todavía no hay pasarela: esta acción crea el pedido
 * y la interfaz avisa al cliente de que el pago se ha recibido, pero no se cobra
 * nada. Para que la base de datos no mienta, el pedido se guarda con
 * `payment.provider: 'simulado'`, `payment.status: 'pendiente'` y estado
 * `pendiente_pago`. Así, cuando se conecte Stripe, una consulta distingue sin
 * ambigüedad los pedidos de prueba de los cobrados de verdad.
 *
 * No cambiar esos tres valores sin sustituir de verdad el cobro: son lo único que
 * impide que un pedido no pagado parezca pagado.
 */
export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Tienes que entrar para poder comprar.' }

  const userId = new ObjectId(session.user.id)

  const rawAddressId = String(formData.get('addressId') ?? '')
  if (!ObjectId.isValid(rawAddressId)) {
    return { error: 'Elige una dirección de envío.' }
  }

  // La dirección se busca con el userId en el filtro: nadie puede enviar un pedido
  // a la dirección de otra persona pasando su id.
  const addressCollection = await addresses()
  const address = await addressCollection.findOne({
    _id: new ObjectId(rawAddressId),
    userId,
  })
  if (!address) return { error: 'Elige una dirección de envío.' }

  // El carrito y los precios se releen aquí, en el servidor. Nada de importes
  // venidos del formulario: es el único punto donde se decide cuánto cuesta.
  const cart = await readCart()
  if (cart.lines.length === 0) return { error: 'Tu carrito está vacío.' }

  const items = cart.lines.map((line) => ({
    slug: line.slug,
    name: line.name,
    unitPriceCents: line.unitPriceCents,
    qty: line.qty,
  }))

  // Se descuentan las unidades ANTES de crear el pedido. La comprobación es
  // atómica en Mongo, así que dos clientes que pulsen «pagar» a la vez no pueden
  // llevarse los dos la misma pieza única: al segundo le falla aquí.
  const reserved = await reserveStock(items)
  if (!reserved.ok) {
    const names = reserved.unavailable
      .map((slug) => cart.lines.find((line) => line.slug === slug)?.name ?? slug)
      .join(', ')
    return {
      error: `Se acaba de agotar: ${names}. Quítalo del carrito para poder seguir.`,
    }
  }

  const now = new Date()
  const number = await nextOrderNumber(now)

  const orderCollection = await orders()
  const order: OrderDoc = {
    _id: new ObjectId(),
    number,
    userId,
    status: 'pendiente_pago',
    items,
    shipping: {
      // Copia, no referencia: si el cliente edita o borra la dirección mañana,
      // el pedido debe seguir diciendo a dónde se envió.
      address: {
        alias: address.alias,
        recipient: address.recipient,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2 ?? null,
        postalCode: address.postalCode,
        city: address.city,
        province: address.province,
        country: address.country,
      },
      costCents: cart.shippingCents,
    },
    totals: {
      subtotalCents: cart.subtotalCents,
      shippingCents: cart.shippingCents,
      totalCents: cart.totalCents,
    },
    payment: {
      provider: 'simulado',
      status: 'pendiente',
      intentId: null,
    },
    history: [{ status: 'pendiente_pago', at: now, note: 'Pedido creado con cobro simulado' }],
    createdAt: now,
    updatedAt: now,
  }

  await orderCollection.insertOne(order)

  // El carrito se vacía, no se borra: así el documento y su índice siguen ahí para
  // la siguiente compra.
  const cartCollection = await carts()
  await cartCollection.updateOne({ userId }, { $set: { items: [], updatedAt: now } })

  // Después de guardar y a prueba de fallos: el pedido ya está cerrado y las
  // unidades descontadas, así que un SMTP caído no puede deshacer la venta.
  if (session.user.email) await sendOrderEmails(order, session.user.email)

  revalidatePath('/carrito')
  revalidatePath('/cuenta/pedidos')
  revalidatePath('/taller')

  return {
    ok: true,
    number,
    shippingTo: `${address.line1}${address.line2 ? `, ${address.line2}` : ''}, ${address.postalCode} ${address.city}`,
  }
}
