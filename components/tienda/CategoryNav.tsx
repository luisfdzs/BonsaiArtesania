import { cn } from '@/lib/cn'
import { categories, productsByCategory } from '@/content/products'
import { translator, type Locale } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { ShopRail } from './ShopRail'
import { ShopTab } from './ShopTab'

type Props = {
  /** Familia que se está viendo; en `/tienda` no hay ninguna activa. */
  current?: string
  /**
   * La barra vive fuera de la tienda —en la portada—, así que no hay familia
   * abierta y «Todo» tampoco lo está: es un índice para entrar, no para decir
   * dónde se está. Sin esto, sin `current`, «Todo» se marcaría con
   * `aria-current="page"` en una página que no es `/tienda`.
   */
  outside?: boolean
  locale: Locale
  className?: string
}

/**
 * Índice de subsecciones. Con el catálogo entero publicado la tienda es larga,
 * así que hace falta una forma de saltar a una familia sin bajar por todas las
 * demás. Va en `/tienda` y también dentro de cada subsección, para poder pasar
 * de una a otra sin volver atrás.
 *
 * Es una barra y no la fila de botones que había antes: ocho píldoras seguidas
 * pesaban más que el catálogo que anunciaban y ninguna decía en cuál se estaba
 * sin mirar dos veces. Aquí el único adorno es el filete de la barra, que cambia
 * de color bajo la familia abierta. Y se queda pegada bajo la cabecera al bajar,
 * que es cuando de verdad sirve: a mitad de una familia larga, sin tener que
 * volver arriba para cambiar de una. Ver `shop-nav` en `globals.css`.
 *
 * Las familias vacías no se listan: un enlace a una página sin piezas es una vía
 * muerta. Y la que se está viendo se queda como texto, no como enlace a sí misma.
 */
export function CategoryNav({ current, outside = false, locale, className }: Props) {
  const t = translator(locale)
  const visible = categories.filter((category) => productsByCategory(category.key).length > 0)

  return (
    <nav
      aria-label={t({ es: 'Familias de la tienda', gl: 'Familias da tenda' })}
      className={cn('shop-nav', className)}
    >
      <ShopRail>
        {/* «Todo» abre la fila y no se distingue del resto: es una familia más
            —la de todas—, no la acción principal de la barra. */}
        <ShopTab
          href={path(locale, '/tienda')}
          label={t({ es: 'Todo', gl: 'Todo' })}
          active={!current && !outside}
        />

        {visible.map((category) => (
          <ShopTab
            key={category.key}
            href={path(locale, `/tienda/categoria/${category.key}`)}
            label={t(category.label)}
            active={category.key === current}
          />
        ))}
      </ShopRail>
    </nav>
  )
}

/*
 * Cada entrada es sólo su rótulo. Llevó un tiempo el número de piezas al lado,
 * para saber antes de entrar si detrás de un rótulo había veinte o dos, pero en
 * una barra de ocho eran ocho cifras que no se leen y que había que saltarse para
 * llegar a los nombres. Y ponerle un número a cada familia acercaba el taller a un
 * inventario. Cuántas hay se ve bajando, que es lo que se hace en la tienda.
 *
 * La entrada en sí vive en `ShopTab`, que es de cliente: el clic no recarga la
 * página, cambia sólo la rejilla. Aquí se queda lo que se puede resolver en el
 * servidor —qué familias hay y cuál está abierta—, que es lo que evita mandar al
 * navegador el catálogo entero.
 */
