import { pick, type Locale, type Localized } from '@/lib/i18n/config'
import { site } from '@/content/site'

/**
 * Datos para el aviso de privacidad.
 *
 * Existe por una razón concreta: la web pide nombre, teléfono y dirección postal
 * para poder enviar una pieza, y eso es tratamiento de datos personales. El RGPD
 * (art. 13) obliga a decir quién los trata, para qué y cuánto tiempo, **haya o no
 * actividad económica detrás**. Es una obligación de quien recoge los datos, no de
 * quien factura, así que no depende de que Ana esté dada de alta.
 *
 * Por eso aquí **no hay NIF ni domicilio fiscal**: eso lo exige el art. 10 de la
 * LSSI a quien presta servicios con ánimo de lucro, y no es lo que esta web hace.
 * Para identificar al responsable basta un nombre y un medio de contacto.
 *
 * El nombre de `holder` es el de la persona que responde, y aparece tal cual en el
 * aviso: si alguna vez hay que corregirlo, se corrige aquí y en ningún otro sitio.
 */
export const legal = {
  /** Nombre y apellidos de quien responde. `null` → se usa el nombre del taller. */
  holder: 'Ana Ribera Sánchez' as string | null,

  /** Fecha de la última revisión del texto. */
  updated: '2026-08-03',

  /**
   * El nombre de quien responde, con el del taller como respaldo. El respaldo
   * lleva una descripción, y ésa sí se traduce: el nombre propio no.
   */
  responsible(locale: Locale): string {
    return (
      this.holder ??
      `${site.nameFull} (${pick(
        { es: `taller artesanal en ${site.location}`, gl: `taller artesanal en ${site.location}` },
        locale,
      )})`
    )
  },

  /**
   * Encargados del tratamiento: terceros que tratan datos por cuenta nuestra.
   * Hay que mantener esta lista al día, es parte de la información obligatoria.
   *
   * El nombre de la empresa no se traduce —es su razón social—; el para qué y el
   * dónde sí, que es lo que se lee.
   */
  processors: [
    {
      name: 'Vercel Inc.',
      purpose: { es: 'Alojamiento de la web', gl: 'Aloxamento da web' } satisfies Localized,
      location: { es: 'EE. UU. (con CCT)', gl: 'EE. UU. (con CCT)' } satisfies Localized,
    },
    {
      name: 'MongoDB Inc. (Atlas)',
      purpose: {
        es: 'Base de datos de cuentas y peticiones',
        gl: 'Base de datos de contas e peticións',
      } satisfies Localized,
      location: { es: 'UE (París)', gl: 'UE (París)' } satisfies Localized,
    },
    {
      name: 'IONOS SE',
      purpose: {
        es: 'Correo electrónico (códigos de acceso y avisos) y dominio',
        gl: 'Correo electrónico (códigos de acceso e avisos) e dominio',
      } satisfies Localized,
      location: { es: 'UE (Alemania)', gl: 'UE (Alemaña)' } satisfies Localized,
    },
  ],
} as const
