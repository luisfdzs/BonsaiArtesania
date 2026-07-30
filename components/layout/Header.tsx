'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { navigation } from '@/lib/navigation'
import { AccountIcon, CartIcon } from './NavIcons'
import { Wordmark } from './Wordmark'

/**
 * Necesita JS por una sola cosa: saber si se ha hecho scroll, para pasar de
 * transparente sobre el hero a fondo lino.
 *
 * En móvil la cabecera es sólo la marca. La navegación se fue abajo, a la barra
 * fija de `MobileNav`, y con ella el botón «Menú» y el panel a pantalla completa
 * que vivían aquí.
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

        <nav className="hidden items-center gap-9 md:flex" aria-label="Principal">
          {navigation.map((item) => {
            // Las anclas de la portada no se marcan como activas: estando en el
            // inicio se marcarían dos a la vez, y eso es peor que no marcar nada.
            const isSection = item.href.includes('#')
            const active = !isSection && pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'link-underline tap text-small tracking-wide transition-opacity duration-500',
                  active ? 'opacity-100' : 'opacity-70 hover:opacity-100',
                )}
              >
                {item.label}
              </Link>
            )
          })}
          {/* «Carrito» y «Cuenta» van fuera de `navigation` a propósito: ese
              array es el menú editorial del sitio y quiere quedarse en cuatro
              entradas. Estas dos son herramientas, no secciones, y por eso se
              separan con un filete y se dicen con un icono, no con la palabra.

              Sin `link-underline` en ellas: el filete de ese efecto cruzaría
              por debajo del dibujo y parecería un error. Basta la opacidad.

              Aquí el carrito sigue sin número, y no es un olvido: leerlo en el
              servidor convertiría todas las páginas en dinámicas. El indicador
              existe sólo en la barra de móvil, que lo pide al vuelo a un endpoint
              —ver `CartCount`—. En escritorio no hace tanta falta: el menú entero
              está a la vista y el carrito no queda debajo del pulgar. */}
          <span className="ml-3 flex items-center gap-6 border-l border-current/20 pl-6">
            {/* Sin tienda abierta no hay carrito que enseñar. «Cuenta» sí se
                queda: quien ya tenga una debe poder entrar a ver sus pedidos. */}
            {shopOpen && (
              <Link
                href="/carrito"
                aria-label="Carrito"
                className="tap opacity-70 transition-opacity duration-500 hover:opacity-100"
              >
                <CartIcon className="h-5 w-5" />
              </Link>
            )}
            <Link
              href="/cuenta"
              aria-label="Cuenta"
              className="tap opacity-70 transition-opacity duration-500 hover:opacity-100"
            >
              <AccountIcon className="h-5 w-5" />
            </Link>
          </span>
        </nav>
      </div>
    </header>
  )
}
