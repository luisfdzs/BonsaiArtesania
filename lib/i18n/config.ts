/**
 * IDIOMAS
 *
 * Dos: castellano y galego. El taller está en Galicia y Ana atiende en los dos,
 * así que la web tenía que hacer lo mismo. El castellano es el de por defecto
 * porque es el que ya estaba escrito y el que llevan todos los enlaces que hay
 * dados por ahí —ver la redirección de `proxy.ts`—, no porque manden más.
 *
 * El idioma va en la dirección (`/es/tienda`, `/gl/tienda`) y no en una cookie.
 * Cuesta más —hay que llevarlo a cada enlace del sitio— pero es lo único que
 * deja compartir un enlace en el idioma en el que se estaba leyendo, y lo único
 * que Google puede indexar dos veces en vez de una.
 */
export const locales = ['es', 'gl'] as const
export const defaultLocale = 'es' satisfies Locale

export type Locale = (typeof locales)[number]

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/**
 * Las etiquetas del selector, cada una **en su propio idioma**: quien busca el
 * galego busca la palabra «Galego», no «Gallego», y al contrario. Así el selector
 * se entiende sin saber en qué idioma está la página que se está mirando, que es
 * justo la situación de quien va a usarlo.
 */
export const localeNames: Record<Locale, string> = {
  es: 'Castellano',
  gl: 'Galego',
}

/** Para el `lang` del documento y los `hreflang` de los alternates. */
export const localeHtmlLang: Record<Locale, string> = {
  es: 'es-ES',
  gl: 'gl-ES',
}

/** Para `og:locale`. */
export const localeOpenGraph: Record<Locale, string> = {
  es: 'es_ES',
  gl: 'gl_ES',
}

/**
 * Un texto que existe en los dos idiomas. Todo lo que se lee en pantalla tiene
 * esta forma, así que si algún día entra un tercer idioma TypeScript señala uno
 * por uno los que faltan por traducir en vez de dejarlos caer en blanco.
 */
export type Localized<T = string> = Record<Locale, T>

/**
 * El traductor de un idioma concreto: se pide una vez por componente y se usa
 * sobre cada texto suelto.
 *
 * ```tsx
 * const t = translator(locale)
 * <h1>{t({ es: 'Vuestras flores', gl: 'As vosas flores' })}</h1>
 * ```
 *
 * **Por qué las traducciones viven pegadas al texto y no en un diccionario
 * aparte con claves.** Un diccionario obliga a inventar un nombre para cada
 * frase de la web y a leer dos ficheros a la vez para saber qué dice un
 * párrafo; aquí las dos versiones están una debajo de la otra, se cambian
 * juntas y ninguna se queda atrás sin que se note. El precio es que los textos
 * no se pueden editar sin abrir el componente, y lo pagamos a gusto: quien
 * edita esta web es quien la programa. Lo que sí sigue en `content/` es lo que
 * de verdad es un dato —el catálogo, el aviso legal, el teléfono—.
 */
export function translator(locale: Locale) {
  return <T,>(value: Localized<T>): T => value[locale]
}

/** Lo mismo para un solo texto, cuando no merece la pena guardarse el traductor. */
export function pick<T>(value: Localized<T>, locale: Locale): T {
  return value[locale]
}
