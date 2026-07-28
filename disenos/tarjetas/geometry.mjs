/**
 * Medidas de la tarjeta, en un solo sitio. El generador y el verificador leen
 * de aquí: si el QR se mueve o cambia de tamaño, la comprobación se mueve con
 * él en vez de quedarse midiendo donde ya no hay nada.
 *
 * La sangre es un parámetro y no un número repartido por el diseño porque cada
 * imprenta pide la suya: Vistaprint trabaja con 1,5 mm por lado —su lienzo es
 * de 88x58 mm— y la mayoría de las imprentas españolas piden 3 (91x61). Se
 * cambia `BLEED` y el diseño entero se recoloca solo, porque cada posición se
 * expresa como `BLEED + <distancia al corte>` en lugar de como un absoluto.
 */
export const TRIM_W = 85
export const TRIM_H = 55
export const BLEED = 1.5
export const SAFE = 3 // margen de seguridad, medido desde el corte hacia dentro
export const DPI = 600

export const CANVAS_W = TRIM_W + BLEED * 2
export const CANVAS_H = TRIM_H + BLEED * 2

/** Caja donde puede entrar cualquier cosa legible. */
export const SAFE_BOX = {
  x1: BLEED + SAFE,
  y1: BLEED + SAFE,
  x2: CANVAS_W - BLEED - SAFE,
  y2: CANVAS_H - BLEED - SAFE,
}

export const QR = {
  size: 22,
  modules: 33,
  quietZone: 3,
  /** A 8 mm del corte izquierdo, centrado en la altura de la tarjeta. */
  x: BLEED + 8,
  get y() {
    return BLEED + (TRIM_H - this.size) / 2
  },
}

export const TEXT_X = BLEED + 37
export const PX = (mm) => Math.round((mm * DPI) / 25.4)
