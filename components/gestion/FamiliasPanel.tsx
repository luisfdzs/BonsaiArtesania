'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  borrarFamilia,
  colocarFamilias,
  guardarDatosDeFamilia,
  nuevaFamilia,
} from '@/app/[locale]/gestion/catalogo/actions'
import { Asa } from '@/components/gestion/Asa'
import { BotonAtras } from '@/components/gestion/BotonAtras'
import { MedidorArrimo } from '@/components/gestion/MedidorArrimo'
import { Confirmar, type Peticion } from '@/components/gestion/Confirmar'
import { VeloDeSoltar } from '@/components/gestion/VeloDeSoltar'
import type { FamiliaPanel } from '@/lib/catalogo-panel'
import type { Locale, Localized } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { useReordenar } from '@/lib/useReordenar'
import { useSoltarFotos } from '@/lib/useSoltarFotos'

/**
 * LAS FAMILIAS DEL CATÁLOGO
 *
 * Crear, renombrar, ordenar y quitar. El orden de esta lista es el del carril de
 * la tienda y el del escaparate de la portada, así que se arrastra igual que las
 * piezas: se mueve al arrastrar y se guarda al soltar.
 *
 * ## Las tres rayas dicen que se coge; se coge por donde sea
 *
 * El asa del principio está para que se vea que la fila se mueve —una lista de
 * cajas iguales no lo dice por sí sola—, pero no es una cerradura: se arrastra
 * desde cualquier punto de la tarjeta. Apretar y mover es arrastrar; apretar y
 * soltar sin moverse sigue abriendo la familia, que es lo que hace el navegador
 * por su cuenta sin que haya que arbitrarlo.
 *
 * ## Lo que se lleva es sólido; lo que se deja es un hueco
 *
 * Mientras se arrastra hay dos cosas a la vez, y cada una dice lo suyo. La que va
 * pegada al cursor es la tarjeta **entera y opaca**: es la que tienes en la mano.
 *
 * Esa tarjeta la pintamos nosotros, y no es un capricho. La foto del arrastre la
 * hace el navegador, y Chrome le pasa un alfa a cualquier foto sacada de un nodo
 * del DOM: por opaco que sea lo que le des —y se ha comprobado que lo es—, lo
 * arrastra descolorido, y no hay forma de pedirle que no lo haga. Así que se le da
 * un píxel transparente por foto y la tarjeta va en el DOM, siguiendo al cursor
 * con los `dragover`. Ver `solidificar` y `PIXEL`.
 *
 * La que se queda en la lista es **el hueco**: mismo alto, borde de puntos y nada
 * dentro. No se pinta de verde, que es el color de lo abierto y de lo que la mano
 * señala; un sitio vacío no es nada elegido.
 *
 * ## Con el dedo, sólo por las rayas
 *
 * En el móvil no hay arrastre nativo —el de HTML5 es cosa del ratón—, así que el
 * dedo tiene su propio camino, con eventos de puntero, y ahí el asa **sí** es una
 * cerradura: sólo se arrastra desde las tres rayas. Con el ratón no hacía falta
 * porque apretar y mover ya se distingue de apretar y soltar; con el dedo no, y
 * lo que se lleva por delante es el desplazamiento de la página. Ver
 * `empezarTacto`.
 *
 * ## El hueco viaja, las demás se apartan
 *
 * Cuando otra tarjeta pasa a ocupar el sitio no aparece de golpe en su nueva
 * fila: se desliza hasta ella. La lista la reordena el estado, así que la
 * animación es la vuelta de siempre —mides dónde estaba cada una, la devuelves
 * ahí con un `translateY` y la sueltas— y quien la hace es `deslizar`. Sin eso el
 * reordenado es un parpadeo y hay que reconstruir de memoria qué se ha movido.
 *
 * El hueco no se desliza: salta a su sitio. Está debajo del cursor, y
 * una fila que se desliza sola por debajo del puntero vuelve a entrar en él y
 * pediría otro cambio de orden. Por lo mismo `mover` no atiende dos veces
 * seguidas antes de que el deslizamiento acabe.
 *
 * Aquí no se sueltan fotos. Una pieza nace dentro de una familia y se cataloga
 * en su rejilla, así que soltar un puñado de fotos sobre esta lista no tendría a
 * quién dárselas: son todas iguales y están una debajo de otra. Se sigue
 * escuchando el arrastre para poder decirlo —el cursor de prohibido y la señal
 * del velo—, porque tragarse las fotos sin más parecería que no ha pasado nada.
 * Ver `useSoltarFotos` y `VeloDeSoltar`.
 *
 * Quitar una familia nunca borra sus piezas. Se elige qué pasa con ellas —se
 * mudan a otra familia o se quedan en borrador— y no hay una tercera salida
 * silenciosa. Ver `quitarFamilia` en `lib/catalogo-escritura.ts`.
 */

