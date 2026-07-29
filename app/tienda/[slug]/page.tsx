import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/sections/ProductCard'
import { AddToCart } from '@/components/tienda/AddToCart'
import { ContactButtons } from '@/components/ui/ContactButtons'
import { Media } from '@/components/ui/Media'
import { Reveal } from '@/components/ui/Reveal'
import { formatPrice, getProduct, products } from '@/content/products'
import { orderMessage } from '@/lib/contact'
import { shopOpen } from '@/lib/shop'

type Params = { params: Promise<{ slug: string }> }

/** Todas las fichas se generan en build: no hay base de datos que consultar. */
export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return {}

  return {
    title: product.name,
    description: product.summary,
    alternates: { canonical: `/tienda/${product.slug}` },
  }
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) notFound()

  const message = orderMessage(product.name)
  // Tres sugerencias de la misma familia; si la familia es corta, se completa con
  // el resto del catálogo antes que dejar el bloque a medias.
  const related = products
    .filter((item) => item.slug !== product.slug)
    .sort(
      (a, b) => Number(b.category === product.category) - Number(a.category === product.category),
    )
    .slice(0, 3)

  return (
    <div className="page-gutter pt-10 md:pt-16">
      <Link href="/tienda" className="link-underline tap eyebrow">
        ← Tienda
      </Link>

      <article className="mt-10 grid gap-14 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-7">
          <Media
            image={product.image}
            ratio="4 / 5"
            sizes="(max-width: 768px) 100vw, 55vw"
            priority
            className="border border-line"
          />
        </div>

        {/* Sin `sticky`: la imagen es más alta que esta columna, así que al fijarla
            el texto se quedaba quieto mientras la foto seguía subiendo. La ficha se
            lee mejor como un bloque único que se desplaza a la vez. */}
        <div className="md:col-span-5">
          <p className="eyebrow">{product.summary}</p>
          <h1 className="mt-5 font-serif text-title">{product.name}</h1>
          <p className="mt-5 text-lead text-bark-soft">{formatPrice(product.price)}</p>

          <div className="mt-9 space-y-5 text-bark-soft">
            {product.description.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          <dl className="mt-10 border-t border-line pt-6">
            <dt className="eyebrow">Materiales</dt>
            <dd className="mt-3 text-small">{product.materials.join(' · ')}</dd>
          </dl>

          {/* Con la tienda cerrada, cualquier pieza se encarga hablando: es como
              funcionaba la web antes de tener carrito, así que no se pierde nada.
              Una pieza con precio se compra: el carrito es la acción principal y
              los dos iconos quedan como vía secundaria para preguntar dudas. Los
              tres botones son ya sin rótulo, así que lo que marca la jerarquía es
              el tamaño —el del carrito es mayor— y el orden.
              Las piezas a medida no tienen precio cerrado y no pasan por el
              carrito, así que ahí escribir sigue siendo la única acción. */}
          {product.price === null || !shopOpen ? (
            <ContactButtons
              message={message}
              subject={`Encargo · ${product.name}`}
              action={product.price === null ? 'Pedir presupuesto' : 'Encargar esta pieza'}
              className="mt-11"
            />
          ) : (
            <div className="mt-11 flex flex-col gap-5">
              <AddToCart slug={product.slug} />
              <div className="flex items-center gap-4">
                <span className="eyebrow">¿Alguna duda?</span>
                <ContactButtons
                  message={message}
                  subject={`Encargo · ${product.name}`}
                  action="Preguntar por esta pieza"
                />
              </div>
            </div>
          )}
          <p className="mt-6 text-small text-bark-faint">
            Hecha a mano bajo pedido: entre 1 y 3 semanas. Envío a toda España.
          </p>
        </div>
      </article>

      <section className="mt-(--spacing-section)">
        <h2 className="eyebrow border-b border-line pb-4">También te puede gustar</h2>
        <div className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item, index) => (
            <Reveal key={item.slug} step={index}>
              <ProductCard product={item} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  )
}
