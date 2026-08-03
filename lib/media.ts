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

/**
 * Sólo la ruta de una foto, sin dimensiones ni texto alternativo.
 *
 * Para los sitios donde la imagen no es un `<img>` y por tanto no hay alt que poner:
 * hoy, el `poster` del vídeo de la portada. Pasar por `img(clave, '')` daría lo mismo,
 * pero dejaría un alt vacío escrito a mano que parece un olvido.
 *
 * Tampoco lleva idioma, por lo mismo: no hay texto que traducir.
 */
export function imgSrc(key: ImageKey): string {
  return manifest[key].src
}

/**
 * La ruta de un vídeo de `public/reel/`.
 *
 * No pasa por el manifiesto: los vídeos no se generan en variantes ni llevan
 * placeholder, así que no hay nada que anotar. Vive aquí de todas formas para que
 * la ruta se escriba en un solo sitio —una barra de más es un 404 en silencio—.
 */
export function reelSrc(file: string): string {
  return `/reel/${file}`
}
