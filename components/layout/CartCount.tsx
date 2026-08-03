'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'

/**
 * El contador de piezas del carrito, para el indicador de la barra de móvil.
 *
 * La cifra se pide al vuelo a `/api/carrito/count` en vez de bajar como prop
 * desde el layout: el carrito vive en la base de datos y leerlo en el servidor
 * volvería dinámicas todas las páginas del sitio (ver el comentario del
 * endpoint). La contrapartida es que la cifra llega un instante después que la
 * barra; mientras no está, no se pinta nada —nunca un cero de relleno.
 *
 * Se vuelve a pedir en tres momentos: al cambiar de ruta, al volver a la pestaña
 * y cuando algo la avisa por el evento de abajo. Con eso basta: no hay ningún
 * otro camino por el que el carrito cambie mientras la barra está a la vista.
 */

/** Aviso de «el carrito ha cambiado». Lo dispara `<CartPing>`. */
const CART_CHANGED = 'ba:carrito'

export function useCartCount(enabled: boolean): number | null {
  const pathname = usePathname()
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    if (!enabled) return

    const controller = new AbortController()

    // La barra sólo existe por debajo de `md`, pero el componente se monta
    // siempre: sin esta comprobación, cada visita de escritorio pediría una cifra
    // que nadie va a ver, y detrás de esa cifra hay una consulta a la base de
    // datos. En `max-width` y no en `width <` porque la sintaxis de rangos no
    // llegó a Safari hasta 16.4 y ahí la barra sí se ve.
    const media = window.matchMedia('(max-width: 47.9375rem)')

    const read = async () => {
      try {
        const response = await fetch('/api/carrito/count', {
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!response.ok) return

        const data: unknown = await response.json()
        const value = (data as { count?: unknown }).count
        if (typeof value === 'number') setCount(value)
      } catch {
        // Se queda con la cifra que hubiera. Que falle el contador no puede
        // estorbar al enlace del carrito, que es lo que de verdad hace falta.
      }
    }

    // Nada que pedir mientras la barra no esté a la vista. Se comprueba en cada
    // disparo y no una sola vez: girar el móvil o estrechar la ventana de
    // escritorio hace aparecer la barra sin volver a montar nada.
    const sync = () => {
      if (media.matches) void read()
    }

    // Al volver de otra pestaña o de otro dispositivo el carrito puede haber
    // cambiado. `visibilitychange` cubre además el móvil que sale de segundo
    // plano, que es donde vive esta barra.
    const onVisible = () => {
      if (document.visibilityState === 'visible') sync()
    }

    sync()
    media.addEventListener('change', sync)
    window.addEventListener(CART_CHANGED, sync)
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      controller.abort()
      media.removeEventListener('change', sync)
      window.removeEventListener(CART_CHANGED, sync)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [enabled, pathname])

  return count
}

/**
 * Avisa de que el carrito ha cambiado, para colgarlo dentro de un formulario que
 * lo modifique: añadir, cambiar cantidad o quitar.
 *
 * No pinta nada y no toca el formulario, y por eso está hecho así: envolver la
 * acción de servidor en una función propia para enterarse de cuándo acaba
 * rompería el envío sin JavaScript, que en esos formularios sí funciona.
 * `useFormStatus` mira el estado desde dentro y no se mete en medio.
 */
export function CartPing() {
  const { pending } = useFormStatus()
  const wasPending = useRef(false)

  useEffect(() => {
    if (pending) {
      wasPending.current = true
      return
    }
    // Sólo al pasar de «enviando» a «hecho»: en el primer render no hay nada
    // que avisar, y el contador acaba de pedirse solo.
    if (!wasPending.current) return

    wasPending.current = false
    window.dispatchEvent(new Event(CART_CHANGED))
  }, [pending])

  return null
}
