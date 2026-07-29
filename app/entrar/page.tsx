import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth, signIn } from '@/auth'

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Accede a tu cuenta para ver tus pedidos y tus direcciones de envío.',
  // Una pantalla de acceso no aporta nada en un buscador.
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{ volver?: string }>
}

export default async function EntrarPage({ searchParams }: Props) {
  const session = await auth()
  const { volver } = await searchParams

  // Ya identificado: no tiene sentido ver el formulario de acceso.
  if (session?.user) redirect(volver ?? '/cuenta')

  return (
    <div className="page-gutter flex min-h-[70vh] items-center pt-16 md:pt-24">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="font-serif text-title">Entrar</h1>
        <p className="mt-5 text-bark-soft">
          Con una cuenta guardas tus direcciones de envío y puedes seguir tus pedidos. No hace falta
          para navegar por la tienda.
        </p>

        <form
          className="mt-12"
          action={async () => {
            'use server'
            // El `redirectTo` se pasa aquí y no se lee del cliente en el callback:
            // así no hay forma de inyectar una URL externa en la redirección.
            await signIn('google', { redirectTo: volver ?? '/cuenta' })
          }}
        >
          <button type="submit" className="btn w-full">
            Continuar con Google
          </button>
        </form>

        <p className="mt-8 text-small text-bark-faint">
          Al entrar aceptas que guardemos los datos necesarios para preparar y enviar tus pedidos.
        </p>
      </div>
    </div>
  )
}
