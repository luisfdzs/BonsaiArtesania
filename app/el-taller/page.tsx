import type { Metadata } from 'next'
import { Media } from '@/components/ui/Media'
import { Reveal } from '@/components/ui/Reveal'
import { img } from '@/lib/media'

export const metadata: Metadata = {
  title: 'El taller',
  description:
    'Cómo trabaja Ana: flores de campo gallego recogidas a mano, semanas de secado y resina colocada una a una.',
}

const pasos = [
  { n: '01', titulo: 'Recoger', texto: 'Flores y hojas de campo gallego, en su momento justo.' },
  { n: '02', titulo: 'Secar', texto: 'Semanas de prensa y silencio. Es la parte lenta.' },
  { n: '03', titulo: 'Resina', texto: 'Colocada una a una, sin prisa, y curada dos días.' },
  { n: '04', titulo: 'Pulir', texto: 'A mano, hasta que la luz entra limpia.' },
]

/**
 * Vive en `/el-taller` y no en `/taller` porque esa ruta ya es el panel de
 * gestión, que devuelve 404 a quien no es Ana. El rótulo del menú dice «El
 * taller», así que la URL dice lo mismo.
 */
export default function TallerPage() {
  return (
    <div className="page-gutter pt-16 md:pt-24">
      <div className="grid gap-14 md:grid-cols-12 md:items-center md:gap-12">
        <Reveal className="md:col-span-5">
          <Media
            image={img('taller-manos', 'Una mano con anillos de resina entre espigas de campo')}
            ratio="4 / 5"
            sizes="(max-width: 768px) 100vw, 40vw"
            priority
            className="border border-line"
          />
        </Reveal>

        <div className="text-center md:col-span-6 md:col-start-7">
          <Reveal>
            <p className="eyebrow">El taller</p>
            <h1 className="mt-7 font-serif text-title">
              Cada pieza tarda semanas en estar lista, y sólo existe una vez.
            </h1>
            <p className="mx-auto mt-7 max-w-prose text-bark-soft">
              Soy Ana. Recojo las flores, las seco, las coloco de una en una y las guardo en resina.
              No hay moldes en serie ni dos piezas iguales: la flor decide cómo va a quedar y yo la
              acompaño.
            </p>
          </Reveal>

          <ol className="mt-14 grid items-center gap-x-10 gap-y-9 sm:grid-cols-2">
            {pasos.map((paso, index) => (
              <Reveal as="li" key={paso.n} step={index} className="text-center">
                <p className="eyebrow text-sage-deep">{paso.n}</p>
                <h2 className="mt-3 font-serif text-lead">{paso.titulo}</h2>
                <p className="mt-1 text-small text-bark-soft">{paso.texto}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
