'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { NavPending } from '@/components/ui/NavPending'
import { cn } from '@/lib/cn'
import type { Localized } from '@/lib/i18n/config'
import { localeOf, path, routeOf } from '@/lib/i18n/routes'
import { useTranslator } from '@/lib/i18n/useLocale'
import { onHome, useActiveSection } from '@/lib/useActiveSection'
import { useCartCount } from './CartCount'
import { AppMovil } from './AppMovil'
import { LocalePicker } from './LocalePicker'
import { AccountIcon, CartIcon, CloseIcon, HomeIcon, MenuIcon, ShopIcon } from './NavIcons'

/**
 * La navegación de móvil: un cilindro fijo abajo, flotando con aire alrededor,
 * siempre a la vista, en cualquier página y a cualquier altura del scroll.
 *
 * Sustituye al botón «Menú» de la cabecera y a su panel a pantalla completa. El
 * motivo es el pulgar: en un teléfono en la mano, el borde inferior se alcanza sin
 * recolocar el aparato y la esquina superior derecha no. Arriba se queda sólo la
 * marca, que es identidad y no navegación.
 *
 * Cinco sitios, de izquierda a derecha: inicio, tienda, carrito, cuenta y el
 * resto del menú. Los cuatro primeros son destinos y el quinto abre el panel. Con
 * la tienda cerrada el carrito no aparece y quedan cuatro.
 *
 * El orden va de fuera adentro: primero la casa, luego lo que se viene a ver
 * —tienda—, luego lo que se lleva —carrito— y al final lo que es de uno —cuenta—.
 * Tienda y cuenta estaban al revés, y eso ponía lo privado antes que el catálogo
 * en el sitio más cómodo de la barra.
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

  /**
   * LO QUE HAY EN EL PANEL, en este orden: inicio, carrito, tienda, contacto y mi
   * cuenta.
   *
   * Ya no se deriva de `navigation` quitando lo que está en la barra. Eso lo hacía
   * el complemento de la barra —«las secciones que no caben»— y por eso el panel
   * era una lista corta y rara: Encargos, El taller y Contacto. Ahora es un menú
   * completo, con los sitios a los que se va, repitiendo a propósito los que
   * también están abajo en iconos: un menú abierto se lee, y quien lo abre está
   * buscando un nombre escrito, no acordándose de qué dibujo era cada cosa.
   *
   * Escrito aquí y no en `lib/navigation.ts` porque no es el menú del sitio —el
   * que comparten la cabecera y el pie— sino el de este panel, con dos entradas
   * que no son secciones (el carrito y la cuenta) y sin las dos que viven dentro
   * de la portada.
   *
   * El carrito, como en la barra, sólo con la tienda abierta.
   */
  const panelItems: { route: string; label: Localized }[] = [
    { route: '/', label: { es: 'Inicio', gl: 'Inicio' } },
    ...(shopOpen ? [{ route: '/carrito', label: { es: 'Carrito', gl: 'Carro' } }] : []),
    { route: '/tienda', label: { es: 'Tienda', gl: 'Tenda' } },
    { route: '/#contacto', label: { es: 'Contacto', gl: 'Contacto' } },
    { route: '/cuenta', label: { es: 'Mi cuenta', gl: 'A miña conta' } },
  ]

  // Estando en Encargos, en El taller o en Contacto, ninguno de los cuatro
  // destinos de la barra diría dónde está: son secciones de la portada y no
  // páginas. Así que se marca el botón del menú, y la barra nunca queda sin
  // señalar la página.
  //
  // Antes esto miraba además las rutas del panel. Ya no puede: el panel repite los
  // destinos que la barra tiene en iconos, así que en el carrito o en la tienda se
  // encenderían dos huecos a la vez, el icono y el menú.
  const inPanel = section === 'encargos' || section === 'taller' || section === 'contacto'

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
        inert={!open}
        className={cn(
          'page-gutter fixed inset-0 z-50 overflow-y-auto bg-linen pb-(--spacing-nav-mobile) transition-opacity duration-300 ease-out md:hidden',
          open ? 'opacity-100' : 'opacity-0',
        )}
      >
        {/* Tres partes de alto: un hueco, las secciones y otro hueco. Los dos huecos
            son **exactamente iguales** —`flex-1 basis-0 min-h-12` los dos, las tres
            cosas—, y de ahí sale todo lo demás: las secciones quedan en el medio de
            la pantalla y el botón de la app, centrado en el hueco de arriba, a la
            misma distancia del tope que del menú.

            Que sean iguales *hasta en la base* es el arreglo de un bug, no una
            floritura. Con `flex-1` a secas, cada hueco crece a partir de su
            contenido: el de arriba partía del alto del botón y el de abajo de cero,
            así que las secciones caían 21 px más abajo cuando el botón estaba que
            cuando no —medido—. Y como el botón aparece un instante después de cargar
            —el navegador tarda en avisar de que la web es instalable, ver
            `AppMovil`—, el menú se recolocaba solo delante de quien lo tenía
            abierto. Con `basis-0` los dos huecos miden lo mismo pase lo que pase
            dentro, y el menú ya no depende de lo que haya en él.

            El `gap` va en el grupo del medio y no en el `nav`: puesto en el `nav`
            sumaba su hueco por debajo del botón y rompía la simetría. Y el relleno
            de arriba no está por lo mismo. El `min-h-12` es para que en una pantalla
            corta el botón no se pegue al canto. */}
        <nav
          className="flex min-h-full flex-col items-center pb-12 text-center"
          aria-label={t({ es: 'Secciones', gl: 'Seccións' })}
        >
          {/* Instalar la web, arriba. Es lo único del menú que no está en ninguna
              otra parte del sitio: a las secciones se llega también por la barra y
              por el pie. Y lo que ofrece depende de por dónde se haya quedado
              —instalar, activar los avisos, o nada—: ver `AppMovil` —y entonces este hueco queda vacío y todo sigue centrado—. */}
          <div className="flex min-h-12 flex-1 basis-0 items-center">
            <AppMovil />
          </div>

          <div className="flex flex-col items-center gap-7">
            {panelItems.map((item) => (
              <Link
                key={item.route}
                href={path(locale, item.route)}
                /* En el verde de la casa, como el resto del menú —el filete y los
                   cantos de las banderas—: el panel es lo único del sitio que se
                   ve a pantalla completa sin nada más, y en tinta se leía como un
                   índice de documento en vez de como la casa. */
                className="font-serif text-title text-sage-deep"
                onClick={close}
              >
                {t(item.label)}
              </Link>
            ))}

            {/* El idioma, debajo de las tres secciones y detrás de un filete. Ver
              `LocalePicker`. */}
            <LocalePicker onNavigate={close} />
          </div>

          {/* El mismo hueco de arriba, y las mismas tres clases: si aquí faltara
              alguna, los dos huecos volverían a medir distinto. */}
          <div className="min-h-12 flex-1 basis-0" aria-hidden />
        </nav>
      </div>

      <nav
        aria-label="Principal"
        className="fixed inset-x-(--spacing-nav-mobile-air) bottom-[calc(var(--spacing-nav-mobile-air)+env(safe-area-inset-bottom))] z-50 flex h-(--spacing-nav-mobile-bar) items-stretch rounded-full border border-sage-deep bg-linen/95 shadow-[0_2px_20px_rgba(60,54,46,0.10)] backdrop-blur-md md:hidden"
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

        <NavSlot
          href={path(locale, '/tienda')}
          label={t({ es: 'Tienda', gl: 'Tenda' })}
          active={route.startsWith('/tienda') && !open}
          onClick={close}
        >
          <ShopIcon className="h-6 w-6" />
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

/* Todos los iconos en el verde de la casa, también el filete del cilindro: la
   barra es de la casa, no un mueble del sistema. Lo que distingue al activo ya no
   es el color sino la fuerza —el apagado va al 55%— y el círculo salvia de detrás,
   que es lo que de verdad se ve a 24px. */
const slotState = (active: boolean) => (active ? 'text-sage-deep' : 'text-sage-deep opacity-55')

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
