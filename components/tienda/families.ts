import { site } from '@/content/site'
import { todasLasFamilias, todasLasPiezas, type Pieza } from '@/lib/catalogo'
import { translator, type Locale } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { shopOpen } from '@/lib/shop'
import type { ShopFamily } from './ShopBoard'

/**
 * Las familias de la tienda, ya traducidas y con su muestra recortada.
 *
 * Es asíncrona desde que el catálogo vive en la base: antes era un `filter` sobre
 * un array importado y ahora son dos lecturas —familias y piezas—, las dos
 * cacheadas bajo la etiqueta `catalogo`. Quien la llama ya estaba en un
 * componente de servidor, así que sólo cambia el `await`.
 */
export async function shopFamilies(locale: Locale): Promise<ShopFamily[]> {
  const t = translator(locale)

  const [familias, piezas] = await Promise.all([todasLasFamilias(), todasLasPiezas()])
  const porFamilia = new Map<string, Pieza[]>()
  for (const pieza of piezas) {
    const lista = porFamilia.get(pieza.category)
    if (lista) lista.push(pieza)
    else porFamilia.set(pieza.category, [pieza])
  }

  return familias
    .map((category) => ({ category, piezas: porFamilia.get(category.key) ?? [] }))
    .filter(({ piezas }) => piezas.length > 0)
    .map(({ category, piezas }) => {
      const primera = piezas[0]

      return {
        key: category.key,
        href: path(locale, `/tienda/categoria/${category.key}`),
        label: t(category.label),
        title: `${t(category.label)} · ${site.nameFull}`,
        notice: !shopOpen && category.key !== 'taller',
        // La miniatura de la familia en la barra: la foto de su primera pieza, y
        // por eso el orden del catálogo decide la cara de cada familia. Se
        // resuelve aquí, en el servidor, porque `FamilyFlow` es de cliente y sólo
        // necesita la foto de un idioma. Ver `FamilyFlow`.
        thumb: primera?.image ? t(primera.image) : null,
        // El recorte importa: `ShopBoard` es de cliente, así que estas piezas
        // viajan por la red. Pasando la pieza entera iban también los párrafos,
        // los materiales y el precio de todo el catálogo. Ver `PiezaTarjeta`.
        items: piezas.map(({ slug, name, image }) => ({ slug, name, image })),
      }
    })
}

export function shopIndex(familias: ShopFamily[], key: string): number {
  const index = familias.findIndex((familia) => familia.key === key)
  return index === -1 ? 0 : index
}
