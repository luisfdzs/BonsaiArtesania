import type { Collection, ObjectId } from 'mongodb'
import { getDb } from './db'

/**
 * Forma de los documentos y acceso tipado a las colecciones.
 *
 * Dos decisiones que atraviesan todo el modelo:
 *
 * 1. **El dinero se guarda en céntimos, como entero.** Un `float` de euros
 *    acumula error al sumar líneas de pedido (0.1 + 0.2 !== 0.3) y en un importe
 *    a cobrar eso no es aceptable. El catálogo sigue en euros porque lo escribe
 *    una persona a mano; la conversión ocurre al crear el pedido.
 *
 * 2. **De la tarjeta no se guarda nada.** Ni número, ni caducidad, ni CVV:
 *    almacenarlo obliga a cumplir PCI-DSS. La captura la hace la pasarela y aquí
 *    sólo queda su identificador de cliente (`stripeCustomerId`) y el del cobro
 *    (`payment.intentId`), que son referencias opacas e inservibles por sí solas.
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
  /** Referencia al cliente en la pasarela. Se rellena en la fase de pago. */
  stripeCustomerId?: string | null
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

/** Línea de carrito. El precio NO se guarda aquí: se lee del catálogo al mostrarlo. */
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
 * Línea de pedido: copia congelada del catálogo en el momento de comprar.
 * Duplicar nombre y precio es deliberado —si mañana sube el precio o se renombra
 * la pieza, la factura emitida no puede cambiar.
 */
export type OrderItem = {
  slug: string
  name: string
  unitPriceCents: number
  qty: number
}

export type OrderStatus =
  'pendiente_pago' | 'pagado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado'

export type OrderDoc = {
  _id: ObjectId
  /** Referencia legible para hablar con el cliente: BA-2026-0001. */
  number: string
  userId: ObjectId
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
  payment: {
    /**
     * `simulado` marca los pedidos creados mientras el cobro es un placeholder:
     * la interfaz dice al cliente que ha pagado, pero no se ha cobrado nada. Es lo
     * que permite distinguirlos de los reales cuando se conecte Stripe.
     */
    provider: 'stripe' | 'transferencia' | 'bizum' | 'simulado'
    status: 'pendiente' | 'pagado' | 'fallido' | 'reembolsado'
    /** Identificador del intento de cobro en la pasarela. Nunca datos de tarjeta. */
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
