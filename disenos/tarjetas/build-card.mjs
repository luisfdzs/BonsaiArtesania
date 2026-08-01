/**
 * Genera las dos caras de la tarjeta como SVG en milímetros reales.
 *
 * Medidas de imprenta: 85x55 mm de corte, 3 mm de sangre por lado (91x61 mm de
 * lienzo) y 3 mm más de margen de seguridad, así que nada legible entra en los
 * 6 mm exteriores del lienzo. Con esas cuentas el archivo vale igual si la
 * imprenta pide 2 mm de sangre en vez de 3: lo que se recorta de más sigue
 * siendo fondo.
 *
 * El anverso, los colores y las tipografías salen de `../comun/marca.mjs`, que
 * es también de donde los lee la funda de la caja de regalo: la misma marca
 * dibujada una sola vez.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { qrMatrix, qrPath } from './qr.mjs'
import { BLEED, CANVAS_W, CANVAS_H, DPI, PX, QR, TEXT_X } from './geometry.mjs'
import {
  C,
  EMAIL,
  INSTAGRAM,
  URL,
  WHATSAPP,
  amanecerDef,
  anverso,
  brandIcon,
  fontFaces,
} from '../comun/marca.mjs'

const DIR = import.meta.dirname
const SALIDA = `${DIR}/salida`

const W = CANVAS_W
const H = CANVAS_H
/** Todas las posiciones se cuentan desde el corte: `B + 8` es «a 8 mm del
 *  borde de la tarjeta», y sigue significando eso si cambia la sangre. */
const B = BLEED

/**
 * Una línea de contacto: logotipo y texto alineados por el centro óptico. El
 * icono se baja un pelo respecto a la línea base porque un cuadrado de 24x24
 * junto a una minúscula se ve alto si se alinean por arriba.
 */
const contactLine = (file, text, { y, size = 2.85, icon = 3.1 }) =>
  `${brandIcon(file, TEXT_X, y - icon + 0.55, icon, C.bark)}
  <text x="${TEXT_X + icon + 1.7}" y="${y}" font-family="Jost" font-weight="300" font-size="${size}"
    fill="${C.barkSoft}">${text}</text>`

const doc = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${PX(W)}" height="${PX(H)}" viewBox="0 0 ${W} ${H}">
  <defs><style>${fontFaces}</style>
    ${amanecerDef({ cx: B + 75, cy: B + 3, r: 34 })}
  </defs>
${body}
</svg>`

// --- Cara A --------------------------------------------------------------
// El anverso de la marca a tamaño 1:1, desplazado por la sangre para que quede
// centrado en el corte.
const front = doc(`  <rect width="${W}" height="${H}" fill="${C.linen}"/>
  <rect width="${W}" height="${H}" fill="url(#amanecer)"/>
  <g transform="translate(${B} ${B})">
${anverso()}
  </g>`)

// --- Cara B --------------------------------------------------------------
// El QR es el motivo de la tarjeta, así que manda en la composición: ocupa el
// alto útil y el texto se le pone al lado, no encima.
//
// La columna entera cuelga de `URL_Y`, y las demás líneas se cuentan desde ahí.
// Es a propósito: lo que hay que dejar cuadrado es la *tinta* del bloque —no sus
// líneas base—, y la tinta no se puede calcular a mano porque depende de los
// ascendentes de cada tipografía. Así que `URL_Y` se ajusta midiendo el PNG ya
// rasterizado hasta que el centro de la tinta cae en el centro de la tarjeta, y
// el QR va centrado en la tarjeta también (`QR_DROP` a 0). Con los dos centrados
// en el mismo eje, el aire de arriba y el de abajo salen iguales solos.
//
// Si se añade o se quita una línea, hay que volver a medir y mover `URL_Y`.
const ROW = 5.6
const URL_Y = B + 18.92
const LINE_Y = URL_Y + 3.6
const IG_Y = URL_Y + 3.6 + ROW
const EMAIL_Y = IG_Y + ROW
const WHATSAPP_Y = EMAIL_Y + ROW

const { grid, maskIndex } = qrMatrix(`https://${URL}`)
const QR_SIZE = QR.size
const QR_X = QR.x
const QR_Y = QR.y
const QUIET = QR.quietZone

const back = doc(`  <rect width="${W}" height="${H}" fill="${C.linenDeep}"/>

  <!-- Zona de silencio explícita en lino claro: el QR gana contraste y el
       lector no tiene que adivinar dónde acaba el código. -->
  <rect x="${QR_X - QUIET}" y="${QR_Y - QUIET}" width="${QR_SIZE + QUIET * 2}" height="${QR_SIZE + QUIET * 2}"
    rx="1.6" fill="${C.linen}"/>
  <path d="${qrPath(grid, { size: QR_SIZE, x: QR_X, y: QR_Y })}" fill="${C.bark}"/>

  <text x="${TEXT_X}" y="${URL_Y}" font-family="Cormorant Garamond" font-weight="400" font-size="5.1"
    fill="${C.bark}">${URL}</text>

  <line x1="${TEXT_X}" y1="${LINE_Y}" x2="${TEXT_X + 20}" y2="${LINE_Y}" stroke="${C.line}" stroke-width="0.28"/>

  ${contactLine('instagram.svg', INSTAGRAM, { y: IG_Y })}

  ${contactLine('gmail.svg', EMAIL, { y: EMAIL_Y })}

  ${contactLine('whatsapp.svg', WHATSAPP, { y: WHATSAPP_Y })}`)

mkdirSync(SALIDA, { recursive: true })
writeFileSync(`${SALIDA}/tarjeta-cara-a.svg`, front)
writeFileSync(`${SALIDA}/tarjeta-cara-b.svg`, back)
console.log(`SVG escritos · lienzo ${W}x${H} mm · ${PX(W)}x${PX(H)} px a ${DPI} ppp`)
console.log(
  `QR: ${QR.modules}x${QR.modules} módulos en ${QR_SIZE} mm → ${(QR_SIZE / QR.modules).toFixed(3)} mm por módulo · máscara ${maskIndex}`,
)
