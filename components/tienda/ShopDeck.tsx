'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import {
  MAZO,
  bucle,
  crearMotorDelMazo,
  type AjustesMazo,
  type MotorDelMazo,
} from '@/components/tienda/motorDelMazo'
import { FlowerLoader } from '@/components/ui/FlowerLoader'
import { cn } from '@/lib/cn'
import { useTranslator } from '@/lib/i18n/useLocale'

export { bucle, vuelta } from '@/components/tienda/motorDelMazo'

type Vista = {
  irA: (index: number) => void
  colocar: (index: number) => void
}

type Deck = {
  index: number
  count: number
  go: (index: number) => void
  settle: (index: number) => void
  attach: (vista: Vista | null) => void
  /** Se apunta a lo que se mueve con el arrastre del mazo. Ver `Seguir`. */
  seguir: Seguir
  avisar: (fraccion: number | null) => void
}

/**
 * Suscripción al arrastre del mazo: la barra de familias se apunta aquí para
 * moverse **a la vez** que los productos y no después. Lo que llega es la parte
 * de familia recorrida —negativa hacia la siguiente— y `null` al levantar el
 * dedo, que es la señal de asentarse por su cuenta.
 */
export type Seguir = (cb: (fraccion: number | null) => void) => () => void

const DeckContext = createContext<Deck | null>(null)

function useDeck(): Deck {
  const deck = useContext(DeckContext)
  if (!deck) throw new Error('ShopDeck fuera de ShopDeckProvider')
  return deck
}

export function useShopDeck(): {
  index: number
  go: (index: number) => void
  seguir: Seguir
} {
  return useDeck()
}

export function ShopDeckProvider({
  count,
  initial,
  onChange,
  children,
}: {
  count: number
  initial: number
  onChange?: (index: number) => void
  children: ReactNode
}) {
  const [index, setIndex] = useState(initial)
  const vista = useRef<Vista | null>(null)

  const aviso = useRef(onChange)
  useEffect(() => {
    aviso.current = onChange
  })

  const settle = useCallback((next: number) => {
    setIndex(next)
    aviso.current?.(next)
  }, [])

  const attach = useCallback((next: Vista | null) => {
    vista.current = next
  }, [])

  const go = useCallback(
    (next: number) => {
      if (next === index || next < 0 || next >= count) return
      // Ya no hay «vecina» y «lejana»: el motor va a cualquier familia por el
      // camino corto del anillo con el mismo movimiento.
      if (vista.current) vista.current.irA(next)
      else settle(next)
    },
    [index, count, settle],
  )

  const apuntados = useRef(new Set<(fraccion: number | null) => void>())

  const seguir = useCallback<Seguir>((cb) => {
    apuntados.current.add(cb)
    return () => apuntados.current.delete(cb)
  }, [])

  const avisar = useCallback((fraccion: number | null) => {
    apuntados.current.forEach((cb) => cb(fraccion))
  }, [])

  const deck = useMemo(
    () => ({ index, count, go, settle, attach, seguir, avisar }),
    [index, count, go, settle, attach, seguir, avisar],
  )

  return <DeckContext.Provider value={deck}>{children}</DeckContext.Provider>
}

const sinCambios = () => () => {}
const enElNavegador = () => true
const enElServidor = () => false

/** La flor de espera, en el hueco del mazo. */
function Espera() {
  const t = useTranslator()

  return <FlowerLoader label={t({ es: 'Abriendo la familia', gl: 'Abrindo a familia' })} />
}

/**
 * EL MAZO DE FAMILIAS. Un anillo de paneles que se arrastra con el dedo.
 *
 * Todo el movimiento lo lleva `motorDelMazo`, que es donde está el porqué: aquí
 * sólo se le dan los nodos, se le pasan los toques y se acompaña el alto del
 * bloque cuando la familia que queda abierta trae más o menos piezas que la
 * anterior. El panel abierto es el único que va en el flujo del documento —por
 * eso el bloque mide lo que mide la familia que se está viendo— y los vecinos van
 * encima, colocados a un ancho de pantalla a cada lado.
 */
