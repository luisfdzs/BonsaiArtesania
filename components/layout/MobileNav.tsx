'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { NavPending } from '@/components/ui/NavPending'
import { cn } from '@/lib/cn'
import { localeOf, path, routeOf } from '@/lib/i18n/routes'
import { useTranslator } from '@/lib/i18n/useLocale'
import { navigation } from '@/lib/navigation'
import { onHome, useActiveSection } from '@/lib/useActiveSection'
import { useCartCount } from './CartCount'
import { LocalePicker } from './LocalePicker'
import { AccountIcon, CartIcon, CloseIcon, ContactIcon, HomeIcon, MenuIcon } from './NavIcons'

/**
 * La navegación de móvil: un cilindro fijo abajo, flotando con aire alrededor,
 * siempre a la vista, en cualquier página y a cualquier altura del scroll.
 *
 * Sustituye al botón «Menú» de la cabecera y a su panel a pantalla completa. El
 * motivo es el pulgar: en un teléfono en la mano, el borde inferior se alcanza sin
 * recolocar el aparato y la esquina superior derecha no. Arriba se queda sólo la
 * marca, que es identidad y no navegación.
 *
 * Cinco sitios, de izquierda a derecha: inicio, cuenta, carrito, contacto y el
 * resto del menú. Los cuatro primeros son destinos y el quinto abre un panel con
 * las tres secciones editoriales que no caben en la barra. Con la tienda cerrada
 * el carrito no aparece y quedan cuatro.
 *
 * Sólo iconos, sin rótulo: cinco palabras en versalitas a lo ancho de un móvil de
 * 360px o se cortan o se aprietan hasta ser ilegibles. El nombre accesible va en
 * `aria-label` de cada uno.
 *
 * El idioma no baja como prop: se lee de la propia dirección, que siempre lo
 * lleva delante. Ver `useLocale`.
 */
