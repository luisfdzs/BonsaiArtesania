/**
 * Genera las dos hojas de la funda de la base: color plano de la marca, sin
 * texto ni logotipo.
 *
 * La base es la parte que la tapa no cubre, y ahí no va diseño a propósito: lo
 * que se le pide es continuidad, no protagonismo. Repetir el logotipo en una
 * superficie que nadie mira de frente sólo consigue que se vea tres veces en la
 * misma caja.
 *
 * Comparte con la tapa el color (`marca.mjs`), la hoja y la holgura de pliegue,
 * así que si se retoca cualquiera de las tres cosas la base se mueve con ella.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { C, fontFaces } from '../comun/marca.mjs'
import { FLAP, HOLGURA } from './geometry.mjs'
import {
  BASE_D,
  BASE_H,
  BASE_W,
  BLEED,
  COSTADOS,
  DPI,
  EAR,
  FLOOR_D,
  FLOOR_W,
  FONDO,
  PAGE_H,
  PAGE_W,
  PX,
  UNDER,
  WALL,
} from './geometry-base.mjs'

const SALIDA = `${import.meta.dirname}/salida`

/**
 * El color de la base.
 *
 * Lino profundo, el fondo de la cara del QR de la tarjeta, y no el lino claro de
 * la tapa: elegido para que la tapa se lea un tono más clara que la base en vez
 * de que las dos piezas intenten ser el mismo color y fallen por poco. Dos tonos
 * de la misma familia perdonan la diferencia; dos intentos del mismo tono, no.
 */
const COLOR = C.linenDeep

const round = (n) => Number(n.toFixed(3))
const punto = ([x, y]) => `${round(x)} ${round(y)}`
const poli = (puntos) => `M${puntos.map(punto).join('L')}Z`

/**
 * Una hoja. El color va con `BLEED` mm por fuera del corte, conseguidos dibujando
 * el contorno también como trazo de `BLEED * 2` de grosor: engorda la silueta por
 * igual en todo el perímetro sin calcular un segundo polígono a mano.
 *
 * Las guías y los rótulos son los mismos que en la tapa —raya larga cortar, raya
 * corta doblar— porque las tres hojas se montan en la misma sesión y cambiar el
 * código de un folio a otro sería una trampa.
 */
const hoja = ({
  contornos,
  dobleces,
  rótulo,
  pie,
  caja,
}) => `<svg xmlns="http://www.w3.org/2000/svg"
  width="${PX(PAGE_W)}" height="${PX(PAGE_H)}" viewBox="0 0 ${PAGE_W} ${PAGE_H}">
  <defs><style>${fontFaces}</style></defs>
  <rect width="${PAGE_W}" height="${PAGE_H}" fill="#ffffff"/>

${contornos
  .map((d) => `  <path d="${d}" fill="${COLOR}" stroke="${COLOR}" stroke-width="${BLEED * 2}"/>`)
  .join('\n')}

  <g fill="none" stroke-linecap="round">
${contornos
  .map(
    (d) =>
      `    <path d="${d}" stroke="${C.barkFaint}" stroke-width="0.2" stroke-dasharray="2 1.4"/>`,
  )
  .join('\n')}
${dobleces
  .map(
    ([x1, y1, x2, y2]) =>
      `    <line x1="${round(x1)}" y1="${round(y1)}" x2="${round(x2)}" y2="${round(y2)}"
      stroke="${C.barkFaint}" stroke-width="0.18" stroke-dasharray="0.9 1.9"/>`,
  )
  .join('\n')}
  </g>

  <!-- Rótulos: caen en el margen blanco de la hoja, así que se van con el
       recorte y no llegan a la caja. -->
  <g font-family="Jost" font-weight="300" fill="${C.barkFaint}">
    <text x="${round(caja.x)}" y="${round(caja.y - 8)}" font-size="3.4" letter-spacing="0.3">${rótulo}</text>
    <text x="${round(caja.x + caja.w)}" y="${round(caja.y - 13)}" font-size="2.6"
      text-anchor="end">Control: este lado mide ${round(caja.w)} mm</text>
    <text x="${round(caja.x)}" y="${round(caja.y - 3.4)}" font-size="2.6">
      Imprimir en A4 apaisado al 100 % (tamaño real, sin «ajustar a la página»).
    </text>
    <text x="${round(caja.x)}" y="${round(caja.y + caja.h + 6)}" font-size="2.6">${pie}</text>
  </g>
</svg>`

// --- Hoja 1: el fondo y los dos costados de 82 ---------------------------
const { xa, xb, xc, xd, xe, xf, ya, yb, yc, yd } = FONDO.ejes

