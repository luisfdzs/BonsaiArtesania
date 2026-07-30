import { redirect } from 'next/navigation'
import { getSession, signOut } from '@/auth'
import { LogoutIcon } from '@/components/cuenta/CuentaIcons'
import { CuentaNav } from '@/components/cuenta/CuentaNav'

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
 */
export default async function CuentaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session?.user) redirect('/entrar?volver=/cuenta')

  const name = session.user.name?.trim()
  const email = session.user.email ?? ''
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

        <p className="eyebrow mt-6">Tu cuenta</p>
        <h1 className="mt-3 font-serif text-title">{name || 'Hola'}</h1>
        {email && <p className="mt-3 text-small text-bark-faint">{email}</p>}
      </header>

      <div className="mx-auto mt-10 max-w-2xl border-t border-line pt-8">
        <CuentaNav />
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
          <button type="submit" className="btn btn-quiet btn-sm">
            <LogoutIcon className="h-4 w-4" />
            Salir
          </button>
        </form>
      </div>
    </div>
  )
}
