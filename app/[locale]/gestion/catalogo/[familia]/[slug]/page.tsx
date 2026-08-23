import { notFound } from 'next/navigation'
import { PiezaEditor } from '@/components/gestion/PiezaEditor'
import { familiasDelPanel, piezaDelPanel } from '@/lib/catalogo-panel'
import { isLocale, pick } from '@/lib/i18n/config'

type Params = { params: Promise<{ locale: string; familia: string; slug: string }> }

/**
 * Editar una pieza: sus textos en los dos idiomas, su familia y sus fotos.
 *
 * Cuelga de la familia y no de `/gestion/catalogo/[slug]` porque a esta pantalla
 * se llega desde la rejilla de una familia y se vuelve a ella; llevar la familia
 * en la dirección es lo que permite que «volver» sepa a dónde.
 */
export default async function EditarPieza({ params }: Params) {
  const { locale, familia, slug } = await params
  if (!isLocale(locale)) notFound()

  const pieza = await piezaDelPanel(slug)
  if (!pieza) notFound()

  const familias = await familiasDelPanel()

  return (
    <PiezaEditor
      locale={locale}
      volverA={familia}
      pieza={pieza}
      familias={familias.map((una) => ({ key: una.key, label: pick(una.label, locale) }))}
    />
  )
}
