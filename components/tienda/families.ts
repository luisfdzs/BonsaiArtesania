import { categories, productsByCategory } from '@/content/products'
import { site } from '@/content/site'
import { translator, type Locale } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { shopOpen } from '@/lib/shop'
import type { ShopFamily } from './ShopBoard'

export function shopFamilies(locale: Locale): ShopFamily[] {
  const t = translator(locale)

  return categories
    .map((category) => ({ category, piezas: productsByCategory(category.key) }))
    .filter(({ piezas }) => piezas.length > 0)
    .map(({ category, piezas }) => {
      const primera = piezas[0]

      return {
        key: category.key,
        href: path(locale, `/tienda/categoria/${category.key}`),
        label: t(category.label),
        title: `${t(category.label)} · ${site.nameFull}`,
        notice: !shopOpen && category.key !== 'taller',
        // La miniatura de la familia en la barra: su primera pieza. Se resuelve
        // aquí, en el servidor, porque `FamilyFlow` es de cliente y sólo
        // necesita la foto de un idioma. Ver `FamilyFlow`.
        thumb: primera?.image ? t(primera.image) : null,
        // El recorte importa: `ShopBoard` es de cliente, así que estas piezas
        // viajan por la red. Pasando la pieza entera iban también los párrafos,
        // los materiales y el precio de todo el catálogo. Ver `ProductCardData`.
        items: piezas.map(({ slug, name, image }) => ({ slug, name, image })),
      }
    })
}

export function shopIndex(familias: ShopFamily[], key: string): number {
  const index = familias.findIndex((familia) => familia.key === key)
  return index === -1 ? 0 : index
}
