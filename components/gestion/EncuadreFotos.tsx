'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import {
  reemplazarFoto,
  subirFotoDePieza,
  subirFotos,
} from '@/app/[locale]/gestion/catalogo/actions'

/**
 * COLOCAR LA FOTO EN SU TARJETA
 *
 * Lo que ve Ana justo después de soltar fotos en una familia: la foto dentro del
 * cuadro de la tarjeta, para moverla y acercarla hasta que la pieza quede donde
 * quiere, con su nombre —sacado del nombre del archivo— al lado.
 *
 * El recorte se guarda en **fracciones** de la foto original y no en píxeles,
 * porque aquí se está viendo una versión escalada a la pantalla: en píxeles, el
 * mismo gesto daría un recorte distinto en un portátil y en un monitor grande.
 * Del recorte de verdad se encarga el servidor con la foto entera. Ver
 * `lib/fotos.ts`.
 *
 * Nada se sube hasta la última: se van repasando todas y al final salen juntas.
 * Así una foto a medio nombrar no deja una pieza suelta en el catálogo.
 */

/**
 * El lado del cuadro, en píxeles de pantalla. Es la tarjeta de la rejilla.
 *
 * Es un **máximo**, no una medida: en un teléfono no caben 460 píxeles y el
 * cuadro se queda con el ancho que haya. El lado de verdad lo pone el CSS y lo
 * lee `useEffect` con un `ResizeObserver`; ver `cuadro` más abajo.
 */
const CUADRO_MAXIMO = 460
const ZOOM_MAXIMO = 3

type Entrada = {
  fichero: File
  /** Estable y propio: sirve de `key` y sobrevive a que se descarte otra. */
  id: string
  nombre: string
  /** Tamaño real de la foto, en cuanto el navegador la lee. */
  ancho: number
  alto: number
  zoom: number
  /** Desplazamiento de la foto dentro del cuadro, en píxeles de pantalla. */
  x: number
  y: number
}

/**
 * A dónde va la foto que se está encuadrando. Son tres sitios distintos y el
 * encuadre es el mismo para los tres: lo único que cambia es qué se pregunta al
 * lado —una pieza nueva necesita nombre; una foto más, no— y a quién se
 * le manda al final.
 */
export type DestinoDeFoto =
  /** Cada foto crea una pieza nueva en esta familia. */
  | { tipo: 'familia'; familia: string; label: string }
  /** Cada foto se añade a una pieza que ya existe. */
  | { tipo: 'pieza'; slug: string; nombre: string }
  /** Esta foto sustituye a otra, en su mismo sitio de la lista. */
  | { tipo: 'reemplazo'; slug: string; nombre: string; fotoId: string }

type Props = {
  destino: DestinoDeFoto
  ficheros: File[]
  onCerrar: () => void
  onHecho: () => void
}

/** `pendientes-farolillo-2.jpg` → `Pendientes farolillo 2`. */
function nombreDesdeFichero(nombre: string): string {
  const limpio = nombre
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return limpio.charAt(0).toUpperCase() + limpio.slice(1)
}

/** Lo que hay que multiplicar la foto para que cubra el cuadro sin huecos. */
function escalaBase(ancho: number, alto: number, cuadro: number): number {
  if (!ancho || !alto) return 1
  return Math.max(cuadro / ancho, cuadro / alto)
}

function encajar(entrada: Entrada, cuadro: number): Entrada {
  const escala = escalaBase(entrada.ancho, entrada.alto, cuadro) * entrada.zoom
  const anchoPintado = entrada.ancho * escala
  const altoPintado = entrada.alto * escala

  return {
    ...entrada,
    x: Math.min(0, Math.max(cuadro - anchoPintado, entrada.x)),
    y: Math.min(0, Math.max(cuadro - altoPintado, entrada.y)),
  }
}

