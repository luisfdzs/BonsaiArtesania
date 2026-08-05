'use client'

import { useRouter } from 'next/navigation'
import { createContext, useContext, useTransition, type ReactNode } from 'react'

type Switch = {
  /** Hay un cambio de familia en marcha. */
  pending: boolean
  go: (href: string) => void
}

const ShopSwitchContext = createContext<Switch | null>(null)

/**
 * Cambiar de familia en la tienda sin que la página se recargue.
 *
 * Las familias son direcciones de verdad —`/tienda/categoria/anillos`— y tienen
 * que seguir siéndolo: se enlazan, se comparten, las indexan los buscadores y cada
 * una tiene su propio título y su propia entradilla. Así que el cambio no puede
 * ser un `useState` como en la portada; es una navegación.
 *
 * Lo que se arregla es cómo se siente esa navegación, y son dos cosas:
 *
 * 1. **Va dentro de una transición.** React mantiene en pantalla la subsección
 *    que ya está mientras prepara la siguiente, en vez de vaciar la rejilla y
 *    dejar el hueco. Y mientras dura, `pending` es verdadero: eso es lo que enciende
 *    la flor sobre las fotos. Ver `ShopPanel`.
 * 2. **Sin salto de scroll** (`scroll: false`). La barra de familias está pegada
 *    arriba y se usa a mitad de una familia larga; que la página salte al principio
 *    a mitad de gesto es justo lo que hace pensar que se ha recargado.
 *
 * El proveedor vive en el layout de `/tienda` y no en cada página a propósito: el
 * layout no se desmonta al pasar de una familia a otra, y por eso el estado de la
 * espera sobrevive a la navegación que lo provocó. Si viviera en la página, al
 * cambiar de página se iría con ella.
 */
export function ShopSwitchProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const go = (href: string) => {
    startTransition(() => {
      router.push(href, { scroll: false })
    })
  }

  return <ShopSwitchContext.Provider value={{ pending, go }}>{children}</ShopSwitchContext.Provider>
}

/**
 * Devuelve `null` fuera de la tienda, y eso es parte del contrato: la barra de
 * familias también se pinta en la portada, donde no hay conmutador y cada entrada
 * es un enlace normal. Quien lo use tiene que aguantar la ausencia.
 */
export function useShopSwitch(): Switch | null {
  return useContext(ShopSwitchContext)
}
