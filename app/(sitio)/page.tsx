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

      {/* El `pt` no es decoración: sin él la sección arrancaba pegada al borde del hero.
          Mientras la portada era aire y titular se disimulaba, pero contra un vídeo a
          sangre el filete de «Piezas destacadas» parece parte del hero en vez del
          principio de lo siguiente. `--spacing-section` es el mismo aire con el que
          entran `TallerSection` y `ContactoSection`, así que la página respira igual en
          los tres saltos. */}
      <section className="page-gutter pt-(--spacing-section)">
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
            justo lo que la sección venía a enseñar. Lo que ocupa el ancho es la
            fila, no el botón: centrado bajo la rejilla se ve desde cualquier
            columna, y estirarlo hasta el borde le habría dado un tamaño que no
            tiene ningún otro botón de la web. */}
        {/* «Ver más» a secas basta debajo de la rejilla, donde el destino se
            entiende por el sitio en el que está el botón. Fuera de contexto no,
            así que el `aria-label` conserva la frase completa: un lector de
            pantalla que recorra los enlaces de la página oiría «ver más» sin
            saber más de qué. */}
        <Reveal className="mt-16 flex flex-wrap justify-center gap-x-2 gap-y-3">
          <Link href="/tienda" className="btn" aria-label="Ver todas las piezas">
            Ver más
          </Link>
          <Link href="/encargos" className="btn btn-quiet">
            Personalizar
          </Link>
        </Reveal>
      </section>

      <TallerSection />
      <ContactoSection />
    </>
  )
}
