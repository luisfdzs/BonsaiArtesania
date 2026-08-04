import { Media } from '@/components/ui/Media'
import { Reveal } from '@/components/ui/Reveal'
import { translator, type Locale, type Localized } from '@/lib/i18n/config'
import { img } from '@/lib/media'

const pasos: { n: string; titulo: Localized; texto: Localized }[] = [
  {
    n: '01',
    titulo: { es: 'Recoger', gl: 'Recoller' },
    texto: {
      es: 'Flores y hojas de campo gallego, en su momento justo.',
      gl: 'Flores e follas de campo galego, no seu momento xusto.',
    },
  },
  {
    n: '02',
    titulo: { es: 'Secar', gl: 'Secar' },
    texto: {
      es: 'Semanas de prensa y silencio. Es la parte lenta.',
      gl: 'Semanas de prensa e silencio. É a parte lenta.',
    },
  },
  {
    n: '03',
    titulo: { es: 'Resina', gl: 'Resina' },
    texto: {
      es: 'Colocada una a una, sin prisa, y curada dos días.',
      gl: 'Colocada unha a unha, sen presa, e curada dous días.',
    },
  },
  {
    n: '04',
    titulo: { es: 'Pulir', gl: 'Puír' },
    texto: {
      es: 'A mano, hasta que la luz entra limpia.',
      gl: 'A man, ata que a luz entra limpa.',
    },
  },
]

/**
 * Cómo se hace una pieza. Ya no es una sección de primer nivel de la portada:
 * vive dentro de «Encargos» (ver `EncargosSection`), debajo del encargo, porque
 * las dos cosas contaban lo mismo —el secado, las semanas, que lo hace una
 * persona— en dos sitios distintos de la misma página.
 *
 * De ahí que no lleve `page-gutter`: el margen lateral lo pone ya la sección que
 * la contiene, y repetirlo aquí doblaría el hueco contra los bordes. Conserva en
 * cambio su `id`, que es a donde apuntan «El taller» del menú y la redirección de
 * `/el-taller`.
 */
export function TallerSection({ locale }: { locale: Locale }) {
  const t = translator(locale)

  return (
    <section id="taller" className="pt-(--spacing-section)">
      <div className="grid gap-14 md:grid-cols-12 md:items-center md:gap-12">
        <Reveal className="md:col-span-5">
          <Media
            image={img(
              'taller-manos',
              t({
                es: 'Una mano con anillos de resina entre espigas de campo',
                gl: 'Unha man con aneis de resina entre espigas de campo',
              }),
            )}
            ratio="4 / 5"
            sizes="(max-width: 768px) 100vw, 40vw"
            className="border border-line"
          />
        </Reveal>

        <div className="text-center md:col-span-6 md:col-start-7">
          <Reveal>
            <h2 className="eyebrow">{t({ es: 'El taller', gl: 'O taller' })}</h2>
            <p className="mt-7 font-serif text-title">
              {t({
                es: 'Cada pieza tarda semanas en estar lista, y sólo existe una vez.',
                gl: 'Cada peza tarda semanas en estar lista, e só existe unha vez.',
              })}
            </p>
            <p className="mx-auto mt-7 max-w-prose text-bark-soft">
              {t({
                es: 'Soy Ana. Recojo las flores, las seco, las coloco de una en una y las guardo en resina. No hay moldes en serie ni dos piezas iguales: la flor decide cómo va a quedar y yo la acompaño.',
                gl: 'Son Ana. Recollo as flores, sécoas, colócoas dunha en unha e gárdoas en resina. Non hai moldes en serie nin dúas pezas iguais: a flor decide como vai quedar e eu acompáñoa.',
              })}
            </p>
          </Reveal>

          <ol className="mt-14 grid items-center gap-x-10 gap-y-9 sm:grid-cols-2">
            {pasos.map((paso, index) => (
              <Reveal as="li" key={paso.n} step={index} className="text-center">
                <p className="eyebrow text-sage-deep">{paso.n}</p>
                <h3 className="mt-3 font-serif text-lead">{t(paso.titulo)}</h3>
                <p className="mt-1 text-small text-bark-soft">{t(paso.texto)}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
