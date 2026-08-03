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
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  // El estado en base se llama `pendiente_pago` y así se queda, porque es lo que
  // es. Pero en pantalla no se le puede llamar así mientras no haya pasarela: el
  // cliente no ha dejado ningún pago a medias, sólo ha pedido algo y espera que Ana
  // le escriba. «Sin confirmar» describe eso sin mentir en ninguno de los dos casos.
  //
  // No hay «Pagado» entre medias. Mientras el cobro sea un placeholder no
  // significaba nada —ningún pedido llegaba ahí solo—, y para Ana era un paso
  // más que marcar a mano entre confirmar el pedido y ponerse con él. El pago
  // sí se sigue guardando, pero en `payment.status`, que es su sitio: es un
  // dato del cobro, no una etapa del viaje del pedido.
  pendiente_pago: 'Sin confirmar',
  preparando: 'Ana está creando tus joyas bonsái',
  enviado: 'En tránsito',
  en_reparto: 'En reparto',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

/**
 * Lo que ve Ana en el taller. Lo mismo, en corto.
 *
 * Aquí «En el taller» es exacto y además cabe: en su lista, el pedido que está
 * haciendo está literalmente en su mesa. Sólo se aparta del vocabulario del
 * cliente donde la frase larga no entraría — el resto se dice igual a propósito,
 * para que al teléfono con un cliente las dos pantallas usen la misma palabra.
 */
export const ORDER_STATUS_ADMIN_LABEL: Record<OrderStatus, string> = {
  ...ORDER_STATUS_LABEL,
  preparando: 'En el taller',
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
