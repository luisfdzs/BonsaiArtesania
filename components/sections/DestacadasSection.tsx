import { Escaparate, type EscaparateFamilia } from '@/components/sections/Escaparate'
import { categories, HOME_PREVIEW_SIZE, products, productsByCategory } from '@/content/products'
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
export function DestacadasSection({ locale }: { locale: Locale }) {
  const t = translator(locale)

  const conPiezas = categories
    .map((category) => ({ ...category, items: productsByCategory(category.key) }))
    .filter((category) => category.items.length > 0)

  // Las piezas marcadas como destacadas abren su familia; el orden del catálogo
  // decide el resto. Así la portada sigue enseñando lo que Ana quiere enseñar,
  // pero repartido por familia en vez de en un montón.
  const muestra = (items: typeof products) =>
    [...items]
      .sort((a, b) => Number(b.featured) - Number(a.featured))
      .slice(0, HOME_PREVIEW_SIZE)
      .map(({ slug, name, summary, image }) => ({ slug, name, summary, image }))

  const familias: EscaparateFamilia[] = conPiezas.map((category) => ({
    key: category.key,
    label: t(category.label),
    href: path(locale, `/tienda/categoria/${category.key}`),
    verMasLabel: `${t({ es: 'Ver todos los', gl: 'Ver todos os' })} ${t(category.plural)}`,
    items: muestra(category.items),
  }))

  return (
    /* El `pt` no es decoración: sin él la sección arrancaba pegada al borde del
       hero. Mientras la portada era aire y titular se disimulaba, pero contra un
       vídeo a sangre el filete de «Piezas destacadas» parece parte del hero en
       vez del principio de lo siguiente.

       Pero tampoco el `--spacing-section` entero, que es lo que había: ese aire
       es el que separa dos secciones de texto, y aquí lo de arriba es un vídeo a
       sangre que ya termina en un borde limpio. Doce rem de lino en blanco entre
       el hero y la primera pieza dejaban la portada como si le faltara algo justo
       ahí. Con dos tercios, la sección sigue empezando y no cuelga del hero. */
    <section className="page-gutter pt-[clamp(3.5rem,8vw,8rem)]">
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
