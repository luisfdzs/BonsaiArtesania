'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { navigation } from '@/lib/navigation'
import { useActiveSection } from '@/lib/useActiveSection'
import { AccountIcon, CartIcon, CloseIcon, ContactIcon, HomeIcon, MenuIcon } from './NavIcons'
import { Wordmark } from './Wordmark'

/**
 * Necesita JS por dos cosas: saber si se ha hecho scroll, para pasar de
 * transparente sobre el hero a fondo lino, y llevar el mismo menú de iconos que
 * `MobileNav` —inicio, cuenta, carrito, contacto y un desplegable «Más» con las
 * secciones editoriales— para que el sitio se navegue igual en cualquier tamaño.
 */
export function Header({ shopOpen }: { shopOpen: boolean }) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      data-top={!scrolled}
      className={cn(
        'sticky top-0 z-50 transition-colors duration-700',
        scrolled ? 'bg-linen/90 text-bark backdrop-blur-md' : 'bg-transparent',
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
            if (pathname === '/') {
              event.preventDefault()
              window.scrollTo({ top: 0 })
            }
          }}
        >
          <Wordmark className="h-7 md:h-9" />
        </Link>

        <DesktopNav pathname={pathname} shopOpen={shopOpen} />
      </div>
    </header>
  )
}

/**
 * El mismo repertorio que `MobileNav`, en horizontal: inicio, cuenta, carrito y
 * contacto son iconos con el mismo cuadrado salvia de activo, y las tres
 * secciones editoriales que no caben aquí (Tienda, Encargos, El taller) viven
 * detrás de «Más». Antes el escritorio tenía su propio menú de texto porque
 * había sitio de sobra para las cuatro entradas de `navigation`; ahora dice lo
 * mismo que el móvil en vez de decirlo distinto.
 */
function DesktopNav({ pathname, shopOpen }: { pathname: string; shopOpen: boolean }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const section = useActiveSection()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    const onClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('click', onClick)
    }
  }, [open])

  const panelItems = navigation.filter((item) => item.href !== '/#contacto')
  const inPanel =
    panelItems.some((item) => !item.href.includes('#') && pathname.startsWith(item.href)) ||
    section === 'taller'
  const contactoActive = section === 'contacto'

  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
      <IconLink
        href="/"
        label="Inicio"
        active={pathname === '/' && !section}
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
        <IconLink href="/carrito" label="Carrito" active={pathname === '/carrito'}>
          <CartIcon className="h-5 w-5" />
        </IconLink>
      )}

      {/* «Entrar» cuenta como parte de Cuenta y no como una página aparte: es
          el paso previo obligado sin sesión, así que sigue el mismo hueco
          encendido en vez de apagarlo de golpe. */}
      <IconLink
        href="/cuenta"
        label="Cuenta"
        active={pathname.startsWith('/cuenta') || pathname.startsWith('/entrar')}
      >
        <AccountIcon className="h-5 w-5" />
      </IconLink>

      <IconLink href="/#contacto" label="Contacto" active={contactoActive}>
        <ContactIcon className="h-5 w-5" />
      </IconLink>

      <div ref={panelRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="menu-escritorio"
          aria-label={open ? 'Cerrar el menú' : 'Más secciones'}
          className={cn(iconClass, iconState(open || inPanel))}
        >
          {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>

        {/* `hidden` y no un `return` condicional: así el botón conserva
            `aria-controls` apuntando a un nodo que siempre existe. */}
        <div
          id="menu-escritorio"
          hidden={!open}
          className="absolute top-full right-0 z-50 mt-2 min-w-40 border border-line bg-linen py-2 shadow-lg"
        >
          {panelItems.map((item) => {
            const isSection = item.href.includes('#')
            const active = !isSection && pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  'block px-4 py-2 text-small tracking-wide whitespace-nowrap transition-colors duration-500',
                  active ? 'bg-sage-deep/12 text-sage-deep' : 'text-bark opacity-70 hover:opacity-100 hover:bg-sage-deep/12',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
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
  active
    ? 'bg-sage-deep/12 text-sage-deep'
    : 'opacity-70 hover:opacity-100 hover:bg-sage-deep/12'

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
