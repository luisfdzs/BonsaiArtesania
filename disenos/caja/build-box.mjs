/**
 * Genera la funda de la tapa de la caja de regalo como SVG en milímetros
 * reales, sobre una hoja A4 apaisada lista para imprimir en casa.
 *
 * El anverso es el mismo que la cara A de la tarjeta —literalmente el mismo
 * código, `anverso()` de `../comun/marca.mjs`— ampliado y centrado sobre la cara
 * superior de la tapa. La proporción ayuda: la tarjeta es 85x55 (1,545) y la
 * cara de la tapa 135x90 (1,5), así que el diseño se amplía sin recomponer nada.
 *
 * Lo que **no** se hace: dibujar el logotipo otra vez. Si la marca cambia, se
 * cambia en `marca.mjs` y la tarjeta y la caja cambian juntas.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { C, amanecerDef, anverso, ANVERSO, fontFaces } from '../comun/marca.mjs'
import {
  BLEED,
  DPI,
  FLAP,
  FLAP_FOLD,
  FOLD,
  HOLGURA,
  LID_D,
  LID_L,
  LID_W,
  ORIGIN_X,
  ORIGIN_Y,
  PAGE_H,
  PAGE_W,
  PX,
  SHEET_H,
  SHEET_W,
  SIDE,
  TOP_FACE,
  VISIBLE,
} from './geometry.mjs'

const SALIDA = `${import.meta.dirname}/salida`

/**
 * Cuánto se amplía el anverso de la tarjeta.
 *
 * 1,4 deja el diseño en 119x77 mm dentro de los 135x90 que se ven de la tapa: 8 mm
 * de aire a los lados y 6,5 arriba y abajo *hasta la arista*, que con el aire que
 * el propio diseño ya trae dentro se convierten en unos 12 y 15 mm de papel limpio
 * hasta la primera tinta. Más grande empieza a tocar la arista de la tapa, que es
 * justo donde el papel se dobla y donde peor se lee.
 *
 * El aire se mide contra `VISIBLE`, no contra el panel: el panel es más grande
 * porque lleva la holgura de pliegue, y esos milímetros acaban doblados sobre el
 * costado. Contarlos como aire sería contar papel que no se ve.
 */
const SCALE = 1.4

const ART_W = ANVERSO.w * SCALE
const ART_H = ANVERSO.h * SCALE
// Centrado en el panel, que es también el centro de lo visible: la holgura va por
// igual a los cuatro lados, así que los dos centros coinciden.
const ART_X = TOP_FACE.cx - ART_W / 2
const ART_Y = TOP_FACE.cy - ART_H / 2

/**
 * El destello rosado, colocado respecto a la **cara de la tapa** y no respecto
 * al arte.
 *
 * Es un detalle con historia: escalarlo con el anverso (x1,4, anclado a su caja)
 * lo dejaba entero dentro de la cara y con el centro a media altura, y lo que se
 * veía era una mancha rosa en medio de la tapa. En la tarjeta funciona porque
 * está pegado a la esquina superior derecha del corte y más de la mitad del
 * círculo se pierde por fuera del papel: lo que se ve es sólo el borde del
 * degradado, un rubor que entra por la esquina.
 *
 * Así que lo que se traslada de la tarjeta son las *proporciones* respecto al
 * rectángulo que se ve —dónde cae el centro y cuánto mide el radio en tantos por
 * uno del ancho—, no los milímetros. El resplandor entra por la misma esquina y
 * se derrama hacia los costados, que es lo que le da continuidad a la funda
 * cuando ya está doblada.
 */
const amanecer = {
  cx: VISIBLE.x + LID_L * (75 / ANVERSO.w),
  cy: VISIBLE.y + LID_W * (3 / ANVERSO.h),
  r: LID_L * (34 / ANVERSO.w),
}

// Las 20 esquinas del desarrollo, en coordenadas de la hoja. Se nombran las seis
// verticales y las seis horizontales una sola vez y el contorno se escribe
// combinándolas, que es lo que hace que sea revisable a ojo.
const xa = ORIGIN_X
const xb = FLAP_FOLD.left
const xc = FOLD.left
const xd = FOLD.right
const xe = FLAP_FOLD.right
const xf = ORIGIN_X + SHEET_W
const ya = ORIGIN_Y
const yb = FLAP_FOLD.top
const yc = FOLD.top
const yd = FOLD.bottom
const ye = FLAP_FOLD.bottom
const yf = ORIGIN_Y + SHEET_H

/**
 * El contorno de corte: una cruz de doce lados con las cuatro orejas puestas.
 * Se recorre en el sentido de las agujas del reloj desde la esquina superior
 * izquierda de la pestaña de arriba.
 */
const outline = [
  [xc, ya],
  [xd, ya],
  [xd, yb],
  [xe, yb], // oreja superior derecha
  [xe, yc],
  [xf, yc], // pestaña derecha
  [xf, yd],
  [xe, yd],
  [xe, ye], // oreja inferior derecha
  [xd, ye],
  [xd, yf], // pestaña de abajo
  [xc, yf],
  [xc, ye],
  [xb, ye], // oreja inferior izquierda
  [xb, yd],
  [xa, yd], // pestaña izquierda
  [xa, yc],
  [xb, yc],
  [xb, yb], // oreja superior izquierda
  [xc, yb],
]

