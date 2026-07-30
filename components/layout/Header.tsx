'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { NavPending } from '@/components/ui/NavPending'
import { cn } from '@/lib/cn'
import { navigation } from '@/lib/navigation'
import { useActiveSection } from '@/lib/useActiveSection'
import { AccountIcon, CartIcon, CloseIcon, ContactIcon, HomeIcon, MenuIcon } from './NavIcons'
import { Wordmark } from './Wordmark'

/**
 * Necesita JS por dos cosas: saber si se ha hecho scroll, para pasar de
 * transparente sobre el hero a fondo lino, y llevar el mismo menú de iconos que
 * `MobileNav` —inicio, cuenta, carrito, contacto y un botón de tres barras con
 * las secciones editoriales— para que el sitio se navegue igual en cualquier
 * tamaño.
 */
export function Header({ shopOpen }: { shopOpen: boolean }) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  /**
   * Igual que en `MobileNav`: el menú guarda la ruta en la que se abrió, no un
   * booleano. Así al navegar deja de estar abierto por derivación —sin un efecto
   * que llame a setState— y también se cierra con atrás/adelante.
   */
  const [openedAt, setOpenedAt] = useState<string | null>(null)
  const open = openedAt === pathname
  const close = () => setOpenedAt(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Con el menú a pantalla completa la página de detrás no debe moverse.
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpenedAt(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header
        // Con el menú abierto la barra deja de estar «sobre el hero»: pasa a lino
        // y tinta para leerse junto al panel desplegado.
        data-top={!scrolled && !open}
        className={cn(
          'sticky top-0 z-50 transition-colors duration-700',
          scrolled || open ? 'bg-linen/90 text-bark backdrop-blur-md' : 'bg-transparent',
        )}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-bark focus:px-3 focus:py-2 focus:text-linen"
        >
          Saltar al contenido
        </a>

        <div className="header-bar page-gutter flex h-20 items-center justify-between gap-6 md:h-24">
          <Link
            href="/"
            aria-label="Bonsái Artesanía, inicio"
            // Estando ya en la portada, Next no navega y el clic no haría nada:
            // quien esté en el pie se quedaría en el pie. La marca debe llevar
            // siempre al principio, así que ahí subimos a mano. Sin `behavior`
            // a propósito: hereda el scroll suave del CSS —y el salto seco
            // cuando el sistema pide menos movimiento.
            onClick={(event) => {
              close()
              if (pathname === '/') {
                event.preventDefault()
                window.scrollTo({ top: 0 })
              }
            }}
          >
            <Wordmark className="h-7 md:h-9" />
          </Link>

          <DesktopNav
            pathname={pathname}
            shopOpen={shopOpen}
            open={open}
            onToggle={() => setOpenedAt(open ? null : pathname)}
          />
        </div>
      </header>

      {/* El panel va FUERA del <header> a propósito: la barra usa
          `backdrop-blur` con el menú abierto, y un filtro convierte al elemento
          en bloque contenedor de sus descendientes `fixed` — dentro, el panel
          calcularía su alto contra una barra de 96px y se abriría vacío. */}
      <DesktopMenuPanel open={open} pathname={pathname} onClose={close} />
    </>
  )
}

// «Contacto» sale con su propio icono; las otras tres entradas del menú del
// sitio son las que se despliegan en el panel. Se derivan de `navigation` en vez
// de repetirse, igual que en `MobileNav`: el menú tiene que decir lo mismo en
// móvil y en escritorio.
const panelItems = navigation.filter((item) => item.href !== '/#contacto')

/**
 * El mismo repertorio que `MobileNav`, en horizontal: inicio, cuenta, carrito y
 * contacto son iconos con el mismo cuadrado salvia de activo, y las tres
 * secciones editoriales que no caben aquí (Tienda, Encargos, El taller) viven
 * detrás del botón de tres barras. Antes el escritorio tenía su propio menú de
 * texto porque había sitio de sobra para las cuatro entradas de `navigation`;
 * ahora dice lo mismo que el móvil en vez de decirlo distinto.
 */
