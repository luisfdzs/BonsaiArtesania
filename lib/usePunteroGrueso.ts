'use client'

import { useSyncExternalStore } from 'react'

/**
 * ¿ESTO SE MANEJA CON EL DEDO?
 *
 * Lo contesta el navegador —`(pointer: coarse)`— y no el render, porque en el
 * servidor no hay `matchMedia` y el primer pintado tiene que ser igual en los dos
 * sitios. Es la pregunta que decide dos cosas distintas del panel: quién arrastra
 * (ver `useReordenar`) y cómo se dice de dónde salen las fotos, porque en un
 * teléfono «suéltalas aquí» no significa nada.
 *
 * No es «¿es un móvil?». Un portátil con pantalla táctil contesta que no, porque
 * su puntero principal sigue siendo el ratón, y eso es justo lo que se quiere
 * saber.
 */
const GRUESO = '(pointer: coarse)'

function suscribir(avisar: () => void) {
  const media = window.matchMedia(GRUESO)
  media.addEventListener('change', avisar)
  return () => media.removeEventListener('change', avisar)
}

const ahora = () => window.matchMedia(GRUESO).matches
const enElServidor = () => false

export function usePunteroGrueso(): boolean {
  return useSyncExternalStore(suscribir, ahora, enElServidor)
}