type Props = { locale: Locale; familias: FamiliaPanel[] }

/** Nada que hacer con lo que se suelte. Fuera del componente para que el gancho
 *  no vuelva a colgar sus escuchas en cada render. */
const NADA = () => {}

type Campos = { label: Localized; plural: Localized; note: Localized; intro: Localized }

function camposDe(familia: FamiliaPanel): Campos {
  return {
    label: familia.label,
    plural: familia.plural,
    note: familia.note,
    intro: familia.intro,
  }
}

export function FamiliasPanel({ locale, familias }: Props) {
  const router = useRouter()
  /** Ver la nota de `CatalogoFamilia`: el reinicio lo hace la `key` de la página. */
  const [abierta, setAbierta] = useState<string | null>(null)
  const [campos, setCampos] = useState<Campos | null>(null)
  /** Lo que está esperando un «sí». Ver `Confirmar`. */
  const [peticion, setPeticion] = useState<Peticion | null>(null)
  const [quitando, setQuitando] = useState<FamiliaPanel | null>(null)
  /** Lo escrito en la tranca del borrado de una familia. */
  const [confirmacion, setConfirmacion] = useState('')
  const [destino, setDestino] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [trabajando, empezar] = useTransition()

  /**
   * El arrastre, entero, en `useReordenar`. Aquí sólo se dice qué se ordena y qué
   * hacer cuando se suelta: preguntar. Nada se escribe sin un «sí».
   */
  const { orden, moviendo, restaurar, fila, asa } = useReordenar({
    lista: familias,
    claveDe: (familia: FamiliaPanel) => familia.key,
    alSoltar: (keys) =>
      pedir({
        titulo: '¿Guardamos el orden nuevo?',
        detalle:
          'Es el orden del carril de la tienda y el del escaparate de la portada. Si dices que no, la lista vuelve a como estaba.',
        boton: 'Guardar el orden',
        accion: () => colocarFamilias(keys),
        // Al arrastrar ya se ha movido lo que se ve; decir que no tiene que
        // devolverlo a su sitio, no dejarlo mintiendo.
        alCancelar: restaurar,
      }),
  })

  /**
   * No se sueltan fotos aquí, pero sí se sabe que hay algo arrastrándose: con
   * `permitido: false` el sistema pinta el cursor de prohibido y lo que caiga se
   * traga sin abrirlo el navegador. El velo pone la señal.
   */
  const { arrastrando } = useSoltarFotos(NADA, { permitido: false })

  /**
   * Nada se escribe sin preguntar: esto no ejecuta, sólo deja la petición encima
   * de la mesa. Quien la confirma es la modal.
   */
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

  /** ¿El clic o la tecla han caído dentro del formulario de una familia abierta? */
  function dentroDelFormulario(destino: EventTarget | null): boolean {
    return destino instanceof Element && Boolean(destino.closest('[data-formulario]'))
  }

  function abrir(familia: FamiliaPanel) {
    setAbierta(familia.key)
    setCampos(camposDe(familia))
  }

  function guardarCampos(familia: FamiliaPanel) {
    if (!campos) return

    pedir({
      titulo: `¿Guardamos los cambios de «${familia.label.es}»?`,
      detalle: 'Se ven en la tienda en cuanto digas que sí.',
      boton: 'Guardar',
      accion: async () => {
        const resultado = await guardarDatosDeFamilia(familia.key, campos)
        if (resultado.ok) setAbierta(null)
        return resultado
      },
    })
  }

  return (
    <section className="text-left">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <BotonAtras href={path(locale, '/gestion/catalogo')}>Volver al catálogo</BotonAtras>
          <h2 className="font-serif text-3xl leading-none">Familias</h2>
          <p className="text-small text-bark-soft">
            Cada familia tiene su espacio de fotos. Este orden es el del carril de la tienda y el
            del escaparate de la portada: arrastra una tarjeta para cambiarlo.
          </p>
        </div>
      </header>

      {error && (
        <p className="mt-4 rounded-sm bg-petal-soft px-4 py-3 text-small text-bark">{error}</p>
      )}

      <ul className="mt-6 flex flex-col gap-2">
        {orden.map((familia) => {
          const editando = abierta === familia.key
          /** Ésta va en la mano; lo que se ve aquí es el hueco que ha dejado. */
          const hueca = moviendo === familia.key

          return (
            <li
              key={familia.key}
              {...fila(familia.key, editando)}
              className={`cursor-pointer rounded-sm border px-4 py-3 transition-colors duration-300 ${
                hueca
                  ? 'border-dashed border-line'
                  : editando
                    ? 'border-sage bg-sage-deep/6'
                    : 'border-line hover:border-sage hover:bg-sage-deep/6'
              }`}
              /* La fila entera es el interruptor: cerrada se abre y abierta se
                 cierra, se pinche donde se pinche. Lo único que no cierra es el
                 formulario de dentro —lo marca `data-formulario`—, porque ahí se
                 está escribiendo y un clic en un campo no puede recoger la mesa. */
              onClick={(evento) => {
                if (dentroDelFormulario(evento.target)) return
                if (editando) setAbierta(null)
                else abrir(familia)
              }}
              // Y con el teclado, que también se usa: sin esto la fila sería un
              // interruptor al que sólo llega el ratón. La misma cautela: dentro
              // del formulario, la barra espaciadora escribe un espacio.
              role="button"
              aria-expanded={editando}
              tabIndex={0}
              onKeyDown={(evento) => {
                if (dentroDelFormulario(evento.target)) return
                if (evento.key !== 'Enter' && evento.key !== ' ') return
                evento.preventDefault()
                if (editando) setAbierta(null)
                else abrir(familia)
              }}
            >
              {/* Invisible y no `hidden`: el hueco tiene que medir exactamente lo
                  que mide la fila, o la lista daría un salto al empezar a mover. */}
              <div className={`flex flex-wrap items-center gap-4 ${hueca ? 'invisible' : ''}`}>
                {/* Con el ratón es sólo la señal —la fila entera se arrastra—, y con
                    el dedo es por donde se coge. Ver `useReordenar`. */}
                <Asa fijo={editando} {...asa(familia.key, editando)} className="-my-2 -ml-3 p-2" />

                {familia.thumb ? (
                  // La miniatura es la foto de su primera pieza, como en la tienda.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={familia.thumb}
                    alt=""
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                    className="size-16 flex-none rounded-sm object-cover"
                  />
                ) : (
                  <span className="size-16 flex-none rounded-sm border border-dashed border-line" />
                )}

                <div className="flex min-w-40 flex-1 flex-col gap-1">
                  <span className="text-bark">
                    {familia.label.es}
                    <span className="text-small text-bark-faint"> · {familia.label.gl}</span>
                  </span>
                  <span className="text-small text-bark-soft">
                    {familia.intro.es || 'Sin frase de cabecera'}
                  </span>
                </div>

                <span className="text-small text-bark-faint">
                  {familia.piezas === 0
                    ? 'sin piezas'
                    : `${familia.piezas} · ${familia.publicadas} en la tienda`}
                </span>
              </div>

              {editando && campos && (
                <div
                  data-formulario
                  className="mt-4 flex cursor-auto flex-col gap-4 border-t border-line pt-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-1">
                      <span className="eyebrow">Nombre</span>
                      <input
                        className="field"
                        value={campos.label.es}
                        onChange={(evento) =>
                          setCampos({
                            ...campos,
                            label: { ...campos.label, es: evento.target.value },
                          })
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="eyebrow">Nome en galego</span>
                      <input
                        className="field"
                        value={campos.label.gl}
                        onChange={(evento) =>
                          setCampos({
                            ...campos,
                            label: { ...campos.label, gl: evento.target.value },
                          })
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="eyebrow">En el botón «Ver más …»</span>
                      <input
                        className="field"
                        value={campos.plural.es}
                        onChange={(evento) =>
                          setCampos({
                            ...campos,
                            plural: { ...campos.plural, es: evento.target.value },
                          })
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="eyebrow">Ídem en galego</span>
                      <input
                        className="field"
                        value={campos.plural.gl}
                        onChange={(evento) =>
                          setCampos({
                            ...campos,
                            plural: { ...campos.plural, gl: evento.target.value },
                          })
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1 md:col-span-2">
                      <span className="eyebrow">La frase que encabeza su página</span>
                      <input
                        className="field"
                        value={campos.intro.es}
                        onChange={(evento) =>
                          setCampos({
                            ...campos,
                            intro: { ...campos.intro, es: evento.target.value },
                          })
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1 md:col-span-2">
                      <span className="eyebrow">Ídem en galego</span>
                      <input
                        className="field"
                        value={campos.intro.gl}
                        onChange={(evento) =>
                          setCampos({
                            ...campos,
                            intro: { ...campos.intro, gl: evento.target.value },
                          })
                        }
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => guardarCampos(familia)}
                      disabled={trabajando}
                      className="btn btn-sm"
                    >
                      Guardar
                    </button>
                    <button type="button" onClick={() => setAbierta(null)} className="btn btn-sm">
                      Cancelar
                    </button>

                    {/* Quitar vive aquí y no en la fila cerrada: es lo más gordo
                        que se le puede hacer a una familia y no debe estar a un
                        clic de distancia mientras se pasa la vista por la lista.
                        Hay que abrirla primero, que es como decir «ésta». */}
                    <button
                      type="button"
                      onClick={() => {
                        setQuitando(familia)
                        setConfirmacion('')
                        setDestino(orden.find((otra) => otra.key !== familia.key)?.key ?? '')
                      }}
                      className="ml-auto inline-flex min-h-9 items-center justify-center rounded-full border border-amapola px-[1.15rem] text-small tracking-[0.1em] text-amapola uppercase transition-colors duration-500 hover:bg-amapola hover:text-linen"
                    >
                      Quitar la familia
                    </button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {/* Nueva familia */}
      <div className="mt-6 flex flex-wrap items-end gap-4 rounded-sm border border-dashed border-line px-4 py-4">
        <label className="flex flex-1 flex-col gap-1">
          <span className="eyebrow">Nueva familia</span>
          <input
            className="field"
            value={nombreNuevo}
            onChange={(evento) => setNombreNuevo(evento.target.value)}
            placeholder="Broches, por ejemplo"
          />
        </label>
        <button
          type="button"
          disabled={trabajando || nombreNuevo.trim() === ''}
          onClick={() =>
            pedir({
              titulo: `¿Creamos la familia «${nombreNuevo.trim()}»?`,
              detalle:
                'Nace vacía y sin salir en la tienda: aparece en cuanto tenga una pieza publicada dentro.',
              boton: 'Crear',
              accion: async () => {
                const resultado = await nuevaFamilia(nombreNuevo)
                if (resultado.ok) setNombreNuevo('')
                return resultado
              },
            })
          }
          className="btn btn-sm bg-sage-deep text-linen"
        >
          Crear
        </button>
        <p className="w-full text-small text-bark-faint">
          Nace vacía y sin salir en la tienda: aparece en cuanto tenga una pieza publicada dentro.
        </p>
      </div>

      {/* Temporal, sólo con ?depurar=1 */}
      <MedidorArrimo />

      <VeloDeSoltar visible={arrastrando} prohibido />

      <Confirmar
        peticion={peticion}
        trabajando={trabajando}
        onCancelar={cancelar}
        onConfirmar={confirmar}
      />

      {/* Quitar una familia */}
      {quitando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bark/45 p-6 backdrop-blur-md">
          <div className="panel w-full max-w-md bg-linen text-left shadow-[0_24px_60px_rgba(44,40,35,0.22)]">
            <h3 className="font-serif text-2xl">¿Quitamos «{quitando.label.es}»?</h3>
            <p className="mt-3 text-small text-bark-soft">
              {quitando.piezas === 0
                ? 'No tiene piezas dentro, así que no hay nada más que decidir.'
                : `Tiene ${quitando.piezas} ${
                    quitando.piezas === 1 ? 'pieza' : 'piezas'
                  } dentro. No se borra ninguna foto: dime sólo dónde las dejo.`}
            </p>

            {quitando.piezas > 0 && (
              <div className="mt-4 flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                  <span className="eyebrow">Moverlas a</span>
                  <select
                    className="field"
                    value={destino}
                    onChange={(evento) => setDestino(evento.target.value)}
                  >
                    <option value="">Dejarlas en borrador</option>
                    {orden
                      .filter((otra) => otra.key !== quitando.key)
                      .map((otra) => (
                        <option key={otra.key} value={otra.key}>
                          {otra.label.es}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
            )}

            {/* La tranca.
                Quitar una familia no se deshace, y el botón está a un clic de la
                pantalla donde se renombra. Escribir el nombre a mano no es
                burocracia: es la única forma de que el gesto no se pueda hacer
                sin querer, y de que quien lo hace haya leído qué familia es. */}
            <label className="mt-5 flex flex-col gap-2 border-t border-line pt-5">
              <span className="text-small text-bark-soft">
                Para confirmar, escribe{' '}
                <span className="text-bark">{`Borrar:${quitando.label.es}`}</span>
              </span>
              <input
                className="field"
                value={confirmacion}
                onChange={(evento) => setConfirmacion(evento.target.value)}
                placeholder={`Borrar:${quitando.label.es}`}
                autoComplete="off"
                spellCheck={false}
              />
            </label>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setQuitando(null)} className="btn btn-sm">
                Dejarlo
              </button>
              <button
                type="button"
                disabled={trabajando || confirmacion.trim() !== `Borrar:${quitando.label.es}`}
                onClick={() =>
                  empezar(async () => {
                    const resultado = await borrarFamilia(
                      quitando.key,
                      destino ? { mover: destino } : { aBorrador: true },
                    )
                    if (!resultado.ok) setError(resultado.error)
                    else {
                      setQuitando(null)
                      router.refresh()
                    }
                  })
                }
                className="inline-flex min-h-9 items-center justify-center rounded-full border border-amapola px-[1.15rem] text-small tracking-[0.1em] text-amapola uppercase transition-colors duration-500 hover:bg-amapola hover:text-linen disabled:cursor-not-allowed disabled:border-line disabled:bg-transparent disabled:text-bark-faint"
              >
                Quitar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
