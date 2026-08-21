import { notFound } from 'next/navigation'
import { Pruebas } from './Pruebas'
import { shopFamilies } from '@/components/tienda/families'
import { isLocale } from '@/lib/i18n/config'
import type { Locale } from '@/lib/i18n/config'

type Params = { params: Promise<{ locale: string }> }

/**
 * Banco de pruebas de la navegación del catálogo. No está enlazada desde ninguna
 * parte: se abre a mano para elegir el modelo de plegado y afinar los números que
 * luego se escriben en `MAZO`. Ver `motorDelMazo`.
 */
export default async function VistaPreviaPage({ params }: Params) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return <Pruebas familias={shopFamilies(locale)} locale={locale as Locale} />
}
