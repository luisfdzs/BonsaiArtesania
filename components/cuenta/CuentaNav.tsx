'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AccountIcon } from '@/components/layout/NavIcons'
import { cn } from '@/lib/cn'
import { HammerIcon, PackageIcon, PinIcon, ShieldIcon } from './CuentaIcons'

type Item = {
  href: string
  label: string
  Icon: (props: { className?: string }) => React.ReactElement
}

const items: Item[] = [
  { href: '/cuenta', label: 'Tus datos', Icon: AccountIcon },
  { href: '/cuenta/pedidos', label: 'Pedidos', Icon: PackageIcon },
  { href: '/cuenta/direcciones', label: 'Direcciones', Icon: PinIcon },
  { href: '/cuenta/privacidad', label: 'Privacidad', Icon: ShieldIcon },
]

/**
 * Lo que ve la cuenta del taller en lugar de lo de arriba.
 *
 * Se quitan «Pedidos» y «Direcciones» porque en esa cuenta no significan nada:
 * no hace pedidos y no recibe envíos (ver `lib/admin.ts`). En su sitio va el
 * taller, que es a donde va a ir siempre. Y se conservan «Tus datos» y
 * «Privacidad» porque Ana sigue siendo una persona con una contraseña que
 * cambiar y unos datos suyos: gestionar la tienda no es motivo para quitarle eso.
 *
 * El taller va el primero y no el último: es lo que viene a hacer.
 */
const adminItems: Item[] = [
  { href: '/taller', label: 'Taller', Icon: HammerIcon },
  { href: '/cuenta', label: 'Tus datos', Icon: AccountIcon },
  { href: '/cuenta/privacidad', label: 'Privacidad', Icon: ShieldIcon },
]

/**
 * Las secciones de la cuenta. Cliente por una sola razón: `usePathname`, que es
 * lo que permite encender la pestaña en la que se está. Antes eran cuatro
 * enlaces iguales y no había forma de saber dónde estabas más que por el título.
 *
 * Mismo lenguaje de activo que la barra de navegación del sitio —fondo salvia al
 * 12% y tinta salvia—, para que «estar aquí» se diga siempre igual.
 *
 * Quién es admin lo decide el servidor y baja como prop: aquí no se puede leer
 * `ADMIN_EMAILS`, y aunque se pudiera, esto sólo pinta enlaces. Lo que de verdad
 * cierra las secciones que faltan son las guardas del servidor.
 */
export function CuentaNav({ admin = false }: { admin?: boolean }) {
  const pathname = usePathname()
  const entries = admin ? adminItems : items

  return (
    <nav aria-label="Secciones de tu cuenta">
      <ul className="flex flex-wrap justify-center gap-x-2 gap-y-1">
        {entries.map(({ href, label, Icon }) => {
          // Exacto para «Tus datos» y por prefijo para el resto: si no, la raíz
          // se quedaría encendida en todas las pestañas.
          const active = href === '/cuenta' ? pathname === href : pathname.startsWith(href)

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-full px-4 py-2.5 text-small transition-colors duration-500',
                  active
                    ? 'bg-sage-deep/12 text-sage-deep'
                    : 'text-bark-soft hover:bg-sage-deep/8 hover:text-bark',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
