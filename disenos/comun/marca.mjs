/**
 * La marca sobre papel, en un solo sitio.
 *
 * Existe porque hay más de una cosa que imprimir —las tarjetas y la funda de la
 * caja de regalo— y las dos tienen que llevar exactamente el mismo anverso. Si
 * cada generador dibujara su propio logotipo acabaría habiendo dos bonsáis
 * parecidos pero distintos, que es justo el fallo que no se ve hasta que están
 * los dos impresos encima de la mesa.
 *
 * Colores y tipografías salen del sistema del sitio (`app/globals.css` y
 * `app/layout.tsx`) y el arco del logotipo son los mismos trazados de
 * `components/layout/Wordmark.tsx`.
 *
 * Todo lo que se dibuja aquí está en **milímetros reales**.
 */
import { readFileSync } from 'node:fs'

const DIR = import.meta.dirname
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

export const C = {
  linen: '#faf7f2',
  linenDeep: '#f1ebe1',
  bark: '#2c2823',
  barkSoft: '#6e675c',
  barkFaint: '#a79f91',
  line: '#e4dccf',
  sage: '#93a188',
  petalSoft: '#f3e5e0',
}

export const URL = 'bonsaiartesania.com'
export const INSTAGRAM = '@san.bonsai_'
/** El mismo buzón que `content/site.ts`: el papel y la web dicen lo mismo. */
export const EMAIL = 'bonsai@bonsaiartesania.com'
/** Agrupado de tres en dos en dos, como se lee un móvil español en voz alta.
 *  Ojo: NO es el número de `content/site.ts` (`34658170562`), que es el que usa
 *  el botón de WhatsApp de la web. Los dos son intencionados y distintos. */
export const WHATSAPP = '+34 660 26 98 72'

const b64 = (file) => readFileSync(`${DIR}/${file}`).toString('base64')

export const fontFaces = `
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

/**
 * El destello rosado del anverso. Se pide con coordenadas absolutas —las del
 * espacio donde vaya el `rect` que lo use— porque en la tarjeta tiene que
 * derramarse hasta el borde de la sangre y en la caja tiene que quedarse dentro
 * de la cara superior: son dos encuadres distintos del mismo gradiente.
 */
export const amanecerDef = ({ id = 'amanecer', cx, cy, r }) =>
  `<radialGradient id="${id}" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
      gradientTransform="translate(${cx} ${cy}) scale(${r})">
      <stop offset="0" stop-color="${C.petalSoft}"/>
      <stop offset="0.65" stop-color="${C.petalSoft}" stop-opacity="0"/>
    </radialGradient>`

/** El arco con el bonsái del logotipo, tal cual está en components/layout/Wordmark.tsx.
 *  El trazo se engorda un poco: a 12 mm de alto, 1.1 de un viewBox de 40 sale
 *  demasiado fino para tinta sobre papel. */
export const wordmarkArch = (x, y, height, color) => {
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
export const brandIcon = (file, x, y, size, color) => {
  const svg = readFileSync(`${ICONS}/${file}`, 'utf8')
  const d = svg.match(/\sd="([^"]+)"/)?.[1]
  if (!d) throw new Error(`sin trazado en ${file}`)
  const scale = size / 24
  return `<g transform="translate(${x} ${y}) scale(${scale.toFixed(5)})"><path d="${d}" fill="${color}"/></g>`
}

/**
 * Tamaño de referencia del anverso: el corte de la tarjeta. `anverso()` dibuja
 * dentro de esta caja con origen en (0,0), así que quien lo use decide dónde
 * ponerlo y a qué escala envolviéndolo en un `<g transform>`. La tarjeta lo
 * coloca a 1:1 desplazado por la sangre; la funda de la caja lo amplía.
 */
export const ANVERSO = { w: 85, h: 55 }

/**
 * El anverso de la marca: logotipo centrado y aire alrededor. La marca ya dice
 * que la mitad del mensaje es el aire, y un anverso lleno de datos la
 * contradice.
 *
 * No pinta fondo: el fondo lo pone quien lo coloca, porque la tarjeta lo
 * necesita hasta la sangre y la caja hasta el pliegue.
 */
export const anverso = () => {
  const w = ANVERSO.w
  const archX = 24.4
  const archY = 11.5
  const archH = 13
  return `${wordmarkArch(archX, archY, archH, C.bark)}
  <text x="${archX + 12.2}" y="${archY + 6.6}" font-family="Cormorant Garamond" font-weight="400"
    font-size="7.4" fill="${C.bark}" letter-spacing="0.12">Bonsái</text>
  <text x="${archX + 12.6}" y="${archY + 11.2}" font-family="Jost" font-weight="300"
    font-size="2.35" fill="${C.barkSoft}" letter-spacing="0.98">ARTESANÍA</text>

  <text x="${w / 2}" y="35.6" text-anchor="middle" font-family="Cormorant Garamond" font-weight="300"
    font-size="4.1" fill="${C.barkSoft}">Joyas y piezas únicas en resina y flor natural</text>

  <line x1="${w / 2 - 6}" y1="41.4" x2="${w / 2 + 6}" y2="41.4" stroke="${C.sage}" stroke-width="0.28"/>

  <text x="${w / 2}" y="47.2" text-anchor="middle" font-family="Jost" font-weight="300"
    font-size="2.3" fill="${C.barkFaint}" letter-spacing="0.41">HECHO A MANO EN GALICIA</text>`
}
