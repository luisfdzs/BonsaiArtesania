'use server'

import { ObjectId } from 'mongodb'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { isAdminEmail } from '@/lib/admin'
import { readCart } from '@/lib/cart'
import { sendOrderEmails } from '@/lib/email'
import { checkFormGuard } from '@/lib/form-guard'
import { notifyNewOrder } from '@/lib/notify'
import { nextOrderNumber } from '@/lib/orders'
import { clientIp, consumeAll, describeWait, POLICIES } from '@/lib/rate-limit'
import { addresses, carts, orders, type CartItem, type OrderDoc } from '@/lib/schema'
import { shopOpen } from '@/lib/shop'

export type CheckoutState = {
  error?: string
}

/** Ventana en la que un segundo envío se considera el mismo, no otro pedido. */
const DUPLICADO_MS = 10 * 60 * 1000

/**
 * ¿Acaba de pedir esta persona? Devuelve el número, para llevarla a la
 * confirmación de ese pedido en vez de darle un error que no entendería.
 */
async function pedidoReciente(userId: ObjectId): Promise<string | null> {
  const collection = await orders()
  const last = await collection.findOne(
    { userId, createdAt: { $gte: new Date(Date.now() - DUPLICADO_MS) } },
    { sort: { createdAt: -1 }, projection: { number: 1 } },
  )
  return last?.number ?? null
}

/**
 * Se queda con el contenido del carrito **y lo vacía en la misma operación**.
 *
 * Es el cerrojo que impide el pedido doble. Antes, vaciar el carrito era el último
 * paso: dos envíos simultáneos —un doble clic, o dos pestañas— leían los dos el
 * mismo carrito lleno y creaban dos pedidos con dos correos cada uno. Aquí la
 * condición «items no vacío» y el vaciado van en un solo `findOneAndUpdate`, que en
 * Mongo es atómico sobre el documento: el primero se lleva las líneas, el segundo
 * recibe `null` y sabe que llega tarde.
 *
 * Devuelve las líneas que había *antes* de vaciar, que son las del pedido.
 */
async function tomarCarrito(userId: ObjectId): Promise<CartItem[] | null> {
  const collection = await carts()
  const before = await collection.findOneAndUpdate(
    { userId, items: { $not: { $size: 0 } } },
    { $set: { items: [], updatedAt: new Date() } },
    { returnDocument: 'before' },
  )
  return before?.items ?? null
}

/** Devuelve las líneas al carrito cuando el pedido no llega a crearse. */
async function devolverCarrito(userId: ObjectId, items: CartItem[]): Promise<void> {
  const collection = await carts()
  await collection.updateOne({ userId }, { $set: { items, updatedAt: new Date() } })
}

/**
 * Registra el pedido.
 *
 * ⚠️ NO COBRA NADA. Esto no es una venta cerrada: crea el pedido y avisa a Ana
 * para que sea ella quien se ponga con él y hable con quien lo ha pedido. La
 * interfaz se lo dice al cliente en esos términos —un encargo recibido— y no
 * habla de ningún pago.
 *
 * Para que la base de datos tampoco lo dé por pagado, el pedido se guarda con
 * `payment.provider: 'simulado'`, `payment.status: 'pendiente'` y estado
 * `pendiente_pago`. Así, cuando se conecte Stripe, una consulta distingue sin
 * ambigüedad los pedidos de esta etapa de los cobrados de verdad.
 *
 * No cambiar esos tres valores sin sustituir de verdad el cobro: son lo único que
 * impide que un pedido no pagado parezca pagado.
 *
 * ## Por qué hay tanta comprobación antes de llegar a crear nada
 *
 * Cada pedido dispara **dos correos desde el buzón de IONOS y un aviso a Telegram**.
 * Sin freno, eso es a la vez una forma de sepultar a Ana y una forma de quemar la
 * cuota de envío del buzón hasta que IONOS lo bloquee — y con él dejaría de salir
 * también el enlace de acceso, o sea que nadie podría ni entrar. Las capas, en el
 * orden en que actúan:
 *
 * 1. **Hace falta cuenta**, y la cuenta se consigue pulsando un enlace enviado a un
 *    correo real. Es el filtro más fuerte y ya estaba.
 * 2. **Campo trampa y testigo con la hora** (`lib/form-guard.ts`): descartan al bot
 *    tonto antes de gastar cuota de nadie.
 * 3. **Cubo ancho por usuario y por IP**: acota los envíos, salgan bien o mal.
 * 4. **Cubo estrecho, sólo al crear el pedido**: es el que de verdad acota cuántos
 *    correos pueden salir, porque sólo se gasta cuando hay pedido de verdad.
 * 5. **Cerrojo atómico del carrito**: un doble clic no puede hacer dos pedidos.
 *
 * El orden importa: lo barato, y lo que no consume cuota de nadie, va primero.
 */
