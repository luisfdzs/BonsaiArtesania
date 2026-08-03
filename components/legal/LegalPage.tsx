import { legal } from '@/content/legal'
import { localeHtmlLang, translator, type Locale } from '@/lib/i18n/config'

/**
 * Envoltorio del aviso de privacidad: ancho de lectura, la fecha de revisión y la
 * tipografía de texto corrido (`legal-prose` en globals.css).
 *
 * Vive aparte de la página aunque hoy sólo la use ella: si mañana hace falta un
 * segundo aviso, el encabezado y el ritmo vertical ya están decididos en un sitio.
 */
export function LegalPage({
  title,
  locale,
  children,
}: {
  title: string
  locale: Locale
  children: React.ReactNode
}) {
  const t = translator(locale)

  return (
    <div className="page-gutter pt-16 pb-(--spacing-section) md:pt-24">
      <article className="max-w-2xl">
        <h1 className="font-serif text-title">{title}</h1>
        <p className="mt-4 text-small text-bark-faint">
          {t({ es: 'Última actualización:', gl: 'Última actualización:' })}{' '}
          {/* La fecha también se escribe en el idioma de la página: en galego los
              meses se llaman de otra manera («agosto» coincide, «xaneiro» no). */}
          {new Date(legal.updated).toLocaleDateString(localeHtmlLang[locale], {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>

        <div className="legal-prose mt-12">{children}</div>
      </article>
    </div>
  )
}
