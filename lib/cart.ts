import { ObjectId } from 'mongodb'
import { cookies } from 'next/headers'
import { getSession } from '@/auth'
import { getProduct } from '@/content/products'
import { isAdmin } from '@/lib/admin'
import type { Image } from '@/lib/media'
import { carts, toCents, type CartDoc } from '@/lib/schema'
import { shippingCostCents } from '@/lib/shipping'

/**
 * Carrito. Vive en la base de datos, no en la cookie: así sobrevive al cambio de
 * dispositivo y, sobre todo, el precio con el que se cuenta nunca llega del
 * navegador. La cookie sólo guarda un identificador opaco de invitado.
 *
 * De la línea sólo se persiste `slug` y `qty`. El precio se lee del catálogo cada
 * vez que se pinta el carrito: si Ana corrige un precio, nadie se queda con un
 * importe viejo guardado. Congelarlo es cosa del pedido, no del carrito.
 *
 * **No hay existencias que consultar.** Ninguna pieza se agota: todas se hacen a
 * mano bajo pedido y Ana puede repetir cualquiera, así que una línea del carrito
 * siempre se puede encargar y no hay nada que reservar ni que descontar.
 */

export const GUEST_COOKIE = 'ba_carrito'

export type CartLine = {
  slug: string
  name: string
  qty: number
  unitPriceCents: number
  lineTotalCents: number
  image: Image | null
}

export type Cart = {
  lines: CartLine[]
  count: number
  subtotalCents: number
  shippingCents: number
  totalCents: number
}

const EMPTY: Cart = {
  lines: [],
  count: 0,
  subtotalCents: 0,
  shippingCents: 0,
  totalCents: 0,
}

/**
 * Quién es el dueño del carrito en esta petición. Sólo lectura: no crea la cookie
 * de invitado, porque un componente de servidor no puede escribirlas. La crea la
 * acción de «añadir al carrito», que es el primer momento en que hace falta.
 */
export async function cartOwner(): Promise<{ userId?: ObjectId; guestId?: string } | null> {
  const session = await getSession()
  if (session?.user?.id) return { userId: new ObjectId(session.user.id) }

  const guestId = (await cookies()).get(GUEST_COOKIE)?.value
  return guestId ? { guestId } : null
}

/**
 * Une el carrito de invitado con el del usuario que acaba de entrar. Se hace aquí
 * y no en un callback de Auth.js porque necesita la cookie de la petición, y este
 * es el punto por el que pasan todas las lecturas del carrito.
 *
 * Las cantidades no se suman: se queda la mayor. Sumar convertiría «lo tenía
 * abierto en el móvil y en el portátil» en dos piezas de lo que sólo se quería
 * una vez.
 */
async function mergeGuestCart(userId: ObjectId): Promise<void> {
  const guestId = (await cookies()).get(GUEST_COOKIE)?.value
  if (!guestId) return

  const collection = await carts()
  const guest = await collection.findOne({ guestId })
  if (!guest || guest.items.length === 0) {
    if (guest) await collection.deleteOne({ _id: guest._id })
    return
  }

  const own = await collection.findOne({ userId })
  const merged = new Map(own?.items.map((item) => [item.slug, item]) ?? [])

  for (const item of guest.items) {
    const existing = merged.get(item.slug)
    merged.set(item.slug, existing ? { ...existing, qty: Math.max(existing.qty, item.qty) } : item)
  }

  await collection.updateOne(
    { userId },
    { $set: { items: [...merged.values()], updatedAt: new Date() }, $setOnInsert: { userId } },
    { upsert: true },
  )
  await collection.deleteOne({ _id: guest._id })
}

/** Documento del carrito de esta petición, ya fusionado si hacía falta. */
export async function cartDoc(): Promise<CartDoc | null> {
  const session = await getSession()

  if (session?.user?.id) {
    const userId = new ObjectId(session.user.id)
    await mergeGuestCart(userId)
    return (await carts()).findOne({ userId })
  }

  const guestId = (await cookies()).get(GUEST_COOKIE)?.value
  if (!guestId) return null
  return (await carts()).findOne({ guestId })
}

/**
 * Carrito listo para pintar: líneas con nombre y precio del catálogo y totales.
 *
 * Una línea cuyo `slug` ya no existe en el catálogo —pieza retirada— se descarta
 * en silencio. Es preferible a romper la página del carrito por un slug muerto.
 */
export async function readCart(): Promise<Cart> {
  const doc = await cartDoc()
  if (!doc || doc.items.length === 0) return EMPTY

  const lines = doc.items.flatMap((item) => {
    const product = getProduct(item.slug)
    // `price === null` son las piezas a medida: no tienen importe que cobrar y no
    // deberían haber entrado al carrito. Si alguna se colara, se ignora.
    if (!product || product.price === null) return []

    const unitPriceCents = toCents(product.price)
    return [
      {
        slug: item.slug,
        name: product.name,
        qty: item.qty,
        unitPriceCents,
        lineTotalCents: unitPriceCents * item.qty,
        image: product.image,
      },
    ]
  })

  const subtotalCents = lines.reduce((total, line) => total + line.lineTotalCents, 0)
  const shippingCents = shippingCostCents(subtotalCents)

  return {
    lines,
    count: lines.reduce((total, line) => total + line.qty, 0),
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
  }
}

/**
 * Sólo el número de piezas, para el indicador de la cabecera.
 *
 * Para la cuenta del taller siempre cero, y no por ahorrar una consulta: la barra
 * de móvil se sirve igual para todo el mundo —el layout es estático a propósito,
 * ver el comentario de `app/api/carrito/count/route.ts`—, así que el icono del
 * carrito le sale también a Ana. Al menos que no le salga con un globo encima
 * anunciando piezas que no puede comprar; si lo pulsa, `/carrito` la devuelve al
 * taller. Ver `lib/admin.ts`.
 */
export async function cartCount(): Promise<number> {
  if (await isAdmin()) return 0

  const doc = await cartDoc()
  return doc?.items.reduce((total, item) => total + item.qty, 0) ?? 0
}
