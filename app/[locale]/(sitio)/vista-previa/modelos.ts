import type { Plegado } from '@/components/tienda/motorDelMazo'

/** Los modelos que hay que probar, con lo que cuenta cada uno. */
export const MODELOS: { id: Plegado; nombre: string; nota: string }[] = [
  {
    id: 'relevo',
    nombre: 'Relevo',
    nota: 'No viaja: se apaga en su sitio mientras la nueva se enciende encima. Nada se mueve de lado, así que nada estorba.',
  },
  {
    id: 'barrido',
    nombre: 'Barrido',
    nota: 'La que se va sale de cuadro más rápido que el dedo y se apaga por el camino. Cuando la nueva llega, la anterior ya no está.',
  },
  {
    id: 'cortina',
    nombre: 'Cortina',
    nota: 'Nada se mueve: la que se va se recorta desde el canto, como una cortina que se corre, y por debajo aparece la nueva quieta y entera.',
  },
  {
    id: 'caida',
    nombre: 'Caída',
    nota: 'Se desprende: cae, se encoge y se apaga, y la nueva sube a ocupar su sitio. El más botánico de los cinco.',
  },
  {
    id: 'contraccion',
    nombre: 'Contracción',
    nota: 'Se recoge hacia el centro hasta desaparecer y la nueva crece desde el centro. Se atraviesa el catálogo en vez de recorrerlo.',
  },
  {
    id: 'deslizar',
    nombre: 'Deslizar',
    nota: 'Sin efecto, sólo desplazamiento. La referencia de lo que había.',
  },
]
