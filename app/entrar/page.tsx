import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth, signIn } from '@/auth'
import { cn } from '@/lib/cn'
import { FormPending } from '@/components/ui/FormPending'
import { SendIcon } from '@/components/ui/SocialIcons'

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Accede a tu cuenta para ver tus pedidos y tus direcciones de envío.',
  // Una pantalla de acceso no aporta nada en un buscador.
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{ volver?: string; modo?: string; error?: string }>
}

/**
 * Entrar y crear cuenta.
 *
 * Por detrás son lo mismo —se envía un enlace al correo y, si esa dirección no
 * tenía cuenta, se crea al pulsarlo—, pero se presentan como dos pestañas porque
 * es lo que la gente espera encontrar. Cambia el texto, no el mecanismo: quien
 * viene a registrarse no debería tener que deducir que «entrar» también le vale.
 */
export default async function EntrarPage({ searchParams }: Props) {
  const session = await auth()
  const { volver, modo, error } = await searchParams

  // Ya identificado: no tiene sentido ver el formulario de acceso.
  if (session?.user) redirect(volver ?? '/cuenta')

  const creating = modo === 'crear'
  const backTo = volver ?? '/cuenta'

  return (
    <div className="page-gutter flex min-h-[70vh] items-center pt-16 pb-(--spacing-section) md:pt-24">
      <div className="mx-auto w-full max-w-sm text-center">
        <div className="flex justify-center gap-8 border-b border-line pb-4">
          <Link
            href={`/entrar${volver ? `?volver=${encodeURIComponent(volver)}` : ''}`}
            aria-current={!creating ? 'page' : undefined}
            className={cn('tap text-small', creating ? 'text-bark-faint' : 'text-bark')}
          >
            Iniciar sesión
          </Link>
          <Link
            href={`/entrar?modo=crear${volver ? `&volver=${encodeURIComponent(volver)}` : ''}`}
            aria-current={creating ? 'page' : undefined}
            className={cn('tap text-small', creating ? 'text-bark' : 'text-bark-faint')}
          >
            Crear cuenta
          </Link>
        </div>

        <h1 className="mt-10 font-serif text-title">
          {creating ? 'Crear cuenta' : 'Iniciar sesión'}
        </h1>

        <p className="mt-5 text-bark-soft">
          {creating
            ? 'Con una cuenta guardas tus direcciones de envío y puedes seguir tus pedidos. Escribe tu correo y te envío un enlace para entrar.'
            : 'Escribe tu correo y te envío un enlace para entrar. Sin contraseñas que recordar.'}
        </p>

        {error && (
          <p className="field-error mt-8" role="alert">
            {error === 'Verification'
              ? 'Ese enlace ya se ha usado o ha caducado. Pide otro abajo.'
              : 'No se ha podido enviar el enlace. Comprueba el correo y vuelve a intentarlo.'}
          </p>
        )}

        <form
          className="mt-10"
          action={async (formData: FormData) => {
            'use server'
            // El destino se fija aquí, en el servidor, a partir de un valor que ya
            // venía en la URL de esta página: nunca se toma de un campo del
            // formulario, para que no se pueda inyectar una redirección externa.
            await signIn('nodemailer', {
              email: String(formData.get('email') ?? ''),
              redirectTo: backTo,
            })
          }}
        >
          {/* Pedir el enlace es esperar a un servidor de correo, no a la base de
              datos: es la espera más larga y la más variable de todo el sitio, y
              acaba en otra página. Sin nada que lo dijera, el botón se quedaba
              igual varios segundos después de pulsarlo —el momento exacto en el
              que se vuelve a pulsar y llegan dos correos, con la duda de cuál de
              los dos enlaces hay que abrir—. */}
          <FormPending label="Enviando tu enlace" />

          <label className="field-label" htmlFor="email">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tucorreo@ejemplo.com"
            className="field text-center"
          />

          <button
            type="submit"
            aria-label="Enviarme un enlace"
            title="Enviarme un enlace"
            className="btn btn-icon btn-icon-lg mt-8"
          >
            <SendIcon className="h-5 w-5" />
          </button>
        </form>

        <p className="mt-8 text-small text-bark-faint">
          {creating ? (
            <>
              Al crear la cuenta aceptas las{' '}
              <Link href="/legal/condiciones" className="link-underline">
                condiciones de venta
              </Link>{' '}
              y la{' '}
              <Link href="/legal/privacidad" className="link-underline">
                política de privacidad
              </Link>
              .
            </>
          ) : (
            'Si ese correo no tiene cuenta todavía, se creará al pulsar el enlace.'
          )}
        </p>
      </div>
    </div>
  )
}
