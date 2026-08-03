import Link from 'next/link'
import { cn } from '@/lib/cn'
import { categories, productsByCategory } from '@/content/products'
import { translator, type Locale } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { ShopRail } from './ShopRail'

type Props = {
  /** Familia que se está viendo; en `/tienda` no hay ninguna activa. */
  current?: string
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
export function CategoryNav({ current, locale, className }: Props) {
  const t = translator(locale)
  const visible = categories
    .map((category) => ({ ...category, count: productsByCategory(category.key).length }))
    .filter((category) => category.count > 0)

  const total = visible.reduce((sum, category) => sum + category.count, 0)

  return (
    <nav
      aria-label={t({ es: 'Familias de la tienda', gl: 'Familias da tenda' })}
      className={cn('shop-nav', className)}
    >
      <ShopRail>
        {/* «Todo» abre la fila y no se distingue del resto: es una familia más
            —la de todas—, no la acción principal de la barra. */}
        <Tab
          href={path(locale, '/tienda')}
          label={t({ es: 'Todo', gl: 'Todo' })}
          count={total}
          active={!current}
        />

        {visible.map((category) => (
          <Tab
            key={category.key}
            href={path(locale, `/tienda/categoria/${category.key}`)}
            label={t(category.label)}
            count={category.count}
            active={category.key === current}
          />
        ))}
      </ShopRail>
    </nav>
  )
}

/**
 * Cada entrada lleva su número de piezas. Es el mismo dato que ya daba el botón
 * «Ver más …» del final de cada familia, pero antes de entrar: con la tienda
 * repartida en subsecciones conviene saber si detrás de un rótulo hay veinte
 * piezas o dos.
 */
function Tab({
  href,
  label,
  count,
  active,
}: {
  href: string
  label: string
  count: number
  active: boolean
}) {
  return (
    <Link href={href} aria-current={active ? 'page' : undefined} className="shop-tab">
      {label}
      <span className="shop-tab-count">{count}</span>
    </Link>
  )
}
