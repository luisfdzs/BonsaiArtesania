import Link from 'next/link'
import { Media } from '@/components/ui/Media'
import { site } from '@/content/site'
import { img } from '@/lib/media'

/**
 * Portada. No es una foto a sangre con texto encima —eso pide una imagen
 * espectacular que todavía no existe— sino aire, una frase y una ventana: el
 * arco del logotipo de Ana, convertido en el hueco por el que se asoma la
 * primera pieza. Cuando haya foto de verdad, entra ahí sin tocar nada más.
 */
export function Hero() {
  return (
    <section className="page-gutter relative overflow-hidden pt-10 pb-(--spacing-section) md:pt-16">
      {/* Luz de fondo: un amanecer muy tenue detrás del arco. Decorativo puro. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,var(--color-petal-soft)_0%,transparent_65%)] opacity-70 blur-3xl"
      />

      <div className="relative grid items-center gap-14 md:grid-cols-12 md:gap-10">
        <div className="animate-bloom md:col-span-6">
          <p className="eyebrow">Hecho a mano en {site.location}</p>
          <h1 className="mt-7 font-serif text-display">
            Flores que
            <br />
            no se marchitan
          </h1>
          <p className="mt-8 max-w-md text-bark-soft">{site.intro}</p>

          <div className="mt-11 flex flex-wrap items-center gap-x-2 gap-y-3">
            <Link href="/tienda" className="btn">
              Joyas Bonsái
            </Link>
            <Link href="/encargos" className="btn btn-quiet">
              Joyas personalizadas
            </Link>
          </div>
        </div>

        {/* El arco se limita en ancho: a pantalla completa, un 3/4 sin tope crece
            tanto que empuja todo lo demás fuera de la primera vista. */}
        <div className="animate-bloom mx-auto w-full max-w-[24rem] [animation-delay:220ms] md:col-span-5 md:col-start-8">
          <Media
            image={img(
              'portada-hojas',
              'Dos pendientes de hoja naranja en resina, colgados de una rama',
            )}
            ratio="3 / 4"
            sizes="(max-width: 768px) 100vw, 40vw"
            priority
            className="rounded-t-full border border-line"
          />
        </div>
      </div>
    </section>
  )
}
