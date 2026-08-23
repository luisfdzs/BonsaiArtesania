import { notFound } from 'next/navigation'
import { CatalogoFamilia } from '@/components/gestion/CatalogoFamilia'
import { almacenListo } from '@/lib/almacen'
import { familiasDelPanel, piezasDelPanel } from '@/lib/catalogo-panel'
import type { Locale } from '@/lib/i18n/config'
import { pick } from '@/lib/i18n/config'

/**
 * El espacio de fotos de una familia, montado una sola vez para los dos sitios
 * que lo enseñan: `/gestion/catalogo`, que abre la primera, y
 * `/gestion/catalogo/<familia>`, que abre la que se pida.
 *
 * Vivía sólo en la segunda, y la primera **redirigía** a ella. Eso hacía que
 * entrar al catálogo desde la barra fueran dos navegaciones seguidas: la flor de
 * espera terminaba con la primera y la segunda empezaba sin nada que enseñar, así
 * que quedaba un hueco con el catálogo vacío. Ahora la primera pinta directamente,
 * sin rebote.
 */
export async function VistaDeFamilia({ locale, familia }: { locale: Locale; familia: string }) {
  const familias = await familiasDelPanel()
  const actual = familias.find((una) => una.key === familia)
  if (!actual) notFound()

  const piezas = await piezasDelPanel(familia)

  // La `key` lleva dentro lo que se ve: al subir, publicar, ordenar o borrar algo,
  // cambia y el componente se monta de nuevo con los datos frescos. Es la forma
  // simple de que el orden a medio arrastrar no sobreviva a un cambio del
  // servidor —ver la nota en `CatalogoFamilia`—.
  const huella = piezas.map((pieza) => `${pieza.slug}:${pieza.status}`).join()

  return (
    <CatalogoFamilia
      key={`${familia}·${huella}`}
      locale={locale}
      familias={familias.map((una) => ({
        key: una.key,
        label: pick(una.label, locale),
        piezas: una.piezas,
        publicadas: una.publicadas,
        thumb: una.thumb,
        hidden: una.hidden,
      }))}
      familia={{ key: actual.key, label: pick(actual.label, locale) }}
      piezas={piezas.map((pieza) => ({
        slug: pieza.slug,
        nombre: pick(pieza.name, locale),
        estado: pieza.status,
        avisos: pieza.avisos,
        foto: pieza.fotos[0]?.src ?? null,
      }))}
      almacenListo={almacenListo()}
    />
  )
}
