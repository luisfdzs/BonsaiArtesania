/**
 * Datos legales del sitio.
 *
 * ⚠️ PENDIENTE (Ana): los tres campos marcados abajo son obligatorios por la LSSI
 * (art. 10) y por el RGPD para identificar al responsable del tratamiento, y **no
 * se pueden inventar**. Hasta que estén rellenos, las páginas legales avisan de
 * que están incompletas en lugar de mostrar datos falsos.
 *
 * Tampoco es lo único que hace falta antes de vender de verdad: para cobrar hay
 * que estar dado de alta como autónoma o sociedad, y ese alta es la que da el NIF
 * y el domicilio que van aquí.
 */
export const legal = {
  /** Nombre y apellidos, o razón social. */
  holder: null as string | null,
  /** NIF o CIF. */
  taxId: null as string | null,
  /** Domicilio a efectos de notificaciones. */
  address: null as string | null,

  /** Fecha de la última revisión de los textos legales. */
  updated: '2026-07-29',

  /**
   * Encargados del tratamiento: terceros que tratan datos por cuenta nuestra.
   * Hay que mantener esta lista al día, es parte de la información obligatoria.
   */
  processors: [
    { name: 'Vercel Inc.', purpose: 'Alojamiento de la web', location: 'EE. UU. (con CCT)' },
    {
      name: 'MongoDB Inc. (Atlas)',
      purpose: 'Base de datos de cuentas y pedidos',
      location: 'UE (París)',
    },
    { name: 'Google Ireland Ltd.', purpose: 'Acceso con cuenta de Google', location: 'UE' },
    { name: 'IONOS SE', purpose: 'Correo electrónico y dominio', location: 'UE (Alemania)' },
  ],
} as const

/** ¿Se pueden publicar los textos legales sin mentir? */
export const legalComplete = Boolean(legal.holder && legal.taxId && legal.address)
