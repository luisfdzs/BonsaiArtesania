/**
 * EL MOTOR DEL MAZO · un solo número mueve el catálogo.
 *
 * Antes, cambiar de familia era una transición de CSS de 420 ms sobre el
 * `transform` y, al acabar, un cambio de nodos y un reinicio del `transform`: dos
 * movimientos encadenados con una costura en medio. Y el carril de miniaturas se
 * movía por su cuenta con su propia animación, así que había dos relojes, que
 * nunca dan la misma hora. Se sentía a trompicones porque lo era.
 *
 * Aquí hay un único valor, `pos`, medido en familias y con decimales: 2,5 es
 * justo entre la tercera y la cuarta. De él sale, en el mismo fotograma, dónde
 * está cada familia y cómo está girada; y el carril de miniaturas se apunta al
 * mismo número (ver `Seguir` en `ShopDeck`). No hay nada que sincronizar porque
 * no hay dos cosas: hay una.
 *
 * Vive fuera de React a propósito: un `setState` por fotograma mete a React en
 * medio del gesto, y eso es exactamente lo que se nota como un tirón. React sólo
 * se entera de la familia que queda abierta, una vez por cambio.
 *
 * **La familia viaja como una carta de una pantalla.** Mientras se pliega, el
 * bloque se ancla arriba y se congela al alto de `--carta`: lo que gira es una
 * pantalla, no una página de cinco mil píxeles —una familia de veintidós piezas
 * mide eso, medido—. Al asentar se suelta y la familia vuelve a ser contenido
 * normal que se recorre hacia abajo.
 */

/**
 * Cómo se va la familia que deja el sitio.
 *
 * Todos cumplen la misma regla: **la que se va desaparece**. No se queda a medio
 * asomar por el borde haciendo bulto, que era lo que ensuciaba la pantalla; se
 * apaga del todo antes de que acabe el gesto, y a partir de ahí lo único que hay
 * delante es la familia nueva.
 *
 * - `relevo`: no viaja. Se apaga en su sitio mientras la nueva se enciende
 *   encima. Un relevo limpio, sin nada moviéndose de lado.
 * - `barrido`: la que se va sale de cuadro más rápido que el dedo y se apaga por
 *   el camino; la nueva entra a su ritmo. Cuando llega, la anterior ya no está.
 * - `cortina`: nada se mueve. La que se va se recorta desde el canto —como una
 *   cortina que se corre— y por debajo aparece la nueva, quieta y entera.
 * - `caida`: la que se va se desprende: cae, se encoge y se apaga. La nueva sube
 *   a ocupar su sitio.
 * - `contraccion`: la que se va se recoge hacia el centro hasta desaparecer y la
 *   nueva crece desde el centro. Se atraviesa el catálogo en vez de recorrerlo.
 * - `deslizar`: sin efecto, sólo desplazamiento. La referencia para comparar.
 */
export type Plegado = 'relevo' | 'barrido' | 'cortina' | 'caida' | 'contraccion' | 'deslizar'

export type AjustesMazo = {
  /** El modelo de plegado. */
  modelo: Plegado
  /** A cuánto se queda la vecina de su tamaño. 1 = no se encoge. */
  escalaMinima: number
  /** Velo de lino sobre la que se aparta: 0 nada, 1 se borra. */
  velo: number
  /** Esquina redonda de la carta mientras viaja, en píxeles. */
  radio: number
  /** Distancia del ojo a la escena, en anchos de pantalla. Menos, más fuga. */
  perspectiva: number
  /**
   * Lo que tarda el gesto en acabar de poner la familia, en milisegundos, una vez
   * levantado el dedo. Ver `aterrizar`.
   */
  aterrizaje: number
  /** Cuánto cuenta la velocidad al soltar para elegir familia. */
  proyeccion: number
  /** Parte de pantalla que hay que arrastrar para pasar de familia sin lanzar. */
  umbral: number
  /** Lo más que puede volar un manotazo, en familias. */
  vuelo: number
  /** Cuánto se desenfoca la que se va, en píxeles. */
  desenfoque: number
  /**
   * A qué parte de familia la que se va ya ha desaparecido del todo. 0,6 quiere
   * decir que a mitad y poco del gesto no queda nada de ella, y el resto del
   * recorrido la pantalla ya sólo tiene la familia nueva.
   */
  desvanecido: number
}

