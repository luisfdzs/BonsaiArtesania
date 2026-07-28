import { cn } from '@/lib/cn'

/**
 * Marca. Recoge la idea del logotipo de Ana —un arco de ventana con un bonsái
 * dentro— reducida a lo que aguanta a 20 px de alto: el arco, el árbol y el
 * nombre. Hereda `currentColor`, así que sirve sobre el hero y sobre el lino.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-3 text-current', className)}>
      <svg viewBox="0 0 32 40" fill="none" aria-hidden className="h-full w-auto">
        <path
          d="M1 39V16a15 15 0 0 1 30 0v23"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path d="M16 33V20" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        <path
          d="M16 24c-3.5 0-5.5-1.5-7-3.5M16 21c3 0 5-1 6.5-2.5"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <ellipse cx="10" cy="15" rx="6" ry="3.4" stroke="currentColor" strokeWidth="1.1" />
        <ellipse cx="22" cy="11" rx="5.5" ry="3.2" stroke="currentColor" strokeWidth="1.1" />
        <path d="M9 33h14" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[1.35em] tracking-wide">Bonsái</span>
        <span className="text-[0.42em] tracking-[0.42em] uppercase opacity-70">Artesanía</span>
      </span>
    </span>
  )
}
