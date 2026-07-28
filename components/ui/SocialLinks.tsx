import { site } from '@/content/site'
import { cn } from '@/lib/cn'
import { InstagramIcon, LinkedInIcon } from '@/components/ui/SocialIcons'

/**
 * Los perfiles de Ana, siempre con la misma cara: un botón redondo del sistema
 * con el logo dentro. Vive en un único sitio para que pie y contacto no se
 * separen nunca, y porque el nombre accesible es lo que más se olvida al
 * repetir un botón sin texto visible.
 */
const profiles = [
  {
    href: site.social.instagram,
    /** El nombre accesible dice también el usuario: quien no ve el logo
     *  merece saber a qué cuenta va. */
    label: `Instagram ${site.social.instagramHandle}`,
    Icon: InstagramIcon,
  },
  {
    href: site.social.linkedin,
    label: 'LinkedIn',
    Icon: LinkedInIcon,
  },
].filter((profile) => Boolean(profile.href))

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
