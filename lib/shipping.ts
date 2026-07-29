/**
 * Coste de envío.
 *
 * PENDIENTE (Ana): estas cifras son una propuesta, igual que los precios del
 * catálogo. Son piezas pequeñas y ligeras, así que están calculadas sobre una
 * carta certificada nacional; hay que confirmarlas antes de vender de verdad.
 *
 * Vive aparte y en céntimos para que cambiar la tarifa sea editar dos números y
 * no buscar importes repartidos por el checkout.
 */

/** Envío estándar a España. */
export const SHIPPING_CENTS = 495

/** A partir de este importe el envío no se cobra. */
export const FREE_SHIPPING_FROM_CENTS = 6000

export function shippingCostCents(subtotalCents: number): number {
  if (subtotalCents === 0) return 0
  return subtotalCents >= FREE_SHIPPING_FROM_CENTS ? 0 : SHIPPING_CENTS
}

/** Cuánto falta para el envío gratis, o null si ya lo tiene. */
export function missingForFreeShippingCents(subtotalCents: number): number | null {
  if (subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_FROM_CENTS) return null
  return FREE_SHIPPING_FROM_CENTS - subtotalCents
}
