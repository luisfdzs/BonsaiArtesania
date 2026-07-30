import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession, signOut } from '@/auth'

/**
 * Guarda de toda la zona de cuenta. Se hace aquí, en un layout de servidor, y no
 * en `middleware.ts`: las sesiones están en base de datos y el middleware corre
 * antes de poder consultarla sin arrastrar el driver de Mongo al edge. Un layout
 * ya se ejecuta en el servidor con acceso completo, y protege por igual a todas
 * las rutas hijas presentes y futuras.
 */
export default async function CuentaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session?.user) redirect('/entrar?volver=/cuenta')

  return (
    <div className="page-gutter pt-16 md:pt-24">
      <header className="flex flex-wrap items-baseline justify-between gap-6 border-b border-line pb-6">
        <div>
          <p className="eyebrow">Tu cuenta</p>
          <h1 className="mt-2 font-serif text-title">{session.user.name ?? 'Hola'}</h1>
        </div>

        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/' })
          }}
        >
          <button type="submit" className="btn btn-quiet">
            Salir
          </button>
        </form>
      </header>

      <nav className="mt-8 flex gap-8" aria-label="Secciones de tu cuenta">
        <Link href="/cuenta" className="link-underline tap text-small">
          Datos personales
        </Link>
        <Link href="/cuenta/pedidos" className="link-underline tap text-small">
          Pedidos
        </Link>
        <Link href="/cuenta/direcciones" className="link-underline tap text-small">
          Direcciones
        </Link>
        <Link href="/cuenta/privacidad" className="link-underline tap text-small">
          Datos y privacidad
        </Link>
      </nav>

      <div className="mt-12 max-w-xl pb-(--spacing-section)">{children}</div>
    </div>
  )
}
