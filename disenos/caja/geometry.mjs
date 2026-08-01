/**
 * Medidas de la funda de la tapa, en un solo sitio.
 *
 * La tapa **acabada** mide 135 mm de largo, 90 de ancho y 22 de profundidad. La
 * funda es una sola pieza de papel que se recorta, se dobla y la envuelve: la
 * cara superior en el centro, los cuatro costados alrededor y unas pestañas que
 * se meten por dentro del borde para que no haga falta pegar nada por fuera.
 *
 * El desarrollo, visto en plano (cotas en mm):
 *
 *        ┌─────────────┐                        ← pestaña de arriba
 *     ┌──┼─────────────┼──┐                     ← costado de arriba + orejas
 *  ┌──┼──┼─────────────┼──┼──┐
 *  │  │  │  CARA       │  │  │                  ← pestañas y costados laterales
 *  │  │  │  SUPERIOR   │  │  │
 *  └──┼──┼─────────────┼──┼──┘
 *     └──┼─────────────┼──┘
 *        └─────────────┘
 *
 * Las **orejas** son los cuadrados de esquina: cuelgan de los costados
 * izquierdo y derecho, doblan alrededor de la esquina y se pegan por detrás del
 * costado de arriba o de abajo. Son lo que evita que se vea el cartón crudo en
 * las cuatro esquinas de la tapa; sin ellas la funda queda con cuatro cortes
 * abiertos justo en lo primero que se mira.
 *
 * Todo se expresa como suma de estas constantes en lugar de como números
 * absolutos, así que para otra caja basta cambiarlas y el desarrollo entero se
 * recoloca solo — incluido el arte, que se centra sobre la cara superior.
 */
import { BLEED, DPI, PAGE_H, PAGE_W, PX, centrar } from './geometry-hoja.mjs'

// La tapa comparte con la base el papel, la resolución y la sangre. Se
// reexportan para que quien dibuja la tapa no tenga que saber de dónde salen.
export { BLEED, DPI, PAGE_H, PAGE_W, PX }

/**
 * Tapa acabada: largo, ancho y profundidad. **Sin contar los pliegues** — son
 * las medidas de la tapa tal como está encima de la mesa, y todo lo que el papel
 * necesita para envolverla se añade a mayores a partir de aquí.
 */
export const LID_L = 135
export const LID_W = 90
export const LID_D = 22

/**
 * Holgura de pliegue: los milímetros que se le suman **a cada panel, por cada
 * lado**, por encima de la medida de la tapa.
 *
 * Un pliegue no es una arista de radio cero. El papel que baja por el costado
 * tiene que dar antes la vuelta al canto del cartón —un par de milímetros de
 * grosor— y luego volver a doblar por el borde de abajo del reborde para meterse
 * dentro; cada una de esas dos curvas se come papel. Un panel a la medida exacta
 * llega justo al borde y ni un pelo más: en cuanto se dobla se queda corto y
 * asoma el cartón.
 *
 * Este número ha ido a peor dos veces antes de quedarse así, y las dos por la
 * misma razón: sobraba criterio y faltaba papel.
 *
 *   1. Los costados a 22 mm clavados. Se quedaban en el borde justo del reborde.
 *   2. Los costados a 22 + 3 pero **la cara superior a 135 x 90 exactos**, con el
 *      argumento de que los cuatro dobleces tenían que caer en las cuatro
 *      aristas de arriba de la tapa. El argumento es bonito y es falso: si el
 *      panel mide lo mismo que la cara, colocar la tapa un milímetro descentrada
 *      —y a mano se descentra— deja **menos** de 135 x 90 cubiertos y el cartón
 *      asomando por una arista. La medida de la tapa es lo que tiene que quedar
 *      visible, no lo que tiene que medir el papel.
 *
 * Así que ahora la holgura la llevan todos los paneles, la cara superior
 * incluida: el papel es más grande que la tapa por todos lados y los dobleces
 * caen un poco por debajo de las aristas, tapándolas. Sobra papel, y lo que sobra
 * acaba por dentro de la tapa, donde no se ve. Si con este cartón todavía queda
 * justo, se sube este número y las tres hojas se recolocan solas.
 */
export const HOLGURA = 4

/** Lo que mide de verdad cada panel de costado en el papel. */
export const SIDE = LID_D + HOLGURA

