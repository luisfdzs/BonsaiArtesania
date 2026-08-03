/**
 * Cifras de envío que quedan guardadas con cada petición.
 *
 * PENDIENTE (Ana): son una propuesta, igual que las del catálogo. Están calculadas
 * sobre una carta certificada nacional, que es lo que pesan estas piezas; hay que
 * confirmarlas.
 *
 * No se publican en ninguna parte: viven aquí, en céntimos, y sólo entran en el
 * documento que se archiva. Ver `lib/cart.ts`.
 */

/** Envío estándar a España. */
export const SHIPPING_CENTS = 495

/** Desde esta cifra el envío queda a cero. */
export const FREE_SHIPPING_FROM_CENTS = 6000

export function shippingCostCents(subtotalCents: number): number {
  if (subtotalCents === 0) return 0
  return subtotalCents >= FREE_SHIPPING_FROM_CENTS ? 0 : SHIPPING_CENTS
}
