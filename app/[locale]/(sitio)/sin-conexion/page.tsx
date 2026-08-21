import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Leaf } from '@/components/ui/Media'
import { isLocale, pick, translator } from '@/lib/i18n/config'

type Params = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  return {
    title: pick({ es: 'Sin conexión', gl: 'Sen conexión' }, locale),
    robots: { index: false, follow: false },
  }
}

export default async function SinConexion({ params }: Params) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const t = translator(locale)

  return (
    <div className="page-gutter grid min-h-[60svh] place-items-center py-24 text-center">
      <div>
        <Leaf className="mx-auto h-10 w-10 text-sage" />
        <h1 className="mt-8 font-serif text-title">
          {t({ es: 'Te quedaste sin conexión', gl: 'Quedaches sen conexión' })}
        </h1>
        <p className="mt-4 text-bark-soft">
          {t({
            es: 'La página vuelve en cuanto haya cobertura.',
            gl: 'A páxina volve en canto haxa cobertura.',
          })}
        </p>
      </div>
    </div>
  )
}
