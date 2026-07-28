/**
 * Datos del sitio. Todo lo editable a mano vive en `content/`: quien mantenga la
 * web no debería tener que abrir un componente para cambiar un teléfono.
 *
 * PENDIENTE (Ana): revisar `email` y `whatsapp` — están puestos como marcador.
 */
export const site = {
  name: 'Bonsái',
  nameFull: 'Bonsái Artesanía',
  tagline: 'Joyas y piezas únicas en resina y flor natural',
  /** Se usa en metadatos y en el pie. Cambiar al dominio definitivo. */
  url: 'https://bonsaiartesania.es',
  location: 'Galicia',
  intro:
    'Flores recogidas, secadas y guardadas para siempre en resina. Cada pieza se hace a mano, de una en una, y no vuelve a repetirse.',
  social: {
    instagram: 'https://www.instagram.com/san.bonsai_/',
    instagramHandle: '@san.bonsai_',
  },
  contact: {
    email: 'hola@bonsaiartesania.es',
    /** Formato internacional sin signos, para el enlace de WhatsApp. */
    whatsapp: '34600000000',
  },
} as const
