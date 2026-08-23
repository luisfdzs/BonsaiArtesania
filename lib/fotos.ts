import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
import { guardar } from '@/lib/almacen'
import type { Localized } from '@/lib/i18n/config'
import type { PhotoDoc } from '@/lib/schema'

/**
 * LO QUE LE PASA A UNA FOTO CUANDO ANA LA SUELTA EN EL PANEL
 *
 * Es el mismo trabajo que hacía `npm run images` a mano desde el ordenador de
 * Luis —girar según el EXIF, recortar, encoger a 1600 px, webp y un LQIP para
 * mientras carga—, sólo que ahora ocurre en el servidor en el momento de subir.
 * Ana no ve nada de esto: suelta una foto de 4 MB y aparece una tarjeta.
 *
 * Se guardan **dos** ficheros:
 *
 * - el **original**, entero y sin recortar, sólo redimensionado a un tope
 *   razonable. Es lo que permite volver a encuadrar la misma foto meses después
 *   sin pedírsela otra vez.
 * - el **derivado**, que es lo que sirve la tienda: recortado al encuadre que
 *   eligió Ana y en webp.
 *
 * El encuadre viene en fracciones de 0 a 1 y no en píxeles a propósito: el panel
 * lo calcula sobre una foto escalada a la pantalla, y en píxeles el recorte
 * saldría distinto en un portátil que en un monitor grande.
 */

/** Lo que sirve la tienda. Igual que el pipeline de siempre. */
const ANCHO_MAXIMO = 1600
const CALIDAD = 82
/** El original se guarda generoso, pero no ilimitado: una foto de móvil moderna
 *  pasa de 4000 px y ahí no hay nada que ganar salvo factura de almacenamiento. */
const ANCHO_ORIGINAL = 2400
const ANCHO_BORROSO = 16

export type Encuadre = { x: number; y: number; w: number; h: number }

export type FotoSubida = {
  /** El fichero tal cual llega del formulario. */
  datos: Buffer
  alt: Localized
  /** Si no viene, se guarda la foto entera. */
  encuadre?: Encuadre | null
}

/** El cuadrado que se ve en la tarjeta de la rejilla. */
export const ENCUADRE_ENTERO: Encuadre = { x: 0, y: 0, w: 1, h: 1 }

/**
 * Convierte una foto recién soltada en lo que se guarda con la pieza.
 *
 * Devuelve el `PhotoDoc` entero —ya con sus direcciones, su tamaño y su
 * borroso—, listo para meter en `photos`. No toca la base: de eso se encarga
 * quien la llama, que es quien sabe a qué pieza pertenece.
 */
export async function prepararFoto({ datos, alt, encuadre }: FotoSubida): Promise<PhotoDoc> {
  const id = randomUUID()

  // `rotate()` sin argumentos aplica la orientación del EXIF. Sin esto, las
  // fotos hechas con el móvil en vertical salen tumbadas, que es el fallo
  // clásico de los formularios de subida.
  const entera = sharp(datos, { limitInputPixels: false }).rotate()
  const { width = 0, height = 0 } = await entera.metadata()
  if (!width || !height) throw new Error('Eso no parece una foto.')

  const original = await sharp(datos, { limitInputPixels: false })
    .rotate()
    .resize({ width: ANCHO_ORIGINAL, withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: CALIDAD, effort: 4 })
    .toBuffer()

  const recorte = encuadre ?? ENCUADRE_ENTERO
  const region = {
    left: Math.round(recorte.x * width),
    top: Math.round(recorte.y * height),
    width: Math.max(1, Math.round(recorte.w * width)),
    height: Math.max(1, Math.round(recorte.h * height)),
  }

  const derivado = await sharp(datos, { limitInputPixels: false })
    .rotate()
    .extract(region)
    .resize({ width: ANCHO_MAXIMO, withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: CALIDAD, effort: 6 })
    .toBuffer()

  const medidas = await sharp(derivado).metadata()

  const borroso = await sharp(derivado)
    .resize({ width: ANCHO_BORROSO, fit: 'inside' })
    .webp({ quality: 45, effort: 4 })
    .toBuffer()

  const medidasOriginal = await sharp(original).metadata()

  const [src, srcOriginal] = await Promise.all([
    guardar(`${id}.webp`, derivado, 'image/webp'),
    guardar(`${id}-original.webp`, original, 'image/webp'),
  ])

  return {
    id,
    src,
    width: medidas.width ?? 0,
    height: medidas.height ?? 0,
    blur: `data:image/webp;base64,${borroso.toString('base64')}`,
    alt,
    original: {
      src: srcOriginal,
      width: medidasOriginal.width ?? 0,
      height: medidasOriginal.height ?? 0,
    },
    crop: encuadre ?? null,
    createdAt: new Date(),
  }
}

/**
 * Vuelve a recortar una foto que ya está guardada, a partir de su original.
 *
 * Se usa cuando Ana cambia el encuadre de algo que ya subió. Genera un derivado
 * nuevo con dirección nueva —nunca pisa el anterior, porque el CDN seguiría
 * sirviendo el viejo— y conserva el mismo `id` y el mismo original.
 */
export async function reencuadrar(foto: PhotoDoc, encuadre: Encuadre): Promise<PhotoDoc> {
  if (!foto.original) {
    throw new Error('Esta foto es de las antiguas y no guarda original: hay que volver a subirla.')
  }

  const respuesta = await fetch(
    foto.original.src.startsWith('/')
      ? new URL(foto.original.src, process.env.NEXTAUTH_URL ?? 'http://localhost:3000')
      : foto.original.src,
  )
  if (!respuesta.ok) throw new Error('No he podido recuperar el original de la foto.')

  const datos = Buffer.from(await respuesta.arrayBuffer())
  const nueva = await prepararFoto({ datos, alt: foto.alt, encuadre })

  return { ...nueva, id: foto.id, original: foto.original, createdAt: foto.createdAt }
}
