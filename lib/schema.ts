import type { Collection, ObjectId } from 'mongodb'
import { getDb } from './db'
import type { Locale, Localized } from '@/lib/i18n/config'

/**
 * Forma de los documentos y acceso tipado a las colecciones.
 *
 * Dos decisiones que atraviesan todo el modelo:
 *
 * 1. **Las cifras se guardan en céntimos, como entero.** Un `float` de euros
 *    acumula error al sumar líneas (0.1 + 0.2 !== 0.3). El catálogo sigue en euros
 *    porque lo escribe una persona a mano; la conversión ocurre al archivar la
 *    petición. Ninguna de estas cifras se publica en ninguna parte.
 *
 * 2. **De la tarjeta no se guarda nada.** Ni número, ni caducidad, ni CVV: la web
 *    no los pide en ningún momento y no hay dónde meterlos.
 */

/** Colecciones que gestiona el adaptador de Auth.js; no las tocamos a mano. */
export const AUTH_COLLECTIONS = ['accounts', 'sessions', 'verification_tokens'] as const

export type UserDoc = {
  _id: ObjectId
  /** Los cuatro primeros campos son los que espera el adaptador de Auth.js. */
  name?: string | null
  email: string
  /**
   * Se rellena al acertar el código que se envió a esa dirección. Que esté puesto
   * significa que alguien con acceso a ese buzón completó el alta; una cuenta sin
   * ello no debería existir, porque la contraseña se elige en el mismo paso.
   */
  emailVerified?: Date | null
  image?: string | null
  /**
   * Contraseña, con la sal y el coste dentro de la propia cadena. Ver
   * `lib/password.ts`: nunca se guarda ni se compara en claro, y no sale de la
   * base más que para el `verifyPassword` del login.
   */
  passwordHash?: string | null
  /** Última vez que se cambió. Sirve para explicar por qué se cerraron las sesiones. */
  passwordUpdatedAt?: Date | null
  /** Perfil propio. Opcional: al registrarse por correo sólo se conoce el correo. */
  phone?: string | null
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Dirección de envío. Va en su propia colección y no incrustada en el usuario
 * porque son varias por persona, se editan por separado y el pedido necesita
 * una *copia* de la que se usó: si el cliente cambia de piso el año que viene,
 * el pedido antiguo debe seguir diciendo dónde se envió de verdad.
 */
export type AddressDoc = {
  _id: ObjectId
  userId: ObjectId
  /** Cómo la llama el cliente: «Casa», «Trabajo». */
  alias: string
  recipient: string
  phone: string
  line1: string
  line2?: string | null
  postalCode: string
  city: string
  province: string
  /** ISO 3166-1 alfa-2. Hoy sólo se envía a España, pero el campo evita migrar después. */
  country: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

/** Línea de carrito. Ninguna cifra se guarda aquí: se leen del catálogo al pintar. */
export type CartItem = {
  slug: string
  qty: number
  addedAt: Date
}

/**
 * Carrito. Uno por usuario. `guestId` permite carrito sin cuenta: al entrar se
 * fusiona con el del usuario y se borra el de invitado.
 */
export type CartDoc = {
  _id: ObjectId
  userId?: ObjectId | null
  guestId?: string | null
  items: CartItem[]
  updatedAt: Date
}

/**
 * Línea de la petición: copia congelada del catálogo en el momento de pedir.
 * Duplicar el nombre y la cifra es deliberado —si mañana se renombra la pieza o se
 * corrige el catálogo, lo ya archivado no puede cambiar.
 */
export type OrderItem = {
  slug: string
  name: string
  unitPriceCents: number
  qty: number
}

/**
 * El viaje de un pedido, en orden. Los nombres son técnicos y en base se quedan
 * así; lo que lee cada uno —el cliente una cosa, Ana otra— vive en
 * `lib/order-status.ts`.
 *
 * `en_reparto` es el último tramo, el del repartidor que ya lleva el paquete en
 * la furgoneta. Se separa de `enviado` porque para quien espera son dos noticias
 * distintas: «ha salido del taller» y «llega hoy».
 */
export type OrderStatus =
  'pendiente_pago' | 'preparando' | 'enviado' | 'en_reparto' | 'entregado' | 'cancelado'

export type OrderDoc = {
  _id: ObjectId
  /** Referencia legible para hablar con el cliente: BA-2026-0001. */
  number: string
  userId: ObjectId
  /**
   * El idioma en el que se hizo el pedido.
   *
   * Se guarda con él porque los correos no salen todos a la vez: el de
   * confirmación sale en el momento, pero los de cambio de estado los dispara Ana
   * desde el taller días o semanas después, y ahí el idioma de la petición es el
   * del panel de Ana, no el de quien va a leer el correo.
   *
   * Opcional porque los pedidos anteriores al galego no lo llevan. Quien lo lee
   * cae al castellano, que es en el que se hicieron. No hace falta migrar nada.
   */
  locale?: Locale
  status: OrderStatus
  items: OrderItem[]
  /** Copia de la dirección, no una referencia. Ver comentario en AddressDoc. */
  shipping: {
    address: Omit<AddressDoc, '_id' | 'userId' | 'isDefault' | 'createdAt' | 'updatedAt'>
    costCents: number
  }
  totals: {
    subtotalCents: number
    shippingCents: number
    totalCents: number
  }
  /**
   * ⚠️ Bloque heredado, sin uso: todas las peticiones se archivan con `simulado` /
   * `pendiente` y nada más lo lee ni lo escribe. Sigue aquí sólo porque el
   * validador de Mongo lo declara obligatorio (`scripts/db-setup.mjs`); quitarlo es
   * una migración, no una edición.
   */
  payment: {
    provider: 'stripe' | 'transferencia' | 'bizum' | 'simulado'
    status: 'pendiente' | 'pagado' | 'fallido' | 'reembolsado'
    intentId?: string | null
  }
  /** Traza de cambios de estado, para poder responder «¿qué pasó con mi pedido?». */
  history: { status: OrderStatus; at: Date; note?: string }[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Código de un solo uso enviado al correo. Dos usos: confirmar la dirección al
 * crear la cuenta y recuperar el acceso cuando se olvida la contraseña.
 *
 * Vive en su propia colección y no en `verification_tokens` a propósito: aquella
 * la escribe y la limpia el adaptador de Auth.js, y meterle documentos con otra
 * forma es pedir que se rompa cuando la librería cambie. Aquí mandamos nosotros.
 *
 * Del código sólo se guarda su HMAC, nunca las seis cifras. Ver `lib/codes.ts`.
 */
export type EmailCodeDoc = {
  _id: ObjectId
  /** Siempre en minúsculas y sin espacios: es la clave de búsqueda. */
  email: string
  purpose: 'alta' | 'recuperar'
  codeHash: string
  /** Intentos fallidos gastados. Al pasarse, el código muere. */
  attempts: number
  /** Índice TTL: Mongo borra el documento al caducar. Ver db-setup. */
  expiresAt: Date
  createdAt: Date
}

export type PushSubscriptionDoc = {
  _id: ObjectId
  email: string
  endpoint: string
  keys: { p256dh: string; auth: string }
  userAgent?: string | null
  createdAt: Date
  updatedAt: Date
}

export async function users(): Promise<Collection<UserDoc>> {
  return (await getDb()).collection<UserDoc>('users')
}

export async function emailCodes(): Promise<Collection<EmailCodeDoc>> {
  return (await getDb()).collection<EmailCodeDoc>('email_codes')
}

export async function addresses(): Promise<Collection<AddressDoc>> {
  return (await getDb()).collection<AddressDoc>('addresses')
}

export async function carts(): Promise<Collection<CartDoc>> {
  return (await getDb()).collection<CartDoc>('carts')
}

export async function orders(): Promise<Collection<OrderDoc>> {
  return (await getDb()).collection<OrderDoc>('orders')
}

export async function pushSubscriptions(): Promise<Collection<PushSubscriptionDoc>> {
  return (await getDb()).collection<PushSubscriptionDoc>('push_subscriptions')
}

/* ============================================================================
   EL CATÁLOGO
   ========================================================================= */

/**
 * Una foto del catálogo, tal y como queda guardada con su pieza.
 *
 * Se guardan **dos** ficheros por foto y no uno: el original entero que subió
 * Ana y el derivado que sirve la web. El derivado es lo que se pinta —recortado
 * al encuadre elegido, redimensionado y en webp—; el original queda para poder
 * reencuadrar más adelante sin pedirle la foto otra vez, que es justo lo que
 * pasa cuando una pieza cambia de sitio y el recorte cuadrado ya no le sirve.
 *
 * El `blur` es el mismo LQIP que generaba `npm run images`: una miniatura en
 * base64 que se pinta mientras llega la foto de verdad. Se guarda con la foto
 * porque se calcula una sola vez, al subirla.
 */
export type PhotoDoc = {
  /** Estable y propio de la foto: es el nombre con el que vive en el almacén. */
  id: string
  /** Lo que pinta la web. */
  src: string
  width: number
  height: number
  blur: string
  /** Se lee en voz alta, así que va traducido como cualquier otro texto. */
  alt: Localized
  /** El original sin recortar. Sin él no se puede volver a encuadrar. */
  original: { src: string; width: number; height: number } | null
  /**
   * El encuadre elegido sobre el original, en fracciones de 0 a 1. Se guarda
   * para poder devolver el recuadro a donde lo dejó Ana cuando vuelva a abrirlo.
   */
  crop: { x: number; y: number; w: number; h: number } | null
  createdAt: Date
}

/**
 * Una familia de la tienda: pendientes, anillos, el taller…
 *
 * `key` es la que va en la dirección (`/tienda/categoria/pendientes`), así que
 * no se traduce y no cambia cuando se renombra la familia: renombrar es cosa de
 * `label`. El `order` es el de la barra de familias y el del escaparate de la
 * portada, y es el que Ana coloca arrastrando.
 */
export type FamilyDoc = {
  _id: ObjectId
  key: string
  label: Localized
  /** Lo que se lee en el botón «Ver más …». En minúscula: va dentro de una frase. */
  plural: Localized
  /** La media línea que acompaña al nombre en la barra de familias. */
  note: Localized
  /** La línea que encabeza su página. */
  intro: Localized
  order: number
  /*
   * Una familia no guarda foto propia: la suya es la primera foto de su primera
   * pieza, y se cambia poniendo otra pieza la primera en el catálogo. Un campo
   * aparte serían dos verdades para lo mismo, y la que se olvida de actualizar
   * es siempre la de aquí.
   */
  /**
   * Escondida a mano. Una familia sin piezas publicadas tampoco sale, pero eso
   * se calcula; esto es la decisión explícita de retirarla teniendo piezas.
   */
  hidden: boolean
  createdAt: Date
  updatedAt: Date
}

/** Publicada se ve en la tienda; en borrador sólo se ve en el panel. */
export type ProductStatus = 'publicada' | 'borrador'

/**
 * Una pieza del catálogo.
 *
 * Es el mismo objeto que vivía en `content/products.ts` con dos cambios: las
 * fotos son una lista —la primera es la de la rejilla— y hay un estado, para que
 * Ana pueda dejar algo a medias sin que salga a la tienda.
 *
 * El precio sigue en euros y no en céntimos: lo escribe una persona a mano y
 * aquí no se suma nada. La conversión a céntimos ocurre al archivar el pedido.
 */
export type ProductDoc = {
  _id: ObjectId
  /** La dirección de su ficha. No se traduce. */
  slug: string
  /** `key` de su familia. */
  family: string
  /** Su sitio dentro de la familia, el que Ana coloca arrastrando. */
  order: number
  name: Localized
  /** Una línea, encima del título de la ficha. */
  summary: Localized
  description: Localized<string[]>
  materials: Localized<string[]>
  /** `null` = pieza a medida: no pasa por el carrito. */
  price: number | null
  /** La primera es la de la rejilla y la de la portada. */
  photos: PhotoDoc[]
  /** Abre su familia en el escaparate de la portada. */
  featured: boolean
  status: ProductStatus
  createdAt: Date
  updatedAt: Date
}

export async function families(): Promise<Collection<FamilyDoc>> {
  return (await getDb()).collection<FamilyDoc>('catalog_families')
}

export async function catalogProducts(): Promise<Collection<ProductDoc>> {
  return (await getDb()).collection<ProductDoc>('catalog_products')
}

/* ============================================================================
   LA PORTADA
   ========================================================================= */

/**
 * Un vídeo del fondo de la portada, de los que sube Ana desde el panel.
 *
 * **Sólo se ven en móvil.** En escritorio la portada sigue siendo el díptico de
 * `content/reel.ts`, que son dos clips verticales pensados para verse juntos en
 * una pantalla ancha; meter ahí un vídeo suelto rompería ese reparto. Lo que Ana
 * pone aquí sustituye a lo que se encadenaba en móvil, y si no pone nada vuelven
 * los de siempre. Ver `components/ui/ReelBackdrop.tsx`.
 *
 * `order` es el orden en que se encadenan, y es el que Ana coloca arrastrando.
 *
 * Del vídeo no se guarda copia ni derivado, al revés que de las fotos: no hay un
 * `sharp` para vídeo en el servidor, así que el fichero es el que subió y por eso
 * el panel pone un tope de tamaño —ver `lib/portada.ts`—. El `poster` sí se saca
 * al subir, en el navegador, del primer fotograma: es lo que se ve mientras el
 * vídeo llega, y sin él la portada arranca en tinta.
 */
export type ReelDoc = {
  _id: ObjectId
  /** Estable y propio: es la clave de la lista y con la que se borra. */
  id: string
  /** La dirección pública en el almacén. */
  src: string
  /** Primer fotograma, o `null` si el navegador no pudo sacarlo. */
  poster: string | null
  /** Cómo se llamaba el fichero que subió Ana. Sólo para que ella lo reconozca. */
  nombre: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export async function portadaReels(): Promise<Collection<ReelDoc>> {
  return (await getDb()).collection<ReelDoc>('portada_reels')
}

/** Euros del catálogo → céntimos del pedido. Redondea para evitar 3199.9999. */
export function toCents(euros: number): number {
  return Math.round(euros * 100)
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}
