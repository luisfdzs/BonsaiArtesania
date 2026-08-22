'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Media } from '@/components/ui/Media'
import { cn } from '@/lib/cn'
import type { Seguir } from '@/components/tienda/ShopDeck'
import type { Image } from '@/lib/media'

export type FlowFamily = {
  key: string
  label: string
  /** La primera foto de la familia: es la miniatura del carril. */
  thumb: Image | null
  /** Sólo en la tienda, donde cada familia además es una página. */
  href?: string
}

type Props = {
  familias: FlowFamily[]
  index: number
  onSelect: (index: number) => void
  navLabel: string
  /**
   * El arrastre del mazo de productos, para que las miniaturas se muevan a la vez
   * que las piezas y no cuando el gesto acaba. Ver `Seguir` en `ShopDeck`.
   */
  arrastre?: Seguir
}

/**
 * LA BARRA DE FAMILIAS. La misma en la tienda y en el escaparate de la portada.
 *
 * Arriba, en todas las pantallas, el cover flow: la familia abierta va de frente
 * en el centro y las vecinas giran sobre su eje y se van hacia atrás. El giro, el
 * velo y la profundidad los hace CSS con `animation-timeline: view()` —ver
 * `thumb-flow` en globals.css—, así que el movimiento va pegado al dedo: no hay un
 * fotograma de JavaScript por medio, lo que se mueve es el scroll del carril y el
 * resto es consecuencia. Donde no haya timelines de scroll el carril se queda
 * plano, que se lee igual de bien.
 *
 * Debajo, lo que sirve para elegir una familia por su nombre, y ahí sí cambia
 * según la pantalla:
 *
 * - **En el teléfono, el desplegable del sistema.** Un `select` de los de
 *   siempre: la lista la abre y la pinta el móvil —la rueda de iOS, la lista a
 *   pantalla de Android—, con el tamaño de letra que el visitante tenga puesto y
 *   donde su pulgar ya sabe buscarla. No hay nada que aprender.
 * - **En el escritorio, el rótulo con chevrón.** Al pulsarlo se despliega la
 *   lista entera flotando sobre el catálogo, sin empujarlo; con ratón y sitio de
 *   sobra, ver las siete de un vistazo gana a abrir un desplegable del sistema.
 *
 * Los dos se pintan siempre y se reparten con `md:`, no con una media query leída
 * en JavaScript: así el HTML que llega del servidor ya es el bueno y no hay un
 * primer pintado con la barra que no toca.
 */
