import type { Metadata } from 'next'
import { ContactButtons } from '@/components/ui/ContactButtons'
import { Reveal } from '@/components/ui/Reveal'
import { site } from '@/content/site'
import { customOrderMessage, whatsappDisplay } from '@/lib/contact'

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Encargos, dudas de talla o tiempos de envío: escribe por WhatsApp, correo o Instagram. Contesta Ana.',
}

/**
 * No hay formulario: Ana ya conversa con sus clientas por mensaje y un
 * formulario sólo añadiría un paso —y un correo que se pierde— entre las dos.
 * La web deja el mensaje escrito; ella responde donde siempre.
 */
export default function ContactoPage() {
  return (
    <div className="page-gutter pt-16 md:pt-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Contacto</p>
        <h1 className="mt-8 font-serif text-title">Cuéntame qué flor quieres guardar</h1>
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
    </div>
  )
}
