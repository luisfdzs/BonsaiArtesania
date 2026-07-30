import Link from 'next/link'
import { cn } from '@/lib/cn'
import { categories, productsByCategory } from '@/content/products'

type Props = {
  /** Familia que se está viendo; en `/tienda` no hay ninguna activa. */
  current?: string
  className?: string
}

/**
 * Índice de subsecciones. Con el catálogo entero publicado la tienda es larga,
 * así que hace falta una forma de saltar a una familia sin bajar por todas las
 * demás. Va en `/tienda` y también dentro de cada subsección, para poder pasar
 * de una a otra sin volver atrás.
 *
 * Las familias vacías no se listan: un enlace a una página sin piezas es una vía
 * muerta. Y la que se está viendo se queda como texto, no como enlace a sí misma.
 */
export function CategoryNav({ current, className }: Props) {
  const visible = categories.filter((category) => productsByCategory(category.key).length > 0)

  return (
    <nav aria-label="Familias de la tienda" className={cn('flex flex-wrap gap-3', className)}>
      <Link
        href="/tienda"
        aria-current={current ? undefined : 'page'}
        className={cn('btn btn-sm', !current && 'border-sage-deep bg-sage-deep text-linen')}
      >
        Todo
      </Link>

      {visible.map((category) => {
        const active = category.key === current
        return (
          <Link
            key={category.key}
            href={`/tienda/categoria/${category.key}`}
            aria-current={active ? 'page' : undefined}
            className={cn('btn btn-sm', active && 'border-sage-deep bg-sage-deep text-linen')}
          >
            {category.label}
          </Link>
        )
      })}
    </nav>
  )
}
