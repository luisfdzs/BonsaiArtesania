/**
 * Genera las dos caras de la tarjeta como SVG en milímetros reales.
 *
 * Medidas de imprenta: 85x55 mm de corte, 3 mm de sangre por lado (91x61 mm de
 * lienzo) y 3 mm más de margen de seguridad, así que nada legible entra en los
 * 6 mm exteriores del lienzo. Con esas cuentas el archivo vale igual si la
 * imprenta pide 2 mm de sangre en vez de 3: lo que se recorta de más sigue
 * siendo fondo.
 *
 * Los colores y las tipografías se toman del sistema del sitio (app/globals.css
 * y app/layout.tsx) — es la misma marca, no una versión parecida.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { qrMatrix, qrPath } from './qr.mjs'
import { BLEED, CANVAS_W, CANVAS_H, DPI, PX, QR, TEXT_X } from './geometry.mjs'

const DIR = import.meta.dirname
const SALIDA = `${DIR}/salida`
const ICONS = `${DIR}/../../public/icons`

// Copia propia del subconjunto latino de las dos fuentes del sitio. Se guardan
// aquí y no se leen de `.next/static/media` a propósito: allí el nombre lleva un
// hash de compilación y cambia en cada build, así que el generador se rompería
// solo. Si algún día cambian las fuentes de la web, se reemplazan estos dos
// archivos.
const FONTS = {
  cormorant: 'fuentes/cormorant-garamond-latin.woff2',
  jost: 'fuentes/jost-latin.woff2',
}

const C = {
  linen: '#faf7f2',
  linenDeep: '#f1ebe1',
  bark: '#2c2823',
  barkSoft: '#6e675c',
  barkFaint: '#a79f91',
  line: '#e4dccf',
  sage: '#93a188',
  petalSoft: '#f3e5e0',
}

const URL = 'bonsaiartesania.com'
const INSTAGRAM = '@san.bonsai_'
/** El mismo buzón que `content/site.ts`: el papel y la web dicen lo mismo. */
const EMAIL = 'bonsai@bonsaiartesania.com'
const W = CANVAS_W
const H = CANVAS_H
/** Todas las posiciones se cuentan desde el corte: `B + 8` es «a 8 mm del
 *  borde de la tarjeta», y sigue significando eso si cambia la sangre. */
const B = BLEED

const b64 = (file) => readFileSync(`${DIR}/${file}`).toString('base64')

const fontFaces = `
    @font-face {
      font-family: 'Cormorant Garamond';
      font-weight: 300 500;
      src: url(data:font/woff2;base64,${b64(FONTS.cormorant)}) format('woff2');
    }
    @font-face {
      font-family: 'Jost';
      font-weight: 100 900;
      src: url(data:font/woff2;base64,${b64(FONTS.jost)}) format('woff2');
    }`

/** El arco con el bonsái del logotipo, tal cual está en components/layout/Wordmark.tsx.
 *  El trazo se engorda un poco: a 12 mm de alto, 1.1 de un viewBox de 40 sale
 *  demasiado fino para tinta sobre papel. */
const wordmarkArch = (x, y, height, color) => {
  const scale = height / 40
  const stroke = 1.5
  return `<g transform="translate(${x} ${y}) scale(${scale.toFixed(5)})" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round">
      <path d="M1 39V16a15 15 0 0 1 30 0v23"/>
      <path d="M16 33V20"/>
      <path d="M16 24c-3.5 0-5.5-1.5-7-3.5M16 21c3 0 5-1 6.5-2.5"/>
      <ellipse cx="10" cy="15" rx="6" ry="3.4"/>
      <ellipse cx="22" cy="11" rx="5.5" ry="3.2"/>
      <path d="M9 33h14"/>
    </g>`
}

/**
 * Los logotipos de marca se leen de `public/icons/`, los mismos archivos que usa
 * la web: un solo sitio donde vive cada trazado. Son de Simple Icons, en un
 * viewBox de 24, así que sólo hay que escalarlos al alto que toque.
 */
