import { unstable_cache } from 'next/cache'
import type { Localized } from '@/lib/i18n/config'
import type { Image } from '@/lib/media'
import { catalogProducts, families, type PhotoDoc, type ProductStatus } from '@/lib/schema'

/**
 * EL CATÁLOGO, LEÍDO DE LA BASE
 *
 * Hasta aquí el catálogo era `content/products.ts`: un array de TypeScript que
 * sólo se podía tocar editando el repositorio y desplegando. Ahora vive en la
 * base y lo edita Ana desde el panel, así que leerlo es una consulta y no un
 * `import`.
 *
 * Lo que **no** cambia es la forma de lo que sale de aquí: una `Pieza` es el
 * mismo objeto que era un `Product` —con su `image` ya resuelta en los dos
 * idiomas— y una `Familia` es lo que era una entrada de `categories`. Así el
 * escaparate, la rejilla, la ficha y el carrito siguen recibiendo lo que
 * esperaban y el cambio no se nota en la tienda.
 *
 * La lista de fotos sí es nueva —antes había una sola—, y por eso `Pieza` lleva
 * las dos cosas: `image` para todo lo que ya existía y `photos` para el panel y
 * para la ficha, que enseñará más de una.
 *
 * **La caché y su etiqueta.** Estas consultas se cachean bajo la etiqueta
 * `catalogo`: la tienda la lee en cada visita y el catálogo cambia unas pocas
 * veces por semana. Al publicar desde el panel se invalida esa etiqueta con
 * `revalidateTag(ETIQUETA)` y la tienda se actualiza al instante, sin desplegar
 * —ver `lib/catalogo-escritura.ts`—.
 */

export const ETIQUETA = 'catalogo'

export type Familia = {
  key: string
  label: Localized
  note: Localized
  plural: Localized
  intro: Localized
}

export type Foto = {
  id: string
  src: string
  width: number
  height: number
  blur: string
  alt: Localized
}

export type Pieza = {
  slug: string
  name: Localized
  /** La `key` de su familia. Se llamaba `category` cuando esto era un array. */
  category: string
  price: number | null
  summary: Localized
  description: Localized<string[]>
  materials: Localized<string[]>
  /** La primera foto, ya resuelta en los dos idiomas. `null` si no tiene. */
  image: Localized<Image> | null
  /** Todas sus fotos, en orden. La primera es la de la rejilla. */
  photos: Foto[]
  featured: boolean
  status: ProductStatus
}

/** Lo único que necesita una tarjeta de la rejilla. Ver `ProductCard`. */
export type PiezaTarjeta = Pick<Pieza, 'slug' | 'name' | 'image'>

/**
 * Cuántas piezas enseña la portada de la familia elegida. Vivía en
 * `content/products.ts` y no depende del catálogo, así que se queda como
 * constante: cinco son una fila entera en escritorio y dos que asoman debajo.
 */
export const HOME_PREVIEW_SIZE = 5

/**
 * Una foto guardada → la `Image` que espera `next/image`, con su texto
 * alternativo en cada idioma.
 *
 * Devuelve la foto entera dos veces, una por idioma, en vez de una foto con el
 * `alt` traducido dentro: así lo que sale es un `Localized<Image>` normal, se
 * resuelve con el mismo `t()` que cualquier otro texto y `Media` sigue
 * recibiendo una `Image`. Es exactamente lo que hacía `imgLocalized` en
 * `lib/media.ts`, sólo que ahora la foto viene de la base y no del manifiesto.
 */
function comoImagen(foto: PhotoDoc): Localized<Image> {
  const base = { src: foto.src, width: foto.width, height: foto.height, blur: foto.blur }
  return {
    es: { ...base, alt: foto.alt.es },
    gl: { ...base, alt: foto.alt.gl },
  }
}

function comoPieza(doc: {
  slug: string
  family: string
  name: Localized
  summary: Localized
  description: Localized<string[]>
  materials: Localized<string[]>
  price: number | null
  photos: PhotoDoc[]
  featured: boolean
  status: ProductStatus
}): Pieza {
  const [portada] = doc.photos

  return {
    slug: doc.slug,
    name: doc.name,
    category: doc.family,
    price: doc.price,
    summary: doc.summary,
    description: doc.description,
    materials: doc.materials,
    image: portada ? comoImagen(portada) : null,
    photos: doc.photos.map(({ id, src, width, height, blur, alt }) => ({
      id,
      src,
      width,
      height,
      blur,
      alt,
    })),
    featured: doc.featured,
    status: doc.status,
  }
}

/**
 * Las dos consultas de verdad. Todo lo demás de este fichero se sirve de ellas:
 * el catálogo entero cabe de sobra en memoria —son decenas de piezas, no miles—
 * y traerlo de una vez evita una consulta por familia y por ficha.
 *
 * Sólo sale lo publicado. El panel tiene sus propias lecturas, que ven también
 * los borradores; ver `lib/catalogo-panel.ts`.
 */
const leerFamilias = unstable_cache(
  async (): Promise<Familia[]> => {
    const docs = await (
      await families()
    )
      .find({ hidden: { $ne: true } })
      .sort({ order: 1 })
      .toArray()

    return docs.map(({ key, label, note, plural, intro }) => ({ key, label, note, plural, intro }))
  },
  ['catalogo-familias'],
  { tags: [ETIQUETA] },
)

const leerPiezas = unstable_cache(
  async (): Promise<Pieza[]> => {
    const docs = await (
      await catalogProducts()
    )
      .find({ status: 'publicada' })
      .sort({ family: 1, order: 1 })
      .toArray()

    return docs.map(comoPieza)
  },
  ['catalogo-piezas'],
  { tags: [ETIQUETA] },
)

export async function todasLasFamilias(): Promise<Familia[]> {
  return leerFamilias()
}

export async function familiaPorClave(key: string): Promise<Familia | undefined> {
  return (await leerFamilias()).find((familia) => familia.key === key)
}

export async function todasLasPiezas(): Promise<Pieza[]> {
  return leerPiezas()
}

export async function piezasDeFamilia(key: string): Promise<Pieza[]> {
  return (await leerPiezas()).filter((pieza) => pieza.category === key)
}

export async function piezaPorSlug(slug: string): Promise<Pieza | undefined> {
  return (await leerPiezas()).find((pieza) => pieza.slug === slug)
}
