'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState, useTransition } from 'react'
import { AccionesDeFoto } from '@/components/gestion/AccionesDeFoto'
import { Confirmar, type Peticion } from '@/components/gestion/Confirmar'
import { VeloDeSoltar } from '@/components/gestion/VeloDeSoltar'
import { EncuadreFotos } from '@/components/gestion/EncuadreFotos'
import { borrarPieza, colocarPiezas } from '@/app/[locale]/gestion/catalogo/actions'
import type { Locale } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import type { ProductStatus } from '@/lib/schema'
import { useSoltarFotos, type Soltada } from '@/lib/useSoltarFotos'

/**
 * EL ESPACIO DE FOTOS DE UNA FAMILIA
 *
 * La pantalla donde Ana pasa el rato: a la izquierda sus familias, a la derecha
 * las piezas de la que tiene abierta.
 *
 * Dos arrastres distintos conviven aquí y conviene no confundirlos:
 *
 * 1. **Fotos que vienen de fuera** —del escritorio—. Se sueltan sobre la rejilla,
 *    y entonces se catalogan en la familia abierta, o sobre una familia del
 *    carril, y entonces van a ésa. Abren el encuadre antes de subir nada.
 * 2. **Tarjetas que ya están** —piezas—. Se arrastran entre ellas para cambiar el
 *    orden, que es el mismo orden que se ve en la tienda.
 *
 * Lo que distingue uno de otro es lo que trae el arrastre: `dataTransfer.types`
 * dice `Files` cuando vienen del escritorio. Sin esa comprobación, arrastrar una
 * tarjeta encendería la zona de soltar fotos.
 *
 * El orden se guarda al soltar, no al arrastrar: mientras se mueve, lo que cambia
 * es sólo lo que se ve.
 */

type FamiliaResumen = {
  key: string
  label: string
  piezas: number
  publicadas: number
  thumb: string | null
  hidden: boolean
}

type PiezaResumen = {
  slug: string
  nombre: string
  estado: ProductStatus
  avisos: ('sin-foto' | 'sin-galego')[]
  foto: string | null
}

type Props = {
  locale: Locale
  familias: FamiliaResumen[]
  familia: { key: string; label: string }
  piezas: PiezaResumen[]
  almacenListo: boolean
}

const AVISOS: Record<PiezaResumen['avisos'][number], string> = {
  'sin-foto': 'Sin foto',
  'sin-galego': 'Sin galego',
}

