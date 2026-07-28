import Link from 'next/link'
import { site } from '@/content/site'
import { navigation } from '@/lib/navigation'
import { Leaf } from '@/components/ui/Media'
import { SocialLinks } from '@/components/ui/SocialLinks'

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

        {/* «Navegar» y «Escríbeme» van una al lado de la otra en cualquier
            ancho —también en móvil, donde antes se apilaban— porque son dos
            listas cortas: en columna se leen de un vistazo y el pie no se
            alarga. Sub-rejilla propia para que las dos empiecen a la misma
            altura sin depender de la de 12 de fuera. */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:col-span-2 md:col-span-7 md:col-start-6">
          {/* Las listas del sitio se anuncian siempre con una versalita; ésta era
              la única que no lo hacía. */}
          <nav aria-labelledby="pie-navegar">
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
          <div>
            <h2 className="eyebrow">Escríbeme</h2>
            <ul className="mt-6 flex flex-col gap-3 text-small">
              <li>
                <a href={`mailto:${site.contact.email}`} className="link-underline tap w-fit">
                  {site.contact.email}
                </a>
              </li>
            </ul>
            {/* Los perfiles bajan a botones: aquí el logo identifica mejor que
                el nombre escrito, y el pie deja de ser sólo texto. */}
            <SocialLinks className="mt-6" />
          </div>
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
