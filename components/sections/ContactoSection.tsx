import { site } from '@/content/site'
import { Reveal } from '@/components/ui/Reveal'
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
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noreferrer"
            className="btn btn-quiet"
          >
            Instagram {site.social.instagramHandle}
          </a>
          {/* El correo era el único de los tres caminos que no parecía pulsable.
              Ahora es un botón más, con el sobre de Gmail como marca de "esto
              abre tu correo". El icono se pinta con máscara y no con <img>: así
              hereda `currentColor` y cambia de color en el hover como el texto. */}
          <a href={`mailto:${site.contact.email}`} className="btn btn-quiet">
            <span
              aria-hidden
              className="h-4 w-4 bg-current [mask-image:url(/gmail.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
            />
            Escribir un correo
          </a>
        </div>

        <p className="mt-7 text-small text-bark-soft">{site.contact.email}</p>
      </Reveal>
    </section>
  )
}
