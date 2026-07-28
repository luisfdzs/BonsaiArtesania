import Link from 'next/link'
import { site } from '@/content/site'
import { Leaf } from '@/components/ui/Media'

export function Footer() {
  return (
    <footer className="page-gutter mt-(--spacing-section) border-t border-line py-14">
      <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-sm">
          <Leaf className="mb-5 h-6 w-6 text-sage" />
          <p className="font-serif text-lead">{site.tagline}.</p>
          <p className="mt-2 text-small text-bark-soft">Hecho a mano en {site.location}.</p>
        </div>

        <nav className="flex flex-col gap-3 text-small" aria-label="Pie">
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noreferrer"
            className="link-underline tap w-fit"
          >
            Instagram {site.social.instagramHandle}
          </a>
          <a href={`mailto:${site.contact.email}`} className="link-underline tap w-fit">
            {site.contact.email}
          </a>
          <Link href="/tienda" className="link-underline tap w-fit">
            Ver todas las piezas
          </Link>
        </nav>
      </div>

      <p className="eyebrow mt-14">
        © {new Date().getFullYear()} {site.nameFull}
      </p>
    </footer>
  )
}