export function MobileNav({ shopOpen }: { shopOpen: boolean }) {
  const pathname = usePathname()
  const locale = localeOf(pathname)
  const route = routeOf(pathname)
  const t = useTranslator()

  /**
   * Igual que hacía la cabecera: el panel guarda la ruta en la que se abrió, no
   * un booleano. Así al navegar deja de estar abierto por derivación —sin un
   * efecto que llame a setState— y también se cierra con atrás/adelante.
   */
  const [openedAt, setOpenedAt] = useState<string | null>(null)
  const open = openedAt === pathname

  const count = useCartCount(shopOpen)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpenedAt(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const close = () => setOpenedAt(null)

  // La sección de la portada en la que se está, tratada igual que una ruta
  // —ver `useActiveSection`—. Inicio sólo se enciende sin ninguna sección
  // activa: si no, al entrar en Contacto se encenderían los dos huecos a la
  // vez, que es peor que marcar sólo el que toca.
  const section = useActiveSection()
  const homeActive = onHome(pathname) && !section
  const contactoActive = section === 'contacto'

  // «Contacto» sale de la barra con su propio icono; las otras tres entradas del
  // menú del sitio son las que se despliegan. Se derivan de `navigation` en vez
  // de repetirse aquí: el menú tiene que decir lo mismo en móvil y en escritorio.
  const panelItems = navigation.filter((item) => item.route !== '/#contacto')

  // Estando en Tienda, en Encargos o en El taller, ninguno de los cinco iconos
  // diría dónde está: la sección vive detrás del menú. Así que el que la guarda
  // se marca como activo, y la barra nunca queda sin señalar la página.
  //
  // Se compara contra `route` —la ruta sin idioma— y no contra `pathname`: con
  // el idioma delante, `/gl/tienda` no empieza por `/tienda`.
  const inPanel =
    panelItems.some((item) => !item.route.includes('#') && route.startsWith(item.route)) ||
    section === 'encargos' ||
    section === 'taller'

  return (
    <>
      {/* El panel va antes que la barra en el DOM y ambos comparten z-index: así
          la barra queda por encima y su botón sigue pulsable para cerrar. Cubre
          la cabecera a propósito —es un menú a pantalla completa— y por eso lleva
          fondo lino opaco y no translúcido.
          Llega hasta el borde de abajo y no hasta el canto del cilindro: si se
          cortara ahí, por el aire de alrededor se vería asomar la página de
          debajo. El cilindro flota encima, y el `padding` de abajo es el que
          impide que el menú se le meta por detrás. */}
      <div
        id="menu-movil"
        hidden={!open}
        // Sin utilidad de `display`: el atributo `hidden` es quien apaga el panel
        // y un `flex` aquí discutiría con él. El centrado lo pone el <nav>.
        className="page-gutter fixed inset-0 z-50 overflow-y-auto bg-linen pb-(--spacing-nav-mobile) md:hidden"
      >
        <nav
          className="flex min-h-full flex-col items-center justify-center gap-7 py-12 text-center"
          aria-label={t({ es: 'Secciones', gl: 'Seccións' })}
        >
          {panelItems.map((item) => (
            <Link
              key={item.route}
              href={path(locale, item.route)}
              className="font-serif text-title"
              onClick={close}
            >
              {t(item.label)}
            </Link>
          ))}

          {/* El idioma, debajo de las tres secciones y detrás de un filete. Ver
              `LocalePicker`. */}
          <LocalePicker onNavigate={close} />
        </nav>
      </div>

      <nav
        aria-label="Principal"
        className="fixed inset-x-(--spacing-nav-mobile-air) bottom-[calc(var(--spacing-nav-mobile-air)+env(safe-area-inset-bottom))] z-50 flex h-(--spacing-nav-mobile-bar) items-stretch rounded-full border border-line bg-linen/95 shadow-[0_2px_20px_rgba(60,54,46,0.10)] backdrop-blur-md md:hidden"
      >
        <NavSlot
          href={path(locale, '/')}
          label={t({ es: 'Inicio', gl: 'Inicio' })}
          active={homeActive && !open}
          // Estando ya en la portada, Next no navega y el toque no haría nada:
          // quien esté en el pie se quedaría en el pie. La casa debe llevar
          // siempre al principio, igual que la marca de la cabecera, así que ahí
          // subimos a mano. Sin `behavior` a propósito: hereda el scroll suave
          // del CSS —y el salto seco cuando el sistema pide menos movimiento.
          onClick={(event) => {
            close()
            if (onHome(pathname)) {
              event.preventDefault()
              window.scrollTo({ top: 0 })
            }
          }}
        >
          <HomeIcon className="h-6 w-6" />
        </NavSlot>

        {/* «Entrar» cuenta como parte de Cuenta y no como una página aparte: es
            el paso previo obligado sin sesión, y quien lo ve tiene que seguir
            leyendo el mismo hueco encendido, no uno apagado de golpe. */}
        <NavSlot
          href={path(locale, '/cuenta')}
          label={t({ es: 'Cuenta', gl: 'Conta' })}
          active={(route.startsWith('/cuenta') || route.startsWith('/entrar')) && !open}
          onClick={close}
        >
          <AccountIcon className="h-6 w-6" />
          {/* Cuenta es el único hueco que espera de verdad: los demás llevan a
              páginas ya generadas. Ver `NavPending`. */}
          <NavPending label={t({ es: 'Abriendo tu cuenta', gl: 'Abrindo a túa conta' })} />
        </NavSlot>

        {/* Sin tienda abierta no hay carrito que enseñar, como en la cabecera. */}
        {shopOpen && (
          <NavSlot
            href={path(locale, '/carrito')}
            // El número también en el nombre accesible: el globo es un dato, no
            // un adorno, y quien no lo ve tiene que enterarse igual.
            label={
              count
                ? `${t({ es: 'Carrito', gl: 'Carro' })}, ${count} ${
                    count === 1 ? t({ es: 'pieza', gl: 'peza' }) : t({ es: 'piezas', gl: 'pezas' })
                  }`
                : t({ es: 'Carrito', gl: 'Carro' })
            }
            active={route === '/carrito' && !open}
            onClick={close}
          >
            <span className="relative">
              <CartIcon className="h-6 w-6" />
              {/* Nada mientras la cifra no ha llegado, y nada con el carrito
                  vacío: un cero es ruido. Más de nueve se resume para que el
                  globo siga siendo redondo; el número exacto está en la etiqueta
                  y en el propio carrito. */}
              {count ? (
                <span aria-hidden className="cart-badge">
                  {count > 9 ? '9+' : count}
                </span>
              ) : null}
            </span>
          </NavSlot>
        )}

        <NavSlot
          href={path(locale, '/#contacto')}
          label={t({ es: 'Contacto', gl: 'Contacto' })}
          active={contactoActive && !open}
          onClick={close}
        >
          <ContactIcon className="h-6 w-6" />
        </NavSlot>

        <button
          type="button"
          onClick={() => setOpenedAt(open ? null : pathname)}
          aria-expanded={open}
          aria-controls="menu-movil"
          aria-label={
            open
              ? t({ es: 'Cerrar el menú', gl: 'Pechar o menú' })
              : t({ es: 'Más secciones', gl: 'Máis seccións' })
          }
          className={cn(slotClass, slotState(open || inPanel))}
        >
          <span className={slotMark(open || inPanel)}>
            {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </span>
        </button>
      </nav>
    </>
  )
}

/**
 * El hueco de cada icono. Reparte el ancho a partes iguales y estira a todo el
 * alto de la barra —gracias al `items-stretch` del `<nav>`—, así que la zona
 * pulsable es la celda entera aunque la marca de activo sea más pequeña.
 *
 * El activo va en salvia —el verde con el que responden los botones del sitio— y
 * los demás en tinta al 55%. Con el color a secas no bastaba: a 24px y con trazo
 * de 1,5px, el salvia contra el gris de los apagados hay que buscarlo. Así que el
 * verde se dice también en el fondo, con un círculo del mismo salvia muy rebajado
 * detrás del icono. Redondo y no a toda la celda: dentro de un cilindro, un
 * rectángulo pelea con la curva, y el círculo repite su forma en pequeño.
 */
const slotClass =
  'relative flex flex-1 flex-col items-center justify-center transition-colors duration-500'

const slotState = (active: boolean) => (active ? 'text-sage-deep' : 'text-bark opacity-55')

const slotMark = (active: boolean) =>
  cn(
    'flex h-full w-full items-center justify-center rounded-full transition-colors duration-500',
    active && 'bg-sage-deep/12',
  )

function NavSlot({
  href,
  label,
  active,
  onClick,
  children,
}: {
  href: string
  label: string
  active: boolean
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={cn(slotClass, slotState(active))}
    >
      <span className={slotMark(active)}>{children}</span>
    </Link>
  )
}