const outlinePath = `M${outline.map(([x, y]) => `${round(x)} ${round(y)}`).join('L')}Z`

/** Los dobleces. Cada uno se corta donde se acaba el papel, no donde se acaba
 *  la hoja: por eso los extremos son las constantes del contorno. */
const folds = [
  // La caja de la cara superior.
  [xc, yb, xc, ye],
  [xd, yb, xd, ye],
  [xb, yc, xe, yc],
  [xb, yd, xe, yd],
  // Donde arranca cada pestaña.
  [xb, yc, xb, yd],
  [xe, yc, xe, yd],
  [xc, yb, xd, yb],
  [xc, ye, xd, ye],
]

function round(n) {
  return Number(n.toFixed(3))
}

/**
 * La hoja. El arte va con `BLEED` mm de fondo por fuera del corte, conseguidos
 * dibujando el contorno también como trazo de `BLEED * 2` de grosor: engorda la
 * silueta por igual en todo el perímetro sin tener que calcular un segundo
 * polígono a mano.
 */
const sheet = ({ guias }) => `<svg xmlns="http://www.w3.org/2000/svg"
  width="${PX(PAGE_W)}" height="${PX(PAGE_H)}" viewBox="0 0 ${PAGE_W} ${PAGE_H}">
  <defs><style>${fontFaces}</style>
    ${amanecerDef(amanecer)}
  </defs>
  <rect width="${PAGE_W}" height="${PAGE_H}" fill="#ffffff"/>

  <!-- Fondo de la funda, con la sangre incluida en el grosor del trazo. -->
  <path d="${outlinePath}" fill="${C.linen}" stroke="${C.linen}" stroke-width="${BLEED * 2}"/>
  <path d="${outlinePath}" fill="url(#amanecer)" stroke="url(#amanecer)" stroke-width="${BLEED * 2}"/>

  <!-- El anverso de la tarjeta, ampliado y centrado en la cara superior. -->
  <g transform="translate(${round(ART_X)} ${round(ART_Y)}) scale(${SCALE})">
${anverso()}
  </g>

${guias}
</svg>`

/**
 * Guías impresas para recortar y doblar a mano.
 *
 * Van en el archivo que se imprime, no en un PDF aparte, porque el que monta la
 * caja no tiene una guillotina con topes: necesita ver por dónde cortar mientras
 * corta. Por eso son de un gris cálido finísimo y punteado —se sigue con las
 * tijeras y no compite con el diseño— y por eso la línea de corte va *sobre* el
 * corte: al cortar encima, la línea desaparece con el recorte y lo que queda en
 * el canto es la sangre.
 *
 * Los dobleces caen exactamente en la arista de la tapa, donde el papel se
 * quiebra y la línea deja de verse.
 */
const guias = `  <g fill="none" stroke-linecap="round">
    <path d="${outlinePath}" stroke="${C.barkFaint}" stroke-width="0.2" stroke-dasharray="2 1.4"/>
${folds
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
    <text x="${round(ORIGIN_X)}" y="${round(ORIGIN_Y - 8)}" font-size="3.4" letter-spacing="0.3">
      FUNDA DE TAPA · ${LID_L} × ${LID_W} × ${LID_D} mm
    </text>
    <text x="${round(ORIGIN_X + SHEET_W)}" y="${round(ORIGIN_Y - 8)}" font-size="2.6"
      text-anchor="end">Control: este lado mide ${SHEET_W} mm</text>
    <text x="${round(ORIGIN_X)}" y="${round(ORIGIN_Y - 3.4)}" font-size="2.6">
      Imprimir en A4 apaisado al 100 % (tamaño real, sin «ajustar a la página»). Al montar, centrar la tapa a ojo en el panel del medio: las rayas de doblez caen ${HOLGURA} mm por fuera de las aristas a propósito.
    </text>
    <text x="${round(ORIGIN_X)}" y="${round(ORIGIN_Y + SHEET_H + 6)}" font-size="2.6">
      Raya larga: cortar. Raya corta: doblar. Todo lleva ${HOLGURA} mm de holgura: la cara central mide ${round(TOP_FACE.w)} × ${round(TOP_FACE.h)} para que se vean ${LID_L} × ${LID_W}, y los costados ${SIDE} para un reborde de ${LID_D}.
    </text>
  </g>`

mkdirSync(SALIDA, { recursive: true })
writeFileSync(`${SALIDA}/caja-tapa.svg`, sheet({ guias }))
writeFileSync(`${SALIDA}/caja-tapa-sin-guias.svg`, sheet({ guias: '' }))

console.log(
  `SVG escritos · hoja A4 apaisada ${PAGE_W}x${PAGE_H} mm · ${PX(PAGE_W)}x${PX(PAGE_H)} px a ${DPI} ppp`,
)
console.log(
  `desarrollo ${SHEET_W}x${SHEET_H} mm centrado en ${round(ORIGIN_X)},${round(ORIGIN_Y)} mm`,
)
console.log(
  `cara superior ${LID_L}x${LID_W} mm · anverso a escala ${SCALE} → ${round(ART_W)}x${round(ART_H)} mm`,
)
