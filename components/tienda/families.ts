import { categories, productsByCategory } from '@/content/products'
import { site } from '@/content/site'
import { translator, type Locale } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { shopOpen } from '@/lib/shop'
import type { ShopFamily } from './ShopBoard'

export function shopFamilies(locale: Locale): ShopFamily[] {
  const t = translator(locale)

  return categories
    .filter((category) => productsByCategory(category.key).length > 0)
    .map((category) => ({
      key: category.key,
      href: path(locale, `/tienda/categoria/${category.key}`),
      label: t(category.label),
      intro: t(category.intro),
      title: `${t(category.label)} · ${site.nameFull}`,
      notice: !shopOpen && category.key !== 'taller',
      items: productsByCategory(category.key),
    }))
}

export function shopIndex(familias: ShopFamily[], key: string): number {
  const index = familias.findIndex((familia) => familia.key === key)
  return index === -1 ? 0 : index
}
