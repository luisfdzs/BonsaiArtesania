'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { navigation } from '@/lib/navigation'
import { Wordmark } from './Wordmark'

/**
 * El único componente de cliente del sitio. Necesita JS por dos cosas y ninguna
 * más: el menú en móvil y saber si se ha hecho scroll (para pasar de transparente
 * sobre el hero a fondo lino).
 */
export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  /**
   * El menú guarda la ruta en la que se abrió, no un booleano. Así, al navegar a
   * otra ruta deja de estar abierto por derivación —sin un efecto que llame a
   * setState— y también se cierra con atrás/adelante del navegador.
   */
  const [openedAt, setOpenedAt] = useState<string | null>(null)
  const open = openedAt === pathname
  const setOpen = (value: boolean) => setOpenedAt(value ? pathname : null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

  return (
    <>
      <header
        // Con el menú abierto la barra deja de estar "sobre el hero": pasa a lino
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
              setOpen(false)
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
                separan con un filete.

                El carrito no muestra el número de piezas: para saberlo habría que
                consultar la base de datos en el layout raíz, y eso convertiría
                todas las páginas —portada y tienda incluidas— en dinámicas. No
                merece la pena por una cifra. Cuando se active PPR se podrá
                streamear el contador sin perder el shell estático. */}
            <span className="ml-3 flex items-center gap-6 border-l border-current/20 pl-6">
              <Link
                href="/carrito"
                className="link-underline tap text-small tracking-wide opacity-70 transition-opacity duration-500 hover:opacity-100"
              >
                Carrito
              </Link>
              <Link
                href="/cuenta"
                className="link-underline tap text-small tracking-wide opacity-70 transition-opacity duration-500 hover:opacity-100"
              >
                Cuenta
              </Link>
            </span>
          </nav>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="menu-movil"
            className="eyebrow inline-flex items-center justify-center rounded-full border border-current/30 px-4 py-3 text-current transition-colors duration-500 hover:border-current/60 md:hidden"
          >
            {open ? 'Cerrar' : 'Menú'}
          </button>
        </div>
      </header>

      {/* Panel móvil a pantalla completa. Va FUERA del <header> a propósito: la
          barra usa backdrop-blur, y un filtro convierte al elemento en bloque
          contenedor de sus descendientes `fixed` — dentro, el panel calcularía su
          alto contra una barra de 80px y se abriría vacío. */}
      <div
        id="menu-movil"
        hidden={!open}
        className="page-gutter fixed inset-0 top-20 z-40 bg-linen md:hidden"
      >
        <nav className="flex flex-col gap-7 pt-12" aria-label="Principal">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-serif text-title"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/carrito"
            className="mt-4 border-t border-line pt-7 font-serif text-title"
            onClick={() => setOpen(false)}
          >
            Carrito
          </Link>
          <Link href="/cuenta" className="font-serif text-title" onClick={() => setOpen(false)}>
            Cuenta
          </Link>
        </nav>
      </div>
    </>
  )
}
