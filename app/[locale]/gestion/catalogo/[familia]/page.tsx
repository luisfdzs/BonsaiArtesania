import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/config'
import { VistaDeFamilia } from '../vista'

type Params = { params: Promise<{ locale: string; familia: string }> }

/**
 * El espacio de fotos de una familia concreta. Lo que se pinta es lo mismo que en
 * `/gestion/catalogo`; aquí sólo cambia cuál se abre. Ver `VistaDeFamilia`.
 */
export default async function FamiliaDelPanel({ params }: Params) {
  const { locale, familia } = await params
  if (!isLocale(locale)) notFound()

  return <VistaDeFamilia locale={locale} familia={familia} />
}
