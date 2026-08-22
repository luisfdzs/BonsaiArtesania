#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'public', 'icons')

const LINEN = '#faf7f2'
const BARK = '#2c2823'

const TRAZOS = `
    <path d="M1 39V16a15 15 0 0 1 30 0v23" stroke-linecap="round"/>
    <path d="M16 33V20" stroke-linecap="round"/>
    <path d="M16 24c-3.5 0-5.5-1.5-7-3.5M16 21c3 0 5-1 6.5-2.5" stroke-linecap="round"/>
    <ellipse cx="10" cy="15" rx="6" ry="3.4"/>
    <ellipse cx="22" cy="11" rx="5.5" ry="3.2"/>
    <path d="M9 33h14" stroke-linecap="round"/>`

const lienzo = (
  escala,
) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${LINEN}"/>
  <g transform="translate(256 256) scale(${escala}) translate(-16 -20)" fill="none" stroke="${BARK}" stroke-width="1.1">${TRAZOS}
  </g>
</svg>`

/* El «badge» es el icono chiquito de la barra de estado en Android: el sistema
 * lo pinta de blanco y sólo respeta la transparencia. Un PNG opaco —como los
 * demás iconos, con su fondo lino— sale por tanto como un cuadrado blanco. Así
 * que aquí el fondo se deja vacío y el trazo se engorda para que el bonsái
 * siga leyéndose a 24dp. */
const insignia = (
  escala,
) => `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <g transform="translate(48 48) scale(${escala}) translate(-16 -20)" fill="none" stroke="#ffffff" stroke-width="1.9">${TRAZOS}
  </g>
</svg>`

const ICONOS = [
  { file: 'app-512.png', size: 512, escala: 9 },
  { file: 'app-192.png', size: 192, escala: 9 },
  { file: 'app-mascara.png', size: 512, escala: 6.6 },
  { file: 'apple-touch-icon.png', size: 180, escala: 9 },
]

await mkdir(OUT, { recursive: true })

for (const { file, size, escala } of ICONOS) {
  await sharp(Buffer.from(lienzo(escala)))
    .resize(size, size)
    .png()
    .toFile(path.join(OUT, file))
  console.log(`${file}  ${size}×${size}`)
}

await sharp(Buffer.from(insignia(2.5))).png().toFile(path.join(OUT, 'aviso-insignia.png'))
console.log('aviso-insignia.png  96×96')
