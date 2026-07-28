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

export function mailtoLink(subject: string, body: string): string {
  const params = new URLSearchParams({ subject, body })
  return `mailto:${site.contact.email}?${params.toString()}`
}

export function orderMessage(productName: string): string {
  return `¡Hola Ana! Me he enamorado de "${productName}" en tu web y me gustaría encargarlo. ¿Me cuentas cómo seguimos?`
}

export const customOrderMessage =
  '¡Hola Ana! Tengo unas flores que me gustaría convertir en joya. ¿Te cuento?'
