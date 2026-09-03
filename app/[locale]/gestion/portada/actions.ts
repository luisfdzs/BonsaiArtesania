'use server'

import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/admin'
import { anadirReel, ordenarReels, quitarReel } from '@/lib/portada-escritura'

/**
 * LO QUE EL PANEL DE LA PORTADA LE PIDE AL SERVIDOR
 *
 * Mismas reglas que en el catálogo, y por las mismas razones: cada función es un
 * endpoint aunque no lo parezca, así que **todas** empiezan comprobando que quien
 * llama es el taller; y lo que devuelven es o nada o un texto que el panel enseña
 * tal cual, porque quien está al otro lado es Ana. Ver
 * `app/[locale]/gestion/catalogo/actions.ts`.
 *
 * Los bytes del vídeo no pasan por aquí: los sube el navegador al almacén y lo
 * que llega es la dirección. Ver `app/api/gestion/reel/route.ts`.
 */

export type Resultado = { ok: true } | { ok: false; error: string }

const NEGADO: Resultado = { ok: false, error: 'Esta parte es sólo del taller.' }

async function intentar(tarea: () => Promise<void>): Promise<Resultado> {
  if (!(await isAdmin())) return NEGADO

  try {
    await tarea()
    revalidatePath('/[locale]/gestion/portada', 'page')
    return { ok: true }
  } catch (error) {
    const texto = error instanceof Error ? error.message : ''
    return {
      ok: false,
      error: texto || 'No he podido guardar el cambio. Vuelve a intentarlo en un momento.',
    }
  }
}

/**
 * Guarda un vídeo que ya está en el almacén.
 *
 * Se llama justo después de que la subida termine, desde la misma pantalla que la
 * pidió. Que el vídeo esté subido y no guardado es el estado intermedio de dos
 * segundos que hay siempre; si esto falla, en el almacén queda un fichero que no
 * sale en ninguna parte y el panel lo dice.
 */
export async function anadirReelDePortada(datos: {
  src: string
  poster: string | null
  nombre: string
}): Promise<Resultado> {
  return intentar(() => anadirReel(datos))
}

/** El orden en que se encadenan en el móvil, tal y como lo dejó arrastrando. */
export async function colocarReelsDePortada(ids: string[]): Promise<Resultado> {
  return intentar(() => ordenarReels(ids))
}

/** Quita el vídeo de la portada y borra el fichero. El panel pregunta antes. */
export async function borrarReelDePortada(id: string): Promise<Resultado> {
  return intentar(() => quitarReel(id))
}
