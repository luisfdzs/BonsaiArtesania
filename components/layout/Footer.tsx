import Link from 'next/link'
import { site } from '@/content/site'

/**
 * La firma y el aviso de privacidad. El pie tenía además el lema, un menú y un
 * «Escríbeme» con el correo y el perfil, pero llegaba justo después de la sección
 * de Contacto y repetía lo mismo que acababa de leerse; el menú, además, ya está
 * arriba y viaja fijo con la página.
 *
 * El enlace de privacidad está aquí por obligación y no por decoración: el aviso
 * tiene que ser accesible desde cualquier página, y el pie es el único sitio que lo
 * está en todas.
 *
 * Sin el margen de sección de antes —hasta 12rem, dimensionado para separar un
 * bloque de tres columnas— el cierre respira con el mismo aire con el que abren
 * las páginas por arriba. El filete sí vuelve: sin él, la firma quedaba suelta
 * detrás de la banda de Contacto, como si se hubiera caído de la sección. Va
 * dentro del margen lateral, como todas las líneas horizontales de la web, y no
 * de borde a borde de la ventana.
 */
export function Footer() {
  return (
    <footer className="page-gutter pt-16 pb-14">
      {/* El filete lo lleva la firma, no el <footer>: así queda dentro del
          margen lateral. */}
      <p className="eyebrow border-t border-line pt-12 text-center">
        © {new Date().getFullYear()} {site.nameFull}
      </p>

      <p className="mt-8 text-center">
        <Link href="/legal/privacidad" className="link-underline tap eyebrow">
          Privacidad
        </Link>
      </p>
    </footer>
  )
}
