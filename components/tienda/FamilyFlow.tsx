'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Media } from '@/components/ui/Media'
import { cn } from '@/lib/cn'
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
}

/** El índice siempre dentro del rango: de la última familia a la primera. */
export function bucle(index: number, count: number): number {
  return ((index % count) + count) % count
}

/**
 * LA BARRA DE FAMILIAS. La misma en la tienda y en el escaparate de la portada.
 *
 * Es un cover flow en miniatura: la familia abierta va de frente en el centro y
 * las vecinas giran sobre su eje y se van hacia atrás. El giro, el velo y la
 * profundidad los hace CSS con `animation-timeline: view()` —ver `thumb-flow` en
 * globals.css—, así que el movimiento va pegado al dedo: no hay un fotograma de
 * JavaScript por medio, lo que se mueve es el scroll del carril y el resto es
 * consecuencia. Donde no haya timelines de scroll el carril se queda plano, que
 * se lee igual de bien.
 *
 * Debajo, el nombre de la familia abierta con una flecha; al pulsarlo se
 * despliega la lista entera flotando sobre el catálogo, sin empujarlo.
 */
export function FamilyFlow({ familias, index, onSelect, navLabel }: Props) {
  const [desplegado, setDesplegado] = useState(false)
  const abierta = familias[index]

  return (
    <div className="relative">
      <nav aria-label={navLabel}>
        <Carril familias={familias} index={index} onSelect={onSelect} />
      </nav>

      <div className="relative">
        <button
          type="button"
          onClick={() => setDesplegado((v) => !v)}
          aria-expanded={desplegado}
          /* La flecha va debajo del rótulo y no a su derecha: centrada bajo el
             nombre, la columna entera —miniatura, nombre, flecha— queda en un
             solo eje y la barra se lee de arriba abajo sin nada que la desvíe. */
          className="mx-auto flex flex-col items-center gap-1 pb-1 text-sage-deep"
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
 * 2. **La copia más cercana.** Al pulsar una flecha se centra la copia de esa
 *    familia que ya esté más cerca, no la de la copia central. Si siempre se
 *    fuera a la central, cerrar el bucle —de la última a la primera— obligaba a
 *    recorrer el mazo entero de vuelta: eso era el salto raro.
 * 3. **La recolocación, en reposo.** El salto de un bloque entero que devuelve el
 *    carril al centro se hace sólo cuando ya no se mueve nada. Hacerlo a media
 *    animación la cortaba, y ése era el otro tirón.
 */
function Carril({ familias, index, onSelect }: Omit<Props, 'navLabel'>) {
  const rail = useRef<HTMLDivElement>(null)
  const montado = useRef(false)
  const reposo = useRef<number | undefined>(undefined)
  const marco = useRef(0)
  const count = familias.length
  const copias = [...familias, ...familias, ...familias]

  /**
   * Lleva al centro la copia más cercana de una familia.
   *
   * El desplazamiento se anima aquí, fotograma a fotograma, en vez de dejárselo
   * a `behavior: 'smooth'`. Dos razones. La curva: el scroll suave del navegador
   * usa la suya, y aquí nada se mueve con una curva que no sea la del sistema
   * —`--ease-out-soft`, desaceleración larga—. Y el mando único: el asentado al
   * levantar el dedo sale de esta misma función, así que arrastrar y pulsar una
   * flecha se sienten igual en vez de ser dos movimientos distintos.
   *
   * Por lo mismo el carril no lleva `scroll-snap`: con `mandatory`, el navegador
   * reengancha cada escritura de `scrollLeft` al punto de anclaje anterior y le
   * pelea el fotograma a esta animación. El anclaje lo hace `asentar`.
   */
  const centrar = useCallback((familia: number, suave: boolean) => {
    const node = rail.current
    if (!node) return

    const objetivo = copiaCercana(node, familia)
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
    centrar(index, suave)

    // Al montar, las fotos todavía no tienen su tamaño y el centro cae donde no
    // es, así que la primera vez se repite en el fotograma siguiente.
    if (suave) return
    const primero = requestAnimationFrame(() => centrar(index, false))
    return () => cancelAnimationFrame(primero)
  }, [index, centrar])

  useEffect(
    () => () => {
      window.clearTimeout(reposo.current)
      cancelAnimationFrame(marco.current)
    },
    [],
  )

  /** Devuelve el carril al bloque del medio. Instantáneo, y con el contenido
   *  repetido no hay nada que ver: la miniatura de destino es la misma. */
  const recolocar = (node: HTMLDivElement) => {
    const bloque = node.scrollWidth / 3
    if (node.scrollLeft < bloque * 0.5) node.scrollLeft += bloque
    else if (node.scrollLeft > bloque * 1.5) node.scrollLeft -= bloque
  }

  /**
   * Mientras la flecha se mantenga pulsada, el carril corre hacia ese lado y va
   * cogiendo velocidad. Devuelve la función que lo para.
   *
   * No cambia de familia en cada miniatura que pasa: eso sería una ráfaga de
   * cambios y, en la tienda, una ráfaga de mazos deslizándose. Lo que se mueve es
   * el carril, y la familia se decide al soltar, en `asentar` —igual que cuando se
   * arrastra con el dedo—.
   *
   * La velocidad no arranca de golpe ni crece sin fin: sube de `EMPUJE_LENTO` a
   * `EMPUJE_RAPIDO` en `EMPUJE_RAMPA` milisegundos, con la desaceleración larga
   * del sistema. Y se lee `scrollLeft` en cada fotograma en vez de acumular desde
   * un punto de partida, porque en medio puede haber una recolocación de bloque y
   * el carril estar ya en otro sitio.
   */
  const empujar = useCallback((sentido: 1 | -1) => {
    const node = rail.current
    if (!node) return () => {}

    cancelAnimationFrame(marco.current)
    const arranque = performance.now()
    let anterior = arranque

    const paso = (ahora: number) => {
      const dt = Math.min(32, ahora - anterior)
      anterior = ahora
      const rampa = Math.min(1, (ahora - arranque) / EMPUJE_RAMPA)
      const v = EMPUJE_LENTO + (EMPUJE_RAPIDO - EMPUJE_LENTO) * (1 - (1 - rampa) ** 3)
      node.scrollLeft += sentido * v * dt
      marco.current = requestAnimationFrame(paso)
    }

    marco.current = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(marco.current)
  }, [])

  /**
   * Al levantar el dedo: la familia que ha quedado en el centro pasa a ser la
   * abierta, y el carril acaba de colocarla en el centro exacto. Si es la que ya
   * estaba, el asentado lo hace este mismo componente; si es otra, lo hace el
   * efecto al llegar el índice nuevo. En los dos casos con la misma animación,
   * que es lo que hace que arrastrar y pulsar se sientan igual.
   */
  const asentar = (node: HTMLDivElement) => {
    recolocar(node)
    const centrada = familiaCentrada(node)
    if (centrada === null) return
    if (centrada === index) centrar(index, true)
    else onSelect(centrada)
  }

  return (
    <div className="flex items-center gap-1">
      <Flecha hacia="atras" onPaso={() => onSelect(index - 1)} onEmpuje={empujar} />

      <div
        ref={rail}
        className="thumb-flow min-w-0 flex-1"
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
            recolocar(node)
          }

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

      <Flecha hacia="adelante" onPaso={() => onSelect(index + 1)} onEmpuje={empujar} />
    </div>
  )
}

/** Lo que tarda el carril en llevar una familia al centro. */
const DESLIZAR_MS = 520

/** Velocidad del empuje de las flechas, en píxeles por milisegundo, y lo que
 *  tarda en pasar de la primera a la segunda. */
const EMPUJE_LENTO = 0.14
const EMPUJE_RAPIDO = 1.1
const EMPUJE_RAMPA = 900

/** Lo que hay que mantener pulsada una flecha para que empiece a correr. Por
 *  debajo de esto es un clic y avanza una familia. */
const MANTENER_MS = 240

/** Lo que se espera sin un solo evento de scroll para dar el carril por parado. */
const REPOSO_MS = 140

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

/** Qué familia ha quedado en el centro del carril. */
function familiaCentrada(node: HTMLElement): number | null {
  const medio = node.getBoundingClientRect().left + node.clientWidth / 2

  const cerca = [...node.querySelectorAll<HTMLElement>('[data-familia]')].reduce<{
    familia: number
    d: number
  } | null>((mejor, el) => {
    const caja = el.getBoundingClientRect()
    const d = Math.abs(caja.left + caja.width / 2 - medio)
    const familia = Number(el.dataset.familia)
    return !mejor || d < mejor.d ? { familia, d } : mejor
  }, null)

  return cerca ? cerca.familia : null
}

/**
 * La flecha redonda. Un toque avanza una familia; mantenida pulsada, el carril
 * corre y va acelerando hasta que se suelta —y entonces se queda la familia que
 * haya quedado en el centro—.
 */
function Flecha({
  hacia,
  onPaso,
  onEmpuje,
}: {
  hacia: 'atras' | 'adelante'
  onPaso: () => void
  onEmpuje: (sentido: 1 | -1) => () => void
}) {
  const espera = useRef<number | undefined>(undefined)
  const parar = useRef<(() => void) | null>(null)

  const soltar = () => {
    window.clearTimeout(espera.current)
    const corriendo = parar.current
    parar.current = null
    if (corriendo) {
      corriendo()
      return
    }
    // No llegó a correr: era un toque.
    onPaso()
  }

  useEffect(
    () => () => {
      window.clearTimeout(espera.current)
      parar.current?.()
    },
    [],
  )

  return (
    <button
      type="button"
      aria-label={hacia === 'atras' ? 'Familia anterior' : 'Familia siguiente'}
      onPointerDown={(event) => {
        // Sólo el botón principal, y sin arrastrar el foco por la página.
        if (event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        espera.current = window.setTimeout(() => {
          parar.current = onEmpuje(hacia === 'atras' ? -1 : 1)
        }, MANTENER_MS)
      }}
      onPointerUp={soltar}
      onPointerCancel={soltar}
      /* El teclado no mantiene: cada pulsación avanza una familia. */
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        onPaso()
      }}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-linen text-bark-soft shadow-[0_1px_0_color-mix(in_srgb,var(--color-bark)_8%,transparent),0_6px_14px_-10px_color-mix(in_srgb,var(--color-bark)_45%,transparent)] transition-[color,border-color,transform] duration-500 ease-(--ease-out-soft) hover:border-sage hover:text-sage-deep active:scale-95"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-3.5 w-3.5">
        <path
          d={hacia === 'atras' ? 'M15 5 8 12l7 7' : 'M9 5l7 7-7 7'}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
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
