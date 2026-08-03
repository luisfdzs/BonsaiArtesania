import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { RequestCodeForm } from '@/components/entrar/RequestCodeForm'
import { isLocale, pick, translator } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ volver?: string }>
}

const TITLE = { es: 'Contraseña olvidada', gl: 'Contrasinal esquecido' }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: isLocale(locale) ? pick(TITLE, locale) : TITLE.es,
    robots: { index: false, follow: false },
  }
}

/**
 * Contraseña olvidada.
 *
 * Es el mismo trámite que el alta —un código al correo y una contraseña— y por eso
 * comparte formulario y comparte pantalla de código. Lo único que cambia es qué se
 * hace al final: allí se crea la cuenta, aquí se le pone clave nueva a la que ya
 * existe y se cierran de paso todas las sesiones abiertas.
 *
 * Esta página es también, sin decirlo, la puerta de las cuentas anteriores a que
 * hubiera contraseñas: quien tenga una entrará por aquí la primera vez.
 */
export default async function RecuperarPage({ params, searchParams }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = translator(locale)

  const session = await auth()
  if (session?.user) redirect(path(locale, '/cuenta'))

  const { volver } = await searchParams

  return (
    <div className="page-gutter flex min-h-[70vh] items-center pt-16 pb-(--spacing-section) md:pt-24">
      <div className="mx-auto w-full max-w-sm text-center">
        <h1 className="font-serif text-title">{t(TITLE)}</h1>

        <p className="mt-5 text-bark-soft">
          {t({
            es: 'Escribe el correo de tu cuenta y te envío un código de seis cifras para poder poner una contraseña nueva.',
            gl: 'Escribe o correo da túa conta e envíoche un código de seis cifras para poder poñer un contrasinal novo.',
          })}
        </p>

        <RequestCodeForm purpose="recuperar" backTo={volver ?? path(locale, '/cuenta')} />

        <p className="mt-8 text-small text-bark-faint">
          {t({ es: '¿Ya te acuerdas?', gl: 'Xa te lembras?' })}{' '}
          <Link href={path(locale, '/entrar')} className="link-underline">
            {t({ es: 'Volver a iniciar sesión', gl: 'Volver a iniciar sesión' })}
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
