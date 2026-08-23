import Link from 'next/link'
import { Media } from '@/components/ui/Media'
import type { PiezaTarjeta } from '@/lib/catalogo'
import { translator, type Locale } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'

type Props = {
  /** Sólo lo que se ve en la tarjeta; ver `PiezaTarjeta`. */
  product: PiezaTarjeta
  locale: Locale
  /** La primera tarjeta de un listado carga con prioridad (candidata a LCP). */
  priority?: boolean
}

export function ProductCard({ product, locale, priority = false }: Props) {
  const t = translator(locale)

  return (
    <article className="group">
      {/* La lámina con espesor es la utilidad `piece`; el aro interior de la foto,
          `piece-frame`. Las dos viven en globals.css. */}
      <Link href={path(locale, `/tienda/${product.slug}`)} className="piece block">
        <div className="piece-frame">
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
        </div>

        {/* Sólo el nombre: ni cifras ni resumen. El resumen se lee en la ficha, y
            repetirlo aquí llenaba la rejilla de texto y le quitaba sitio a la foto,
            que es lo que hace elegir. */}
        <div className="px-1.5 pb-1 pt-3 sm:pt-4">
          <h3 className="font-serif text-base leading-tight sm:text-lead">{t(product.name)}</h3>
        </div>
      </Link>
    </article>
  )
}
