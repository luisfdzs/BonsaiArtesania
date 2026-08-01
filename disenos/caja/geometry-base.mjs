/**
 * Medidas de la funda de la base de la caja — la parte de abajo, la que la tapa
 * no cubre.
 *
 * La base **acabada** mide 85 mm de ancho, 82 de fondo y 63 de alto. Igual que en
 * la tapa, ésas son las medidas de la caja tal como está encima de la mesa: todo
 * lo que el papel necesita para envolverla —costados, orejas y pestañas— se añade
 * a mayores a partir de aquí, con la misma holgura de pliegue.
 *
 * Aquí no hay diseño, sólo color: es lino profundo plano de borde a borde, para
 * dar continuidad con la tapa sin repetir el logotipo en algo que no se mira de
 * frente.
 *
 * **Van dos hojas**, y no por capricho: el desarrollo de una sola pieza mediría
 * 241x232 mm y en una A4 no cabe ni apaisado. Se parte por dos de las cuatro
 * aristas verticales, que es exactamente donde una funda lleva costura de todas
 * formas:
 *
 *   HOJA 1 · el fondo y los dos costados de 82
 *
 *        ┌────┬───────────┬────┐
 *     ┌──┤    │           │    ├──┐        ← pestañas ↕ y orejas
 *     │  │ C  │   FONDO   │ C  │  │
 *     └──┤    │           │    ├──┘
 *        └────┴───────────┴────┘
 *
 *   HOJA 2 · los otros dos costados, sueltos
 *
 *        ┌───────┐   ┌───────┐
 *        │   C   │   │   C   │
 *        └───────┘   └───────┘
 *
 * Las **orejas** de la hoja 1 doblan alrededor de las cuatro aristas verticales y
 * quedan **por debajo** de los costados de la hoja 2. Es el orden que importa: al
 * ir tapadas, si un costado de la hoja 2 se corta un pelo estrecho lo que asoma
 * por la rendija es la oreja, del mismo color, y no el cartón. Al contrario
 * —oreja por encima— se vería el solape.
 */
import { BLEED, DPI, PAGE_H, PAGE_W, PX, centrar } from './geometry-hoja.mjs'
import { FLAP, HOLGURA } from './geometry.mjs'

export { BLEED, DPI, PAGE_H, PAGE_W, PX }

/** Base acabada: ancho y fondo de la planta, y alto de la pared. */
export const BASE_W = 85
export const BASE_D = 82
export const BASE_H = 63

/**
 * La pared en el papel: el alto de la caja más la misma holgura de pliegue que
 * lleva la tapa (`HOLGURA` en `geometry.mjs`, un solo número para las dos
 * piezas). Sin ella el panel llega justo a la arista y al doblarlo se queda
 * corto.
 */
export const WALL = BASE_H + HOLGURA

/**
 * El fondo en el papel: la planta de la caja más holgura por los cuatro lados,
 * por lo mismo que la cara superior de la tapa. Un panel a la medida exacta de la
 * planta obliga a centrar la caja al milímetro, y a mano no se centra: se queda
 * corto por un lado y asoma el cartón.
 */
export const FLOOR_W = BASE_W + HOLGURA * 2
export const FLOOR_D = BASE_D + HOLGURA * 2

/** La oreja que dobla alrededor de la arista vertical. */
export const EAR = 12

/**
 * Lo que el costado de la hoja 2 se prolonga **por debajo** del fondo.
 *
 * Sólo lo llevan esos dos costados, y es lo que garantiza que el canto de abajo
 * quede cubierto: el resto de la funda ya llega ahí sin costura, porque el fondo
 * y sus dos costados salen de una sola pieza.
 */
export const UNDER = 8

