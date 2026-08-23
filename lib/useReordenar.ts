'use client'

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type DragEvent,
  type PointerEvent,
} from 'react'

import { usePunteroGrueso } from '@/lib/usePunteroGrueso'

/**
 * REORDENAR ARRASTRANDO
 *
 * La máquina que hay detrás de las dos listas que se ordenan a mano: las familias
 * del catálogo y las piezas de una familia. Vive aquí y no en cada una porque no
 * es «un `onDragStart` y ya»: son cuatro decisiones con su porqué, y tenerlas dos
 * veces es tenerlas distintas dentro de un mes.
 *
 * Quien la usa pone la lista y recibe, para cada elemento, los manejadores que hay
 * que repartir: `fila` en lo que se arrastra y `asa` en las tres rayas.
 *
 * ## Lo que se lleva es sólido; lo que se deja es un hueco
 *
 * Mientras se arrastra hay dos cosas a la vez. La que va pegada al cursor es la
 * tarjeta entera y opaca: es la que tienes en la mano, y **la pintamos nosotros**.
 * No es un capricho: la foto del arrastre la hace el navegador, y Chrome le pasa
 * un alfa a cualquier foto sacada de un nodo del DOM —por opaco que sea lo que le
 * des, y se ha comprobado que lo es—, sin forma de pedirle que no lo haga. Así que
 * se le da un píxel transparente por foto y la tarjeta va en el DOM, siguiendo al
 * cursor con los `dragover`.
 *
 * La que se queda en la lista es el hueco. Eso lo pinta quien use esto, que sabe
 * cómo es su tarjeta: aquí sólo se dice cuál es, en `moviendo`.
 *
 * ## Las demás se apartan
 *
 * Cuando otra tarjeta pasa a ocupar el sitio no aparece de golpe en su nueva fila:
 * se desliza hasta ella. La lista la reordena el estado, así que la animación es
 * la vuelta de siempre —mides dónde estaba cada una, la devuelves ahí con un
 * `translate` y la sueltas—. Sin eso el reordenado es un parpadeo y hay que
 * reconstruir de memoria qué se ha movido.
 *
 * Se mide en las dos direcciones porque una de las dos listas es una rejilla: allí
 * apartarse es también moverse de lado.
 *
 * La que va en la mano no se desliza: salta a su sitio. Está debajo del cursor, y
 * una que se deslizara sola por debajo del puntero volvería a entrar en él y
 * pediría otro cambio de orden. Por lo mismo, `mover` no atiende dos veces seguidas
 * antes de que el deslizamiento acabe.
 *
 * ## Con el dedo, sólo por las rayas
 *
 * En el móvil no hay arrastre nativo —el de HTML5 es cosa del ratón—, así que el
 * dedo tiene su propio camino, con eventos de puntero, y ahí el asa es una
 * cerradura: sólo se arrastra desde las tres rayas. Con el ratón no hace falta,
 * porque apretar y mover ya se distingue de apretar y soltar; con el dedo no, y lo
 * que se lleva por delante es el desplazamiento de la página.
 *
 * Las escuchas del arrastre van en la **ventana**, no en la tarjeta, y eso no es
 * pereza: al reordenar, React mueve tarjetas de sitio en el DOM, y un elemento que
 * se mueve pierde la captura del puntero. Colgadas del asa, el arrastre se daba por
 * terminado en mitad del gesto —y sólo al mover hacia adelante, que es cuando a
 * React le toca mover la tarjeta arrastrada y no la vecina—. La ventana no se mueve
 * nunca.
 *
 * Se cuelgan al empezar cada arrastre y se sueltan con un `AbortController`, no
 * pasando la función a `removeEventListener`. Es por una razón concreta: estas
 * funciones se rehacen en cada render, y entre el «empieza» y el «suelta» hay
 * varios —los del propio reordenado—, así que la que se pasaría a quitar ya no es
 * la que se colgó y las escuchas se irían amontonando. El mando no tiene ese
 * problema: cancela lo que se colgó con él, sea quien fuera.
 *
 * Y hay que **arrimar la lista** al acercarse al borde de la pantalla, con el dedo
 * y con el ratón. Sin eso, en una familia de cuarenta piezas no se puede llevar
 * nada más allá de lo que se ve, que es como no poder moverlo. El navegador hace
 * algo parecido él solo mientras arrastras con el ratón, pero sólo pegado al borde
 * y a un paso de tortuga; esto empieza mucho antes y acelera. Ver `arrimar`.
 *
 * Y donde hay dedos **el arrastre nativo no existe**: una tarjeta `draggable` que
 * se toca hace que el navegador empiece el suyo, y eso llega pisando lo nuestro
 * con un `pointercancel` en cuanto empieza —el dedo aprieta, se mueve, y no pasa
 * nada—. Vetar el `dragstart` no vale, porque el `pointercancel` es anterior.
 */

