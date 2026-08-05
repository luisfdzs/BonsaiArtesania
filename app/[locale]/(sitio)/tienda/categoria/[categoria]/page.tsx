import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { shopFamilies, shopIndex } from '@/components/tienda/families'
import { ShopBoard } from '@/components/tienda/ShopBoard'
import { categories, getCategoryInfo, productsByCategory } from '@/content/products'
import { isLocale, locales, pick, translator } from '@/lib/i18n/config'
import { alternates } from '@/lib/i18n/metadata'

type Params = { params: Promise<{ locale: string; categoria: string }> }

/**
 * Subsección de la tienda: una familia entera, sin el tope del índice.
 *
 * Cuelga de `/tienda/categoria/…` y no de `/tienda/…` a propósito: ahí ya vive
 * la ficha de pieza (`[slug]`), y compartir segmento obligaría a distinguir en
 * tiempo de ejecución si «pendientes» es una familia o una pieza. Un segmento
 * propio lo hace imposible por construcción.
 *
 * La clave de la familia **no se traduce**: es el tramo de la dirección, y las
 * direcciones son las mismas en los dos idiomas. Ver `lib/i18n/routes.ts`.
 */
export function generateStaticParams() {
  const keys = categories
    .filter((category) => productsByCategory(category.key).length > 0)
    .map((category) => category.key)

  return locales.flatMap((locale) => keys.map((categoria) => ({ locale, categoria })))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, categoria } = await params
  const category = getCategoryInfo(categoria)
  if (!category || !isLocale(locale)) return {}

  return {
    title: pick(category.label, locale),
    description: pick(category.intro, locale),
    alternates: alternates(locale, `/tienda/categoria/${category.key}`),
  }
}

export default async function CategoriaPage({ params }: Params) {
  const { locale, categoria } = await params
  if (!isLocale(locale)) notFound()
  const t = translator(locale)

  const category = getCategoryInfo(categoria)
  if (!category) notFound()
  if (productsByCategory(category.key).length === 0) notFound()

  const familias = shopFamilies(locale)

  return (
    <ShopBoard
      locale={locale}
      familias={familias}
      current={shopIndex(familias, category.key)}
      navLabel={t({ es: 'Familias de la tienda', gl: 'Familias da tenda' })}
      notice={t({
        es: 'Cada pieza se encarga hablando. Escríbeme por WhatsApp o por correo y lo organizamos.',
        gl: 'Cada peza se encarga falando. Escríbeme por WhatsApp ou por correo e organizámolo.',
      })}
    />
  )
}
