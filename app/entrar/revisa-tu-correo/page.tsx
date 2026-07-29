import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mira tu correo',
  robots: { index: false, follow: false },
}

/**
 * Pantalla intermedia a la que Auth.js redirige después de enviar el enlace.
 *
 * No se muestra a qué dirección se ha enviado. Podría —Auth.js no lo pasa, pero
 * se podría arrastrar en la URL— y a cambio cualquiera que abriese esa URL sabría
 * qué correo se acaba de usar. No aporta nada: quien lo ha escrito hace tres
 * segundos ya lo sabe.
 */
export default function RevisaTuCorreoPage() {
  return (
    <div className="page-gutter flex min-h-[70vh] items-center pt-16 md:pt-24">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="font-serif text-title">Mira tu correo</h1>

        <p className="mt-6 text-bark-soft">
          Te he enviado un enlace para entrar. Púlsalo y estarás dentro, sin más pasos.
        </p>

        <p className="mt-5 text-small text-bark-faint">
          Caduca en 10 minutos y sólo funciona una vez. Si no aparece, mira en la carpeta de spam.
        </p>

        <Link href="/entrar" className="btn btn-quiet mt-10">
          Pedir otro enlace
        </Link>
      </div>
    </div>
  )
}
