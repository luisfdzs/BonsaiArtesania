import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { signOut } from '@/auth'
import { LogoutIcon } from '@/components/cuenta/CuentaIcons'
import { AccountIcon } from '@/components/layout/NavIcons'
import { FormPending } from '@/components/ui/FormPending'
import { adminSession } from '@/lib/admin'

export const metadata: Metadata = {
  title: 'Taller',
  robots: { index: false, follow: false },
}

/**
 * El panel de gestión. Se llama «taller» y no «admin» porque es donde Ana trabaja.
 *
 * A quien no es administrador se le devuelve un 404, no un «no autorizado»: un
 * 403 confirma que la ruta existe. Si no hay sesión tampoco se redirige a entrar,
 * porque eso también delataría que hay algo detrás.
 *
 * El taller se maqueta como una sola columna centrada, igual que la zona de
 * cuenta y las páginas de texto: es el mismo sitio, y no había razón para que la
 * parte de dentro se leyera como un panel de administración distinto.
 *
 * Lo que sí lleva propio es el pie: **con qué cuenta se está dentro y cómo se
 * sale**. El taller es el sitio donde Ana pasa el rato, y la barra de arriba del
 * sitio no lo dice —lleva a la tienda, que aquí no viene a cuento—; sin esto,
 * salir obligaba a ir a `/cuenta` a buscar el botón. Los pedidos de todo el mundo
 * están detrás de esta sesión, así que cerrarla tiene que estar a mano.
 */
export default async function TallerLayout({ children }: { children: React.ReactNode }) {
  const session = await adminSession()
  if (!session) notFound()

  const email = session.user?.email ?? ''

  return (
    <div className="page-gutter pt-16 pb-(--spacing-section) md:pt-24">
      <header className="mx-auto flex max-w-2xl flex-col items-center border-b border-line pb-6 text-center">
        <p className="eyebrow">Taller</p>
        <h1 className="mt-2 font-serif text-title">Gestión</h1>
        <p className="mt-3 text-small text-bark-faint">
          Los pedidos de la tienda, todos. Aquí se cambia por dónde va cada uno.
        </p>
      </header>

      {/* Sin barra de secciones: desde que ninguna pieza se agota no hay
          existencias que gestionar y el taller es sólo los pedidos. La vuelta al
          listado la da el «← Pedidos» de la ficha de cada uno. */}
      <div className="mx-auto mt-12 max-w-2xl text-center">{children}</div>

      <div className="mx-auto mt-20 flex max-w-2xl flex-col items-center gap-6 border-t border-line pt-10 text-center">
        {email && <p className="text-small text-bark-faint">Dentro como {email}</p>}

        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/cuenta" className="btn btn-quiet btn-sm">
            <AccountIcon className="h-4 w-4" />
            Tu cuenta
          </Link>

          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/' })
            }}
          >
            {/* Igual que en la cuenta: salir borra la sesión de la base y luego
                lleva a la portada, y hasta el segundo viaje el taller sigue en
                pantalla como si no se hubiera pulsado nada. */}
            <FormPending label="Cerrando tu sesión" />

            <button type="submit" className="btn btn-quiet btn-sm">
              <LogoutIcon className="h-4 w-4" />
              Salir
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