/**
 * La cara superior **en el papel**: la cara de la tapa más la holgura por los
 * cuatro lados. Los `HOLGURA` mm de sobra de cada borde dan la vuelta a la arista
 * y bajan un poco por el costado, que es lo que garantiza que arriba queden
 * cubiertos los 135 x 90 enteros.
 */
export const FACE_W = LID_L + HOLGURA * 2
export const FACE_H = LID_W + HOLGURA * 2

/**
 * Cuánto se mete la pestaña por dentro del borde de la tapa, contada desde donde
 * acaba el costado.
 *
 * A 12 y no a los 22 de la profundidad a propósito: la tapa encaja *sobre* la
 * base, y el papel doblado hacia dentro le roba hueco. Con 12 mm agarra de sobra
 * y todavía deja rebaje libre. Si aun así la tapa entra a presión, se recortan
 * las pestañas más cortas; el resto del diseño no cambia.
 */
export const FLAP = 12

/** El desarrollo completo, sin contar la sangre. */
export const SHEET_W = FLAP + SIDE + FACE_W + SIDE + FLAP
export const SHEET_H = FLAP + SIDE + FACE_H + SIDE + FLAP

/** Esquina superior izquierda del desarrollo dentro de la hoja: centrado. */
const origen = centrar(SHEET_W, SHEET_H)
export const ORIGIN_X = origen.x
export const ORIGIN_Y = origen.y

/**
 * Las cuatro líneas de doblez que enmarcan la cara superior, en coordenadas de
 * la hoja. Todo lo demás se deduce de aquí.
 */
export const FOLD = {
  left: ORIGIN_X + FLAP + SIDE,
  right: ORIGIN_X + FLAP + SIDE + FACE_W,
  top: ORIGIN_Y + FLAP + SIDE,
  bottom: ORIGIN_Y + FLAP + SIDE + FACE_H,
}

/**
 * El panel de la cara superior, en la hoja. Mide `FACE_W`x`FACE_H` —la cara de la
 * tapa más holgura— y de él sólo se ven los 135x90 del centro; el resto da la
 * vuelta a las aristas.
 */
export const TOP_FACE = {
  x: FOLD.left,
  y: FOLD.top,
  w: FACE_W,
  h: FACE_H,
  get cx() {
    return this.x + this.w / 2
  },
  get cy() {
    return this.y + this.h / 2
  },
}

/**
 * Lo que de verdad se ve de la tapa una vez envuelta: los 135x90 centrados en el
 * panel. Es la referencia contra la que se encuadra el diseño —el aire alrededor
 * del logotipo se mide contra esto, no contra el panel—, porque el papel que
 * sobra por los bordes acaba doblado sobre el costado y no cuenta como aire.
 */
export const VISIBLE = {
  w: LID_L,
  h: LID_W,
  get x() {
    return TOP_FACE.cx - LID_L / 2
  },
  get y() {
    return TOP_FACE.cy - LID_W / 2
  },
}

/** Los dos dobleces exteriores, donde empiezan las pestañas. */
export const FLAP_FOLD = {
  left: ORIGIN_X + FLAP,
  right: ORIGIN_X + SHEET_W - FLAP,
  top: ORIGIN_Y + FLAP,
  bottom: ORIGIN_Y + SHEET_H - FLAP,
}

/**
 * Qué medir en el PNG y el PDF ya rasterizados para saber que la escala cuadra.
 * Lo consume `verify.mjs`, que barre píxeles reales dentro de una ventana y
 * comprueba dónde empieza y dónde acaba el fondo impreso.
 */
export const MEDIDAS = [
  {
    qué: `ancho del desarrollo (pestaña ${FLAP} + costado ${SIDE} + cara ${FACE_W} + costado ${SIDE} + pestaña ${FLAP})`,
    eje: 'x',
    at: ORIGIN_Y + SHEET_H / 2,
    ventana: [0, PAGE_W],
    desde: ORIGIN_X - BLEED,
    hasta: ORIGIN_X + SHEET_W + BLEED,
  },
  {
    qué: `alto del desarrollo (pestaña ${FLAP} + costado ${SIDE} + cara ${FACE_H} + costado ${SIDE} + pestaña ${FLAP})`,
    eje: 'y',
    at: ORIGIN_X + SHEET_W / 2,
    ventana: [0, PAGE_H],
    desde: ORIGIN_Y - BLEED,
    hasta: ORIGIN_Y + SHEET_H + BLEED,
  },
]
