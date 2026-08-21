'use client'

import { useSyncExternalStore } from 'react'
import { MAZO, type AjustesMazo } from '@/components/tienda/motorDelMazo'

/**
 * Los ajustes del mazo, compartidos entre las dos pestañas de la prueba: en una
 * está el catálogo a pantalla de móvil, en la otra los mandos.
 *
 * Va por `BroadcastChannel` —un canal entre pestañas del mismo sitio— con
 * `localStorage` de respaldo para que al abrir la segunda pestaña ya empiece con
 * lo que había puesto. Es sólo para probar: en la tienda los números viven en
 * `MAZO` y no hay nada de esto.
 */
const CANAL = 'bonsai-mazo'
const CAJON = 'bonsai-mazo-ajustes'

/** Lo último publicado, ya resuelto. Se guarda para que `useSyncExternalStore`
 *  reciba siempre el mismo objeto mientras no cambie nada. */
let cache: AjustesMazo | null = null

function leerGuardado(): AjustesMazo {
  if (cache) return cache
  try {
    const crudo = window.localStorage.getItem(CAJON)
    cache = crudo ? { ...MAZO, ...(JSON.parse(crudo) as AjustesMazo) } : MAZO
  } catch {
    cache = MAZO
  }
  return cache
}

const oyentes = new Set<() => void>()

function avisar() {
  cache = null
  oyentes.forEach((oyente) => oyente())
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente)
  const canal = new BroadcastChannel(CANAL)
  canal.onmessage = (evento) => {
    cache = evento.data as AjustesMazo
    oyentes.forEach((o) => o())
  }
  return () => {
    oyentes.delete(oyente)
    canal.close()
  }
}

export function useAjustesCompartidos(): [AjustesMazo, (nuevos: AjustesMazo) => void] {
  // `useSyncExternalStore` y no un `useState` con `useEffect`: lo que manda no es
  // el estado de esta pestaña, es el canal. Así React lee de la fuente en vez de
  // copiarla, que es lo que pedía el linter con razón.
  const ajustes = useSyncExternalStore(suscribir, leerGuardado, () => MAZO)

  const publicar = (nuevos: AjustesMazo) => {
    try {
      window.localStorage.setItem(CAJON, JSON.stringify(nuevos))
      const canal = new BroadcastChannel(CANAL)
      canal.postMessage(nuevos)
      canal.close()
    } catch {
      // Sin canal ni almacén, la pestaña se queda con lo suyo y no pasa nada.
    }
    avisar()
  }

  return [ajustes, publicar]
}
