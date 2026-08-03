import { ReelFrame } from '@/components/ui/ReelFrame'
import { Reveal } from '@/components/ui/Reveal'
import { reels } from '@/content/reel'
import { img } from '@/lib/media'

/**
 * El taller en vídeo, en la portada.
 *
 * Va **después de las piezas destacadas y antes de «El taller»**, y ése es su sitio
 * por una razón: llega justo cuando alguien ha visto tres piezas quietas y todavía no
 * sabe cómo se hacen. El texto de «El taller» lo cuenta en cuatro pasos; los vídeos
 * lo enseñan, así que abren ese bloque en vez de competir con él.
 *
 * Verticales y a un tercio de ancho, no a sangre: son reels, se grabaron para un
 * móvil, y estirarlos a todo el ancho sólo los pixela. El hueco que sobra a los lados
 * es el mismo aire con el que respira el resto de la web.
 *
 * **Si no hay vídeos, no hay sección.** Devuelve `null` y la portada queda como
 * estaba, sin un hueco ni un marcador esperando. Ver `content/reel.ts`.
 */
export function ReelSection() {
  const first = reels[0]
  if (!first) return null

  return (
    <section className="page-gutter pt-(--spacing-section)">
      <div className="grid gap-12 md:grid-cols-12 md:items-center md:gap-14">
        <Reveal className="mx-auto w-full max-w-[19rem] md:col-span-4 md:mx-0">
          <ReelFrame
            clips={reels.map((clip) => ({ file: clip.file, alt: clip.alt }))}
            poster={first.poster ? img(first.poster, first.alt) : null}
          />
        </Reveal>

        <div className="text-center md:col-span-7 md:col-start-6 md:text-left">
          <Reveal>
            <h2 className="eyebrow">En vídeo</h2>
            <p className="mt-7 font-serif text-title">De la prensa a la tarjeta</p>
            <p className="mx-auto mt-7 max-w-prose text-bark-soft md:mx-0">
              Semanas de prensa y silencio, y un día se abre la carpeta y las flores están ahí,
              secas y enteras. Lo que viene después son las pinzas, la resina y una tarjeta con su
              nombre.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
