import { cn } from '@/lib/cn'
import { GmailIcon, WhatsAppIcon } from '@/components/ui/SocialIcons'
import { SocialLinks } from '@/components/ui/SocialLinks'
import { mailtoLink, whatsappLink } from '@/lib/contact'

/**
 * Los dos caminos para escribir a Ana —WhatsApp y correo—, siempre con la misma
 * cara que los perfiles: botón redondo con el logo dentro y sin texto. Vive en
 * un único sitio porque la parte que se pierde al quitar el rótulo es el nombre
 * accesible, y eso no puede depender de que cada página se acuerde de ponerlo.
 */
type Props = {
  /** El mensaje ya escrito que abre cualquiera de los dos caminos. */
  message: string
  /** Asunto del correo. WhatsApp no tiene asunto, por eso no lo comparte. */
  subject: string
  /**
   * Qué se pide desde aquí, en infinitivo: es lo único que queda del texto del
   * botón, así que va al nombre accesible y al tooltip («Escribir a Ana por
   * WhatsApp»). Sin él, tres logos seguidos no dicen a qué llevan.
   */
  action: string
  /** Los perfiles, cuando la sección los enseña en la misma fila. */
  withSocial?: boolean
  className?: string
}

export function ContactButtons({ message, subject, action, withSocial, className }: Props) {
  // El infinitivo lo trae `action` ya traducido de cada página; aquí sólo se le
  // pega el camino. «por WhatsApp» y «por correo» se escriben igual en los dos
  // idiomas, así que no pasan por el traductor: fingir que se traducen sería
  // ruido para quien lea esto luego.
  const byWhatsApp = `${action} por WhatsApp`
  const byMail = `${action} por correo`

  return (
    <div className={cn('flex flex-wrap items-center gap-x-2 gap-y-3', className)}>
      <a
        href={whatsappLink(message)}
        target="_blank"
        rel="noreferrer"
        aria-label={byWhatsApp}
        title={byWhatsApp}
        className="btn btn-icon"
      >
        <WhatsAppIcon className="h-4 w-4" />
      </a>
      <a
        href={mailtoLink(subject, message)}
        aria-label={byMail}
        title={byMail}
        className="btn btn-icon btn-quiet"
      >
        <GmailIcon className="h-4 w-4" />
      </a>
      {withSocial ? <SocialLinks /> : null}
    </div>
  )
}