const brandIcon = (file, x, y, size, color) => {
  const svg = readFileSync(`${ICONS}/${file}`, 'utf8')
  const d = svg.match(/\sd="([^"]+)"/)?.[1]
  if (!d) throw new Error(`sin trazado en ${file}`)
  const scale = size / 24
  return `<g transform="translate(${x} ${y}) scale(${scale.toFixed(5)})"><path d="${d}" fill="${color}"/></g>`
}

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
    <radialGradient id="amanecer" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
      gradientTransform="translate(${B + 75} ${B + 3}) scale(34)">
      <stop offset="0" stop-color="${C.petalSoft}"/>
      <stop offset="0.65" stop-color="${C.petalSoft}" stop-opacity="0"/>
    </radialGradient>
  </defs>
${body}
</svg>`

// --- Cara A --------------------------------------------------------------
// El logotipo centrado y aire alrededor: la marca ya dice que la mitad del
// mensaje es el aire, y una tarjeta llena de datos la contradice.
const ARCH_H = 13
const ARCH_X = B + 24.4
const ARCH_Y = B + 11.5
const front = doc(`  <rect width="${W}" height="${H}" fill="${C.linen}"/>
  <rect width="${W}" height="${H}" fill="url(#amanecer)"/>
${wordmarkArch(ARCH_X, ARCH_Y, ARCH_H, C.bark)}
  <text x="${ARCH_X + 12.2}" y="${ARCH_Y + 6.6}" font-family="Cormorant Garamond" font-weight="400"
    font-size="7.4" fill="${C.bark}" letter-spacing="0.12">Bonsái</text>
  <text x="${ARCH_X + 12.6}" y="${ARCH_Y + 11.2}" font-family="Jost" font-weight="300"
    font-size="2.35" fill="${C.barkSoft}" letter-spacing="0.98">ARTESANÍA</text>

  <text x="${W / 2}" y="${B + 35.6}" text-anchor="middle" font-family="Cormorant Garamond" font-weight="300"
    font-size="4.1" fill="${C.barkSoft}">Joyas y piezas únicas en resina y flor natural</text>

  <line x1="${W / 2 - 6}" y1="${B + 41.4}" x2="${W / 2 + 6}" y2="${B + 41.4}" stroke="${C.sage}" stroke-width="0.28"/>

  <text x="${W / 2}" y="${B + 47.2}" text-anchor="middle" font-family="Jost" font-weight="300"
    font-size="2.3" fill="${C.barkFaint}" letter-spacing="0.41">HECHO A MANO EN GALICIA</text>`)

// --- Cara B --------------------------------------------------------------
// El QR es el motivo de la tarjeta, así que manda en la composición: ocupa el
// alto útil y el texto se le pone al lado, no encima.
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

  <text x="${TEXT_X}" y="${B + 17.4}" font-family="Jost" font-weight="300" font-size="2.3"
    fill="${C.barkFaint}" letter-spacing="0.41">ESCANEA Y MÍRALAS</text>

  <text x="${TEXT_X}" y="${B + 25.8}" font-family="Cormorant Garamond" font-weight="400" font-size="5.1"
    fill="${C.bark}">${URL}</text>

  <line x1="${TEXT_X}" y1="${B + 29.4}" x2="${TEXT_X + 20}" y2="${B + 29.4}" stroke="${C.line}" stroke-width="0.28"/>

  ${contactLine('instagram.svg', INSTAGRAM, { y: B + 35 })}

  ${contactLine('gmail.svg', EMAIL, { y: B + 40.6 })}`)

mkdirSync(SALIDA, { recursive: true })
writeFileSync(`${SALIDA}/tarjeta-cara-a.svg`, front)
writeFileSync(`${SALIDA}/tarjeta-cara-b.svg`, back)
console.log(`SVG escritos · lienzo ${W}x${H} mm · ${PX(W)}x${PX(H)} px a ${DPI} ppp`)
console.log(
  `QR: ${QR.modules}x${QR.modules} módulos en ${QR_SIZE} mm → ${(QR_SIZE / QR.modules).toFixed(3)} mm por módulo · máscara ${maskIndex}`,
)
