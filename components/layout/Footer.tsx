import Link from 'next/link'
import { site } from '@/content/site'

/**
 * La firma y los enlaces legales. El pie tenía además el lema, un menú y un
 * «Escríbeme» con el correo y el perfil, pero llegaba justo después de la sección
 * de Contacto y repetía lo mismo que acababa de leerse; el menú, además, ya está
 * arriba y viaja fijo con la página.
 *
 * Sin el margen de sección de antes —hasta 12rem, dimensionado para separar un
 * bloque de tres columnas— el cierre respira con el mismo aire con el que abren
 * las páginas por arriba. El filete sí vuelve: sin él, la firma quedaba suelta
 * detrás de la banda de Contacto, como si se hubiera caído de la sección. Va
 * dentro del margen lateral, como todas las líneas horizontales de la web, y no
 * de borde a borde de la ventana.
 *
 * Lo único que se ha añadido al bloque mínimo son los enlaces legales, y es por
 * obligación y no por decoración: la LSSI exige que sean accesibles desde
 * cualquier página, y el pie es el único sitio que lo está en todas. Van en
 * versalitas y debajo de la firma para pesar lo menos posible sobre el cierre.
 */
const legalLinks = [
  { href: '/legal/condiciones', label: 'Condiciones de venta' },
  { href: '/legal/privacidad', label: 'Privacidad' },
  { href: '/legal/cookies', label: 'Cookies' },
]

export function Footer() {
  return (
    <footer className="page-gutter pt-16 pb-14">
      {/* El filete lo lleva la firma, no el <footer>: así queda dentro del
          margen lateral. Antes cerraba con `py-8`; ahora sólo abre, porque
          debajo viene la fila de enlaces. El aire del cierre va holgado en los
          tres huecos —filete/firma, firma/legales y legales/borde inferior—
          porque en versalitas y centrado el bloque se lee como una sola mancha
          si se aprieta. */}
      <p className="eyebrow border-t border-line pt-12 text-center">
        © {new Date().getFullYear()} {site.nameFull}
      </p>

      <nav
        className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        aria-label="Información legal"
      >
        {legalLinks.map((link) => (
          <Link key={link.href} href={link.href} className="link-underline tap eyebrow">
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  )
}
