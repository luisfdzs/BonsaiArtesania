import manifest from '@/content/media-manifest.json'
import type { Localized } from '@/lib/i18n/config'

export type Image = {
  src: string
  width: number
  height: number
  /** LQIP en base64: lo que se ve mientras carga la foto de verdad. */
  blur: string
  alt: string
}

/** Claves disponibles. Las genera `npm run images` a partir de los nombres de
 *  fichero de `fotos-originales/`, así que una clave inventada es un error de
 *  TypeScript, no una imagen rota en producción. */
export type ImageKey = keyof typeof manifest

/**
 * Resuelve una foto del manifiesto y le pone su texto alternativo. El alt vive
 * en el contenido —junto al texto que acompaña a la imagen— y no en el
 * manifiesto, que se regenera cada vez que se procesan las fotos.
 */
export function img(key: ImageKey, alt: string): Image {
  return { ...manifest[key], alt }
}

/**
 * La misma foto con su texto alternativo en los dos idiomas, para el contenido
 * que se guarda traducido de una vez —el catálogo— en vez de traducirse al
 * pintar.
 *
 * Devuelve dos fotos enteras y no una foto con el `alt` traducido dentro. Es
 * repetir el `src`, el tamaño y el placeholder dos veces, y se hace a propósito:
 * así lo que sale de aquí es un `Localized<Image>` normal, se resuelve con el
 * mismo `t()` que cualquier otro texto y `Media` sigue recibiendo una `Image` y
 * no un tipo nuevo. La copia son cuatro campos en memoria; el tipo aparte serían
 * cuatro sitios donde acordarse de resolverlo.
 */
export function imgLocalized(key: ImageKey, alt: Localized): Localized<Image> {
  return { es: img(key, alt.es), gl: img(key, alt.gl) }
}
