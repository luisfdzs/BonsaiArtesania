import type { ReactNode } from 'react'
import { ProductCard } from '@/components/sections/ProductCard'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/cn'
import type { PiezaTarjeta } from '@/lib/catalogo'
import type { Locale } from '@/lib/i18n/config'

/**
 * Las columnas del catálogo, sin margen propio.
 *
 * En móvil van dos columnas y muy juntas: así entran cuatro piezas en una
 * pantalla y el catálogo se recorre de un vistazo en vez de a un producto por
 * scroll. A partir de `sm` recupera el aire de siempre.
 */
export const productGridClass =
  'grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-8 sm:gap-y-16 lg:grid-cols-3'

type Props = {
  items: PiezaTarjeta[]
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
  /** Clases extra del contenedor (el margen superior lo pone quien la usa). */
  className?: string
}

/** La rejilla del catálogo. La misma en `/tienda` y en cada subsección. */
export function ProductGrid({ items, locale, priority = false, trailing, className }: Props) {
  return (
    <div className={cn(productGridClass, className)}>
      {items.map((product, index) => (
        <Reveal key={product.slug} step={index % 3}>
          <ProductCard product={product} locale={locale} priority={priority && index === 0} />
        </Reveal>
      ))}
      {trailing}
    </div>
  )
}
