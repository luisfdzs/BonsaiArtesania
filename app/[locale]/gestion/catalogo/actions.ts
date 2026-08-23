'use server'

import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/admin'
import {
  anadirFoto,
  cambiarEncuadre,
  crearFamilia,
  crearPieza,
  eliminarPieza,
  guardarFamilia,
  guardarPieza,
  ordenarFamilias,
  ordenarPiezas,
  quitarFamilia,
  quitarFoto,
  retirarPieza,
  sustituirFoto,
} from '@/lib/catalogo-escritura'
import type { Encuadre } from '@/lib/fotos'
import type { Localized } from '@/lib/i18n/config'

/**
 * LO QUE EL PANEL LE PIDE AL SERVIDOR
 *
 * Cada una de estas funciones es un endpoint, aunque no lo parezca: una acción de
 * servidor se puede llamar desde fuera del formulario que la usa. Por eso **todas**
 * empiezan comprobando que quien llama es el taller, y no basta con que el panel
 * esté detrás de un layout con guarda.
 *
 * Lo que devuelven es siempre lo mismo: o nada, o un texto que el panel enseña tal
 * cual. Nada de códigos de error ni de excepciones que suban hasta la pantalla
 * roja de Next: quien está al otro lado es Ana, y lo que necesita leer es qué ha
 * pasado y qué puede hacer.
 */

export type Resultado = { ok: true } | { ok: false; error: string }

const NEGADO: Resultado = { ok: false, error: 'Esta parte es sólo del taller.' }

/** Todo lo que se toca aquí se ve en el catálogo del panel. */
function refrescarPanel() {
  revalidatePath('/[locale]/gestion/catalogo', 'page')
  revalidatePath('/[locale]/gestion/catalogo/[familia]', 'page')
}

async function intentar(tarea: () => Promise<void>): Promise<Resultado> {
  if (!(await isAdmin())) return NEGADO

  try {
    await tarea()
    refrescarPanel()
    return { ok: true }
  } catch (error) {
    // El mensaje sale de `lib/catalogo-escritura.ts`, que los escribe pensados
    // para leerse. Si viene otra cosa, no se enseña en crudo.
    const texto = error instanceof Error ? error.message : ''
    return {
      ok: false,
      error: texto || 'No he podido guardar el cambio. Vuelve a intentarlo en un momento.',
    }
  }
}

/* ------------------------------------------------------------ subir fotos -- */

/**
 * Sube fotos nuevas y crea una pieza con cada una.
 *
 * Llega del formulario del encuadre: por cada foto vienen los bytes, el nombre
 * que Ana ha repasado y el recorte que ha elegido. La pieza nace en borrador.
 */
export async function subirFotos(formData: FormData): Promise<Resultado> {
  return intentar(async () => {
    const familia = String(formData.get('familia') ?? '')
    if (!familia) throw new Error('Falta la familia en la que catalogar las fotos.')

    const ficheros = formData.getAll('foto').filter((valor): valor is File => valor instanceof File)
    if (ficheros.length === 0) throw new Error('No ha llegado ninguna foto.')

    const nombres = formData.getAll('nombre').map(String)
    const encuadres = formData.getAll('encuadre').map(String)

    for (const [indice, fichero] of ficheros.entries()) {
      const nombre = (nombres[indice] ?? '').trim() || nombreDesdeFichero(fichero.name)

      await crearPieza({
        familia,
        nombre: { es: nombre, gl: nombre },
        foto: {
          datos: Buffer.from(await fichero.arrayBuffer()),
          // El texto alternativo se rellena con el nombre de la pieza y Ana lo
          // afina en la ficha: es mejor que quede algo que se lea en voz alta a
          // que quede vacío esperando a que alguien se acuerde.
          alt: { es: nombre, gl: nombre },
          encuadre: leerEncuadre(encuadres[indice]),
        },
      })
    }
  })
}

/** `pendientes-farolillo-2.jpg` → `Pendientes Farolillo 2`. */
function nombreDesdeFichero(nombre: string): string {
  const limpio = nombre
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return limpio.charAt(0).toUpperCase() + limpio.slice(1)
}

function leerEncuadre(texto: string | undefined): Encuadre | null {
  if (!texto) return null

  try {
    const crudo = JSON.parse(texto) as Partial<Encuadre>
    const numeros = [crudo.x, crudo.y, crudo.w, crudo.h]
    if (!numeros.every((valor) => typeof valor === 'number' && valor >= 0 && valor <= 1))
      return null

    return { x: crudo.x!, y: crudo.y!, w: crudo.w!, h: crudo.h! }
  } catch {
    return null
  }
}

