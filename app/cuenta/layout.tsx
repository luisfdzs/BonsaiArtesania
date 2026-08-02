import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession, signOut } from '@/auth'
import { HammerIcon, LogoutIcon } from '@/components/cuenta/CuentaIcons'
import { CuentaNav } from '@/components/cuenta/CuentaNav'
import { FormPending } from '@/components/ui/FormPending'
import { isAdminEmail } from '@/lib/admin'

/**
 * Guarda de toda la zona de cuenta. Se hace aquí, en un layout de servidor, y no
 * en `middleware.ts`: las sesiones están en base de datos y el middleware corre
 * antes de poder consultarla sin arrastrar el driver de Mongo al edge. Un layout
 * ya se ejecuta en el servidor con acceso completo, y protege por igual a todas
 * las rutas hijas presentes y futuras.
 *
 * Toda la zona es una sola columna centrada, como el resto de las páginas de
 * texto del sitio: la cuenta de una tienda de cuatro secciones no necesita un
 * panel con barra lateral, y centrado se lee igual en móvil que en escritorio sin
 * dos maquetaciones distintas.
 *
 * ## La cuenta del taller entra por aquí y se lee distinto
 *
 * A Ana no se la echa de `/cuenta` —sigue teniendo contraseña que cambiar y datos
 * suyos que descargar—, pero lo que se le enseña no es lo mismo: el rótulo dice a
 * qué cuenta ha entrado, la primera pestaña es el taller y no hay ni «Pedidos»
 * ni «Direcciones». Las dos que faltan están además cerradas por su lado, que es
 * lo que de verdad las cierra. Ver `lib/admin.ts`.
 */
export default async function CuentaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session?.user) redirect('/entrar?volver=/cuenta')

  const name = session.user.name?.trim()
  const email = session.user.email ?? ''
  const admin = isAdminEmail(email)
  // La inicial del nombre, y si aún no lo ha rellenado, la del correo. En
  // mayúscula desde CSS (`uppercase`) y no aquí, para no romper letras que se
  // mayusculizan en dos caracteres.
  const initial = (name || email || '·').slice(0, 1)

  return (
    <div className="page-gutter pt-16 pb-(--spacing-section) md:pt-24">
      <header className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <span
          aria-hidden
          className="flex h-16 w-16 items-center justify-center rounded-full border border-line bg-petal-soft font-serif text-lead text-bark-soft uppercase"
        >
          {initial}
        </span>

        <p className="eyebrow mt-6">{admin ? 'Cuenta del taller' : 'Tu cuenta'}</p>
        <h1 className="mt-3 font-serif text-title">{name || 'Hola'}</h1>
        {email && <p className="mt-3 text-small text-bark-faint">{email}</p>}

        {/* Dicho con todas las letras y no insinuado quitando pestañas: si algún
            día Ana busca su carrito, que sepa aquí mismo por qué no está. */}
        {admin && (
          <p className="mt-6 max-w-md text-small text-bark-soft">
            Desde aquí se gestionan los pedidos de la tienda. Esta cuenta no compra: no tiene
            carrito ni hace pedidos.
          </p>
        )}
      </header>

      {admin && (
        <div className="mx-auto mt-8 max-w-2xl text-center">
          <Link href="/taller" className="btn">
            <HammerIcon className="h-4 w-4" />
            Ir al taller
          </Link>
        </div>
      )}

      <div className="mx-auto mt-10 max-w-2xl border-t border-line pt-8">
        <CuentaNav admin={admin} />
      </div>

      <div className="mx-auto mt-14 max-w-xl text-center">{children}</div>

      {/* Salir vive al final de la columna y no arriba a la derecha: arriba
          quedaría pegado a las pestañas, y es el único gesto de aquí que saca a
          alguien de su cuenta. Abajo se encuentra cuando se busca y no se pulsa
          sin querer. */}
      <div className="mx-auto mt-20 max-w-xl border-t border-line pt-10 text-center">
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/' })
          }}
        >
          {/* Salir borra la sesión de la base de datos y luego lleva a la portada:
              dos viajes, y hasta el segundo la cuenta sigue en pantalla como si no
              se hubiera pulsado nada. La flor cubre ese hueco —y es la última cosa
              que se ve del sitio antes de la portada, así que además despide. */}
          <FormPending label="Cerrando tu sesión" />

          <button type="submit" className="btn btn-quiet btn-sm">
            <LogoutIcon className="h-4 w-4" />
            Salir
          </button>
        </form>
      </div>
    </div>
  )
}
