import type { Localized } from '@/lib/i18n/config'
import { catalogProducts, families, type ProductStatus } from '@/lib/schema'

/**
 * EL CATÁLOGO VISTO DESDE EL PANEL
 *
 * Lo mismo que `lib/catalogo.ts` pero sin filtrar y sin cachear, que son
 * justamente las dos cosas que la tienda necesita y el panel no:
 *
 * - **Sin filtrar**, porque Ana tiene que ver los borradores y las familias
 *   escondidas: son suyos, y no verlos sería no poder terminarlos.
 * - **Sin cachear**, porque quien acaba de guardar algo tiene que verlo ya. La
 *   caché de la tienda se invalida al escribir, pero entre la escritura y la
 *   invalidación hay un instante en el que el panel enseñaría lo viejo, y ese
 *   instante es exactamente cuando Ana está mirando.
 *
 * Aquí no se comprueba quién llama. Lo hace el layout de `/gestion`, que es por
 * donde se entra a todo esto.
 */

export type FamiliaPanel = {
  key: string
  label: Localized
  plural: Localized
  note: Localized
  intro: Localized
  hidden: boolean
  /** Cuántas piezas tiene dentro, contando borradores. */
  piezas: number
  /** Y cuántas de ellas se ven en la tienda. */
  publicadas: number
  /** Su cara: la primera foto de su primera pieza, como en la tienda. */
  thumb: string | null
}

export type FotoPanel = {
  id: string
  src: string
  alt: Localized
  /** Sin original no se puede reencuadrar: son las fotos de antes del panel. */
  reencuadrable: boolean
}

export type PiezaPanel = {
  slug: string
  familia: string
  name: Localized
  summary: Localized
  description: Localized<string[]>
  materials: Localized<string[]>
  price: number | null
  featured: boolean
  status: ProductStatus
  fotos: FotoPanel[]
  /** Lo que le falta para poder publicarse o para estar completa. */
  avisos: ('sin-foto' | 'sin-galego')[]
}

function avisosDe(pieza: {
  photos: unknown[]
  price: number | null
  name: Localized
  summary: Localized
  description: Localized<string[]>
}): PiezaPanel['avisos'] {
  const avisos: PiezaPanel['avisos'] = []

  if (pieza.photos.length === 0) avisos.push('sin-foto')

  // «Sin galego» es que falte algo que se lee, no que falten todos los campos:
  // basta con que el nombre o el resumen estén sólo en castellano para que la
  // ficha en galego se note a medias.
  const faltaGalego =
    !pieza.name.gl.trim() ||
    (Boolean(pieza.summary.es.trim()) && !pieza.summary.gl.trim()) ||
    (pieza.description.es.length > 0 && pieza.description.gl.length === 0)

  if (faltaGalego) avisos.push('sin-galego')

  return avisos
}

export async function familiasDelPanel(): Promise<FamiliaPanel[]> {
  const [docsFamilias, docsPiezas] = await Promise.all([
    (await families()).find().sort({ order: 1 }).toArray(),
    (await catalogProducts()).find().sort({ family: 1, order: 1 }).toArray(),
  ])

  return docsFamilias.map((familia) => {
    const suyas = docsPiezas.filter((pieza) => pieza.family === familia.key)
    const conFoto = suyas.find((pieza) => pieza.photos.length > 0)

    return {
      key: familia.key,
      label: familia.label,
      plural: familia.plural,
      note: familia.note,
      intro: familia.intro,
      hidden: familia.hidden,
      piezas: suyas.length,
      publicadas: suyas.filter((pieza) => pieza.status === 'publicada').length,
      thumb: conFoto?.photos[0]?.src ?? null,
    }
  })
}

export async function piezasDelPanel(familia: string): Promise<PiezaPanel[]> {
  const docs = await (
    await catalogProducts()
  )
    .find({ family: familia })
    .sort({ order: 1 })
    .toArray()

  return docs.map((pieza) => ({
    slug: pieza.slug,
    familia: pieza.family,
    name: pieza.name,
    summary: pieza.summary,
    description: pieza.description,
    materials: pieza.materials,
    price: pieza.price,
    featured: pieza.featured,
    status: pieza.status,
    fotos: pieza.photos.map((foto) => ({
      id: foto.id,
      src: foto.src,
      alt: foto.alt,
      reencuadrable: Boolean(foto.original),
    })),
    avisos: avisosDe(pieza),
  }))
}

export async function piezaDelPanel(slug: string): Promise<PiezaPanel | null> {
  const pieza = await (await catalogProducts()).findOne({ slug })
  if (!pieza) return null

  return {
    slug: pieza.slug,
    familia: pieza.family,
    name: pieza.name,
    summary: pieza.summary,
    description: pieza.description,
    materials: pieza.materials,
    price: pieza.price,
    featured: pieza.featured,
    status: pieza.status,
    fotos: pieza.photos.map((foto) => ({
      id: foto.id,
      src: foto.src,
      alt: foto.alt,
      reencuadrable: Boolean(foto.original),
    })),
    avisos: avisosDe(pieza),
  }
}
