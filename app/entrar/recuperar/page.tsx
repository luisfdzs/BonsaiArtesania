import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { RequestCodeForm } from '@/components/entrar/RequestCodeForm'

export const metadata: Metadata = {
  title: 'Contraseña olvidada',
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{ volver?: string }>
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
export default async function RecuperarPage({ searchParams }: Props) {
  const session = await auth()
  if (session?.user) redirect('/cuenta')

  const { volver } = await searchParams

  return (
    <div className="page-gutter flex min-h-[70vh] items-center pt-16 pb-(--spacing-section) md:pt-24">
      <div className="mx-auto w-full max-w-sm text-center">
        <h1 className="font-serif text-title">Contraseña olvidada</h1>

        <p className="mt-5 text-bark-soft">
          Escribe el correo de tu cuenta y te envío un código de seis cifras para poder poner una
          contraseña nueva.
        </p>

        <RequestCodeForm purpose="recuperar" backTo={volver ?? '/cuenta'} />

        <p className="mt-8 text-small text-bark-faint">
          ¿Ya te acuerdas?{' '}
          <Link href="/entrar" className="link-underline">
            Volver a iniciar sesión
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
