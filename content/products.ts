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

export type Category =
  'pendientes' | 'anillos' | 'colgantes' | 'pulseras' | 'bordados' | 'encargos' | 'taller'

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

/**
 * Familias de la tienda. Cada una es además una subsección propia en
 * `/tienda/<clave>`: `plural` es lo que se lee en el botón «Ver más …» y
 * `intro` la línea que encabeza esa página.
 */
export const categories: {
  key: Category
  label: string
  note: string
  /** Para el botón «Ver más …». En minúscula: va dentro de una frase. */
  plural: string
  intro: string
}[] = [
  {
    key: 'pendientes',
    label: 'Pendientes',
    note: 'Ligeros, para llevar cada día',
    plural: 'pendientes',
    intro:
      'La familia más grande del taller: aros, arcos, gotas y óvalos, casi siempre con una flor entera dentro.',
  },
  {
    key: 'anillos',
    label: 'Anillos',
    note: 'Una flor entera en la mano',
    plural: 'anillos',
    intro:
      'Casi todos con montura ajustable, así que no hace falta saber la talla. Muchos se piensan para apilarse.',
  },
  {
    key: 'colgantes',
    label: 'Colgantes',
    note: 'Cerca, sin que se note',
    plural: 'colgantes',
    intro:
      'Piezas pequeñas que se llevan a diario, y algún conjunto a juego con pendientes o anillo.',
  },
  {
    key: 'pulseras',
    label: 'Pulseras',
    note: 'Una flor en la muñeca',
    plural: 'pulseras',
    intro: 'Cadena fina y una sola pieza de resina, plana para que no gire en la muñeca.',
  },
  {
    key: 'bordados',
    label: 'Bordados',
    note: 'Bastidor de pared, hilo sobre lino',
    plural: 'bordados',
    intro: 'Hilo sobre lino crudo, montados en bastidor de madera y listos para colgar.',
  },
  {
    key: 'encargos',
    label: 'A medida',
    note: 'Tus flores, guardadas para siempre',
    plural: 'piezas a medida',
    intro: 'Tú pones la flor y el recuerdo; yo, la resina. El precio se acuerda hablando.',
  },
  {
    key: 'taller',
    label: 'Del taller',
    note: 'Cómo se hace y cómo llega',
    plural: 'fotos del taller',
    intro:
      'No son piezas a la venta: son los pasos que hay antes y después de la resina. El secado, el montaje y la caja con la que llega.',
  },
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

  // ── Resto del archivo del Instagram de Ana (30/07/2026). Hasta ahora sólo
  //    estaban publicadas las piezas «de ficha»; el resto —bodegones, tomas
  //    alternativas, packaging y proceso— se quedaba en la carpeta de archivo.
  //    Aquí entra todo: no había motivo para que la tienda enseñase menos
  //    catálogo del que hay. Nombres, precios y textos son propuesta.

  {
    slug: 'pendientes-donut-trio',
    name: 'Pendientes Donut',
    category: 'pendientes',
    price: 30,
    summary: 'Tres aros de resina, en tres colores',
    description: [
      'Un aro grueso de resina colgando de un gancho dorado, sin flor: aquí manda el color. Se hacen en crema veteado, verde oliva y rosa pálido.',
      'Precio por par. Dime el color y te lo preparo.',
    ],
    materials: ['Resina', 'Pigmento mineral', 'Gancho de acero dorado'],
    image: img(
      'pendientes-donut-trio',
      'Seis pares de pendientes de aro de resina en crema, verde y rosa sobre un expositor',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-arco-silvestre',
    name: 'Pendientes Arco Silvestre',
    category: 'pendientes',
    price: 32,
    summary: 'Margarita y flor amarilla bajo el arco',
    description: [
      'El arco del taller, esta vez con una margarita blanca abierta, una florecilla amarilla y una brizna verde repartidas dentro de la resina transparente.',
      'La resina es fina, así que pesan poco para lo grandes que se ven.',
    ],
    materials: ['Resina', 'Margarita y flor silvestre secas', 'Gancho de acero dorado'],
    image: img(
      'pendientes-arco-silvestre',
      'Dos pendientes de arco transparente con margaritas, colgados de una maceta con un bonsái',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-otono',
    name: 'Pendientes Otoño',
    category: 'pendientes',
    price: 30,
    summary: 'Verde oliva y naranja, sin flor',
    description: [
      'Tres modelos de la misma colección: nube con disco, arco con círculo y dos piedras encadenadas. Todos en resina teñida en verde oliva y naranja quemado, los colores del monte en octubre.',
      'Precio por par. Se venden sueltos, no hace falta llevarse los tres.',
    ],
    materials: ['Resina', 'Pigmento mineral', 'Acero dorado'],
    image: img(
      'pendientes-otono',
      'Tres pares de pendientes geométricos verdes y naranjas en expositores sobre madera',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-fumaria',
    name: 'Pendientes Fumaria',
    category: 'pendientes',
    price: 34,
    summary: 'Fumaria y helecho en un óvalo grande',
    description: [
      'Fumaria —esa flor rosa de puntas oscuras que sale en las cunetas— con unas hojas de helecho detrás, dentro de un óvalo transparente colgado de un aro fino.',
      'Es de las piezas más grandes y de las que menos pesan.',
    ],
    materials: ['Resina', 'Fumaria y helecho prensados', 'Aro de acero dorado'],
    image: img(
      'pendientes-fumaria',
      'Pendientes ovalados con flores rosas y helecho colgados de un soporte dorado',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-disco-margarita',
    name: 'Pendientes Disco Margarita',
    category: 'pendientes',
    price: 32,
    summary: 'Una margarita abierta, a contraluz',
    description: [
      'Una margarita blanca abierta del todo, con el centro amarillo intacto, dentro de un disco redondo de resina casi incolora. Al trasluz se le ven los pétalos uno a uno.',
      'Cuelgan de un aro grande, así que se mueven al andar.',
    ],
    materials: ['Resina', 'Margarita prensada', 'Aro de acero dorado'],
    image: img(
      'pendientes-disco-margarita',
      'Pendientes redondos con una margarita blanca dentro, en un soporte dorado al sol',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-ovalo-amarillo',
    name: 'Pendientes Óvalo Amarillo',
    category: 'pendientes',
    price: 28,
    summary: 'Una flor amarilla dentro de un óvalo hueco',
    description: [
      'La montura es un óvalo dorado abierto y la flor queda suspendida en el aire, sujeta por una lámina de resina casi invisible. Parece que flota.',
      'Pequeños y de diario. Cierre de botón.',
    ],
    materials: ['Resina', 'Flor amarilla seca', 'Montura ovalada dorada'],
    image: img(
      'pendientes-ovalo-amarillo',
      'Dos pendientes de óvalo dorado con una flor amarilla dentro, sobre lino',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-terrazo-azul',
    name: 'Pendientes Terrazo Azul',
    category: 'pendientes',
    price: 32,
    summary: 'Pétalos azules partidos, como un terrazo',
    description: [
      'Pétalos de flor azul y lila cortados a trozos y repartidos en resina transparente: de lejos parece terrazo, de cerca sigue siendo flor.',
      'Tres formas de la misma colección: rectángulo calado, arco pequeño y arco grande. Precio por par.',
    ],
    materials: ['Resina', 'Pétalos secos', 'Acero dorado'],
    image: img(
      'pendientes-terrazo-azul',
      'Tres pares de pendientes de resina con trozos de pétalo azul sobre tela clara',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-ovalo-plata',
    name: 'Pendientes Óvalo Plata',
    category: 'pendientes',
    price: 28,
    summary: 'Flor rosa en montura plateada',
    description: [
      'La misma montura ovalada hueca, esta vez en plateado y con una florecilla rosa de tallo largo dentro.',
      'Para quien no lleva dorado. Se hacen también con la flor que elijas.',
    ],
    materials: ['Resina', 'Flor silvestre seca', 'Montura ovalada plateada'],
    image: img(
      'pendientes-ovalo-plata',
      'Dos pendientes ovalados plateados con una flor rosa, sostenidos en una mano',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-aro-petalos',
    name: 'Pendientes Aro de Pétalos',
    category: 'pendientes',
    price: 32,
    summary: 'Un anillo de resina lleno de pétalos morados',
    description: [
      'Aro grueso de resina transparente con pétalos morados y ámbar embebidos por todo el contorno. El centro queda hueco, así que la luz pasa a través.',
      'Es de las piezas que mejor quedan a contraluz.',
    ],
    materials: ['Resina', 'Pétalos secos', 'Gancho de acero dorado'],
    image: img(
      'pendientes-aro-petalos',
      'Pendientes de aro con pétalos morados colgados de la rama de un árbol al sol',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-arco-fucsia',
    name: 'Pendientes Arco Fucsia',
    category: 'pendientes',
    price: 32,
    summary: 'Fucsia, rojo y naranja en el mismo arco',
    description: [
      'Pétalos de buganvilla y de rosa cortados y colocados en un arco macizo. Es la combinación más caliente del taller: fucsia, rojo y naranja sin nada frío que los calme.',
      'Cada par sale distinto: los trozos nunca caen igual.',
    ],
    materials: ['Resina', 'Pétalos secos', 'Gancho de acero dorado'],
    image: img(
      'pendientes-arco-fucsia',
      'Dos pendientes de arco con pétalos fucsias y naranjas en la palma de una mano al sol',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-cascada-azul',
    name: 'Pendientes Cascada',
    category: 'pendientes',
    price: 36,
    summary: 'Tres piezas encadenadas, azul y oro',
    description: [
      'Círculo, arco y barra colgando uno del otro, los tres con pétalos azules y virutas doradas dentro. Son los pendientes más largos que hago.',
      'Pesan poco a pesar del tamaño, pero piden pelo recogido.',
    ],
    materials: ['Resina', 'Pétalos secos', 'Pan de oro', 'Acero dorado'],
    image: img(
      'pendientes-cascada-azul',
      'Pendientes largos de tres piezas con pétalos azules, sostenidos frente al mar',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-hoja-otono',
    name: 'Pendientes Hoja de Otoño',
    category: 'pendientes',
    price: 34,
    summary: 'Una hoja roja entera, recortada a su forma',
    description: [
      'Una hoja de otoño completa, roja con la nervadura ámbar, sellada en resina y recortada siguiendo su propio contorno. No hay montura: la pieza tiene la forma de la hoja.',
      'Cada par depende de las hojas que haya recogido ese año, así que la forma nunca se repite.',
    ],
    materials: ['Resina', 'Hoja natural prensada', 'Aro de acero dorado'],
    image: img(
      'pendientes-hoja-otono',
      'Dos pendientes en forma de hoja roja colgados de las ramas de un bonsái',
    ),
    featured: true,
  },
  {
    slug: 'pendientes-lavanda-gota',
    name: 'Pendientes Lavanda',
    category: 'pendientes',
    price: 30,
    summary: 'Gota o aro, con lavanda dentro',
    description: [
      'Lavanda repartida en resina transparente, en dos formas: gota alargada de botón y aro hueco de gancho. El morado queda apagado, como la flor cuando se seca de verdad.',
      'Precio por par. Dime cuál de las dos formas quieres.',
    ],
    materials: ['Resina', 'Lavanda seca', 'Acero dorado'],
    image: img(
      'pendientes-lavanda-gota',
      'Dos pares de pendientes con lavanda sobre una rodaja de madera entre hojas secas',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-arco-lila',
    name: 'Pendientes Arco Lila',
    category: 'pendientes',
    price: 34,
    summary: 'Margaritas amarillas y florecillas lilas',
    description: [
      'Arco de resina transparente lleno hasta arriba: margaritas amarillas abiertas, florecillas lilas y hojas finas, sin dejar hueco. De las piezas con más flor por centímetro.',
      'Se hacen a juego con el colgante hexagonal.',
    ],
    materials: ['Resina', 'Margarita y flor silvestre secas', 'Gancho de acero dorado'],
    image: img(
      'pendientes-arco-lila',
      'Dos pendientes de arco con margaritas amarillas y flores lilas sobre lino, entre hojas',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-pensamiento',
    name: 'Pendientes Pensamiento',
    category: 'pendientes',
    price: 34,
    summary: 'Un pensamiento entero, crema y burdeos',
    description: [
      'La flor del pensamiento completa, con sus cinco pétalos, dos color crema arriba y tres burdeos abajo. Se recorta la resina al borde del pétalo para que no se vea montura.',
      'Es la pieza que más cuesta secar bien: el pétalo es grueso y se pardea si se seca deprisa.',
    ],
    materials: ['Resina', 'Pensamiento natural seco', 'Gancho de acero dorado'],
    image: img(
      'pendientes-pensamiento',
      'Dos pendientes con flores de pensamiento crema y burdeos sostenidos en una mano al sol',
    ),
    featured: true,
  },
  {
    slug: 'pendientes-cadena-rosa',
    name: 'Pendientes Cadena Rosa',
    category: 'pendientes',
    price: 32,
    summary: 'Dos discos rosas al final de dos cadenas',
    description: [
      'Dos cadenas finas de distinta largura que caen de un mismo gancho, cada una con un disco de resina rosa y pan de oro. Se mueven todo el rato.',
      'Los más largos y los más discretos a la vez: la pieza es diminuta.',
    ],
    materials: ['Resina', 'Pigmento', 'Pan de oro', 'Cadena de acero dorado'],
    image: img(
      'pendientes-cadena-rosa',
      'Pendientes largos de cadena con dos discos rosas, sobre lino junto a eucalipto',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-flor-gota-azul',
    name: 'Pendientes Flor y Gota',
    category: 'pendientes',
    price: 34,
    summary: 'Flor arriba, gota larga debajo',
    description: [
      'Dos piezas unidas por una anilla: una flor de cinco pétalos arriba y una gota larga colgando, las dos con flor azul y ámbar dentro.',
      'Es el modelo que más se pide para bodas.',
    ],
    materials: ['Resina', 'Flor seca', 'Acero dorado'],
    image: img(
      'pendientes-flor-gota-azul',
      'Pendientes de flor y gota en su tarjeta, sostenidos frente al mar al atardecer',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-gota-fucsia',
    name: 'Pendientes Gota Fucsia',
    category: 'pendientes',
    price: 30,
    summary: 'Gota larga fucsia con pan de oro',
    description: [
      'Una sola gota larga por pendiente, con pétalos fucsias y virutas de pan de oro repartidas por dentro. Cierre de botón, así que quedan pegados a la oreja arriba y sueltos abajo.',
    ],
    materials: ['Resina', 'Pétalos secos', 'Pan de oro', 'Acero dorado'],
    image: img(
      'pendientes-gota-fucsia',
      'Pendientes de gota larga fucsia en su tarjeta, junto a un sello de campanilla',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-flor-cuadrado',
    name: 'Pendientes Flor y Cuadrado',
    category: 'pendientes',
    price: 32,
    summary: 'Ámbar y verde, en dos piezas',
    description: [
      'Flor de cinco pétalos arriba y cuadrado debajo, los dos con pétalos ámbar y hojas verdes dentro. Los colores salen del eucalipto seco con el que se fotografían.',
    ],
    materials: ['Resina', 'Pétalos y hoja secos', 'Acero dorado'],
    image: img(
      'pendientes-flor-cuadrado',
      'Pendientes de flor y cuadrado en tonos ámbar sobre lino, junto a hojas de eucalipto',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-rectangulo-esmeralda',
    name: 'Pendientes Rectángulo Esmeralda',
    category: 'pendientes',
    price: 34,
    summary: 'Rosa, verde esmeralda y oro',
    description: [
      'Rectángulo calado por dentro, con pétalos rosas, hojas verde esmeralda y pan de oro repartidos por el marco. Se hacen también en gota, con la misma mezcla.',
      'Precio por par. Dime si los quieres en rectángulo o en gota.',
    ],
    materials: ['Resina', 'Pétalos y hoja secos', 'Pan de oro', 'Acero dorado'],
    image: img(
      'pendientes-rectangulo-esmeralda',
      'Pendientes rectangulares y de gota con pétalos rosas y verdes sobre una rodaja de madera',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-miel',
    name: 'Pendientes Miel',
    category: 'pendientes',
    price: 32,
    summary: 'Flor de tojo en tres formatos',
    description: [
      'Flor de tojo seca, que al perder el agua se queda entre miel y canela, repartida en resina clara. Hay tres formatos: arco, barra larga y escalera de cuatro cuadrados.',
      'Precio por par. La escalera es la más larga y la que más pesa.',
    ],
    materials: ['Resina', 'Flor de tojo seca', 'Acero dorado'],
    image: img(
      'pendientes-miel',
      'Tres pares de pendientes color miel con flores secas, sobre tela de lino',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-aro-flor-intercambiable',
    name: 'Aros con Flor Intercambiable',
    category: 'pendientes',
    price: 34,
    summary: 'Un aro y las flores que quieras',
    description: [
      'Un aro de acero, dorado o plateado, y flores de resina que se sacan y se ponen. Cada flor es una pieza distinta: azul veteado, verde esmeralda, morado, ámbar, lila.',
      'El par de aros va con dos flores a elegir. Las de más se piden sueltas y se van cambiando según el día.',
    ],
    materials: ['Resina', 'Pétalos secos', 'Aro de acero dorado o plateado'],
    image: img(
      'pendientes-aro-flor-intercambiable',
      'Siete flores de resina de colores y dos pares de aros en la palma de una mano',
    ),
    featured: true,
  },
  {
    slug: 'pendientes-ovalo-nube',
    name: 'Pendientes Óvalo Nube',
    category: 'pendientes',
    price: 32,
    summary: 'Crema, azul pálido y oro',
    description: [
      'Óvalo grueso calado por dentro, con pétalos color crema, azul muy pálido y láminas de oro. Es la pieza más clara del taller y la que mejor va con ropa de verano.',
    ],
    materials: ['Resina', 'Pétalos secos', 'Pan de oro', 'Acero plateado'],
    image: img(
      'pendientes-ovalo-nube',
      'Pendientes ovalados en tonos crema y azul pálido en su tarjeta, sobre un arbusto verde',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-gota-hortensia',
    name: 'Pendientes Gota Hortensia',
    category: 'pendientes',
    price: 32,
    summary: 'Hortensia blanca y una brizna dorada',
    description: [
      'Una flor de hortensia blanca con el centro verde y una brizna seca de color miel cruzando la gota. Fondo casi transparente, montura plateada.',
      'La hortensia blanca amarillea con el sol directo; guárdalos a la sombra y aguantan años.',
    ],
    materials: ['Resina', 'Hortensia natural seca', 'Acero plateado'],
    image: img(
      'pendientes-gota-hortensia',
      'Pendientes de gota con hortensia blanca en su tarjeta, sobre la arena de la playa',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-hortensia-azul',
    name: 'Pendientes Hortensia Azul',
    category: 'pendientes',
    price: 32,
    summary: 'Hortensia azul en aro plateado',
    description: [
      'La flor entera de hortensia azul, recortada a su contorno y colgada de un aro plateado grande. El azul de la hortensia gallega, el que sale cuando la tierra es ácida.',
    ],
    materials: ['Resina', 'Hortensia natural seca', 'Aro de acero plateado'],
    image: img(
      'pendientes-hortensia-azul',
      'Pendientes de aro con flores de hortensia azul pálido, sostenidos al atardecer en el campo',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-tres-aros',
    name: 'Pendientes Tres Aros',
    category: 'pendientes',
    price: 34,
    summary: 'Tres donuts crema en cascada',
    description: [
      'Tres aros de resina color crema veteado, encadenados de mayor a menor. Sin flor: es la pieza más sobria que hago.',
      'Largos, pero muy ligeros: la resina hueca no pesa.',
    ],
    materials: ['Resina', 'Pigmento mineral', 'Gancho de acero dorado'],
    image: img(
      'pendientes-tres-aros',
      'Pendientes de tres aros color crema apoyados en una roca, con la playa al fondo',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-esfera-amarilla',
    name: 'Pendientes Esfera',
    category: 'pendientes',
    price: 30,
    summary: 'Una flor amarilla dentro de una bola',
    description: [
      'Una esfera de resina del tamaño de un guisante con una flor amarilla suspendida en el centro. No es una placa: la flor está metida en el volumen y se ve desde cualquier ángulo.',
      'Cuelgan de un aro pequeño, pegados al lóbulo.',
    ],
    materials: ['Resina', 'Flor amarilla seca', 'Aro de acero dorado'],
    image: img(
      'pendientes-esfera-amarilla',
      'Dos pendientes de esfera con una flor amarilla dentro, colgados de una rama de cedro',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-arco-mostaza',
    name: 'Pendientes Arco Mostaza',
    category: 'pendientes',
    price: 30,
    summary: 'Arco pequeño color mostaza',
    description: [
      'Botón redondo y arco debajo, los dos en resina mostaza con flor seca dentro. De los más pequeños de la familia de arcos: se llevan a diario sin pensar en ellos.',
    ],
    materials: ['Resina', 'Flor seca', 'Acero dorado'],
    image: img(
      'pendientes-arco-mostaza',
      'Pendiente de arco color mostaza puesto en la oreja, con el pelo al viento',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-verbena',
    name: 'Pendientes Verbena',
    category: 'pendientes',
    price: 32,
    summary: 'Todos los colores a la vez',
    description: [
      'Pétalos rojos, morados, amarillos y blancos partidos y mezclados sin ningún criterio. Es la pieza más ruidosa del taller y la que más gusta en verano.',
      'En dos formas: arco pequeño de botón y aro grande de gancho. Precio por par.',
    ],
    materials: ['Resina', 'Pétalos secos', 'Acero dorado'],
    image: img(
      'pendientes-verbena',
      'Dos pares de pendientes con pétalos de muchos colores sobre una rodaja de madera',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-margarita-gota',
    name: 'Pendientes Margarita y Gota',
    category: 'pendientes',
    price: 34,
    summary: 'Margarita en resina, gota en latón',
    description: [
      'Una margarita blanca en disco de resina y, colgando, una gota de latón martilleado. Es la única pieza donde el metal pesa tanto como la flor.',
      'El martilleado se hace a mano, así que no hay dos gotas con la misma marca.',
    ],
    materials: ['Resina', 'Margarita prensada', 'Latón martilleado'],
    image: img(
      'pendientes-margarita-gota',
      'Pendiente con margarita y gota de latón puesto, de perfil, con chaqueta de cuero',
    ),
    featured: false,
  },
  {
    slug: 'pendientes-margarita-grande',
    name: 'Pendientes Margarita Grande',
    category: 'pendientes',
    price: 34,
    summary: 'Una margarita entera, del tamaño real',
    description: [
      'La margarita a su tamaño de campo, sin recortar, dentro de un disco de borde libre con un filo dorado que se pintó a mano. Ocupa entero el lóbulo.',
      'Es la versión grande de los pendientes de disco.',
    ],
    materials: ['Resina', 'Margarita prensada', 'Filo dorado', 'Acero dorado'],
    image: img(
      'pendientes-margarita-grande',
      'Pendiente grande con una margarita blanca y borde dorado puesto en la oreja',
    ),
    featured: false,
  },

  {
    slug: 'colgante-ovalo-amarillo',
    name: 'Colgante Óvalo Amarillo',
    category: 'colgantes',
    price: 30,
    summary: 'Dos flores amarillas suspendidas en el aire',
    description: [
      'Óvalo dorado hueco con dos flores amarillas de tallo largo sujetas por una lámina de resina finísima. Puesto a contraluz sólo se ven las flores.',
      'Cadena de 45 cm.',
    ],
    materials: ['Resina', 'Flor amarilla seca', 'Montura ovalada dorada', 'Cadena fina'],
    image: img(
      'colgante-ovalo-amarillo',
      'Colgante de óvalo dorado con flores amarillas colgando frente a una pared clara',
    ),
    featured: false,
  },
  {
    slug: 'conjunto-violeta',
    name: 'Conjunto Violeta',
    category: 'colgantes',
    price: 54,
    summary: 'Colgante y pendientes con la misma flor lila',
    description: [
      'Una flor lila de cinco pétalos, entera, en las tres piezas: los dos pendientes de aro y el colgante. Fondo transparente, sin montura a la vista.',
      'Se venden juntos o por separado. El precio es del conjunto.',
    ],
    materials: ['Resina', 'Flor lila seca', 'Aro y cadena de acero dorado'],
    image: img(
      'conjunto-violeta',
      'Pendientes de aro y colgante con flores lilas sobre una rodaja de madera, en la hierba',
    ),
    featured: false,
  },
  {
    slug: 'colgante-ovalo-naranja',
    name: 'Colgante Óvalo Naranja',
    category: 'colgantes',
    price: 30,
    summary: 'Dos florecillas naranjas, muy pequeño',
    description: [
      'La montura ovalada hueca con dos flores naranjas dentro, del tamaño de una moneda pequeña. Queda justo en el hueco del cuello.',
      'Se entrega con cadena dorada de 45 cm.',
    ],
    materials: ['Resina', 'Flor naranja seca', 'Montura ovalada dorada', 'Cadena fina'],
    image: img(
      'colgante-ovalo-naranja',
      'Colgante ovalado con flores naranjas puesto al cuello, con camisa blanca',
    ),
    featured: false,
  },
  {
    slug: 'colgante-ovalo-plata',
    name: 'Colgante Óvalo Plata',
    category: 'colgantes',
    price: 30,
    summary: 'Pétalo morado en montura plateada',
    description: [
      'Un pétalo morado y una hojita verde dentro de un óvalo plateado macizo, con fondo casi transparente. La versión en plata del camafeo.',
    ],
    materials: ['Resina', 'Pétalo y hoja secos', 'Montura ovalada plateada'],
    image: img(
      'colgante-ovalo-plata',
      'Colgante ovalado plateado con una flor morada puesto al cuello, con jersey claro',
    ),
    featured: false,
  },
  {
    slug: 'colgantes-piedra-redonda',
    name: 'Colgantes Piedra Redonda',
    category: 'colgantes',
    price: 28,
    summary: 'Verde musgo, azul noche o ámbar',
    description: [
      'Piedra redonda pequeña en montura dorada, con tres rellenos: musgo verde, pétalo azul y flor ámbar. Es el colgante más discreto que hago.',
      'Precio por unidad. Dime el color.',
    ],
    materials: ['Resina', 'Musgo o flor secos', 'Montura redonda dorada'],
    image: img(
      'colgantes-piedra-redonda',
      'Tres colgantes redondos verde, azul y ámbar sobre una rodaja de madera con flores secas',
    ),
    featured: false,
  },
  {
    slug: 'colgante-hexagono-hojas',
    name: 'Colgante Hexágono Hojas',
    category: 'colgantes',
    price: 30,
    summary: 'Una ramita verde, nada más',
    description: [
      'Una ramita de cinco hojas verdes, colocada recta, dentro de un hexágono dorado con fondo blanco roto. Sin flor y sin color: sólo la hoja.',
      'De las piezas que más se regalan.',
    ],
    materials: ['Resina', 'Hoja natural prensada', 'Montura hexagonal dorada'],
    image: img(
      'colgante-hexagono-hojas',
      'Colgante hexagonal dorado con hojas verdes colgando frente a una pared blanca',
    ),
    featured: false,
  },
  {
    slug: 'conjunto-clavel',
    name: 'Conjunto Clavel',
    category: 'colgantes',
    price: 66,
    summary: 'Pendientes, anillo y colgante en granate',
    description: [
      'Hecho con los pétalos de un clavel granate: pendientes de rectángulo calado, anillo de piedra ovalada y colgante de gota. Los tres del mismo rojo oscuro.',
      'Se venden juntos o por separado. El precio es del conjunto completo.',
    ],
    materials: ['Resina', 'Pétalos de clavel secos', 'Acero dorado'],
    image: img(
      'conjunto-clavel',
      'Pendientes, anillo y colgante granates sobre una rodaja de madera, junto a un clavel',
    ),
    featured: true,
  },
  {
    slug: 'colgantes-hexagono-mini',
    name: 'Colgantes Hexágono Mini',
    category: 'colgantes',
    price: 28,
    summary: 'Seis flores, una por colgante',
    description: [
      'El hexágono dorado en su tamaño pequeño, con una sola flor centrada: hoja verde, lavanda, hortensia blanca, viola morada, margarita amarilla o pétalo crema.',
      'Precio por unidad. Se pueden llevar dos o tres a la vez, con cadenas de distinta largura.',
    ],
    materials: ['Resina', 'Flor seca', 'Montura hexagonal dorada', 'Cadena fina'],
    image: img(
      'colgantes-hexagono-mini',
      'Seis colgantes hexagonales dorados con flores distintas sobre una rodaja de madera',
    ),
    featured: false,
  },

  {
    slug: 'anillos-finos-granate',
    name: 'Anillos Finos Granate',
    category: 'anillos',
    price: 24,
    summary: 'Dos aros muy finos, para apilar',
    description: [
      'Aro fino de acero con una piedra pequeña de resina granate encima. Pensados para llevar dos o tres seguidos en el mismo dedo.',
      'Precio por unidad. Talla ajustable.',
    ],
    materials: ['Resina', 'Pétalos secos', 'Aro de acero ajustable'],
    image: img(
      'anillos-finos-granate',
      'Dos anillos finos con piedras granates en una mano que sostiene flores amarillas',
    ),
    featured: false,
  },
  {
    slug: 'anillos-cuadrados',
    name: 'Anillos Cuadrados',
    category: 'anillos',
    price: 28,
    summary: 'Piedra cuadrada en tres colores',
    description: [
      'Piedra cuadrada de resina sobre aro fino dorado, con flores dentro. Hay ámbar, rosa y amarillo, y se llevan los tres juntos.',
      'Precio por unidad. El aro es abierto, así que se adapta.',
    ],
    materials: ['Resina', 'Flor seca', 'Aro de acero dorado ajustable'],
    image: img(
      'anillos-cuadrados',
      'Tres anillos de piedra cuadrada ámbar, rosa y amarilla en una mano apoyada en el bolsillo',
    ),
    featured: false,
  },
  {
    slug: 'anillo-ovalo-petalos',
    name: 'Anillo Óvalo de Pétalos',
    category: 'anillos',
    price: 34,
    summary: 'Óvalo grande, morado y naranja',
    description: [
      'La piedra más grande que hago: un óvalo ancho lleno de trozos de pétalo morado, naranja y blanco. Ocupa medio dedo.',
      'Montura ajustable. Es el anillo que se ve desde lejos.',
    ],
    materials: ['Resina', 'Pétalos secos', 'Montura ovalada ajustable'],
    image: img(
      'anillo-ovalo-petalos',
      'Anillo ovalado con pétalos morados y naranjas en una mano recogiéndose el pelo',
    ),
    featured: false,
  },
  {
    slug: 'anillo-fino-ambar',
    name: 'Anillo Fino Ámbar',
    category: 'anillos',
    price: 26,
    summary: 'Una piedra de miel y otra morada',
    description: [
      'Aro fino dorado con dos piedras pequeñas seguidas, una ámbar y otra morada. Se lleva solo o con otro aro liso al lado.',
      'Talla ajustable.',
    ],
    materials: ['Resina', 'Flor seca', 'Aro de acero dorado ajustable'],
    image: img(
      'anillo-fino-ambar',
      'Anillo fino con piedras ámbar y morada en la mano de una mujer, de perfil, en el bosque',
    ),
    featured: false,
  },

  {
    slug: 'bordado-abrazo',
    name: 'Bordado Abrazo',
    category: 'bordados',
    price: 52,
    summary: 'Una madre y su hija, de una línea',
    description: [
      'Dos figuras abrazadas bordadas a línea continua, con flores sueltas de colores repartidas por la ropa y el pelo, y una luna arriba. La pieza más pedida para regalar en un nacimiento.',
      'Bastidor de 20 cm. Se puede bordar a partir de una foto vuestra.',
    ],
    materials: ['Lino', 'Hilo de algodón', 'Bastidor de madera de 20 cm'],
    image: img(
      'bordado-abrazo',
      'Bastidor con dos figuras abrazadas bordadas a línea, con florecillas de colores',
    ),
    featured: false,
  },
  {
    slug: 'bordado-con-un-par',
    name: 'Bordado Con un Par',
    category: 'bordados',
    price: 46,
    summary: 'Un útero en rojo y dos ramas',
    description: [
      'Un útero bordado a línea en rojo, con dos ramitas de hoja verde y flores azules debajo, y la frase «con un par» encima.',
      'Bastidor de 20 cm. Admite otra frase, si prefieres.',
    ],
    materials: ['Lino', 'Hilo de algodón', 'Bastidor de madera de 20 cm'],
    image: img(
      'bordado-con-un-par',
      'Bastidor colgado en la pared con un útero bordado en rojo y la frase «con un par»',
    ),
    featured: false,
  },

  // Fotos de proceso y de envoltorio. No son piezas: van sin precio y llevan a
  // hablar conmigo, igual que los encargos.

  {
    slug: 'taller-flores-prensadas',
    name: 'Flores Prensadas',
    category: 'taller',
    price: null,
    summary: 'El material, antes de la resina',
    description: [
      'Margaritas y caléndulas después de dos semanas de prensa. Al secarse pierden el color vivo y se quedan en marrones y ocres: esa gama es la que acaba dentro de las piezas de otoño.',
      'Si quieres que seque flores tuyas, escríbeme antes de que se pasen: cuanto más frescas lleguen a la prensa, mejor aguanta el color.',
    ],
    materials: ['Margarita', 'Caléndula', 'Prensa de madera'],
    image: img(
      'taller-flores-prensadas',
      'Margaritas y caléndulas secas prensadas, repartidas sobre papel blanco',
    ),
    featured: false,
  },
  {
    slug: 'taller-buganvilla-libro',
    name: 'Buganvillas en un Libro',
    category: 'taller',
    price: null,
    summary: 'Prensadas entre páginas, sin prisa',
    description: [
      'Brácteas de buganvilla secándose entre las hojas de un libro. Es el método de siempre y sigue siendo el mejor para las flores finas: el papel absorbe la humedad sin aplastar el color.',
      'Tres semanas, y el naranja se queda casi como estaba.',
    ],
    materials: ['Buganvilla', 'Un libro cualquiera', 'Paciencia'],
    image: img(
      'taller-buganvilla-libro',
      'Brácteas de buganvilla naranja secándose entre las páginas abiertas de un libro',
    ),
    featured: false,
  },
  {
    slug: 'taller-montaje',
    name: 'El Montaje',
    category: 'taller',
    price: null,
    summary: 'Cada pieza, a su tarjeta',
    description: [
      'Las tarjetas se cortan e imprimen aquí, y cada pieza se monta a mano en la suya antes de guardarla. Es el último paso y el que más se nota al abrir el paquete.',
    ],
    materials: ['Cartulina', 'Tinta', 'Un rato'],
    image: img('taller-montaje', 'Dos manos montando unos pendientes en una tarjeta con el logo'),
    featured: false,
  },
  {
    slug: 'taller-tarjetas',
    name: 'Listo para Regalar',
    category: 'taller',
    price: null,
    summary: 'Cuatro piezas en su tarjeta',
    description: [
      'Así sale cada pieza del taller: en su tarjeta, con el nombre y el cuidado detrás. Puesto así ya se puede regalar sin envolver nada más.',
      'Si es un regalo, dímelo al encargar y le añado una nota escrita a mano.',
    ],
    materials: ['Resina', 'Flor seca', 'Tarjeta impresa'],
    image: img(
      'taller-tarjetas',
      'Cuatro tarjetas con pendientes y colgantes de resina sobre un plato de madera',
    ),
    featured: false,
  },
  {
    slug: 'taller-caja-regalo',
    name: 'La Caja',
    category: 'taller',
    price: null,
    summary: 'Cómo llega el pedido a casa',
    description: [
      'Caja de cartón sin plástico, virutas de papel, una ramita seca y una lámina botánica dentro. Los pedidos de más de una pieza van todos así.',
      'El envoltorio va incluido. No hay que pedirlo aparte.',
    ],
    materials: ['Cartón', 'Papel', 'Lámina botánica'],
    image: img(
      'taller-caja-regalo',
      'Caja de envío abierta con un colgante, un anillo y una lámina botánica dentro',
    ),
    featured: false,
  },
  {
    slug: 'taller-envio-ambar',
    name: 'Un Pedido de Ámbar',
    category: 'taller',
    price: null,
    summary: 'Pendientes y colgante, listos para salir',
    description: [
      'Un pedido a medio cerrar: pendientes y colgante a juego en tonos ámbar, cada uno en su tarjeta, con un sello antiguo de regalo.',
      'Los sellos los voy guardando y meto uno distinto en cada caja.',
    ],
    materials: ['Resina', 'Flor seca', 'Cartón y papel'],
    image: img(
      'taller-envio-ambar',
      'Caja de envío con pendientes y un colgante ámbar en sus tarjetas, junto a un sello antiguo',
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

export type CategoryInfo = (typeof categories)[number]

export function getCategoryInfo(key: string): CategoryInfo | undefined {
  return categories.find((category) => category.key === key)
}

/**
 * Cuántas piezas enseña cada familia en `/tienda` antes del botón «Ver más …».
 * Once y no doce: con la rejilla de tres columnas el hueco que queda libre en la
 * última fila es justo donde va el botón, así que la fila no se rompe.
 */
export const PREVIEW_SIZE = 11

/** Precio en euros, o la fórmula acordada para las piezas a medida. */
export function formatPrice(price: number | null): string {
  if (price === null) return 'A consultar'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(price)
}
