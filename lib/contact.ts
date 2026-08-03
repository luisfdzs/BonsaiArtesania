import { site } from '@/content/site'
import { pick, type Locale, type Localized } from '@/lib/i18n/config'

/**
 * Los encargos se organizan por mensaje, que es como Ana ya trabaja hoy en
 * Instagram. Lo único que hace la web es dejar el mensaje escrito para que quien
 * escribe sólo tenga que darle a enviar.
 */
export function whatsappLink(message: string): string {
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`
}

/**
 * El mismo número del enlace, escrito como se lee en voz alta. El enlace lo
 * necesita seguido y sin signos, y una persona no: en vez de guardar el número
 * dos veces —y arriesgarse a que sólo se corrija uno—, se escribe desde el que
 * ya hay en `content/site.ts`.
 */
export const whatsappDisplay = site.contact.whatsapp.replace(
  /^(\d{2})(\d{3})(\d{2})(\d{2})(\d{2})$/,
  '+$1 $2 $3 $4 $5',
)

export function mailtoLink(subject: string, body: string): string {
  const params = [`subject=${encodeURIComponent(subject)}`, `body=${encodeURIComponent(body)}`]
  return `mailto:${site.contact.email}?${params.join('&')}`
}

/**
 * El mensaje que la web deja escrito, en el idioma en el que se estaba leyendo:
 * quien navega en galego escribe en galego, y a Ana le llega en el idioma en el
 * que va a tener que contestar.
 *
 * En galego van sin los signos de apertura (`¡`, `¿`): la norma de la RAG sólo
 * usa los de cierre.
 */
export function orderMessage(productName: string, locale: Locale): string {
  return pick(
    {
      es: `¡Hola Ana! Me he enamorado de "${productName}" en tu web y me gustaría encargarlo. ¿Me cuentas cómo seguimos?`,
      gl: `Ola, Ana! Namoreime de "${productName}" na túa web e gustaríame encargalo. Cóntasme como seguimos?`,
    },
    locale,
  )
}

export const customOrderMessage: Localized = {
  es: '¡Hola Ana! Tengo unas flores que me gustaría convertir en joya. ¿Te cuento?',
  gl: 'Ola, Ana! Teño unhas flores que me gustaría converter en xoia. Cóntoche?',
}
