import { revalidateTag } from 'next/cache'
import { ETIQUETA } from '@/lib/catalogo'
import { prepararFoto, reencuadrar, type Encuadre } from '@/lib/fotos'
import type { Localized } from '@/lib/i18n/config'
import {
  catalogProducts,
  families,
  type FamilyDoc,
  type PhotoDoc,
  type ProductDoc,
} from '@/lib/schema'

/**
 * TODO LO QUE EL PANEL LE HACE AL CATÁLOGO
 *
 * Un sitio único para las escrituras, por dos razones. La primera es la caché:
 * la tienda lee el catálogo cacheado bajo la etiqueta `catalogo` y **cada** cambio
 * tiene que invalidarla, o Ana guardaría algo y no lo vería. Teniendo todas las
 * escrituras aquí, `refrescarTienda()` se llama en un solo sitio y no hay forma
 * de olvidarse.
 *
 * La segunda es que las reglas del catálogo —qué se puede publicar, qué pasa con
 * las piezas de una familia que se quita— viven con las escrituras y no repartidas
 * por los formularios. Un formulario puede tener un fallo; la regla, no.
 *
 * Nada de esto comprueba quién llama: eso es cosa de las acciones del panel, que
 * pasan por `isAdmin()` antes de llegar aquí. Ver `app/[locale]/gestion`.
 */

function refrescarTienda() {
  // El segundo argumento es el perfil de caducidad que pide Next 16. `max`
  // porque el catálogo no caduca solo: cambia cuando Ana lo cambia, y entonces
  // pasa por aquí. Ver `lib/catalogo.ts`.
  revalidateTag(ETIQUETA, 'max')
}

const ahora = () => new Date()

/**
 * De un nombre a una dirección: «Pendientes Farolillo» → `pendientes-farolillo`.
 *
 * Quita los acentos en vez de dejarlos pasar. Una `ñ` o una `á` en la dirección
 * funcionan, pero se escapan al copiarlas (`%C3%B1`) y ese churro es lo que
 * acaba pegado en un WhatsApp.
 */
