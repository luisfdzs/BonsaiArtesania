#!/usr/bin/env node
/**
 * MUDANZA DEL CATÁLOGO · `npm run catalogo:import`
 *
 * Lleva el catálogo de `content/products.ts` a la base, que es donde va a vivir
 * a partir de ahora para que se pueda editar desde el panel sin desplegar.
 *
 * Es **idempotente**: cada pieza y cada familia se identifican por su `slug` y
 * su `key`, así que correrlo dos veces no duplica nada. Y no pisa lo que ya haya
 * cambiado en la base: por defecto sólo inserta lo que falta. Con `--forzar`
 * reescribe también lo que ya estaba, que es lo que hace falta mientras se
 * afinan los textos del fichero antes de dejar de usarlo.
 *
 * Las fotos **no** se mueven a ninguna parte todavía: siguen siendo los
 * derivados de `public/media` que genera `npm run images`, y lo que se guarda es
 * su dirección, su tamaño y su LQIP, sacados del manifiesto. Las que suba Ana
 * desde el panel se guardarán en el almacén de blobs; las viejas se quedan donde
 * están, que ya están servidas y cacheadas.
 *
 * No borra nada. Si una pieza desaparece del fichero, en la base sigue: quitarla
 * es una decisión de Ana en el panel, no un efecto de correr un script.
 */

import process from 'node:process'
import { categories, products } from '../content/products'
import { getClient } from '../lib/db'
import {
  catalogProducts,
  families,
  type FamilyDoc,
  type PhotoDoc,
  type ProductDoc,
} from '../lib/schema'

const forzar = process.argv.includes('--forzar')
const ahora = new Date()

/**
 * La foto que traía la pieza. Viene como `Localized<Image>` —la misma imagen dos
 * veces, una por idioma, con el `alt` distinto—, así que el `src` y el tamaño se
 * leen de cualquiera de las dos y el texto alternativo de las dos.
 *
 * El `id` sale del nombre del fichero, que es la clave con la que se referenciaba
 * en el fichero de contenido: `/media/pendientes-helecho.webp` → `pendientes-helecho`.
 */
function comoFoto(image: (typeof products)[number]['image']): PhotoDoc[] {
  if (!image) return []

  const { src, width, height, blur } = image.es
  const id = src.replace(/^.*\//, '').replace(/\.[^.]+$/, '')

  return [
    {
      id,
      src,
      width,
      height,
      blur,
      alt: { es: image.es.alt, gl: image.gl.alt },
      original: null,
      crop: null,
      createdAt: ahora,
    },
  ]
}

async function main() {
  const coleccionFamilias = await families()
  const coleccionPiezas = await catalogProducts()

  await coleccionFamilias.createIndex({ key: 1 }, { unique: true })
  await coleccionPiezas.createIndex({ slug: 1 }, { unique: true })
  await coleccionPiezas.createIndex({ family: 1, order: 1 })

  let familiasNuevas = 0
  let familiasPisadas = 0

  for (const [indice, categoria] of categories.entries()) {
    const doc: Omit<FamilyDoc, '_id'> = {
      key: categoria.key,
      label: categoria.label,
      plural: categoria.plural,
      note: categoria.note,
      intro: categoria.intro,
      order: indice,
      hidden: false,
      createdAt: ahora,
      updatedAt: ahora,
    }

    const existe = await coleccionFamilias.findOne({ key: categoria.key })
    if (existe && !forzar) continue

    if (existe) {
      const { createdAt: _sinTocar, ...resto } = doc
      await coleccionFamilias.updateOne({ key: categoria.key }, { $set: resto })
      familiasPisadas++
    } else {
      await coleccionFamilias.insertOne(doc as FamilyDoc)
      familiasNuevas++
    }
  }

  let piezasNuevas = 0
  let piezasPisadas = 0

  // El orden dentro de la familia es el que traía el fichero: el array estaba
  // escrito en el orden en que Ana quería verlas, y ése es el que hay que
  // conservar. Se cuenta por familia, no en el total.
  const contador = new Map<string, number>()

  for (const pieza of products) {
    const orden = contador.get(pieza.category) ?? 0
    contador.set(pieza.category, orden + 1)

    const doc: Omit<ProductDoc, '_id'> = {
      slug: pieza.slug,
      family: pieza.category,
      order: orden,
      name: pieza.name,
      summary: pieza.summary,
      description: pieza.description,
      materials: pieza.materials,
      price: pieza.price,
      photos: comoFoto(pieza.image),
      featured: pieza.featured,
      status: 'publicada',
      createdAt: ahora,
      updatedAt: ahora,
    }

    const existe = await coleccionPiezas.findOne({ slug: pieza.slug })
    if (existe && !forzar) continue

    if (existe) {
      const { createdAt: _sinTocar, ...resto } = doc
      await coleccionPiezas.updateOne({ slug: pieza.slug }, { $set: resto })
      piezasPisadas++
    } else {
      await coleccionPiezas.insertOne(doc as ProductDoc)
      piezasNuevas++
    }
  }

  console.log(
    [
      `Familias: ${familiasNuevas} nuevas, ${familiasPisadas} reescritas, ${categories.length} en el fichero.`,
      `Piezas:   ${piezasNuevas} nuevas, ${piezasPisadas} reescritas, ${products.length} en el fichero.`,
      forzar ? '' : 'Nada se ha pisado: para reescribir lo que ya estaba, pasa --forzar.',
    ]
      .filter(Boolean)
      .join('\n'),
  )

  await (await getClient()).close()
}

await main()
