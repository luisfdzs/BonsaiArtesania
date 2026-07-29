import { addToCart } from '@/app/carrito/actions'

/**
 * Botón de añadir al carrito.
 *
 * Es un formulario y no un `onClick`: la acción de servidor hace el trabajo, así
 * que funciona sin JavaScript y no necesita ser componente de cliente.
 *
 * A propósito **no** consulta si la pieza ya está en el carrito. Hacerlo obligaría
 * a leer la base de datos en la ficha y las 14 fichas dejarían de generarse en
 * build para pasar a renderizarse en cada visita. Cambiar el texto del botón no
 * paga ese precio; quien quiera ver lo que lleva tiene el contador de la cabecera.
 */
export function AddToCart({ slug }: { slug: string }) {
  return (
    <form action={addToCart}>
      <input type="hidden" name="slug" value={slug} />
      <button type="submit" className="btn w-full">
        Añadir al carrito
      </button>
    </form>
  )
}
