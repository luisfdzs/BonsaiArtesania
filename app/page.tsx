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
        <div className="flex items-baseline justify-between border-b border-line pb-4">
          <h2 className="eyebrow">Piezas destacadas</h2>
          <Link href="/tienda" className="link-underline tap text-small">
            Ver todo
          </Link>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product, index) => (
            <Reveal key={product.slug} step={index % 3}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </section>

      <TallerSection />
      <ContactoSection />
    </>
  )
}
