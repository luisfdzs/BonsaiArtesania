import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { CartPing } from '@/components/layout/CartCount'
import { CheckIcon, TrashIcon } from '@/components/ui/CartIcons'
import { FlowerBud } from '@/components/ui/FlowerBud'
import { Media } from '@/components/ui/Media'
import { SendIcon } from '@/components/ui/SocialIcons'
import { isAdmin } from '@/lib/admin'
import { readCart } from '@/lib/cart'
import { isLocale, pick, translator } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { shopOpen } from '@/lib/shop'
import { removeFromCart, setQty } from './actions'

type Params = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  return {
    title: isLocale(locale) ? pick({ es: 'Carrito', gl: 'Carro' }, locale) : 'Carrito',
    robots: { index: false, follow: false },
  }
}

export default async function CarritoPage({ params }: Params) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = translator(locale)

  // La cuenta del taller no tiene carrito, así que aquí no hay nada que enseñarle:
  // se la manda a su sitio. Ver `lib/admin.ts`.
  if (await isAdmin()) redirect(path(locale, '/gestion'))

  // Sin carrito abierto no hay nada que enseñar. Se explica en lugar de dar un
  // 404: quien llegue aquí desde un enlace guardado merece saber qué ha pasado.
  if (!shopOpen) {
    return (
      <div className="page-gutter pt-16 md:pt-24">
        <h1 className="font-serif text-title">{t({ es: 'Muy pronto', gl: 'Moi pronto' })}</h1>
        <p className="mt-6 max-w-md text-bark-soft">
          {t({
            es: 'Cada pieza se sigue encargando hablando, que es como Ana trabaja hoy: escríbele y lo organizáis.',
            gl: 'Cada peza séguese encargando falando, que é como Ana traballa hoxe: escríbelle e organizádelo.',
          })}
        </p>
        <div className="mt-10 flex flex-col gap-2 sm:flex-row">
          <Link href={path(locale, '/tienda')} className="btn">
            {t({ es: 'Ver las piezas', gl: 'Ver as pezas' })}
          </Link>
          <Link href={path(locale, '/#contacto')} className="btn btn-quiet">
            Escribir a Ana
          </Link>
        </div>
      </div>
    )
  }

  const cart = await readCart(locale)

  if (cart.lines.length === 0) {
    return (
      // Con tan poco contenido, pegarlo arriba deja la pantalla medio vacía.
      // `data-fill` hace que el <main> estire esta caja a todo el hueco entre
      // cabecera y pie (ver globals.css) y aquí el grid reparte ese hueco por
      // igual arriba y abajo. El relleno es simétrico para no descentrarlo.
      <div data-fill className="page-gutter grid place-items-center py-16 text-center">
        <div>
          <h1 className="font-serif text-title">{t({ es: 'Tu carrito', gl: 'O teu carro' })}</h1>
          <p className="mt-6 text-bark-soft">
            {t({
              es: 'Todavía no has añadido ninguna pieza.',
              gl: 'Aínda non engadiches ningunha peza.',
            })}
          </p>
          <Link href={path(locale, '/tienda')} className="btn mt-10">
            {t({ es: 'Tienda', gl: 'Tenda' })}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-gutter pt-10 pb-(--spacing-section) md:pt-16">
      <Link href={path(locale, '/tienda')} className="link-underline tap eyebrow">
        ← {t({ es: 'Seguir viendo la tienda', gl: 'Seguir vendo a tenda' })}
      </Link>

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h1 className="font-serif text-title">{t({ es: 'Tu carrito', gl: 'O teu carro' })}</h1>
        <p className="text-small text-bark-faint">
          {cart.count}{' '}
          {t(cart.count === 1 ? { es: 'pieza', gl: 'peza' } : { es: 'piezas', gl: 'pezas' })}
        </p>
      </div>

      <div className="mt-12">
        <ul>
          {cart.lines.map((line) => (
            <li
              key={line.slug}
              className="flex gap-5 border-b border-line py-8 first:border-t sm:gap-7"
            >
              <Link href={path(locale, `/tienda/${line.slug}`)} className="w-20 shrink-0 sm:w-28">
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
                    href={path(locale, `/tienda/${line.slug}`)}
                    className="link-underline tap font-serif text-lead"
                  >
                    {line.name}
                  </Link>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-5 sm:flex-col sm:items-end sm:gap-4">
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
                        {t({ es: 'Cantidad de', gl: 'Cantidade de' })} {line.name}
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
                        aria-label={t({ es: 'Actualizar cantidad', gl: 'Actualizar cantidade' })}
                        title={t({ es: 'Actualizar cantidad', gl: 'Actualizar cantidade' })}
                        className="tap flex h-9 w-9 shrink-0 items-center justify-center border-l border-line text-bark-faint transition-colors duration-500 hover:text-sage-deep"
                      >
                        {/* Guardar la cantidad va a la base y vuelve a pintar el
                            carrito entero —línea, resumen y contador de la barra—,
                            pero mientras tanto el número en pantalla es el nuevo y
                            todo lo demás es el viejo: parece que el visto no ha
                            hecho nada. La flor ocupa el sitio del visto y lo
                            desmiente sin mover nada de sitio. */}
                        <FlowerBud
                          label={t({
                            es: 'Actualizando la cantidad',
                            gl: 'Actualizando a cantidade',
                          })}
                        >
                          <CheckIcon className="h-4 w-4" />
                        </FlowerBud>
                      </button>
                    </form>

                    <form action={removeFromCart}>
                      <input type="hidden" name="slug" value={line.slug} />
                      <CartPing />
                      <button
                        type="submit"
                        aria-label={`${t({ es: 'Quitar', gl: 'Quitar' })} ${line.name}`}
                        title={t({ es: 'Quitar', gl: 'Quitar' })}
                        className="tap flex h-9 w-9 items-center justify-center text-bark-faint transition-colors duration-500 hover:text-sage-deep"
                      >
                        {/* Igual que el visto de al lado: quitar una pieza tarda
                            lo que tarde la base y hasta que vuelve la línea sigue
                            ahí, entera. */}
                        <FlowerBud label={`${t({ es: 'Quitando', gl: 'Quitando' })} ${line.name}`}>
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

        {/* Sin tarjeta de resumen: la web no publica ninguna cifra, y lo único
            que se podía afirmar ahí —cuántas piezas se piden— ya está en la
            cabecera de la página. Del resumen sólo queda el paso siguiente,
            justo debajo de la última línea. */}
        {/* Va centrado y sin rótulo dentro, con el mismo avioncito y el mismo
            tamaño que el de enviar el pedido: son los dos pasos de lo mismo, y
            que se parezcan es lo que hace que el segundo no sorprenda. El texto
            se va a `aria-label` y `title` —lo que oye quien usa lector de
            pantalla y lo que sale al pasar el ratón—, que es lo único que un
            avioncito solo no dice. */}
        <div className="mt-10 flex justify-center">
          <Link
            href={path(locale, '/comprar')}
            aria-label={t({ es: 'Continuar', gl: 'Continuar' })}
            title={t({ es: 'Continuar', gl: 'Continuar' })}
            className="btn btn-icon btn-icon-lg"
          >
            <SendIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
