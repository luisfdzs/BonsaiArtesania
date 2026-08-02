'use client'

import { createPortal } from 'react-dom'
import { FlowerLoader } from './FlowerLoader'

/**
 * La flor a pantalla completa, sobre un lino opaco que tapa la página entera
 * —cabecera y barra de móvil incluidas—.
 *
 * Es el velo que usan `NavPending` (la espera de un enlace) y `FormPending` (la
 * de un formulario). Vive aparte porque los dos lo pintan igual y por el mismo
 * motivo: mientras se espera, el sitio ya no responde a otra cosa, y taparlo
 * entero lo dice mejor que un botón apagado en una esquina.
 *
 * Va por un portal al `body` y no donde se escribe. Dos razones, cada una de un
 * sitio: en `NavPending` el enlace apagado lleva `opacity-70` y la opacidad de un
 * padre no se puede deshacer desde dentro; en `FormPending` el formulario suele
 * estar dentro de una columna estrecha con `overflow` o `transform`, y ahí un
 * `fixed` se mide contra el padre en vez de contra la ventana.
 *
 * El retardo de 180ms antes de asomar lo pone `flower-wait`, dentro de
 * `FlowerLoader`: las esperas que se resuelven rápido no llegan a enseñar nada.
 * Ojo: el velo en sí aparece de golpe; lo que se desvanece es la flor. Es a
 * propósito —el fondo tiene que tapar desde el primer momento para que no se
 * pueda pulsar dos veces—, y como el lino es el mismo de la página, sin la flor
 * todavía puesta no se ve más que la página quieta.
 */
export function WaitVeil({ label }: { label: string }) {
  return createPortal(
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-linen text-bark">
      <FlowerLoader label={label} />
    </div>,
    document.body,
  )
}
