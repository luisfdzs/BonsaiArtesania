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

/** El lado del cuadro, en píxeles de pantalla. Es la tarjeta de la rejilla. */
const CUADRO = 460
const ZOOM_MAXIMO = 3

type Entrada = {
  fichero: File
  url: string
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
function escalaBase(ancho: number, alto: number): number {
  if (!ancho || !alto) return 1
  return Math.max(CUADRO / ancho, CUADRO / alto)
}

function encajar(entrada: Entrada): Entrada {
  const escala = escalaBase(entrada.ancho, entrada.alto) * entrada.zoom
  const anchoPintado = entrada.ancho * escala
  const altoPintado = entrada.alto * escala

  return {
    ...entrada,
    x: Math.min(0, Math.max(CUADRO - anchoPintado, entrada.x)),
    y: Math.min(0, Math.max(CUADRO - altoPintado, entrada.y)),
  }
}

function primeraLectura(ficheros: File[]): Entrada[] {
  return ficheros.map((fichero) => ({
    fichero,
    url: URL.createObjectURL(fichero),
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
  const direcciones = useRef(entradas.map((entrada) => entrada.url))

  // Las direcciones temporales de las fotos hay que soltarlas a mano: mientras
  // vivan, el navegador guarda el fichero entero en memoria.
  useEffect(() => {
    const abiertas = direcciones.current
    return () => abiertas.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  const actual = entradas[indice]

  function cambiar(cambios: Partial<Entrada>) {
    setEntradas((previas) =>
      previas.map((entrada, i) => (i === indice ? encajar({ ...entrada, ...cambios }) : entrada)),
    )
  }

  function alCargar(evento: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = evento.currentTarget
    setEntradas((previas) =>
      previas.map((entrada, i) =>
        i === indice
          ? encajar({ ...entrada, ancho: naturalWidth, alto: naturalHeight, x: 0, y: 0 })
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
    const escala = escalaBase(entrada.ancho, entrada.alto) * entrada.zoom
    if (!escala || !entrada.ancho) return null

    const lado = CUADRO / escala

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

  const escala = escalaBase(actual.ancho, actual.alto) * actual.zoom

  /** Lo que se dice en la esquina: a dónde va a parar esto. */
  const dondeVa = destino.tipo === 'familia' ? destino.label : destino.nombre
  /** Una pieza nueva se nombra; una foto suelta sólo se describe. */
  const esPiezaNueva = destino.tipo === 'familia'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-linen">
      <header className="flex items-center justify-between gap-6 border-b border-line px-7 py-4">
        <div className="flex items-center gap-4">
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
            <h2 className="font-serif text-2xl leading-none">Coloca la foto en su tarjeta</h2>
            <p className="text-small text-bark-soft">
              Arrástrala dentro del cuadro y acerca o aleja hasta que la pieza quede donde quieres.
              Del recorte, el peso y el formato me encargo yo.
            </p>
          </div>
        </div>
        <span className="text-small whitespace-nowrap text-bark-faint">
          Foto {indice + 1} de {entradas.length} · {dondeVa}
        </span>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-linen-deep p-6">
          <div
            className="relative touch-none overflow-hidden bg-linen"
            style={{
              width: CUADRO,
              height: CUADRO,
              cursor: arrastrando ? 'grabbing' : 'grab',
            }}
            onPointerDown={empezarArrastre}
            onPointerMove={moverArrastre}
            onPointerUp={soltarArrastre}
            onPointerCancel={soltarArrastre}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- es un fichero
                local que todavía no existe en el servidor: no hay nada que optimizar. */}
            <img
              src={actual.url}
              alt=""
              onLoad={alCargar}
              draggable={false}
              className="absolute max-w-none select-none"
              style={{
                width: actual.ancho ? actual.ancho * escala : CUADRO,
                height: actual.alto ? actual.alto * escala : CUADRO,
                left: actual.x,
                top: actual.y,
              }}
            />
            <div className="pointer-events-none absolute inset-0 border border-linen/70">
              <div className="absolute inset-y-0 left-1/3 w-px bg-linen/40" />
              <div className="absolute inset-y-0 left-2/3 w-px bg-linen/40" />
              <div className="absolute inset-x-0 top-1/3 h-px bg-linen/40" />
              <div className="absolute inset-x-0 top-2/3 h-px bg-linen/40" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-micro text-bark-faint">Alejar</span>
            <input
              type="range"
              min={1}
              max={ZOOM_MAXIMO}
              step={0.01}
              value={actual.zoom}
              onChange={(evento) => cambiar({ zoom: Number(evento.target.value) })}
              className="w-64 accent-sage-deep"
              aria-label="Acercar o alejar la foto"
            />
            <span className="text-micro text-bark-faint">Acercar</span>
            <button
              type="button"
              onClick={() => cambiar({ zoom: 1, x: 0, y: 0 })}
              className="btn min-h-10 px-4 py-0"
            >
              Centrar
            </button>
          </div>

          <p className="text-small text-bark-faint">
            Lo de fuera del cuadro no se pierde: la foto entera se guarda por si luego quieres otro
            encuadre.
          </p>
        </div>

        <aside className="flex w-[420px] flex-none flex-col gap-5 overflow-y-auto border-l border-line p-6">
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

      <footer className="flex items-center gap-4 border-t border-line px-7 py-3">
        <span className="eyebrow">
          {entradas.length === 1 ? 'Una foto' : `${entradas.length} fotos`}
        </span>
        <ul className="flex items-center gap-3">
          {entradas.map((entrada, i) => (
            <li key={entrada.url}>
              <button
                type="button"
                onClick={() => setIndice(i)}
                aria-current={i === indice ? 'true' : undefined}
                className={`block size-12 overflow-hidden rounded-sm ${
                  i === indice ? 'ring-2 ring-sage-deep' : 'opacity-60'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- ídem: fichero local. */}
                <img src={entrada.url} alt="" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      </footer>
    </div>
  )
}
