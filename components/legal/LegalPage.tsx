import { legal, legalComplete } from '@/content/legal'

/**
 * Envoltorio común de las páginas legales: mismo ancho de lectura, misma
 * tipografía y el mismo aviso cuando faltan los datos del responsable.
 *
 * El aviso es deliberadamente visible. Un texto legal con el titular sin rellenar
 * no cumple, y es mejor que se vea en pantalla que enterarse por una reclamación.
 */
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="page-gutter pt-16 pb-(--spacing-section) md:pt-24">
      <article className="max-w-2xl">
        <h1 className="font-serif text-title">{title}</h1>
        <p className="mt-4 text-small text-bark-faint">
          Última actualización:{' '}
          {new Date(legal.updated).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>

        {!legalComplete && (
          <p className="mt-10 border border-petal bg-petal-soft p-5 text-small text-bark-soft">
            <strong className="text-bark">Este texto está incompleto.</strong> Faltan el nombre, el
            NIF y el domicilio del responsable, que son obligatorios y no se pueden suponer. Se
            rellenan en <code>content/legal.ts</code> cuando Ana esté dada de alta.
          </p>
        )}

        <div className="legal-prose mt-12">{children}</div>
      </article>
    </div>
  )
}

/** Bloque «responsable», idéntico en privacidad y en el aviso legal. */
export function Holder() {
  return (
    <ul>
      <li>
        <strong>Titular:</strong> {legal.holder ?? '— pendiente —'}
      </li>
      <li>
        <strong>NIF:</strong> {legal.taxId ?? '— pendiente —'}
      </li>
      <li>
        <strong>Domicilio:</strong> {legal.address ?? '— pendiente —'}
      </li>
      <li>
        <strong>Correo:</strong> bonsai@bonsaiartesania.com
      </li>
    </ul>
  )
}
