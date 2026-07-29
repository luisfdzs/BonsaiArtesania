import { site } from '@/content/site'

/**
 * Sólo la firma. El pie tenía además el lema, un menú y un «Escríbeme» con el
 * correo y el perfil, pero llegaba justo después de la sección de Contacto y
 * repetía lo mismo que acababa de leerse; el menú, además, ya está arriba y
 * viaja fijo con la página. Quitado el bloque, la web termina donde termina la
 * conversación.
 */
export function Footer() {
  return (
    <footer className="mt-(--spacing-section) border-t border-line py-8">
      <p className="eyebrow page-gutter text-center">
        © {new Date().getFullYear()} {site.nameFull}
      </p>
    </footer>
  )
}