/**
 * El tacto del catálogo. Un sitio y sólo uno para tocarlo.
 *
 * Los números salen de medir, no de elegir a ojo: los modelos se prueban en una
 * página de pruebas con todos estos diales en vivo, midiendo en el navegador el
 * aterrizaje, el asentado y el salto por fotograma.
 */
export const MAZO: AjustesMazo = {
  modelo: 'barrido',
  escalaMinima: 0.82,
  velo: 0.5,
  radio: 22,
  perspectiva: 2.2,
  aterrizaje: 180,
  proyeccion: 100,
  umbral: 0.32,
  // De una en una: por muy fuerte que sea el manotazo, el catálogo avanza una
  // familia. Recorrer cuatro de un gesto dejaba al ojo sin saber por dónde va, y
  // en una tienda de siete familias no hace falta.
  vuelo: 1,
  desenfoque: 6,
  desvanecido: 0.25,
}

/** El índice dentro del rango: de la última familia a la primera. */
export function bucle(n: number, count: number): number {
  return ((n % count) + count) % count
}

/**
 * La distancia a una familia por el camino corto, contando que la última y la
 * primera son vecinas: de la séptima a la primera hay un paso, no seis. Es lo que
 * convierte el catálogo en un anillo sin extremos.
 */
export function vuelta(delta: number, count: number): number {
  if (count < 2) return 0
  const d = bucle(delta, count)
  return d > count / 2 ? d - count : d
}

type Aviso = {
  /** La familia que queda abierta. Se llama una vez por cambio. */
  familia: (index: number) => void
  /** Lo recorrido del gesto, en familias y en negativo hacia la siguiente. Es a
   *  lo que se apunta el carril de miniaturas para moverse con el mismo dedo. */
  arrastre: (fraccion: number | null) => void
  /**
   * Empieza el viaje: hay que congelar el bloque a una pantalla y poner la página
   * en su sitio. Devuelve cuántos píxeles se había recorrido de la familia
   * abierta, que es lo que hay que compensar en ella para que el cambio de scroll
   * no se vea. Ver `compensa`.
   */
  plegar: () => number
  /** Ya no se mueve nada: se suelta el bloque, con la familia en la que ha
   *  aterrizado. Se pasa por parámetro y no se lee de fuera porque quien la sabe
   *  con certeza en ese instante es el motor. */
  asentado: (familia: number) => void
  /**
   * Que se vayan bajando las fotos de estas familias, sin esperarlas. Se avisa en
   * cuanto el gesto se declara horizontal: a partir de ahí una de las dos vecinas
   * va a ser la que llegue, y quedan los cientos de milisegundos del arrastre para
   * tenerla lista. Es lo que hace que al levantar el dedo no haya nada que cargar.
   */
  acercar: (familias: number[]) => void
  /**
   * Deja lista la familia en la que va a aterrizar el gesto —sus fotos cargadas, y
   * la flor si tardan— y dice si sigue siendo la que toca: `false` cuando mientras
   * se cargaba se ha pedido otra, y entonces este aterrizaje se queda en el camino.
   *
   * Es el mismo trámite que al elegir una familia por su nombre, a propósito: las
   * dos formas de cambiar de familia enseñan la nueva hecha y no haciéndose.
   */
  preparar: (familia: number) => Promise<boolean>
}

export type MotorDelMazo = ReturnType<typeof crearMotorDelMazo>

