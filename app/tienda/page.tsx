import type { Metadata } from 'next'
import Link from 'next/link'
import { CategoryNav } from '@/components/tienda/CategoryNav'
import { ProductGrid } from '@/components/tienda/ProductGrid'
import { categories, PREVIEW_SIZE, productsByCategory } from '@/content/products'
import { shopOpen } from '@/lib/shop'

export const metadata: Metadata = {
  title: 'Tienda',
  description: 'Pendientes, anillos y colgantes de resina con flores naturales. Piezas únicas.',
}

/**
 * Catálogo completo, agrupado por familia. Con el archivo entero publicado ya no
 * cabe todo de una pasada, así que cada familia enseña aquí sus primeras
 * {@link PREVIEW_SIZE} piezas y el resto vive en su propia subsección
 * (`/tienda/categoria/<familia>`). La portada de la tienda queda como un índice
 * con muestra, no como un scroll de cien fotos.
 */
export default function TiendaPage() {
  return (
    <div className="page-gutter pt-16 md:pt-24">
      <header className="max-w-xl">
        <h1 className="font-serif text-display">Tienda</h1>
        <p className="mt-7 text-bark-soft">
          Cada pieza está hecha a mano y es irrepetible: la flor que ves en la foto es exactamente
          la que recibes. Si algo se ha agotado, casi siempre puedo hacer otra parecida.
        </p>

        {/* Mientras la tienda esté cerrada conviene decirlo aquí y no dejar
            que se descubra al llegar a la ficha y no encontrar botón. */}
        {!shopOpen && (
          <p className="mt-8 bg-petal-soft p-5 text-small text-bark-soft">
            Todavía no se puede comprar directamente desde la web: cada pieza se encarga hablando.
            Escríbeme por WhatsApp o por correo y lo organizamos.
          </p>
        )}
      </header>

      <CategoryNav className="mt-12" />

      {categories.map((category, categoryIndex) => {
        const items = productsByCategory(category.key)
        if (items.length === 0) return null

        const shown = items.slice(0, PREVIEW_SIZE)
        const rest = items.length - shown.length

        return (
          <section key={category.key} className="mt-(--spacing-section)">
            <div className="flex items-baseline justify-between gap-6 border-b border-line pb-4">
              {/* El título es el enlace a la subsección: quien ya sabe qué busca
                  no tiene que bajar hasta el botón del final. */}
              <h2 className="eyebrow">
                <Link href={`/tienda/categoria/${category.key}`} className="link-underline tap">
                  {category.label}
                </Link>
              </h2>
              <p className="text-right text-small text-bark-faint">{category.note}</p>
            </div>

            <ProductGrid items={shown} priority={categoryIndex === 0} />

            {rest > 0 && (
              <div className="mt-14 flex justify-center">
                <Link href={`/tienda/categoria/${category.key}`} className="btn">
                  Ver más {category.plural}
                  <span className="text-bark-faint">({rest})</span>
                </Link>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
