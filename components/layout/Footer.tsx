import Link from 'next/link'
import { site } from '@/content/site'
import { Leaf } from '@/components/ui/Media'

export function Footer() {
  return (
    <footer className="mt-(--spacing-section) border-t border-line">
      <div className="page-gutter flex flex-col gap-10 py-14 md:flex-row md:items-end md:justify-between">
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

      <div className="w-full border-t border-line py-8">
        <p className="eyebrow page-gutter text-center">
          © {new Date().getFullYear()} {site.nameFull}
        </p>
      </div>
    </footer>
  )
}
