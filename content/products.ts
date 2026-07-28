import { img, type Image } from '@/lib/media'

/**
 * Catálogo. Es la única fuente de verdad de la tienda: la portada, el listado y
 * la ficha leen de aquí. Añadir una pieza es añadir un objeto a este array.
 *
 * Las fotos se referencian por clave (`img('colgante-hoja', '…')`). La clave es
 * el nombre del fichero en `fotos-originales/`; `npm run images` genera el
 * derivado y el manifiesto. Una clave que no exista es un error de TypeScript.
 *
 * PENDIENTE (Ana): las fotos son suyas, tomadas de su Instagram, pero los
 * nombres, precios y textos son una primera propuesta. Se revisan todos.
 */

export type Category = 'pendientes' | 'anillos' | 'colgantes' | 'encargos'

export type Product = {
  slug: string
  name: string
  category: Category
  /** `null` = pieza a medida, el precio se acuerda por mensaje. */
  price: number | null
  /** Una línea. Es lo que se lee bajo el nombre en la rejilla. */
  summary: string
  /** Párrafos de la ficha. */
  description: string[]
  materials: string[]
  image: Image | null
  featured: boolean
}

export const categories: { key: Category; label: string; note: string }[] = [
  { key: 'pendientes', label: 'Pendientes', note: 'Ligeros, para llevar cada día' },
  { key: 'anillos', label: 'Anillos', note: 'Una flor entera en la mano' },
  { key: 'colgantes', label: 'Colgantes', note: 'Cerca, sin que se note' },
  { key: 'encargos', label: 'A medida', note: 'Tus flores, guardadas para siempre' },
]

