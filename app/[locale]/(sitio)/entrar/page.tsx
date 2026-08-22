import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { auth, googleEnabled } from '@/auth'
import { EntrarTabs } from '@/components/entrar/EntrarTabs'
import { isLocale, pick, translator, type Locale } from '@/lib/i18n/config'
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
  searchParams: Promise<{ volver?: string; modo?: string; error?: string }>
}

/**
 * Entrar y crear cuenta.
 *
 * Ahora las dos pestañas sí son dos cosas distintas —antes eran el mismo enlace por
 * correo con otro rótulo—: a la izquierda se entra con la contraseña de siempre, y
 * a la derecha se empieza un alta que pasa por el buzón una única vez, la del día
 * en que se crea la cuenta.
 *
 * El `?error=...` de la URL sólo cuenta lo que le pasa a Google, que es lo único
 * que falla fuera de esta página y vuelve sin sitio donde decirlo. Lo de cada
 * formulario lo sigue diciendo el formulario, que no tiene por qué dejar el fallo
 * pegado al historial.
 */
function googleError(code: string | undefined, locale: Locale): string | undefined {
  if (!code) return undefined
  const t = translator(locale)

  if (code === 'AccessDenied') {
    return t({
      es: 'No se ha podido entrar con Google: o se ha cancelado, o esa cuenta tiene el correo sin confirmar. Puedes entrar con tu contraseña o crear la cuenta con tu correo.',
      gl: 'Non se puido entrar con Google: ou se cancelou, ou esa conta ten o correo sen confirmar. Podes entrar co teu contrasinal ou crear a conta co teu correo.',
    })
  }

  return t({
    es: 'No se ha podido entrar con Google. Inténtalo otra vez, o entra con tu correo y tu contraseña.',
    gl: 'Non se puido entrar con Google. Inténtao outra vez, ou entra co teu correo e o teu contrasinal.',
  })
}

export default async function EntrarPage({ params, searchParams }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const session = await auth()
  const { volver, modo, error } = await searchParams

  const cuenta = path(locale, '/cuenta')

  // Ya identificado: no tiene sentido ver el formulario de acceso.
  if (session?.user) redirect(volver ?? cuenta)

  const creating = modo === 'crear'
  const backTo = volver ?? cuenta
  const entrarHref = `${path(locale, '/entrar')}${volver ? `?volver=${encodeURIComponent(volver)}` : ''}`
  const crearHref = `${path(locale, '/entrar')}?modo=crear${volver ? `&volver=${encodeURIComponent(volver)}` : ''}`

  return (
    <div className="page-gutter flex min-h-[70vh] items-center pt-16 pb-(--spacing-section) md:pt-24">
      {/* Un paso más ancha que antes —`max-w-sm`—: la tarjeta se lleva un relleno
          a cada lado, y sin ese paso la columna de dentro salía más estrecha de lo
          que era cuando el formulario iba suelto sobre el lino. */}
      <div className="mx-auto w-full max-w-md text-center">
        <EntrarTabs
          creating={creating}
          backTo={backTo}
          entrarHref={entrarHref}
          crearHref={crearHref}
          google={googleEnabled}
          error={googleError(error, locale)}
        />
      </div>
    </div>
  )
}