export function crearMotorDelMazo(
  capa: HTMLElement,
  vista: HTMLElement,
  count: number,
  aviso: Aviso,
) {
  let a: AjustesMazo = MAZO
  let pos = 0
  let vel = 0
  let destino = 0
  let arrastrando = false
  let plegado = false
  let marco = 0
  let familiaVista = 0
  /**
   * La familia en la que el gesto va a aterrizar, mientras se están cargando sus
   * fotos. El dedo ya se ha levantado y el destino está elegido, así que en ese
   * rato no se empieza otro gesto: ver `empezar`.
   */
  let aterrizando: number | null = null
  /** Para que un aterrizaje que llegue tarde no se ponga por encima de otro. */
  let espera = 0
  /**
   * El viaje en curso: de dónde salió y a qué paso va.
   *
   * Sólo hay viaje cuando lo lleva el dedo: elegir una familia por su nombre la
   * pone sin recorrer nada —ver `irA`—. `base` es el punto desde el que se cuenta
   * lo recorrido, que es lo que se le cuenta a quien esté apuntado, o sea a la
   * barra de familias.
   *
   * Antes sólo se contaba mientras el dedo estaba encima: al soltar se mandaba
   * `null` y el carril remataba el último tramo con una animación propia. Eran dos
   * relojes para un solo movimiento, y se veía. Ahora se cuenta del primer
   * fotograma al último y el carril no hace más que seguir.
   */
  let viaje: { base: number } | null = null
  /**
   * La familia que estaba abierta al empezar el viaje y lo que había bajado el
   * ojo dentro de ella.
   *
   * Al empezar, la página sube a dejar la carta a pantalla completa. Para que eso
   * no se vea, esa familia se dibuja desplazada hacia abajo lo mismo que ha subido
   * la página: se queda donde estaba. Las demás no se compensan, y por eso la que
   * entra aparece desde su primera fila —que es lo que se espera al cambiar de
   * sección, y lo que evita que una familia de dos piezas quede descolgada
   * después de una de veintidós—.
   */
  let compensa: { familia: number; px: number } | null = null

  const gesto = { x: 0, y: 0, base: 0, eje: '' as '' | 'x' | 'y', t: 0, vivo: false }

  /** Deja la familia abierta como estaba escrita: sin capa 3D de por medio. */
  function planchar(nodo: HTMLElement) {
    nodo.style.willChange = ''
    nodo.style.transform = ''
    nodo.style.transformOrigin = ''
    nodo.style.filter = ''
    nodo.style.clipPath = ''
    nodo.style.borderRadius = ''
    nodo.style.overflow = ''
    const velo = nodo.querySelector<HTMLElement>('[data-velo]')
    if (velo) velo.style.opacity = '0'
  }

  function pintar() {
    // El alto de la carta, una vez por fotograma y no una vez por panel: leer
    // `clientHeight` después de haber escrito estilos obliga al navegador a
    // recalcular la maquetación, y hacerlo dos veces por fotograma es pagarlo dos
    // veces por nada.
    const mitad = Math.round(vista.clientHeight / 2)

    for (let i = 0; i < capa.children.length; i++) {
      const nodo = capa.children[i] as HTMLElement
      const d = vuelta(i - pos, count)
      const cerca = Math.abs(d) <= 1.05
      nodo.style.visibility = cerca ? 'visible' : 'hidden'
      if (!cerca) {
        nodo.style.willChange = ''
        continue
      }
      nodo.style.willChange = 'transform'

      // Quieta y centrada no lleva transformación ninguna: una capa 3D, aunque
      // esté a cero, difumina el texto y las fotos medio píxel, y la familia que
      // se está leyendo tiene que estar limpia.
      if (Math.abs(d) < 0.001 && !(compensa && compensa.familia === i)) {
        planchar(nodo)
        continue
      }

      const lejos = Math.min(1, Math.abs(d))
      const hacia = Math.sign(d)

      // El pivote, en el centro de la carta que se ve y no en el del panel. Los
      // paneles son tan altos como su familia —una de veintidós piezas mide más
      // de cinco mil píxeles—, así que escalar o girar desde su centro movía lo
      // que hay en pantalla cientos de píxeles hacia abajo: medido, 698. Con el
      // pivote en la mitad de la ventana, la carta se encoge y gira sobre sí
      // misma, que es lo que se espera de una carta.
      const mitad = Math.round(vista.clientHeight / 2)
      let transformar = ''
      let origen = ''
      let desenfoque = ''
      let recorte = ''

      // Lo apagada que va: llega a taparse del todo en `desvanecido` de familia,
      // no al final del recorrido. Eso es lo que hace que la que se va no ande
      // estorbando el resto del gesto.
      const ida = Math.min(1, lejos / Math.max(0.05, a.desvanecido))
      let velado = ida

      if (a.modelo === 'deslizar') {
        transformar = `translate3d(${d * 100}%, 0, 0)`
        velado = 0
      } else if (a.modelo === 'relevo') {
        // No viaja: se apaga en su sitio mientras la nueva se enciende encima.
        transformar = `scale(${1 - ida * (1 - a.escalaMinima) * 0.35})`
        desenfoque = a.desenfoque ? `blur(${(ida * a.desenfoque).toFixed(2)}px)` : ''
      } else if (a.modelo === 'barrido') {
        // Sale de cuadro más rápido que el dedo: cuando la nueva llega, la
        // anterior ya se ha ido de la pantalla.
        transformar = `translate3d(${d * 135}%, 0, 0)`
      } else if (a.modelo === 'cortina') {
        // Nada se mueve: se recorta desde el canto y por debajo aparece la nueva.
        transformar = ''
        recorte =
          hacia > 0
            ? `inset(0 0 0 ${(100 - lejos * 100).toFixed(2)}%)`
            : `inset(0 ${(100 - lejos * 100).toFixed(2)}% 0 0)`
        velado = 0
      } else if (a.modelo === 'caida') {
        // Se desprende: cae, se encoge y se apaga. La nueva sube a su sitio.
        transformar = `translate3d(0, ${lejos * 22}%, 0) scale(${1 - lejos * 0.18})`
      } else {
        // Contracción: se recoge hacia el centro y la nueva crece desde el centro.
        transformar = `scale(${1 - lejos * 0.45})`
      }

      // La compensación va delante de todo lo demás: es un desplazamiento en el
      // documento, no parte del efecto.
      const arrastrada = compensa && compensa.familia === i ? `translateY(${compensa.px}px) ` : ''

      nodo.style.transformOrigin = origen || `50% ${mitad}px`
      nodo.style.transform = arrastrada + transformar
      nodo.style.filter = desenfoque
      nodo.style.clipPath = recorte
      nodo.style.borderRadius = `${Math.min(1, lejos * 6) * a.radio}px`
      nodo.style.overflow = 'hidden'
      // A partir de aquí ya no hay nada que ver: se quita del todo en vez de
      // dejarla pintada al 1% de opacidad, que sigue costando fotogramas.
      nodo.style.visibility = velado >= 0.999 || (recorte && lejos >= 1) ? 'hidden' : 'visible'
      const velo = nodo.querySelector<HTMLElement>('[data-velo]')
      if (velo) velo.style.opacity = String(velado)
    }

    // Lo recorrido del viaje, una vez por fotograma y desde aquí: así lo que
    // sigue al mazo lo sigue con su mismo reloj, sea el dedo quien lo mueva, el
    // impulso al soltar o un salto pedido desde la barra.
    if (viaje) aviso.arrastre(-(pos - viaje.base))

    const centrada = bucle(Math.round(pos), count)
    if (centrada !== familiaVista) {
      familiaVista = centrada
      aviso.familia(centrada)
    }
  }

  /** Congela el bloque a una pantalla antes de empezar a girar. */
  function plegar() {
    if (plegado) return
    plegado = true
    const px = aviso.plegar()
    compensa = px > 0 ? { familia: familiaVista, px } : null
  }

  function asentar() {
    // El `null` va antes de comprobar el plegado y fuera de él: es la señal de que
    // el viaje ha terminado, y quien la espera —la barra— la necesita aunque el
    // bloque no estuviera plegado.
    if (viaje) {
      viaje = null
      aviso.arrastre(null)
    }
    if (!plegado) return
    plegado = false
    compensa = null
    aviso.asentado(bucle(Math.round(pos), count))
  }

  /** Nada de movimiento: quien ha pedido no ver animaciones, y la pestaña que no
   *  se está pintando —ahí el navegador no da fotogramas, y una animación se
   *  quedaría a medias con el bloque congelado—. */
  function quieto() {
    return (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.visibilityState !== 'visible'
    )
  }

  /**
   * El bucle del arrastre: un fotograma por refresco de pantalla mientras el dedo
   * lleva el mazo, y no uno por cada evento de toque —que llegan a rachas—.
   */
  function seguir() {
    cancelAnimationFrame(marco)
    const paso = () => {
      pintar()
      if (arrastrando) marco = requestAnimationFrame(paso)
    }
    marco = requestAnimationFrame(paso)
  }

  /**
   * El remate del gesto: lo que queda de camino, de un tirón corto y medido.
   *
   * Antes esto lo hacía un resorte amortiguado que heredaba la velocidad del dedo.
   * Sonaba bien y se sentía mal: un amortiguado se acerca por una exponencial, así
   * que el último medio píxel cuesta tanto como el primer noventa por ciento del
   * camino —medio segundo largo de bloque congelado y flor apagada, medido—, y
   * justo en ese rato el navegador estaba además pintando las fotos de la familia
   * que llegaba. Eso era el tirón, y por eso arrastrar se sentía más lento que
   * elegir la familia en la lista, que llega de una pieza.
   *
   * Ahora es un tramo fijo y corto con la curva de la casa: se sabe cuándo acaba y
   * no hay cola exponencial a la que esperar con el bloque congelado. La
   * velocidad del dedo sigue contando, pero donde tiene sentido —para elegir a qué
   * familia se va, en `terminar`—, no para dosificar los últimos píxeles.
   */
  function aterrizar(familia: number) {
    cancelAnimationFrame(marco)
    const desde = pos
    const tramo = vuelta(familia - pos, count)
    destino = pos + tramo
    vel = 0

    if (Math.abs(tramo) < 0.001 || quieto()) {
      pos = destino
      pintar()
      asentar()
      return
    }

    const arranque = performance.now()

    const paso = (ahora: number) => {
      const avance = Math.min(1, (ahora - arranque) / Math.max(1, a.aterrizaje))
      pos = desde + tramo * (1 - (1 - avance) ** 3)
      pintar()
      if (avance < 1) {
        marco = requestAnimationFrame(paso)
        return
      }
      pos = destino
      pintar()
      asentar()
    }

    marco = requestAnimationFrame(paso)
  }

  return {
    /** Los ajustes en vivo. La vista previa los cambia con los diales. */
    ajustar(nuevos: AjustesMazo) {
      a = nuevos
      pintar()
    },

    /** Dónde está el anillo. Para el asentado y para las pruebas. */
    donde() {
      return { pos, vel, destino }
    },

    /** Coloca el anillo sin animar. Al montar. */
    colocar(familia: number) {
      cancelAnimationFrame(marco)
      viaje = null
      pos = familia
      destino = familia
      vel = 0
      familiaVista = bucle(familia, count)
      pintar()
    },

    /**
     * A una familia concreta: aparece, y se acabó.
     *
     * No recorre el anillo. Da igual si estaba a tres familias o a dos hacia atrás:
     * lo único que importa es a cuál se va. Recorrerlo obligaba a mirar pasar
     * catálogos que nadie ha pedido, y cuanto más lejos peor: había que abrir la
     * mano con el reloj para que no fuera un latigazo, y entonces se hacía largo.
     * Elegir una familia no es un viaje, es abrir otra página.
     *
     * El plegado se hace igual, y no por costumbre: es lo que deja el catálogo
     * empezado por su primera fila en vez de por donde estuviera el ojo en la
     * familia de antes, y lo que le da el alto nuevo al bloque. Lo que se ha ido es
     * la animación de por medio.
     */
    irA(familia: number) {
      const salto = vuelta(familia - pos, count)
      if (Math.abs(salto) < 0.001) return
      cancelAnimationFrame(marco)
      plegar()
      pos += salto
      destino = pos
      vel = 0
      pintar()
      asentar()
    },

    empezar(x: number, y: number) {
      // Mientras se cargan las fotos de la familia en la que va a aterrizar el gesto
      // anterior no se empieza otro: el destino ya está elegido y la flor puesta. Con
      // las vecinas pedidas al empezar a arrastrar esto no espera nada, así que es un
      // seguro para la foto que no llega y no algo que se note.
      if (aterrizando !== null) return
      gesto.x = x
      gesto.y = y
      gesto.base = pos
      gesto.eje = ''
      gesto.t = performance.now()
      gesto.vivo = true
      vel = 0
    },

    seguirGesto(x: number, y: number) {
      if (!gesto.vivo) return
      const dx = x - gesto.x
      const dy = y - gesto.y

      if (!gesto.eje) {
        // Hasta que el gesto no se declara horizontal no se mueve nada: si no, un
        // desplazamiento vertical arrastraba el catálogo de lado.
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
        gesto.eje = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        if (gesto.eje === 'y') {
          gesto.vivo = false
          return
        }
        arrastrando = true
        viaje = { base: gesto.base }
        plegar()
        // Las dos vecinas, porque el dedo puede acabar en cualquiera de ellas —o
        // volver a la de partida—. Son sólo las fotos de su primera pantalla, y las
        // que ya estén no se piden dos veces: ver `cargar` en `ShopDeck`.
        const aqui = Math.round(pos)
        aviso.acercar([bucle(aqui - 1, count), bucle(aqui + 1, count)])
        seguir()
      }

      const ancho = vista.clientWidth || 1
      const antes = pos
      pos = gesto.base - dx / ancho
      const ahora = performance.now()

      // La velocidad se promedia con la que traía en vez de tomarse de la última
      // muestra: dos eventos que llegan casi en el mismo milisegundo dan una
      // velocidad enorme, y con ella el catálogo salía volando varias familias de
      // un gesto corto.
      const suelta = (pos - antes) / Math.max(4, ahora - gesto.t)
      vel = vel * 0.7 + suelta * 0.3
      gesto.t = ahora
    },

    terminar() {
      if (!gesto.vivo) return
      gesto.vivo = false
      if (!arrastrando) return
      arrastrando = false
      // Aquí no se manda `null`: el viaje sigue vivo hasta que la familia está
      // puesta, y lo que queda de camino lo tiene que recorrer el carril con el
      // mazo y no por su cuenta. La señal de fin la da `asentar`.

      // A dónde llegaría el impulso, con tope. Si el gesto fue corto y sin
      // fuerza, decide el recorrido: pasado el umbral cambia, y si no, vuelve.
      const vuelo = Math.max(-a.vuelo, Math.min(a.vuelo, vel * a.proyeccion))
      const lanzado = pos + vuelo
      const recorrido = pos - gesto.base
      const bruto =
        Math.abs(lanzado - gesto.base) > a.umbral
          ? Math.round(lanzado)
          : Math.abs(recorrido) > a.umbral
            ? Math.round(gesto.base) + Math.sign(recorrido)
            : Math.round(gesto.base)

      // Y de una en una: un gesto nunca se salta familias, pase lo que pase con
      // la velocidad. Es lo que hace que el catálogo se pueda seguir con el ojo.
      const salida = Math.round(gesto.base)
      destino = Math.max(salida - 1, Math.min(salida + 1, bruto))

      // Y de aquí en adelante, lo mismo que al elegir la familia en la lista:
      // primero se deja lista y después se pone. Mientras se carga no se pinta nada
      // —el mazo se queda donde lo dejó el dedo— porque mover el catálogo con las
      // fotos aún llegando es exactamente lo que se veía como un tirón.
      const familia = bucle(destino, count)
      const mio = ++espera
      aterrizando = familia
      cancelAnimationFrame(marco)

      void aviso
        .preparar(familia)
        .catch(() => true)
        .then((sigue) => {
          if (mio !== espera) return
          aterrizando = null
          if (sigue) aterrizar(familia)
        })
    },

    destruir() {
      cancelAnimationFrame(marco)
      // Y el aterrizaje que estuviera cargando no se pone: los nodos ya no están.
      espera++
      aterrizando = null
    },
  }
}