export const products: Product[] = [
  {
    slug: 'pendientes-farolillo',
    name: 'Pendientes Farolillo',
    category: 'pendientes',
    price: 32,
    summary: 'Farolillo naranja en resina translúcida',
    description: [
      'Dos farolillos del campo, secados hasta quedarse en papel, sellados en resina transparente. La luz los atraviesa y el naranja cambia según la hora del día.',
      'Muy ligeros. Cierre de plata de ley.',
    ],
    materials: ['Resina', 'Farolillo natural seco', 'Plata de ley 925'],
    image: img(
      'pendientes-farolillo',
      'Pendientes con farolillos naranjas en resina, sobre un tronco cortado',
    ),
    featured: true,
  },
  {
    slug: 'pendientes-arco-margaritas',
    name: 'Pendientes Arco',
    category: 'pendientes',
    price: 30,
    summary: 'Margaritas silvestres bajo un arco de resina',
    description: [
      'La forma del arco viene del logotipo del taller: una ventana. Dentro, margaritas y florecillas moradas colocadas de una en una.',
      'Se hacen también en versión colgante, a juego.',
    ],
    materials: ['Resina', 'Margarita y flor silvestre', 'Acero dorado'],
    image: img('pendientes-arco-margaritas', 'Pendientes en forma de arco con margaritas secas'),
    featured: false,
  },
  {
    slug: 'pendientes-helecho',
    name: 'Pendientes Helecho',
    category: 'pendientes',
    price: 34,
    summary: 'Hoja de helecho en óvalo transparente',
    description: [
      'Un helecho entero, con todos sus nervios, dentro de un óvalo de resina fina. De lejos parece un cristal; de cerca es un bosque.',
      'La pieza más gallega del taller.',
    ],
    materials: ['Resina', 'Helecho natural prensado', 'Aro de acero dorado'],
    image: img('pendientes-helecho', 'Pendientes ovalados con hojas de helecho en resina'),
    featured: true,
  },
  {
    slug: 'pendientes-margarita',
    name: 'Pendientes Margarita',
    category: 'pendientes',
    price: 28,
    summary: 'Una margarita en un aro dorado',
    description: [
      'Una sola margarita suspendida dentro de un aro ovalado. Nada más. Es la pieza que más se repite y la que menos cansa.',
    ],
    materials: ['Resina', 'Margarita seca', 'Aro de acero dorado'],
    image: img('pendientes-margarita', 'Pendientes con una margarita blanca dentro de un aro'),
    featured: false,
  },
  {
    slug: 'anillo-flor-silvestre',
    name: 'Anillo Flor Silvestre',
    category: 'anillos',
    price: 38,
    summary: 'Flor entera suspendida en cúpula',
    description: [
      'Una flor silvestre completa, secada boca abajo para que conserve la forma, dentro de una cúpula de resina pulida a mano.',
      'Se hace a tu talla. Si no la sabes, te ayudo a medirla por mensaje.',
    ],
    materials: ['Resina', 'Flor silvestre seca', 'Base ajustable dorada'],
    image: img('anillo-flor-silvestre', 'Anillo con una flor seca entera sobre una mano'),
    featured: true,
  },
  {
    slug: 'anillo-luna',
    name: 'Anillo Luna',
    category: 'anillos',
    price: 36,
    summary: 'Azul profundo, sin flor',
    description: [
      'Resina teñida en azul noche sobre montura dorada fina. Aquí no hay flor: manda el material y la luz que atrapa.',
    ],
    materials: ['Resina', 'Pigmento mineral', 'Montura dorada'],
    image: img('anillo-luna', 'Anillo dorado con piedra azul de resina en una mano'),
    featured: false,
  },
  {
    slug: 'anillos-de-campo',
    name: 'Anillos de Campo',
    category: 'anillos',
    price: 26,
    summary: 'Finos, para llevar de tres en tres',
    description: [
      'Anillos finos con una gota de resina y flor dentro, pensados para apilarse. Cada uno lleva una flor distinta.',
      'Precio por unidad. Dime cuáles quieres y te preparo el juego.',
    ],
    materials: ['Resina', 'Flor seca', 'Montura dorada ajustable'],
    image: img('anillos-de-campo', 'Tres anillos finos con flores en resina sobre un soporte'),
    featured: false,
  },
  {
    slug: 'colgante-hoja',
    name: 'Colgante Hoja',
    category: 'colgantes',
    price: 34,
    summary: 'Una hoja de otoño a contraluz',
    description: [
      'Una hoja pequeña, ámbar, dentro de una gota de resina. Puesta al sol se enciende entera.',
      'Se entrega con cadena de 45 cm.',
    ],
    materials: ['Resina', 'Hoja natural prensada', 'Cadena de acero dorado'],
    image: img('colgante-hoja', 'Colgante con una hoja ámbar en resina, a contraluz'),
    featured: true,
  },
  {
    slug: 'colgante-lavanda',
    name: 'Colgante Lavanda',
    category: 'colgantes',
    price: 32,
    summary: 'Hexágono con lavanda de verano',
    description: [
      'Lavanda recogida en julio dentro de una montura hexagonal. El morado se mantiene años si no le da el sol de frente todo el día.',
      'Disponible con cadena dorada o plateada.',
    ],
    materials: ['Resina', 'Lavanda seca', 'Montura hexagonal dorada'],
    image: img('colgante-lavanda', 'Dos colgantes hexagonales con lavanda seca en resina'),
    featured: true,
  },
  {
    slug: 'colgante-camafeo',
    name: 'Colgante Camafeo',
    category: 'colgantes',
    price: 36,
    summary: 'Óvalo pequeño, para llevar siempre',
    description: [
      'Un óvalo discreto con flor dentro, del tamaño de una uña. Es la pieza que la gente se pone y ya no se quita.',
    ],
    materials: ['Resina', 'Flor seca', 'Cadena fina dorada'],
    image: img('colgante-camafeo', 'Colgante ovalado con flor en resina, puesto al cuello'),
    featured: false,
  },
  {
    slug: 'vuestras-flores',
    name: 'Vuestras Flores',
    category: 'encargos',
    price: null,
    summary: 'Tu ramo, convertido en joya',
    description: [
      'Me mandas las flores de tu boda, de un aniversario o de alguien a quien quieres, y las convierto en una pieza que puedas llevar puesta.',
      'El proceso lleva entre cuatro y seis semanas: secado, selección, resina y pulido. Vamos hablando durante todo el camino y te enseño fotos antes de cerrar nada.',
      'El precio depende de la pieza y de la cantidad de flor. Escríbeme y lo vemos juntas.',
    ],
    materials: ['Tus flores', 'Resina', 'Montura a elegir'],
    image: img('vuestras-flores', 'Dos piezas de resina con hortensias sostenidas en una mano'),
    featured: true,
  },
  {
    slug: 'gotas-a-medida',
    name: 'Gotas a Medida',
    category: 'encargos',
    price: null,
    summary: 'Pendientes largos con la flor que elijas',
    description: [
      'La forma es siempre la misma —una gota larga— y la flor la eliges tú: de tu jardín, de un ramo o de las que tengo secando en el taller.',
      'Cuéntame el color que buscas y te propongo tres combinaciones antes de empezar.',
    ],
    materials: ['Resina', 'Flor a elegir', 'Gancho de plata de ley 925'],
    image: img('encargos-gotas', 'Pendientes largos en forma de gota con flores moradas'),
    featured: false,
  },
]

export const featuredProducts = products.filter((product) => product.featured)

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug)
}

export function productsByCategory(category: Category): Product[] {
  return products.filter((product) => product.category === category)
}

/** Precio en euros, o la fórmula acordada para las piezas a medida. */
export function formatPrice(price: number | null): string {
  if (price === null) return 'A consultar'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(price)
}