/**
 * El contorno: el fondo con un costado a cada lado, cada costado con su pestaña
 * y sus dos orejas, y los cuatro recortes de esquina donde no hay papel. Se
 * recorre en el sentido de las agujas del reloj desde la esquina de arriba a la
 * izquierda de la primera oreja.
 */
const contornoFondo = poli([
  [xb, ya],
  [xc, ya],
  [xc, yb], // baja al fondo: aquí no hay pared arriba
  [xd, yb],
  [xd, ya], // sube a la oreja del costado derecho
  [xe, ya],
  [xe, yb],
  [xf, yb], // pestaña derecha
  [xf, yc],
  [xe, yc],
  [xe, yd], // oreja de abajo del costado derecho
  [xd, yd],
  [xd, yc],
  [xc, yc],
  [xc, yd], // oreja de abajo del costado izquierdo
  [xb, yd],
  [xb, yc],
  [xa, yc], // pestaña izquierda
  [xa, yb],
  [xb, yb],
])

const doblecesFondo = [
  // Donde arranca cada pestaña.
  [xb, yb, xb, yc],
  [xe, yb, xe, yc],
  // Las dos aristas de abajo del fondo: aquí suben las paredes.
  [xc, yb, xc, yc],
  [xd, yb, xd, yc],
  // Las orejas, que doblan alrededor de las aristas verticales.
  [xb, yb, xc, yb],
  [xd, yb, xe, yb],
  [xb, yc, xc, yc],
  [xd, yc, xe, yc],
]

// --- Hoja 2: los otros dos costados -------------------------------------
const contornosCostados = COSTADOS.paneles.map((p) =>
  poli([
    [p.x, p.y],
    [p.x + p.w, p.y],
    [p.x + p.w, p.y + p.h],
    [p.x, p.y + p.h],
  ]),
)

const doblecesCostados = COSTADOS.paneles.flatMap((p) => [
  // Horizontales: la pestaña que va por dentro del borde de arriba y los
  // milímetros que doblan bajo el fondo.
  [p.x, p.y + FLAP, p.x + p.w, p.y + FLAP],
  [p.x, p.y + FLAP + WALL, p.x + p.w, p.y + FLAP + WALL],
  // Verticales: la holgura de cada lado, que dobla alrededor de la arista
  // vertical y cae sobre la cara de al lado.
  [p.x + HOLGURA, p.y, p.x + HOLGURA, p.y + p.h],
  [p.x + p.w - HOLGURA, p.y, p.x + p.w - HOLGURA, p.y + p.h],
])

mkdirSync(SALIDA, { recursive: true })

writeFileSync(
  `${SALIDA}/${FONDO.nombre}.svg`,
  hoja({
    contornos: [contornoFondo],
    dobleces: doblecesFondo,
    rótulo: FONDO.rótulo,
    pie: `Raya larga: cortar. Raya corta: doblar. Todo lleva ${HOLGURA} mm de holgura: el fondo mide ${FLOOR_W} × ${FLOOR_D} para una planta de ${BASE_W} × ${BASE_D}, y las paredes ${WALL} para un alto de ${BASE_H}. Centrar la caja a ojo, no por las rayas.`,
    caja: FONDO,
  }),
)

writeFileSync(
  `${SALIDA}/${COSTADOS.nombre}.svg`,
  hoja({
    contornos: contornosCostados,
    dobleces: doblecesCostados,
    rótulo: COSTADOS.rótulo,
    pie: `Dos piezas de ${COSTADOS.pw} × ${COSTADOS.ph} mm. Van ENCIMA de las orejas de la otra hoja. Los ${HOLGURA} mm de cada lado doblan alrededor de la arista vertical; los ${UNDER} de abajo, bajo el fondo.`,
    caja: COSTADOS,
  }),
)

console.log(
  `SVG escritos · hoja A4 apaisada ${PAGE_W}x${PAGE_H} mm · ${PX(PAGE_W)}x${PX(PAGE_H)} px a ${DPI} ppp`,
)
console.log(
  `base acabada ${BASE_W}x${BASE_D}x${BASE_H} mm · pared en papel ${WALL} mm (${BASE_H} + ${HOLGURA})`,
)
console.log(`hoja 1 (fondo)    ${FONDO.w}x${FONDO.h} mm en ${round(FONDO.x)},${round(FONDO.y)}`)
console.log(
  `hoja 2 (costados) 2 × ${COSTADOS.pw}x${COSTADOS.ph} mm, conjunto ${COSTADOS.w}x${COSTADOS.h} en ${round(COSTADOS.x)},${round(COSTADOS.y)}`,
)
