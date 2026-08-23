'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState, useTransition } from 'react'
import {
  borrarFamilia,
  colocarFamilias,
  guardarDatosDeFamilia,
  nuevaFamilia,
} from '@/app/[locale]/gestion/catalogo/actions'
import { BotonAtras } from '@/components/gestion/BotonAtras'
import { Confirmar, type Peticion } from '@/components/gestion/Confirmar'
import { EncuadreFotos } from '@/components/gestion/EncuadreFotos'
import { VeloDeSoltar } from '@/components/gestion/VeloDeSoltar'
import type { FamiliaPanel } from '@/lib/catalogo-panel'
import type { Locale, Localized } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { useSoltarFotos, type Soltada } from '@/lib/useSoltarFotos'

/**
 * LAS FAMILIAS DEL CATÁLOGO
 *
 * Crear, renombrar, ordenar y quitar. El orden de esta lista es el del carril de
 * la tienda y el del escaparate de la portada, así que se arrastra igual que las
 * piezas: se mueve al arrastrar y se guarda al soltar.
 *
 * Quitar una familia nunca borra sus piezas. Se elige qué pasa con ellas —se
 * mudan a otra familia o se quedan en borrador— y no hay una tercera salida
 * silenciosa. Ver `quitarFamilia` en `lib/catalogo-escritura.ts`.
 */

type Props = { locale: Locale; familias: FamiliaPanel[] }

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
  const [orden, setOrden] = useState<FamiliaPanel[]>(familias)
  const [abierta, setAbierta] = useState<string | null>(null)
  const [campos, setCampos] = useState<Campos | null>(null)
  /** Lo que está esperando un «sí». Ver `Confirmar`. */
  const [peticion, setPeticion] = useState<Peticion | null>(null)
  const [quitando, setQuitando] = useState<FamiliaPanel | null>(null)
  /** Lo escrito en la tranca del borrado de una familia. */
  const [confirmacion, setConfirmacion] = useState('')
  const [destino, setDestino] = useState<string>('')
  const [moviendo, setMoviendo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [trabajando, empezar] = useTransition()
  /** Las fotos recién soltadas encima de una familia, camino del encuadre. */
  const [ficheros, setFicheros] = useState<{
    familia: string
    label: string
    lista: File[]
  } | null>(null)
  const arrastrada = useRef<string | null>(null)

  /**
   * Soltar fotos añade piezas a la familia abierta, al final de su rejilla.
   *
   * **Sólo la abierta las recibe**, y por eso da igual dónde caigan: mientras se
   * arrastra, la pantalla entera es rosa y no hay ninguna tarjeta que señalar.
   * Aquí las familias están una debajo de otra y son todas iguales; apuntar a
   * una sin querer sería fácil, así que abrirla primero es decir «ésta».
   *
   * La cara de la familia **no** se decide aquí: es la primera foto de su
   * primera pieza, y se cambia en el catálogo poniendo otra pieza la primera.
   */
  const alSoltar = useCallback(
    ({ ficheros: lista, sobre }: Soltada) => {
      if (ficheros) return

      if (lista.length === 0) {
        setError('Eso no eran fotos. Sirven JPG, PNG y webp.')
        return
      }

      const familia = familias.find((una) => una.key === abierta)

      if (!familia) {
        setError('Abre primero la familia a la que quieras añadirle piezas, y suelta las fotos.')
        return
      }

      setError(null)
      setFicheros({ familia: familia.key, label: familia.label.es, lista })
    },
    [abierta, familias, ficheros],
  )

  const { arrastrando } = useSoltarFotos(alSoltar, { permitido: Boolean(abierta) })

  /** La que está abierta, que es la única que puede recibir una foto. */
  const abiertaAhora = familias.find((una) => una.key === abierta)

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

  function mover(sobre: string) {
    const origen = arrastrada.current
    if (!origen || origen === sobre) return

    setOrden((previas) => {
      const desde = previas.findIndex((familia) => familia.key === origen)
      const hasta = previas.findIndex((familia) => familia.key === sobre)
      if (desde === -1 || hasta === -1) return previas

      const copia = [...previas]
      const [movida] = copia.splice(desde, 1)
      if (!movida) return previas
      copia.splice(hasta, 0, movida)
      return copia
    })
  }

  function guardarOrden() {
    arrastrada.current = null
    setMoviendo(null)

    const keys = orden.map((familia) => familia.key)
    if (keys.join() === familias.map((familia) => familia.key).join()) return

    pedir({
      titulo: '¿Guardamos el orden nuevo?',
      detalle:
        'Es el orden del carril de la tienda y el del escaparate de la portada. Si dices que no, la lista vuelve a como estaba.',
      boton: 'Guardar el orden',
      accion: () => colocarFamilias(keys),
      // Al arrastrar ya se ha movido lo que se ve; decir que no tiene que
      // devolverlo a su sitio, no dejarlo mintiendo.
      alCancelar: () => setOrden(familias),
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
            del escaparate de la portada.
          </p>
        </div>
      </header>

      {error && (
        <p className="mt-4 rounded-sm bg-petal-soft px-4 py-3 text-small text-bark">{error}</p>
      )}

      <ul className="mt-6 flex flex-col gap-2">
        {orden.map((familia) => {
          const editando = abierta === familia.key

          return (
            <li
              key={familia.key}
              draggable={!editando}
              onDragStart={() => {
                arrastrada.current = familia.key
                setMoviendo(familia.key)
              }}
              onDragEnter={() => mover(familia.key)}
              onDragOver={(evento) => evento.preventDefault()}
              onDragEnd={guardarOrden}
              onDrop={guardarOrden}
              className={`cursor-pointer rounded-sm border px-4 py-3 transition-colors duration-300 ${
                editando
                  ? 'border-sage bg-sage-deep/6'
                  : 'border-line hover:border-sage hover:bg-sage-deep/6'
              } ${moviendo === familia.key ? 'opacity-60' : ''}`}
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
              <div className="flex flex-wrap items-center gap-4">
                {familia.thumb ? (
                  // La miniatura es la foto de su primera pieza, como en la tienda.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={familia.thumb}
                    alt=""
                    draggable={false}
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

      <VeloDeSoltar
        visible={arrastrando}
        prohibido={!abiertaAhora}
        titulo={`Suelta tus fotos en ${abiertaAhora?.label.es ?? ''}`}
        detalle="Cada foto se convierte en una pieza y se coloca la última de esta familia. Nacen en borrador: no salen a la tienda hasta que las publiques."
      />

      {ficheros && (
        <EncuadreFotos
          destino={{ tipo: 'familia', familia: ficheros.familia, label: ficheros.label }}
          ficheros={ficheros.lista}
          onCerrar={() => setFicheros(null)}
          onHecho={() => {
            setFicheros(null)
            router.refresh()
          }}
        />
      )}

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
