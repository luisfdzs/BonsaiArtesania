'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Las secciones de la portada que se comportan como una página propia en la
 * navegación: tienen su propio hueco en la barra (Contacto) o cuentan para el
 * estado del desplegable «Más» (El taller).
 *
 * Cada una lleva además la ruta que se enseña mientras se está en ella. Antes
 * se escribía el hash —`/#taller`— y la almohadilla queda rara en la barra de
 * direcciones: no se lee como una página, y un enlace copiado de ahí parece un
 * trozo suelto de la portada. La sección sigue estando en la portada; lo único
 * que cambia es cómo se escribe.
 *
 * El taller se anuncia como `/el-taller` y no como `/taller` porque esa ruta ya
 * es el panel de gestión: dejarla puesta significaría que recargar desde la
 * sección abre el panel —o un 404, para quien no es Ana—.
 */
const SECTIONS = [
  { id: 'taller', path: '/el-taller' },
  { id: 'contacto', path: '/contacto' },
] as const

type Section = (typeof SECTIONS)[number]

/** Arriba del todo, antes de la primera sección, la portada es la portada. */
const HOME = '/'

/**
 * Si esta ruta es la portada, contando las que se escriben al entrar en una
 * sección. Quien pregunta es la navegación: estando en Contacto seguimos en la
 * portada, así que el icono de la casa tiene que subir al principio en vez de
 * navegar, aunque la barra de direcciones diga otra cosa.
 */
export function onHome(pathname: string): boolean {
  return pathname === HOME || SECTIONS.some((section) => section.path === pathname)
}

/**
 * La sección de la portada en la que se está, tratada igual que una ruta.
 *
 * La URL por sí sola sólo cambia al enlazar o al ir atrás/adelante: quien llega
 * a Contacto haciendo scroll, sin tocar el menú, se quedaría con la de antes y
 * ningún hueco se encendería —justo la asimetría que no pasa entre páginas de
 * verdad, donde estar en una ruta basta para que se marque sola—. Así que aquí
 * se sigue el scroll y se escribe la ruta a mano con `replaceState` según la
 * sección cruza la línea de la cabecera. Sin recargar ni navegar a ningún lado:
 * la página es la misma, sólo cambia lo que pone en la barra.
 *
 * `replaceState` y no `pushState` a propósito: la sección no es un destino
 * nuevo, así que atrás tiene que salir de la portada y no ir deshaciendo el
 * scroll sección a sección.
 *
 * Quien recargue o comparta una de esas rutas cae en la redirección de
 * `next.config.ts`, que devuelve a la portada con la sección enfocada.
 *
 * Devuelve '' fuera de la portada o antes de llegar a la primera sección.
 */
export function useActiveSection(): string {
  const pathname = usePathname()
  const [id, setId] = useState('')

  // Ojo con `pathname`: Next sincroniza `replaceState` con su router, así que
  // al entrar en una sección pasa a valer `/contacto` y el efecto se vuelve a
  // montar. Por eso quien decide si estamos en la portada no es la ruta —que
  // puede ser una de las escritas a mano— sino que las secciones estén de
  // verdad en el documento.
  useEffect(() => {
    const sections = SECTIONS.map((section) => ({
      section,
      el: document.getElementById(section.id),
    })).filter((entry): entry is { section: Section; el: HTMLElement } => entry.el !== null)

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
      let current: Section | null = null
      for (const entry of sections) {
        if (entry.el.getBoundingClientRect().top <= LINE + TOLERANCE) current = entry.section
      }
      setId(current ? current.id : '')

      // El hash entra en la comparación para limpiarlo si venía puesto —de un
      // enlace `/#contacto` guardado de antes, o del salto al ancla—: si no,
      // quedaría colgando detrás de la ruta nueva.
      const url = current ? current.path : HOME
      if (window.location.pathname + window.location.hash !== url) {
        history.replaceState(null, '', url)
      }
    }
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(read)
    }

    // Llegando desde la redirección de `/contacto` la portada se carga con el
    // ancla puesta, y el salto del navegador ocurre después de hidratar: para
    // entonces el primer `read()` ya habría reescrito la URL a `/` —sin hash— y
    // el salto se quedaría sin sitio al que ir, con la portada arriba del todo.
    // Así que el salto lo damos nosotros, antes de la primera lectura. Seco y
    // no suave: se acaba de llegar, no se está recorriendo la página.
    const landing = sections.find((entry) => `#${entry.section.id}` === window.location.hash)
    if (landing) landing.el.scrollIntoView({ behavior: 'instant' })

    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [pathname])

  // Fuera de la portada no hay sección que valga: el id que quedó de la última
  // visita se apaga aquí y no con un `setState` dentro del efecto, que sería
  // una renderización en cascada por cada cambio de página.
  return onHome(pathname) ? id : ''
}
