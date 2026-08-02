import type { Metadata } from 'next'
import Link from 'next/link'
import { CartPing } from '@/components/layout/CartCount'
import { CheckIcon, TrashIcon } from '@/components/ui/CartIcons'
import { FlowerBud } from '@/components/ui/FlowerBud'
import { Media } from '@/components/ui/Media'
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
      // Con tan poco contenido, pegarlo arriba deja la pantalla medio vacía.
      // `data-fill` hace que el <main> estire esta caja a todo el hueco entre
      // cabecera y pie (ver globals.css) y aquí el grid reparte ese hueco por
      // igual arriba y abajo. El relleno es simétrico para no descentrarlo.
      <div data-fill className="page-gutter grid place-items-center py-16 text-center">
        <div>
          <h1 className="font-serif text-title">Tu carrito</h1>
          <p className="mt-6 text-bark-soft">Todavía no has añadido ninguna pieza.</p>
          <Link href="/tienda" className="btn mt-10">
            Tienda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-gutter pt-10 pb-(--spacing-section) md:pt-16">
      <Link href="/tienda" className="link-underline tap eyebrow">
        ← Seguir viendo la tienda
      </Link>

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h1 className="font-serif text-title">Tu carrito</h1>
        <p className="text-small text-bark-faint">
          {cart.count} {cart.count === 1 ? 'pieza' : 'piezas'}
        </p>
      </div>

      <div className="mt-12 grid gap-14 lg:grid-cols-12 lg:items-start">
        <ul className="lg:col-span-7">
          {cart.lines.map((line) => (
            <li
              key={line.slug}
              className="flex gap-5 border-b border-line py-8 first:border-t sm:gap-7"
            >
              <Link href={`/tienda/${line.slug}`} className="w-20 shrink-0 sm:w-28">
                <Media
                  image={line.image}
                  ratio="1 / 1"
                  sizes="(max-width: 640px) 5rem, 7rem"
                  className="border border-line"
                />
              </Link>

              <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <Link
                    href={`/tienda/${line.slug}`}
                    className="link-underline tap font-serif text-lead"
                  >
                    {line.name}
                  </Link>
                  <p className="mt-2 text-small text-bark-faint">
                    {formatCents(line.unitPriceCents)} por unidad
                  </p>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-5 sm:flex-col sm:items-end sm:gap-4">
                  <p className="text-lead">{formatCents(line.lineTotalCents)}</p>

                  <div className="flex items-center gap-3">
                    {/* Un `input` numérico que se envía al pulsar el visto es lo
                        más simple que funciona con y sin JavaScript; sin él sigue
                        valiendo pulsar Intro dentro del campo. */}
                    <form action={setQty} className="flex items-center border border-line">
                      <input type="hidden" name="slug" value={line.slug} />
                      {/* Cambiar la cantidad cambia el contador de la barra de
                          móvil, y este aviso es lo que se lo dice. Ver `CartCount`. */}
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
                        className="w-10 border-0 bg-transparent py-2 text-center text-small [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button
                        type="submit"
                        aria-label="Actualizar cantidad"
                        title="Actualizar cantidad"
                        className="tap flex h-9 w-9 shrink-0 items-center justify-center border-l border-line text-bark-faint transition-colors duration-500 hover:text-sage-deep"
                      >
                        {/* Guardar la cantidad va a la base y vuelve a pintar el
                            carrito entero —línea, resumen y contador de la barra—,
                            pero mientras tanto el número en pantalla es el nuevo y
                            todo lo demás es el viejo: parece que el visto no ha
                            hecho nada. La flor ocupa el sitio del visto y lo
                            desmiente sin mover nada de sitio. */}
                        <FlowerBud label="Actualizando la cantidad">
                          <CheckIcon className="h-4 w-4" />
                        </FlowerBud>
                      </button>
                    </form>

                    <form action={removeFromCart}>
                      <input type="hidden" name="slug" value={line.slug} />
                      <CartPing />
                      <button
                        type="submit"
                        aria-label={`Quitar ${line.name}`}
                        title="Quitar"
                        className="tap flex h-9 w-9 items-center justify-center text-bark-faint transition-colors duration-500 hover:text-sage-deep"
                      >
                        {/* Igual que el visto de al lado: quitar una pieza tarda
                            lo que tarde la base y hasta que vuelve la línea sigue
                            ahí, entera. */}
                        <FlowerBud label={`Quitando ${line.name}`}>
                          <TrashIcon className="h-4 w-4" />
                        </FlowerBud>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
          <div className="border border-line bg-linen-deep/50 p-8 sm:p-10">
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
              <div className="mt-3 flex items-baseline justify-between border-t border-line pt-5">
                <dt className="font-serif text-lead">Total</dt>
                <dd className="font-serif text-title">{formatCents(cart.totalCents)}</dd>
              </div>
            </dl>

            {missing !== null && (
              <p className="mt-6 bg-petal-soft p-4 text-small text-bark-soft">
                Te faltan {formatCents(missing)} para que el envío salga gratis.
              </p>
            )}

            <Link href="/comprar" className="btn mt-8 w-full">
              Continuar
            </Link>

            <p className="mt-6 text-small text-bark-faint">
              Cada pieza se hace a mano para ti: entre 1 y 3 semanas. Envío a toda España. Al enviar
              el pedido le llega a Ana, que se pone con él y te escribe.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
