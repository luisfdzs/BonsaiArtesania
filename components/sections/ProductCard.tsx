import Link from 'next/link'
import { Media } from '@/components/ui/Media'
import { type ProductCardData } from '@/content/products'
import { translator, type Locale } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'

type Props = {
  /** Sólo lo que se ve en la tarjeta; ver `ProductCardData`. */
  product: ProductCardData
  locale: Locale
  /** La primera tarjeta de un listado carga con prioridad (candidata a LCP). */
  priority?: boolean
}

export function ProductCard({ product, locale, priority = false }: Props) {
  const t = translator(locale)

  return (
    <article className="group">
      <Link href={path(locale, `/tienda/${product.slug}`)} className="block">
        <Media
          image={product.image && t(product.image)}
          // En móvil la foto va cuadrada, no vertical: dos columnas de retratos
          // dejarían fuera de pantalla la segunda fila. Se cambia con la
          // variable porque `Media` fija la proporción en el estilo en línea.
          ratio="var(--card-ratio)"
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 50vw, 31vw"
          priority={priority}
          // La imagen se acerca muy despacio al pasar por encima: suficiente para
          // que se note que es pulsable, poco para que distraiga.
          className="[--card-ratio:1_/_1] sm:[--card-ratio:4_/_5] [&_img]:transition-transform [&_img]:duration-[1400ms] [&_img]:ease-(--ease-out-soft) group-hover:[&_img]:scale-[1.03]"
        />

        {/* Sólo nombre y resumen: el catálogo no publica ninguna cifra. */}
        <h3 className="mt-3 font-serif text-base leading-tight sm:mt-5 sm:text-lead">
          {t(product.name)}
        </h3>
        <p className="mt-1 text-small text-bark-faint">{t(product.summary)}</p>
      </Link>
    </article>
  )
}
