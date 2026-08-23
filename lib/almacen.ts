import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { put } from '@vercel/blob'

/**
 * DÓNDE SE GUARDAN LAS FOTOS QUE SUBE ANA
 *
 * Las fotos que ya había siguen donde estaban: `public/media`, generadas por
 * `npm run images` y servidas por el propio despliegue. Ésas no se tocan.
 *
 * Las nuevas no pueden ir ahí. En Vercel el disco es de sólo lectura y lo que se
 * escribiera en una invocación no existiría en la siguiente, así que una foto
 * subida desde el panel desaparecería al minuto. Van a **Vercel Blob**, que es
 * un almacén aparte con su propia dirección pública y su CDN.
 *
 * En desarrollo hay una salida distinta: si no hay `BLOB_READ_WRITE_TOKEN`, se
 * escribe en `public/media` como se ha hecho siempre. No es un apaño para
 * producción —se niega a hacerlo fuera de desarrollo—, es para poder trastear
 * con el panel sin dar de alta el almacén.
 *
 * Todo lo que sale de aquí es una dirección pública. Quien la guarda es la pieza,
 * en su lista de fotos; ver `PhotoDoc` en `lib/schema.ts`.
 */

/** Carpeta dentro del almacén. Las viejas viven en `/media` y así no se mezclan. */
const CARPETA = 'catalogo'

export type FotoGuardada = { src: string; width: number; height: number }

function hayAlmacen(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

/**
 * Guarda un fichero y devuelve su dirección pública.
 *
 * `nombre` ya viene decidido por quien llama —incluye la extensión— y es único:
 * lleva dentro el identificador de la foto. Aun así se pide `addRandomSuffix`
 * en el almacén, porque subir dos veces la misma foto tras reencuadrarla debe
 * dejar dos ficheros distintos: si se pisara el anterior, los navegadores y el
 * CDN seguirían enseñando el viejo durante horas.
 */
export async function guardar(nombre: string, datos: Buffer, tipo: string): Promise<string> {
  if (hayAlmacen()) {
    const { url } = await put(`${CARPETA}/${nombre}`, datos, {
      access: 'public',
      contentType: tipo,
      addRandomSuffix: true,
    })
    return url
  }

  if (process.env.NODE_ENV !== 'development') {
    throw new Error(
      'Falta BLOB_READ_WRITE_TOKEN: sin almacén, una foto subida en producción se perdería. ' +
        'Da de alta el almacén de Vercel Blob y trae la variable con `vercel env pull`.',
    )
  }

  const carpeta = path.join(process.cwd(), 'public', 'media')
  await mkdir(carpeta, { recursive: true })
  await writeFile(path.join(carpeta, nombre), datos)
  return `/media/${nombre}`
}

/** Para poder avisar en el panel antes de que alguien intente subir nada. */
export function almacenListo(): boolean {
  return hayAlmacen() || process.env.NODE_ENV === 'development'
}
