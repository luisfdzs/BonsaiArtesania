/**
 * Generador de QR mínimo, sin dependencias. Versión 4 (33x33) y corrección de
 * errores H (30%): la más alta, que es lo que quieres en papel — un cartón
 * rozado o con un dedo encima sigue leyéndose.
 *
 * Se hace a mano y no con un servicio online a propósito: los generadores
 * "gratis" devuelven QR dinámicos que pasan por su dominio y mueren cuando
 * dejas de pagarles. Esto codifica la URL literal.
 */

const VERSION = 4
const SIZE = 17 + 4 * VERSION // 33
const TOTAL_CODEWORDS = 100
const EC_PER_BLOCK = 16
const BLOCKS = 4
const DATA_PER_BLOCK = 9
const REMAINDER_BITS = 7
const ALIGN_COORDS = [6, 26]
const EC_LEVEL_BITS = 0b10 // H

// --- GF(256) -------------------------------------------------------------
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

/** Polinomio generador de Reed-Solomon para `n` codewords de corrección. */
function generatorPoly(n) {
  let poly = [1]
  for (let i = 0; i < n; i++) {
    const next = new Array(poly.length + 1).fill(0)
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= mul(poly[j], 1)
      next[j + 1] ^= mul(poly[j], EXP[i])
    }
    poly = next
  }
  return poly
}

function ecCodewords(data, n) {
  const gen = generatorPoly(n)
  const rest = new Array(n).fill(0)
  for (const byte of data) {
    const factor = byte ^ rest.shift()
    rest.push(0)
    for (let i = 0; i < n; i++) rest[i] ^= mul(gen[i + 1], factor)
  }
  return rest
}

// --- Codificación --------------------------------------------------------
function encode(text) {
  const bytes = [...new TextEncoder().encode(text)]
  const capacity = BLOCKS * DATA_PER_BLOCK // 36 codewords
  if (bytes.length + 2 > capacity) {
    throw new Error(`"${text}" no cabe en versión ${VERSION}-H (${bytes.length} bytes)`)
  }

  const bits = []
  const push = (value, length) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >> i) & 1)
  }

  push(0b0100, 4) // modo byte
  push(bytes.length, 8) // contador (8 bits para versiones 1-9)
  for (const byte of bytes) push(byte, 8)

  const capacityBits = capacity * 8
  push(0, Math.min(4, capacityBits - bits.length)) // terminador
  while (bits.length % 8) bits.push(0)

  const codewords = []
  for (let i = 0; i < bits.length; i += 8) {
    codewords.push(bits.slice(i, i + 8).reduce((acc, bit) => (acc << 1) | bit, 0))
  }
  // Relleno alterno que exige la norma.
  for (let i = 0; codewords.length < capacity; i++) codewords.push(i % 2 ? 0x11 : 0xec)

  // Un bloque por grupo (todos del mismo tamaño en 4-H) e intercalado.
  const dataBlocks = []
  const ecBlocks = []
  for (let b = 0; b < BLOCKS; b++) {
    const block = codewords.slice(b * DATA_PER_BLOCK, (b + 1) * DATA_PER_BLOCK)
    dataBlocks.push(block)
    ecBlocks.push(ecCodewords(block, EC_PER_BLOCK))
  }

  const stream = []
  for (let i = 0; i < DATA_PER_BLOCK; i++) for (const block of dataBlocks) stream.push(block[i])
  for (let i = 0; i < EC_PER_BLOCK; i++) for (const block of ecBlocks) stream.push(block[i])
  if (stream.length !== TOTAL_CODEWORDS) throw new Error('longitud de flujo inesperada')

  const streamBits = []
  for (const byte of stream) for (let i = 7; i >= 0; i--) streamBits.push((byte >> i) & 1)
  for (let i = 0; i < REMAINDER_BITS; i++) streamBits.push(0)
  return streamBits
}

// --- Retícula ------------------------------------------------------------
const newGrid = () =>
  Array.from({ length: SIZE }, () => new Array(SIZE).fill(null)) /* null = libre */

