import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { EntrarTabs } from '@/components/entrar/EntrarTabs'
import { isLocale, pick } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'

const TITLE = { es: 'Entrar', gl: 'Entrar' }

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  return {
    title: pick(TITLE, locale),
    description: pick(
      {
        es: 'Accede a tu cuenta para ver tus pedidos y tus direcciones de envío.',
        gl: 'Accede á túa conta para ver os teus pedidos e os teus enderezos de envío.',
      },
      locale,
    ),
    // Una pantalla de acceso no aporta nada en un buscador.
    robots: { index: false, follow: false },
  }
}

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ volver?: string; modo?: string }>
}

/**
 * Entrar y crear cuenta.
 *
 * Ahora las dos pestañas sí son dos cosas distintas —antes eran el mismo enlace por
 * correo con otro rótulo—: a la izquierda se entra con la contraseña de siempre, y
 * a la derecha se empieza un alta que pasa por el buzón una única vez, la del día
 * en que se crea la cuenta.
 *
 * Se ha quitado el aviso de errores por la URL (`?error=...`) que ponía aquí
 * Auth.js: ya no hay ningún proveedor suyo que pueda fallar, y cada formulario
 * cuenta lo suyo en su propio sitio en vez de a través de un parámetro que se queda
 * pegado al historial.
 */
export default async function EntrarPage({ params, searchParams }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const session = await auth()
  const { volver, modo } = await searchParams

  const cuenta = path(locale, '/cuenta')

  // Ya identificado: no tiene sentido ver el formulario de acceso.
  if (session?.user) redirect(volver ?? cuenta)

  const creating = modo === 'crear'
  const backTo = volver ?? cuenta
  const entrarHref = `${path(locale, '/entrar')}${volver ? `?volver=${encodeURIComponent(volver)}` : ''}`
  const crearHref = `${path(locale, '/entrar')}?modo=crear${volver ? `&volver=${encodeURIComponent(volver)}` : ''}`

  return (
    <div className="page-gutter flex min-h-[70vh] items-center pt-16 pb-(--spacing-section) md:pt-24">
      <div className="mx-auto w-full max-w-sm text-center">
        <EntrarTabs
          creating={creating}
          backTo={backTo}
          entrarHref={entrarHref}
          crearHref={crearHref}
        />
      </div>
    </div>
  )
}
