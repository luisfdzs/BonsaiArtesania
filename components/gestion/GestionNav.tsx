'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PackageIcon } from '@/components/cuenta/CuentaIcons'
import { GestionPendingSignal } from '@/components/gestion/GestionPending'
import { AccountIcon } from '@/components/layout/NavIcons'
import { cn } from '@/lib/cn'
import type { Localized } from '@/lib/i18n/config'
import { localeOf, path, routeOf } from '@/lib/i18n/routes'
import { useTranslator } from '@/lib/i18n/useLocale'

const items: {
  route: string
  label: Localized
  waiting: Localized
  Icon: (props: { className?: string }) => React.ReactElement
}[] = [
  {
    route: '/gestion',
    label: { es: 'Pedidos', gl: 'Pedidos' },
    waiting: { es: 'Abriendo los pedidos', gl: 'Abrindo os pedidos' },
    Icon: PackageIcon,
  },
  {
    route: '/gestion/catalogo',
    label: { es: 'Catálogo', gl: 'Catálogo' },
    waiting: { es: 'Abriendo el catálogo', gl: 'Abrindo o catálogo' },
    Icon: GridIcon,
  },
  {
    route: '/gestion/cuenta',
    label: { es: 'Tu cuenta', gl: 'A túa conta' },
    waiting: { es: 'Abriendo tu cuenta', gl: 'Abrindo a túa conta' },
    Icon: AccountIcon,
  },
]

/**
 * La rejilla del catálogo. Cuatro cuadros: es lo que se ve al entrar —las
 * tarjetas de las piezas— y no se parece a ningún otro icono de la barra.
 */
function GridIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      aria-hidden="true"
      className={className}
    >
      <rect x="3.5" y="3.5" width="7" height="7" />
      <rect x="13.5" y="3.5" width="7" height="7" />
      <rect x="3.5" y="13.5" width="7" height="7" />
      <rect x="13.5" y="13.5" width="7" height="7" />
    </svg>
  )
}

/**
 * Las tres secciones del panel, y no es que falte ninguna: la cuenta del taller
 * prepara los pedidos, cuida el catálogo y tiene una contraseña que cambiar, y
 * ahí se acaba —ver `lib/admin.ts`—. Ni direcciones, ni carrito, ni «tus pedidos».
 *
 * El catálogo va en medio a propósito: los pedidos son lo que se mira cada día
 * —lo primero—, la cuenta es lo que casi nunca se toca —lo último—, y entre
 * ambos queda lo que se toca a ratos, cuando hay fotos nuevas.
 *
 * Cliente por una sola razón, la misma que `CuentaNav`: `usePathname`, que es lo
 * que permite encender la sección en la que se está. Y mismo lenguaje de activo
 * que la barra del sitio y que la de la cuenta —fondo salvia al 12% y tinta
 * salvia—, para que «estar aquí» se diga siempre igual.
 */
export function GestionNav() {
  const pathname = usePathname()
  const locale = localeOf(pathname)
  const route = routeOf(pathname)
  const t = useTranslator()

  return (
    <nav aria-label={t({ es: 'Secciones de la gestión', gl: 'Seccións da xestión' })}>
      <ul className="flex flex-wrap justify-center gap-x-2 gap-y-1">
        {items.map((item) => {
          const { label, waiting, Icon } = item
          // Exacto para «Pedidos» y por prefijo para el resto: si no, la raíz
          // del panel se quedaría encendida en todas las secciones. La ficha de
          // un pedido cuelga de `/gestion/pedidos`, así que sigue marcando
          // «Pedidos» sin necesitar un caso aparte.
          //
          // Se compara la ruta sin idioma: `/gl/gestion` no empieza por `/gestion`.
          const active =
            item.route === '/gestion'
              ? route === item.route || route.startsWith('/gestion/pedidos')
              : route.startsWith(item.route)

          return (
            <li key={item.route}>
              <Link
                href={path(locale, item.route)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-full px-4 py-2.5 text-small transition-colors duration-500',
                  active
                    ? 'bg-sage-deep/12 text-sage-deep'
                    : 'text-bark-soft hover:bg-sage-deep/8 hover:text-bark',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {t(label)}
                {!active && <GestionPendingSignal label={t(waiting)} />}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
