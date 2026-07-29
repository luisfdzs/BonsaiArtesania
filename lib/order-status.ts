import type { OrderStatus } from '@/lib/schema'

/**
 * Cómo se le cuenta al cliente el estado de su pedido. Los valores en base son
 * `snake_case` y en inglés técnico; esto es lo que se lee en pantalla.
 */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pendiente_pago: 'Pendiente de pago',
  pagado: 'Pagado',
  preparando: 'En el taller',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}
