import Link from 'next/link'
import { ContactoSection } from '@/components/sections/ContactoSection'
import { Hero } from '@/components/sections/Hero'
import { ProductCard } from '@/components/sections/ProductCard'
import { TallerSection } from '@/components/sections/TallerSection'
import { Reveal } from '@/components/ui/Reveal'
import { featuredProducts } from '@/content/products'

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="page-gutter">
        <div className="border-b border-line pb-4">
          <h2 className="eyebrow">Piezas destacadas</h2>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product, index) => (
            <Reveal key={product.slug} step={index % 3}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>

        {/* Seguir a la tienda es lo que toca después de mirar las tres piezas,
            no antes: arriba, junto al encabezado, el enlace invitaba a saltarse
            justo lo que la sección venía a enseñar. De ancho completo porque
            aquí ya no compite con nada —cierra la sección— y porque así el
            pulgar lo encuentra sin apuntar. */}
        <Reveal className="mt-16">
          <Link href="/tienda" className="btn w-full">
            Ver todas las piezas
          </Link>
        </Reveal>
      </section>

      <TallerSection />
      <ContactoSection />
    </>
  )
}
