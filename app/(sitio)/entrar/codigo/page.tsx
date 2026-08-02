import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { CodeForm } from '@/components/entrar/CodeForm'
import { readPending } from '../pending'

export const metadata: Metadata = {
  title: 'Tu código',
  robots: { index: false, follow: false },
}

/**
 * La pantalla del código, a la que se llega desde el alta y desde la recuperación.
 *
 * No lleva nada en la dirección: qué correo está esperando y para qué lo dice la
 * cookie de `pending.ts`. Sin ella no hay nada que hacer aquí, así que se vuelve al
 * principio en vez de enseñar un formulario que no podría funcionar —es lo que pasa
 * al recargar esto un día después, o al abrirlo desde el historial—.
 */
export default async function CodigoPage() {
  const session = await auth()
  if (session?.user) redirect('/cuenta')

  const pending = await readPending()
  if (!pending) redirect('/entrar')

  const creating = pending.purpose === 'alta'

  return (
    <div className="page-gutter flex min-h-[70vh] items-center pt-16 pb-(--spacing-section) md:pt-24">
      <div className="mx-auto w-full max-w-sm text-center">
        <h1 className="font-serif text-title">Mira tu correo</h1>

        <p className="mt-6 text-bark-soft">
          {creating
            ? 'Te he enviado un código de seis cifras. Escríbelo aquí y elige la contraseña con la que entrarás a partir de ahora.'
            : 'Te he enviado un código de seis cifras. Escríbelo aquí y elige tu contraseña nueva.'}
        </p>

        <p className="mt-5 text-small text-bark-faint">
          El código caduca en 10 minutos y sólo funciona una vez.
        </p>

        <CodeForm purpose={pending.purpose} email={pending.email} />

        <p className="mt-8 text-small text-bark-faint">
          ¿Te has equivocado de dirección?{' '}
          <Link
            href={creating ? '/entrar?modo=crear' : '/entrar/recuperar'}
            className="link-underline"
          >
            Empezar de nuevo
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
