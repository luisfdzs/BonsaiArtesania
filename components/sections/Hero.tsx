import { Media } from '@/components/ui/Media'
import { site } from '@/content/site'
import { translator, type Locale } from '@/lib/i18n/config'
import { img } from '@/lib/media'

/**
 * Portada. No es una foto a sangre con texto encima —eso pide una imagen
 * espectacular que todavía no existe— sino aire, una frase y una ventana: el
 * arco del logotipo de Ana, convertido en el hueco por el que se asoma la
 * primera pieza. Cuando haya foto de verdad, entra ahí sin tocar nada más.
 */
export function Hero({ locale }: { locale: Locale }) {
  const t = translator(locale)

  return (
    <section className="page-gutter relative overflow-hidden pt-10 pb-(--spacing-section) md:pt-16">
      {/* Luz de fondo: un amanecer muy tenue detrás del arco. Decorativo puro. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,var(--color-petal-soft)_0%,transparent_65%)] opacity-70 blur-3xl"
      />

      <div className="relative grid grid-cols-12 items-center gap-6 md:gap-10">
        <div className="animate-bloom col-span-7 md:col-span-6">
          <p className="eyebrow">
            {t({ es: 'Hecho a mano en', gl: 'Feito a man en' })} {site.location}
          </p>
          {/* El salto de línea va a mano y no al azar del ancho: el titular es
              una frase de dos tiempos y se lee mejor partida donde la partiría
              quien la dice en voz alta. En galego el corte cae en el mismo
              sitio, después del sujeto. */}
          <h1 className="mt-7 font-serif text-display">
            {t({
              es: (
                <>
                  Flores que
                  <br />
                  no se marchitan
                </>
              ),
              gl: (
                <>
                  Flores que
                  <br />
                  non murchan
                </>
              ),
            })}
          </h1>
          <p className="mt-8 max-w-md text-bark-soft">{t(site.intro)}</p>
        </div>

        {/* El arco se limita en ancho: a pantalla completa, un 3/4 sin tope crece
            tanto que empuja todo lo demás fuera de la primera vista. En móvil
            comparte fila con el texto —no va debajo— para que la portada quede
            igual de compacta que en escritorio. */}
        <div className="animate-bloom col-span-5 mx-auto w-full [animation-delay:220ms] md:col-span-5 md:col-start-8 md:max-w-[24rem]">
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
