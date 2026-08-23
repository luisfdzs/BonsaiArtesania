import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/sections/ProductCard'
import { AddToCart } from '@/components/tienda/AddToCart'
import { productGridClass } from '@/components/tienda/ProductGrid'
import { VueltaAlPanel } from '@/components/gestion/VueltaAlPanel'
import { ContactButtons } from '@/components/ui/ContactButtons'
import { Media } from '@/components/ui/Media'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/cn'
import { piezaPorSlug, todasLasPiezas } from '@/lib/catalogo'
import { orderMessage } from '@/lib/contact'
import { isLocale, pick, translator } from '@/lib/i18n/config'
import { alternates } from '@/lib/i18n/metadata'
import { path } from '@/lib/i18n/routes'
import { shopOpen } from '@/lib/shop'

type Params = { params: Promise<{ locale: string; slug: string }> }

/*
 * Las fichas se generaban aquí en el build, cuando el catálogo era un array del
 * repositorio. Desde que lo edita Ana ya no: una pieza nueva tiene que poder
 * verse al publicarla, sin compilar nada. La página se sirve al pedirla y lo
 * cacheado es el catálogo —etiqueta `catalogo`, que se invalida al publicar—.
 */

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const product = await piezaPorSlug(slug)
  if (!product) return {}

  return {
    title: pick(product.name, locale),
    description: pick(product.summary, locale),
    alternates: alternates(locale, `/tienda/${product.slug}`),
  }
}

export default async function ProductPage({ params }: Params) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const t = translator(locale)

  const product = await piezaPorSlug(slug)
  if (!product) notFound()

  const name = t(product.name)
  const message = orderMessage(name, locale)
  // Tres sugerencias de la misma familia; si la familia es corta, se completa con
  // el resto del catálogo antes que dejar el bloque a medias.
  const related = (await todasLasPiezas())
    .filter((item) => item.slug !== product.slug)
    .sort(
      (a, b) => Number(b.category === product.category) - Number(a.category === product.category),
    )
    .slice(0, 3)

  return (
    <>
      {/* Sólo lo ve la cuenta del taller: es la vuelta al panel desde el ojo de
          la tarjeta. Para todo el mundo esto no existe. */}
      <VueltaAlPanel href={path(locale, `/gestion/catalogo/${product.category}/${product.slug}`)}>
        Volver a editar esta pieza
      </VueltaAlPanel>

      <div className="page-gutter pt-10 md:pt-16">
        <article className="grid gap-14 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-7">
            <Media
              image={product.image && t(product.image)}
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
            <p className="eyebrow">{t(product.summary)}</p>
            <h1 className="mt-5 font-serif text-title">{name}</h1>

            <div className="mt-9 space-y-5 text-bark-soft">
              {t(product.description).map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

            <dl className="mt-10 border-t border-line pt-6">
              <dt className="eyebrow">{t({ es: 'Materiales', gl: 'Materiais' })}</dt>
              <dd className="mt-3 text-small">{t(product.materials).join(' · ')}</dd>
            </dl>

            {/* Con el carrito cerrado, cualquier pieza se encarga hablando: es como
              funcionaba la web antes de tenerlo, así que no se pierde nada.
              Una pieza de catálogo se pide desde el carrito, y ésa es aquí la única
              acción: los iconos de WhatsApp y correo que la acompañaban bajo un
              «¿Alguna duda?» se quitaron porque la sección de contacto ya está
              para eso y aquí sólo repartían la atención.
              Las piezas a medida no pasan por el carrito, así que ahí escribir
              sigue siendo la única acción. */}
            {product.price === null || !shopOpen ? (
              <ContactButtons
                message={message}
                subject={`${t({ es: 'Encargo', gl: 'Encarga' })} · ${name}`}
                action={
                  product.price === null
                    ? t({ es: 'Escribir a Ana', gl: 'Escribir a Ana' })
                    : t({ es: 'Encargar esta pieza', gl: 'Encargar esta peza' })
                }
                className="mt-11"
              />
            ) : (
              <div className="mt-11">
                <AddToCart slug={product.slug} />
              </div>
            )}
            <p className="mt-6 text-small text-bark-faint">
              {t({
                es: 'Hecha a mano para ti: entre 1 y 3 semanas. Envío a toda España.',
                gl: 'Feita a man para ti: entre 1 e 3 semanas. Envío a toda España.',
              })}
            </p>
          </div>
        </article>

        <section className="mt-(--spacing-section)">
          <h2 className="eyebrow border-b border-line pb-4">
            {t({ es: 'También te puede gustar', gl: 'Tamén te pode gustar' })}
          </h2>
          <div className={cn('mt-12', productGridClass)}>
            {related.map((item, index) => (
              <Reveal key={item.slug} step={index}>
                <ProductCard product={item} locale={locale} />
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
