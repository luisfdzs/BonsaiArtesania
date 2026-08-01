/**
 * Lo que comparten todas las piezas de la caja: el papel de la impresora, la
 * resolución y la sangre.
 *
 * Está separado de la geometría de cada pieza porque la tapa y la base son dos
 * desarrollos distintos que se imprimen igual, y si cada uno llevara su propia
 * copia de «A4 apaisada a 400 ppp» acabarían discrepando en algún cambio.
 */

/**
 * Papel de la impresora. A4 **apaisada** en todas las piezas: los desarrollos
 * son anchos y bajos (235x106 la base, 203x158 la tapa) y de pie no cabrían.
 */
export const PAGE_W = 297
export const PAGE_H = 210

/**
 * Resolución de salida. 400 y no los 600 de la tarjeta por dos razones: una A4
 * entera a 600 ppp son 7016x4961 px —35 megapíxeles que el `canvas` del
 * navegador que rasteriza tiene que sostener y volcar a base64 de una vez— y
 * aquí no hay nada del tamaño de un módulo de QR que lo justifique: la letra más
 * pequeña de la funda mide 3 mm. A 400 ppp sigue estando por encima de los 300
 * que pide cualquier imprenta y el archivo pesa la tercera parte.
 */
export const DPI = 400

/**
 * Sangre: cuánto se extiende el fondo por fuera de la línea de corte.
 *
 * Esto se recorta a mano con tijeras, no con una guillotina, así que 2 mm de
 * fondo de más son los que perdonan un corte torcido. Sin ellos, cada temblor
 * deja una raya blanca de papel crudo en el canto.
 */
export const BLEED = 2

export const PX = (mm) => Math.round((mm * DPI) / 25.4)

/** Esquina superior izquierda para dejar un desarrollo de `w`x`h` centrado. */
export const centrar = (w, h) => ({ x: (PAGE_W - w) / 2, y: (PAGE_H - h) / 2 })
