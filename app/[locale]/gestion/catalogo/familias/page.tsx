import { notFound } from 'next/navigation'
import { FamiliasPanel } from '@/components/gestion/FamiliasPanel'
import { familiasDelPanel } from '@/lib/catalogo-panel'
import { isLocale } from '@/lib/i18n/config'

type Params = { params: Promise<{ locale: string }> }

/**
 * Las familias del catálogo: crearlas, renombrarlas, ordenarlas y quitarlas.
 *
 * Cuelga de `/gestion/catalogo/familias` y no de `/gestion/familias` porque son
 * parte del catálogo, no una sección aparte del panel. El segmento fijo gana al
 * `[familia]` de al lado, así que no hay que reservar la palabra en ningún sitio.
 */
export default async function FamiliasDelPanel({ params }: Params) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const familias = await familiasDelPanel()

  // Igual que en la rejilla de una familia: la `key` remonta la lista cuando el
  // servidor trae otra cosa, en vez de reajustar el estado durante el render.
  const huella = familias.map((una) => `${una.key}:${una.piezas}`).join()

  return <FamiliasPanel key={huella} locale={locale} familias={familias} />
}
