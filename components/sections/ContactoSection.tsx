import { site } from '@/content/site'
import { Reveal } from '@/components/ui/Reveal'
import { SocialLinks } from '@/components/ui/SocialLinks'
import { customOrderMessage, whatsappLink } from '@/lib/contact'

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

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-2 gap-y-3">
          <a
            href={whatsappLink(customOrderMessage)}
            target="_blank"
            rel="noreferrer"
            className="btn"
          >
            Escribir por WhatsApp
          </a>
          {/* Los perfiles, con el mismo botón que el resto de la web pero con el
              logo dentro: al lado del de WhatsApp, dos nombres de red escritos
              competían con la única acción que importa aquí. */}
          <SocialLinks />
        </div>

        <p className="mt-7 text-small text-bark-soft">
          <a href={`mailto:${site.contact.email}`} className="link-underline tap">
            {site.contact.email}
          </a>
        </p>
      </Reveal>
    </section>
  )
}
