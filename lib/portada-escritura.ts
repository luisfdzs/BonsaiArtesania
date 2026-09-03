import { randomUUID } from 'node:crypto'
import { del } from '@vercel/blob'
import { revalidateTag } from 'next/cache'
import { ETIQUETA_PORTADA } from '@/lib/portada'
import { portadaReels, type ReelDoc } from '@/lib/schema'

/**
 * TODO LO QUE EL PANEL LE HACE A LA PORTADA
 *
 * El mismo reparto que en el catálogo: las escrituras juntas en un fichero, y
 * cada una invalidando la caché de lectura al acabar. Ver
 * `lib/catalogo-escritura.ts`, que explica por qué eso vive en un solo sitio.
 *
 * **Los bytes del vídeo no pasan por aquí.** Un mp4 de diez megas no cabe en una
 * acción de servidor, así que el navegador lo sube directamente al almacén y lo
 * que llega hasta aquí es la dirección que le ha quedado. Quien firma esa subida
 * es `app/api/gestion/reel/route.ts`, que es también quien comprueba el tamaño y
 * el tipo; aquí se da por hecho que la dirección es de nuestro almacén, y por eso
 * `anadirReel` la comprueba antes de guardarla.
 *
 * Nada de esto comprueba quién llama: eso es cosa de las acciones del panel.
 */

function refrescarPortada() {
  revalidateTag(ETIQUETA_PORTADA, 'max')
}

const ahora = () => new Date()

/**
 * Que la dirección sea de nuestro almacén y no de cualquier sitio.
 *
 * Estas funciones las llaman acciones de servidor, y una acción de servidor es un
 * endpoint: aunque el panel sólo mande direcciones recién subidas, quien llame a
 * mano podría mandar la de otro dominio y quedaría pintada como fondo de la
 * portada. El mismo dominio que declara `next.config.ts` para las fotos.
 */
function esDelAlmacen(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url)
    return protocol === 'https:' && hostname.endsWith('.public.blob.vercel-storage.com')
  } catch {
    return false
  }
}

/** Añade un vídeo al final de la lista. */
export async function anadirReel(datos: {
  src: string
  poster: string | null
  nombre: string
}): Promise<void> {
  if (!esDelAlmacen(datos.src)) throw new Error('Esa dirección no es del almacén de fotos.')
  if (datos.poster && !esDelAlmacen(datos.poster)) {
    throw new Error('Esa dirección no es del almacén de fotos.')
  }

  const coleccion = await portadaReels()
  const ultimo = await coleccion.find({}).sort({ order: -1 }).limit(1).next()

  await coleccion.insertOne({
    id: randomUUID(),
    src: datos.src,
    poster: datos.poster,
    nombre: datos.nombre.slice(0, 120),
    order: (ultimo?.order ?? -1) + 1,
    createdAt: ahora(),
    updatedAt: ahora(),
    // El `_id` lo pone Mongo. Mismo apaño que en `crearFamilia`: el tipo del
    // documento lo lleva porque al leerlo siempre está.
  } as ReelDoc)

  refrescarPortada()
}

/** El orden en que se encadenan, tal y como lo dejó Ana arrastrando. */
export async function ordenarReels(ids: string[]): Promise<void> {
  const coleccion = await portadaReels()

  await coleccion.bulkWrite(
    ids.map((id, orden) => ({
      updateOne: { filter: { id }, update: { $set: { order: orden, updatedAt: ahora() } } },
    })),
  )

  refrescarPortada()
}

/**
 * Quita un vídeo de la portada, y **borra también el fichero del almacén**.
 *
 * Al revés que las fotos del catálogo, que se quedan guardadas para poder
 * reencuadrarlas más adelante: de un vídeo no hay nada que rehacer, y lo que
 * queda si no se borra es un mp4 de diez megas pagando sitio para siempre sin
 * que nadie sepa ya de dónde salió.
 *
 * Si el borrado del fichero falla, el vídeo **igual sale de la portada**: lo que
 * Ana ha pedido es que deje de verse, y dejar el documento porque el almacén no
 * contesta sería desobedecer lo único que importa. Queda un huérfano, y eso es
 * más barato que un vídeo que sigue publicado.
 */
export async function quitarReel(id: string): Promise<void> {
  const coleccion = await portadaReels()
  const doc = await coleccion.findOne({ id })
  if (!doc) throw new Error('Ese vídeo ya no está en la portada.')

  await coleccion.deleteOne({ id })
  refrescarPortada()

  const ficheros = [doc.src, doc.poster].filter((url): url is string => Boolean(url))
  await del(ficheros).catch(() => {})
}
