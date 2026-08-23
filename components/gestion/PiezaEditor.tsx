'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import {
  borrarFoto,
  despublicarPieza,
  guardarTextos,
  publicarPieza,
} from '@/app/[locale]/gestion/catalogo/actions'
import { BotonAtras } from '@/components/gestion/BotonAtras'
import { Confirmar, type Peticion } from '@/components/gestion/Confirmar'
import { ElegirFotos } from '@/components/gestion/ElegirFotos'
import { EncuadreFotos } from '@/components/gestion/EncuadreFotos'
import { VeloDeSoltar } from '@/components/gestion/VeloDeSoltar'
import type { PiezaPanel } from '@/lib/catalogo-panel'
import type { Locale, Localized } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { usePunteroGrueso } from '@/lib/usePunteroGrueso'
import { useSoltarFotos, type Soltada } from '@/lib/useSoltarFotos'

/**
 * LA PIEZA POR DENTRO
 *
 * Los textos de la ficha en los dos idiomas, la familia y las fotos.
 *
 * Los dos idiomas van **uno al lado del otro** y no en dos pestañas: en pestañas,
 * el galego es una pantalla que hay que acordarse de visitar y por eso se queda
 * sin escribir; al lado, se ve vacío mientras escribes el castellano. La tienda
 * cae al castellano cuando falta algo, así que un galego a medias nunca deja un
 * hueco de cara a quien lee, sólo un aviso de cara a Ana.
 *
 * Los párrafos se escriben en un cuadro de texto y se separan por líneas en
 * blanco, como se escribe en cualquier sitio. Nada de una caja por párrafo.
 */

type Props = {
  locale: Locale
  /** La familia desde la que se llegó, para que «volver» vuelva ahí. */
  volverA: string
  pieza: PiezaPanel
  familias: { key: string; label: string }[]
}

/** Los párrafos de la ficha ↔ un cuadro de texto con líneas en blanco. */
const aTexto = (parrafos: string[]) => parrafos.join('\n\n')
const aParrafos = (texto: string) =>
  texto
    .split(/\n{2,}/)
    .map((parrafo) => parrafo.trim())
    .filter(Boolean)

/** Los materiales ↔ una línea separada por comas. */
const aLinea = (lista: string[]) => lista.join(', ')
const aLista = (linea: string) =>
  linea
    .split(',')
    .map((uno) => uno.trim())
    .filter(Boolean)

