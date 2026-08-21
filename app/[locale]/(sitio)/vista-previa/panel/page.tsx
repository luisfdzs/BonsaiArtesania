import { notFound } from 'next/navigation'
import { Panel } from '../Panel'
import { isLocale } from '@/lib/i18n/config'

type Params = { params: Promise<{ locale: string }> }

/** Los mandos de la prueba de navegación, para tenerlos en otra pestaña. */
export default async function PanelPage({ params }: Params) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return <Panel />
}