export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  // Primera comprobación de todas: con la tienda cerrada no se registra ningún
  // pedido. Va en la acción y no sólo en la página porque una acción de servidor
  // es un endpoint público: ocultar el formulario no la cierra.
  if (!shopOpen) {
    return { error: 'La tienda no está abierta todavía. Escríbeme y lo vemos por mensaje.' }
  }

  const session = await auth()
  if (!session?.user?.id) return { error: 'Tienes que entrar para poder enviar el pedido.' }

  // La cuenta del taller gestiona pedidos, no los hace (ver `lib/admin.ts`). No
  // debería poder llegar hasta aquí —ni tiene carrito ni ve la pantalla—, pero
  // esto es lo que lo cierra de verdad: crear un pedido reserva unidades de piezas
  // únicas y dispara dos correos y un aviso a Telegram.
  if (isAdminEmail(session.user.email)) {
    return { error: 'Esta es la cuenta del taller: gestiona los pedidos, no hace ninguno.' }
  }

  const userId = new ObjectId(session.user.id)

  const guard = checkFormGuard(formData)
  if (!guard.ok) {
    // Al bot se le contesta lo mismo que a la pestaña caducada, y a propósito: un
    // mensaje que dijera «has caído en el campo trampa» sería un manual para
    // esquivarla. Recargar arregla el caso legítimo y no ayuda nada al otro.
    return { error: 'Este formulario ha caducado. Recarga la página y vuelve a enviarlo.' }
  }

  const ip = await clientIp()

  const intento = await consumeAll([
    { bucket: 'pedido:intento', key: session.user.id, policy: POLICIES.orderAttempt },
    { bucket: 'pedido:intento:ip', key: ip, policy: POLICIES.orderAttemptIp },
  ])
  if (!intento.ok) {
    return {
      error: `Has enviado el formulario muchas veces seguidas. Prueba dentro de ${describeWait(intento.retryAfterMs)}.`,
    }
  }

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

  if (cart.lines.length === 0) {
    // Un carrito vacío justo después de pedir es casi siempre un «atrás» o un
    // recargar, no un error: se le lleva a la confirmación de lo que ya envió.
    const reciente = await pedidoReciente(userId)
    if (reciente) redirect(`/comprar/enviado?pedido=${reciente}`)
    return { error: 'Tu carrito está vacío.' }
  }

  // Aquí se cierra el cerrojo: a partir de este punto el carrito está vacío y estas
  // líneas son nuestras. Cualquier salida por error tiene que devolverlas.
  const tomadas = await tomarCarrito(userId)
  if (!tomadas) {
    const reciente = await pedidoReciente(userId)
    if (reciente) redirect(`/comprar/enviado?pedido=${reciente}`)
    return { error: 'Tu carrito está vacío.' }
  }

  const items = cart.lines.map((line) => ({
    slug: line.slug,
    name: line.name,
    unitPriceCents: line.unitPriceCents,
    qty: line.qty,
  }))

  // Paranoia barata: entre leer el carrito y cerrar el cerrojo pudo colarse un
  // «añadir al carrito» desde otra pestaña. Lo que se comprueba es que **todo lo
  // que va a ir al pedido estaba de verdad en lo tomado**, no que las dos listas
  // sean idénticas: `readCart` descarta en silencio los slugs que ya no están en el
  // catálogo, así que exigir el mismo número de líneas dejaría un carrito con una
  // pieza retirada atascado para siempre, sin forma de pedir.
  const mismasLineas = items.every((item) =>
    tomadas.some((tomada) => tomada.slug === item.slug && tomada.qty === item.qty),
  )
  if (!mismasLineas) {
    await devolverCarrito(userId, tomadas)
    return { error: 'Tu carrito ha cambiado mientras enviabas. Revísalo y vuelve a intentarlo.' }
  }

  // El cubo estrecho: se gasta ya, con el carrito tomado y a un paso de crear el
  // pedido. No antes, para que los intentos fallidos de arriba no lo consuman.
  const creado = await consumeAll([
    { bucket: 'pedido:creado', key: session.user.id, policy: POLICIES.orderCreated },
    { bucket: 'pedido:creado:dia', key: session.user.id, policy: POLICIES.orderCreatedDay },
    { bucket: 'pedido:creado:ip', key: ip, policy: POLICIES.orderCreatedIp },
    { bucket: 'pedido:global', key: 'todos', policy: POLICIES.orderGlobal },
  ])
  if (!creado.ok) {
    await devolverCarrito(userId, tomadas)
    return {
      error: `Has hecho varios pedidos muy seguidos. Tu carrito sigue guardado: inténtalo dentro de ${describeWait(creado.retryAfterMs)}, o escríbele directamente a Ana.`,
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
    history: [{ status: 'pendiente_pago', at: now, note: 'Pedido recibido desde la web' }],
    createdAt: now,
    updatedAt: now,
  }

  await orderCollection.insertOne(order)

  // Después de guardar y a prueba de fallos: el pedido ya está registrado, así que
  // ni un SMTP caído ni un Telegram que no responda pueden deshacerlo. Los dos
  // avisos van a la vez porque son
  // independientes: el correo es el registro, la notificación es la prisa.
  await Promise.allSettled([
    session.user.email ? sendOrderEmails(order, session.user.email) : Promise.resolve(),
    notifyNewOrder(order),
  ])

  revalidatePath('/carrito')
  revalidatePath('/cuenta/pedidos')
  revalidatePath('/taller')

  // Redirección, y no un estado devuelto: la confirmación es una página propia, así
  // que sobrevive a recargar y se puede volver a ella. Ojo, `redirect` funciona
  // lanzando, así que tiene que ser lo último y quedar fuera de cualquier `try`.
  redirect(`/comprar/enviado?pedido=${number}`)
}
