import Link from 'next/link'
import { CategoryNav } from '@/components/tienda/CategoryNav'
import { ProductGrid } from '@/components/tienda/ProductGrid'
import { Reveal } from '@/components/ui/Reveal'
import { categories, HOME_PREVIEW_SIZE, productsByCategory } from '@/content/products'
import { translator, type Locale } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'

/**
 * El escaparate de la portada, justo debajo del hero.
 *
 * Antes era una rejilla suelta con las piezas marcadas como `featured`, todas
 * revueltas: se veía qué hace el taller pero no **qué tipos de cosa** hace, y
 * quien buscaba pulseras no tenía forma de saber desde la portada que las hay.
 * Ahora la sección lleva la misma barra de familias que la tienda —el mismo
 * componente, no una copia— y enseña las primeras {@link HOME_PREVIEW_SIZE}
 * piezas de cada una. La portada pasa a ser el índice del catálogo, con muestra.
 *
 * La barra es de entrada y no de estado: aquí no estamos en ninguna familia, así
 * que va con `outside` y no marca ninguna. Cada rótulo lleva a su subsección de
 * la tienda, igual que dentro de `/tienda`.
 *
 * El botón único va al final, después de la última foto de la última familia, y
 * no uno por familia: el enlace por familia ya lo es su título, y siete botones
 * «Ver más …» en la portada la convertirían en una tienda con menos piezas en vez
 * de en la puerta de la tienda.
 */
export function DestacadasSection({ locale }: { locale: Locale }) {
  const t = translator(locale)

  const familias = categories
    .map((category) => ({ ...category, items: productsByCategory(category.key) }))
    .filter((category) => category.items.length > 0)

  return (
    /* El `pt` no es decoración: sin él la sección arrancaba pegada al borde del
       hero. Mientras la portada era aire y titular se disimulaba, pero contra un
       vídeo a sangre el filete de «Piezas destacadas» parece parte del hero en
       vez del principio de lo siguiente. `--spacing-section` es el mismo aire con
       el que entran las otras secciones, así que la página respira igual en los
       tres saltos. */
    <section className="page-gutter pt-(--spacing-section)">
      <div className="border-b border-line pb-4">
        <h2 className="eyebrow">{t({ es: 'Piezas destacadas', gl: 'Pezas destacadas' })}</h2>
      </div>

      <CategoryNav locale={locale} outside className="mt-10" />

      {familias.map((familia, index) => {
        // Las piezas marcadas como destacadas abren su familia; el orden del
        // catálogo decide el resto. Así la portada sigue enseñando lo que Ana
        // quiere enseñar, pero repartido por familia en vez de en un montón.
        const shown = [...familia.items]
          .sort((a, b) => Number(b.featured) - Number(a.featured))
          .slice(0, HOME_PREVIEW_SIZE)

        return (
          <div key={familia.key} className="mt-16">
            <div className="flex items-baseline justify-between gap-6 border-b border-line pb-4">
              {/* El título es el enlace a la familia, como en la tienda: quien ya
                  sabe qué busca no baja hasta el botón del final. */}
              <h3 className="eyebrow">
                <Link
                  href={path(locale, `/tienda/categoria/${familia.key}`)}
                  className="link-underline tap"
                >
                  {t(familia.label)}
                </Link>
              </h3>
              <p className="text-right text-small text-bark-faint">{t(familia.note)}</p>
            </div>

            {/* Sólo la primera rejilla de la portada entra en la carrera del LCP;
                las demás quedan muy por debajo del pliegue. */}
            <ProductGrid items={shown} locale={locale} priority={index === 0} />
          </div>
        )
      })}

      {/* Seguir a la tienda es lo que toca después de mirar la muestra, no antes:
          arriba, junto al encabezado, el enlace invitaba a saltarse justo lo que
          la sección venía a enseñar. Lo que ocupa el ancho es la fila, no el
          botón: centrado bajo la rejilla se ve desde cualquier columna, y
          estirarlo hasta el borde le habría dado un tamaño que no tiene ningún
          otro botón de la web. */}
      {/* «Ver más» a secas basta debajo de la rejilla, donde el destino se
          entiende por el sitio en el que está el botón. Fuera de contexto no, así
          que el `aria-label` conserva la frase completa: un lector de pantalla
          que recorra los enlaces de la página oiría «ver más» sin saber más de
          qué. */}
      <Reveal className="mt-16 flex flex-wrap justify-center gap-x-2 gap-y-3">
        <Link
          href={path(locale, '/tienda')}
          className="btn"
          aria-label={t({ es: 'Ver todas las piezas', gl: 'Ver todas as pezas' })}
        >
          {t({ es: 'Ver más', gl: 'Ver máis' })}
        </Link>
        {/* Los encargos ya no son una página aparte: viven en la sección de
            debajo, así que esto es un ancla de la propia portada. */}
        <Link href={path(locale, '/#encargos')} className="btn btn-quiet">
          {t({ es: 'Personalizar', gl: 'Personalizar' })}
        </Link>
      </Reveal>
    </section>
  )
}
