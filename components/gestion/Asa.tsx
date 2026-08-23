import { cn } from '@/lib/cn'

/**
 * LAS TRES RAYAS DE MOVER
 *
 * Lo que dice que una tarjeta se coge. Una lista de cajas iguales no lo dice por
 * sí sola, y con el dedo además es el único sitio por donde se agarra: ver
 * `useReordenar`.
 *
 * El hueco de alrededor —el relleno— es para que quepa un dedo sin que las rayas
 * tengan que verse grandes. Dónde se coloca eso y cómo se despega del borde es
 * cosa de cada lista, y por eso el `className` de fuera se suma en vez de pisar:
 * lo que **no** puede quitar nadie es `touch-none`, que es lo que le dice al
 * navegador que aquí un arrastre no es desplazar la página. Sin eso, en el móvil
 * no hay gesto.
 */
export function Asa({
  fijo = false,
  className,
  ...props
}: { fijo?: boolean } & React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex-none touch-none select-none [-webkit-touch-callout:none]',
        'transition-colors duration-300',
        fijo ? 'text-line' : 'cursor-grab text-bark-faint active:cursor-grabbing',
        className,
      )}
      {...props}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
        aria-hidden="true"
        className="size-5"
      >
        <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
      </svg>
    </span>
  )
}
