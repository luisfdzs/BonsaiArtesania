import type { Metadata } from 'next'
import { ProductCard } from '@/components/sections/ProductCard'
import { Reveal } from '@/components/ui/Reveal'
import { categories, productsByCategory } from '@/content/products'

export const metadata: Metadata = {
  title: 'Tienda',
  description: 'Pendientes, anillos y colgantes de resina con flores naturales. Piezas únicas.',
}

/**
 * Catálogo completo, agrupado por familia. Con este número de piezas un filtro
 * sería más trabajo para el visitante que scroll: se ve todo de una pasada.
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
      </header>

      {categories.map((category) => {
        const items = productsByCategory(category.key)
        if (items.length === 0) return null

        return (
          <section key={category.key} className="mt-(--spacing-section)">
            <div className="flex items-baseline justify-between border-b border-line pb-4">
              <h2 className="eyebrow">{category.label}</h2>
              <p className="text-small text-bark-faint">{category.note}</p>
            </div>

            <div className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product, index) => (
                <Reveal key={product.slug} step={index % 3}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
