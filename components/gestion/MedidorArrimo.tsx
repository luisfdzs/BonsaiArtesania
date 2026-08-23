'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { arrimoDebug } from '@/lib/useReordenar'

/**
 * EL MEDIDOR DEL ARRIMADO. Temporal, y sólo con `?depurar=1` en la dirección.
 *
 * Está para contestar una pregunta y luego se borra: cuando el dedo llega al borde
 * en un teléfono de verdad, ¿el arrimado pide poca velocidad, o pide mucha y la
 * pantalla no le hace caso? Son dos averías distintas y desde fuera se ven igual.
 *
 * - `pedido` es a cuántos píxeles por segundo dice el cálculo que hay que ir.
 * - `movido` es cuántos se ha movido la página de verdad en el último segundo.
 *
 * Si `pedido` se queda bajo, el que está mal es el cálculo —la banda, la altura de
 * la pantalla—. Si `pedido` es alto y `movido` no lo acompaña, el que no obedece es
 * el navegador y hay que desplazar de otra manera.
 */

/** En el servidor no hay `location`, y esto también se pinta allí. */
const sinCambios = () => () => {}
const hayQueDepurar = () => location.search.includes('depurar')
const enElServidor = () => false
export function MedidorArrimo() {
  const activo = useSyncExternalStore(sinCambios, hayQueDepurar, enElServidor)
  const [linea, setLinea] = useState('')

  useEffect(() => {
    if (!activo) return

    let vivo = true
    const mirar = () => {
      if (!vivo) return
      const d = arrimoDebug
      setLinea(
        [
          `y:${Math.round(d.y)}`,
          `alto:${Math.round(d.alto)}/${window.innerHeight}`,
          `pedido:${Math.round(d.pedido)}`,
          `movido:${Math.round(d.movido)}`,
          `fps:${d.fps}`,
        ].join('  '),
      )
      setTimeout(mirar, 250)
    }
    mirar()

    return () => {
      vivo = false
    }
  }, [activo])

  if (!activo) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-100 bg-bark/90 px-2 py-1 text-center font-mono text-[11px] text-linen">
      {linea || 'arrastra por las rayas hasta el borde…'}
    </div>
  )
}