function placeFunctionPatterns(grid) {
  const setFinder = (row, col) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const y = row + r
        const x = col + c
        if (y < 0 || y >= SIZE || x < 0 || x >= SIZE) continue
        const ring = Math.max(Math.abs(r - 3), Math.abs(c - 3))
        grid[y][x] = ring !== 2 && ring <= 3 ? 1 : 0
      }
    }
  }
  setFinder(0, 0)
  setFinder(0, SIZE - 7)
  setFinder(SIZE - 7, 0)

  for (let i = 8; i < SIZE - 8; i++) {
    const bit = i % 2 === 0 ? 1 : 0
    grid[6][i] = bit
    grid[i][6] = bit
  }

  for (const row of ALIGN_COORDS) {
    for (const col of ALIGN_COORDS) {
      // Los que pisarían un patrón de búsqueda no se dibujan.
      if (
        (row === 6 && col === 6) ||
        (row === 6 && col === SIZE - 7) ||
        (row === SIZE - 7 && col === 6)
      )
        continue
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const ring = Math.max(Math.abs(r), Math.abs(c))
          grid[row + r][col + c] = ring === 1 ? 0 : 1
        }
      }
    }
  }

  grid[4 * VERSION + 9][8] = 1 // módulo oscuro

  // Reserva de la información de formato: se rellena al final.
  for (let i = 0; i < 9; i++) {
    if (grid[8][i] === null) grid[8][i] = 0
    if (grid[i][8] === null) grid[i][8] = 0
  }
  for (let i = 0; i < 8; i++) {
    if (grid[8][SIZE - 1 - i] === null) grid[8][SIZE - 1 - i] = 0
    if (grid[SIZE - 1 - i][8] === null) grid[SIZE - 1 - i][8] = 0
  }
}

/** Qué celdas son de función (no se enmascaran ni reciben datos). */
function functionMask() {
  const grid = newGrid()
  placeFunctionPatterns(grid)
  return grid.map((row) => row.map((cell) => cell !== null))
}

function placeData(grid, isFunction, bits) {
  let index = 0
  let upward = true
  for (let right = SIZE - 1; right >= 1; right -= 2) {
    // Al llegar al patrón de sincronismo hay que SALTAR la columna 6, no
    // apartarse un paso: si sólo se corrige la columna usada, el recorrido se
    // desalinea, la columna 4 se escribe dos veces y la 0 no se escribe nunca.
    if (right === 6) right = 5
    for (let step = 0; step < SIZE; step++) {
      const row = upward ? SIZE - 1 - step : step
      for (const x of [right, right - 1]) {
        if (isFunction[row][x]) continue
        grid[row][x] = index < bits.length ? bits[index] : 0
        index++
      }
    }
    upward = !upward
  }
  if (index < bits.length) throw new Error(`quedaron ${bits.length - index} bits sin colocar`)
}

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

function applyMask(grid, isFunction, maskIndex) {
  const mask = MASKS[maskIndex]
  return grid.map((row, r) =>
    row.map((cell, c) => (isFunction[r][c] ? cell : mask(r, c) ? cell ^ 1 : cell)),
  )
}

/** BCH(15,5) de la información de formato. */
function formatBits(maskIndex) {
  const data = (EC_LEVEL_BITS << 3) | maskIndex
  let rest = data << 10
  for (let i = 14; i >= 10; i--) {
    if ((rest >> i) & 1) rest ^= 0b10100110111 << (i - 10)
  }
  return (((data << 10) | rest) ^ 0b101010000010010) & 0x7fff
}

