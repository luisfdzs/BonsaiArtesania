'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Ids de las secciones de la portada que se comportan como una página propia
 * en la navegación: tienen su propio hueco en la barra (Contacto) o cuentan
 * para el estado del desplegable «Más» (El taller).
 */
const SECTION_IDS = ['taller', 'contacto']

/**
 * La sección de la portada en la que se está, tratada igual que una ruta.
 *
 * El hash por sí solo sólo cambia al enlazar o al ir atrás/adelante: quien
 * llega a Contacto haciendo scroll, sin tocar el menú, se queda con el hash de
 * antes y ningún hueco se enciende —justo la asimetría que no pasa entre
 * páginas de verdad, donde estar en una ruta basta para que se marque sola.
 * Así que aquí también se sigue el scroll, y se escribe el hash a mano con
 * `replaceState` según la sección cruza la línea de la cabecera: entrar en
 * una sección de la portada pasa a marcarse igual que entrar en una página.
 *
 * Devuelve '' fuera de la portada o antes de llegar a la primera sección.
 */
export function useActiveSection(): string {
  const pathname = usePathname()
  const [id, setId] = useState('')

  useEffect(() => {
    if (pathname !== '/') return

    const sections = SECTION_IDS.map((sectionId) => document.getElementById(sectionId)).filter(
      (el): el is HTMLElement => el !== null,
    )
    if (!sections.length) return

    // La línea a la altura de la cabecera: una sección cuenta como «la
    // actual» en cuanto su borde superior la cruza, igual que se lee arriba
    // del todo nada más llegar a una página nueva. El margen de unos pocos
    // píxeles importa de verdad: el scroll automático al enlazar a una
    // sección la deja con el borde justo en `scroll-padding-top` (96px),
    // pero el redondeo de subpíxel puede dejarla en 96,17 y, sin margen, esa
    // fracción de más bastaba para que nunca se contara cruzada —Contacto,
    // al ser la última sección, se quedaba entonces marcando El taller para
    // siempre—.
    const LINE = 96
    const TOLERANCE = 4

    let frame = 0
    const read = () => {
      frame = 0
      let current = ''
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= LINE + TOLERANCE) current = el.id
      }
      setId(current)
      const hash = current ? `#${current}` : ''
      if (window.location.hash !== hash) {
        history.replaceState(null, '', hash ? `${pathname}${hash}` : pathname)
      }
    }
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(read)
    }

    read()
    // El hash también cambia sin scroll —enlace directo, atrás/adelante— y ahí
    // es la URL la que manda, no la posición.
    const onHash = () => setId(window.location.hash.slice(1))
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('hashchange', onHash)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('hashchange', onHash)
    }
  }, [pathname])

  return pathname === '/' ? id : ''
}
