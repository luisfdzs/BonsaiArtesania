import { getDb } from '@/lib/db'

/**
 * Existencias.
 *
 * El catálogo vive en `content/products.ts` y lo edita Ana a mano; las unidades
 * disponibles, en cambio, cambian con cada venta, así que van en la base. La clave
 * es el `slug`, de modo que las dos fuentes se mantienen unidas sin duplicar el
 * catálogo en Mongo.
 *
 * **Una pieza que no tiene documento se considera disponible con 1 unidad.** Es
 * el caso normal: las piezas son únicas e irrepetibles («la flor que ves en la
 * foto es exactamente la que recibes»), así que 1 es el valor correcto por
 * defecto y Ana sólo tiene que tocar las que repite.
 */

export type StockDoc = {
  _id: string
  available: number
  updatedAt: Date
}

async function collection() {
  return (await getDb()).collection<StockDoc>('stock')
}

/**
 * Crea los documentos que falten con 1 unidad. Hace falta antes de reservar:
 * el `$inc` condicional no puede descontar de un documento que no existe.
 */
async function ensureStock(slugs: string[]): Promise<void> {
  if (slugs.length === 0) return
  const stock = await collection()

  await stock.bulkWrite(
    slugs.map((slug) => ({
      updateOne: {
        filter: { _id: slug },
        // `$setOnInsert` y no `$set`: si el documento ya existe no se toca su
        // cantidad, que es justo lo que no queremos pisar.
        update: { $setOnInsert: { available: 1, updatedAt: new Date() } },
        upsert: true,
      },
    })),
    { ordered: false },
  )
}

export async function availabilityFor(slugs: string[]): Promise<Map<string, number>> {
  if (slugs.length === 0) return new Map()

  const stock = await collection()
  const docs = await stock.find({ _id: { $in: slugs } }).toArray()
  const map = new Map(docs.map((doc) => [doc._id, doc.available]))

  // Los que no tienen documento todavía: 1 unidad, como explica la cabecera.
  for (const slug of slugs) if (!map.has(slug)) map.set(slug, 1)
  return map
}

export type ReserveResult = { ok: true } | { ok: false; unavailable: string[] }

/**
 * Descuenta unidades al cerrar un pedido.
 *
 * El descuento se hace con `$inc` bajo la condición `available >= qty`, que Mongo
 * evalúa y aplica de forma atómica sobre el documento. Es lo que impide que dos
 * clientes que pulsan «pagar» en el mismo segundo compren la misma pieza única:
 * uno de los dos `updateOne` no encuentra documento que cumpla la condición.
 *
 * Si una línea falla, se devuelven las ya descontadas. No se usa una transacción
 * a propósito: la compensación es explícita, se lee en diez líneas y no depende de
 * que el cluster admita transacciones —el tier gratuito las soporta, pero preferir
 * lo simple aquí evita un modo de fallo difícil de reproducir—.
 */
export async function reserveStock(items: { slug: string; qty: number }[]): Promise<ReserveResult> {
  await ensureStock(items.map((item) => item.slug))

  const stock = await collection()
  const taken: { slug: string; qty: number }[] = []

  for (const item of items) {
    const result = await stock.updateOne(
      { _id: item.slug, available: { $gte: item.qty } },
      { $inc: { available: -item.qty }, $set: { updatedAt: new Date() } },
    )

    if (result.modifiedCount === 1) {
      taken.push(item)
    } else {
      // Deshacer lo ya descontado antes de rendirse: si no, una pieza quedaría
      // retenida por un pedido que nunca existió.
      await releaseStock(taken)
      return { ok: false, unavailable: [item.slug] }
    }
  }

  return { ok: true }
}

/** Devuelve unidades: pedido cancelado, o compensación de una reserva a medias. */
export async function releaseStock(items: { slug: string; qty: number }[]): Promise<void> {
  if (items.length === 0) return
  const stock = await collection()

  await stock.bulkWrite(
    items.map((item) => ({
      updateOne: {
        filter: { _id: item.slug },
        update: { $inc: { available: item.qty }, $set: { updatedAt: new Date() } },
        upsert: true,
      },
    })),
    { ordered: false },
  )
}

/** Fija las unidades de una pieza. Lo usa Ana desde su panel. */
export async function setStock(slug: string, available: number): Promise<void> {
  const stock = await collection()
  await stock.updateOne(
    { _id: slug },
    { $set: { available, updatedAt: new Date() } },
    { upsert: true },
  )
}
