import Link from 'next/link'
import { Media } from '@/components/ui/Media'
import { type Product } from '@/content/products'

type Props = {
  product: Product
  /** La primera tarjeta de un listado carga con prioridad (candidata a LCP). */
  priority?: boolean
}

export function ProductCard({ product, priority = false }: Props) {
  return (
    <article className="group">
      <Link href={`/tienda/${product.slug}`} className="block">
        <Media
          image={product.image}
          ratio="4 / 5"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 31vw"
          priority={priority}
          // La imagen se acerca muy despacio al pasar por encima: suficiente para
          // que se note que es pulsable, poco para que distraiga.
          className="[&_img]:transition-transform [&_img]:duration-[1400ms] [&_img]:ease-(--ease-out-soft) group-hover:[&_img]:scale-[1.03]"
        />

        {/* Sólo nombre y resumen: el catálogo no publica ninguna cifra. */}
        <h3 className="mt-5 font-serif text-lead leading-tight">{product.name}</h3>
        <p className="mt-1 text-small text-bark-faint">{product.summary}</p>
      </Link>
    </article>
  )
}
