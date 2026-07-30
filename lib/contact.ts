import { site } from '@/content/site'

/**
 * En esta primera versión no hay carrito ni pasarela de pago: los pedidos se
 * cierran por mensaje, que es como Ana ya trabaja hoy en Instagram. Lo único que
 * hace la web es dejar el mensaje escrito para que el cliente sólo tenga que
 * darle a enviar.
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

export function orderMessage(productName: string): string {
  return `¡Hola Ana! Me he enamorado de "${productName}" en tu web y me gustaría encargarlo. ¿Me cuentas cómo seguimos?`
}

export const customOrderMessage =
  '¡Hola Ana! Tengo unas flores que me gustaría convertir en joya. ¿Te cuento?'
