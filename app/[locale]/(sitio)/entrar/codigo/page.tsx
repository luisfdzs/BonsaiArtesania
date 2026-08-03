import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { CodeForm } from '@/components/entrar/CodeForm'
import { isLocale, pick, translator } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { readPending } from '../pending'

type Params = { params: Promise<{ locale: string }> }

const TITLE = { es: 'Tu código', gl: 'O teu código' }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  return {
    title: isLocale(locale) ? pick(TITLE, locale) : TITLE.es,
    robots: { index: false, follow: false },
  }
}

/**
 * La pantalla del código, a la que se llega desde el alta y desde la recuperación.
 *
 * No lleva nada en la dirección: qué correo está esperando y para qué lo dice la
 * cookie de `pending.ts`. Sin ella no hay nada que hacer aquí, así que se vuelve al
 * principio en vez de enseñar un formulario que no podría funcionar —es lo que pasa
 * al recargar esto un día después, o al abrirlo desde el historial—.
 */
export default async function CodigoPage({ params }: Params) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = translator(locale)

  const session = await auth()
  if (session?.user) redirect(path(locale, '/cuenta'))

  const pending = await readPending()
  if (!pending) redirect(path(locale, '/entrar'))

  const creating = pending.purpose === 'alta'

  return (
    <div className="page-gutter flex min-h-[70vh] items-center pt-16 pb-(--spacing-section) md:pt-24">
      <div className="mx-auto w-full max-w-sm text-center">
        <h1 className="font-serif text-title">
          {t({ es: 'Mira tu correo', gl: 'Mira o teu correo' })}
        </h1>

        <p className="mt-6 text-bark-soft">
          {creating
            ? t({
                es: 'Te he enviado un código de seis cifras. Escríbelo aquí y elige la contraseña con la que entrarás a partir de ahora.',
                gl: 'Envieiche un código de seis cifras. Escríbeo aquí e escolle o contrasinal co que entrarás a partir de agora.',
              })
            : t({
                es: 'Te he enviado un código de seis cifras. Escríbelo aquí y elige tu contraseña nueva.',
                gl: 'Envieiche un código de seis cifras. Escríbeo aquí e escolle o teu contrasinal novo.',
              })}
        </p>

        <p className="mt-5 text-small text-bark-faint">
          {t({
            es: 'El código caduca en 10 minutos y sólo funciona una vez.',
            gl: 'O código caduca en 10 minutos e só funciona unha vez.',
          })}
        </p>

        <CodeForm purpose={pending.purpose} email={pending.email} />

        <p className="mt-8 text-small text-bark-faint">
          {t({
            es: '¿Te has equivocado de dirección?',
            gl: 'Equivocáchete de enderezo?',
          })}{' '}
          <Link
            href={
              creating ? `${path(locale, '/entrar')}?modo=crear` : path(locale, '/entrar/recuperar')
            }
            className="link-underline"
          >
            {t({ es: 'Empezar de nuevo', gl: 'Empezar de novo' })}
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
