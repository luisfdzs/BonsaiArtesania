import Link from 'next/link'
import { site } from '@/content/site'
import { navigation } from '@/lib/navigation'
import { Leaf } from '@/components/ui/Media'

export function Footer() {
  return (
    <footer className="mt-(--spacing-section) border-t border-line">
      {/* La misma retícula de 12 que el resto del sitio. Con dos bloques sueltos
          en los extremos el pie abría un vacío enorme en pantalla ancha; con
          tres columnas medidas, el aire queda repartido en lugar de acumulado. */}
      <div className="page-gutter grid gap-x-8 gap-y-12 py-16 sm:grid-cols-2 md:grid-cols-12">
        <div className="sm:col-span-2 md:col-span-4">
          <Leaf className="mb-5 h-6 w-6 text-sage" />
          {/* Sin equilibrar, el lema deja «natural.» sola en la segunda línea. */}
          <p className="font-serif text-lead text-balance">{site.tagline}.</p>
          <p className="mt-2 text-small text-bark-soft">Hecho a mano en {site.location}.</p>
        </div>

        {/* Las listas del sitio se anuncian siempre con una versalita; ésta era
            la única que no lo hacía. */}
        <nav className="md:col-span-3 md:col-start-6" aria-labelledby="pie-navegar">
          <h2 id="pie-navegar" className="eyebrow">
            Navegar
          </h2>
          <ul className="mt-6 flex flex-col gap-3 text-small">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-underline tap w-fit">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Un div, no un <nav>: escribir no es navegar. Y sin `aria-labelledby`,
            que en un div no crea landmark y sólo repetiría el encabezado. */}
        <div className="md:col-span-3 md:col-start-10">
          <h2 className="eyebrow">Escríbeme</h2>
          <ul className="mt-6 flex flex-col gap-3 text-small">
            <li>
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="link-underline tap w-fit"
              >
                Instagram {site.social.instagramHandle}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.contact.email}`} className="link-underline tap w-fit">
                {site.contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full border-t border-line py-8">
        <p className="eyebrow page-gutter text-center">
          © {new Date().getFullYear()} {site.nameFull}
        </p>
      </div>
    </footer>
  )
}
