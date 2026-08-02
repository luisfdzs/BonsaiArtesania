import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { signOut } from '@/auth'
import { LogoutIcon } from '@/components/cuenta/CuentaIcons'
import { GestionNav } from '@/components/gestion/GestionNav'
import { Wordmark } from '@/components/layout/Wordmark'
import { FormPending } from '@/components/ui/FormPending'
import { adminSession } from '@/lib/admin'

export const metadata: Metadata = {
  title: 'Gestión',
  robots: { index: false, follow: false },
}

/**
 * El panel de gestión: **lo único que tiene la cuenta del taller**.
 *
 * Antes vivía en `/taller` y era una página más de la web: llegaba con la
 * cabecera de la tienda encima —portada, tienda, encargos, carrito— y con el pie
 * legal debajo. Nada de eso le sirve a Ana, que entra a preparar pedidos y no a
 * comprar, y el carrito era además un enlace a una página que su propia cuenta
 * tiene cerrada. Ahora el panel es su propio armazón: cuelga de la raíz y no del
 * grupo `(sitio)`, así que no hereda ninguna de esas dos cosas. Ver
 * `components/layout/SiteChrome.tsx` para el reparto.
 *
 * Se llama `/gestion` y no `/taller` porque «el taller» ya significaba otra cosa
 * de cara al público —la sección de la portada donde se cuenta cómo se trabaja—,
 * y dos sitios con el mismo nombre no se distinguen ni al hablar ni en la barra
 * de direcciones.
 *
 * A quien no es administrador se le devuelve un 404, no un «no autorizado»: un
 * 403 confirma que la ruta existe. Si no hay sesión tampoco se redirige a entrar,
 * porque eso también delataría que hay algo detrás.
 *
 * Se maqueta como una sola columna centrada, igual que las páginas de texto del
 * sitio: es el mismo sitio, y no había razón para que la parte de dentro se
 * leyera como un panel de administración distinto.
 *
 * Lo que sí lleva propio, arriba y abajo, es lo que la cabecera de la web daba
 * gratis: la marca —para saber dónde se está—, las dos secciones que hay, y
 * **con qué cuenta se está dentro y cómo se sale**. Los pedidos de todo el mundo
 * están detrás de esta sesión, así que cerrarla tiene que estar a mano.
 */
export default async function GestionLayout({ children }: { children: React.ReactNode }) {
  const session = await adminSession()
  if (!session) notFound()

  const email = session.user?.email ?? ''

  return (
    <main id="main" className="page-gutter flex-1 pt-16 pb-(--spacing-section) md:pt-24">
      <header className="mx-auto flex max-w-2xl flex-col items-center border-b border-line pb-8 text-center">
        {/* La marca, sin enlace: aquí no llevaría a ninguna parte —la portada no
            es de esta cuenta— y está sólo para decir de qué web es este panel. */}
        <Wordmark className="h-7 text-bark" />
        <h1 className="mt-6 font-serif text-title">Gestión</h1>
        <p className="mt-3 text-small text-bark-faint">
          Los pedidos de la tienda, todos. Aquí se cambia por dónde va cada uno.
        </p>

        <div className="mt-8">
          <GestionNav />
        </div>
      </header>

      <div className="mx-auto mt-12 max-w-2xl text-center">{children}</div>

      <div className="mx-auto mt-20 flex max-w-2xl flex-col items-center gap-6 border-t border-line pt-10 text-center">
        {email && <p className="text-small text-bark-faint">Dentro como {email}</p>}

        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/' })
          }}
        >
          {/* Igual que en la cuenta: salir borra la sesión de la base y luego
              lleva a la portada, y hasta el segundo viaje la gestión sigue en
              pantalla como si no se hubiera pulsado nada. */}
          <FormPending label="Cerrando tu sesión" />

          <button type="submit" className="btn btn-quiet btn-sm">
            <LogoutIcon className="h-4 w-4" />
            Salir
          </button>
        </form>
      </div>
    </main>
  )
}
