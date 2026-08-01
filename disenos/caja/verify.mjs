/**
 * Mide las hojas ya rasterizadas y comprueba que saldrán de la impresora con las
 * medidas de la caja.
 *
 * Existe por el mismo motivo que `verify-qr.mjs` en las tarjetas: aquí lo que se
 * puede estropear en silencio no es el diseño —eso se ve— sino la **escala**. Un
 * desarrollo un 3 % pequeño se ve perfecto en pantalla y perfecto impreso, y sólo
 * se descubre al intentar envolver con él una tapa de 22 mm de profundidad y
 * comprobar que los costados no llegan. Cuando eso pasa ya hay una hoja de papel
 * fotográfico gastada y la caja sin envolver.
 *
 * Así que no mide el SVG, que es donde están los números que escribimos: mide los
 * **píxeles del PNG** y los **bytes del PDF**, que es lo que la impresora va a
 * leer. Por cada hoja comprueba:
 *
 *   1. El PNG tiene el tamaño en píxeles y la densidad `pHYs` que le tocan, así
 *      que 4677 px valen 297 mm y no una cifra a interpretar.
 *   2. Cada cota que la pieza declara en su `MEDIDAS`: barre una fila o una
 *      columna de píxeles reales y comprueba dónde empieza y dónde acaba el color
 *      impreso. Con eso se verifican de paso los recortes de esquina, midiendo
 *      por donde no debería haber papel.
 *   3. El `MediaBox` del PDF es una A4 apaisada en puntos PostScript.
 *   4. La imagen incrustada en el PDF son los mismos bytes que el PNG, sin
 *      recomprimir ni reescalar por el camino.
 */
import { readFileSync } from 'node:fs'
import sharp from 'sharp'
import { DPI, PAGE_H, PAGE_W, PX } from './geometry-hoja.mjs'
import { MEDIDAS as MEDIDAS_TAPA } from './geometry.mjs'
import { COSTADOS, FONDO, MEDIDAS_COSTADOS, MEDIDAS_FONDO } from './geometry-base.mjs'

const DIR = `${import.meta.dirname}/salida`
const MM_TO_PT = 72 / 25.4
/** Una décima de milímetro: el rasterizado redondea a píxel, así que exigir el
 *  píxel exacto sería exigir que no redondee. */
const TOL_MM = 0.1

/** Cada pieza con las cotas que declara. `caja-tapa-sin-guias` no está: es el
 *  mismo desarrollo que `caja-tapa` con las guías apagadas, y sus cotas no se
 *  pueden medir precisamente porque no hay línea que medir. */
const HOJAS = [
  { name: 'caja-tapa', medidas: MEDIDAS_TAPA },
  { name: FONDO.nombre, medidas: MEDIDAS_FONDO },
  { name: COSTADOS.nombre, medidas: MEDIDAS_COSTADOS },
]

let fallos = 0
const check = (ok, msg) => {
  console.log(`  ${ok ? '✓' : '✗'} ${msg}`)
  if (!ok) fallos++
}
const near = (got, want, tol = TOL_MM) => Math.abs(got - want) <= tol

/**
 * ¿Este píxel es papel impreso?
 *
 * Blanco puro es el margen de la hoja, que no se imprime. El lino y el destello
 * rosado son claros pero no blancos: entre luminancia 232 y 247.
 */
const esFondo = (r, g, b) => {
  const luma = 0.299 * r + 0.587 * g + 0.114 * b
  return luma > 230 && !(r > 252 && g > 252 && b > 252)
}

/**
 * Un tramo de fondo tiene que medir al menos esto para contar como borde de una
 * pieza.
 *
 * No es una holgura, es un filtro, y lo pide el color de los rótulos del margen.
 * Las letras son gris cálido (luminancia ~160) y quedan fuera de `esFondo` sin
 * problema, pero el **antialiasing** de sus perfiles pasa por todos los valores
 * intermedios, y los que están al 90 % de blanco caen dentro de la ventana de
 * 230-252 que define un lino. Por color no hay forma de separarlos: un píxel a
 * medio camino entre blanco y gris es exactamente igual que un lino.
 *
 * Lo que sí los separa es el tamaño. Una pieza son 85 mm seguidos de color; la
 * orla de una letra de 2,6 mm mide dos o tres píxeles. Con 1 mm de tramo mínimo
 * los rótulos desaparecen de la medida y los 2 mm de sangre siguen contando.
 *
 * Esto empezó midiendo el primer y el último píxel de fondo sin más, y las cotas
 * verticales de la base salían 6 mm largas porque el barrido pasaba por encima de
 * los rótulos. Las de la tapa pasaban, pero de suerte: su línea de barrido cae
 * más a la derecha de donde acaba el texto.
 */
