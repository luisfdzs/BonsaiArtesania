import { unstable_cache } from 'next/cache'
import { portadaReels } from '@/lib/schema'

/**
 * LOS VÍDEOS DE LA PORTADA QUE PONE ANA
 *
 * Lo mismo que `lib/catalogo.ts` hace con el catálogo: leer de la base lo que
 * antes estaba escrito en un fichero. Aquí lo que estaba escrito —y sigue— es
 * `content/reel.ts`, con los dos clips del taller.
 *
 * **Esto no los sustituye: los sustituye sólo en móvil.** En escritorio la
 * portada es un díptico, dos clips verticales uno al lado de otro, y ese reparto
 * está pensado para esos dos y para dos exactamente; el comentario de
 * `content/reel.ts` ya avisaba de que un tercero lo descuadra. Lo que Ana pone
 * desde el panel se encadena en la primera pantalla del móvil, que es donde un
 * vertical de Instagram se ve como fue grabado. Si no pone ninguno, en móvil
 * vuelven los de siempre.
 *
 * La caché va con su propia etiqueta y no con la del catálogo: son cosas
 * distintas que cambian en momentos distintos, y compartir etiqueta significaría
 * tirar el catálogo entero cada vez que Ana cambia un vídeo.
 */

export const ETIQUETA_PORTADA = 'portada'

export type ReelDePortada = {
  id: string
  src: string
  poster: string | null
  nombre: string
}

/**
 * Los vídeos de la portada, en su orden. Cacheados como el catálogo: los lee
 * cada visita a la portada y cambian unas pocas veces al año.
 */
export const reelsDePortada = unstable_cache(
  async (): Promise<ReelDePortada[]> => leer(),
  ['portada-reels'],
  { tags: [ETIQUETA_PORTADA] },
)

/**
 * Lo mismo, **sin cachear**, para el panel.
 *
 * La misma razón que en `lib/catalogo-panel.ts`: la caché de la portada se
 * invalida al escribir, pero entre la escritura y la invalidación hay un instante
 * en el que el panel enseñaría lo viejo, y ese instante es exactamente cuando Ana
 * acaba de subir un vídeo y está mirando si ha entrado.
 */
export async function reelsDelPanel(): Promise<ReelDePortada[]> {
  return leer()
}

async function leer(): Promise<ReelDePortada[]> {
  const docs = await (await portadaReels()).find({}).sort({ order: 1 }).toArray()

  return docs.map(({ id, src, poster, nombre }) => ({ id, src, poster, nombre }))
}