function primeraLectura(ficheros: File[]): Entrada[] {
  return ficheros.map((fichero, i) => ({
    fichero,
    id: `${i}·${fichero.name}`,
    nombre: nombreDesdeFichero(fichero.name),
    ancho: 0,
    alto: 0,
    zoom: 1,
    x: 0,
    y: 0,
  }))
}

export function EncuadreFotos({ destino, ficheros, onCerrar, onHecho }: Props) {
  // Las entradas se montan una sola vez, con los ficheros que se soltaron: este
  // componente nace cuando se sueltan y muere cuando se acaba de repasarlas.
  const [entradas, setEntradas] = useState<Entrada[]>(() => primeraLectura(ficheros))
  const [indice, setIndice] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [arrastrando, setArrastrando] = useState(false)
  const [enviando, empezarEnvio] = useTransition()
  const arrastre = useRef<{ x: number; y: number; ex: number; ey: number } | null>(null)

  /**
   * Las direcciones temporales de las fotos.
   *
   * Se crean **dentro del efecto** que las revoca, y eso no es un rodeo. Hay que
   * revocarlas —mientras vivan, el navegador guarda el fichero entero en
   * memoria—, y el único sitio honrado para hacerlo es la limpieza del efecto.
   * Creándolas fuera, esa limpieza mataba unas direcciones que el estado seguía
   * usando: en desarrollo el modo estricto monta, limpia y vuelve a montar con el
   * mismo estado, así que la foto llegaba al cuadro con la dirección ya revocada
   * y no se veía nada —ni un error, un hueco—. Creándolas aquí, cada montaje
   * trae las suyas y la limpieza sólo mata las que ese montaje abrió.
   */
  const [direcciones, setDirecciones] = useState<ReadonlyMap<File, string>>(() => new Map())

  useEffect(() => {
    const abiertas = new Map(ficheros.map((fichero) => [fichero, URL.createObjectURL(fichero)]))
    // El aviso está bien puesto de norma y aquí no hay otra salida: la limpieza es
    // la que revoca, así que después de una limpieza hace falta un renderizado más
    // para que el cuadro reciba las direcciones nuevas. Crearlas en el estado o en
    // un `useMemo` deja la foto pegada a la que ya se revocó.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDirecciones(abiertas)
    return () => abiertas.forEach((url) => URL.revokeObjectURL(url))
  }, [ficheros])

  /**
   * El lado del cuadro, medido de lo que el CSS le haya dado.
   *
   * El encuadre se guarda en fracciones, así que el lado no cambia el resultado;
   * lo que sí hace es entrar en todas las cuentas de la pantalla —la escala, el
   * tope del arrastre—, y si aquí se dijera 460 mientras se pintan 320, la foto
   * se saldría del cuadro por abajo y a la derecha.
   */
  const marco = useRef<HTMLDivElement | null>(null)
  const [cuadro, setCuadro] = useState(CUADRO_MAXIMO)

  useEffect(() => {
    const nodo = marco.current
    if (!nodo) return

    const observador = new ResizeObserver((medidas) => {
      const lado = Math.round(medidas[0]?.contentRect.width ?? 0)
      if (lado > 0) setCuadro((previo) => (Math.abs(previo - lado) < 1 ? previo : lado))
    })

    observador.observe(nodo)
    return () => observador.disconnect()
  }, [])

  /**
   * Al cambiar el lado —al girar el teléfono, al abrir por primera vez— la foto
   * se reescala con él. Todo lo que se guarda de la posición está en píxeles de
   * pantalla y es proporcional al lado, así que multiplicar por el factor deja el
   * encuadre exactamente donde estaba en vez de mandarlo al centro.
   */
  const ladoAnterior = useRef(cuadro)

  useEffect(() => {
    const previo = ladoAnterior.current
    ladoAnterior.current = cuadro
    if (previo === cuadro || !previo) return

    const factor = cuadro / previo
    setEntradas((previas) =>
      previas.map((entrada) =>
        encajar({ ...entrada, x: entrada.x * factor, y: entrada.y * factor }, cuadro),
      ),
    )
  }, [cuadro])

  const actual = entradas[indice]

  function cambiar(cambios: Partial<Entrada>) {
    setEntradas((previas) =>
      previas.map((entrada, i) =>
        i === indice ? encajar({ ...entrada, ...cambios }, cuadro) : entrada,
      ),
    )
  }

  function alCargar(evento: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = evento.currentTarget
    setEntradas((previas) =>
      previas.map((entrada, i) =>
        i === indice
          ? encajar({ ...entrada, ancho: naturalWidth, alto: naturalHeight, x: 0, y: 0 }, cuadro)
          : entrada,
      ),
    )
  }

  function empezarArrastre(evento: React.PointerEvent<HTMLDivElement>) {
    if (!actual) return
    evento.currentTarget.setPointerCapture(evento.pointerId)
    arrastre.current = { x: evento.clientX, y: evento.clientY, ex: actual.x, ey: actual.y }
    setArrastrando(true)
  }

  function moverArrastre(evento: React.PointerEvent<HTMLDivElement>) {
    const inicio = arrastre.current
    if (!inicio) return

    cambiar({
      x: inicio.ex + (evento.clientX - inicio.x),
      y: inicio.ey + (evento.clientY - inicio.y),
    })
  }

  function soltarArrastre(evento: React.PointerEvent<HTMLDivElement>) {
    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId)
    }
    arrastre.current = null
    setArrastrando(false)
  }

  /** El recorte elegido, en fracciones de la foto original. */
  function recorteDe(entrada: Entrada) {
    const escala = escalaBase(entrada.ancho, entrada.alto, cuadro) * entrada.zoom
    if (!escala || !entrada.ancho) return null

    const lado = cuadro / escala

    return {
      x: Math.max(0, -entrada.x / escala / entrada.ancho),
      y: Math.max(0, -entrada.y / escala / entrada.alto),
      w: Math.min(1, lado / entrada.ancho),
      h: Math.min(1, lado / entrada.alto),
    }
  }

  function siguiente() {
    setError(null)

    if (indice < entradas.length - 1) {
      setIndice(indice + 1)
      return
    }

    empezarEnvio(async () => {
      // Una pieza nueva por foto: van todas juntas en un envío, que es lo que
      // permite que o entran todas o no entra ninguna a medias.
      if (destino.tipo === 'familia') {
        const datos = new FormData()
        datos.set('familia', destino.familia)

        for (const entrada of entradas) {
          datos.append('foto', entrada.fichero)
          datos.append('nombre', entrada.nombre)
          datos.append('encuadre', JSON.stringify(recorteDe(entrada) ?? {}))
        }

        const resultado = await subirFotos(datos)
        if (resultado.ok) onHecho()
        else setError(resultado.error)
        return
      }

      // Fotos de una pieza que ya existe: una por envío, porque cada una se
      // añade al final de su lista y el orden importa.
      for (const entrada of entradas) {
        const datos = new FormData()
        datos.set('slug', destino.slug)
        datos.set('foto', entrada.fichero)
        datos.set('alt', entrada.nombre)
        datos.set('encuadre', JSON.stringify(recorteDe(entrada) ?? {}))

        if (destino.tipo === 'reemplazo') datos.set('fotoId', destino.fotoId)

        const resultado =
          destino.tipo === 'reemplazo' ? await reemplazarFoto(datos) : await subirFotoDePieza(datos)

        if (!resultado.ok) {
          setError(resultado.error)
          return
        }
      }

      onHecho()
    })
  }

  function descartar() {
    const quedan = entradas.filter((_, i) => i !== indice)
    if (quedan.length === 0) {
      onCerrar()
      return
    }

    setEntradas(quedan)
    setIndice(Math.min(indice, quedan.length - 1))
  }

  if (!actual) return null

  const escala = escalaBase(actual.ancho, actual.alto, cuadro) * actual.zoom
  const direccion = direcciones.get(actual.fichero)

  /** Lo que se dice en la esquina: a dónde va a parar esto. */
  const dondeVa = destino.tipo === 'familia' ? destino.label : destino.nombre
  /** Una pieza nueva se nombra; una foto suelta sólo se describe. */
  const esPiezaNueva = destino.tipo === 'familia'

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-linen">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line px-4 py-3 sm:px-7 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Atrás sale de aquí sin subir nada, y por eso lleva la flecha: es la
              misma salida que en el resto del panel, no un «cancelar» escondido
              en la esquina de la derecha. */}
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Dejarlo y volver al catálogo"
            className="group flex items-center gap-3 text-small text-bark-soft transition-colors duration-500 hover:text-bark"
          >
            <span className="flex size-11 items-center justify-center rounded-full border border-line transition-colors duration-500 group-hover:border-sage-deep group-hover:text-sage-deep">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
                className="size-5"
              >
                <path d="M14 6l-6 6 6 6" />
              </svg>
            </span>
            Dejarlo
          </button>

          <div className="flex flex-col gap-1">
            <h2 className="font-serif text-xl leading-none sm:text-2xl">
              Coloca la foto en su tarjeta
            </h2>
            {/* En un teléfono esta explicación se come la pantalla que hace falta
                para el cuadro, y lo que dice se ve haciéndolo. */}
            <p className="hidden text-small text-bark-soft lg:block">
              Arrástrala dentro del cuadro y acerca o aleja hasta que la pieza quede donde quieres.
              Del recorte, el peso y el formato me encargo yo.
            </p>
          </div>
        </div>
        <span className="text-small whitespace-nowrap text-bark-faint">
          Foto {indice + 1} de {entradas.length} · {dondeVa}
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-linen-deep p-4 sm:gap-6 sm:p-6">
          {/* El lado lo pone el CSS —lo que quepa, con 460 de tope y sin pasar de
              media pantalla de alto— y `cuadro` lo lee de aquí. Cuadrado siempre:
              es la tarjeta de la rejilla. */}
          <div
            ref={marco}
            className="relative aspect-square w-full touch-none overflow-hidden bg-linen"
            /* El tope va en el estilo y no en una clase: `min()` con coma dentro
               de un valor arbitrario de Tailwind no llega a generar regla, y sin
               regla mandaba `w-full` y el cuadro se iba a miles de píxeles. Los
               `52vh` son para que en horizontal quepan encima el zoom y el pie. */
            style={{
              maxWidth: `min(${CUADRO_MAXIMO}px, 52vh)`,
              cursor: arrastrando ? 'grabbing' : 'grab',
            }}
            onPointerDown={empezarArrastre}
            onPointerMove={moverArrastre}
            onPointerUp={soltarArrastre}
            onPointerCancel={soltarArrastre}
          >
            {direccion && (
              /* eslint-disable-next-line @next/next/no-img-element -- es un fichero
                 local que todavía no existe en el servidor: no hay nada que optimizar. */
              <img
                src={direccion}
                alt=""
                onLoad={alCargar}
                draggable={false}
                className="absolute max-w-none select-none"
                style={{
                  width: actual.ancho ? actual.ancho * escala : cuadro,
                  height: actual.alto ? actual.alto * escala : cuadro,
                  left: actual.x,
                  top: actual.y,
                }}
              />
            )}
            <div className="pointer-events-none absolute inset-0 border border-linen/70">
              <div className="absolute inset-y-0 left-1/3 w-px bg-linen/40" />
              <div className="absolute inset-y-0 left-2/3 w-px bg-linen/40" />
              <div className="absolute inset-x-0 top-1/3 h-px bg-linen/40" />
              <div className="absolute inset-x-0 top-2/3 h-px bg-linen/40" />
            </div>
          </div>

          <div className="flex w-full max-w-[460px] items-center gap-3 sm:gap-4">
            <span className="text-micro text-bark-faint">Alejar</span>
            <input
              type="range"
              min={1}
              max={ZOOM_MAXIMO}
              step={0.01}
              value={actual.zoom}
              onChange={(evento) => cambiar({ zoom: Number(evento.target.value) })}
              className="min-w-0 flex-1 accent-sage-deep"
              aria-label="Acercar o alejar la foto"
            />
            <span className="text-micro text-bark-faint">Acercar</span>
            <button
              type="button"
              onClick={() => cambiar({ zoom: 1, x: 0, y: 0 })}
              className="btn min-h-10 flex-none px-4 py-0"
            >
              Centrar
            </button>
          </div>

          <p className="hidden text-small text-bark-faint lg:block">
            Lo de fuera del cuadro no se pierde: la foto entera se guarda por si luego quieres otro
            encuadre.
          </p>
        </div>

        <aside className="flex w-full flex-none flex-col gap-5 border-t border-line p-4 sm:p-6 lg:w-[420px] lg:overflow-y-auto lg:border-t-0 lg:border-l">
          <label className="flex flex-col gap-2">
            <span className="eyebrow">
              {esPiezaNueva ? 'Nombre de la pieza' : 'Qué se ve en la foto'}
            </span>
            <input
              value={actual.nombre}
              onChange={(evento) => cambiar({ nombre: evento.target.value })}
              className="field"
              autoComplete="off"
            />
            <span className="text-micro text-bark-faint normal-case tracking-normal">
              {esPiezaNueva
                ? `Lo he sacado del nombre de tu foto: ${actual.fichero.name}`
                : 'Se lee en voz alta a quien no ve la foto. Con una frase corta basta.'}
            </span>
          </label>

          <p className="rounded-sm bg-petal-soft px-4 py-3 text-small text-bark-soft">
            {esPiezaNueva
              ? 'La pieza se guarda en borrador: no sale a la tienda hasta que tú la publiques desde el catálogo.'
              : destino.tipo === 'reemplazo'
                ? 'Esta foto ocupará el sitio de la que has tapado. La vieja no se borra: los pedidos que ya la enseñaban la siguen enseñando.'
                : 'La foto se añade al final de las de esta pieza. Para que salga en la rejilla tiene que ser la primera.'}
          </p>

          {error && <p className="text-small text-bark">{error}</p>}

          <div className="mt-auto flex flex-col gap-3">
            <button
              type="button"
              onClick={siguiente}
              disabled={enviando}
              className="btn w-full bg-sage-deep text-linen"
            >
              {indice < entradas.length - 1
                ? 'Guardar y seguir con la siguiente'
                : enviando
                  ? 'Subiendo…'
                  : destino.tipo === 'reemplazo'
                    ? 'Cambiar la foto'
                    : `Añadir ${entradas.length === 1 ? 'la foto' : `las ${entradas.length} fotos`}`}
            </button>
            <button type="button" onClick={descartar} disabled={enviando} className="btn w-full">
              Descartar esta foto
            </button>
          </div>
        </aside>
      </div>

      {/* Con una sola foto el pie no dice nada que no esté ya en la cabecera, y en
          un teléfono ocupa lo que le falta al cuadro. */}
      {entradas.length > 1 && (
        <footer className="flex flex-none items-center gap-4 border-t border-line px-4 py-3 sm:px-7">
          <span className="eyebrow whitespace-nowrap">{entradas.length} fotos</span>
          <ul className="flex min-w-0 items-center gap-3 overflow-x-auto">
            {entradas.map((entrada, i) => {
              const suya = direcciones.get(entrada.fichero)

              return (
                <li key={entrada.id} className="flex-none">
                  <button
                    type="button"
                    onClick={() => setIndice(i)}
                    aria-current={i === indice ? 'true' : undefined}
                    className={`block size-12 overflow-hidden rounded-sm bg-linen-deep ${
                      i === indice ? 'ring-2 ring-sage-deep' : 'opacity-60'
                    }`}
                  >
                    {suya && (
                      /* eslint-disable-next-line @next/next/no-img-element -- ídem: fichero local. */
                      <img src={suya} alt="" className="size-full object-cover" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </footer>
      )}
    </div>
  )
}