export function ShopDeck({
  panels,
  className,
  ajustes = MAZO,
}: {
  panels: ReactNode[]
  className?: string
  /** Sólo la vista previa los cambia; la tienda usa los de la casa. */
  ajustes?: AjustesMazo
}) {
  const deck = useDeck()
  const vista = useRef<HTMLDivElement>(null)
  const capa = useRef<HTMLDivElement>(null)
  const motor = useRef<MotorDelMazo | null>(null)

  const montado = useSyncExternalStore(sinCambios, enElNavegador, enElServidor)

  const { count, attach, settle, avisar, index } = deck

  /** La familia de partida. Se lee una vez: después manda el motor. */
  const arranque = useRef(index)

  /**
   * El alto del bloque, en píxeles, medido de la familia abierta.
   *
   * Antes el alto lo daba el propio panel abierto, que era el único en el flujo
   * del documento; los demás iban absolutos. Eso obligaba a meter uno en el flujo
   * y sacar otro cada vez que se cambiaba de familia, y con una familia de
   * veintidós piezas —5.652 px— ese reflow costaba fotogramas: medidos tres
   * saltos de 33 ms al volver a Anillos desde Colgantes. Ahora todos los paneles
   * van absolutos y lo único que cambia es este número.
   */
  const [alto, setAlto] = useState<number | null>(null)

  /**
   * El alto natural de una familia, medido de su propio panel.
   *
   * Se mide **en el momento**, y no una vez al montar guardando los siete: al
   * montar, o justo después de un pliegue, los paneles están recortados a una
   * pantalla, así que lo que se medía eran 716 px para todas y el catálogo se
   * quedaba en su primera pantalla. Aquí se limpia el recorte del panel que toca
   * antes de leerlo, que es lo único que hace falta.
   */
  const medirFamilia = useCallback((familia: number) => {
    const nodoCapa = capa.current
    if (!nodoCapa) return null
    const panel = nodoCapa.querySelectorAll<HTMLElement>(':scope > div')[familia]
    if (!panel) return null
    panel.style.removeProperty('height')
    panel.style.removeProperty('overflow')
    return panel.scrollHeight || null
  }, [])

  /**
   * Prepara el viaje: el bloque se queda del alto de una carta —`--carta`, lo que
   * queda de pantalla bajo la cabecera y la barra— y la página se pone en su
   * sitio de una vez y sin que se vea.
   *
   * Devuelve lo que se había bajado dentro de la familia abierta. El motor dibuja
   * **esa** familia desplazada ese mismo tanto, así que se queda quieta en
   * pantalla mientras la nueva entra desde su primera fila. Eso es lo que arregla
   * dos cosas a la vez: que el scroll no dé un brinco al empezar el gesto, y que
   * al pasar de una familia de veintidós piezas a una de dos no se acabe mirando
   * el hueco de debajo del catálogo. Ver `compensa` en `motorDelMazo`.
   *
   * Y antes de encoger nada, al cuerpo se le fija el alto que tenía: si no, la
   * página pierde cinco mil píxeles de golpe, el navegador recorta el scroll para
   * que quepa y eso son más de doscientos píxeles de salto, medidos. En el
   * `body` y no en el `html` porque es el cuerpo quien lleva el contenido.
   */
  const plegar = useCallback(() => {
    const nodo = vista.current
    const nodoCapa = capa.current
    if (!nodo || !nodoCapa) return 0

    document.body.style.minHeight = `${document.body.scrollHeight}px`

    const tope = parseFloat(getComputedStyle(nodo).scrollMarginTop) || 0
    const recorrido = Math.max(0, Math.round(tope - nodo.getBoundingClientRect().top))

    const carta = getComputedStyle(nodo).getPropertyValue('--carta') || ''
    nodo.style.height = carta
    nodo.style.overflow = 'hidden'

    // Cada familia, también a una pantalla: es lo que quita los tirones de
    // verdad. Sin recortarlas, el navegador tiene que pintar y componer paneles
    // de cinco mil píxeles con veintidós fotos para mostrar una pantalla, y eso
    // se midió en 350 ms de fotograma en la familia más larga.
    nodoCapa.querySelectorAll<HTMLElement>(':scope > div').forEach((panel) => {
      panel.style.height = carta
      panel.style.overflow = 'hidden'
      // Y aislado: con `contain` el navegador sabe que dentro de cada familia no
      // hay nada que pueda afectar al resto de la página, así que ni recalcula
      // maquetación fuera ni repinta más allá del recorte. Es gratis aquí, porque
      // recortadas ya no influyen en nada.
      panel.style.contain = 'layout paint'
    })

    if (recorrido > 0) window.scrollBy({ top: -recorrido, behavior: 'instant' })

    return recorrido
  }, [])

  /** Suelta el bloque: la familia vuelve a ser contenido normal. */
  const asentado = useCallback(
    (familia: number) => {
      const nodo = vista.current
      if (!nodo) return
      nodo.style.height = ''
      nodo.style.overflow = ''
      document.body.style.minHeight = ''

      const nodoCapa = capa.current
      if (nodoCapa) {
        nodoCapa.style.transform = ''
        nodoCapa.querySelectorAll<HTMLElement>(':scope > div').forEach((panel) => {
          panel.style.removeProperty('height')
          panel.style.removeProperty('overflow')
          panel.style.removeProperty('will-change')
        })
      }
      // Y ahora, no antes, el bloque toma el alto de la familia que ha quedado.
      setAlto(medirFamilia(familia))
    },
    [medirFamilia],
  )

  useEffect(() => {
    const nodoCapa = capa.current
    const nodoVista = vista.current
    if (!nodoCapa || !nodoVista) return

    const m = crearMotorDelMazo(nodoCapa, nodoVista, count, {
      familia: settle,
      arrastre: avisar,
      plegar,
      asentado,
    })

    motor.current = m
    setAlto(medirFamilia(arranque.current))
    m.colocar(arranque.current)
    attach({ irA: (i) => m.irA(i), colocar: (i) => m.colocar(i) })

    return () => {
      attach(null)
      m.destruir()
      motor.current = null
    }
  }, [count, attach, settle, avisar, plegar, asentado, medirFamilia])

  // El alto sólo depende del ancho, así que se vuelve a medir cuando cambia.
  useEffect(() => {
    const alRedimensionar = () => setAlto(medirFamilia(index))
    window.addEventListener('resize', alRedimensionar)
    return () => window.removeEventListener('resize', alRedimensionar)
  }, [medirFamilia, index])

  useEffect(() => {
    motor.current?.ajustar(ajustes)
  }, [ajustes])

  return (
    <div
      ref={vista}
      className={cn('relative overflow-clip', className)}
      style={{ touchAction: 'pan-y pinch-zoom', height: alto ?? undefined }}
      onTouchStart={(event) => {
        if (event.touches.length !== 1) return
        const toque = event.touches[0]
        if (toque) motor.current?.empezar(toque.clientX, toque.clientY)
      }}
      onTouchMove={(event) => {
        const toque = event.touches[0]
        if (toque) motor.current?.seguirGesto(toque.clientX, toque.clientY)
      }}
      onTouchEnd={() => motor.current?.terminar()}
      onTouchCancel={() => motor.current?.terminar()}
    >
      {/* La perspectiva va aquí, en la capa: es la que hace que el giro de las
          familias vecinas se vea como una carta que se aparta y no como un
          aplastado. Se mide en anchos de pantalla para que el efecto sea el mismo
          en un móvil estrecho y en uno ancho. */}
      <div
        ref={capa}
        className="relative [transform-style:preserve-3d]"
        style={{ perspective: `${ajustes.perspectiva * 100}vw` }}
      >
        {panels.map((panel, i) => {
          const abierta = i === index

          return (
            <div
              key={i}
              aria-hidden={!abierta}
              className="absolute inset-x-0 top-0"
              /* `will-change` no va aquí: puesto en las siete familias a la vez,
                 el navegador reserva siete capas enormes y se atraganta. Lo pone
                 y lo quita el motor, y sólo en las dos que se están viendo. */
              style={{ visibility: abierta ? undefined : 'hidden' }}
            >
              {/* La vecina se pinta en cuanto se puede: antes de hidratar no hay
                  nada que poner, y si el mazo se mueve en ese momento el hueco lo
                  ocupa la flor de espera en vez de un blanco. */}
              {abierta || montado ? panel : <Espera />}
              {/* El velo de lino que apaga la familia que se está apartando. Va
                  aquí y no como opacidad del panel entero para que las fotos no
                  se transparenten entre ellas al solaparse. */}
              <span
                data-velo
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-linen opacity-0"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