export function PiezaEditor({ locale, volverA, pieza, familias }: Props) {
  const router = useRouter()
  const [nombre, setNombre] = useState<Localized>(pieza.name)
  const [resumen, setResumen] = useState<Localized>(pieza.summary)
  const [descripcion, setDescripcion] = useState({
    es: aTexto(pieza.description.es),
    gl: aTexto(pieza.description.gl),
  })
  const [materiales, setMateriales] = useState({
    es: aLinea(pieza.materials.es),
    gl: aLinea(pieza.materials.gl),
  })
  const [familia, setFamilia] = useState(pieza.familia)
  const [destacada, setDestacada] = useState(pieza.featured)
  const [aviso, setAviso] = useState<string | null>(null)
  const [guardado, setGuardado] = useState(false)
  /** Lo que está esperando un «sí». Ver `Confirmar`. */
  const [peticion, setPeticion] = useState<Peticion | null>(null)
  const [trabajando, empezar] = useTransition()

  const [ficheros, setFicheros] = useState<{ lista: File[]; reemplaza: string | null } | null>(null)

  /**
   * Soltar fotos en cualquier parte de la pantalla.
   *
   * El fondo significa «añádelas a esta pieza» y una foto ya subida significa
   * «cambia ésa». Lo segundo se marca con `data-soltar` en cada miniatura; ver
   * `useSoltarFotos`.
   */
  const alSoltar = useCallback(
    ({ ficheros: lista, sobre }: Soltada) => {
      if (ficheros) return

      if (lista.length === 0) {
        setAviso('Eso no eran fotos. Sirven JPG, PNG y webp.')
        return
      }

      const reemplaza = sobre?.startsWith('foto:') ? sobre.slice('foto:'.length) : null

      // Cambiar una foto es cambiar **una**: si se sueltan varias encima de una
      // que ya está, se usa la primera y se avisa, en vez de decidir por Ana.
      if (reemplaza && lista.length > 1) {
        setAviso('Sobre una foto sólo cabe una: he cogido la primera de las que soltaste.')
      } else {
        setAviso(null)
      }

      setFicheros({ lista: reemplaza ? lista.slice(0, 1) : lista, reemplaza })
    },
    [ficheros],
  )

  const { arrastrando, sobre } = useSoltarFotos(alSoltar)
  const apuntandoAFoto = Boolean(sobre?.startsWith('foto:'))
  /**
   * Con el dedo no hay de dónde arrastrar, así que las dos cosas que aquí se hacen
   * arrastrando —añadir una foto y cambiar una que ya está— tienen que poder
   * pedirse tocando. Salen por el mismo `alSoltar`: ver `ElegirFotos`.
   */
  const conElDedo = usePunteroGrueso()

  const volver = path(locale, `/gestion/catalogo/${volverA}`)
  /** El nombre de la familia de la que se venía, para decirlo en el botón. */
  const familiaDeVuelta = familias.find((una) => una.key === volverA)?.label ?? 'el catálogo'

  /** Nada se escribe sin preguntar: aquí sólo se deja la petición sobre la mesa. */
  function pedir(peticionNueva: Peticion, hecho?: () => void) {
    setAviso(null)
    setGuardado(false)
    setPeticion({
      ...peticionNueva,
      accion: async () => {
        const resultado = await peticionNueva.accion()
        if (resultado.ok) hecho?.()
        return resultado
      },
    })
  }

  function confirmar() {
    if (!peticion) return

    empezar(async () => {
      const resultado = await peticion.accion()
      if (!resultado.ok) setAviso(resultado.error ?? 'No he podido guardar el cambio.')
      setPeticion(null)
      if (resultado.ok) router.refresh()
    })
  }

  function guardar() {
    pedir(
      {
        titulo: '¿Guardamos los cambios?',
        detalle: publicada
          ? 'La pieza está en la tienda, así que se ven ahí en cuanto digas que sí.'
          : 'La pieza está en borrador: los cambios se guardan, pero no se ven en la tienda hasta que la publiques.',
        boton: 'Guardar',
        accion: () =>
          guardarTextos(pieza.slug, {
            name: nombre,
            summary: resumen,
            description: { es: aParrafos(descripcion.es), gl: aParrafos(descripcion.gl) },
            materials: { es: aLista(materiales.es), gl: aLista(materiales.gl) },
            familia,
            featured: destacada,
          }),
      },
      () => setGuardado(true),
    )
  }

  const publicada = pieza.status === 'publicada'

  return (
    <section className="mx-auto max-w-5xl text-left">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <BotonAtras href={volver}>Volver a {familiaDeVuelta}</BotonAtras>
          <h2 className="font-serif text-3xl leading-none">{nombre.es || 'Pieza sin nombre'}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {publicada ? (
            <span className="badge badge-sage">En la tienda</span>
          ) : (
            <span className="badge">Borrador</span>
          )}
          <button
            type="button"
            disabled={trabajando}
            onClick={() =>
              pedir(
                publicada
                  ? {
                      titulo: `¿Retiramos «${nombre.es}» de la tienda?`,
                      detalle:
                        'Deja de verse para quien entre. No se borra nada: se queda aquí en borrador, lista para volver.',
                      boton: 'Retirar',
                      accion: () => despublicarPieza(pieza.slug),
                    }
                  : {
                      titulo: `¿Publicamos «${nombre.es}»?`,
                      detalle:
                        'Sale a la tienda al momento, en su familia y en el sitio que ocupe en la rejilla.',
                      boton: 'Publicar',
                      accion: () => publicarPieza(pieza.slug),
                    },
              )
            }
            className="btn btn-sm"
          >
            {publicada ? 'Retirar de la tienda' : 'Publicar'}
          </button>
          <Link href={path(locale, `/tienda/${pieza.slug}`)} className="btn btn-sm">
            Ver en la tienda
          </Link>
        </div>
      </header>

      {aviso && (
        <p className="mt-4 rounded-sm bg-petal-soft px-4 py-3 text-small text-bark">{aviso}</p>
      )}
      {guardado && !aviso && (
        <p className="mt-4 text-small text-sage-deep">Guardado. Ya se ve en la tienda.</p>
      )}

      <VeloDeSoltar
        visible={arrastrando}
        titulo={apuntandoAFoto ? 'Cambiar esa foto' : 'Suelta tus fotos'}
        detalle={
          apuntandoAFoto
            ? 'La nueva ocupará su sitio en la lista. La vieja no se borra: los pedidos que ya la enseñaban la siguen enseñando.'
            : 'Se añaden a esta pieza. Si quieres cambiar una que ya está, pasa por encima de ella antes de soltar.'
        }
      />

      {/* Fotos. Sin manejadores de arrastre propios: el área de soltar es la
          ventana entera, y cada miniatura sólo se marca como sitio con
          significado. Ver `useSoltarFotos`. */}
      <div className="mt-8 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="eyebrow">Fotos</span>
          <span className="text-micro normal-case tracking-normal text-bark-faint">
            {conElDedo
              ? 'toca el hueco para añadir, o el lápiz de una foto para cambiarla'
              : 'suéltalas donde quieras para añadirlas, o encima de una para cambiarla'}
          </span>
        </div>

        <ul className="flex flex-wrap gap-3">
          {pieza.fotos.map((foto, indice) => (
            <li
              key={foto.id}
              data-soltar={`foto:${foto.id}`}
              /* Apuntada, la miniatura sube por encima del velo: si se quedara
                 debajo, el velo taparía justo lo que se está señalando. */
              className={`relative rounded-sm ${
                sobre === `foto:${foto.id}` ? 'z-50 outline-2 outline-dashed outline-sage-deep' : ''
              }`}
            >
              {/* Ya viene recortada y en webp desde el almacén. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto.src}
                alt=""
                draggable={false}
                loading="lazy"
                decoding="async"
                className="size-28 rounded-sm object-cover"
              />
              {sobre === `foto:${foto.id}` && (
                <span className="absolute inset-0 z-50 flex items-center justify-center rounded-sm bg-linen/90 text-center text-micro text-sage-deep">
                  cambiar
                  <br />
                  ésta
                </span>
              )}
              {indice === 0 && (
                <span className="absolute inset-x-0 bottom-0 bg-sage-deep/90 py-0.5 text-center text-micro text-linen">
                  Portada
                </span>
              )}
              {/* Cambiar ésta. Con ratón se hace soltando encima —y por eso el
                  lápiz sólo sale donde no hay de dónde soltar—: dos formas de pedir
                  lo mismo, cada una donde tiene sentido. */}
              {conElDedo && (
                <ElegirFotos
                  una
                  alElegir={(lista) => alSoltar({ ficheros: lista, sobre: `foto:${foto.id}` })}
                  etiqueta="Cambiar esta foto"
                  className="absolute -bottom-2 -right-2 flex size-7 items-center justify-center rounded-full border border-line bg-linen text-bark-soft"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    aria-hidden="true"
                    className="size-3.5"
                  >
                    <path d="M4 20h4L18.5 9.5a2.1 2.1 0 00-3-3L5 17v3z" />
                  </svg>
                </ElegirFotos>
              )}

              {pieza.fotos.length > 1 && (
                <button
                  type="button"
                  disabled={trabajando}
                  onClick={() =>
                    pedir({
                      titulo: '¿Quitamos esta foto?',
                      detalle:
                        indice === 0
                          ? 'Es la que sale en la rejilla y en la portada: pasará a serlo la siguiente. La foto no se borra del almacén, así que los pedidos que la enseñaban la siguen enseñando.'
                          : 'La foto no se borra del almacén, así que los pedidos que la enseñaban la siguen enseñando.',
                      boton: 'Quitar la foto',
                      tono: 'peligro',
                      accion: () => borrarFoto(pieza.slug, foto.id),
                    })
                  }
                  aria-label="Quitar esta foto"
                  className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full border border-line bg-linen text-bark-soft"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    className="size-3.5"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              )}
            </li>
          ))}
          {/* El hueco de soltar, para que la zona exista aunque la pieza tenga
              una sola foto y no haya sitio libre a la vista. */}
          <li className="size-28">
            {/* El hueco es el botón: con ratón se sueltan fotos encima, con el dedo
                se toca y se abren las del teléfono. */}
            <ElegirFotos
              alElegir={(lista) => alSoltar({ ficheros: lista, sobre: null })}
              etiqueta="Añadir fotos a esta pieza"
              className="flex size-full flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-line px-2 text-center transition-colors duration-300 hover:border-sage hover:bg-sage-deep/6"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#93a188"
                strokeWidth={1.3}
                aria-hidden="true"
                className="size-5"
              >
                <path d="M12 16V4M8 8l4-4 4 4" />
                <path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
              </svg>
              <span className="text-micro normal-case tracking-normal text-bark-faint">
                {conElDedo ? 'añadir foto' : 'soltar foto'}
              </span>
            </ElegirFotos>
          </li>
        </ul>
      </div>

      {/* Textos */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="eyebrow">Nombre</span>
          <input
            className="field"
            value={nombre.es}
            onChange={(evento) => setNombre({ ...nombre, es: evento.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="eyebrow">Nome en galego</span>
          <input
            className="field"
            value={nombre.gl}
            onChange={(evento) => setNombre({ ...nombre, gl: evento.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="eyebrow">Una línea, encima del título</span>
          <input
            className="field"
            value={resumen.es}
            onChange={(evento) => setResumen({ ...resumen, es: evento.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="eyebrow">Ídem en galego</span>
          <input
            className="field"
            value={resumen.gl}
            onChange={(evento) => setResumen({ ...resumen, gl: evento.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="eyebrow">La ficha · un párrafo por bloque</span>
          <textarea
            rows={7}
            className="field resize-y"
            value={descripcion.es}
            onChange={(evento) => setDescripcion({ ...descripcion, es: evento.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="eyebrow">A ficha en galego</span>
          <textarea
            rows={7}
            className="field resize-y"
            value={descripcion.gl}
            onChange={(evento) => setDescripcion({ ...descripcion, gl: evento.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="eyebrow">Materiales, separados por comas</span>
          <input
            className="field"
            value={materiales.es}
            onChange={(evento) => setMateriales({ ...materiales, es: evento.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="eyebrow">Ídem en galego</span>
          <input
            className="field"
            value={materiales.gl}
            onChange={(evento) => setMateriales({ ...materiales, gl: evento.target.value })}
          />
        </label>
      </div>

      {/* Lo demás */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="eyebrow">Familia</span>
          <select
            className="field"
            value={familia}
            onChange={(evento) => setFamilia(evento.target.value)}
          >
            {familias.map((una) => (
              <option key={una.key} value={una.key}>
                {una.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-3 pt-6">
          <input
            type="checkbox"
            checked={destacada}
            onChange={(evento) => setDestacada(evento.target.checked)}
            className="size-4 accent-sage-deep"
          />
          <span className="flex flex-col">
            <span className="text-small text-bark">Abre su familia en la portada</span>
            <span className="text-micro normal-case tracking-normal text-bark-faint">
              De las destacadas sale la muestra del escaparate
            </span>
          </span>
        </label>
      </div>

      <div className="mt-8 flex items-center gap-3 border-t border-line pt-6">
        <button
          type="button"
          onClick={guardar}
          disabled={trabajando}
          className="btn bg-sage-deep text-linen"
        >
          {trabajando ? 'Guardando…' : 'Guardar'}
        </button>
        <Link href={volver} className="btn">
          Volver
        </Link>
      </div>

      <Confirmar
        peticion={peticion}
        trabajando={trabajando}
        onCancelar={() => setPeticion(null)}
        onConfirmar={confirmar}
      />

      {ficheros && (
        <EncuadreFotos
          destino={
            ficheros.reemplaza
              ? {
                  tipo: 'reemplazo',
                  slug: pieza.slug,
                  nombre: nombre.es,
                  fotoId: ficheros.reemplaza,
                }
              : { tipo: 'pieza', slug: pieza.slug, nombre: nombre.es }
          }
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
