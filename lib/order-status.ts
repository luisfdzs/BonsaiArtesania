import { pick, type Locale, type Localized } from '@/lib/i18n/config'
import type { OrderStatus } from '@/lib/schema'

/**
 * Cómo se dice cada estado. Los valores en base son `snake_case` y en inglés
 * técnico; esto es lo que se lee en pantalla.
 *
 * Hay **dos vocabularios y no uno** porque el pedido lo miran dos personas que no
 * necesitan lo mismo. El cliente quiere saber qué le está pasando a lo suyo, y
 * eso se cuenta con una frase. Ana quiere barrer treinta pedidos de un vistazo y
 * elegir uno en un desplegable, y ahí una frase estorba: necesita una etiqueta
 * corta que quepa en una fila y en una pestaña con su contador al lado.
 *
 * El dato es el mismo; sólo cambia quién lo lee.
 */

/**
 * Lo que ve el cliente en «Tus pedidos».
 *
 * `preparando` no dice «preparando»: dice quién lo está haciendo y qué. Es el
 * único momento en que el cliente sabe que hay una persona detrás trabajando en
 * su pieza, y desaprovecharlo con un gerundio administrativo sería una lástima.
 */
const CUSTOMER: Record<OrderStatus, Localized> = {
  // El nombre en base es heredado y así se queda —renombrarlo es una migración—,
  // pero en pantalla no aparece nunca: quien pide sólo ha pedido algo y espera que
  // Ana le escriba, y «Sin confirmar» describe justo eso.
  pendiente_pago: { es: 'Sin confirmar', gl: 'Sen confirmar' },
  preparando: {
    es: 'Ana está creando tus joyas bonsái',
    gl: 'Ana está creando as túas xoias bonsái',
  },
  enviado: { es: 'En tránsito', gl: 'En tránsito' },
  en_reparto: { es: 'En reparto', gl: 'En reparto' },
  entregado: { es: 'Entregado', gl: 'Entregado' },
  cancelado: { es: 'Cancelado', gl: 'Cancelado' },
}

/**
 * Lo que ve Ana en el taller. Lo mismo, en corto.
 *
 * Aquí «En el taller» es exacto y además cabe: en su lista, el pedido que está
 * haciendo está literalmente en su mesa. Sólo se aparta del vocabulario del
 * cliente donde la frase larga no entraría — el resto se dice igual a propósito,
 * para que al teléfono con un cliente las dos pantallas usen la misma palabra.
 */
const ADMIN: Record<OrderStatus, Localized> = {
  ...CUSTOMER,
  preparando: { es: 'En el taller', gl: 'No taller' },
}

/**
 * Los dos vocabularios son funciones del idioma y no dos constantes, porque el
 * pedido se lee en la lengua de quien lo mira: el cliente en la suya —la que
 * quedó guardada en `OrderDoc.locale`, o la de la página que esté viendo— y Ana en
 * la del panel.
 */
export function orderStatusLabel(status: OrderStatus, locale: Locale): string {
  return pick(CUSTOMER[status], locale)
}

export function orderStatusAdminLabel(status: OrderStatus, locale: Locale): string {
  return pick(ADMIN[status], locale)
}

/**
 * El orden en que ocurren las cosas, y la única lista de estados del proyecto: de
 * aquí salen las pestañas del taller, las opciones del desplegable y la
 * validación de la acción que los guarda, para que no puedan discrepar entre sí.
 *
 * `cancelado` va al final y fuera de la secuencia porque no es un paso más: es la
 * salida, y puede ocurrir desde cualquier punto.
 */
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'pendiente_pago',
  'preparando',
  'enviado',
  'en_reparto',
  'entregado',
  'cancelado',
]
