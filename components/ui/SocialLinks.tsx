import { site } from '@/content/site'
import { cn } from '@/lib/cn'
import { InstagramIcon } from '@/components/ui/SocialIcons'

/**
 * Los perfiles de Ana, siempre con la misma cara: un botón redondo del sistema
 * con el logo dentro. Vive en un único sitio para que pie y contacto no se
 * separen nunca, y porque el nombre accesible es lo que más se olvida al
 * repetir un botón sin texto visible.
 *
 * De momento sólo Instagram: es la única red donde Ana publica. La lista se
 * mantiene como lista para que añadir otra sea una entrada más, no un rediseño.
 */
const profiles = [
  {
    href: site.social.instagram,
    /** El nombre accesible dice también el usuario: quien no ve el logo
     *  merece saber a qué cuenta va. */
    label: `Instagram ${site.social.instagramHandle}`,
    Icon: InstagramIcon,
  },
]

export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-2', className)}>
      {profiles.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            title={label}
            className="btn btn-icon"
          >
            <Icon className="h-4 w-4" />
          </a>
        </li>
      ))}
    </ul>
  )
}
