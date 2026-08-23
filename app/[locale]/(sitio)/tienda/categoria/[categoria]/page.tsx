import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { VueltaAlPanel } from '@/components/gestion/VueltaAlPanel'
import { shopFamilies, shopIndex } from '@/components/tienda/families'
import { ShopBoard } from '@/components/tienda/ShopBoard'
import { familiaPorClave, piezasDeFamilia } from '@/lib/catalogo'
import { isLocale, pick, translator } from '@/lib/i18n/config'
import { alternates } from '@/lib/i18n/metadata'
import { path } from '@/lib/i18n/routes'

type Params = { params: Promise<{ locale: string; categoria: string }> }

/**
 * Subsección de la tienda: una familia entera, sin el tope del índice.
 *
 * Cuelga de `/tienda/categoria/…` y no de `/tienda/…` a propósito: ahí ya vive
 * la ficha de pieza (`[slug]`), y compartir segmento obligaría a distinguir en
 * tiempo de ejecución si «pendientes» es una familia o una pieza. Un segmento
 * propio lo hace imposible por construcción.
 *
 * La clave de la familia **no se traduce**: es el tramo de la dirección, y las
 * direcciones son las mismas en los dos idiomas. Ver `lib/i18n/routes.ts`.
 */
/*
 * Aquí había un `generateStaticParams` que dejaba una página por familia hecha en
 * el build. Ya no: desde que el catálogo lo edita Ana, las familias las decide la
 * base y no el repositorio, y prerenderizarlas obligaría a **compilar** con la
 * base delante y a desplegar para que se viera un cambio. Ahora la página se
 * sirve al pedirla y lo que se cachea es el catálogo, bajo la etiqueta que
 * `lib/catalogo.ts` invalida al publicar. Ver `lib/db.ts`: compilar no necesita
 * base de datos, sólo servir.
 */

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, categoria } = await params
  if (!isLocale(locale)) return {}
  const category = await familiaPorClave(categoria)
  if (!category) return {}

  return {
    title: pick(category.label, locale),
    description: pick(category.intro, locale),
    alternates: alternates(locale, `/tienda/categoria/${category.key}`),
  }
}

export default async function CategoriaPage({ params }: Params) {
  const { locale, categoria } = await params
  if (!isLocale(locale)) notFound()
  const t = translator(locale)

  const category = await familiaPorClave(categoria)
  if (!category) notFound()
  if ((await piezasDeFamilia(category.key)).length === 0) notFound()

  const familias = await shopFamilies(locale)

  return (
    <>
      {/* Sólo para la cuenta del taller: la vuelta a esta misma familia en el
          panel. Ver `VueltaAlPanel`. */}
      <VueltaAlPanel href={path(locale, `/gestion/catalogo/${category.key}`)}>
        Volver a {pick(category.label, locale)} en el panel
      </VueltaAlPanel>

      <ShopBoard
        locale={locale}
        familias={familias}
        current={shopIndex(familias, category.key)}
        navLabel={t({ es: 'Familias de la tienda', gl: 'Familias da tenda' })}
        notice={t({
          es: 'Cada pieza se encarga hablando. Escríbeme por WhatsApp o por correo y lo organizamos.',
          gl: 'Cada peza se encarga falando. Escríbeme por WhatsApp ou por correo e organizámolo.',
        })}
      />
    </>
  )
}