/** Una foto más para una pieza que ya existe. */
export async function subirFotoDePieza(formData: FormData): Promise<Resultado> {
  return intentar(async () => {
    const slug = String(formData.get('slug') ?? '')
    const fichero = formData.get('foto')
    if (!(fichero instanceof File)) throw new Error('No ha llegado ninguna foto.')

    const alt = String(formData.get('alt') ?? '').trim()

    await anadirFoto(slug, {
      datos: Buffer.from(await fichero.arrayBuffer()),
      alt: { es: alt, gl: alt },
      encuadre: leerEncuadre(String(formData.get('encuadre') ?? '')),
    })
  })
}

/**
 * Cambia una foto por otra. Llega del mismo encuadre que las demás, pero con el
 * identificador de la foto que se sustituye.
 */
export async function reemplazarFoto(formData: FormData): Promise<Resultado> {
  return intentar(async () => {
    const slug = String(formData.get('slug') ?? '')
    const fotoId = String(formData.get('fotoId') ?? '')
    const fichero = formData.get('foto')
    if (!(fichero instanceof File)) throw new Error('No ha llegado ninguna foto.')

    const alt = String(formData.get('alt') ?? '').trim()

    await sustituirFoto(slug, fotoId, {
      datos: Buffer.from(await fichero.arrayBuffer()),
      alt: { es: alt, gl: alt },
      encuadre: leerEncuadre(String(formData.get('encuadre') ?? '')),
    })
  })
}

export async function reencuadrarFoto(
  slug: string,
  fotoId: string,
  encuadre: Encuadre,
): Promise<Resultado> {
  return intentar(() => cambiarEncuadre(slug, fotoId, encuadre))
}

export async function borrarFoto(slug: string, fotoId: string): Promise<Resultado> {
  return intentar(() => quitarFoto(slug, fotoId))
}

/* ----------------------------------------------------------------- piezas -- */

export async function guardarTextos(
  slug: string,
  cambios: {
    name?: Localized
    summary?: Localized
    description?: Localized<string[]>
    materials?: Localized<string[]>
    price?: number | null
    familia?: string
    featured?: boolean
  },
): Promise<Resultado> {
  return intentar(() =>
    guardarPieza(slug, {
      ...(cambios.name ? { name: cambios.name } : {}),
      ...(cambios.summary ? { summary: cambios.summary } : {}),
      ...(cambios.description ? { description: cambios.description } : {}),
      ...(cambios.materials ? { materials: cambios.materials } : {}),
      ...(cambios.price !== undefined ? { price: cambios.price } : {}),
      ...(cambios.familia ? { family: cambios.familia } : {}),
      ...(cambios.featured !== undefined ? { featured: cambios.featured } : {}),
    }),
  )
}

export async function publicarPieza(slug: string): Promise<Resultado> {
  return intentar(() => guardarPieza(slug, { status: 'publicada' }))
}

export async function despublicarPieza(slug: string): Promise<Resultado> {
  return intentar(() => retirarPieza(slug))
}

/** El «Borrar» de la tarjeta. El panel pregunta antes; aquí ya no hay vuelta. */
export async function borrarPieza(slug: string): Promise<Resultado> {
  return intentar(() => eliminarPieza(slug))
}

export async function colocarPiezas(familia: string, slugs: string[]): Promise<Resultado> {
  return intentar(() => ordenarPiezas(familia, slugs))
}

/* --------------------------------------------------------------- familias -- */

export async function nuevaFamilia(nombre: string): Promise<Resultado> {
  return intentar(async () => {
    const limpio = nombre.trim()
    if (!limpio) throw new Error('La familia necesita un nombre.')
    await crearFamilia({ es: limpio, gl: limpio })
  })
}

export async function guardarDatosDeFamilia(
  key: string,
  cambios: {
    label?: Localized
    plural?: Localized
    note?: Localized
    intro?: Localized
    hidden?: boolean
  },
): Promise<Resultado> {
  return intentar(() => guardarFamilia(key, cambios))
}

export async function colocarFamilias(keys: string[]): Promise<Resultado> {
  return intentar(() => ordenarFamilias(keys))
}

export async function borrarFamilia(
  key: string,
  destino: { mover: string } | { aBorrador: true },
): Promise<Resultado> {
  return intentar(() => quitarFamilia(key, destino))
}