export function FamilyFlow({ familias, index, onSelect, navLabel, arrastre }: Props) {
  const [desplegado, setDesplegado] = useState(false)
  const abierta = familias[index]

  return (
    <div className="relative">
      {/* El ancho del carril se mide en familias, no en pantallas: ver
          `thumb-flow-frame` en globals.css. */}
      <nav
        aria-label={navLabel}
        className="thumb-flow-frame"
        style={{ '--flow-count': familias.length } as CSSProperties}
      >
        <Carril familias={familias} index={index} onSelect={onSelect} arrastre={arrastre} />
      </nav>

      <div className="family-select md:hidden">
        <select
          aria-label={navLabel}
          value={index}
          onChange={(event) => onSelect(Number(event.target.value))}
        >
          {familias.map((f, i) => (
            <option key={f.key} value={i}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="relative hidden md:block">
        <button
          type="button"
          onClick={() => setDesplegado((v) => !v)}
          aria-expanded={desplegado}
          /* La flecha va debajo del rótulo y no a su derecha: centrada bajo el
             nombre, la columna entera —miniatura, nombre, flecha— queda en un
             solo eje y la barra se lee de arriba abajo sin nada que la desvíe. */
          className="mx-auto flex flex-col items-center gap-1.5 pt-2.5 pb-4 text-sage-deep"
        >
          <span className="font-serif text-lead leading-none">{abierta?.label}</span>
          <Chevron abierto={desplegado} />
        </button>

        <Panel
          familias={familias}
          index={index}
          abierto={desplegado}
          onSelect={(i) => {
            onSelect(i)
            setDesplegado(false)
          }}
        />
      </div>
    </div>
  )
}

/**
 * El carril, sin principio ni fin: se pintan tres copias de las familias y el
 * carril se mantiene en la del medio.
 *
 * Tres decisiones son las que hacen que fluya y no dé tumbos:
 *
 * 1. **Manda el scroll, no el índice.** Al arrastrar no se cambia de familia a
 *    trompicones: el carril se mueve libre y, cuando se para, la familia abierta
 *    pasa a ser la que ha quedado centrada. El movimiento es continuo porque es
 *    el del propio dedo.
 * 2. **La copia más cercana.** Al cambiar de familia se centra la copia de esa
 *    familia que ya esté más cerca, no la de la copia central. Si siempre se
 *    fuera a la central, cerrar el bucle —de la última a la primera— obligaba a
 *    recorrer el mazo entero de vuelta: eso era el salto raro.
 * 3. **La recolocación, en reposo y medida.** El salto de un bloque entero que
 *    devuelve el carril al centro se hace cuando ya no se mueve nada —a media
 *    animación la cortaba, y ése era el otro tirón— o en el borde de verdad, y
 *    entonces el punto de partida del arrastre se mueve con él. Y el bloque se
 *    mide de las miniaturas: ver `bloqueDelCarril`.
 */
function Carril({ familias, index, onSelect, arrastre }: Omit<Props, 'navLabel'>) {
  const rail = useRef<HTMLDivElement>(null)
  const montado = useRef(false)
  const reposo = useRef<number | undefined>(undefined)
  const marco = useRef(0)
  const count = familias.length
  const copias = Array.from({ length: COPIAS }, () => familias).flat()

  /** El índice de ahora mismo, para las devoluciones de llamada que viven fuera
   *  del ciclo de render —el arrastre del mazo—. Se pone al día en un efecto y no
   *  al pintar: escribir en una `ref` durante el render es de las cosas que React
   *  no garantiza. */
  const indice = useRef(index)
  useEffect(() => {
    indice.current = index
  }, [index])

  /**
   * Lleva al centro la copia más cercana de una familia.
   *
   * El desplazamiento se anima aquí, fotograma a fotograma, en vez de dejárselo
   * a `behavior: 'smooth'`. Dos razones. La curva: el scroll suave del navegador
   * usa la suya, y aquí nada se mueve con una curva que no sea la del sistema
   * —`--ease-out-soft`, desaceleración larga—. Y el mando único: el asentado al
   * levantar el dedo sale de esta misma función, así que arrastrar y elegir en la
   * lista se sienten igual en vez de ser dos movimientos distintos.
   *
   * Por lo mismo el carril no lleva `scroll-snap`: con `mandatory`, el navegador
   * reengancha cada escritura de `scrollLeft` al punto de anclaje anterior y le
   * pelea el fotograma a esta animación. El anclaje lo hace `asentar`.
   */
  const centrar = useCallback((familia: number, suave: boolean, desdeElMedio = false) => {
    const node = rail.current
    if (!node) return

    // Al colocar la barra por primera vez se va a la copia del bloque del medio y
    // no a la más cercana: la más cercana es la del primer bloque, que no tiene
    // nada a su izquierda, y la barra aparecía con un hueco a un lado en vez de
    // con las familias anteriores asomando. Después ya manda la cercanía, que es
    // lo que hace que cerrar el bucle no dé la vuelta al mazo entero.
    const objetivo = desdeElMedio ? copiaDelMedio(node, familia) : copiaCercana(node, familia)
    if (!objetivo) return

    const caja = objetivo.getBoundingClientRect()
    const medio = node.getBoundingClientRect().left + node.clientWidth / 2
    const destino = Math.max(
      0,
      Math.min(
        node.scrollLeft + (caja.left + caja.width / 2 - medio),
        node.scrollWidth - node.clientWidth,
      ),
    )

    cancelAnimationFrame(marco.current)

    // Sin animación en tres casos: la primera colocación, quien ha pedido no ver
    // movimiento, y la pestaña que no se está pintando —ahí el navegador no da
    // fotogramas, así que una animación se quedaría a medias—.
    const quieto =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.visibilityState !== 'visible'
    if (!suave || quieto) {
      node.scrollLeft = destino
      return
    }

    const desde = node.scrollLeft
    const tramo = destino - desde
    // Menos de un píxel no se anima: si no, el propio asentado se llamaría a sí
    // mismo indefinidamente, porque escribir en `scrollLeft` levanta más eventos.
    if (Math.abs(tramo) < 1) return
    const arranque = performance.now()

    const paso = (ahora: number) => {
      const avance = Math.min(1, (ahora - arranque) / DESLIZAR_MS)
      node.scrollLeft = desde + tramo * (1 - (1 - avance) ** 3)
      if (avance < 1) marco.current = requestAnimationFrame(paso)
    }

    marco.current = requestAnimationFrame(paso)
  }, [])

  useEffect(() => {
    const suave = montado.current
    montado.current = true
    centrar(index, suave, !suave)

    // Al montar, las fotos todavía no tienen su tamaño y el centro cae donde no
    // es, así que la primera vez se repite en el fotograma siguiente.
    if (suave) return
    const primero = requestAnimationFrame(() => centrar(index, false, true))
    return () => cancelAnimationFrame(primero)
  }, [index, centrar])

  useEffect(
    () => () => {
      window.clearTimeout(reposo.current)
      cancelAnimationFrame(marco.current)
    },
    [],
  )

  /**
   * El carril, atado al arrastre del mazo de productos.
   *
   * Mientras el dedo mueve las piezas, las miniaturas recorren la parte de paso
   * que corresponda: las dos cosas se mueven juntas, que es lo que hace que la
   * barra parezca el mando del catálogo y no un indicador que se actualiza
   * después. Al soltar llega `null` y el carril se asienta solo —si el mazo se
   * queda en la misma familia, volviendo a centrarla; si cambia, el efecto de
   * arriba lo lleva a la nueva—.
   */
  const suelo = useRef<number | null>(null)
  const salto = useRef(0)

  useEffect(() => {
    if (!arrastre) return

    return arrastre((fraccion) => {
      const node = rail.current
      if (!node) return

      if (fraccion === null) {
        suelo.current = null
        centrar(indice.current, true)
        return
      }

      if (suelo.current === null) {
        suelo.current = node.scrollLeft
        salto.current = pasoDelCarril(node)
      }

      cancelAnimationFrame(marco.current)
      node.scrollLeft = suelo.current - fraccion * salto.current
    })
  }, [arrastre, centrar])

  /**
   * Devuelve el carril al bloque del medio, y dice cuánto lo ha movido.
   *
   * Se mira qué miniatura ha quedado centrada y en qué bloque vive, en vez de
   * comparar el desplazamiento con fracciones del ancho total. Un bloque se salta
   * entero, así que la miniatura que queda centrada después es la copia de la
   * misma familia: no hay nada que ver, y no hay forma de que la recolocación
   * cambie de familia por su cuenta.
   */
  const recolocar = (node: HTMLDivElement) => {
    const bloque = bloqueDelCarril(node)
    const centrada = itemCentrado(node)
    if (!bloque || !centrada) return 0

    const movido =
      centrada.orden < count ? bloque : centrada.orden >= count * COPIAS - count ? -bloque : 0

    if (movido) node.scrollLeft += movido
    return movido
  }

  /**
   * Al levantar el dedo: la familia que ha quedado en el centro pasa a ser la
   * abierta, y el carril acaba de colocarla en el centro exacto. Si es la que ya
   * estaba, el asentado lo hace este mismo componente; si es otra, lo hace el
   * efecto al llegar el índice nuevo. En los dos casos con la misma animación,
   * que es lo que hace que arrastrar y pulsar se sientan igual.
   */
  const asentar = (node: HTMLDivElement) => {
    recolocar(node)
    const centrada = itemCentrado(node)
    if (!centrada) return
    if (centrada.familia === index) centrar(index, true)
    else onSelect(centrada.familia)
  }

  return (
    <div
      ref={rail}
      className="thumb-flow"
      onScroll={() => {
        const node = rail.current
        if (!node) return

        // En el borde de verdad no se espera a que pare: ahí el arrastre se
        // quedaría sin carril, y un tope sí se nota.
        const margen = 24
        if (
          node.scrollLeft < margen ||
          node.scrollLeft > node.scrollWidth - node.clientWidth - margen
        ) {
          const movido = recolocar(node)
          // Y si el dedo está en el mazo, su punto de partida se mueve con el
          // carril: sin esto, el fotograma siguiente lo escribe desde el sitio de
          // antes y deshace la recolocación.
          if (movido && suelo.current !== null) suelo.current += movido
        }

        // Mientras el dedo lleva el mazo el carril es suyo, así que aquí no se
        // asienta nada: bastaba con detener el gesto un momento para que este
        // temporizador saltara a media pasada y le peleara el sitio al dedo.
        if (suelo.current !== null) return

        window.clearTimeout(reposo.current)
        reposo.current = window.setTimeout(() => asentar(node), REPOSO_MS)
      }}
    >
      {copias.map((f, i) => {
        const real = i % count

        return (
          <button
            key={`${f.key}-${i}`}
            type="button"
            data-familia={real}
            aria-label={f.label}
            aria-current={real === index ? 'true' : undefined}
            onClick={() => onSelect(real)}
            className={cn('thumb-flow-item', real === index && 'thumb-flow-open')}
          >
            <span className="thumb-flow-stage">
              <span className="thumb-flow-card">
                <Media image={f.thumb} ratio="4 / 3" sizes="72px" />
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** Las veces que se repiten las familias para que el carril no tenga principio ni
 *  fin. Impar, porque el carril vive en el bloque del medio y necesita otro
 *  entero a cada lado; tres es lo justo. */
const COPIAS = 3

/** Lo que tarda el carril en llevar una familia al centro. */
const DESLIZAR_MS = 520

/** Lo que se espera sin un solo evento de scroll para dar el carril por parado. */
const REPOSO_MS = 140

/** Lo que hay de un centro de miniatura al siguiente. Se mide en vez de leerse de
 *  `--flow-step` para no tener el número en dos sitios. */
function pasoDelCarril(node: HTMLElement): number {
  const [uno, dos] = node.querySelectorAll<HTMLElement>('[data-familia]')
  if (!uno || !dos) return 50
  return dos.getBoundingClientRect().left - uno.getBoundingClientRect().left
}

/** La copia de esa familia que vive en el bloque del medio: la que deja un bloque
 *  entero de familias a cada lado. */
function copiaDelMedio(node: HTMLElement, index: number): HTMLElement | undefined {
  const copias = node.querySelectorAll<HTMLElement>(`[data-familia="${index}"]`)
  return copias[Math.floor(copias.length / 2)]
}

/** La copia de esa familia que ya esté más cerca del centro del carril. */
function copiaCercana(node: HTMLElement, index: number): HTMLElement | undefined {
  const medio = node.getBoundingClientRect().left + node.clientWidth / 2

  return [...node.querySelectorAll<HTMLElement>(`[data-familia="${index}"]`)].reduce<{
    el: HTMLElement
    d: number
  } | null>((mejor, el) => {
    const caja = el.getBoundingClientRect()
    const d = Math.abs(caja.left + caja.width / 2 - medio)
    return !mejor || d < mejor.d ? { el, d } : mejor
  }, null)?.el
}

/**
 * Lo que mide un bloque de familias: de una miniatura a la de su misma familia en
 * el bloque siguiente.
 *
 * Se mide de las propias miniaturas, y no como un tercio del ancho desplazable,
 * que es lo que se hacía antes y era el fallo. El carril lleva a los lados un
 * relleno de media pantalla —el `padding-inline` de `thumb-flow`, que es lo que
 * permite centrar también la primera y la última—, y ese relleno cuenta en el
 * `scrollWidth`. Así que un tercio del total no es un bloque, sino un bloque más
 * un tercio del relleno: en un móvil de 294 px sobraban 74 px, o sea familia y
 * media. Con esa medida, recolocar el carril lo dejaba donde había centrada otra
 * familia, y el asentado la abría acto seguido; eso era el tirón con cambio de
 * familia por su cuenta al pasar por segunda vez.
 */
function bloqueDelCarril(node: HTMLElement): number {
  const items = node.querySelectorAll<HTMLElement>('[data-familia]')
  const uno = items[0]
  const dos = items[items.length / COPIAS]
  if (!uno || !dos) return 0
  // `offsetLeft` y no la caja en pantalla: es medida de maquetación, así que no
  // la mueven ni el desplazamiento del carril ni el giro de las tarjetas.
  return dos.offsetLeft - uno.offsetLeft
}

/** Qué miniatura ha quedado en el centro del carril: su sitio en la fila de
 *  copias —que es lo que dice en qué bloque está— y de qué familia es. */
function itemCentrado(node: HTMLElement): { orden: number; familia: number } | null {
  const medio = node.getBoundingClientRect().left + node.clientWidth / 2

  return [...node.querySelectorAll<HTMLElement>('[data-familia]')].reduce<{
    orden: number
    familia: number
    d: number
  } | null>((mejor, el, orden) => {
    const caja = el.getBoundingClientRect()
    const d = Math.abs(caja.left + caja.width / 2 - medio)
    if (mejor && d >= mejor.d) return mejor
    return { orden, familia: Number(el.dataset.familia), d }
  }, null)
}

function Chevron({ abierto }: { abierto: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn(
        'h-3 w-3 text-bark-faint transition-transform duration-500 ease-(--ease-out-soft)',
        abierto && 'rotate-180',
      )}
    >
      <path d="M5 9l7 7 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/**
 * La lista de familias. Flota sobre el catálogo —posición absoluta— para no
 * empujar las piezas al abrirse, y va translúcida y desenfocada como la
 * cabecera: al asomar las fotos por debajo se nota que es una capa y no que el
 * catálogo se ha partido.
 */
function Panel({
  familias,
  index,
  abierto,
  onSelect,
}: {
  familias: FlowFamily[]
  index: number
  abierto: boolean
  onSelect: (index: number) => void
}) {
  return (
    <div
      className={cn(
        'absolute inset-x-0 top-full z-40 origin-top transition-[opacity,transform,visibility] duration-500 ease-(--ease-out-soft)',
        abierto
          ? 'visible translate-y-1 scale-100 opacity-100'
          : 'invisible translate-y-0 scale-[0.98] opacity-0',
      )}
    >
      <ul className="grid grid-cols-2 gap-x-2 rounded-[1.1rem] border border-line bg-[color-mix(in_srgb,var(--color-linen)_78%,transparent)] p-2 shadow-[0_1px_0_color-mix(in_srgb,var(--color-bark)_8%,transparent),0_18px_36px_-18px_color-mix(in_srgb,var(--color-bark)_40%,transparent)] backdrop-blur-lg">
        {familias.map((f, i) => (
          <li key={f.key}>
            <Fila
              familia={f}
              activa={i === index}
              alcanzable={abierto}
              onSelect={() => onSelect(i)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Una familia de la lista. En la tienda es un enlace de verdad —cada familia
 *  tiene su página— y el clic normal lo atiende el mazo sin recargar; en la
 *  portada no hay a dónde ir, así que es un botón. */
function Fila({
  familia,
  activa,
  alcanzable,
  onSelect,
}: {
  familia: FlowFamily
  activa: boolean
  alcanzable: boolean
  onSelect: () => void
}) {
  const clase = cn(
    'flex w-full items-center gap-2 rounded-[0.7rem] px-1.5 py-1.5 text-left transition-colors duration-300 ease-(--ease-out-soft)',
    activa
      ? 'bg-[color-mix(in_srgb,var(--color-sage-deep)_12%,transparent)] text-sage-deep'
      : 'text-bark-soft',
  )

  const dentro = (
    <>
      <span className="w-7 shrink-0 overflow-hidden rounded-[0.3rem] shadow-[0_0_0_1px_var(--color-line)]">
        <Media image={familia.thumb} ratio="4 / 3" sizes="28px" />
      </span>
      <span className="truncate font-serif text-base leading-none">{familia.label}</span>
    </>
  )

  if (!familia.href) {
    return (
      <button
        type="button"
        tabIndex={alcanzable ? undefined : -1}
        onClick={onSelect}
        className={clase}
      >
        {dentro}
      </button>
    )
  }

  return (
    <Link
      href={familia.href}
      tabIndex={alcanzable ? undefined : -1}
      aria-current={activa ? 'page' : undefined}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        onSelect()
      }}
      className={clase}
    >
      {dentro}
    </Link>
  )
}
