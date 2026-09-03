'use client'

import { upload } from '@vercel/blob/client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  anadirReelDePortada,
  borrarReelDePortada,
  colocarReelsDePortada,
} from '@/app/[locale]/gestion/portada/actions'
import { Asa } from '@/components/gestion/Asa'
import { Confirmar, type Peticion } from '@/components/gestion/Confirmar'
import { ElegirVideos } from '@/components/gestion/ElegirFicheros'
import type { ReelDePortada } from '@/lib/portada'
import { MAXIMO_BYTES } from '@/lib/portada-limites'
import { primerFotograma } from '@/lib/primerFotograma'
import { useReordenar } from '@/lib/useReordenar'

/**
 * LOS VÍDEOS DE LA PORTADA
 *
 * Subir, ordenar y quitar. La lista es el orden en que se encadenan en la
 * primera pantalla de un móvil: rueda el primero, al acabar entra el segundo, y
 * al acabar el último vuelve el primero. Se arrastra igual que las familias y que
 * las piezas —se mueve al arrastrar y se guarda al soltar— porque es lo mismo que
 * hacen las otras dos listas del panel y aprender una es aprender las tres.
 *
 * **Y se dice en voz alta que esto es sólo el móvil.** Es lo primero que se lee
 * al entrar, porque es lo único de esta pantalla que no se puede adivinar
 * mirándola: Ana sube un vídeo, abre la web en el ordenador para verlo y no está.
 * En escritorio la portada sigue siendo el díptico del taller, que son dos clips
 * verticales pensados para verse juntos en una pantalla ancha. Ver
 * `components/ui/ReelBackdrop.tsx`.
 *
 * ## La subida no pasa por el servidor
 *
 * Las fotos del catálogo viajan dentro de una acción de servidor. Un vídeo de
 * diez megas no cabe por ahí, así que va **derecho del navegador al almacén** y
 * el servidor sólo firma el permiso —ver `app/api/gestion/reel/route.ts`—. Cuando
 * la subida acaba, esta pantalla llama a `anadirReelDePortada` con la dirección
 * que ha quedado y ahí es cuando el vídeo entra en la portada.
 *
 * Eso deja un estado que hay que enseñar: **el porcentaje**. Un mp4 de diez megas
 * por la subida de un móvil son bastantes segundos, y sin la barra parece que no
 * está pasando nada y se toca otra vez.
 *
 * De uno en uno, y a propósito: dos subidas a la vez se reparten la misma
 * conexión y las dos van a la mitad, con dos barras que no dicen nada.
 *
 * ## El póster
 *
 * Antes de subir se saca el primer fotograma en el propio navegador y se sube
 * como una imagen aparte: es lo que se ve mientras el vídeo baja. Si no se puede
 * sacar, el vídeo sube igual y sin póster —ver `lib/primerFotograma.ts`—. No es
 * motivo para no dejar subir nada.
 */

type Props = { reels: ReelDePortada[]; almacenListo: boolean }

const MEGAS = Math.round(MAXIMO_BYTES / (1024 * 1024))

