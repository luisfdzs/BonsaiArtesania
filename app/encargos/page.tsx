import type { Metadata } from 'next'
import { Media } from '@/components/ui/Media'
import { Reveal } from '@/components/ui/Reveal'
import { customOrderMessage, mailtoLink, whatsappLink } from '@/lib/contact'
import { img } from '@/lib/media'

export const metadata: Metadata = {
  title: 'Encargos',
  description:
    'Convierte el ramo de tu boda o las flores de alguien especial en una joya de resina hecha a mano.',
}

const pasos = [
  {
    n: '01',
    titulo: 'Me escribes',
    texto: 'Me cuentas qué flores son y qué te gustaría llevar puesto. Sin compromiso.',
  },
  {
    n: '02',
    titulo: 'Me las envías',
    texto: 'Cuanto más frescas lleguen, mejor conservan el color. Te explico cómo empaquetarlas.',
  },
  {
    n: '03',
    titulo: 'Secado',
    texto:
      'De dos a cuatro semanas de prensa. Es lo que decide el resultado, y no se puede correr.',
  },
  {
    n: '04',
    titulo: 'Te la envío',
    texto: 'Antes de cerrar nada te enseño fotos. La pieza sale en su caja, lista para regalar.',
  },
]

export default function EncargosPage() {
  return (
    <div className="page-gutter pt-16 md:pt-24">
      <header className="grid gap-14 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-6">
          <p className="eyebrow">Encargos</p>
          <h1 className="mt-7 font-serif text-display">Vuestras flores</h1>
          <p className="mt-8 max-w-md text-bark-soft">
            El ramo de una boda, las flores de un aniversario, la planta de alguien que ya no está.
            Todas se secan. Lo que hago es pararlas justo antes y convertirlas en algo que puedas
            llevar contigo.
          </p>
          <div className="mt-11 flex flex-wrap items-center gap-x-2 gap-y-3">
            <a
              href={whatsappLink(customOrderMessage)}
              target="_blank"
              rel="noreferrer"
              className="btn"
            >
              Contarme mi caso
            </a>
            <a
              href={mailtoLink('Encargo especial', customOrderMessage)}
              className="btn btn-quiet"
            >
              Prefiero el correo
            </a>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[24rem] md:col-span-5 md:col-start-8">
          <Media
            image={img(
              'encargos-gotas',
              'Pendientes largos de resina con flores moradas sobre la tarjeta del taller',
            )}
            ratio="3 / 4"
            sizes="(max-width: 768px) 100vw, 40vw"
            priority
            className="rounded-t-full border border-line"
          />
        </div>
      </header>

      <section className="mt-(--spacing-section)">
        <h2 className="eyebrow border-b border-line pb-4">Cómo funciona</h2>
        <ol className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {pasos.map((paso, index) => (
            <Reveal as="li" key={paso.n} step={index}>
              <p className="eyebrow text-sage-deep">{paso.n}</p>
              <h3 className="mt-3 font-serif text-lead">{paso.titulo}</h3>
              <p className="mt-2 text-small text-bark-soft">{paso.texto}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <Reveal className="mt-(--spacing-section) border-t border-line pt-12">
        <p className="max-w-2xl font-serif text-title">
          «No hay dos ramos iguales, así que tampoco hay dos precios iguales. Cuéntame el tuyo y lo
          vemos con calma.»
        </p>
        <p className="mt-6 text-small text-bark-faint">Ana</p>
      </Reveal>
    </div>
  )
}
