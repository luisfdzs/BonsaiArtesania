'use client'

import { useEffect, useState } from 'react'

/**
 * «¿SEGURO?»
 *
 * La misma modal para todo lo que escribe en la base. Nada de lo que Ana toca en
 * el panel se guarda por pulsar una vez: entre el clic y el cambio hay siempre
 * esta pantalla, que dice qué va a pasar y deja volver atrás.
 *
 * Es una sola pieza y no una modal por sitio a propósito. Si cada pantalla
 * escribiera la suya, unas preguntarían y otras no, y la de borrar acabaría
 * pareciéndose a la de guardar. Aquí sólo hay dos tonos —el normal y el rojo de
 * lo que no se deshace— y una tranca opcional: escribir un texto exacto para
 * poder seguir, que es lo que se le pone a lo irreversible.
 *
 * Quien la usa guarda una `Peticion` en su estado y la borra al terminar; la
 * modal no sabe nada de catálogos ni de familias.
 */

export type Peticion = {
  titulo: string
  detalle?: string
  /** Lo que dice el botón que confirma: «Guardar», «Publicar», «Borrar»… */
  boton: string
  /** `peligro` pinta el botón en rojo. Para lo que no se deshace. */
  tono?: 'normal' | 'peligro'
  /** Si viene, hay que escribirlo tal cual para que el botón se encienda. */
  escribir?: string
  accion: () => Promise<{ ok: boolean; error?: string }>
  /** Qué deshacer si se dice que no. Lo usa el arrastre, que ya ha movido lo que
   *  se ve antes de preguntar. */
  alCancelar?: () => void
}

type Props = {
  peticion: Peticion | null
  trabajando: boolean
  onCancelar: () => void
  onConfirmar: () => void
}

const BOTON_ROJO =
  'inline-flex min-h-9 items-center justify-center rounded-full border border-amapola px-[1.15rem] text-small tracking-[0.1em] text-amapola uppercase transition-colors duration-500 hover:bg-amapola hover:text-linen disabled:cursor-not-allowed disabled:border-line disabled:bg-transparent disabled:text-bark-faint'

export function Confirmar({ peticion, trabajando, onCancelar, onConfirmar }: Props) {
  if (!peticion) return null

  // La `key` es lo que vacía la tranca entre una pregunta y la siguiente: cada
  // petición monta su propio cuerpo. Hacerlo con un efecto que limpiara el campo
  // sería escribir estado dentro de un efecto para algo que ya resuelve montar
  // de nuevo.
  return (
    <Cuerpo
      key={`${peticion.titulo}·${peticion.escribir ?? ''}`}
      peticion={peticion}
      trabajando={trabajando}
      onCancelar={onCancelar}
      onConfirmar={onConfirmar}
    />
  )
}

function Cuerpo({ peticion, trabajando, onCancelar, onConfirmar }: Props & { peticion: Peticion }) {
  const [escrito, setEscrito] = useState('')

  // Escapar cierra, como en el abanico de las fotos.
  useEffect(() => {
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCancelar()
    }

    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [onCancelar])

  const trancado = Boolean(peticion.escribir) && escrito.trim() !== peticion.escribir
  const peligro = peticion.tono === 'peligro'

  return (
    <div
      role="dialog"
      aria-modal="true"
      /* El fondo se difumina y se oscurece: lo de detrás tiene que dejar de
         leerse, o la pregunta parece una capa más de la pantalla en vez de un
         alto en el camino. */
      className="fixed inset-0 z-60 flex items-center justify-center bg-bark/45 p-6 backdrop-blur-md"
    >
      {/* Opaca. La utilidad `panel` es translúcida a propósito —está pensada para
          bloques dentro de la página—, y aquí eso dejaba ver el catálogo a través
          del texto. */}
      <div className="panel w-full max-w-md bg-linen text-left shadow-[0_24px_60px_rgba(44,40,35,0.22)]">
        <h3 className="font-serif text-2xl">{peticion.titulo}</h3>
        {peticion.detalle && <p className="mt-3 text-small text-bark-soft">{peticion.detalle}</p>}

        {peticion.escribir && (
          <label className="mt-5 flex flex-col gap-2 border-t border-line pt-5">
            <span className="text-small text-bark-soft">
              Para confirmar, escribe <span className="text-bark">{peticion.escribir}</span>
            </span>
            <input
              className="field"
              value={escrito}
              onChange={(evento) => setEscrito(evento.target.value)}
              placeholder={peticion.escribir}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onCancelar} className="btn btn-sm">
            Dejarlo
          </button>
          <button
            type="button"
            disabled={trabajando || trancado}
            onClick={onConfirmar}
            className={peligro ? BOTON_ROJO : 'btn btn-sm'}
          >
            {trabajando ? 'Un momento…' : peticion.boton}
          </button>
        </div>
      </div>
    </div>
  )
}
