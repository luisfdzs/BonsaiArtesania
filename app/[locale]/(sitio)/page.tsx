import { notFound } from 'next/navigation'
import { ContactoSection } from '@/components/sections/ContactoSection'
import { DestacadasSection } from '@/components/sections/DestacadasSection'
import { EncargosSection } from '@/components/sections/EncargosSection'
import { Hero } from '@/components/sections/Hero'
import { isLocale } from '@/lib/i18n/config'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <>
      <Hero locale={locale} />
      {/* Dónde aterriza el «Catálogo» del hero, medido y no a ojo.

          El ancla llevaba `scroll-mt-20 md:scroll-mt-24` —el alto de la cabecera—
          para no quedarse debajo de ella. Pero eso ya lo hace `scroll-padding-top:
          6rem` en `html`, y los dos se suman: el catálogo aterrizaba 176 px por
          debajo del techo en vez de 80, o sea con la marca de la cabecera flotando
          sola sobre el lino y el carrusel de familias muy por debajo.

          Así que aquí sólo queda el descuento: el margen negativo vale el `pt` de la
          sección —1rem— más lo que la cabecera mide de menos que el relleno global.
          Con eso el carril de familias, que es `sticky` a la altura exacta de la
          cabecera, aterriza pegado a ella y las dos se leen como una sola pieza: el
          nombre del taller y sus familias. Ver `DestacadasSection` y `shop-nav`. */}
      <div id="catalogo" className="-scroll-mt-8 md:-scroll-mt-4">
        <DestacadasSection locale={locale} />
      </div>
      {/* Los encargos y el taller, en ese orden y en una sola sección: eran una
          página aparte y una sección suelta que contaban lo mismo. Ver
          `EncargosSection`. */}
      <EncargosSection locale={locale} />
      <ContactoSection locale={locale} />
    </>
  )
}
