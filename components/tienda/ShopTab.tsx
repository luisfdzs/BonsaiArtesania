'use client'

import Link from 'next/link'
import { useShopSwitch } from './ShopSwitch'

/**
 * Cada entrada de la barra de familias.
 *
 * Sigue siendo un `<Link>` con su `href` y no un botón, aunque el clic lo atienda
 * el conmutador: es lo que conserva todo lo que un enlace trae de serie —abrir en
 * otra pestaña, copiar la dirección, la precarga de Next, y que un buscador
 * encuentre las subsecciones—. Lo único que hace el `onClick` es quedarse con el
 * caso normal para llevarlo por una transición; ver `ShopSwitch`.
 *
 * Los clics con modificador —control, ⌘, mayúsculas, alt— y los que no son del
 * botón principal se dejan pasar tal cual: quien pide abrir en otra pestaña no
 * está cambiando de familia en esta.
 *
 * Fuera de la tienda no hay conmutador y esto es un enlace y nada más. En la
 * portada, donde las entradas no navegan sino que eligen, la barra la pinta
 * `Escaparate` con sus propios botones.
 */
export function ShopTab({ href, label, active }: { href: string; label: string; active: boolean }) {
  const shop = useShopSwitch()

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      onClick={(event) => {
        if (!shop || active) return
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        shop.go(href)
      }}
      className="shop-tab"
    >
      {label}
    </Link>
  )
}
