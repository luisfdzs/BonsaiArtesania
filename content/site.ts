/**
 * Datos del sitio. Todo lo editable a mano vive en `content/`: quien mantenga la
 * web no debería tener que abrir un componente para cambiar un teléfono.
 */
export const site = {
  name: 'Bonsái',
  nameFull: 'Bonsái Artesanía',
  tagline: 'Joyas y piezas únicas en resina y flor natural',
  /** Dirección canónica: la que la web declara como suya en `metadataBase`
   *  (`app/layout.tsx`) y en el sitemap. Es el apex del `.com`, sin `www`; el
   *  `.es`, el `.info` y el `.store` sólo redirigen aquí con un 308, así que
   *  ninguno debe aparecer en los metadatos. */
  url: 'https://bonsaiartesania.com',
  location: 'Galicia',
  intro:
    'Flores recogidas, secadas y guardadas para siempre en resina. Cada pieza se hace a mano, de una en una, y no vuelve a repetirse.',
  social: {
    instagram: 'https://www.instagram.com/san.bonsai_/',
    instagramHandle: '@san.bonsai_',
  },
  contact: {
    /** El mismo buzón que va impreso en las tarjetas (`disenos/tarjetas/`). */
    email: 'bonsai@bonsaiartesania.com',
    /** Formato internacional sin signos, para el enlace de WhatsApp.
     *  Ojo: NO es el número impreso en las tarjetas (`disenos/tarjetas/`, que
     *  lleva el `+34 660 26 98 72`). Si alguno de los dos es un despiste, hay
     *  que corregirlo aquí y allí a la vez. */
    whatsapp: '34658170562',
  },
} as const
