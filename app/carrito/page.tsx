import type { Metadata } from 'next'
import Link from 'next/link'
import { CartPing } from '@/components/layout/CartCount'
import { readCart } from '@/lib/cart'
import { formatCents } from '@/lib/schema'
import { shopOpen } from '@/lib/shop'
import { missingForFreeShippingCents } from '@/lib/shipping'
import { removeFromCart, setQty } from './actions'

export const metadata: Metadata = {
  title: 'Carrito',
  robots: { index: false, follow: false },
}

export default async function CarritoPage() {
  // La tienda cerrada no tiene carrito. Se explica en lugar de dar un 404: quien
  // llegue aquí desde un enlace guardado merece saber qué ha pasado.
  if (!shopOpen) {
    return (
      <div className="page-gutter pt-16 md:pt-24">
        <h1 className="font-serif text-title">La tienda abre pronto</h1>
        <p className="mt-6 max-w-md text-bark-soft">
          Todavía no se puede comprar directamente desde la web. Cada pieza se sigue encargando
          hablando, que es como Ana trabaja hoy: escríbele y lo organizáis.
        </p>
        <div className="mt-10 flex flex-col gap-2 sm:flex-row">
          <Link href="/tienda" className="btn">
            Ver las piezas
          </Link>
          <Link href="/#contacto" className="btn btn-quiet">
            Escribir a Ana
          </Link>
        </div>
      </div>
    )
  }

  const cart = await readCart()
  const missing = missingForFreeShippingCents(cart.subtotalCents)

  if (cart.lines.length === 0) {
    return (
      <div className="page-gutter pt-16 md:pt-24">
        <h1 className="font-serif text-title">Tu carrito</h1>
        <p className="mt-6 text-bark-soft">Todavía no has añadido ninguna pieza.</p>
        <Link href="/tienda" className="btn mt-10">
          Ver la tienda
        </Link>
      </div>
    )
  }

  return (
    <div className="page-gutter pt-16 pb-(--spacing-section) md:pt-24">
      <h1 className="font-serif text-title">Tu carrito</h1>

      <div className="mt-14 grid gap-14 lg:grid-cols-12">
        <ul className="lg:col-span-7">
          {cart.lines.map((line) => (
            <li
              key={line.slug}
              className="flex items-start justify-between gap-6 border-b border-line py-6 first:border-t"
            >
              <div>
                <Link href={`/tienda/${line.slug}`} className="link-underline tap">
                  {line.name}
                </Link>
                <p className="mt-2 text-small text-bark-faint">
                  {formatCents(line.unitPriceCents)} por unidad
                </p>
                {/* Piezas únicas: alguien pudo comprarla mientras estaba aquí
                    guardada. Se avisa en la línea y no suma al total. */}
                {line.available < line.qty && (
                  <p className="mt-2 text-small text-sage-deep">
                    {line.available === 0
                      ? 'Se ha agotado. Quítala para poder seguir.'
                      : `Sólo queda${line.available === 1 ? '' : 'n'} ${line.available}. Ajusta la cantidad.`}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-6">
                {/* Un `select` que se envía al cambiar es lo más simple que
                    funciona con y sin JavaScript; sin él hace falta pulsar Intro,
                    que sigue siendo un camino válido. */}
                <form action={setQty} className="flex items-center gap-2">
                  <input type="hidden" name="slug" value={line.slug} />
                  {/* Cambiar la cantidad cambia el contador de la barra de móvil,
                      y este aviso es lo que se lo dice. Ver `CartCount`. */}
                  <CartPing />
                  <label className="sr-only" htmlFor={`qty-${line.slug}`}>
                    Cantidad de {line.name}
                  </label>
                  <input
                    id={`qty-${line.slug}`}
                    name="qty"
                    type="number"
                    min={1}
                    max={20}
                    defaultValue={line.qty}
                    className="field w-14 text-center"
                  />
                  <button type="submit" className="link-underline tap text-small text-bark-faint">
                    Cambiar
                  </button>
                </form>

                <p className="w-20 text-right">{formatCents(line.lineTotalCents)}</p>

                <form action={removeFromCart}>
                  <input type="hidden" name="slug" value={line.slug} />
                  <CartPing />
                  <button type="submit" className="link-underline tap text-small text-bark-faint">
                    Quitar
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
          <div className="border border-line p-8">
            <h2 className="eyebrow">Resumen</h2>

            <dl className="mt-8 flex flex-col gap-3">
              <div className="flex justify-between">
                <dt className="text-bark-soft">Subtotal</dt>
                <dd>{formatCents(cart.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-bark-soft">Envío</dt>
                <dd>{cart.shippingCents === 0 ? 'Gratis' : formatCents(cart.shippingCents)}</dd>
              </div>
              <div className="mt-3 flex justify-between border-t border-line pt-4 text-lead">
                <dt>Total</dt>
                <dd>{formatCents(cart.totalCents)}</dd>
              </div>
            </dl>

            {missing !== null && (
              <p className="mt-6 bg-petal-soft p-4 text-small text-bark-soft">
                Te faltan {formatCents(missing)} para que el envío salga gratis.
              </p>
            )}

            {cart.hasUnavailable ? (
              <p className="btn mt-8 w-full" aria-disabled="true">
                Revisa el carrito
              </p>
            ) : (
              <Link href="/comprar" className="btn mt-8 w-full">
                Continuar
              </Link>
            )}

            <p className="mt-6 text-small text-bark-faint">
              Hecha a mano bajo pedido: entre 1 y 3 semanas. Envío a toda España. Todavía no se paga
              en la web: envías la petición y Ana te escribe.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
