import Link from 'next/link'
import { site } from '@/content/site'

/**
 * Sólo la firma. El pie tenía además el lema, un menú y un «Escríbeme» con el
 * correo y el perfil, pero llegaba justo después de la sección de Contacto y
 * repetía lo mismo que acababa de leerse; el menú, además, ya está arriba y
 * viaja fijo con la página. Quitado el bloque, la web termina donde termina la
 * conversación.
 *
 * Sin filete y sin el margen de sección de antes: los dos estaban dimensionados
 * para separar un bloque de tres columnas, y con una sola línea abrían un claro
 * blanco enorme detrás de la banda de Contacto. El aire que queda —`py-16`— es
 * el mismo con el que abren las páginas por arriba, así que la firma cierra a
 * la altura a la que todo empieza.
 */
/**
 * Los enlaces legales vuelven a poner algo en el pie, pero por obligación y no por
 * decoración: la LSSI exige que sean accesibles desde cualquier página, y el pie es
 * el único sitio que lo está. Van en versalitas y debajo de la firma para pesar lo
 * menos posible sobre el cierre.
 */
const legalLinks = [
  { href: '/legal/condiciones', label: 'Condiciones de venta' },
  { href: '/legal/privacidad', label: 'Privacidad' },
  { href: '/legal/cookies', label: 'Cookies' },
]

export function Footer() {
  return (
    <footer className="page-gutter py-16">
      <p className="eyebrow text-center">
        © {new Date().getFullYear()} {site.nameFull}
      </p>

      <nav
        className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
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
