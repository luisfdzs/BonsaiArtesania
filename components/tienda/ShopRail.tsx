'use client'

import { useEffect, useRef } from 'react'

/**
 * El carril que scrollea de la barra de familias. Sólo existe aparte —y sólo por
 * esto es cliente— para una cosa: en móvil las familias no caben de una vez, y
 * al entrar en «Del taller», que es la última, la barra aparecería mostrando las
 * primeras y con la abierta fuera de pantalla. Aquí se coloca centrada nada más
 * montar, así que la barra empieza diciendo dónde estás.
 *
 * Va suelto y no dentro de `CategoryNav` a propósito: el catálogo entero —textos,
 * materiales y descripciones de cien piezas— se importa ahí para contar las
 * familias, y marcar ese componente como cliente lo mandaría al navegador entero
 * para no usar de él más que los rótulos.
 */
export function ShopRail({ children }: { children: React.ReactNode }) {
  const rail = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = rail.current
    if (!node) return

    // La tienda marca la familia abierta con `aria-current` y la portada, donde
    // las entradas son pestañas y no enlaces, con `aria-selected`. Ver
    // `Escaparate`.
    const active = node.querySelector<HTMLElement>('[aria-current="page"], [aria-selected="true"]')
    if (!active) return

    // `scrollIntoView` movería también la página —la barra está a media altura
    // en la subsección— y la dejaría empezada por la mitad. Escribir `scrollLeft`
    // mueve el carril y nada más. El navegador ya recorta lo que se pase de los
    // extremos, así que «Todo» centrado sale simplemente pegado a la izquierda.
    node.scrollLeft = active.offsetLeft - (node.clientWidth - active.offsetWidth) / 2
  }, [])

  return (
    <div ref={rail} className="shop-rail">
      {children}
    </div>
  )
}
