#!/usr/bin/env node
/**
 * PIPELINE DE IMÁGENES · `npm run images`
 *
 * Toma los originales de `fotos-originales/` (fuera de git) y genera para la web:
 *
 *   public/media/<slug>.webp        derivado único, máx. 1600 px de ancho
 *   content/media-manifest.json     dimensiones + placeholder LQIP
 *
 * Por qué un solo derivado y no un srcset completo: `next/image` ya genera las
 * variantes responsive y las cachea en el CDN. Duplicar aquí esa lógica
 * multiplicaría el peso del repo sin ganar nada. Lo que sí necesitamos versionar
 * es el manifiesto: con ancho y alto conocidos en build no hay salto de layout
 * (CLS = 0) y el placeholder difuminado evita el "flash" de hueco vacío.
 *
 * Es idempotente: sólo reprocesa lo que ha cambiado. `--force` rehace todo.
 *
 * El nombre del fichero ES la clave: `pendientes-helecho.jpg` se referencia en
 * `content/products.ts` como `img('pendientes-helecho', '…')`. Si la clave no
 * existe en el manifiesto, el build falla en TypeScript — no en producción.
 */

import { existsSync } from 'node:fs'
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE_DIR = path.join(ROOT, 'fotos-originales')
const OUT_DIR = path.join(ROOT, 'public', 'media')
const MANIFEST = path.join(ROOT, 'content', 'media-manifest.json')

/** Tope de ancho. Las fotos de Instagram llegan a 1080; esto deja margen para
 *  cuando Ana pase los originales de la cámara. */
const MAX_WIDTH = 1600
const QUALITY = 82
/** Ancho del placeholder LQIP embebido en base64. */
const BLUR_WIDTH = 16

const force = process.argv.includes('--force')

async function main() {
  if (!existsSync(SOURCE_DIR)) {
    console.error(
      `\n✗ No encuentro "fotos-originales/".\n` +
        `  Ahí van las fotos originales, una por pieza, con el nombre de su clave\n` +
        `  (por ejemplo "colgante-lavanda.jpg"). La carpeta está gitignorada a propósito.\n`,
    )
    process.exit(1)
  }

  const files = (await readdir(SOURCE_DIR))
    .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
    .sort()

  await mkdir(OUT_DIR, { recursive: true })

  const manifest = {}
  const stats = { processed: 0, skipped: 0, bytes: 0 }

  for (const file of files) {
    const slug = file.replace(/\.[^.]+$/, '')
    const source = path.join(SOURCE_DIR, file)
    const outPath = path.join(OUT_DIR, `${slug}.webp`)

    const upToDate = !force && (await isUpToDate(source, outPath))

    if (!upToDate) {
      await sharp(source, { limitInputPixels: false })
        .rotate()
        .resize({ width: MAX_WIDTH, withoutEnlargement: true, fit: 'inside' })
        .webp({ quality: QUALITY, effort: 6 })
        .toFile(outPath)
      stats.processed++
    } else {
      stats.skipped++
    }

    const meta = await sharp(outPath).metadata()
    const size = (await stat(outPath)).size
    stats.bytes += size

    manifest[slug] = {
      src: `/media/${slug}.webp`,
      width: meta.width ?? 0,
      height: meta.height ?? 0,
      blur: await makeBlurDataUrl(source),
    }

    if (!upToDate) {
      console.log(`  ✓ ${slug}.webp  ${meta.width}×${meta.height}  ${(size / 1024).toFixed(0)} KB`)
    }
  }

  await mkdir(path.dirname(MANIFEST), { recursive: true })
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

  console.log(
    `\n✓ ${stats.processed} generadas · ${stats.skipped} sin cambios · ` +
      `${(stats.bytes / 1024 / 1024).toFixed(1)} MB en public/media`,
  )
  console.log(`  manifiesto → ${path.relative(ROOT, MANIFEST)}`)
}

/** Un derivado está al día si existe y es más nuevo que su original. */
async function isUpToDate(source, output) {
  if (!existsSync(output)) return false
  const [a, b] = await Promise.all([stat(source), stat(output)])
  return b.mtimeMs >= a.mtimeMs
}

/** Placeholder difuminado, embebido como data URL en el manifiesto. */
async function makeBlurDataUrl(source) {
  const buffer = await sharp(source, { limitInputPixels: false })
    .rotate()
    .resize({ width: BLUR_WIDTH, fit: 'inside' })
    .webp({ quality: 45, effort: 4 })
    .toBuffer()
  return `data:image/webp;base64,${buffer.toString('base64')}`
}

await main()
