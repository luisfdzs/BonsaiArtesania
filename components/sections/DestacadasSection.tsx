import { Escaparate, type EscaparateFamilia } from '@/components/sections/Escaparate'
import { HOME_PREVIEW_SIZE, todasLasFamilias, todasLasPiezas, type Pieza } from '@/lib/catalogo'
import { translator, type Locale } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'

/**
 * El escaparate de la portada, justo debajo del hero.
 *
 * Primero fue una rejilla suelta con las piezas marcadas como `featured`, todas
 * revueltas: se veía qué hace el taller pero no **qué tipos de cosa** hace.
 * Después, las siete familias enteras una debajo de otra, cada una con su
 * muestra: eso arreglaba el índice pero convirtió la portada en una segunda
 * tienda, veintiuna fotos que había que recorrer para llegar a los encargos.
 *
 * Ahora la barra de familias —la misma de la tienda, el mismo componente— **elige**
 * y se enseña sólo la familia elegida, con {@link HOME_PREVIEW_SIZE} piezas y un
 * botón al final. La portada vuelve a ser la puerta del catálogo: se entra por
 * donde se quiera, sin bajar por lo que no se busca.
 *
 * Aquí, en el servidor, se lee el catálogo y se recorta la muestra; el cambio de
 * familia lo hace {@link Escaparate} en el navegador. Lo que cruza son los
 * rótulos ya traducidos y cinco tarjetas por familia, nada más.
 */
export async function DestacadasSection({ locale }: { locale: Locale }) {
  const t = translator(locale)

  const [familiasDelCatalogo, piezas] = await Promise.all([todasLasFamilias(), todasLasPiezas()])
  const porFamilia = new Map<string, Pieza[]>()
  for (const pieza of piezas) {
    const lista = porFamilia.get(pieza.category)
    if (lista) lista.push(pieza)
    else porFamilia.set(pieza.category, [pieza])
  }

  const conPiezas = familiasDelCatalogo
    .map((category) => ({ ...category, items: porFamilia.get(category.key) ?? [] }))
    .filter((category) => category.items.length > 0)

  // Las piezas marcadas como destacadas abren su familia; el orden del catálogo
  // decide el resto. Así la portada sigue enseñando lo que Ana quiere enseñar,
  // pero repartido por familia en vez de en un montón.
  const muestra = (items: Pieza[]) =>
    [...items]
      .sort((a, b) => Number(b.featured) - Number(a.featured))
      .slice(0, HOME_PREVIEW_SIZE)
      .map(({ slug, name, image }) => ({ slug, name, image }))

  const familias: EscaparateFamilia[] = conPiezas.map((category) => {
    const primera = category.items[0]

    return {
      key: category.key,
      label: t(category.label),
      href: path(locale, `/tienda/categoria/${category.key}`),
      verMasLabel: `${t({ es: 'Ver todos los', gl: 'Ver todos os' })} ${t(category.plural)}`,
      // La miniatura de la barra de familias. Ver `FamilyFlow`.
      thumb: primera?.image ? t(primera.image) : null,
      items: muestra(category.items),
    }
  })

  return (
    /* El aire de arriba, corto a propósito.
       
       Aquí hubo primero un `--spacing-section` entero —doce rem de lino en blanco
       entre el vídeo y la primera pieza, que dejaban la portada como si le faltara
       algo— y después dos tercios de eso. Sigue siendo demasiado para lo que hay
       encima: al llegar al catálogo desde el «Catálogo» del hero, el carril de
       familias caía tres rem por debajo de la cabecera y la marca se quedaba sola
       flotando sobre el lino.
       
       Ahora es una rem, y fija: el carril sube a encontrarse con la marca, y la
       cabecera y el carrusel se leen como una sola pieza —el nombre del taller y sus
       familias—, que es lo que se quiere ver al aterrizar aquí.
       
       Fija y no un `clamp` porque el ancla de `page.tsx` la descuenta para que el
       aterrizaje caiga justo donde el carril se queda pegado a la cabecera: con un
       relleno que cambia con el ancho, ese descuento sólo sería exacto en un tamaño
       de pantalla. Si cambia este número, cambia allí. */
    <section className="page-gutter pt-4">
      <Escaparate
        familias={familias}
        locale={locale}
        navLabel={t({ es: 'Familias de la tienda', gl: 'Familias da tenda' })}
        verMas={t({ es: 'Ver más', gl: 'Ver máis' })}
        personalizar={t({ es: 'Personalizar', gl: 'Personalizar' })}
        personalizarHref={path(locale, '/#encargos')}
      />
    </section>
  )
}
