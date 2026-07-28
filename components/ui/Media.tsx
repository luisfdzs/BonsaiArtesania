import Image from 'next/image'
import type { Image as ImageData } from '@/lib/media'
import { cn } from '@/lib/cn'

type Props = {
  image: ImageData | null
  /** Anchos que ocupará la imagen según viewport. Obligatorio: sin esto el
   *  navegador se descarga siempre la variante más grande. */
  sizes: string
  /** Sólo para la imagen que hace de LCP (una por página, ni una más). */
  priority?: boolean
  /** Recorte a una proporción fija (rejilla). Si se omite, respeta la del original. */
  ratio?: string
  className?: string
}

/**
 * Única forma de poner una imagen en esta web.
 *
 * Centralizarlo garantiza tres cosas que a mano se olvidan siempre: dimensiones
 * reales del manifiesto (CLS = 0), placeholder difuminado y un `sizes` explícito.
 * Si una pieza todavía no tiene foto, dibuja un marcador en vez de un hueco.
 */
export function Media({ image, sizes, priority = false, ratio, className }: Props) {
  return (
    <div
      className={cn('relative w-full overflow-hidden bg-linen-deep', className)}
      style={{
        aspectRatio: ratio ?? (image ? `${image.width} / ${image.height}` : '4 / 5'),
      }}
    >
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          placeholder="blur"
          blurDataURL={image.blur}
          quality={82}
          className="object-cover"
        />
      ) : (
        <Placeholder />
      )}
    </div>
  )
}

/** Marcador para piezas sin foto todavía. */
function Placeholder() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 grid place-items-center bg-[radial-gradient(120%_100%_at_30%_20%,var(--color-linen)_0%,var(--color-linen-deep)_55%,var(--color-petal-soft)_100%)]"
    >
      <Leaf className="h-14 w-14 text-sage opacity-40" />
    </div>
  )
}

export function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M20 4c0 8.5-5 13-11 13-1.6 0-2.9-.3-4-.9C5 9.6 10.4 5 20 4Z"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      <path d="M17 7C11.5 9 7.5 13 5 21" stroke="currentColor" strokeWidth="0.7" />
    </svg>
  )
}
