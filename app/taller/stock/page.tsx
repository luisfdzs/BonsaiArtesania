import { products } from '@/content/products'
import { formatPrice } from '@/content/products'
import { availabilityFor } from '@/lib/stock'
import { updateStock } from '../actions'

/**
 * Existencias por pieza. El listado sale del catálogo, no de la base: así una
 * pieza nueva en `content/products.ts` aparece aquí sola, sin tener que
 * sincronizar nada.
 */
export default async function TallerStockPage() {
  // Las piezas a medida no se venden por unidades: su precio se acuerda hablando
  // y nunca pasan por el carrito, así que no tienen existencias que gestionar.
  const sellable = products.filter((product) => product.price !== null)
  const stock = await availabilityFor(sellable.map((product) => product.slug))

  return (
    <section>
      <p className="text-bark-soft">
        Cuántas unidades quedan de cada pieza. Una pieza única lleva 1: al venderse baja a 0 sola y
        deja de poderse comprar.
      </p>

      <ul className="mt-12 flex flex-col">
        {sellable.map((product) => {
          const available = stock.get(product.slug) ?? 0

          return (
            <li
              key={product.slug}
              className="flex flex-col items-center gap-3 border-b border-line py-4 first:border-t"
            >
              <div>
                <p>{product.name}</p>
                <p className="mt-1 text-small text-bark-faint">
                  {formatPrice(product.price)}
                  {available === 0 && ' · agotada'}
                </p>
              </div>

              <form action={updateStock} className="flex items-center justify-center gap-3">
                <input type="hidden" name="slug" value={product.slug} />
                <label className="sr-only" htmlFor={`stock-${product.slug}`}>
                  Unidades de {product.name}
                </label>
                <input
                  id={`stock-${product.slug}`}
                  name="available"
                  type="number"
                  min={0}
                  max={999}
                  defaultValue={available}
                  className="field w-16 text-center"
                />
                <button type="submit" className="link-underline tap text-small text-bark-faint">
                  Guardar
                </button>
              </form>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