export function comoDireccion(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/** La misma dirección dos veces no puede ser. Añade un número al final. */
async function direccionLibre(base: string): Promise<string> {
  const coleccion = await catalogProducts()
  let intento = base || 'pieza'
  let numero = 2

  while (await coleccion.findOne({ slug: intento })) {
    intento = `${base}-${numero}`
    numero++
  }

  return intento
}

/* ---------------------------------------------------------------- piezas -- */

export type PiezaNueva = {
  familia: string
  nombre: Localized
  foto: { datos: Buffer; alt: Localized; encuadre?: Encuadre | null } | null
}

/**
 * Crea una pieza. Nace **en borrador**: acaba de salir de una foto soltada y le
 * faltan los textos, así que no debe aparecer en la tienda hasta que Ana diga.
 *
 * Se coloca la última de su familia, que es donde cae lo que se acaba de añadir.
 */
export async function crearPieza(datos: PiezaNueva): Promise<string> {
  const coleccion = await catalogProducts()
  const slug = await direccionLibre(comoDireccion(datos.nombre.es))

  const ultima = await coleccion.find({ family: datos.familia }).sort({ order: -1 }).limit(1).next()

  const vacio: Localized = { es: '', gl: '' }
  const doc: Omit<ProductDoc, '_id'> = {
    slug,
    family: datos.familia,
    order: (ultima?.order ?? -1) + 1,
    name: datos.nombre,
    summary: vacio,
    description: { es: [], gl: [] },
    materials: { es: [], gl: [] },
    // El precio no se pide en ningún sitio del panel: la web no lo enseña —ver
    // `ProductDoc`— y lo que se cobra se acuerda hablando. El campo sigue en la
    // base porque es lo que se congela en el pedido que se archiva.
    price: null,
    photos: datos.foto ? [await prepararFoto(datos.foto)] : [],
    featured: false,
    status: 'borrador',
    createdAt: ahora(),
    updatedAt: ahora(),
  }

  await coleccion.insertOne(doc as ProductDoc)
  refrescarTienda()
  return slug
}

export type CambiosDePieza = Partial<
  Pick<
    ProductDoc,
    'name' | 'summary' | 'description' | 'materials' | 'price' | 'family' | 'featured' | 'status'
  >
>

/**
 * Guarda los cambios de una pieza.
 *
 * Publicar tiene una condición y sólo una: que tenga foto. Una pieza sin foto en
 * la rejilla deja un hueco gris entre las demás, y eso es peor que no estar. El
 * resto —que le falte el galego, que no tenga materiales— no impide publicar:
 * la tienda sabe caer al castellano y una ficha corta se lee igual.
 */
export async function guardarPieza(slug: string, cambios: CambiosDePieza): Promise<void> {
  const coleccion = await catalogProducts()
  const pieza = await coleccion.findOne({ slug })
  if (!pieza) throw new Error('Esa pieza ya no está.')

  if (cambios.status === 'publicada' && pieza.photos.length === 0) {
    throw new Error('Antes de publicarla necesita al menos una foto.')
  }

  // Cambiar de familia es una mudanza: la pieza se coloca la última de su nueva
  // familia en vez de heredar un puesto que allí significa otra cosa.
  const mudanza =
    cambios.family && cambios.family !== pieza.family
      ? {
          order:
            ((await coleccion.find({ family: cambios.family }).sort({ order: -1 }).limit(1).next())
              ?.order ?? -1) + 1,
        }
      : {}

  await coleccion.updateOne({ slug }, { $set: { ...cambios, ...mudanza, updatedAt: ahora() } })
  refrescarTienda()
}

/**
 * Quita una pieza de la tienda.
 *
 * No la borra: la deja en borrador. Ana quiere «que esto no se vea», no «que esto
 * desaparezca para siempre», y son cosas distintas; además hay pedidos viejos que
 * enseñan la foto de la pieza que se compró.
 */
export async function retirarPieza(slug: string): Promise<void> {
  await (
    await catalogProducts()
  ).updateOne({ slug }, { $set: { status: 'borrador', updatedAt: ahora() } })
  refrescarTienda()
}

/**
 * Borra una pieza de verdad: se va del catálogo y del panel.
 *
 * Es lo que hay detrás del «Borrar» de la tarjeta, y por eso el panel lo pregunta
 * antes. Retirar y borrar son cosas distintas y las dos hacen falta: se retira lo
 * que quizá vuelva, se borra lo que nunca debió estar —una foto repetida, una
 * prueba—.
 *
 * Lo que **no** se lleva por delante: los pedidos viejos. De la pieza que alguien
 * compró, el pedido guarda su propia copia del nombre y del precio —ver
 * `OrderItem`—, así que sigue leyéndose entero; lo único que pierde es la foto,
 * que se pintará vacía. Ese es el precio de borrar, y por eso se pregunta.
 *
 * Las fotos se quedan en el almacén. Borrarlas aquí dejaría rotas las de los
 * pedidos que aún las enseñan, y ocupan poco.
 */
export async function eliminarPieza(slug: string): Promise<void> {
  await (await catalogProducts()).deleteOne({ slug })
  refrescarTienda()
}

/**
 * El orden de las piezas dentro de una familia, tal y como Ana las ha dejado
 * arrastrando. Llega la lista entera y se reescribe entera: es una sola escritura
 * en bloque y no hay estado intermedio en el que dos piezas compartan puesto.
 */
export async function ordenarPiezas(familia: string, slugs: string[]): Promise<void> {
  const coleccion = await catalogProducts()

  await coleccion.bulkWrite(
    slugs.map((slug, orden) => ({
      updateOne: { filter: { slug, family: familia }, update: { $set: { order: orden } } },
    })),
  )

  refrescarTienda()
}

/* ----------------------------------------------------------------- fotos -- */

/** Añade una foto a una pieza que ya existe. Se pone la última. */
export async function anadirFoto(
  slug: string,
  foto: { datos: Buffer; alt: Localized; encuadre?: Encuadre | null },
): Promise<void> {
  const guardada = await prepararFoto(foto)

  await (
    await catalogProducts()
  ).updateOne({ slug }, { $push: { photos: guardada }, $set: { updatedAt: ahora() } })

  refrescarTienda()
}

/**
 * Cambia el encuadre de una foto que ya está subida, a partir de su original.
 * La foto conserva su sitio en la lista: sólo cambia lo que se ve.
 */
export async function cambiarEncuadre(
  slug: string,
  fotoId: string,
  encuadre: Encuadre,
): Promise<void> {
  const coleccion = await catalogProducts()
  const pieza = await coleccion.findOne({ slug })
  if (!pieza) throw new Error('Esa pieza ya no está.')

  const foto = pieza.photos.find((una) => una.id === fotoId)
  if (!foto) throw new Error('Esa foto ya no está en la pieza.')

  const nueva = await reencuadrar(foto, encuadre)
  const photos = pieza.photos.map((una) => (una.id === fotoId ? nueva : una))

  await coleccion.updateOne({ slug }, { $set: { photos, updatedAt: ahora() } })
  refrescarTienda()
}

/**
 * Cambia una foto por otra distinta, en el mismo sitio de la lista.
 *
 * Es lo que pasa al soltar una foto encima de otra en la pantalla de la pieza, y
 * no es lo mismo que añadir y borrar: si la que se sustituye era la primera, la
 * nueva sigue siendo la primera, o sea la que sale en la rejilla y en la portada.
 * Haciéndolo en dos pasos, la portada se perdería por el camino.
 *
 * La foto vieja se queda en el almacén. Pesa poco y es la única forma de que un
 * pedido antiguo siga enseñando la foto que se compró.
 */
export async function sustituirFoto(
  slug: string,
  fotoId: string,
  foto: { datos: Buffer; alt: Localized; encuadre?: Encuadre | null },
): Promise<void> {
  const coleccion = await catalogProducts()
  const pieza = await coleccion.findOne({ slug })
  if (!pieza) throw new Error('Esa pieza ya no está.')

  const sitio = pieza.photos.findIndex((una) => una.id === fotoId)
  if (sitio === -1) throw new Error('Esa foto ya no está en la pieza.')

  const nueva = await prepararFoto(foto)
  const photos = [...pieza.photos]
  photos[sitio] = nueva

  await coleccion.updateOne({ slug }, { $set: { photos, updatedAt: ahora() } })
  refrescarTienda()
}

/** El orden de las fotos de una pieza. La primera es la de la rejilla. */
export async function ordenarFotos(slug: string, ids: string[]): Promise<void> {
  const coleccion = await catalogProducts()
  const pieza = await coleccion.findOne({ slug })
  if (!pieza) throw new Error('Esa pieza ya no está.')

  const porId = new Map(pieza.photos.map((foto) => [foto.id, foto]))
  const ordenadas = ids.flatMap((id) => {
    const foto = porId.get(id)
    return foto ? [foto] : []
  })

  // Lo que no venga en la lista se queda al final en vez de perderse.
  const restantes = pieza.photos.filter((foto) => !ids.includes(foto.id))

  await coleccion.updateOne(
    { slug },
    { $set: { photos: [...ordenadas, ...restantes], updatedAt: ahora() } },
  )
  refrescarTienda()
}

export async function quitarFoto(slug: string, fotoId: string): Promise<void> {
  const coleccion = await catalogProducts()
  const pieza = await coleccion.findOne({ slug })
  if (!pieza) throw new Error('Esa pieza ya no está.')

  const photos = pieza.photos.filter((foto) => foto.id !== fotoId)

  // Quedarse sin fotos y seguir publicada es justo el hueco gris que no
  // queremos, así que la pieza se retira sola.
  const status = photos.length === 0 ? ('borrador' as const) : pieza.status

  await coleccion.updateOne({ slug }, { $set: { photos, status, updatedAt: ahora() } })
  refrescarTienda()
}

/* -------------------------------------------------------------- familias -- */

export async function crearFamilia(nombre: Localized): Promise<string> {
  const coleccion = await families()
  const base = comoDireccion(nombre.es) || 'familia'

  let key = base
  let numero = 2
  while (await coleccion.findOne({ key })) {
    key = `${base}-${numero}`
    numero++
  }

  const ultima = await coleccion.find().sort({ order: -1 }).limit(1).next()
  const vacio: Localized = { es: '', gl: '' }

  await coleccion.insertOne({
    key,
    label: nombre,
    plural: { es: nombre.es.toLowerCase(), gl: nombre.gl.toLowerCase() },
    note: vacio,
    intro: vacio,
    order: (ultima?.order ?? -1) + 1,
    hidden: false,
    createdAt: ahora(),
    updatedAt: ahora(),
  } as FamilyDoc)

  refrescarTienda()
  return key
}

export type CambiosDeFamilia = Partial<
  Pick<FamilyDoc, 'label' | 'plural' | 'note' | 'intro' | 'hidden'>
>

export async function guardarFamilia(key: string, cambios: CambiosDeFamilia): Promise<void> {
  await (await families()).updateOne({ key }, { $set: { ...cambios, updatedAt: ahora() } })
  refrescarTienda()
}

export async function ordenarFamilias(keys: string[]): Promise<void> {
  const coleccion = await families()

  await coleccion.bulkWrite(
    keys.map((key, orden) => ({
      updateOne: { filter: { key }, update: { $set: { order: orden } } },
    })),
  )

  refrescarTienda()
}

/**
 * Quita una familia y decide qué pasa con lo que tenía dentro.
 *
 * Nunca se borra una pieza por quitar su familia: o se mudan a otra, o se quedan
 * en borrador esperando. Son las dos salidas que ofrece el panel, y no hay una
 * tercera silenciosa.
 */
export async function quitarFamilia(
  key: string,
  destino: { mover: string } | { aBorrador: true },
): Promise<void> {
  const piezas = await catalogProducts()

  if ('mover' in destino) {
    const otra = await (await families()).findOne({ key: destino.mover })
    if (!otra) throw new Error('La familia de destino ya no está.')

    const ultima = await piezas.find({ family: destino.mover }).sort({ order: -1 }).limit(1).next()
    let orden = (ultima?.order ?? -1) + 1

    for (const pieza of await piezas.find({ family: key }).sort({ order: 1 }).toArray()) {
      await piezas.updateOne(
        { slug: pieza.slug },
        { $set: { family: destino.mover, order: orden, updatedAt: ahora() } },
      )
      orden++
    }
  } else {
    await piezas.updateMany({ family: key }, { $set: { status: 'borrador', updatedAt: ahora() } })
  }

  await (await families()).deleteOne({ key })
  refrescarTienda()
}
