import { TallerSection } from '@/components/sections/TallerSection'
import { Reveal } from '@/components/ui/Reveal'
import { translator, type Locale, type Localized } from '@/lib/i18n/config'

/**
 * Los encargos, que hasta ahora eran una página aparte (`/encargos`).
 *
 * Se ha traído a la portada porque era el sitio al que había que llegar por el
 * menú para enterarse de lo único que la web no vende hecho: que puedes mandar
 * tus flores. Y porque lo que contaba —cómo se seca, cuánto tarda, quién lo
 * hace— es lo mismo que contaba «El taller» dos secciones más abajo, dicho dos
 * veces en dos sitios. Ahora es una sola sección: primero el encargo, que es lo
 * que se pide, y debajo el taller, que es cómo se hace.
 *
 * `id="encargos"` es el destino del menú y de la redirección de la vieja
 * dirección; el taller conserva el suyo dentro (ver `TallerSection`), así que los
 * enlaces a `/#taller` y a `/el-taller` siguen cayendo donde caían.
 */
const pasos: { n: string; titulo: Localized; texto: Localized }[] = [
  {
    n: '01',
    titulo: { es: 'Me escribes', gl: 'Escríbesme' },
    texto: {
      es: 'Me cuentas qué flores son y qué te gustaría llevar puesto. Sin compromiso.',
      gl: 'Cóntasme que flores son e que che gustaría levar posto. Sen compromiso.',
    },
  },
  {
    n: '02',
    titulo: { es: 'Me las envías', gl: 'Mándasmas' },
    texto: {
      es: 'Cuanto más frescas lleguen, mejor conservan el color. Te explico cómo empaquetarlas.',
      gl: 'Canto máis frescas cheguen, mellor conservan a cor. Explícoche como empaquetalas.',
    },
  },
  {
    n: '03',
    titulo: { es: 'Secado', gl: 'Secado' },
    texto: {
      es: 'De dos a cuatro semanas de prensa. Es lo que decide el resultado, y no se puede correr.',
      gl: 'De dúas a catro semanas de prensa. É o que decide o resultado, e non se pode correr.',
    },
  },
  {
    n: '04',
    titulo: { es: 'Te la envío', gl: 'Mándocha' },
    texto: {
      es: 'Antes de cerrar nada te enseño fotos. La pieza sale en su caja, lista para regalar.',
      gl: 'Antes de pechar nada ensínoche fotos. A peza sae na súa caixa, lista para regalar.',
    },
  },
]

export function EncargosSection({ locale }: { locale: Locale }) {
  const t = translator(locale)

  return (
    <section id="encargos" className="page-gutter pt-(--spacing-section)">
      {/* Sólo texto, centrado y a una columna.

          Antes esto era una pareja de columnas —el texto a la izquierda, una foto
          en forma de arco a la derecha— y debajo los tres botones de contacto.
          Fuera las dos cosas. La foto no contaba nada del encargo: eran unos
          pendientes ya hechos, como los cien de la tienda, y el arco le daba a la
          sección una forma que no tiene ninguna otra de la página. Y los botones
          repetían aquí los del cierre de la portada, tres secciones más abajo:
          quien acaba de leer que puede mandar sus flores no necesita elegir
          canal a mitad de la página, lo hace al final, donde está la despedida.

          Lo que queda es lo que se lee, y por eso va centrado y con el ancho
          topado: un párrafo a todo lo ancho de una pantalla de 1920 no se lee.

          Y en escritorio el texto y los pasos son **un solo bloque**: el qué a la
          izquierda y el cómo a la derecha, a la misma altura. Iban uno debajo del
          otro con un tramo de sección entre medias, así que había que bajar para
          enterarse de que mandar tus flores es cuatro pasos y no un misterio, y
          justo esa es la duda que frena a quien está leyendo el párrafo de al
          lado. Debajo de `lg` vuelven a apilarse: dos columnas de esto en una
          tableta dejarían los pasos en cuatro cajas de nada. */}
      <div className="mx-auto grid max-w-6xl items-center gap-x-16 gap-y-(--spacing-section) lg:grid-cols-12">
        <header className="text-center lg:col-span-5">
          <h2 className="eyebrow">{t({ es: 'Encargos', gl: 'Encargas' })}</h2>
          {/* Era el `<h1>` de la página de encargos; en la portada el titular de
              la página es el del hero, así que aquí baja un nivel y se queda con
              el tamaño, que es lo que hacía el trabajo. */}
          <p className="mt-7 font-serif text-display">
            {t({ es: 'Vuestras flores', gl: 'As vosas flores' })}
          </p>
          <p className="mx-auto mt-8 max-w-prose text-bark-soft">
            {t({
              es: 'El ramo de una boda, las flores de un aniversario, la planta de alguien que ya no está. Todas se secan. Lo que hago es pararlas justo antes y convertirlas en algo que puedas llevar contigo.',
              gl: 'O ramo dunha voda, as flores dun aniversario, a planta de alguén que xa non está. Todas se secan. O que fago é paralas xusto antes e convertelas en algo que poidas levar contigo.',
            })}
          </p>
        </header>

        <div className="lg:col-span-6 lg:col-start-7">
          <h3 className="eyebrow border-b border-line pb-4 text-center">
            {t({ es: 'Cómo funciona', gl: 'Como funciona' })}
          </h3>
          {/* Dos filas de dos y no cuatro en fila —ni cuatro apilados en móvil—:
              los cuatro pasos son dos parejas, lo que haces tú y lo que hago yo,
              y en una tira de cuatro columnas cada paso quedaba tan estrecho que
              el texto se partía en cinco líneas. En cuadro se leen de un vistazo
              a cualquier ancho, y es lo que deja que quepan al lado del texto sin
              alargar la sección. El hueco lateral crece con la pantalla: a 360px
              cada píxel de aire entre columnas se lo quita a las palabras. */}
          <ol className="mx-auto mt-12 grid max-w-4xl grid-cols-2 items-start gap-x-6 gap-y-12 sm:gap-x-10">
            {pasos.map((paso, index) => (
              <Reveal as="li" key={paso.n} step={index} className="text-center">
                <p className="eyebrow text-sage-deep">{paso.n}</p>
                <h4 className="mt-3 font-serif text-lead">{t(paso.titulo)}</h4>
                <p className="mt-2 text-small text-bark-soft">{t(paso.texto)}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>

      <Reveal className="mt-(--spacing-section) border-t border-line pt-12 text-center">
        <p className="mx-auto max-w-2xl font-serif text-title">
          {t({
            es: '«No hay dos ramos iguales, así que no hay dos piezas iguales. Cuéntame el tuyo y lo vemos con calma.»',
            gl: '«Non hai dous ramos iguais, así que non hai dúas pezas iguais. Cóntame o teu e vémolo con calma.»',
          })}
        </p>
        <p className="mt-6 text-small text-bark-faint">Ana</p>
      </Reveal>

      {/* Y debajo, cómo se hace: el taller cierra la sección. Trae su propio aire
          y su propio `id`, así que aquí no hace falta nada más. */}
      <TallerSection locale={locale} />
    </section>
  )
}