const TRAMO_MÍNIMO_MM = 1

for (const { name, medidas } of HOJAS) {
  console.log(`\n${name}`)

  const png = readFileSync(`${DIR}/${name}.png`)
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true })
  const meta = await sharp(png).metadata()

  check(
    info.width === PX(PAGE_W) && info.height === PX(PAGE_H),
    `PNG ${info.width}x${info.height} px (esperado ${PX(PAGE_W)}x${PX(PAGE_H)})`,
  )
  check(meta.density === DPI, `densidad sellada ${meta.density} ppp`)
  check(info.channels === 3, `RGB sin alfa, que es lo que el PDF puede incrustar`)

  const px = (x, y) => {
    const at = (y * info.width + x) * info.channels
    return [data[at], data[at + 1], data[at + 2]]
  }
  const mm = (p) => (p * 25.4) / DPI

  for (const m of medidas) {
    // Se barre sólo dentro de la ventana que pide la cota: así una hoja con dos
    // piezas se puede medir pieza a pieza sin que la de al lado contamine.
    const at = PX(m.at)
    const desdePx = Math.max(0, PX(m.ventana[0]))
    const hastaPx = Math.min(m.eje === 'x' ? info.width : info.height, PX(m.ventana[1]))

    // Se recogen los tramos continuos de fondo y se descartan los que no llegan
    // al mínimo; el borde de la pieza es el principio del primero que queda y el
    // final del último.
    const mínimo = PX(TRAMO_MÍNIMO_MM)
    const tramos = []
    let arranque = -1
    for (let i = desdePx; i <= hastaPx; i++) {
      const fondo = i < hastaPx && esFondo(...(m.eje === 'x' ? px(i, at) : px(at, i)))
      if (fondo && arranque < 0) arranque = i
      if (!fondo && arranque >= 0) {
        if (i - arranque >= mínimo) tramos.push([arranque, i])
        arranque = -1
      }
    }

    const inicio = tramos.length ? mm(tramos[0][0]) : NaN
    const fin = tramos.length ? mm(tramos[tramos.length - 1][1]) : NaN
    check(
      near(inicio, m.desde) && near(fin, m.hasta),
      `${m.qué} → ${(fin - inicio).toFixed(2)} mm, de ${inicio.toFixed(2)} a ${fin.toFixed(2)} ` +
        `(esperado ${(m.hasta - m.desde).toFixed(2)}, de ${m.desde} a ${m.hasta})`,
    )
  }

  // --- El PDF -------------------------------------------------------------
  const pdf = readFileSync(`${DIR}/${name}.pdf`)
  const latin = pdf.toString('latin1')

  const box = latin.match(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/)
  check(
    box !== null &&
      near(Number(box[1]) / MM_TO_PT, PAGE_W, 0.01) &&
      near(Number(box[2]) / MM_TO_PT, PAGE_H, 0.01),
    box
      ? `MediaBox ${(Number(box[1]) / MM_TO_PT).toFixed(2)}x${(Number(box[2]) / MM_TO_PT).toFixed(2)} mm`
      : 'PDF sin MediaBox',
  )

  // El PDF incrusta el `IDAT` del PNG tal cual —es un flujo zlib con predictor de
  // PNG, que es exactamente lo que `/FlateDecode` con `/Predictor 15` espera—, así
  // que los bytes de los dos archivos tienen que coincidir uno a uno. Si alguien
  // mete un reescalado o una recompresión por el medio, esto lo caza.
  const idat = []
  for (let at = 8; at < png.length;) {
    const len = png.readUInt32BE(at)
    if (png.toString('ascii', at + 4, at + 8) === 'IDAT')
      idat.push(png.subarray(at + 8, at + 8 + len))
    at += 12 + len
  }
  const esperado = Buffer.concat(idat)
  const inicio = latin.indexOf('stream\n', latin.indexOf('/Subtype /Image')) + 'stream\n'.length

  check(
    pdf.subarray(inicio, inicio + esperado.length).equals(esperado),
    `imagen del PDF idéntica al PNG (${esperado.length} bytes incrustados sin recomprimir)`,
  )
}

console.log(fallos ? `\n${fallos} comprobación(es) fallidas` : '\ntodo cuadra')
process.exit(fallos ? 1 : 0)
