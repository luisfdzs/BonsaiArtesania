import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CategoryNav } from '@/components/tienda/CategoryNav'
import { ProductGrid } from '@/components/tienda/ProductGrid'
import { categories, getCategoryInfo, productsByCategory } from '@/content/products'
import { isLocale, locales, pick, translator } from '@/lib/i18n/config'
import { alternates } from '@/lib/i18n/metadata'
import { path } from '@/lib/i18n/routes'
import { shopOpen } from '@/lib/shop'

type Params = { params: Promise<{ locale: string; categoria: string }> }

/**
 * Subsección de la tienda: una familia entera, sin el tope de la portada.
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

  const items = productsByCategory(category.key)
  if (items.length === 0) notFound()

  return (
    <div className="page-gutter pt-10 md:pt-16">
      <Link href={path(locale, '/tienda')} className="link-underline tap eyebrow">
        ← {t({ es: 'Tienda', gl: 'Tenda' })}
      </Link>

      <header className="mt-10 max-w-xl">
        <h1 className="font-serif text-display">{t(category.label)}</h1>
        <p className="mt-7 text-bark-soft">{t(category.intro)}</p>
        <p className="mt-5 text-small text-bark-faint">
          {items.length === 1
            ? t({ es: '1 pieza', gl: '1 peza' })
            : `${items.length} ${t({ es: 'piezas', gl: 'pezas' })}`}
        </p>

        {/* El aviso sobra en «Del taller»: ahí no hay nada que pedir ni con el
            carrito abierto. */}
        {!shopOpen && category.key !== 'taller' && (
          <p className="mt-8 bg-petal-soft p-5 text-small text-bark-soft">
            {t({
              es: 'Cada pieza se encarga hablando. Escríbeme por WhatsApp o por correo y lo organizamos.',
              gl: 'Cada peza se encarga falando. Escríbeme por WhatsApp ou por correo e organizámolo.',
            })}
          </p>
        )}
      </header>

      <CategoryNav current={category.key} locale={locale} className="mt-12" />

      <section className="mt-16">
        <ProductGrid items={items} locale={locale} priority />
      </section>
    </div>
  )
}
