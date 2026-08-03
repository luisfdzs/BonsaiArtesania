import type { Collection, ObjectId } from 'mongodb'
import { getDb } from './db'
import type { Locale } from '@/lib/i18n/config'

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

/** Euros del catálogo → céntimos del pedido. Redondea para evitar 3199.9999. */
export function toCents(euros: number): number {
  return Math.round(euros * 100)
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}
