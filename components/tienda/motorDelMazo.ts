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
  /** La frecuencia del resorte que remata el viaje. Más alto, más seco. */
  rigidez: number
  /** 1 = sin rebote; por debajo, rebota. */
  amortiguacion: number
  /** Cuánto del impulso queda en cada milisegundo: lo que rueda un manotazo. */
  friccion: number
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
  rigidez: 150,
  amortiguacion: 1,
  friccion: 0.99,
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
  let reloj = 0
  let familiaVista = 0
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
    if (!plegado) return
    plegado = false
    compensa = null
    aviso.asentado(bucle(Math.round(pos), count))
  }

  function correr() {
    cancelAnimationFrame(marco)
    reloj = performance.now()

    const paso = (ahora: number) => {
      const dt = Math.min(32, ahora - reloj)
      reloj = ahora

      if (!arrastrando) {
        // Un integrador y nada más: resorte amortiguado que tira hacia el destino
        // y conserva la velocidad que traía el gesto, así que un manotazo rueda y
        // un toque va directo. `omega` es la frecuencia propia en radianes por
        // milisegundo —de ahí el /10000—, que es lo que hace que las cuentas sean
        // estables con `dt` en milisegundos.
        const omega = a.rigidez / 10000
        const rozamiento = 2 * a.amortiguacion * omega
        vel += ((destino - pos) * omega * omega - vel * rozamiento) * dt
        vel *= a.friccion ** dt
        pos += vel * dt
      }

      pintar()

      if (!arrastrando && Math.abs(vel) < 0.00006 && Math.abs(destino - pos) < 0.001) {
        pos = destino
        vel = 0
        pintar()
        asentar()
        return
      }

      marco = requestAnimationFrame(paso)
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
      pos = familia
      destino = familia
      vel = 0
      familiaVista = bucle(familia, count)
      pintar()
    },

    /** A una familia concreta, por el camino corto del anillo. */
    irA(familia: number) {
      const salto = vuelta(familia - pos, count)
      if (Math.abs(salto) < 0.001) return
      destino = pos + salto
      plegar()
      correr()
    },

    empezar(x: number, y: number) {
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
        plegar()
        correr()
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
      aviso.arrastre(-(pos - gesto.base))
    },

    terminar() {
      if (!gesto.vivo) return
      gesto.vivo = false
      if (!arrastrando) return
      arrastrando = false
      aviso.arrastre(null)

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

      correr()
    },

    destruir() {
      cancelAnimationFrame(marco)
    },
  }
}
