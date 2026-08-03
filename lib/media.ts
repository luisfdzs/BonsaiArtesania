import manifest from '@/content/media-manifest.json'

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
 * La ruta de un vídeo de `public/reel/`.
 *
 * No pasa por el manifiesto: los vídeos no se generan en variantes ni llevan
 * placeholder, así que no hay nada que anotar. Vive aquí de todas formas para que
 * la ruta se escriba en un solo sitio —una barra de más es un 404 en silencio—.
 */
export function reelSrc(file: string): string {
  return `/reel/${file}`
}
