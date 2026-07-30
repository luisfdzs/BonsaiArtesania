'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { NavPending } from '@/components/ui/NavPending'
import { cn } from '@/lib/cn'
import { navigation } from '@/lib/navigation'
import { useActiveSection } from '@/lib/useActiveSection'
import { useCartCount } from './CartCount'
import { AccountIcon, CartIcon, CloseIcon, ContactIcon, HomeIcon, MenuIcon } from './NavIcons'

/**
 * La navegación de móvil: una barra fija abajo, siempre a la vista, en cualquier
 * página y a cualquier altura del scroll.
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
 */
export function MobileNav({ shopOpen }: { shopOpen: boolean }) {
  const pathname = usePathname()

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
  const homeActive = pathname === '/' && !section
  const contactoActive = section === 'contacto'

  // «Contacto» sale de la barra con su propio icono; las otras tres entradas del
  // menú del sitio son las que se despliegan. Se derivan de `navigation` en vez
  // de repetirse aquí: el menú tiene que decir lo mismo en móvil y en escritorio.
  const panelItems = navigation.filter((item) => item.href !== '/#contacto')

  // Estando en Tienda o en Encargos, ninguno de los cinco iconos diría dónde
  // está: la sección vive detrás del menú. Así que el que la guarda se marca
  // como activo, y la barra nunca queda sin señalar la página.
  const inPanel =
    panelItems.some((item) => !item.href.includes('#') && pathname.startsWith(item.href)) ||
    section === 'taller'

  return (
    <>
      {/* El panel va antes que la barra en el DOM y ambos comparten z-index: así
          la barra queda por encima y su botón sigue pulsable para cerrar. Cubre
          la cabecera a propósito —es un menú a pantalla completa— y por eso lleva
          fondo lino opaco y no translúcido. */}
      <div
        id="menu-movil"
        hidden={!open}
        // Sin utilidad de `display`: el atributo `hidden` es quien apaga el panel
        // y un `flex` aquí discutiría con él. El centrado lo pone el <nav>.
        className="page-gutter fixed inset-x-0 top-0 bottom-(--spacing-nav-mobile) z-50 overflow-y-auto bg-linen md:hidden"
      >
        <nav
          className="flex min-h-full flex-col items-center justify-center gap-7 py-12 text-center"
          aria-label="Secciones"
        >
          {panelItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-serif text-title"
              onClick={close}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-50 flex h-(--spacing-nav-mobile) items-stretch border-t border-line bg-linen/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <NavSlot
          href="/"
          label="Inicio"
          active={homeActive && !open}
          // Estando ya en la portada, Next no navega y el toque no haría nada:
          // quien esté en el pie se quedaría en el pie. La casa debe llevar
          // siempre al principio, igual que la marca de la cabecera, así que ahí
          // subimos a mano. Sin `behavior` a propósito: hereda el scroll suave
          // del CSS —y el salto seco cuando el sistema pide menos movimiento.
          onClick={(event) => {
            close()
            if (pathname === '/') {
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
          href="/cuenta"
          label="Cuenta"
          active={(pathname.startsWith('/cuenta') || pathname.startsWith('/entrar')) && !open}
          onClick={close}
        >
          <AccountIcon className="h-6 w-6" />
          {/* Cuenta es el único hueco que espera de verdad: los demás llevan a
              páginas ya generadas. Ver `NavPending`. */}
          <NavPending label="Abriendo tu cuenta" />
        </NavSlot>

        {/* Sin tienda abierta no hay carrito que enseñar, como en la cabecera. */}
        {shopOpen && (
          <NavSlot
            href="/carrito"
            // El número también en el nombre accesible: el globo es un dato, no
            // un adorno, y quien no lo ve tiene que enterarse igual.
            label={count ? `Carrito, ${count} ${count === 1 ? 'pieza' : 'piezas'}` : 'Carrito'}
            active={pathname === '/carrito' && !open}
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
          href="/#contacto"
          label="Contacto"
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
          aria-label={open ? 'Cerrar el menú' : 'Más secciones'}
          className={cn(slotClass, slotState(open || inPanel))}
        >
          {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </nav>
    </>
  )
}

/**
 * El hueco de cada icono. Reparte el ancho a partes iguales y estira a todo el
 * alto de la barra —gracias al `items-stretch` del `<nav>`—, así que el propio
 * hueco ya mide la celda entera: no hace falta una pastilla aparte de tamaño
 * fijo.
 *
 * El activo va en salvia —el verde con el que responden los botones del sitio— y
 * los demás en tinta al 55%. Con el color a secas no bastaba: a 24px y con trazo
 * de 1,5px, el salvia contra el gris de los apagados hay que buscarlo. Así que el
 * verde se dice también en el fondo, con un cuadrado del mismo salvia muy
 * rebajado que ocupa la celda entera —cuadrado y no redondo a propósito, para que
 * la sección activa se lea como un hueco de la barra y no como un botón suelto—.
 */
const slotClass =
  'relative flex flex-1 flex-col items-center justify-center transition-colors duration-500'

const slotState = (active: boolean) =>
  active ? 'bg-sage-deep/12 text-sage-deep' : 'text-bark opacity-55'

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
      {children}
    </Link>
  )
}
