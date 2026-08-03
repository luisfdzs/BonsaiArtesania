import { site } from '@/content/site'
import { ContactButtons } from '@/components/ui/ContactButtons'
import { Reveal } from '@/components/ui/Reveal'
import { customOrderMessage, whatsappDisplay } from '@/lib/contact'
import { translator, type Locale } from '@/lib/i18n/config'

/**
 * Cierre del sitio. No hay formulario: Ana ya conversa con sus clientas por
 * mensaje y un formulario sólo añadiría un paso —y un correo que se pierde—
 * entre las dos. La web deja el mensaje escrito; ella responde donde siempre.
 */
export function ContactoSection({ locale }: { locale: Locale }) {
  const t = translator(locale)

  return (
    <section
      id="contacto"
      className="mt-(--spacing-section) bg-linen-deep py-(--spacing-section) page-gutter"
    >
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="eyebrow">Contacto</h2>
        <p className="mt-8 font-serif text-title">
          {t({
            es: 'Cuéntame qué flor quieres guardar',
            gl: 'Cóntame que flor queres gardar',
          })}
        </p>
        <p className="mt-7 text-bark-soft">
          {t({
            es: 'Encargos, dudas de talla, tiempos de envío o simplemente saludar. Escribe por donde te resulte más cómodo: contesto yo, no hay nadie más al otro lado.',
            gl: 'Encargas, dúbidas de talla, prazos de envío ou simplemente saudar. Escribe por onde che resulte máis cómodo: contesto eu, non hai ninguén máis do outro lado.',
          })}
        </p>

        {/* Los tres caminos, los tres iguales: sólo el logo. Escritos, tres
            rótulos seguidos pesaban más que el texto que los precede, y ninguno
            de los tres manda sobre los otros: quien escribe elige por dónde le
            resulta cómodo, no por cuál está más grande. El nombre accesible lo
            pone cada botón. */}
        <ContactButtons
          message={t(customOrderMessage)}
          subject={t({ es: 'Hola', gl: 'Ola' })}
          action={t({ es: 'Escribir', gl: 'Escribir' })}
          withSocial
          className="mt-12 justify-center"
        />

        {/* Los tres, escritos. Debajo de tres logos sólo estaba el correo, así
            que el número y el perfil eran los únicos datos que no se podían
            copiar, dictar por teléfono ni buscar a mano: el logo sirve para
            pulsar, no para apuntar. Mismo orden que los botones de arriba, para
            que cada texto caiga bajo el suyo. */}
        <ul className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-1 text-small text-bark-soft">
          <li>{whatsappDisplay}</li>
          <li>{site.contact.email}</li>
          <li>{site.social.instagramHandle}</li>
        </ul>
      </Reveal>
    </section>
  )
}
