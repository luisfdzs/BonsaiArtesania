import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { LoginForm } from '@/components/entrar/LoginForm'
import { RequestCodeForm } from '@/components/entrar/RequestCodeForm'
import { NavPending } from '@/components/ui/NavPending'
import { cn } from '@/lib/cn'
import { isLocale, pick, translator } from '@/lib/i18n/config'
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
  const t = translator(locale)

  const session = await auth()
  const { volver, modo } = await searchParams

  const cuenta = path(locale, '/cuenta')

  // Ya identificado: no tiene sentido ver el formulario de acceso.
  if (session?.user) redirect(volver ?? cuenta)

  const creating = modo === 'crear'
  const backTo = volver ?? cuenta
  const entrarHref = `${path(locale, '/entrar')}${volver ? `?volver=${encodeURIComponent(volver)}` : ''}`
  const crearHref = `${path(locale, '/entrar')}?modo=crear${volver ? `&volver=${encodeURIComponent(volver)}` : ''}`

  const crearCuenta = t({ es: 'Crear cuenta', gl: 'Crear conta' })
  const iniciarSesion = t({ es: 'Iniciar sesión', gl: 'Iniciar sesión' })
  const preparandoAlta = t({ es: 'Preparando tu alta', gl: 'Preparando a túa alta' })

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
            href={entrarHref}
            aria-current={!creating ? 'page' : undefined}
            className={cn('tap text-small', creating ? 'text-bark-faint' : 'text-bark')}
          >
            {iniciarSesion}
            <NavPending label={t({ es: 'Preparando la entrada', gl: 'Preparando a entrada' })} />
          </Link>
          <Link
            href={crearHref}
            aria-current={creating ? 'page' : undefined}
            className={cn('tap text-small', creating ? 'text-bark' : 'text-bark-faint')}
          >
            {crearCuenta}
            <NavPending label={preparandoAlta} />
          </Link>
        </div>

        <h1 className="mt-10 font-serif text-title">{creating ? crearCuenta : iniciarSesion}</h1>

        <p className="mt-5 text-bark-soft">
          {creating
            ? t({
                es: 'Con una cuenta guardas tus direcciones de envío y puedes seguir tus pedidos. Escribe tu correo y te envío un código para confirmarlo.',
                gl: 'Cunha conta gardas os teus enderezos de envío e podes seguir os teus pedidos. Escribe o teu correo e envíoche un código para confirmalo.',
              })
            : t({
                es: 'Entra con el correo y la contraseña de tu cuenta.',
                gl: 'Entra co correo e o contrasinal da túa conta.',
              })}
        </p>

        {creating ? (
          <RequestCodeForm purpose="alta" backTo={backTo} />
        ) : (
          <LoginForm backTo={backTo} />
        )}

        {/* Al darse de alta, el aviso de privacidad; al entrar, el enlace al alta.
            El primero va aquí porque éste es el momento en que se recoge el correo,
            y decirlo donde se pide es justo lo que exige el RGPD (art. 13). */}
        {creating ? (
          <p className="mt-8 text-small text-bark-faint">
            {t({
              es: 'Al crear la cuenta, tus datos se tratan como se explica en',
              gl: 'Ao crear a conta, os teus datos trátanse como se explica en',
            })}{' '}
            <Link href={path(locale, '/legal/privacidad')} className="link-underline">
              {t({ es: 'privacidad', gl: 'privacidade' })}
            </Link>
            .
          </p>
        ) : (
          <p className="mt-8 text-small text-bark-faint">
            {t({ es: '¿Todavía no tienes cuenta?', gl: 'Aínda non tes conta?' })}{' '}
            {/* Lleva a la misma pestaña de arriba, así que espera igual. */}
            <Link href={crearHref} className="link-underline">
              {t({ es: 'Créala en un minuto', gl: 'Créaa nun minuto' })}
              <NavPending label={preparandoAlta} />
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  )
}