/**
 * Un píxel transparente, que es lo que se le da al navegador como foto del
 * arrastre para que no pinte la suya. Se carga aquí, una vez, porque en el
 * `dragstart` ya tiene que estar lista. En el servidor no hay `Image`, y los
 * componentes que usan esto también se pintan allí.
 */
const PIXEL = typeof Image === 'undefined' ? null : new Image()
if (PIXEL) {
  PIXEL.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
}

/** Lo que tarda una tarjeta en apartarse. También es lo que `mover` espera. */
const DESLIZAR = 180

/** La marca por la que se reconoce lo que se arrastra, y lo que hay debajo del dedo. */
const MARCA = 'data-reordenar'

/**
 * EL ARRIMADO: dónde empieza y a qué velocidad.
 *
 * `FRANJA` es la banda de pantalla, arriba y abajo, dentro de la cual la lista se
 * mueve sola. Es ancha a propósito: el sitio al que se lleva la tarjeta suele estar
 * justo en el borde, y una banda estrecha obliga a apuntar a un carril de veinte
 * píxeles con algo en la mano.
 *
 * `LENTO` y `RAPIDO` son píxeles **por segundo**. Que no sean por fotograma es
 * importante: un teléfono pintando cuarenta fotos no llega a sesenta por segundo, y
 * medido en fotogramas el arrimado se iría a la mitad justo en el aparato donde más
 * falta hace. Se multiplica por el tiempo que ha pasado de verdad entre uno y otro,
 * así que la velocidad es la misma vaya el aparato fino o ahogado.
 *
 * Entre uno y otro la velocidad sube con una curva, no en línea recta: asomarse a la banda ya mueve algo, y el último tramo, pegado al
 * canto, es donde de verdad vuela. La curva es lo que permite que la banda sea
 * ancha sin que la página se escape cada vez que se pasa cerca.
 *
 * Empieza en `LENTO` y no en cero porque una banda que arranca a velocidad cero se
 * siente rota: entras y no pasa nada.
 *
 * Es el mismo trato para el dedo y para el ratón. La medida se toma sobre la altura
 * **visible** —en un móvil eso no es `innerHeight`: la barra del navegador entra y
 * sale, y con ella se mueve el borde de abajo—, así que la banda ocupa lo mismo en
 * una pantalla que en otra.
 */
/**
 * TEMPORAL: lo que mira `MedidorArrimo` para saber, en un teléfono de verdad, si el
 * arrimado pide poca velocidad o si la pide y la pantalla no obedece. Se borra en
 * cuanto se sepa.
 */
export const arrimoDebug = { y: 0, alto: 0, pedido: 0, movido: 0, fps: 0 }

const FRANJA = 160
const LENTO = 900
const RAPIDO = 9000

type Opciones<T> = {
  /** La lista tal y como viene del servidor. */
  lista: T[]
  /** Cómo se llama cada uno. Tiene que ser estable: es lo que va en la marca. */
  claveDe: (elemento: T) => string
  /**
   * Se ha soltado y el orden ha cambiado. Llega el orden nuevo, en claves, y lo
   * que se hace con él —preguntar, guardar— es cosa de quien use esto. Si no ha
   * cambiado nada no se llama: soltar donde se cogió no es un cambio.
   */
  alSoltar: (claves: string[]) => void
}

