import { ProductCard } from '@/components/sections/ProductCard'
import { Reveal } from '@/components/ui/Reveal'
import type { ProductCardData } from '@/content/products'
import type { Locale } from '@/lib/i18n/config'

type Props = {
  items: ProductCardData[]
  locale: Locale
  /** La primera tarjeta de la primera rejilla de la página es candidata a LCP. */
  priority?: boolean
  className?: string
}

/** La rejilla del catálogo. La misma en `/tienda` y en cada subsección. */
export function ProductGrid({ items, locale, priority = false, className }: Props) {
  return (
    <div className={className ?? 'mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3'}>
      {items.map((product, index) => (
        <Reveal key={product.slug} step={index % 3}>
          <ProductCard product={product} locale={locale} priority={priority && index === 0} />
        </Reveal>
      ))}
    </div>
  )
}