function placeFormat(grid, maskIndex) {
  const bits = formatBits(maskIndex)
  const bit = (i) => (bits >> i) & 1
  // Primera copia, en escuadra alrededor del patrón superior izquierdo: los
  // bits bajos bajan por la columna 8 y los altos vuelven por la fila 8.
  for (let i = 0; i <= 5; i++) grid[i][8] = bit(i)
  grid[7][8] = bit(6)
  grid[8][8] = bit(7)
  grid[8][7] = bit(8)
  for (let i = 9; i <= 14; i++) grid[8][14 - i] = bit(i)
  // Segunda copia, partida entre el patrón superior derecho (fila 8) y el
  // inferior izquierdo (columna 8).
  for (let i = 0; i <= 7; i++) grid[8][SIZE - 1 - i] = bit(i)
  for (let i = 8; i <= 14; i++) grid[SIZE - 15 + i][8] = bit(i)
  // El módulo oscuro va después: cae justo encima de donde acaba la columna de
  // la segunda copia y no debe llevar información de formato.
  grid[4 * VERSION + 9][8] = 1
}

// --- Penalizaciones (elección de máscara) --------------------------------
function penalty(grid) {
  let score = 0

  const runs = (line) => {
    let count = 1
    for (let i = 1; i < line.length; i++) {
      if (line[i] === line[i - 1]) count++
      else {
        if (count >= 5) score += 3 + (count - 5)
        count = 1
      }
    }
    if (count >= 5) score += 3 + (count - 5)
  }
  for (let i = 0; i < SIZE; i++) {
    runs(grid[i])
    runs(grid.map((row) => row[i]))
  }

  for (let r = 0; r < SIZE - 1; r++) {
    for (let c = 0; c < SIZE - 1; c++) {
      const v = grid[r][c]
      if (v === grid[r][c + 1] && v === grid[r + 1][c] && v === grid[r + 1][c + 1]) score += 3
    }
  }

  const pattern = [1, 0, 1, 1, 1, 0, 1]
  const hasPattern = (line, at) => pattern.every((v, i) => line[at + i] === v)
  const hasGap = (line, at) => line.slice(at, at + 4).every((v) => v === 0)
  for (let i = 0; i < SIZE; i++) {
    for (const line of [grid[i], grid.map((row) => row[i])]) {
      for (let j = 0; j + 7 <= SIZE; j++) {
        if (!hasPattern(line, j)) continue
        if ((j >= 4 && hasGap(line, j - 4)) || (j + 11 <= SIZE && hasGap(line, j + 7))) score += 40
      }
    }
  }

  const dark = grid.flat().filter((v) => v === 1).length
  score += Math.floor(Math.abs((dark * 100) / (SIZE * SIZE) - 50) / 5) * 10
  return score
}

// --- API -----------------------------------------------------------------
/** Expuesto sólo para los diagnósticos: el flujo de codewords que se espera. */
export { encode as encodeBits }

export function qrMatrix(text) {
  const bits = encode(text)
  const isFunction = functionMask()

  let best = null
  for (let maskIndex = 0; maskIndex < 8; maskIndex++) {
    const grid = newGrid()
    placeFunctionPatterns(grid)
    placeData(grid, isFunction, bits)
    const masked = applyMask(grid, isFunction, maskIndex)
    placeFormat(masked, maskIndex)
    const score = penalty(masked)
    if (!best || score < best.score) best = { score, grid: masked, maskIndex }
  }
  return best
}

/**
 * Un único `path` con un cuadrado por módulo oscuro. Un path y no 500 `rect`
 * porque algunos rasterizadores dejan costuras de fondo entre rectángulos
 * adyacentes, y una costura clara dentro de un módulo es ruido para el lector.
 */
export function qrPath(grid, { size, x = 0, y = 0 }) {
  const unit = size / grid.length
  const parts = []
  grid.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (!cell) return
      const px = x + c * unit
      const py = y + r * unit
      parts.push(
        `M${px.toFixed(3)} ${py.toFixed(3)}h${unit.toFixed(3)}v${unit.toFixed(3)}h-${unit.toFixed(3)}z`,
      )
    })
  })
  return parts.join('')
}

if (process.argv[2]) {
  const { grid, maskIndex, score } = qrMatrix(process.argv[2])
  console.log(
    `versión ${VERSION}-H · ${SIZE}x${SIZE} módulos · máscara ${maskIndex} · penalización ${score}`,
  )
  console.log(grid.map((row) => row.map((cell) => (cell ? '██' : '  ')).join('')).join('\n'))
}