// --- Hoja 1: el fondo y los dos costados de 82 ---------------------------
export const FONDO = (() => {
  const w = FLAP + WALL + FLOOR_W + WALL + FLAP
  const h = EAR + FLOOR_D + EAR
  const o = centrar(w, h)
  return {
    nombre: 'caja-base-fondo',
    rótulo: `BASE · FONDO Y DOS COSTADOS · caja de ${BASE_W} × ${BASE_D} × ${BASE_H} mm`,
    w,
    h,
    x: o.x,
    y: o.y,
    /** Las seis verticales y las cuatro horizontales del desarrollo. */
    get ejes() {
      return {
        xa: this.x,
        xb: this.x + FLAP,
        xc: this.x + FLAP + WALL,
        xd: this.x + FLAP + WALL + FLOOR_W,
        xe: this.x + FLAP + WALL + FLOOR_W + WALL,
        xf: this.x + w,
        ya: this.y,
        yb: this.y + EAR,
        yc: this.y + EAR + FLOOR_D,
        yd: this.y + h,
      }
    },
  }
})()

// --- Hoja 2: los otros dos costados -------------------------------------
/** Hueco entre los dos costados. Sólo es para que quepan las tijeras. */
const GAP = 20

export const COSTADOS = (() => {
  // Tan anchos como el fondo, no como la cara: los `HOLGURA` mm de cada lado
  // doblan alrededor de la arista vertical y caen sobre la cara de al lado, por
  // encima de las orejas de la otra hoja. Cortados a los 85 justos habría que
  // acertar la arista al milímetro para que no quedara una rendija.
  const pw = FLOOR_W
  const ph = FLAP + WALL + UNDER
  const w = pw * 2 + GAP
  const o = centrar(w, ph)
  return {
    nombre: 'caja-base-costados',
    rótulo: `BASE · LOS OTROS DOS COSTADOS · caja de ${BASE_W} × ${BASE_D} × ${BASE_H} mm`,
    w,
    h: ph,
    x: o.x,
    y: o.y,
    pw,
    ph,
    /** Los dos paneles, ya colocados en la hoja. */
    get paneles() {
      return [0, 1].map((i) => ({ x: this.x + i * (pw + GAP), y: this.y, w: pw, h: ph }))
    },
  }
})()

/**
 * Qué medir en cada archivo rasterizado. Mismo formato que en la tapa: `verify.mjs`
 * barre píxeles dentro de una ventana y comprueba dónde empieza y dónde acaba el
 * fondo impreso.
 */
export const MEDIDAS_FONDO = [
  {
    qué: `ancho (pestaña ${FLAP} + pared ${WALL} + fondo ${FLOOR_W} + pared ${WALL} + pestaña ${FLAP})`,
    eje: 'x',
    at: FONDO.y + EAR + BASE_D / 2,
    ventana: [0, PAGE_W],
    desde: FONDO.x - BLEED,
    hasta: FONDO.x + FONDO.w + BLEED,
  },
  {
    qué: `alto por el costado (oreja ${EAR} + fondo ${FLOOR_D} + oreja ${EAR})`,
    eje: 'y',
    at: FONDO.x + FLAP + WALL / 2,
    ventana: [0, PAGE_H],
    desde: FONDO.y - BLEED,
    hasta: FONDO.y + FONDO.h + BLEED,
  },
  {
    // Esta mide por el centro del fondo, donde NO hay orejas: comprueba que los
    // cuatro recortes de esquina están de verdad recortados y no rellenos.
    qué: `alto por el fondo, sin orejas (${FLOOR_D})`,
    eje: 'y',
    at: FONDO.x + FLAP + WALL + FLOOR_W / 2,
    ventana: [0, PAGE_H],
    desde: FONDO.y + EAR - BLEED,
    hasta: FONDO.y + EAR + FLOOR_D + BLEED,
  },
]

export const MEDIDAS_COSTADOS = COSTADOS.paneles.flatMap((p, i) => [
  {
    qué: `costado ${i + 1}: ancho (${FLOOR_W})`,
    eje: 'x',
    at: p.y + p.h / 2,
    // La ventana se cierra a 9 mm de cada lado del panel para no alcanzar el
    // otro costado, que está a 20.
    ventana: [p.x - 9, p.x + p.w + 9],
    desde: p.x - BLEED,
    hasta: p.x + p.w + BLEED,
  },
  {
    qué: `costado ${i + 1}: alto (pestaña ${FLAP} + pared ${WALL} + bajo el fondo ${UNDER})`,
    eje: 'y',
    at: p.x + p.w / 2,
    ventana: [0, PAGE_H],
    desde: p.y - BLEED,
    hasta: p.y + p.h + BLEED,
  },
])
