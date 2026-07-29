import { site } from '@/content/site'
import { ContactButtons } from '@/components/ui/ContactButtons'
import { Reveal } from '@/components/ui/Reveal'
import { customOrderMessage } from '@/lib/contact'

/**
 * Cierre del sitio. No hay formulario: Ana ya conversa con sus clientas por
 * mensaje y un formulario sólo añadiría un paso —y un correo que se pierde—
 * entre las dos. La web deja el mensaje escrito; ella responde donde siempre.
 */
export function ContactoSection() {
  return (
    <section
      id="contacto"
      className="mt-(--spacing-section) bg-linen-deep py-(--spacing-section) page-gutter"
    >
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="eyebrow">Contacto</h2>
        <p className="mt-8 font-serif text-title">Cuéntame qué flor quieres guardar</p>
        <p className="mt-7 text-bark-soft">
          Encargos, dudas de talla, tiempos de envío o simplemente saludar. Escribe por donde te
          resulte más cómodo: contesto yo, no hay nadie más al otro lado.
        </p>

        {/* Los tres caminos, los tres iguales: sólo el logo. Escritos, tres
            rótulos seguidos pesaban más que el texto que los precede, y ninguno
            de los tres manda sobre los otros: quien escribe elige por dónde le
            resulta cómodo, no por cuál está más grande. El nombre accesible lo
            pone cada botón. */}
        <ContactButtons
          message={customOrderMessage}
          subject="Hola"
          action="Escribir"
          withSocial
          className="mt-12 justify-center"
        />

        <p className="mt-7 text-small text-bark-soft">{site.contact.email}</p>
      </Reveal>
    </section>
  )
}
