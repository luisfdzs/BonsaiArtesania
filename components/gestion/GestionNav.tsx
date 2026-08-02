'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PackageIcon } from '@/components/cuenta/CuentaIcons'
import { AccountIcon } from '@/components/layout/NavIcons'
import { cn } from '@/lib/cn'

const items = [
  { href: '/gestion', label: 'Pedidos', Icon: PackageIcon },
  { href: '/gestion/cuenta', label: 'Tu cuenta', Icon: AccountIcon },
] as const

/**
 * Las dos secciones del panel. Sólo dos, y no es que falte nada: la cuenta del
 * taller gestiona pedidos y tiene una contraseña que cambiar, y ahí se acaba
 * —ver `lib/admin.ts`—. Ni direcciones, ni carrito, ni «tus pedidos».
 *
 * Cliente por una sola razón, la misma que `CuentaNav`: `usePathname`, que es lo
 * que permite encender la sección en la que se está. Y mismo lenguaje de activo
 * que la barra del sitio y que la de la cuenta —fondo salvia al 12% y tinta
 * salvia—, para que «estar aquí» se diga siempre igual.
 */
export function GestionNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Secciones de la gestión">
      <ul className="flex flex-wrap justify-center gap-x-2 gap-y-1">
        {items.map(({ href, label, Icon }) => {
          // Exacto para «Pedidos» y por prefijo para el resto: si no, la raíz
          // del panel se quedaría encendida en todas las secciones. La ficha de
          // un pedido cuelga de `/gestion/pedidos`, así que sigue marcando
          // «Pedidos» sin necesitar un caso aparte.
          const active =
            href === '/gestion'
              ? pathname === href || pathname.startsWith('/gestion/pedidos')
              : pathname.startsWith(href)

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
