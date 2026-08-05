import type { Metadata } from 'next'
import Link from 'next/link'
import { CategoryNav } from '@/components/tienda/CategoryNav'
import { ProductGrid } from '@/components/tienda/ProductGrid'
import { ShopPanel } from '@/components/tienda/ShopPanel'
import { categories, PREVIEW_SIZE, productsByCategory } from '@/content/products'
import { isLocale, pick, translator } from '@/lib/i18n/config'
import { alternates } from '@/lib/i18n/metadata'
import { path } from '@/lib/i18n/routes'
import { shopOpen } from '@/lib/shop'

type Params = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  return {
    title: pick({ es: 'Tienda', gl: 'Tenda' }, locale),
    description: pick(
      {
        es: 'Pendientes, anillos y colgantes de resina con flores naturales. Piezas únicas.',
        gl: 'Pendentes, aneis e colgantes de resina con flores naturais. Pezas únicas.',
      },
      locale,
    ),
    alternates: alternates(locale, '/tienda'),
  }
}

/**
 * Catálogo completo, agrupado por familia. Con el archivo entero publicado ya no
 * cabe todo de una pasada, así que cada familia enseña aquí sus primeras
 * {@link PREVIEW_SIZE} piezas y el resto vive en su propia subsección
 * (`/tienda/categoria/<familia>`). La portada de la tienda queda como un índice
 * con muestra, no como un scroll de cien fotos.
 */
export default async function TiendaPage({ params }: Params) {
  const { locale } = await params
  if (!isLocale(locale)) return null
  const t = translator(locale)

  return (
    <div className="page-gutter pt-16 md:pt-24">
      <header className="max-w-xl">
        <h1 className="font-serif text-display">{t({ es: 'Tienda', gl: 'Tenda' })}</h1>
        <p className="mt-7 text-bark-soft">
          {t({
            es: 'Cada pieza está hecha a mano y ninguna sale igual que otra: la foto enseña la forma y el color, y la tuya se hace para ti con su propia flor. Aquí no se agota nada, así que puedes pedir la que quieras cuando quieras.',
            gl: 'Cada peza está feita a man e ningunha sae igual que outra: a foto ensina a forma e a cor, e a túa faise para ti coa súa propia flor. Aquí non se esgota nada, así que podes pedir a que queiras cando queiras.',
          })}
        </p>

        {/* Mientras el carrito esté cerrado conviene decirlo aquí y no dejar
            que se descubra al llegar a la ficha y no encontrar botón. */}
        {!shopOpen && (
          <p className="mt-8 bg-petal-soft p-5 text-small text-bark-soft">
            {t({
              es: 'Cada pieza se encarga hablando. Escríbeme por WhatsApp o por correo y lo organizamos.',
              gl: 'Cada peza se encarga falando. Escríbeme por WhatsApp ou por correo e organizámolo.',
            })}
          </p>
        )}
      </header>

      <CategoryNav locale={locale} className="mt-12" />

      <ShopPanel>
        {categories.map((category, categoryIndex) => {
          const items = productsByCategory(category.key)
          if (items.length === 0) return null

          const shown = items.slice(0, PREVIEW_SIZE)
          const rest = items.length - shown.length

          return (
            <section key={category.key} className="mt-(--spacing-section)">
              <div className="flex items-baseline justify-between gap-6 border-b border-line pb-4">
                <h2 className="eyebrow">
                  <Link
                    href={path(locale, `/tienda/categoria/${category.key}`)}
                    className="link-underline tap"
                  >
                    {t(category.label)}
                  </Link>
                </h2>
                <p className="text-right text-small text-bark-faint">{t(category.note)}</p>
              </div>

              <ProductGrid items={shown} locale={locale} priority={categoryIndex === 0} />

              {rest > 0 && (
                <div className="mt-14 flex justify-center">
                  <Link href={path(locale, `/tienda/categoria/${category.key}`)} className="btn">
                    {t({ es: 'Ver más', gl: 'Ver máis' })} {t(category.plural)}
                  </Link>
                </div>
              )}
            </section>
          )
        })}
      </ShopPanel>
    </div>
  )
}
