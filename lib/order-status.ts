import type { OrderStatus } from '@/lib/schema'

/**
 * Cómo se le cuenta al cliente el estado de su pedido. Los valores en base son
 * `snake_case` y en inglés técnico; esto es lo que se lee en pantalla.
 */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  // El estado en base se llama `pendiente_pago` y así se queda, porque es lo que
  // es. Pero en pantalla no se le puede llamar así mientras no haya pasarela: el
  // cliente no ha dejado ningún pago a medias, sólo ha pedido algo y espera que Ana
  // le escriba. «Sin confirmar» describe eso sin mentir en ninguno de los dos casos.
  pendiente_pago: 'Sin confirmar',
  pagado: 'Pagado',
  preparando: 'En el taller',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}
