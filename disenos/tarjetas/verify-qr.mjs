/**
 * Lector de QR escrito al revés del generador, para comprobarlo de verdad.
 *
 * No mira la matriz que produjo `qr.mjs`: abre el PNG ya rasterizado, muestrea
 * el centro de cada módulo y desanda el camino completo — información de
 * formato, máscara, lectura en zigzag, desintercalado y síndromes de
 * Reed-Solomon. Si los síndromes salen a cero y el texto reconstruido es la URL
 * esperada, lo que hay impreso es un QR válido, no algo que se le parece.
 */
import * as GEO from './geometry.mjs'
import sharp from 'sharp'

const DIR = import.meta.dirname
const EXPECTED = 'https://bonsaiartesania.com'

// Geometría idéntica a build-card.mjs (mm sobre lienzo de 91x61).
const { CANVAS_W, CANVAS_H } = GEO
const QR_X = GEO.QR.x
const QR_SIZE = GEO.QR.size
const QR_Y = GEO.QR.y
const MODULES = 33

const EXP = new Uint8Array(512)
const LOG = new Uint8Array(256)
for (let i = 0, x = 1; i < 255; i++) {
  EXP[i] = x
  LOG[x] = i
  x <<= 1
  if (x & 0x100) x ^= 0x11d
}
for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]
const mul = (a, b) => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]])

const MASKS = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
]

/** Muestrea el PNG y devuelve 1 donde el módulo es oscuro. */
async function readMatrix(file) {
  const image = sharp(file)
  const { width, height } = await image.metadata()
  const { data } = await image.greyscale().raw().toBuffer({ resolveWithObject: true })
  const perMmX = width / CANVAS_W
  const perMmY = height / CANVAS_H
  const unit = QR_SIZE / MODULES

  const matrix = []
  for (let r = 0; r < MODULES; r++) {
    const row = []
    for (let c = 0; c < MODULES; c++) {
      const x = Math.round((QR_X + (c + 0.5) * unit) * perMmX)
      const y = Math.round((QR_Y + (r + 0.5) * unit) * perMmY)
      row.push(data[y * width + x] < 128 ? 1 : 0)
    }
    matrix.push(row)
  }
  return { matrix, width, height }
}

function isFunctionCell(r, c) {
  const n = MODULES
  const inFinder = (fr, fc) => r >= fr && r < fr + 8 && c >= fc && c < fc + 8
  if (inFinder(0, 0) || inFinder(0, n - 8) || inFinder(n - 8, 0)) return true
  if (r === 6 || c === 6) return true
  // Patrón de alineación de la versión 4, centrado en (26,26).
  if (r >= 24 && r <= 28 && c >= 24 && c <= 28) return true
  // Información de formato: fila 8 y columna 8, en las tres esquinas, más el
  // módulo oscuro. Olvidarlas hace que se lean como datos y todo lo demás sale
  // corrido.
  if (r === 8 && (c <= 8 || c >= n - 8)) return true
  if (c === 8 && (r <= 8 || r >= n - 8)) return true
  return false
}

/** Deshace el BCH de la información de formato y devuelve nivel y máscara. */
function readFormat(matrix) {
  // Primera copia: bits bajos por la columna 8, bits altos por la fila 8.
  const order = [
    [0, 8],
    [1, 8],
    [2, 8],
    [3, 8],
    [4, 8],
    [5, 8],
    [7, 8],
    [8, 8],
    [8, 7],
    [8, 5],
    [8, 4],
    [8, 3],
    [8, 2],
    [8, 1],
    [8, 0],
  ]
  let bits = 0
  order.forEach(([r, c], i) => (bits |= matrix[r][c] << i))
  const raw = bits ^ 0b101010000010010
  let rest = raw
  for (let i = 14; i >= 10; i--) if ((rest >> i) & 1) rest ^= 0b10100110111 << (i - 10)
  return { ecLevel: (raw >> 13) & 0b11, mask: (raw >> 10) & 0b111, bchOk: rest === 0 }
}

function readCodewords(matrix, mask) {
  const maskFn = MASKS[mask]
  const bits = []
  let upward = true
  for (let right = MODULES - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5 // la columna 6 se salta entera
    for (let step = 0; step < MODULES; step++) {
      const r = upward ? MODULES - 1 - step : step
      for (const c of [right, right - 1]) {
        if (isFunctionCell(r, c)) continue
        bits.push(maskFn(r, c) ? matrix[r][c] ^ 1 : matrix[r][c])
      }
    }
    upward = !upward
  }
  const codewords = []
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    codewords.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0))
  }
  return codewords.slice(0, 100)
}

/** Síndromes de Reed-Solomon: todos a cero = bloque sin errores. */
function syndromesZero(block, ecCount) {
  for (let i = 0; i < ecCount; i++) {
    let value = 0
    for (const byte of block) value = mul(value, EXP[i]) ^ byte
    if (value !== 0) return false
  }
  return true
}

const results = []
const { matrix, width, height } = await readMatrix(`${DIR}/salida/tarjeta-cara-b.png`)

const format = readFormat(matrix)
results.push(['información de formato válida (BCH)', format.bchOk])
results.push(['nivel de corrección H (30%)', format.ecLevel === 0b10])

const stream = readCodewords(matrix, format.mask)
const dataBlocks = [[], [], [], []]
const ecBlocks = [[], [], [], []]
for (let i = 0; i < 36; i++) dataBlocks[i % 4].push(stream[i])
for (let i = 0; i < 64; i++) ecBlocks[i % 4].push(stream[36 + i])
results.push([
  'síndromes Reed-Solomon a cero en los 4 bloques',
  dataBlocks.every((block, i) => syndromesZero([...block, ...ecBlocks[i]], 16)),
])

// Los bloques, uno detrás de otro, devuelven el orden original de codewords.
const ordered = dataBlocks.flat()
const dataBits = []
for (const byte of ordered) for (let i = 7; i >= 0; i--) dataBits.push((byte >> i) & 1)
const take = (n, at) => dataBits.slice(at, at + n).reduce((a, b) => (a << 1) | b, 0)

const mode = take(4, 0)
const length = take(8, 4)
const bytes = []
for (let i = 0; i < length; i++) bytes.push(take(8, 12 + i * 8))
const decoded = new TextDecoder().decode(new Uint8Array(bytes))

results.push(['modo byte', mode === 0b0100])
results.push([`texto decodificado del PNG = "${decoded}"`, decoded === EXPECTED])

const moduleMm = QR_SIZE / MODULES
results.push([`módulo de ${moduleMm.toFixed(3)} mm (mínimo práctico 0.4)`, moduleMm >= 0.4])
results.push([
  `${width}x${height} px = ${Math.round(width / (CANVAS_W / 25.4))} ppp`,
  Math.round(width / (CANVAS_W / 25.4)) >= 300,
])

console.log(`Máscara leída del PNG: ${format.mask}`)
for (const [label, ok] of results) console.log(`${ok ? 'OK   ' : 'FALLA'} ${label}`)
process.exitCode = results.every(([, ok]) => ok) ? 0 : 1