export function CatalogoFamilia({ locale, familias, familia, piezas, almacenListo }: Props) {
  const router = useRouter()
  /**
   * El orden que se ve mientras se arrastra. Nace con el que trae el servidor y
   * sólo lo cambia el arrastre.
   *
   * Cuando el servidor manda otras piezas —se ha subido una, se ha publicado
   * otra— este componente se **remonta**, porque la página le pone una `key` que
   * incluye lo que hay dentro. Antes esto se resolvía reajustando el estado
   * durante el render, que es un patrón legal pero que con la recarga en caliente
   * de Next hacía saltar un «Should not already be working» de React. Remontar es
   * más simple y no tiene ese filo.
   */
  const [orden, setOrden] = useState<PiezaResumen[]>(piezas)
  const [moviendo, setMoviendo] = useState<string | null>(null)
  const [ficheros, setFicheros] = useState<{
    familia: string
    label: string
    lista: File[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  /** Qué tarjeta tiene el abanico de opciones abierto. Sólo una a la vez. */
  const [abanico, setAbanico] = useState<string | null>(null)
  /** Lo que está esperando un «sí». Ver `Confirmar`. */
  const [peticion, setPeticion] = useState<Peticion | null>(null)
  const [guardando, empezar] = useTransition()
  const arrastrada = useRef<string | null>(null)

  /**
   * Soltar fotos, caigan donde caigan.
   *
   * El fondo significa «la familia que está abierta»; una familia del carril,
   * «catalógalas en ésa». Nada más tiene significado aquí: las tarjetas de las
   * piezas no reciben fotos, porque una foto suelta encima de una pieza es
   * ambigua —¿otra foto suya, o una pieza nueva?— y esa decisión se toma dentro
   * de la pieza, en su propia pantalla.
   */
  const alSoltar = useCallback(
    ({ ficheros: lista, sobre }: Soltada) => {
      // Con el encuadre abierto ya hay fotos en marcha; soltar más encima sólo
      // serviría para perder las que se estaban repasando.
      if (ficheros) return

      if (lista.length === 0) {
        setError('Eso no eran fotos. Sirven JPG, PNG y webp.')
        return
      }

      if (!almacenListo) {
        setError(
          'Todavía no hay dónde guardar las fotos. Hay que dar de alta el almacén antes de subir nada.',
        )
        return
      }

      const clave = sobre?.startsWith('familia:') ? sobre.slice('familia:'.length) : familia.key
      const destino = familias.find((una) => una.key === clave) ?? familia

      setError(null)
      setFicheros({ familia: destino.key, label: destino.label, lista })
    },
    [almacenListo, familia, familias, ficheros],
  )

  const { arrastrando, sobre } = useSoltarFotos(alSoltar)

  /** La familia que recibiría las fotos si se soltaran ahora mismo. */
  const familiaApuntada =
    (sobre?.startsWith('familia:')
      ? familias.find((una) => una.key === sobre.slice('familia:'.length))?.label
      : null) ?? familia.label

  function moverTarjeta(sobre: string) {
    const origen = arrastrada.current
    if (!origen || origen === sobre) return

    setOrden((previas) => {
      const desde = previas.findIndex((pieza) => pieza.slug === origen)
      const hasta = previas.findIndex((pieza) => pieza.slug === sobre)
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
    const slugs = orden.map((pieza) => pieza.slug)
    if (slugs.join() === piezas.map((pieza) => pieza.slug).join()) return

    setError(null)
    setPeticion({
      titulo: '¿Guardamos el orden nuevo?',
      detalle: `Es el orden en que se ven las piezas de ${familia.label} en la tienda. Si dices que no, la rejilla vuelve a como estaba.`,
      boton: 'Guardar el orden',
      accion: () => colocarPiezas(familia.key, slugs),
      // Al arrastrar ya se ha movido lo que se ve; decir que no tiene que
      // devolverlo a su sitio.
      alCancelar: () => setOrden(piezas),
    })
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

  function cancelar() {
    peticion?.alCancelar?.()
    setPeticion(null)
  }

  return (
    <section className="text-left">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-3xl leading-none">{familia.label}</h2>
          <p className="text-small text-bark-faint">
            {orden.length === 0
              ? 'Todavía no hay piezas aquí'
              : `${orden.length} ${orden.length === 1 ? 'pieza' : 'piezas'} · ${
                  orden.filter((pieza) => pieza.estado === 'publicada').length
                } en la tienda`}
          </p>
        </div>
        <p className="text-small text-bark-soft">
          Suelta fotos en cualquier parte de la pantalla y las convierto en piezas. Arrastra las
          tarjetas para ordenarlas: ese orden es el de la tienda.
        </p>
      </header>

      <VeloDeSoltar
        visible={arrastrando}
        titulo="Suelta tus fotos"
        detalle={`Se catalogan en ${familiaApuntada}. Si quieres otra familia, pasa por encima de la suya en la lista antes de soltar.`}
      />

      {error && (
        <p className="mt-4 rounded-sm bg-petal-soft px-4 py-3 text-small text-bark">{error}</p>
      )}

      <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-start">
        {/* Las familias */}
        <nav aria-label="Familias del catálogo" className="w-full flex-none md:w-64">
          {/* El rótulo ya dice «Familias»; el botón de al lado sólo tiene que decir
              qué se hace con ellas, y para eso basta el lápiz. Un botón ancho
              repitiendo la palabra era decirlo dos veces. */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="eyebrow">Familias</span>
            <Link
              href={path(locale, '/gestion/catalogo/familias')}
              aria-label="Editar las familias: crear, renombrar, ordenar y quitar"
              title="Editar las familias"
              className="flex size-11 items-center justify-center rounded-full border border-line text-bark-soft transition-colors duration-500 hover:border-sage-deep hover:text-sage-deep"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
                className="size-5"
              >
                <path d="M4 20h4L19 9l-4-4L4 16z" />
                <path d="M14.5 5.5l4 4" />
              </svg>
            </Link>
          </div>

          <ul className="flex flex-col gap-1">
            {familias.map((una) => {
              const activa = una.key === familia.key

              return (
                // `data-soltar` es lo que convierte esta fila en un sitio con
                // significado mientras se arrastran fotos: soltarlas aquí las
                // cataloga en esta familia y no en la abierta. Ver `useSoltarFotos`.
                <li
                  key={una.key}
                  data-soltar={`familia:${una.key}`}
                  /* Apuntada, la fila sube por encima del velo: si se quedara
                     debajo, el velo taparía justo lo que se está señalando. */
                  className={sobre === `familia:${una.key}` ? 'relative z-50' : undefined}
                >
                  <Link
                    href={path(locale, `/gestion/catalogo/${una.key}`)}
                    className={`flex items-center gap-3 rounded-sm border px-3 py-2 transition-colors duration-500 ${
                      sobre === `familia:${una.key}`
                        ? 'border-dashed border-sage-deep bg-linen'
                        : activa
                          ? 'border-transparent bg-sage-deep/8'
                          : 'border-transparent hover:bg-linen-deep'
                    }`}
                  >
                    {una.thumb ? (
                      // Miniatura de 36px del panel, servida ya optimizada desde
                      // el almacén: `next/image` aquí sólo añadiría peticiones.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={una.thumb} alt="" className="size-9 rounded-sm object-cover" />
                    ) : (
                      <span className="size-9 rounded-sm border border-dashed border-line" />
                    )}
                    <span className="flex flex-col">
                      <span className={`text-small ${activa ? 'text-sage-deep' : 'text-bark'}`}>
                        {una.label}
                      </span>
                      <span className="text-micro normal-case tracking-normal text-bark-faint">
                        {una.piezas === 0
                          ? 'sin piezas'
                          : `${una.piezas} · ${una.publicadas} en la tienda`}
                      </span>
                    </span>
                    {sobre === `familia:${una.key}` && (
                      <span className="ml-auto text-micro text-sage-deep">soltar aquí</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* La rejilla. Ya no tiene manejadores de arrastre propios: el área de
            soltar es la ventana entera y de eso se encarga `useSoltarFotos`. */}
        <div className="relative min-h-80 flex-1 p-1">
          <ul className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {orden.map((pieza) => (
              <li
                key={pieza.slug}
                draggable
                onDragStart={() => {
                  arrastrada.current = pieza.slug
                  setMoviendo(pieza.slug)
                }}
                onDragEnter={() => moverTarjeta(pieza.slug)}
                onDragOver={(evento) => {
                  // Sólo se acepta el arrastre de otra tarjeta. Las fotos que
                  // vienen de fuera las recoge la ventana entera, no esto.
                  if (!Array.from(evento.dataTransfer.types).includes('Files')) {
                    evento.preventDefault()
                  }
                }}
                onDragEnd={guardarOrden}
                onDrop={guardarOrden}
                className={`flex cursor-grab flex-col rounded-sm border border-line bg-linen active:cursor-grabbing ${
                  moviendo === pieza.slug ? 'opacity-60' : ''
                }`}
              >
                <div className="relative aspect-square overflow-hidden rounded-t-sm bg-linen-deep">
                  <button
                    type="button"
                    onClick={() => setAbanico(abanico === pieza.slug ? null : pieza.slug)}
                    aria-label={`Opciones de ${pieza.nombre}`}
                    aria-expanded={abanico === pieza.slug}
                    className="block size-full cursor-pointer"
                  >
                    {pieza.foto ? (
                      // La foto ya viene recortada y en webp desde el almacén: no hay
                      // nada más que optimizar, y esto es el panel, no la tienda.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pieza.foto}
                        alt=""
                        draggable={false}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-micro text-bark-faint">
                        sin foto
                      </span>
                    )}
                  </button>

                  <AccionesDeFoto
                    abierto={abanico === pieza.slug}
                    onCerrar={() => setAbanico(null)}
                    nombre={pieza.nombre}
                    verHref={path(locale, `/tienda/${pieza.slug}`)}
                    editarHref={path(locale, `/gestion/catalogo/${familia.key}/${pieza.slug}`)}
                    onBorrar={() => {
                      setAbanico(null)
                      setError(null)
                      setPeticion({
                        titulo: `¿Borramos «${pieza.nombre}»?`,
                        detalle:
                          'Se va del catálogo y del panel, y no se puede deshacer. Si sólo quieres que deje de verse en la tienda, retírala desde su pantalla: se queda aquí en borrador, lista para volver. Los pedidos antiguos que la incluyan se siguen leyendo enteros; sólo pierden su foto.',
                        boton: 'Borrar',
                        tono: 'peligro',
                        escribir: `Borrar:${pieza.nombre}`,
                        accion: () => borrarPieza(pieza.slug),
                      })
                    }}
                  />
                </div>

                <div className="flex flex-1 flex-col gap-2 px-3 py-3">
                  <span className="text-small text-bark">{pieza.nombre}</span>

                  {/* Sólo se dice lo que se sale de lo normal. Lo normal es estar
                      en la tienda y estar entera: una tarjeta con «En la tienda»
                      debajo de cada foto era veinte veces la misma palabra, y con
                      ella puesta en todas, no marcaba nada. Lo que queda debajo del
                      nombre es la excepción: que sea borrador o que le falte algo. */}
                  {(pieza.estado !== 'publicada' || pieza.avisos.length > 0) && (
                    <div className="flex flex-wrap items-center gap-2">
                      {pieza.estado !== 'publicada' && <span className="badge">Borrador</span>}
                      {pieza.avisos
                        .filter((aviso) => aviso !== 'sin-foto' || !pieza.foto)
                        .map((aviso) => (
                          <span key={aviso} className="text-micro text-bark-faint">
                            {AVISOS[aviso]}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </li>
            ))}

            {/* Donde se sueltan las fotos cuando la rejilla está vacía, y el
                recordatorio de que se puede cuando no lo está. */}
            <li className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-line px-4 text-center">
              <span className="text-small text-bark-soft">Añadir una pieza</span>
              <span className="text-micro normal-case tracking-normal text-bark-faint">
                suelta aquí una foto y la creo con ella
              </span>
            </li>
          </ul>
        </div>
      </div>

      <Confirmar
        peticion={peticion}
        trabajando={guardando}
        onCancelar={cancelar}
        onConfirmar={confirmar}
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
    </section>
  )
}
