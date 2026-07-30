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

export type Category = 'pendientes' | 'anillos' | 'colgantes' | 'pulseras' | 'bordados' | 'encargos'

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
  { key: 'pulseras', label: 'Pulseras', note: 'Una flor en la muñeca' },
  { key: 'bordados', label: 'Bordados', note: 'Bastidor de pared, hilo sobre lino' },
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
    slug: 'pendientes-turmalina',
    name: 'Pendientes Turmalina',
    category: 'pendientes',
    price: 34,
    summary: 'Pétalos de muchos colores en forma de ala',
    description: [
      'Pétalos rosas, naranjas y lilas repartidos sin orden dentro de una resina en forma de ala. El nombre viene de la piedra: dos colores que se cruzan y nunca salen igual dos veces.',
      'Cada par es distinto, así que el que recibes no es exactamente el de la foto.',
    ],
    materials: ['Resina', 'Pétalos secos', 'Acero dorado'],
    image: img(
      'pendientes-turmalina',
      'Pendientes de resina con pétalos de colores puestos en una oreja',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-colgantes-margarita',
    name: 'Pendientes Colgantes Margarita',
    category: 'pendientes',
    price: 32,
    summary: 'Una margarita rosa al final de una cadena',
    description: [
      'Una margarita entera, rosada, colgando de una cadena fina dorada. Se mueve al andar y roza el cuello.',
      'Los mismos pétalos que en la versión de aro, pero con caída.',
    ],
    materials: ['Resina', 'Margarita seca', 'Cadena de acero dorado'],
    image: img(
      'pendientes-colgantes-margarita',
      'Pendiente largo con una margarita rosa en resina, junto al cuello',
    ),
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
    slug: 'anillo-ajustable-margarita',
    name: 'Anillo Ajustable Margarita',
    category: 'anillos',
    price: 34,
    summary: 'Flores amarillas en resina irregular',
    description: [
      'Flores pequeñas amarillas y naranjas dentro de una resina de borde libre, sin molde: cada anillo sale con su propia forma.',
      'La montura es ajustable, así que no hace falta saber la talla.',
    ],
    materials: ['Resina', 'Flor silvestre seca', 'Montura ajustable'],
    image: img(
      'anillo-ajustable-margarita',
      'Anillo de resina con flores amarillas en una mano, entre espigas',
    ),
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

  // ── Piezas traídas del Instagram de Ana (30/07/2026). Nombres tomados del pie
  //    de foto; precios y textos son propuesta, pendientes de revisar con ella.

  {
    slug: 'pendientes-hortensia',
    name: 'Pendientes Hortensia',
    category: 'pendientes',
    price: 32,
    summary: 'Dos hortensias moradas enteras',
    description: [
      'Una flor de hortensia entera en cada pendiente, con sus cuatro pétalos y la vena clara del centro. El morado se conserva porque se secan a oscuras.',
      'Pesan menos de lo que parece: la resina es una capa muy fina sobre el pétalo.',
    ],
    materials: ['Resina', 'Hortensia natural seca', 'Gancho de acero'],
    image: img(
      'pendientes-hortensia',
      'Dos pendientes con flores de hortensia morada colgando de una rama',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-buganvilla',
    name: 'Pendientes Buganvilla',
    category: 'pendientes',
    price: 30,
    summary: 'Pétalos de buganvilla a contraluz',
    description: [
      'Brácteas de buganvilla, esas hojas finas de color entre naranja y rosa que la planta usa como pétalo. Puestas al sol se vuelven translúcidas y se les ven todos los nervios.',
    ],
    materials: ['Resina', 'Buganvilla natural seca', 'Gancho de acero dorado'],
    image: img(
      'pendientes-buganvilla',
      'Pendientes con pétalos de buganvilla naranja colgados de una rama',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-aro-mix-floral',
    name: 'Pendientes Aro Mix Floral',
    category: 'pendientes',
    price: 34,
    summary: 'Aro grande con pétalos de varios colores',
    description: [
      'Un aro ancho relleno de recortes de pétalo rosa, lila y amarillo, repartidos sin patrón. Es la pieza más llamativa del taller y la que menos se repite.',
      'Al ser aro cerrado no engancha el pelo.',
    ],
    materials: ['Resina', 'Pétalos secos', 'Gancho de acero dorado'],
    image: img(
      'pendientes-aro-mix-floral',
      'Dos aros de resina con pétalos de colores en la palma de una mano',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-helecho-largo',
    name: 'Pendientes Helecho Largo',
    category: 'pendientes',
    price: 34,
    summary: 'Helecho entero en pieza alargada',
    description: [
      'La misma idea que los pendientes de helecho redondos, pero en vertical: el helecho entra completo, de la base a la punta, en una pieza estrecha y larga.',
      'Se hacen por encargo según el tamaño del helecho que haya secando.',
    ],
    materials: ['Resina', 'Helecho natural prensado', 'Gancho de acero dorado'],
    image: img(
      'pendientes-helecho-largo',
      'Pendientes verdes alargados con helecho, colgados de una rama en el bosque',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-margarita-amarilla',
    name: 'Pendientes Margarita Amarilla',
    category: 'pendientes',
    price: 28,
    summary: 'Una margarita amarilla, pequeña',
    description: [
      'Del tamaño de una lenteja grande, en amarillo fuerte. Para llevar a diario sin pensar en ellos.',
    ],
    materials: ['Resina', 'Margarita amarilla seca', 'Fornitura de acero dorado'],
    image: img(
      'pendientes-margarita-amarilla',
      'Pendiente pequeño con una margarita amarilla puesto en la oreja',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-lirio',
    name: 'Pendientes Lirio',
    category: 'pendientes',
    price: 32,
    summary: 'Flor de lirio en resina cuadrada',
    description: [
      'Dos placas cuadradas casi transparentes, con una flor de lirio lila dentro y el tallo cruzando en diagonal. Parecen dos portaobjetos de laboratorio.',
    ],
    materials: ['Resina', 'Lirio natural prensado', 'Gancho de acero dorado'],
    image: img(
      'pendientes-lirio',
      'Dos pendientes cuadrados transparentes con flor de lirio lila en una mano',
    ),
    featured: false,
  },

  {
    slug: 'pendientes-modelos-margarita',
    name: 'Pendientes Margarita Arco',
    category: 'pendientes',
    price: 32,
    summary: 'Arco transparente con margaritas y hojas',
    description: [
      'Dos arcos de resina casi incolora con margaritas blancas y briznas verdes repartidas dentro. Al ponérselos parece que la flor flota.',
      'Es el modelo de arco del taller, en su versión más clara.',
    ],
    materials: ['Resina', 'Margarita y hoja secas', 'Gancho de acero dorado'],
    image: img(
      'pendientes-modelos-margarita',
      'Dos pendientes de arco transparente con margaritas, sobre un tronco',
    ),
    featured: false,
  },
  {
    slug: 'anillos-piedras-color',
    name: 'Anillos Piedra de Color',
    category: 'anillos',
    price: 26,
    summary: 'Resina teñida, sin flor, en tres colores',
    description: [
      'Piedra rectangular de resina teñida sobre montura ajustable de acero inoxidable. Hay amarillo, verde y rojo.',
      'Precio por unidad. También se hacen en plateado.',
    ],
    materials: ['Resina', 'Pigmento', 'Acero inoxidable ajustable'],
    image: img(
      'anillos-piedras-color',
      'Tres anillos dorados con piedras de resina amarilla, verde y roja sobre una rama',
    ),
    featured: false,
  },
  {
    slug: 'anillo-ipomoea',
    name: 'Anillo Ipomoea',
    category: 'anillos',
    price: 30,
    summary: 'Campanilla morada en montura fina',
    description: [
      'Una flor de campanilla —Ipomoea purpurea, la que trepa por las tapias— dentro de una piedra pequeña y redonda. Dura una mañana en la planta y años en la resina.',
      'Disponible también en dorado.',
    ],
    materials: ['Resina', 'Ipomoea purpurea seca', 'Montura ajustable'],
    image: img('anillo-ipomoea', 'Anillo con una flor morada en la mano, sobre un girasol'),
    featured: false,
  },
  {
    slug: 'anillos-petalos',
    name: 'Anillos de Pétalos',
    category: 'anillos',
    price: 26,
    summary: 'Rosa, fresia y caléndula, uno por dedo',
    description: [
      'Piedras ovaladas hechas con pétalos de rosa, fresia y caléndula. Cada anillo sale de una flor distinta, así que no hay dos del mismo tono.',
      'Todos ajustables. Precio por unidad.',
    ],
    materials: ['Resina', 'Pétalos de rosa, fresia y caléndula', 'Montura ajustable'],
    image: img(
      'anillos-petalos',
      'Cuatro anillos con piedras ámbar y moradas puestos en los dedos, sobre corteza',
    ),
    featured: false,
  },
  {
    slug: 'anillo-ambar',
    name: 'Anillo Ámbar',
    category: 'anillos',
    price: 30,
    summary: 'Una piedra del color de la miel',
    description: [
      'Resina en tono ámbar con flor seca dentro, montada en anillo fino. Es el que mejor queda con la piel tostada del verano.',
    ],
    materials: ['Resina', 'Flor seca', 'Montura ajustable dorada'],
    image: img('anillo-ambar', 'Anillo con piedra ámbar en una mano entre espigas de campo'),
    featured: false,
  },
  {
    slug: 'anillos-camafeo',
    name: 'Anillos Camafeo',
    category: 'anillos',
    price: 32,
    summary: 'Óvalo grande, tres versiones',
    description: [
      'La montura de camafeo, ovalada y ancha, con tres rellenos distintos: pétalo morado, flor blanca sobre fondo claro y ámbar.',
      'Dime cuál quieres; si dudas, te mando fotos de los que haya hechos.',
    ],
    materials: ['Resina', 'Flor y pétalo secos', 'Montura ovalada ajustable'],
    image: img(
      'anillos-camafeo',
      'Tres anillos ovalados morado, blanco y ámbar sobre conos de madera',
    ),
    featured: false,
  },

  {
    slug: 'colgante-siempreviva',
    name: 'Colgante Siempreviva',
    category: 'colgantes',
    price: 32,
    summary: 'Siempreviva y artemisa, muy pequeño',
    description: [
      'Una siempreviva granate con una ramita de artemisa, en una gota diminuta colgada de cadena fina. Se ve de cerca y no antes.',
      'Se hace también con clavel, en rojo más abierto.',
    ],
    materials: ['Resina', 'Siempreviva y artemisa secas', 'Cadena fina dorada'],
    image: img('colgante-siempreviva', 'Colgante pequeño con una flor granate sobre el hombro'),
    featured: false,
  },
  {
    slug: 'colgantes-hexagono-lavanda',
    name: 'Colgantes Hexágono Lavanda',
    category: 'colgantes',
    price: 32,
    summary: 'Hexágono azul con lavanda dentro',
    description: [
      'Montura hexagonal con lavanda sobre fondo azul lavanda, en tres intensidades según cuánta flor lleve dentro.',
      'Se entrega con cadena dorada de 45 cm.',
    ],
    materials: ['Resina', 'Lavanda seca', 'Montura hexagonal dorada'],
    image: img(
      'colgantes-hexagono-lavanda',
      'Tres colgantes hexagonales azules con lavanda seca sobre lino',
    ),
    featured: false,
  },
  {
    slug: 'conjunto-hexagono-morado',
    name: 'Conjunto Hexágono Morado',
    category: 'colgantes',
    price: 58,
    summary: 'Colgante y pendientes a juego',
    description: [
      'Juego de colgante y pendientes en montura hexagonal dorada, con la misma flor morada en las tres piezas.',
      'Se venden juntos o por separado, y también en plateado. El precio es del conjunto.',
    ],
    materials: ['Resina', 'Flor morada seca', 'Montura hexagonal dorada'],
    image: img(
      'conjunto-hexagono-morado',
      'Colgante y pendientes hexagonales con flores moradas sobre un plato de madera',
    ),
    featured: false,
  },
  {
    slug: 'conjunto-petalos-rosa',
    name: 'Conjunto Pétalos de Rosa',
    category: 'colgantes',
    price: 62,
    summary: 'Colgante, pendientes y anillo en crema',
    description: [
      'Hecho con pétalos de rosa clara, que al secarse se quedan en un crema muy pálido con vetas. Colgante redondo, pendientes hexagonales y anillo ovalado.',
      'Disponible en conjunto y por separado. El precio es del conjunto completo.',
    ],
    materials: ['Resina', 'Pétalos de rosa secos', 'Montura dorada'],
    image: img(
      'conjunto-petalos-rosa',
      'Colgante, pendientes y anillo con pétalos claros sobre conos de madera',
    ),
    featured: false,
  },

  {
    slug: 'pulsera-hexagono',
    name: 'Pulsera Hexágono',
    category: 'pulseras',
    price: 28,
    summary: 'Cadena fina con hexágono de flor',
    description: [
      'La misma montura hexagonal de los colgantes, en cadena de pulsera. Queda plana sobre la muñeca y no gira.',
      'Precio por unidad. Hay tres rellenos distintos.',
    ],
    materials: ['Resina', 'Flor seca', 'Cadena de acero dorado'],
    image: img(
      'pulsera-hexagono',
      'Tres pulseras de cadena dorada con hexágonos de resina y flores',
    ),
    featured: false,
  },
  {
    slug: 'pulsera-margarita-naranja',
    name: 'Pulsera Margarita Naranja',
    category: 'pulseras',
    price: 26,
    summary: 'Una margarita naranja al sol',
    description: [
      'Margarita naranja entera en una pieza redonda, sobre cadena fina. Al llevarla puesta el sol la atraviesa y proyecta el color en la piel.',
    ],
    materials: ['Resina', 'Margarita naranja seca', 'Cadena de acero dorado'],
    image: img(
      'pulsera-margarita-naranja',
      'Pulsera con una margarita naranja en la muñeca, al sol',
    ),
    featured: false,
  },
  {
    slug: 'pulsera-margarita-blanca',
    name: 'Pulsera Margarita Blanca',
    category: 'pulseras',
    price: 26,
    summary: 'La misma, en blanco y rosa',
    description: [
      'Versión en blanco de la pulsera de margarita, con el centro amarillo y un halo rosado en los pétalos.',
    ],
    materials: ['Resina', 'Margarita seca', 'Cadena de acero dorado'],
    image: img(
      'pulsera-margarita-blanca',
      'Pulsera con una margarita blanca en la muñeca sobre musgo',
    ),
    featured: false,
  },
  {
    slug: 'pulsera-piedras',
    name: 'Pulsera Piedra de Color',
    category: 'pulseras',
    price: 28,
    summary: 'Tres piedras engarzadas en la cadena',
    description: [
      'Tres piedras redondas —azul, ámbar y verde— repartidas a lo largo de la cadena, cada una con flor dentro.',
      'También se hace con una sola piedra, si lo prefieres más discreto.',
    ],
    materials: ['Resina', 'Flor seca', 'Cadena de acero dorado'],
    image: img(
      'pulsera-piedras',
      'Pulseras con piedras azul, ámbar y verde sobre madera, con lavanda seca',
    ),
    featured: false,
  },

  {
    slug: 'bordado-lavanda',
    name: 'Bordado Lavanda',
    category: 'bordados',
    price: 42,
    summary: 'Tres ramas de lavanda y su nombre',
    description: [
      'Bordado a mano sobre lino crudo, montado en bastidor de madera para colgar tal cual. Tres ramas de lavanda y la palabra escrita a punto de cadeneta.',
      'Bastidor de 15 cm. Cada uno se borda al encargo, así que admite otro nombre o otra flor.',
    ],
    materials: ['Lino', 'Hilo de algodón', 'Bastidor de madera de 15 cm'],
    image: img(
      'bordado-lavanda',
      'Bastidor con lavanda bordada y la palabra lavanda, con luz cálida',
    ),
    featured: false,
  },
  {
    slug: 'bordado-calendula',
    name: 'Bordado Caléndula',
    category: 'bordados',
    price: 42,
    summary: 'Caléndulas amarillas sobre lino',
    description: [
      'Dos caléndulas abiertas con sus hojas, bordadas en amarillo y verde, con el nombre debajo.',
      'Bastidor de 15 cm, listo para colgar.',
    ],
    materials: ['Lino', 'Hilo de algodón', 'Bastidor de madera de 15 cm'],
    image: img(
      'bordado-calendula',
      'Bastidor con caléndulas amarillas bordadas y la palabra caléndula',
    ),
    featured: false,
  },
  {
    slug: 'bordado-camelia',
    name: 'Bordado Camelia',
    category: 'bordados',
    price: 42,
    summary: 'La flor de Galicia, a línea',
    description: [
      'Una camelia bordada casi sólo con el contorno, en rosa y verde muy suaves, con el nombre debajo.',
      'Bastidor de 15 cm, listo para colgar.',
    ],
    materials: ['Lino', 'Hilo de algodón', 'Bastidor de madera de 15 cm'],
    image: img('bordado-camelia', 'Bastidor con una camelia rosa bordada y la palabra camelia'),
    featured: false,
  },
  {
    slug: 'bordado-toxo',
    name: 'Bordado Toxo',
    category: 'bordados',
    price: 42,
    summary: 'Toxo en flor, en amarillo',
    description: [
      'El toxo del monte gallego, con sus flores amarillas y sus espinas, bordado en una rama larga con el nombre en galego.',
      'Bastidor de 15 cm, listo para colgar.',
    ],
    materials: ['Lino', 'Hilo de algodón', 'Bastidor de madera de 15 cm'],
    image: img(
      'bordado-toxo',
      'Bastidor con una rama de toxo bordada en amarillo y la palabra toxo',
    ),
    featured: false,
  },
  {
    slug: 'bordado-rostro',
    name: 'Bordado Rostro',
    category: 'bordados',
    price: 48,
    summary: 'Un retrato a línea, con color',
    description: [
      'Un rostro de mujer bordado de una sola línea continua, con manchas de color suelto en el pelo y los ojos. Es la pieza menos botánica del taller.',
      'Bastidor de 20 cm. Se puede bordar a partir de una foto tuya.',
    ],
    materials: ['Lino', 'Hilo de algodón', 'Bastidor de madera de 20 cm'],
    image: img(
      'bordado-rostro',
      'Bastidor con el rostro de una mujer bordado a línea, en una estantería de libros',
    ),
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