function DesktopNav({
  pathname,
  shopOpen,
  open,
  onToggle,
}: {
  pathname: string
  shopOpen: boolean
  open: boolean
  onToggle: () => void
}) {
  const section = useActiveSection()

  const inPanel =
    panelItems.some((item) => !item.href.includes('#') && pathname.startsWith(item.href)) ||
    section === 'taller'
  const contactoActive = section === 'contacto'

  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
      <IconLink
        href="/"
        label="Inicio"
        active={pathname === '/' && !section && !open}
        onClick={(event) => {
          if (pathname === '/') {
            event.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }}
      >
        <HomeIcon className="h-5 w-5" />
      </IconLink>

      {shopOpen && (
        <IconLink href="/carrito" label="Carrito" active={pathname === '/carrito' && !open}>
          <CartIcon className="h-5 w-5" />
        </IconLink>
      )}

      {/* «Entrar» cuenta como parte de Cuenta y no como una página aparte: es
          el paso previo obligado sin sesión, así que sigue el mismo hueco
          encendido en vez de apagarlo de golpe. */}
      <IconLink
        href="/cuenta"
        label="Cuenta"
        active={(pathname.startsWith('/cuenta') || pathname.startsWith('/entrar')) && !open}
      >
        <AccountIcon className="h-5 w-5" />
        {/* Cuenta es el único icono que espera de verdad: los demás llevan a
            páginas ya generadas. Ver `NavPending`. */}
        <NavPending label="Abriendo tu cuenta" />
      </IconLink>

      <IconLink href="/#contacto" label="Contacto" active={contactoActive && !open}>
        <ContactIcon className="h-5 w-5" />
      </IconLink>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="menu-escritorio"
        aria-label={open ? 'Cerrar el menú' : 'Más secciones'}
        className={cn(iconClass, iconState(open || inPanel))}
      >
        {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
      </button>
    </nav>
  )
}

/**
 * El menú de escritorio, a pantalla completa como estaba antes y no en un
 * desplegable pegado al botón: son tres secciones editoriales, no un submenú de
 * herramientas, y a tamaño de titular se leen como el índice del sitio.
 *
 * Arranca bajo la cabecera —`top-24`, el alto de la barra en `md`— en vez de
 * cubrirla: así el botón de tres barras se queda a la vista y sigue siendo el
 * mismo sitio donde se pulsa para cerrar. El panel es sólo de escritorio; en
 * móvil el suyo lo pone `MobileNav`, que además tiene que dejar libre la barra
 * de abajo.
 */
function DesktopMenuPanel({
  open,
  pathname,
  onClose,
}: {
  open: boolean
  pathname: string
  onClose: () => void
}) {
  return (
    // `hidden` y no un `return` condicional: así el botón conserva
    // `aria-controls` apuntando a un nodo que siempre existe. Y `max-md:hidden`
    // en vez de `md:block`: cualquier utilidad de `display` a partir de `md`
    // discutiría con el atributo, que es quien apaga el panel cerrado.
    <div
      id="menu-escritorio"
      hidden={!open}
      className="page-gutter fixed inset-x-0 top-24 bottom-0 z-40 overflow-y-auto bg-linen max-md:hidden"
    >
      {/* `min-h-full` en vez de `h-full`: con el menú centrado basta para llenar
          el panel, y si algún día las entradas no caben en pantallas bajas crece
          y el `overflow-y-auto` de arriba las deja alcanzables. */}
      <nav
        className="flex min-h-full flex-col items-center justify-center gap-7 py-12 text-center"
        aria-label="Secciones"
      >
        {panelItems.map((item) => {
          // Las anclas de la portada no se marcan: estando en el inicio se
          // encenderían dos a la vez, y eso es peor que no marcar nada.
          const active = !item.href.includes('#') && pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              onClick={onClose}
              className={cn(
                'font-serif text-title transition-colors duration-500',
                active ? 'text-sage-deep' : 'text-bark hover:text-sage-deep',
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

/**
 * El cuadrado salvia del icono activo, igual que en `MobileNav` pero con hover:
 * en escritorio hay ratón, así que el gesto también se anticipa al pasar por
 * encima y no sólo se confirma al llegar.
 */
const iconClass =
  'tap relative flex h-10 w-10 items-center justify-center transition-colors duration-500'

// Sin `text-bark` en el estado apagado: el icono vive sobre la cabecera, que es
// transparente contra el hero y sólo se vuelve lino al hacer scroll —el color
// tiene que seguir heredando el de `<header>` en vez de fijarse en tinta,
// o se vería oscuro sobre una imagen donde el resto del texto es blanco.
const iconState = (active: boolean) =>
  active ? 'bg-sage-deep/12 text-sage-deep' : 'opacity-70 hover:opacity-100 hover:bg-sage-deep/12'

function IconLink({
  href,
  label,
  active,
  onClick,
  children,
}: {
  href: string
  label: string
  active: boolean
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={cn(iconClass, iconState(active))}
    >
      {children}
    </Link>
  )
}
