import type { Metadata } from 'next'
import { ContactButtons } from '@/components/ui/ContactButtons'
import { Media } from '@/components/ui/Media'
import { Reveal } from '@/components/ui/Reveal'
import { customOrderMessage } from '@/lib/contact'
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
      <header>
        {/* Texto a la izquierda e imagen a la derecha **a cualquier ancho**, y
            los botones fuera de las dos columnas, debajo del bloque entero.

            Antes los botones vivían dentro de la columna de texto: quedaban a
            media página, con la imagen al lado marcándoles el final, y con la
            fila de contacto centrada en un sitio que no era el centro de nada.
            Abajo y a todo el ancho, la llamada cierra el bloque igual que cierra
            la portada.

            Y antes las dos columnas sólo existían a partir de `md`: en móvil el
            texto ocupaba el ancho entero y la imagen caía debajo. Ahora la
            pareja no se rompe nunca. Lo que cambia con el tamaño es el reparto:
            en móvil 7/5 —el texto necesita el trozo grande para que el titular
            no se parta en cuatro— y a partir de `md` 6/5 con un hueco en medio,
            que es lo que separa las dos cosas cuando hay sitio de sobra. El aire
            entre columnas también crece, porque a 360px cada píxel de hueco se
            lo quita al texto. */}
        <div className="grid grid-cols-12 items-center gap-x-4 md:gap-x-12">
          <div className="col-span-7 text-center md:col-span-6">
            <p className="eyebrow">Encargos</p>
            <h1 className="mt-7 font-serif text-display">Vuestras flores</h1>
            <p className="mx-auto mt-8 max-w-md text-bark-soft">
              El ramo de una boda, las flores de un aniversario, la planta de alguien que ya no
              está. Todas se secan. Lo que hago es pararlas justo antes y convertirlas en algo que
              puedas llevar contigo.
            </p>
          </div>

          <div className="col-span-5 mx-auto w-full max-w-[24rem] md:col-start-8">
            <Media
              image={img(
                'encargos-gotas',
                'Pendientes largos de resina con flores moradas sobre la tarjeta del taller',
              )}
              ratio="3 / 4"
              // Un solo valor porque el reparto apenas cambia: cinco doceavos en
              // móvil y algo más de un tercio en escritorio. Lo que ya no vale es
              // el `100vw` de antes para móvil, que traía un archivo del doble de
              // lo que se ve ahora.
              sizes="40vw"
              priority
              className="rounded-t-full border border-line"
            />
          </div>
        </div>

        {/* Con Instagram, como en el cierre de la portada: es donde Ana enseña
            los encargos ya terminados, y quien está decidiendo si mandar sus
            flores quiere verlos antes de escribir. Los tres botones son el mismo
            círculo con el logo dentro y ninguno manda sobre los otros: se elige
            por dónde resulte cómodo escribir, no por cuál está más grande. */}
        <ContactButtons
          message={customOrderMessage}
          subject="Encargo especial"
          action="Contarme mi caso"
          withSocial
          className="mt-14 justify-center"
        />
      </header>

      <section className="mt-(--spacing-section)">
        <h2 className="eyebrow border-b border-line pb-4 text-center">Cómo funciona</h2>
        <ol className="mt-12 grid items-center gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {pasos.map((paso, index) => (
            <Reveal as="li" key={paso.n} step={index} className="text-center">
              <p className="eyebrow text-sage-deep">{paso.n}</p>
              <h3 className="mt-3 font-serif text-lead">{paso.titulo}</h3>
              <p className="mt-2 text-small text-bark-soft">{paso.texto}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <Reveal className="mt-(--spacing-section) border-t border-line pt-12 text-center">
        <p className="mx-auto max-w-2xl font-serif text-title">
          «No hay dos ramos iguales, así que tampoco hay dos precios iguales. Cuéntame el tuyo y lo
          vemos con calma.»
        </p>
        <p className="mt-6 text-small text-bark-faint">Ana</p>
      </Reveal>
    </div>
  )
}
