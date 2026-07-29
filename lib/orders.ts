import { getDb } from '@/lib/db'

/**
 * Número de pedido legible: BA-2026-0001. Es lo que se le dice al cliente por
 * teléfono, así que tiene que ser corto y sin ambigüedad.
 *
 * El contador vive en su propia colección y se incrementa con `findOneAndUpdate`,
 * que en Mongo es atómico sobre un documento. Contar los pedidos existentes y
 * sumarle uno parecería más simple, pero dos compras en el mismo instante leerían
 * el mismo total y generarían el mismo número —y `number` es índice único, así que
 * una de las dos compras fallaría—.
 *
 * La serie se reinicia cada año: el año va en el número y el contador es por año.
 */
export async function nextOrderNumber(now = new Date()): Promise<string> {
  const year = now.getFullYear()
  const db = await getDb()

  const result = await db
    .collection<{ _id: string; seq: number }>('counters')
    .findOneAndUpdate(
      { _id: `orders-${year}` },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' },
    )

  const seq = result?.seq ?? 1
  return `BA-${year}-${String(seq).padStart(4, '0')}`
}