export function PortadaReels({ reels, almacenListo }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [peticion, setPeticion] = useState<Peticion | null>(null)
  const [trabajando, empezar] = useTransition()
  /** Qué se está subiendo y por dónde va, o `null` si no hay nada en marcha. */
  const [subiendo, setSubiendo] = useState<{ nombre: string; parte: number } | null>(null)

  const { orden, moviendo, restaurar, fila, asa } = useReordenar({
    lista: reels,
    claveDe: (reel: ReelDePortada) => reel.id,
    alSoltar: (ids) =>
      pedir({
        titulo: '¿Guardamos el orden nuevo?',
        detalle:
          'Es el orden en que se encadenan en el móvil. Si dices que no, la lista vuelve a como estaba.',
        boton: 'Guardar el orden',
        accion: () => colocarReelsDePortada(ids),
        alCancelar: restaurar,
      }),
  })

  function pedir(peticionNueva: Peticion) {
    setError(null)
    setPeticion(peticionNueva)
  }

  function cancelar() {
    peticion?.alCancelar?.()
    setPeticion(null)
  }

  function confirmar() {
    if (!peticion) return

    empezar(async () => {
      const resultado = await peticion.accion()
      if (!resultado.ok) setError(resultado.error ?? 'No he podido guardar el cambio.')
      setPeticion(null)
      if (resultado.ok) router.refresh()
    })
  }

  /**
   * Sube un vídeo y lo mete en la portada.
   *
   * El orden importa: primero el póster —que es pequeño y si falla no pasa nada—,
   * luego el vídeo con su barra, y sólo cuando los dos están arriba se guarda en
   * la base. Si el guardado falla, lo subido queda en el almacén sin salir en
   * ningún sitio y se le dice: es mejor eso que una portada con un vídeo que no
   * se puede reproducir.
   */
  async function subir(ficheros: File[]) {
    const fichero = ficheros[0]
    if (!fichero) return

    setError(null)

    if (fichero.size > MAXIMO_BYTES) {
      setError(
        `Ese vídeo pesa ${megas(fichero.size)} y el tope son ${MEGAS} MB. El mp4 que se descarga de Instagram entra de sobra; uno sacado del carrete puede pesar mucho más.`,
      )
      return
    }

    setSubiendo({ nombre: fichero.name, parte: 0 })

    try {
      const fotograma = await primerFotograma(fichero)

      // El póster lleva el nombre del vídeo sin su extensión: `reel-de-ana-poster.jpg`
      // y no `reel-de-ana.mp4-poster.jpg`, que es lo que sale de pegarle el sufijo al
      // nombre entero y queda escrito para siempre en la dirección del fichero.
      let poster: string | null = null
      if (fotograma) {
        const subido = await upload(
          `portada/${nombreLimpio(fichero.name, '')}-poster.jpg`,
          fotograma,
          {
            access: 'public',
            contentType: 'image/jpeg',
            handleUploadUrl: '/api/gestion/reel',
          },
        )
        poster = subido.url
      }

      const video = await upload(`portada/${nombreLimpio(fichero.name)}`, fichero, {
        access: 'public',
        contentType: fichero.type,
        handleUploadUrl: '/api/gestion/reel',
        /* Por partes y en paralelo: es lo que hace que diez megas desde un móvil
           no sean una sola petición que se cae entera al primer bache del 4G. */
        multipart: true,
        onUploadProgress: ({ percentage }) =>
          setSubiendo({ nombre: fichero.name, parte: percentage }),
      })

      const resultado = await anadirReelDePortada({
        src: video.url,
        poster,
        nombre: fichero.name,
      })

      if (!resultado.ok) {
        setError(resultado.error)
        return
      }

      router.refresh()
    } catch (fallo) {
      const texto = fallo instanceof Error ? fallo.message : ''
      setError(
        texto || 'No he podido subir el vídeo. Mira que haya cobertura y vuelve a intentarlo.',
      )
    } finally {
      setSubiendo(null)
    }
  }

  return (
    <section className="text-left">
      <header className="flex flex-col gap-3">
        <h2 className="font-serif text-3xl leading-none">Portada</h2>
        <p className="text-small text-bark-soft">
          Los vídeos que se ven de fondo en la primera pantalla, <strong>sólo en el móvil</strong>.
          Van uno detrás de otro y vuelven a empezar; arrastra una tarjeta para cambiar el orden. En
          el ordenador la portada no cambia: ahí siguen los dos vídeos del taller.
        </p>
        <p className="text-small text-bark-faint">
          Si no dejas ninguno, en el móvil vuelven también los del taller.
        </p>
      </header>

      {!almacenListo && (
        <p className="mt-6 rounded-sm bg-petal-soft px-4 py-3 text-small text-bark">
          Todavía no hay dónde guardar los vídeos. Hay que dar de alta el almacén antes de subir
          nada.
        </p>
      )}

      {error && (
        <p className="mt-6 rounded-sm bg-petal-soft px-4 py-3 text-small text-bark">{error}</p>
      )}

      {almacenListo && (
        <div className="mt-8">
          {subiendo ? (
            <div
              className="rounded-sm border border-sage bg-sage-deep/6 px-4 py-3"
              aria-live="polite"
            >
              <p className="text-small text-bark">
                Subiendo «{subiendo.nombre}»… {Math.round(subiendo.parte)}%
              </p>
              {/* La barra es de adorno para quien ve; lo que se lee está arriba,
                  en el texto, que es lo que anuncia el `aria-live`. */}
              <div aria-hidden className="mt-2 h-1 w-full rounded-full bg-line">
                <div
                  className="h-1 rounded-full bg-sage-deep transition-[width] duration-300"
                  style={{ width: `${Math.max(2, subiendo.parte)}%` }}
                />
              </div>
              <p className="mt-2 text-small text-bark-faint">
                No cierres esta pantalla hasta que acabe.
              </p>
            </div>
          ) : (
            <ElegirVideos una alElegir={subir} className="btn btn-quiet btn-sm inline-flex">
              <PeliculaIcon className="h-4 w-4" />
              Añadir un vídeo
            </ElegirVideos>
          )}
        </div>
      )}

      {orden.length === 0 ? (
        <p className="mt-10 text-bark-soft">
          Todavía no hay ninguno. Mientras no lo haya, en el móvil se ven los dos vídeos del taller.
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-2">
          {orden.map((reel, indice) => {
            const hueca = moviendo === reel.id

            return (
              <li
                key={reel.id}
                {...fila(reel.id)}
                className={`rounded-sm border px-4 py-3 transition-colors duration-300 ${
                  hueca ? 'border-dashed border-line' : 'border-line'
                }`}
              >
                <div className={`flex items-center gap-4 ${hueca ? 'invisible' : ''}`}>
                  <Asa {...asa(reel.id)} className="-my-2 -ml-3 p-2" />

                  {/* El póster y no el vídeo: una lista de vídeos reproduciéndose
                      a la vez en el panel es un ventilador y una factura de datos.
                      Sin póster queda el hueco en tinta, que es lo que se verá
                      también en la portada mientras el vídeo baja. */}
                  {reel.poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={reel.poster}
                      alt=""
                      className="h-20 w-12 flex-none rounded-sm object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-12 flex-none items-center justify-center rounded-sm bg-bark/80">
                      <PeliculaIcon className="h-4 w-4 text-linen/70" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-bark">{reel.nombre}</p>
                    <p className="text-small text-bark-faint">
                      {indice === 0 ? 'El primero que se ve' : `El ${indice + 1}º`}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-quiet btn-sm flex-none"
                    onClick={() =>
                      pedir({
                        titulo: `¿Quitamos «${reel.nombre}» de la portada?`,
                        detalle:
                          'Deja de verse en el móvil y el fichero se borra del almacén: para volver a ponerlo habría que subirlo otra vez.',
                        boton: 'Quitar de la portada',
                        tono: 'peligro',
                        accion: () => borrarReelDePortada(reel.id),
                      })
                    }
                  >
                    Quitar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Confirmar
        peticion={peticion}
        trabajando={trabajando}
        onCancelar={cancelar}
        onConfirmar={confirmar}
      />
    </section>
  )
}

function megas(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * De `Reel de Ana (1).MP4` a `reel-de-ana-1.mp4`.
 *
 * La dirección la escribe el almacén con este nombre dentro, así que los espacios
 * y los acentos acabarían escapados en la URL del vídeo de la portada. Lo mismo
 * que hace `comoDireccion` con los nombres de las piezas.
 *
 * `conExtension` la cambia por otra —o la quita, con cadena vacía— para el póster,
 * que es un jpg del mismo vídeo y no otro mp4.
 */
function nombreLimpio(nombre: string, conExtension?: string): string {
  const punto = nombre.lastIndexOf('.')
  const cuerpo = punto > 0 ? nombre.slice(0, punto) : nombre
  const extension =
    conExtension !== undefined ? conExtension : punto > 0 ? nombre.slice(punto).toLowerCase() : ''

  const limpio = cuerpo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)

  return `${limpio || 'reel'}${extension}`
}

/** Una claqueta: dice «vídeo» sin parecerse a ningún otro icono del panel. */
function PeliculaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="2.5" y="5.5" width="19" height="13" rx="1.5" />
      <path d="M8 5.5v13M16 5.5v13M2.5 12h19" />
    </svg>
  )
}
