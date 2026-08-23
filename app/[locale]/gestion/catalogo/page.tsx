import { notFound, redirect } from 'next/navigation'
import { familiasDelPanel } from '@/lib/catalogo-panel'
import { isLocale } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { VistaDeFamilia } from './vista'

type Params = { params: Promise<{ locale: string }> }

/**
 * La puerta del catálogo: enseña la primera familia, sin rebotar a su dirección.
 *
 * Antes redirigía, y por eso entrar desde la barra parpadeaba: la espera se daba
 * por terminada al acabar la primera navegación y la segunda arrancaba con la
 * pantalla vacía. Ver `VistaDeFamilia`.
 *
 * El único desvío que queda es el del taller recién estrenado: sin ninguna
 * familia no hay nada que enseñar, y lo que hace falta es la pantalla donde se
 * crea la primera.
 */
export default async function CatalogoPage({ params }: Params) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const familias = await familiasDelPanel()
  const primera = familias[0]
  if (!primera) redirect(path(locale, '/gestion/catalogo/familias'))

  return <VistaDeFamilia locale={locale} familia={primera.key} />
}