export function useReordenar<T>({ lista, claveDe, alSoltar }: Opciones<T>) {
  const [orden, setOrden] = useState<T[]>(lista)
  /** La que va en la mano. Quien usa esto la pinta como hueco. */
  const [moviendo, setMoviendo] = useState<string | null>(null)
  const conElDedo = usePunteroGrueso()

  const arrastrada = useRef<string | null>(null)
  /** Las tarjetas vivas, para poder medirlas antes y después de reordenar. */
  const cajas = useRef(new Map<string, HTMLElement>())
  /** Dónde estaba cada una justo antes del último cambio de orden. */
  const sitios = useRef(new Map<string, { x: number; y: number }>())
  /** ¿Hay tarjetas apartándose ahora mismo? */
  const deslizando = useRef(false)
  /** La tarjeta que va en la mano, mientras dure el arrastre. */
  const enLaMano = useRef<HTMLElement | null>(null)
  /** Por qué punto se agarró, para que no dé un salto al empezar. */
  const agarre = useRef({ x: 0, y: 0 })
  /** El dedo que está arrastrando, o `null` si no hay ninguno. */
  const dedo = useRef<number | null>(null)
  /** Dónde está el dedo, para saber qué hay debajo mientras la lista se arrima. */
  const punto = useRef({ x: 0, y: 0 })
  /** A cuántos píxeles por segundo se arrima la lista, y el reloj que lo repite. */
  const paso = useRef(0)
  const arrimando = useRef<number | null>(null)
  /** Cuándo se movió por última vez, para mover lo que toque y no lo que salga. */
  const ultimoReloj = useRef(0)
  /** Lo que suelta las escuchas de este arrastre. Ver la nota de cabecera. */
  const mando = useRef<AbortController | null>(null)
  /**
   * El orden de ahora mismo, para quien no vive en el render.
   *
   * El arrastre con el dedo cuelga sus escuchas una vez, al apretar, y ésas se
   * quedan con el `orden` de ese momento: a partir del primer cambio estarían
   * moviendo una lista que ya no existe. Lo de aquí se pone al día sin esperar a
   * que React vuelva a pintar.
   */
  const ordenAhora = useRef(orden)
  useEffect(() => {
    ordenAhora.current = orden
  }, [orden])

  /**
   * La vuelta de siempre para animar una lista que reordena el estado: se apunta
   * dónde estaba cada tarjeta antes de tocar nada y, en cuanto el navegador ha
   * pintado el orden nuevo, se las devuelve a su sitio de antes y se las suelta.
   * Lo que se ve es el camino.
   */
  useLayoutEffect(() => {
    const antes = sitios.current
    if (antes.size === 0) return
    sitios.current = new Map()

    for (const [clave, nodo] of cajas.current) {
      const desde = antes.get(clave)
      if (!desde || clave === arrastrada.current) continue

      const caja = nodo.getBoundingClientRect()
      const saltoX = desde.x - caja.left
      const saltoY = desde.y - caja.top
      if (saltoX === 0 && saltoY === 0) continue

      nodo.style.transition = 'none'
      nodo.style.transform = `translate(${saltoX}px, ${saltoY}px)`

      requestAnimationFrame(() => {
        nodo.style.transition = `transform ${DESLIZAR}ms ease-out`
        nodo.style.transform = ''
        // Limpiar al acabar: si se queda la transición puesta, es ella la que manda
        // sobre las transiciones de las clases.
        nodo.addEventListener(
          'transitionend',
          () => {
            nodo.style.transition = ''
            nodo.style.transform = ''
          },
          { once: true },
        )
      })
    }

    // El candado lo abre quien lo cerró: hasta que las tarjetas no han llegado a su
    // sitio, `mover` no atiende otro cambio.
    const suelta = setTimeout(() => {
      deslizando.current = false
    }, DESLIZAR)

    return () => clearTimeout(suelta)
  }, [orden])

  /** Dónde está ahora cada tarjeta. Se llama antes de cambiar el orden, nunca después. */
  function anotarSitios() {
    sitios.current = new Map()
    for (const [clave, nodo] of cajas.current) {
      const caja = nodo.getBoundingClientRect()
      sitios.current.set(clave, { x: caja.left, y: caja.top })
    }
  }

  function mover(sobre: string) {
    const origen = arrastrada.current
    if (!origen || origen === sobre) return
    // Mientras las tarjetas se están apartando, una de ellas puede pasar por debajo
    // del cursor y pedir otro cambio que nadie ha hecho a mano. Se dejan llegar.
    if (deslizando.current) return

    // El orden nuevo se calcula aquí y no dentro de `setOrden` porque hay que saber
    // si de verdad cambia algo antes de medir y de echar el candado: un cambio que
    // se queda en nada dejaría las medidas viejas y el candado puesto.
    const actual = ordenAhora.current
    const desde = actual.findIndex((elemento) => claveDe(elemento) === origen)
    const hasta = actual.findIndex((elemento) => claveDe(elemento) === sobre)
    if (desde === -1 || hasta === -1 || desde === hasta) return

    const copia = [...actual]
    const [movida] = copia.splice(desde, 1)
    if (!movida) return
    copia.splice(hasta, 0, movida)

    deslizando.current = true
    anotarSitios()
    ordenAhora.current = copia
    setOrden(copia)
  }

  /**
   * La tarjeta que se ve en la mano.
   *
   * Un clon puesto encima de todo y llevado al cursor. Cuelga de la propia lista y
   * no del `body` porque una tarjeta lo es por sus clases, pero también por dónde
   * está: un `<li>` fuera de su `<ul>` pierde el `list-style` de la lista y saca su
   * viñeta. Se le añade el fondo —si no tiene, se vería atravesada— y se le quitan
   * los `hover`, porque la que agarras está debajo del cursor y en pantalla la
   * estás viendo señalada; lo que se lleva en la mano no señala nada.
   */
  function ponerEnLaMano(tarjeta: HTMLElement, x: number, y: number) {
    const caja = tarjeta.getBoundingClientRect()
    const copia = tarjeta.cloneNode(true) as HTMLElement

    // Sin marca: es un dibujo, no un elemento de la lista, y nadie debe encontrarla
    // buscando ni dejar caer nada encima de ella.
    copia.removeAttribute(MARCA)
    copia.classList.add('bg-linen')
    copia.classList.remove('hover:border-sage', 'hover:bg-sage-deep/6')
    copia.style.position = 'fixed'
    copia.style.left = '0'
    copia.style.top = '0'
    copia.style.width = `${caja.width}px`
    copia.style.transform = `translate(${caja.left}px, ${caja.top}px)`
    copia.style.pointerEvents = 'none'
    copia.style.zIndex = '45'
    copia.style.boxShadow = '0 18px 40px rgba(44, 40, 35, 0.18)'

    agarre.current = { x: x - caja.left, y: y - caja.top }
    ;(tarjeta.parentElement ?? document.body).append(copia)
    enLaMano.current = copia
  }

  function llevarLaMano(x: number, y: number) {
    const tarjeta = enLaMano.current
    if (!tarjeta) return
    tarjeta.style.transform = `translate(${x - agarre.current.x}px, ${y - agarre.current.y}px)`
  }

  /**
   * Lo que hay que escuchar mientras dure un arrastre, del ratón o del dedo.
   *
   * `dragover` y `pointermove` son los únicos que se repiten mientras la mano se
   * mueve, así que son los que llevan la tarjeta y miden la cercanía al borde. El
   * último `dragover` suele venir sin coordenadas, y ése se ignora: si no, la
   * tarjeta daría un salto a la esquina justo antes de soltarse.
   */
  function escuchar(deQuien: 'raton' | 'dedo') {
    mando.current?.abort()
    mando.current = new AbortController()
    const signal = mando.current.signal

    if (deQuien === 'raton') {
      window.addEventListener(
        'dragover',
        (evento) => {
          if (!enLaMano.current || (evento.clientX === 0 && evento.clientY === 0)) return
          punto.current = { x: evento.clientX, y: evento.clientY }
          llevarLaMano(evento.clientX, evento.clientY)
          calcularPaso(evento.clientY)
        },
        { signal },
      )
      return
    }

    window.addEventListener('pointermove', seguirTacto, { signal })
    window.addEventListener('pointerup', acabarTacto, { signal })
    window.addEventListener('pointercancel', acabarTacto, { signal })
  }

  /**
   * ARRIMAR LA LISTA
   *
   * Con el dedo pegado al borde de la pantalla, la página se desplaza sola y lo que
   * hay debajo se vuelve a mirar en cada fotograma: es la única forma de llevar una
   * pieza a un sitio que no se ve. Cuanto más cerca del borde, más deprisa, para que
   * un empujón corto sea un empujón corto.
   *
   * El dedo no se mueve mientras esto pasa, así que no llegan `pointermove` y hay
   * que releer quién está debajo desde aquí. La tarjeta de la mano no se toca: va
   * anclada a la ventana, así que se queda pegada al dedo ella sola.
   */
  function arrimar(reloj: number) {
    if (paso.current === 0) {
      arrimando.current = null
      ultimoReloj.current = 0
      return
    }

    // Lo que ha pasado de verdad desde el fotograma anterior, con tope: si el
    // aparato se ha quedado pensando medio segundo, la lista no puede dar un salto
    // de dos pantallas para ponerse al día.
    const pasado = ultimoReloj.current ? Math.min(50, reloj - ultimoReloj.current) : 16
    ultimoReloj.current = reloj

    const antes = window.scrollY
    // `behavior: 'instant'` no es adorno: el documento lleva `scroll-behavior: smooth`
    // puesto en el CSS, y con eso un `scrollBy` a secas no desplaza lo que se le pide,
    // sino que **arranca una animación** hacia ahí. Sesenta veces por segundo eso es
    // sesenta animaciones que se pisan unas a otras y ninguna llega a su destino: se
    // pedían cinco mil píxeles por segundo y la pantalla se movía a paso de tortuga.
    // Aquí el desplazamiento es nuestro y ya viene medido por el tiempo que ha pasado;
    // no queremos que nadie lo suavice.
    window.scrollBy({ top: (paso.current * pasado) / 1000, behavior: 'instant' })

    // TEMPORAL, ver `arrimoDebug`: lo pedido contra lo que la pantalla ha hecho.
    arrimoDebug.pedido = paso.current
    arrimoDebug.movido = ((window.scrollY - antes) * 1000) / Math.max(1, pasado)
    arrimoDebug.fps = Math.round(1000 / Math.max(1, pasado))

    // Con la mano quieta y la página moviéndose, nadie avisa de que ahora hay otra
    // tarjeta debajo: hay que mirarlo en cada fotograma. Vale para los dos
    // arrastres, porque `dragenter` tampoco llega si el ratón no se mueve.
    const debajo = document.elementFromPoint(punto.current.x, punto.current.y)
    const otra = debajo?.closest(`[${MARCA}]`)?.getAttribute(MARCA)
    if (otra) mover(otra)

    arrimando.current = requestAnimationFrame(arrimar)
  }

  /** A qué paso, según lo dentro de la franja que se esté. Cero es «no hace falta». */
  function calcularPaso(y: number) {
    const alto = window.visualViewport?.height ?? window.innerHeight
    arrimoDebug.y = y
    arrimoDebug.alto = alto
    const porArriba = FRANJA - y
    const porAbajo = y - (alto - FRANJA)
    const dentro = Math.max(porArriba, porAbajo)

    if (dentro <= 0) {
      paso.current = 0
      return
    }

    const parte = Math.min(1, dentro / FRANJA)
    const velocidad = LENTO + (RAPIDO - LENTO) * parte * parte
    paso.current = porArriba > 0 ? -velocidad : velocidad

    if (paso.current !== 0 && arrimando.current === null) {
      ultimoReloj.current = 0
      arrimando.current = requestAnimationFrame(arrimar)
    }
  }

  /** Se ha soltado, venga del ratón o del dedo: se limpia y se cuenta lo que cambió. */
  function soltar() {
    mando.current?.abort()
    mando.current = null

    arrastrada.current = null
    dedo.current = null
    paso.current = 0
    ultimoReloj.current = 0
    if (arrimando.current !== null) cancelAnimationFrame(arrimando.current)
    arrimando.current = null
    deslizando.current = false
    enLaMano.current?.remove()
    enLaMano.current = null
    setMoviendo(null)

    // Del ref y no del render: con el dedo, esto se colgó al apretar y el orden de
    // entonces es el de antes de mover nada.
    const claves = ordenAhora.current.map(claveDe)
    if (claves.join() === lista.map(claveDe).join()) return

    alSoltar(claves)
  }

  /** Volver a como estaba. Es lo que hay que hacer si se dice que no al guardar. */
  function restaurar() {
    anotarSitios()
    ordenAhora.current = lista
    setOrden(lista)
  }

  /**
   * Los manejadores de lo que se arrastra.
   *
   * `fijo` es «ésta ahora no se mueve»: en las familias, la que está abierta para
   * escribir dentro.
   */
  function fila(clave: string, fijo = false) {
    return {
      [MARCA]: clave,
      draggable: !fijo && !conElDedo,
      ref: (nodo: HTMLElement | null) => {
        if (nodo) cajas.current.set(clave, nodo)
        else cajas.current.delete(clave)
      },
      onDragStart: (evento: DragEvent<HTMLElement>) => {
        arrastrada.current = clave
        punto.current = { x: evento.clientX, y: evento.clientY }
        ponerEnLaMano(evento.currentTarget, evento.clientX, evento.clientY)
        escuchar('raton')
        if (PIXEL) evento.dataTransfer.setDragImage(PIXEL, 0, 0)
        setMoviendo(clave)
      },
      onDragEnter: () => mover(clave),
      onDragOver: (evento: DragEvent<HTMLElement>) => {
        // Sólo el arrastre de otra tarjeta. Las fotos que vienen del escritorio las
        // recoge la ventana entera, ver `useSoltarFotos`.
        if (!Array.from(evento.dataTransfer.types).includes('Files')) evento.preventDefault()
      },
      onDragEnd: soltar,
      onDrop: soltar,
    }
  }

  /**
   * Los manejadores de las tres rayas, que es por donde se coge con el dedo.
   *
   * El puntero se captura para que los movimientos sigan llegando al asa aunque el
   * dedo se salga de ella —que es lo que va a pasar en cuanto se mueva—, y quién
   * está debajo lo dice `elementFromPoint`: la tarjeta de la mano no estorba porque
   * no recibe el ratón.
   */
  function asa(clave: string, fijo = false) {
    return {
      onPointerDown: (evento: PointerEvent<HTMLElement>) => {
        if (evento.pointerType === 'mouse' || fijo) return

        const tarjeta = evento.currentTarget.closest(`[${MARCA}]`)
        if (!(tarjeta instanceof HTMLElement)) return

        evento.preventDefault()
        evento.stopPropagation()

        dedo.current = evento.pointerId
        arrastrada.current = clave
        punto.current = { x: evento.clientX, y: evento.clientY }
        setMoviendo(clave)
        ponerEnLaMano(tarjeta, evento.clientX, evento.clientY)

        escuchar('dedo')
      },
      // Que un toque en las rayas no abra ni cierre lo que haya debajo.
      onClick: (evento: { stopPropagation: () => void }) => evento.stopPropagation(),
    }
  }

  function seguirTacto(evento: globalThis.PointerEvent) {
    if (dedo.current !== evento.pointerId) return

    punto.current = { x: evento.clientX, y: evento.clientY }
    llevarLaMano(evento.clientX, evento.clientY)
    calcularPaso(evento.clientY)

    const debajo = document.elementFromPoint(evento.clientX, evento.clientY)
    const otra = debajo?.closest(`[${MARCA}]`)?.getAttribute(MARCA)
    if (otra) mover(otra)
  }

  /** Se levanta el dedo o se lo lleva el sistema: en los dos casos ha terminado. */
  function acabarTacto(evento: globalThis.PointerEvent) {
    if (dedo.current !== evento.pointerId) return
    soltar()
  }

  return { orden, moviendo, conElDedo, restaurar, fila, asa }
}
