import { notFound, redirect } from 'next/navigation'
import { shopFamilies } from '@/components/tienda/families'
import { isLocale } from '@/lib/i18n/config'

type Params = { params: Promise<{ locale: string }> }

export default async function TiendaPage({ params }: Params) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const primera = shopFamilies(locale)[0]
  if (!primera) notFound()

  redirect(primera.href)
}
