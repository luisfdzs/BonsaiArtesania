import type { ReactNode } from 'react'
import { ProductCard } from '@/components/sections/ProductCard'
import { Reveal } from '@/components/ui/Reveal'
import type { ProductCardData } from '@/content/products'
import type { Locale } from '@/lib/i18n/config'

type Props = {
  items: ProductCardData[]
  locale: Locale
  /** La primera tarjeta de la primera rejilla de la página es candidata a LCP. */
  priority?: boolean
  /**
   * Una celda más al final de la rejilla, en el hueco que dejan las piezas en la
   * última fila. Es para los botones del escaparate de la portada: puestos ahí
   * ocupan el sitio que iba a quedar vacío en vez de añadir una fila entera de
   * página. Ver `Escaparate`.
   */
  trailing?: ReactNode
  className?: string
}

/** La rejilla del catálogo. La misma en `/tienda` y en cada subsección. */
export function ProductGrid({ items, locale, priority = false, trailing, className }: Props) {
  return (
    <div className={className ?? 'mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3'}>
      {items.map((product, index) => (
        <Reveal key={product.slug} step={index % 3}>
          <ProductCard product={product} locale={locale} priority={priority && index === 0} />
        </Reveal>
      ))}
      {trailing}
    </div>
  )
}
