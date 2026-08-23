'use server'

import { randomUUID } from 'node:crypto'
import { ObjectId } from 'mongodb'
import { revalidatePath } from 'next/cache'
import { locales } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'

/**
 * El carrito y la pantalla de confirmar, en los dos idiomas: las dos existen en
 * `/es` y en `/gl`, y quien añade una pieza puede cambiar de idioma justo después.
 * Revalidar la versión que no se está mirando no cuesta nada; olvidarla deja un
 * carrito viejo esperando al otro lado del selector.
 */
function revalidateCarrito(): void {
  for (const locale of locales) {
    revalidatePath(path(locale, '/carrito'))
    revalidatePath(path(locale, '/comprar'))
  }
}
import { cookies } from 'next/headers'
import { auth } from '@/auth'
import { piezaPorSlug } from '@/lib/catalogo'
import { isAdmin } from '@/lib/admin'
import { GUEST_COOKIE } from '@/lib/cart'
import { carts } from '@/lib/schema'
import { shopOpen } from '@/lib/shop'

/**
 * Acciones del carrito. Funcionan con y sin cuenta: si no hay sesión se crea un
 * identificador de invitado en una cookie y el carrito se guarda igual, para que
 * nadie tenga que registrarse antes de poder mirar lo que lleva.
 *
 * Lo que llega del navegador es únicamente `slug` y `qty`. Ninguna cifra: las del
 * catálogo se leen en el servidor, y nada que venga del cliente las toca.
 *
 * Las tres empiezan descartando a la cuenta del taller: ahí no hay carrito que
 * tocar (ver `lib/admin.ts`). La comprobación va aquí y no sólo en la pantalla
 * porque una acción de servidor es un endpoint público al que se puede llamar
 * directamente, y porque las fichas de la tienda se sirven estáticas: el botón de
 * «añadir» es el mismo HTML para todo el mundo y no puede saber quién mira.
 */

const MAX_QTY = 20

/** Filtro del carrito de esta petición, creando la cookie de invitado si toca. */
async function ownerFilter(): Promise<{ userId: ObjectId } | { guestId: string }> {
  const session = await auth()
  if (session?.user?.id) return { userId: new ObjectId(session.user.id) }

  const jar = await cookies()
  const existing = jar.get(GUEST_COOKIE)?.value
  if (existing) return { guestId: existing }

  const guestId = randomUUID()
  jar.set(GUEST_COOKIE, guestId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return { guestId }
}

export async function addToCart(formData: FormData): Promise<void> {
  // Con la tienda cerrada no se llena el carrito. La comprobación va aquí y no
  // sólo en la ficha: esconder el botón no protege nada, porque una acción de
  // servidor es un endpoint al que se puede llamar directamente.
  if (!shopOpen) return
  if (await isAdmin()) return

  const slug = String(formData.get('slug') ?? '')
  const product = await piezaPorSlug(slug)

  // Una pieza a medida se organiza hablando, así que no entra al carrito. El botón
  // ya lleva a WhatsApp, esto es la comprobación real.
  if (!product || product.price === null) return

  const filter = await ownerFilter()
  const collection = await carts()
  const now = new Date()

  // Dos escrituras en vez de una: `$addToSet`/`$inc` no pueden crear el documento
  // y actualizar un elemento del array a la vez. El upsert asegura que exista.
  await collection.updateOne(
    filter,
    { $setOnInsert: { ...filter, items: [] }, $set: { updatedAt: now } },
    { upsert: true },
  )

  const added = await collection.updateOne(
    { ...filter, 'items.slug': { $ne: slug } },
    { $push: { items: { slug, qty: 1, addedAt: now } }, $set: { updatedAt: now } },
  )

  // Ya estaba: se sube una unidad, con techo para que no crezca sin límite.
  if (added.modifiedCount === 0) {
    await collection.updateOne(
      { ...filter, 'items.slug': slug, 'items.qty': { $lt: MAX_QTY } },
      { $inc: { 'items.$.qty': 1 }, $set: { updatedAt: now } },
    )
  }

  revalidateCarrito()
  revalidatePath(`/tienda/${slug}`)
}

export async function setQty(formData: FormData): Promise<void> {
  if (await isAdmin()) return

  const slug = String(formData.get('slug') ?? '')
  const qty = Number(formData.get('qty'))

  if (!Number.isInteger(qty) || qty < 0 || qty > MAX_QTY) return

  const filter = await ownerFilter()
  const collection = await carts()

  if (qty === 0) {
    await collection.updateOne(filter, {
      $pull: { items: { slug } },
      $set: { updatedAt: new Date() },
    })
  } else {
    await collection.updateOne(
      { ...filter, 'items.slug': slug },
      { $set: { 'items.$.qty': qty, updatedAt: new Date() } },
    )
  }

  revalidateCarrito()
}

export async function removeFromCart(formData: FormData): Promise<void> {
  if (await isAdmin()) return

  const slug = String(formData.get('slug') ?? '')
  const filter = await ownerFilter()

  const collection = await carts()
  await collection.updateOne(filter, {
    $pull: { items: { slug } },
    $set: { updatedAt: new Date() },
  })

  revalidateCarrito()
}
