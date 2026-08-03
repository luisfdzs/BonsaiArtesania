import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CategoryNav } from '@/components/tienda/CategoryNav'
import { ProductGrid } from '@/components/tienda/ProductGrid'
import { categories, getCategoryInfo, productsByCategory } from '@/content/products'
import { shopOpen } from '@/lib/shop'

type Params = { params: Promise<{ categoria: string }> }

/**
 * Subsección de la tienda: una familia entera, sin el tope de la portada.
 *
 * Cuelga de `/tienda/categoria/…` y no de `/tienda/…` a propósito: ahí ya vive
 * la ficha de pieza (`[slug]`), y compartir segmento obligaría a distinguir en
 * tiempo de ejecución si «pendientes» es una familia o una pieza. Un segmento
 * propio lo hace imposible por construcción.
 */
export function generateStaticParams() {
  return categories
    .filter((category) => productsByCategory(category.key).length > 0)
    .map((category) => ({ categoria: category.key }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { categoria } = await params
  const category = getCategoryInfo(categoria)
  if (!category) return {}

  return {
    title: category.label,
    description: category.intro,
    alternates: { canonical: `/tienda/categoria/${category.key}` },
  }
}

export default async function CategoriaPage({ params }: Params) {
  const { categoria } = await params
  const category = getCategoryInfo(categoria)
  if (!category) notFound()

  const items = productsByCategory(category.key)
  if (items.length === 0) notFound()

  return (
    <div className="page-gutter pt-10 md:pt-16">
      <Link href="/tienda" className="link-underline tap eyebrow">
        ← Tienda
      </Link>

      <header className="mt-10 max-w-xl">
        <h1 className="font-serif text-display">{category.label}</h1>
        <p className="mt-7 text-bark-soft">{category.intro}</p>
        <p className="mt-5 text-small text-bark-faint">
          {items.length === 1 ? '1 pieza' : `${items.length} piezas`}
        </p>

        {/* El aviso sobra en «Del taller»: ahí no hay nada que pedir ni con el
            carrito abierto. */}
        {!shopOpen && category.key !== 'taller' && (
          <p className="mt-8 bg-petal-soft p-5 text-small text-bark-soft">
            Cada pieza se encarga hablando. Escríbeme por WhatsApp o por correo y lo organizamos.
          </p>
        )}
      </header>

      <CategoryNav current={category.key} className="mt-12" />

      <section className="mt-16">
        <ProductGrid items={items} priority />
      </section>
    </div>
  )
}
