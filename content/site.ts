import type { Localized } from '@/lib/i18n/config'

/**
 * Datos del sitio. Todo lo editable a mano vive en `content/`: quien mantenga la
 * web no debería tener que abrir un componente para cambiar un teléfono.
 *
 * El nombre no se traduce —es el nombre— y tampoco la comarca. Lo que sí, el
 * lema y la presentación, que son frases.
 */
export const site = {
  name: 'Bonsái',
  nameFull: 'Bonsái Artesanía',
  tagline: {
    es: 'Joyas y piezas únicas en resina y flor natural',
    gl: 'Xoias e pezas únicas en resina e flor natural',
  } satisfies Localized,
  /** Dirección canónica: la que la web declara como suya en `metadataBase`
   *  (`app/layout.tsx`) y en el sitemap. Es el apex del `.com`, sin `www`; el
   *  `.es`, el `.info` y el `.store` sólo redirigen aquí con un 308, así que
   *  ninguno debe aparecer en los metadatos. */
  url: 'https://bonsaiartesania.com',
  location: 'Galicia',
  timezone: 'Europe/Madrid',
  intro: {
    es: 'Flores recogidas, secadas y guardadas para siempre en resina. Cada pieza se hace a mano, de una en una, y no vuelve a repetirse.',
    gl: 'Flores recollidas, secadas e gardadas para sempre en resina. Cada peza faise a man, dunha en unha, e non se volve repetir.',
  } satisfies Localized,
  social: {
    instagram: 'https://www.instagram.com/san.bonsai_/',
    instagramHandle: '@san.bonsai_',
  },
  contact: {
    /** El mismo buzón que va impreso en las tarjetas (`disenos/tarjetas/`). */
    email: 'bonsai@bonsaiartesania.com',
    /** El número de Ana, seguido y sin signos porque es lo que pide `wa.me`.
     *  `whatsappDisplay` lo vuelve a escribir con espacios para leerlo, ver
     *  `lib/contact.ts`. Es el mismo que va impreso en las tarjetas
     *  (`WHATSAPP` en `disenos/comun/marca.mjs`): el papel y la web tienen que
     *  decir lo mismo, así que si cambia hay que cambiarlo en los dos sitios. */
    whatsapp: '34660269872',
  },
} as const
