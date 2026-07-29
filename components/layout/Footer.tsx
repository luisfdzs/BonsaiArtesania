import { site } from '@/content/site'

/**
 * Sólo la firma. El pie tenía además el lema, un menú y un «Escríbeme» con el
 * correo y el perfil, pero llegaba justo después de la sección de Contacto y
 * repetía lo mismo que acababa de leerse; el menú, además, ya está arriba y
 * viaja fijo con la página. Quitado el bloque, la web termina donde termina la
 * conversación.
 *
 * Sin el margen de sección de antes —hasta 12rem, dimensionado para separar un
 * bloque de tres columnas— la firma cierra con el mismo aire con el que abren
 * las páginas por arriba. El filete sí vuelve: sin él, la firma quedaba suelta
 * detrás de la banda de Contacto, como si se hubiera caído de la sección. Va
 * dentro del margen lateral, como todas las líneas horizontales de la web, y no
 * de borde a borde de la ventana.
 */
export function Footer() {
  return (
    <footer className="page-gutter pt-16">
      <p className="eyebrow border-t border-line py-8 text-center">
        © {new Date().getFullYear()} {site.nameFull}
      </p>
    </footer>
  )
}
