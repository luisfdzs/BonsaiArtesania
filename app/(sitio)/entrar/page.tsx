import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { LoginForm } from '@/components/entrar/LoginForm'
import { RequestCodeForm } from '@/components/entrar/RequestCodeForm'
import { NavPending } from '@/components/ui/NavPending'
import { cn } from '@/lib/cn'

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Accede a tu cuenta para ver tus pedidos y tus direcciones de envío.',
  // Una pantalla de acceso no aporta nada en un buscador.
  robots: { index: false, follow: false },
}

type Props = {
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
export default async function EntrarPage({ searchParams }: Props) {
  const session = await auth()
  const { volver, modo } = await searchParams

  // Ya identificado: no tiene sentido ver el formulario de acceso.
  if (session?.user) redirect(volver ?? '/cuenta')

  const creating = modo === 'crear'
  const backTo = volver ?? '/cuenta'
  const crearHref = `/entrar?modo=crear${volver ? `&volver=${encodeURIComponent(volver)}` : ''}`

  return (
    <div className="page-gutter flex min-h-[70vh] items-center pt-16 pb-(--spacing-section) md:pt-24">
      <div className="mx-auto w-full max-w-sm text-center">
        {/* Las dos pestañas esperan y no lo parecen: cambian un parámetro de esta
            misma dirección, pero cada una vuelve al servidor —`auth()` es un
            viaje a Atlas antes de pintar nada—. Al no cambiar de segmento, el
            `loading.tsx` de esta carpeta no se vuelve a enseñar: su frontera ya
            está resuelta y React se limita a esperar callado con la pestaña
            vieja en pantalla. De ahí la flor desde el propio enlace, con
            `NavPending`, igual que en el icono de Cuenta de la cabecera. */}
        <div className="flex justify-center gap-8 border-b border-line pb-4">
          <Link
            href={`/entrar${volver ? `?volver=${encodeURIComponent(volver)}` : ''}`}
            aria-current={!creating ? 'page' : undefined}
            className={cn('tap text-small', creating ? 'text-bark-faint' : 'text-bark')}
          >
            Iniciar sesión
            <NavPending label="Preparando la entrada" />
          </Link>
          <Link
            href={crearHref}
            aria-current={creating ? 'page' : undefined}
            className={cn('tap text-small', creating ? 'text-bark' : 'text-bark-faint')}
          >
            Crear cuenta
            <NavPending label="Preparando tu alta" />
          </Link>
        </div>

        <h1 className="mt-10 font-serif text-title">
          {creating ? 'Crear cuenta' : 'Iniciar sesión'}
        </h1>

        <p className="mt-5 text-bark-soft">
          {creating
            ? 'Con una cuenta guardas tus direcciones de envío y puedes seguir tus pedidos. Escribe tu correo y te envío un código para confirmarlo.'
            : 'Entra con el correo y la contraseña de tu cuenta.'}
        </p>

        {creating ? (
          <RequestCodeForm purpose="alta" backTo={backTo} />
        ) : (
          <LoginForm backTo={backTo} />
        )}

        {/* Sólo en el lado de «entrar»: al darse de alta no queda nada que decir
            aquí debajo, y un párrafo vacío dejaría un hueco sin motivo. */}
        {!creating && (
          <p className="mt-8 text-small text-bark-faint">
            ¿Todavía no tienes cuenta?{' '}
            {/* Lleva a la misma pestaña de arriba, así que espera igual. */}
            <Link href={crearHref} className="link-underline">
              Créala en un minuto
              <NavPending label="Preparando tu alta" />
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  )
}
