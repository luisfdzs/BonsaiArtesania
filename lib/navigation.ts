/**
 * Menú del sitio. Cuatro entradas: más sería ruido.
 *
 * Las cuatro son rutas de verdad. El taller y Contacto fueron anclas de la
 * portada (`/#taller`, `/#contacto`) hasta que la almohadilla se hizo notar en
 * la barra de direcciones: una sección a media página no se ve como una página,
 * y el hash sobra en un enlace que se comparte o se guarda.
 *
 * `/el-taller` y no `/taller` porque esa ruta ya es el panel de gestión de Ana.
 */
export const navigation = [
  { href: '/tienda', label: 'Tienda' },
  { href: '/encargos', label: 'Encargos' },
  { href: '/el-taller', label: 'El taller' },
  { href: '/contacto', label: 'Contacto' },
] as const
