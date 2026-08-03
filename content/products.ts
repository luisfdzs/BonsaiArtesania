import type { Localized } from '@/lib/i18n/config'
import { imgLocalized, type Image } from '@/lib/media'

/**
 * Catálogo. Es la única fuente de verdad de la tienda: la portada, el listado y
 * la ficha leen de aquí. Añadir una pieza es añadir un objeto a este array.
 *
 * Las fotos se referencian por clave (`img('colgante-hoja', '…')`). La clave es
 * el nombre del fichero en `fotos-originales/`; `npm run images` genera el
 * derivado y el manifiesto. Una clave que no exista es un error de TypeScript.
 *
 * PENDIENTE (Ana): las fotos son suyas, tomadas de su Instagram, pero los nombres
 * y los textos son una primera propuesta. Se revisan todos. **Eso vale para las
 * dos versiones**: el galego se ha escrito a partir del castellano provisional,
 * así que hereda su condición de borrador y se revisará con él, no después.
 *
 * Todo lo que se lee está en los dos idiomas, el texto alternativo de las fotos
 * incluido —que también se lee, sólo que en voz alta—. Lo que no se traduce es lo
 * que no es lenguaje: el `slug` (es la dirección, y las direcciones no se
 * traducen: ver `lib/i18n/routes.ts`), la clave de la foto y el precio.
 */

export type Category =
  'pendientes' | 'anillos' | 'colgantes' | 'pulseras' | 'bordados' | 'encargos' | 'taller'

export type Product = {
  slug: string
  name: Localized
  category: Category
  /**
   * **No se enseña en ninguna parte**: ni el catálogo, ni la ficha, ni el carrito,
   * ni la pantalla del taller, ni los correos. Sigue aquí porque es lo que se
   * congela en el documento que se archiva.
   *
   * `null` = pieza a medida: no pasa por el carrito y se pide escribiendo.
   */
  price: number | null
  /** Una línea. Es lo que se lee bajo el nombre en la rejilla. */
  summary: Localized
  /** Párrafos de la ficha. */
  description: Localized<string[]>
  materials: Localized<string[]>
  /** La misma foto con su `alt` en cada idioma. Ver `imgLocalized`. */
  image: Localized<Image> | null
  featured: boolean
}

/**
 * Familias de la tienda. Cada una es además una subsección propia en
 * `/tienda/<clave>`: `plural` es lo que se lee en el botón «Ver más …» y
 * `intro` la línea que encabeza esa página.
 */
export const categories: {
  key: Category
  label: Localized
  note: Localized
  /** Para el botón «Ver más …». En minúscula: va dentro de una frase. */
  plural: Localized
  intro: Localized
}[] = [
  {
    key: 'pendientes',
    label: { es: 'Pendientes', gl: 'Pendentes' },
    note: { es: 'Ligeros, para llevar cada día', gl: 'Lixeiros, para levar cada día' },
    plural: { es: 'pendientes', gl: 'pendentes' },
    intro: {
      es: 'La familia más grande del taller: aros, arcos, gotas y óvalos, casi siempre con una flor entera dentro.',
      gl: 'A familia máis grande do taller: aros, arcos, pingas e óvalos, case sempre cunha flor enteira dentro.',
    },
  },
  {
    key: 'anillos',
    label: { es: 'Anillos', gl: 'Aneis' },
    note: { es: 'Una flor entera en la mano', gl: 'Unha flor enteira na man' },
    plural: { es: 'anillos', gl: 'aneis' },
    intro: {
      es: 'Casi todos con montura ajustable, así que no hace falta saber la talla. Muchos se piensan para apilarse.',
      gl: 'Case todos con montura axustable, así que non fai falta saber a talla. Moitos pénsanse para apilarse.',
    },
  },
  {
    key: 'colgantes',
    label: { es: 'Colgantes', gl: 'Colgantes' },
    note: { es: 'Cerca, sin que se note', gl: 'Preto, sen que se note' },
    plural: { es: 'colgantes', gl: 'colgantes' },
    intro: {
      es: 'Piezas pequeñas que se llevan a diario, y algún conjunto a juego con pendientes o anillo.',
      gl: 'Pezas pequenas que se levan a diario, e algún conxunto a xogo con pendentes ou anel.',
    },
  },
  {
    key: 'pulseras',
    label: { es: 'Pulseras', gl: 'Pulseiras' },
    note: { es: 'Una flor en la muñeca', gl: 'Unha flor na moneca' },
    plural: { es: 'pulseras', gl: 'pulseiras' },
    intro: {
      es: 'Cadena fina y una sola pieza de resina, plana para que no gire en la muñeca.',
      gl: 'Cadea fina e unha soa peza de resina, plana para que non xire na moneca.',
    },
  },
  {
    key: 'bordados',
    label: { es: 'Bordados', gl: 'Bordados' },
    note: {
      es: 'Bastidor de pared, hilo sobre lino',
      gl: 'Bastidor de parede, fío sobre liño',
    },
    plural: { es: 'bordados', gl: 'bordados' },
    intro: {
      es: 'Hilo sobre lino crudo, montados en bastidor de madera y listos para colgar.',
      gl: 'Fío sobre liño cru, montados en bastidor de madeira e listos para colgar.',
    },
  },
  {
    key: 'encargos',
    label: { es: 'A medida', gl: 'A medida' },
    note: {
      es: 'Tus flores, guardadas para siempre',
      gl: 'As túas flores, gardadas para sempre',
    },
    plural: { es: 'piezas a medida', gl: 'pezas a medida' },
    intro: {
      es: 'Tú pones la flor y el recuerdo; yo, la resina. Cada pieza se acuerda hablando.',
      gl: 'Ti pos a flor e o recordo; eu, a resina. Cada peza acórdase falando.',
    },
  },
  {
    key: 'taller',
    label: { es: 'Del taller', gl: 'Do taller' },
    note: { es: 'Cómo se hace y cómo llega', gl: 'Como se fai e como chega' },
    plural: { es: 'fotos del taller', gl: 'fotos do taller' },
    intro: {
      es: 'No son piezas: son los pasos que hay antes y después de la resina. El secado, el montaje y la caja con la que llega.',
      gl: 'Non son pezas: son os pasos que hai antes e despois da resina. O secado, a montaxe e a caixa coa que chega.',
    },
  },
]

export const products: Product[] = [
  {
    slug: 'pendientes-farolillo',
    name: { es: 'Pendientes Farolillo', gl: 'Pendentes Faroliño' },
    category: 'pendientes',
    price: 32,
    summary: {
      es: 'Farolillo naranja en resina translúcida',
      gl: 'Faroliño laranxa en resina translúcida',
    },
    description: {
      es: [
        'Dos farolillos del campo, secados hasta quedarse en papel, sellados en resina transparente. La luz los atraviesa y el naranja cambia según la hora del día.',
        'Muy ligeros. Cierre de plata de ley.',
      ],
      gl: [
        'Dous faroliños do campo, secados ata quedaren en papel, selados en resina transparente. A luz atravésaos e o laranxa cambia segundo a hora do día.',
        'Moi lixeiros. Peche de prata de lei.',
      ],
    },
    materials: {
      es: ['Resina', 'Farolillo natural seco', 'Plata de ley 925'],
      gl: ['Resina', 'Faroliño natural seco', 'Prata de lei 925'],
    },
    image: imgLocalized('pendientes-farolillo', {
      es: 'Pendientes con farolillos naranjas en resina, sobre un tronco cortado',
      gl: 'Pendentes con faroliños laranxas en resina, sobre un tronco cortado',
    }),
    featured: true,
  },
  {
    slug: 'pendientes-arco-margaritas',
    name: { es: 'Pendientes Arco', gl: 'Pendentes Arco' },
    category: 'pendientes',
    price: 30,
    summary: {
      es: 'Margaritas silvestres bajo un arco de resina',
      gl: 'Margaridas silvestres baixo un arco de resina',
    },
    description: {
      es: [
        'La forma del arco viene del logotipo del taller: una ventana. Dentro, margaritas y florecillas moradas colocadas de una en una.',
        'Se hacen también en versión colgante, a juego.',
      ],
      gl: [
        'A forma do arco vén do logotipo do taller: unha ventá. Dentro, margaridas e floriñas moradas colocadas dunha en unha.',
        'Fanse tamén en versión colgante, a xogo.',
      ],
    },
    materials: {
      es: ['Resina', 'Margarita y flor silvestre', 'Acero dorado'],
      gl: ['Resina', 'Margarida e flor silvestre', 'Aceiro dourado'],
    },
    image: imgLocalized('pendientes-arco-margaritas', {
      es: 'Pendientes en forma de arco con margaritas secas',
      gl: 'Pendentes en forma de arco con margaridas secas',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-helecho',
    name: { es: 'Pendientes Helecho', gl: 'Pendentes Fento' },
    category: 'pendientes',
    price: 34,
    summary: {
      es: 'Hoja de helecho en óvalo transparente',
      gl: 'Folla de fento en óvalo transparente',
    },
    description: {
      es: [
        'Un helecho entero, con todos sus nervios, dentro de un óvalo de resina fina. De lejos parece un cristal; de cerca es un bosque.',
        'La pieza más gallega del taller.',
      ],
      gl: [
        'Un fento enteiro, con todos os seus nervios, dentro dun óvalo de resina fina. De lonxe parece un cristal; de preto é un bosque.',
        'A peza máis galega do taller.',
      ],
    },
    materials: {
      es: ['Resina', 'Helecho natural prensado', 'Aro de acero dorado'],
      gl: ['Resina', 'Fento natural prensado', 'Aro de aceiro dourado'],
    },
    image: imgLocalized('pendientes-helecho', {
      es: 'Pendientes ovalados con hojas de helecho en resina',
      gl: 'Pendentes ovalados con follas de fento en resina',
    }),
    featured: true,
  },
  {
    slug: 'pendientes-margarita',
    name: { es: 'Pendientes Margarita', gl: 'Pendentes Margarida' },
    category: 'pendientes',
    price: 28,
    summary: {
      es: 'Una margarita en un aro dorado',
      gl: 'Unha margarida nun aro dourado',
    },
    description: {
      es: [
        'Una sola margarita suspendida dentro de un aro ovalado. Nada más. Es la pieza que más se repite y la que menos cansa.',
      ],
      gl: [
        'Unha soa margarida suspendida dentro dun aro ovalado. Nada máis. É a peza que máis se repite e a que menos cansa.',
      ],
    },
    materials: {
      es: ['Resina', 'Margarita seca', 'Aro de acero dorado'],
      gl: ['Resina', 'Margarida seca', 'Aro de aceiro dourado'],
    },
    image: imgLocalized('pendientes-margarita', {
      es: 'Pendientes con una margarita blanca dentro de un aro',
      gl: 'Pendentes cunha margarida branca dentro dun aro',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-turmalina',
    name: { es: 'Pendientes Turmalina', gl: 'Pendentes Turmalina' },
    category: 'pendientes',
    price: 34,
    summary: {
      es: 'Pétalos de muchos colores en forma de ala',
      gl: 'Pétalos de moitas cores en forma de á',
    },
    description: {
      es: [
        'Pétalos rosas, naranjas y lilas repartidos sin orden dentro de una resina en forma de ala. El nombre viene de la piedra: dos colores que se cruzan y nunca salen igual dos veces.',
        'Cada par es distinto, así que el que recibes no es exactamente el de la foto.',
      ],
      gl: [
        'Pétalos rosas, laranxas e lilas repartidos sen orde dentro dunha resina en forma de á. O nome vén da pedra: dúas cores que se cruzan e nunca saen igual dúas veces.',
        'Cada par é distinto, así que o que recibes non é exactamente o da foto.',
      ],
    },
    materials: {
      es: ['Resina', 'Pétalos secos', 'Acero dorado'],
      gl: ['Resina', 'Pétalos secos', 'Aceiro dourado'],
    },
    image: imgLocalized('pendientes-turmalina', {
      es: 'Pendientes de resina con pétalos de colores puestos en una oreja',
      gl: 'Pendentes de resina con pétalos de cores postos nunha orella',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-colgantes-margarita',
    name: { es: 'Pendientes Colgantes Margarita', gl: 'Pendentes Colgantes Margarida' },
    category: 'pendientes',
    price: 32,
    summary: {
      es: 'Una margarita rosa al final de una cadena',
      gl: 'Unha margarida rosa ao final dunha cadea',
    },
    description: {
      es: [
        'Una margarita entera, rosada, colgando de una cadena fina dorada. Se mueve al andar y roza el cuello.',
        'Los mismos pétalos que en la versión de aro, pero con caída.',
      ],
      gl: [
        'Unha margarida enteira, rosada, colgando dunha cadea fina dourada. Móvese ao andar e roza o pescozo.',
        'Os mesmos pétalos que na versión de aro, pero con caída.',
      ],
    },
    materials: {
      es: ['Resina', 'Margarita seca', 'Cadena de acero dorado'],
      gl: ['Resina', 'Margarida seca', 'Cadea de aceiro dourado'],
    },
    image: imgLocalized('pendientes-colgantes-margarita', {
      es: 'Pendiente largo con una margarita rosa en resina, junto al cuello',
      gl: 'Pendente longo cunha margarida rosa en resina, xunto ao pescozo',
    }),
    featured: false,
  },
  {
    slug: 'anillo-flor-silvestre',
    name: { es: 'Anillo Flor Silvestre', gl: 'Anel Flor Silvestre' },
    category: 'anillos',
    price: 38,
    summary: {
      es: 'Flor entera suspendida en cúpula',
      gl: 'Flor enteira suspendida en cúpula',
    },
    description: {
      es: [
        'Una flor silvestre completa, secada boca abajo para que conserve la forma, dentro de una cúpula de resina pulida a mano.',
        'Se hace a tu talla. Si no la sabes, te ayudo a medirla por mensaje.',
      ],
      gl: [
        'Unha flor silvestre completa, secada boca abaixo para que conserve a forma, dentro dunha cúpula de resina puída a man.',
        'Faise á túa talla. Se non a sabes, axúdoche a medila por mensaxe.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor silvestre seca', 'Base ajustable dorada'],
      gl: ['Resina', 'Flor silvestre seca', 'Base axustable dourada'],
    },
    image: imgLocalized('anillo-flor-silvestre', {
      es: 'Anillo con una flor seca entera sobre una mano',
      gl: 'Anel cunha flor seca enteira sobre unha man',
    }),
    featured: true,
  },
  {
    slug: 'anillo-luna',
    name: { es: 'Anillo Luna', gl: 'Anel Lúa' },
    category: 'anillos',
    price: 36,
    summary: { es: 'Azul profundo, sin flor', gl: 'Azul profundo, sen flor' },
    description: {
      es: [
        'Resina teñida en azul noche sobre montura dorada fina. Aquí no hay flor: manda el material y la luz que atrapa.',
      ],
      gl: [
        'Resina tinguida en azul noite sobre montura dourada fina. Aquí non hai flor: manda o material e a luz que atrapa.',
      ],
    },
    materials: {
      es: ['Resina', 'Pigmento mineral', 'Montura dorada'],
      gl: ['Resina', 'Pigmento mineral', 'Montura dourada'],
    },
    image: imgLocalized('anillo-luna', {
      es: 'Anillo dorado con piedra azul de resina en una mano',
      gl: 'Anel dourado con pedra azul de resina nunha man',
    }),
    featured: false,
  },
  {
    slug: 'anillos-de-campo',
    name: { es: 'Anillos de Campo', gl: 'Aneis de Campo' },
    category: 'anillos',
    price: 26,
    summary: {
      es: 'Finos, para llevar de tres en tres',
      gl: 'Finos, para levar de tres en tres',
    },
    description: {
      es: [
        'Anillos finos con una gota de resina y flor dentro, pensados para apilarse. Cada uno lleva una flor distinta.',
        'Se piden de uno en uno. Dime cuáles quieres y te preparo el juego.',
      ],
      gl: [
        'Aneis finos cunha pinga de resina e flor dentro, pensados para apilarse. Cada un leva unha flor distinta.',
        'Pídense dun en un. Dime cales queres e prepároche o xogo.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor seca', 'Montura dorada ajustable'],
      gl: ['Resina', 'Flor seca', 'Montura dourada axustable'],
    },
    image: imgLocalized('anillos-de-campo', {
      es: 'Tres anillos finos con flores en resina sobre un soporte',
      gl: 'Tres aneis finos con flores en resina sobre un soporte',
    }),
    featured: false,
  },
  {
    slug: 'anillo-ajustable-margarita',
    name: { es: 'Anillo Ajustable Margarita', gl: 'Anel Axustable Margarida' },
    category: 'anillos',
    price: 34,
    summary: {
      es: 'Flores amarillas en resina irregular',
      gl: 'Flores amarelas en resina irregular',
    },
    description: {
      es: [
        'Flores pequeñas amarillas y naranjas dentro de una resina de borde libre, sin molde: cada anillo sale con su propia forma.',
        'La montura es ajustable, así que no hace falta saber la talla.',
      ],
      gl: [
        'Flores pequenas amarelas e laranxas dentro dunha resina de bordo libre, sen molde: cada anel sae coa súa propia forma.',
        'A montura é axustable, así que non fai falta saber a talla.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor silvestre seca', 'Montura ajustable'],
      gl: ['Resina', 'Flor silvestre seca', 'Montura axustable'],
    },
    image: imgLocalized('anillo-ajustable-margarita', {
      es: 'Anillo de resina con flores amarillas en una mano, entre espigas',
      gl: 'Anel de resina con flores amarelas nunha man, entre espigas',
    }),
    featured: false,
  },
  {
    slug: 'colgante-hoja',
    name: { es: 'Colgante Hoja', gl: 'Colgante Folla' },
    category: 'colgantes',
    price: 34,
    summary: {
      es: 'Una hoja de otoño a contraluz',
      gl: 'Unha folla de outono a contraluz',
    },
    description: {
      es: [
        'Una hoja pequeña, ámbar, dentro de una gota de resina. Puesta al sol se enciende entera.',
        'Se entrega con cadena de 45 cm.',
      ],
      gl: [
        'Unha folla pequena, ámbar, dentro dunha pinga de resina. Posta ao sol acéndese enteira.',
        'Entrégase con cadea de 45 cm.',
      ],
    },
    materials: {
      es: ['Resina', 'Hoja natural prensada', 'Cadena de acero dorado'],
      gl: ['Resina', 'Folla natural prensada', 'Cadea de aceiro dourado'],
    },
    image: imgLocalized('colgante-hoja', {
      es: 'Colgante con una hoja ámbar en resina, a contraluz',
      gl: 'Colgante cunha folla ámbar en resina, a contraluz',
    }),
    featured: true,
  },
  {
    slug: 'colgante-lavanda',
    name: { es: 'Colgante Lavanda', gl: 'Colgante Lavanda' },
    category: 'colgantes',
    price: 32,
    summary: {
      es: 'Hexágono con lavanda de verano',
      gl: 'Hexágono con lavanda de verán',
    },
    description: {
      es: [
        'Lavanda recogida en julio dentro de una montura hexagonal. El morado se mantiene años si no le da el sol de frente todo el día.',
        'Disponible con cadena dorada o plateada.',
      ],
      gl: [
        'Lavanda recollida en xullo dentro dunha montura hexagonal. O morado mantense anos se non lle dá o sol de fronte todo o día.',
        'Dispoñible con cadea dourada ou prateada.',
      ],
    },
    materials: {
      es: ['Resina', 'Lavanda seca', 'Montura hexagonal dorada'],
      gl: ['Resina', 'Lavanda seca', 'Montura hexagonal dourada'],
    },
    image: imgLocalized('colgante-lavanda', {
      es: 'Dos colgantes hexagonales con lavanda seca en resina',
      gl: 'Dous colgantes hexagonais con lavanda seca en resina',
    }),
    featured: true,
  },
  {
    slug: 'colgante-camafeo',
    name: { es: 'Colgante Camafeo', gl: 'Colgante Camafeo' },
    category: 'colgantes',
    price: 36,
    summary: {
      es: 'Óvalo pequeño, para llevar siempre',
      gl: 'Óvalo pequeno, para levar sempre',
    },
    description: {
      es: [
        'Un óvalo discreto con flor dentro, del tamaño de una uña. Es la pieza que la gente se pone y ya no se quita.',
      ],
      gl: [
        'Un óvalo discreto con flor dentro, do tamaño dunha unlla. É a peza que a xente pon e xa non quita.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor seca', 'Cadena fina dorada'],
      gl: ['Resina', 'Flor seca', 'Cadea fina dourada'],
    },
    image: imgLocalized('colgante-camafeo', {
      es: 'Colgante ovalado con flor en resina, puesto al cuello',
      gl: 'Colgante ovalado con flor en resina, posto ao pescozo',
    }),
    featured: false,
  },
  {
    slug: 'vuestras-flores',
    name: { es: 'Vuestras Flores', gl: 'As Vosas Flores' },
    category: 'encargos',
    price: null,
    summary: { es: 'Tu ramo, convertido en joya', gl: 'O teu ramo, convertido en xoia' },
    description: {
      es: [
        'Me mandas las flores de tu boda, de un aniversario o de alguien a quien quieres, y las convierto en una pieza que puedas llevar puesta.',
        'El proceso lleva entre cuatro y seis semanas: secado, selección, resina y pulido. Vamos hablando durante todo el camino y te enseño fotos antes de cerrar nada.',
        'Cada encargo depende de la pieza y de la cantidad de flor. Escríbeme y lo vemos juntas.',
      ],
      gl: [
        'Mándasme as flores da túa voda, dun aniversario ou de alguén a quen queres, e convértoas nunha peza que poidas levar posta.',
        'O proceso leva entre catro e seis semanas: secado, selección, resina e puído. Imos falando durante todo o camiño e ensínoche fotos antes de pechar nada.',
        'Cada encarga depende da peza e da cantidade de flor. Escríbeme e vémolo xuntas.',
      ],
    },
    materials: {
      es: ['Tus flores', 'Resina', 'Montura a elegir'],
      gl: ['As túas flores', 'Resina', 'Montura a escoller'],
    },
    image: imgLocalized('vuestras-flores', {
      es: 'Dos piezas de resina con hortensias sostenidas en una mano',
      gl: 'Dúas pezas de resina con hortensias sostidas nunha man',
    }),
    featured: true,
  },
  {
    slug: 'gotas-a-medida',
    name: { es: 'Gotas a Medida', gl: 'Pingas a Medida' },
    category: 'encargos',
    price: null,
    summary: {
      es: 'Pendientes largos con la flor que elijas',
      gl: 'Pendentes longos coa flor que escollas',
    },
    description: {
      es: [
        'La forma es siempre la misma —una gota larga— y la flor la eliges tú: de tu jardín, de un ramo o de las que tengo secando en el taller.',
        'Cuéntame el color que buscas y te propongo tres combinaciones antes de empezar.',
      ],
      gl: [
        'A forma é sempre a mesma —unha pinga longa— e a flor escóllela ti: do teu xardín, dun ramo ou das que teño secando no taller.',
        'Cóntame a cor que buscas e propóñoche tres combinacións antes de empezar.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor a elegir', 'Gancho de plata de ley 925'],
      gl: ['Resina', 'Flor a escoller', 'Gancho de prata de lei 925'],
    },
    image: imgLocalized('encargos-gotas', {
      es: 'Pendientes largos en forma de gota con flores moradas',
      gl: 'Pendentes longos en forma de pinga con flores moradas',
    }),
    featured: false,
  },

  // ── Piezas traídas del Instagram de Ana (30/07/2026). Nombres tomados del pie
  //    de foto; los textos son propuesta, pendientes de revisar con ella.

  {
    slug: 'pendientes-hortensia',
    name: { es: 'Pendientes Hortensia', gl: 'Pendentes Hortensia' },
    category: 'pendientes',
    price: 32,
    summary: {
      es: 'Dos hortensias moradas enteras',
      gl: 'Dúas hortensias moradas enteiras',
    },
    description: {
      es: [
        'Una flor de hortensia entera en cada pendiente, con sus cuatro pétalos y la vena clara del centro. El morado se conserva porque se secan a oscuras.',
        'Pesan menos de lo que parece: la resina es una capa muy fina sobre el pétalo.',
      ],
      gl: [
        'Unha flor de hortensia enteira en cada pendente, cos seus catro pétalos e a vea clara do centro. O morado consérvase porque se secan ás escuras.',
        'Pesan menos do que parece: a resina é unha capa moi fina sobre o pétalo.',
      ],
    },
    materials: {
      es: ['Resina', 'Hortensia natural seca', 'Gancho de acero'],
      gl: ['Resina', 'Hortensia natural seca', 'Gancho de aceiro'],
    },
    image: imgLocalized('pendientes-hortensia', {
      es: 'Dos pendientes con flores de hortensia morada colgando de una rama',
      gl: 'Dous pendentes con flores de hortensia morada colgando dunha rama',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-buganvilla',
    name: { es: 'Pendientes Buganvilla', gl: 'Pendentes Buganvilla' },
    category: 'pendientes',
    price: 30,
    summary: {
      es: 'Pétalos de buganvilla a contraluz',
      gl: 'Pétalos de buganvilla a contraluz',
    },
    description: {
      es: [
        'Brácteas de buganvilla, esas hojas finas de color entre naranja y rosa que la planta usa como pétalo. Puestas al sol se vuelven translúcidas y se les ven todos los nervios.',
      ],
      gl: [
        'Brácteas de buganvilla, esas follas finas de cor entre laranxa e rosa que a planta usa como pétalo. Postas ao sol vólvense translúcidas e vénselles todos os nervios.',
      ],
    },
    materials: {
      es: ['Resina', 'Buganvilla natural seca', 'Gancho de acero dorado'],
      gl: ['Resina', 'Buganvilla natural seca', 'Gancho de aceiro dourado'],
    },
    image: imgLocalized('pendientes-buganvilla', {
      es: 'Pendientes con pétalos de buganvilla naranja colgados de una rama',
      gl: 'Pendentes con pétalos de buganvilla laranxa colgados dunha rama',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-aro-mix-floral',
    name: { es: 'Pendientes Aro Mix Floral', gl: 'Pendentes Aro Mix Floral' },
    category: 'pendientes',
    price: 34,
    summary: {
      es: 'Aro grande con pétalos de varios colores',
      gl: 'Aro grande con pétalos de varias cores',
    },
    description: {
      es: [
        'Un aro ancho relleno de recortes de pétalo rosa, lila y amarillo, repartidos sin patrón. Es la pieza más llamativa del taller y la que menos se repite.',
        'Al ser aro cerrado no engancha el pelo.',
      ],
      gl: [
        'Un aro ancho recheo de recortes de pétalo rosa, lila e amarelo, repartidos sen patrón. É a peza máis rechamante do taller e a que menos se repite.',
        'Ao ser aro pechado non engancha o pelo.',
      ],
    },
    materials: {
      es: ['Resina', 'Pétalos secos', 'Gancho de acero dorado'],
      gl: ['Resina', 'Pétalos secos', 'Gancho de aceiro dourado'],
    },
    image: imgLocalized('pendientes-aro-mix-floral', {
      es: 'Dos aros de resina con pétalos de colores en la palma de una mano',
      gl: 'Dous aros de resina con pétalos de cores na palma dunha man',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-helecho-largo',
    name: { es: 'Pendientes Helecho Largo', gl: 'Pendentes Fento Longo' },
    category: 'pendientes',
    price: 34,
    summary: {
      es: 'Helecho entero en pieza alargada',
      gl: 'Fento enteiro en peza alongada',
    },
    description: {
      es: [
        'La misma idea que los pendientes de helecho redondos, pero en vertical: el helecho entra completo, de la base a la punta, en una pieza estrecha y larga.',
        'Se hacen por encargo según el tamaño del helecho que haya secando.',
      ],
      gl: [
        'A mesma idea que os pendentes de fento redondos, pero en vertical: o fento entra completo, da base á punta, nunha peza estreita e longa.',
        'Fanse por encarga segundo o tamaño do fento que haxa secando.',
      ],
    },
    materials: {
      es: ['Resina', 'Helecho natural prensado', 'Gancho de acero dorado'],
      gl: ['Resina', 'Fento natural prensado', 'Gancho de aceiro dourado'],
    },
    image: imgLocalized('pendientes-helecho-largo', {
      es: 'Pendientes verdes alargados con helecho, colgados de una rama en el bosque',
      gl: 'Pendentes verdes alongados con fento, colgados dunha rama no bosque',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-margarita-amarilla',
    name: { es: 'Pendientes Margarita Amarilla', gl: 'Pendentes Margarida Amarela' },
    category: 'pendientes',
    price: 28,
    summary: {
      es: 'Una margarita amarilla, pequeña',
      gl: 'Unha margarida amarela, pequena',
    },
    description: {
      es: [
        'Del tamaño de una lenteja grande, en amarillo fuerte. Para llevar a diario sin pensar en ellos.',
      ],
      gl: [
        'Do tamaño dunha lentella grande, en amarelo forte. Para levar a diario sen pensar neles.',
      ],
    },
    materials: {
      es: ['Resina', 'Margarita amarilla seca', 'Fornitura de acero dorado'],
      gl: ['Resina', 'Margarida amarela seca', 'Ferraxe de aceiro dourado'],
    },
    image: imgLocalized('pendientes-margarita-amarilla', {
      es: 'Pendiente pequeño con una margarita amarilla puesto en la oreja',
      gl: 'Pendente pequeno cunha margarida amarela posto na orella',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-lirio',
    name: { es: 'Pendientes Lirio', gl: 'Pendentes Lirio' },
    category: 'pendientes',
    price: 32,
    summary: {
      es: 'Flor de lirio en resina cuadrada',
      gl: 'Flor de lirio en resina cadrada',
    },
    description: {
      es: [
        'Dos placas cuadradas casi transparentes, con una flor de lirio lila dentro y el tallo cruzando en diagonal. Parecen dos portaobjetos de laboratorio.',
      ],
      gl: [
        'Dúas placas cadradas case transparentes, cunha flor de lirio lila dentro e o talo cruzando en diagonal. Parecen dous portaobxectos de laboratorio.',
      ],
    },
    materials: {
      es: ['Resina', 'Lirio natural prensado', 'Gancho de acero dorado'],
      gl: ['Resina', 'Lirio natural prensado', 'Gancho de aceiro dourado'],
    },
    image: imgLocalized('pendientes-lirio', {
      es: 'Dos pendientes cuadrados transparentes con flor de lirio lila en una mano',
      gl: 'Dous pendentes cadrados transparentes con flor de lirio lila nunha man',
    }),
    featured: false,
  },

  {
    slug: 'pendientes-modelos-margarita',
    name: { es: 'Pendientes Margarita Arco', gl: 'Pendentes Margarida Arco' },
    category: 'pendientes',
    price: 32,
    summary: {
      es: 'Arco transparente con margaritas y hojas',
      gl: 'Arco transparente con margaridas e follas',
    },
    description: {
      es: [
        'Dos arcos de resina casi incolora con margaritas blancas y briznas verdes repartidas dentro. Al ponérselos parece que la flor flota.',
        'Es el modelo de arco del taller, en su versión más clara.',
      ],
      gl: [
        'Dous arcos de resina case incolora con margaridas brancas e pallas verdes repartidas dentro. Ao poñelos parece que a flor flota.',
        'É o modelo de arco do taller, na súa versión máis clara.',
      ],
    },
    materials: {
      es: ['Resina', 'Margarita y hoja secas', 'Gancho de acero dorado'],
      gl: ['Resina', 'Margarida e folla secas', 'Gancho de aceiro dourado'],
    },
    image: imgLocalized('pendientes-modelos-margarita', {
      es: 'Dos pendientes de arco transparente con margaritas, sobre un tronco',
      gl: 'Dous pendentes de arco transparente con margaridas, sobre un tronco',
    }),
    featured: false,
  },
  {
    slug: 'anillos-piedras-color',
    name: { es: 'Anillos Piedra de Color', gl: 'Aneis Pedra de Cor' },
    category: 'anillos',
    price: 26,
    summary: {
      es: 'Resina teñida, sin flor, en tres colores',
      gl: 'Resina tinguida, sen flor, en tres cores',
    },
    description: {
      es: [
        'Piedra rectangular de resina teñida sobre montura ajustable de acero inoxidable. Hay amarillo, verde y rojo.',
        'Se piden de uno en uno. También se hacen en plateado.',
      ],
      gl: [
        'Pedra rectangular de resina tinguida sobre montura axustable de aceiro inoxidable. Hai amarelo, verde e vermello.',
        'Pídense dun en un. Tamén se fan en prateado.',
      ],
    },
    materials: {
      es: ['Resina', 'Pigmento', 'Acero inoxidable ajustable'],
      gl: ['Resina', 'Pigmento', 'Aceiro inoxidable axustable'],
    },
    image: imgLocalized('anillos-piedras-color', {
      es: 'Tres anillos dorados con piedras de resina amarilla, verde y roja sobre una rama',
      gl: 'Tres aneis dourados con pedras de resina amarela, verde e vermella sobre unha rama',
    }),
    featured: false,
  },
  {
    slug: 'anillo-ipomoea',
    name: { es: 'Anillo Ipomoea', gl: 'Anel Ipomoea' },
    category: 'anillos',
    price: 30,
    summary: {
      es: 'Campanilla morada en montura fina',
      gl: 'Campaíña morada en montura fina',
    },
    description: {
      es: [
        'Una flor de campanilla —Ipomoea purpurea, la que trepa por las tapias— dentro de una piedra pequeña y redonda. Dura una mañana en la planta y años en la resina.',
        'Disponible también en dorado.',
      ],
      gl: [
        'Unha flor de campaíña —Ipomoea purpurea, a que trepa polos muros— dentro dunha pedra pequena e redonda. Dura unha mañá na planta e anos na resina.',
        'Dispoñible tamén en dourado.',
      ],
    },
    materials: {
      es: ['Resina', 'Ipomoea purpurea seca', 'Montura ajustable'],
      gl: ['Resina', 'Ipomoea purpurea seca', 'Montura axustable'],
    },
    image: imgLocalized('anillo-ipomoea', {
      es: 'Anillo con una flor morada en la mano, sobre un girasol',
      gl: 'Anel cunha flor morada na man, sobre un xirasol',
    }),
    featured: false,
  },
  {
    slug: 'anillos-petalos',
    name: { es: 'Anillos de Pétalos', gl: 'Aneis de Pétalos' },
    category: 'anillos',
    price: 26,
    summary: {
      es: 'Rosa, fresia y caléndula, uno por dedo',
      gl: 'Rosa, fresia e caléndula, un por dedo',
    },
    description: {
      es: [
        'Piedras ovaladas hechas con pétalos de rosa, fresia y caléndula. Cada anillo sale de una flor distinta, así que no hay dos del mismo tono.',
        'Todos ajustables, y se piden de uno en uno.',
      ],
      gl: [
        'Pedras ovaladas feitas con pétalos de rosa, fresia e caléndula. Cada anel sae dunha flor distinta, así que non hai dous do mesmo ton.',
        'Todos axustables, e pídense dun en un.',
      ],
    },
    materials: {
      es: ['Resina', 'Pétalos de rosa, fresia y caléndula', 'Montura ajustable'],
      gl: ['Resina', 'Pétalos de rosa, fresia e caléndula', 'Montura axustable'],
    },
    image: imgLocalized('anillos-petalos', {
      es: 'Cuatro anillos con piedras ámbar y moradas puestos en los dedos, sobre corteza',
      gl: 'Catro aneis con pedras ámbar e moradas postos nos dedos, sobre cortiza',
    }),
    featured: false,
  },
  {
    slug: 'anillo-ambar',
    name: { es: 'Anillo Ámbar', gl: 'Anel Ámbar' },
    category: 'anillos',
    price: 30,
    summary: {
      es: 'Una piedra del color de la miel',
      gl: 'Unha pedra da cor do mel',
    },
    description: {
      es: [
        'Resina en tono ámbar con flor seca dentro, montada en anillo fino. Es el que mejor queda con la piel tostada del verano.',
      ],
      gl: [
        'Resina en ton ámbar con flor seca dentro, montada en anel fino. É o que mellor queda coa pel tostada do verán.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor seca', 'Montura ajustable dorada'],
      gl: ['Resina', 'Flor seca', 'Montura axustable dourada'],
    },
    image: imgLocalized('anillo-ambar', {
      es: 'Anillo con piedra ámbar en una mano entre espigas de campo',
      gl: 'Anel con pedra ámbar nunha man entre espigas de campo',
    }),
    featured: false,
  },
  {
    slug: 'anillos-camafeo',
    name: { es: 'Anillos Camafeo', gl: 'Aneis Camafeo' },
    category: 'anillos',
    price: 32,
    summary: { es: 'Óvalo grande, tres versiones', gl: 'Óvalo grande, tres versións' },
    description: {
      es: [
        'La montura de camafeo, ovalada y ancha, con tres rellenos distintos: pétalo morado, flor blanca sobre fondo claro y ámbar.',
        'Dime cuál quieres; si dudas, te mando fotos de los que haya hechos.',
      ],
      gl: [
        'A montura de camafeo, ovalada e ancha, con tres recheos distintos: pétalo morado, flor branca sobre fondo claro e ámbar.',
        'Dime cal queres; se dubidas, mándoche fotos dos que haxa feitos.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor y pétalo secos', 'Montura ovalada ajustable'],
      gl: ['Resina', 'Flor e pétalo secos', 'Montura ovalada axustable'],
    },
    image: imgLocalized('anillos-camafeo', {
      es: 'Tres anillos ovalados morado, blanco y ámbar sobre conos de madera',
      gl: 'Tres aneis ovalados morado, branco e ámbar sobre conos de madeira',
    }),
    featured: false,
  },

  {
    slug: 'colgante-siempreviva',
    name: { es: 'Colgante Siempreviva', gl: 'Colgante Sempreviva' },
    category: 'colgantes',
    price: 32,
    summary: {
      es: 'Siempreviva y artemisa, muy pequeño',
      gl: 'Sempreviva e artemisa, moi pequeno',
    },
    description: {
      es: [
        'Una siempreviva granate con una ramita de artemisa, en una gota diminuta colgada de cadena fina. Se ve de cerca y no antes.',
        'Se hace también con clavel, en rojo más abierto.',
      ],
      gl: [
        'Unha sempreviva granate cunha ramiña de artemisa, nunha pinga diminuta colgada de cadea fina. Vese de preto e non antes.',
        'Faise tamén con caravel, nun vermello máis aberto.',
      ],
    },
    materials: {
      es: ['Resina', 'Siempreviva y artemisa secas', 'Cadena fina dorada'],
      gl: ['Resina', 'Sempreviva e artemisa secas', 'Cadea fina dourada'],
    },
    image: imgLocalized('colgante-siempreviva', {
      es: 'Colgante pequeño con una flor granate sobre el hombro',
      gl: 'Colgante pequeno cunha flor granate sobre o ombro',
    }),
    featured: false,
  },
  {
    slug: 'colgantes-hexagono-lavanda',
    name: { es: 'Colgantes Hexágono Lavanda', gl: 'Colgantes Hexágono Lavanda' },
    category: 'colgantes',
    price: 32,
    summary: {
      es: 'Hexágono azul con lavanda dentro',
      gl: 'Hexágono azul con lavanda dentro',
    },
    description: {
      es: [
        'Montura hexagonal con lavanda sobre fondo azul lavanda, en tres intensidades según cuánta flor lleve dentro.',
        'Se entrega con cadena dorada de 45 cm.',
      ],
      gl: [
        'Montura hexagonal con lavanda sobre fondo azul lavanda, en tres intensidades segundo canta flor leve dentro.',
        'Entrégase con cadea dourada de 45 cm.',
      ],
    },
    materials: {
      es: ['Resina', 'Lavanda seca', 'Montura hexagonal dorada'],
      gl: ['Resina', 'Lavanda seca', 'Montura hexagonal dourada'],
    },
    image: imgLocalized('colgantes-hexagono-lavanda', {
      es: 'Tres colgantes hexagonales azules con lavanda seca sobre lino',
      gl: 'Tres colgantes hexagonais azuis con lavanda seca sobre liño',
    }),
    featured: false,
  },
  {
    slug: 'conjunto-hexagono-morado',
    name: { es: 'Conjunto Hexágono Morado', gl: 'Conxunto Hexágono Morado' },
    category: 'colgantes',
    price: 58,
    summary: {
      es: 'Colgante y pendientes a juego',
      gl: 'Colgante e pendentes a xogo',
    },
    description: {
      es: [
        'Juego de colgante y pendientes en montura hexagonal dorada, con la misma flor morada en las tres piezas.',
        'Se piden juntos o por separado, y también en plateado.',
      ],
      gl: [
        'Xogo de colgante e pendentes en montura hexagonal dourada, coa mesma flor morada nas tres pezas.',
        'Pídense xuntos ou por separado, e tamén en prateado.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor morada seca', 'Montura hexagonal dorada'],
      gl: ['Resina', 'Flor morada seca', 'Montura hexagonal dourada'],
    },
    image: imgLocalized('conjunto-hexagono-morado', {
      es: 'Colgante y pendientes hexagonales con flores moradas sobre un plato de madera',
      gl: 'Colgante e pendentes hexagonais con flores moradas sobre un prato de madeira',
    }),
    featured: false,
  },
  {
    slug: 'conjunto-petalos-rosa',
    name: { es: 'Conjunto Pétalos de Rosa', gl: 'Conxunto Pétalos de Rosa' },
    category: 'colgantes',
    price: 62,
    summary: {
      es: 'Colgante, pendientes y anillo en crema',
      gl: 'Colgante, pendentes e anel en crema',
    },
    description: {
      es: [
        'Hecho con pétalos de rosa clara, que al secarse se quedan en un crema muy pálido con vetas. Colgante redondo, pendientes hexagonales y anillo ovalado.',
        'Disponible en conjunto y por separado.',
      ],
      gl: [
        'Feito con pétalos de rosa clara, que ao secarse quedan nun crema moi pálido con vetas. Colgante redondo, pendentes hexagonais e anel ovalado.',
        'Dispoñible en conxunto e por separado.',
      ],
    },
    materials: {
      es: ['Resina', 'Pétalos de rosa secos', 'Montura dorada'],
      gl: ['Resina', 'Pétalos de rosa secos', 'Montura dourada'],
    },
    image: imgLocalized('conjunto-petalos-rosa', {
      es: 'Colgante, pendientes y anillo con pétalos claros sobre conos de madera',
      gl: 'Colgante, pendentes e anel con pétalos claros sobre conos de madeira',
    }),
    featured: false,
  },

  {
    slug: 'pulsera-hexagono',
    name: { es: 'Pulsera Hexágono', gl: 'Pulseira Hexágono' },
    category: 'pulseras',
    price: 28,
    summary: {
      es: 'Cadena fina con hexágono de flor',
      gl: 'Cadea fina con hexágono de flor',
    },
    description: {
      es: [
        'La misma montura hexagonal de los colgantes, en cadena de pulsera. Queda plana sobre la muñeca y no gira.',
        'Se piden de una en una. Hay tres rellenos distintos.',
      ],
      gl: [
        'A mesma montura hexagonal dos colgantes, en cadea de pulseira. Queda plana sobre a moneca e non xira.',
        'Pídense dunha en unha. Hai tres recheos distintos.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor seca', 'Cadena de acero dorado'],
      gl: ['Resina', 'Flor seca', 'Cadea de aceiro dourado'],
    },
    image: imgLocalized('pulsera-hexagono', {
      es: 'Tres pulseras de cadena dorada con hexágonos de resina y flores',
      gl: 'Tres pulseiras de cadea dourada con hexágonos de resina e flores',
    }),
    featured: false,
  },
  {
    slug: 'pulsera-margarita-naranja',
    name: { es: 'Pulsera Margarita Naranja', gl: 'Pulseira Margarida Laranxa' },
    category: 'pulseras',
    price: 26,
    summary: {
      es: 'Una margarita naranja al sol',
      gl: 'Unha margarida laranxa ao sol',
    },
    description: {
      es: [
        'Margarita naranja entera en una pieza redonda, sobre cadena fina. Al llevarla puesta el sol la atraviesa y proyecta el color en la piel.',
      ],
      gl: [
        'Margarida laranxa enteira nunha peza redonda, sobre cadea fina. Ao levala posta o sol atravésaa e proxecta a cor na pel.',
      ],
    },
    materials: {
      es: ['Resina', 'Margarita naranja seca', 'Cadena de acero dorado'],
      gl: ['Resina', 'Margarida laranxa seca', 'Cadea de aceiro dourado'],
    },
    image: imgLocalized('pulsera-margarita-naranja', {
      es: 'Pulsera con una margarita naranja en la muñeca, al sol',
      gl: 'Pulseira cunha margarida laranxa na moneca, ao sol',
    }),
    featured: false,
  },
  {
    slug: 'pulsera-margarita-blanca',
    name: { es: 'Pulsera Margarita Blanca', gl: 'Pulseira Margarida Branca' },
    category: 'pulseras',
    price: 26,
    summary: { es: 'La misma, en blanco y rosa', gl: 'A mesma, en branco e rosa' },
    description: {
      es: [
        'Versión en blanco de la pulsera de margarita, con el centro amarillo y un halo rosado en los pétalos.',
      ],
      gl: [
        'Versión en branco da pulseira de margarida, co centro amarelo e un halo rosado nos pétalos.',
      ],
    },
    materials: {
      es: ['Resina', 'Margarita seca', 'Cadena de acero dorado'],
      gl: ['Resina', 'Margarida seca', 'Cadea de aceiro dourado'],
    },
    image: imgLocalized('pulsera-margarita-blanca', {
      es: 'Pulsera con una margarita blanca en la muñeca sobre musgo',
      gl: 'Pulseira cunha margarida branca na moneca sobre musgo',
    }),
    featured: false,
  },
  {
    slug: 'pulsera-piedras',
    name: { es: 'Pulsera Piedra de Color', gl: 'Pulseira Pedra de Cor' },
    category: 'pulseras',
    price: 28,
    summary: {
      es: 'Tres piedras engarzadas en la cadena',
      gl: 'Tres pedras engastadas na cadea',
    },
    description: {
      es: [
        'Tres piedras redondas —azul, ámbar y verde— repartidas a lo largo de la cadena, cada una con flor dentro.',
        'También se hace con una sola piedra, si lo prefieres más discreto.',
      ],
      gl: [
        'Tres pedras redondas —azul, ámbar e verde— repartidas ao longo da cadea, cada unha con flor dentro.',
        'Tamén se fai cunha soa pedra, se o prefires máis discreto.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor seca', 'Cadena de acero dorado'],
      gl: ['Resina', 'Flor seca', 'Cadea de aceiro dourado'],
    },
    image: imgLocalized('pulsera-piedras', {
      es: 'Pulseras con piedras azul, ámbar y verde sobre madera, con lavanda seca',
      gl: 'Pulseiras con pedras azul, ámbar e verde sobre madeira, con lavanda seca',
    }),
    featured: false,
  },

  {
    slug: 'bordado-lavanda',
    name: { es: 'Bordado Lavanda', gl: 'Bordado Lavanda' },
    category: 'bordados',
    price: 42,
    summary: {
      es: 'Tres ramas de lavanda y su nombre',
      gl: 'Tres ramas de lavanda e o seu nome',
    },
    description: {
      es: [
        'Bordado a mano sobre lino crudo, montado en bastidor de madera para colgar tal cual. Tres ramas de lavanda y la palabra escrita a punto de cadeneta.',
        'Bastidor de 15 cm. Cada uno se borda al encargo, así que admite otro nombre o otra flor.',
      ],
      gl: [
        'Bordado a man sobre liño cru, montado en bastidor de madeira para colgar tal cal. Tres ramas de lavanda e a palabra escrita a punto de cadeíña.',
        'Bastidor de 15 cm. Cada un bórdase á encarga, así que admite outro nome ou outra flor.',
      ],
    },
    materials: {
      es: ['Lino', 'Hilo de algodón', 'Bastidor de madera de 15 cm'],
      gl: ['Liño', 'Fío de algodón', 'Bastidor de madeira de 15 cm'],
    },
    image: imgLocalized('bordado-lavanda', {
      es: 'Bastidor con lavanda bordada y la palabra lavanda, con luz cálida',
      gl: 'Bastidor con lavanda bordada e a palabra lavanda, con luz cálida',
    }),
    featured: false,
  },
  {
    slug: 'bordado-calendula',
    name: { es: 'Bordado Caléndula', gl: 'Bordado Caléndula' },
    category: 'bordados',
    price: 42,
    summary: {
      es: 'Caléndulas amarillas sobre lino',
      gl: 'Caléndulas amarelas sobre liño',
    },
    description: {
      es: [
        'Dos caléndulas abiertas con sus hojas, bordadas en amarillo y verde, con el nombre debajo.',
        'Bastidor de 15 cm, listo para colgar.',
      ],
      gl: [
        'Dúas caléndulas abertas coas súas follas, bordadas en amarelo e verde, co nome debaixo.',
        'Bastidor de 15 cm, listo para colgar.',
      ],
    },
    materials: {
      es: ['Lino', 'Hilo de algodón', 'Bastidor de madera de 15 cm'],
      gl: ['Liño', 'Fío de algodón', 'Bastidor de madeira de 15 cm'],
    },
    image: imgLocalized('bordado-calendula', {
      es: 'Bastidor con caléndulas amarillas bordadas y la palabra caléndula',
      gl: 'Bastidor con caléndulas amarelas bordadas e a palabra caléndula',
    }),
    featured: false,
  },
  {
    slug: 'bordado-camelia',
    name: { es: 'Bordado Camelia', gl: 'Bordado Camelia' },
    category: 'bordados',
    price: 42,
    summary: { es: 'La flor de Galicia, a línea', gl: 'A flor de Galicia, a liña' },
    description: {
      es: [
        'Una camelia bordada casi sólo con el contorno, en rosa y verde muy suaves, con el nombre debajo.',
        'Bastidor de 15 cm, listo para colgar.',
      ],
      gl: [
        'Unha camelia bordada case só co contorno, en rosa e verde moi suaves, co nome debaixo.',
        'Bastidor de 15 cm, listo para colgar.',
      ],
    },
    materials: {
      es: ['Lino', 'Hilo de algodón', 'Bastidor de madera de 15 cm'],
      gl: ['Liño', 'Fío de algodón', 'Bastidor de madeira de 15 cm'],
    },
    image: imgLocalized('bordado-camelia', {
      es: 'Bastidor con una camelia rosa bordada y la palabra camelia',
      gl: 'Bastidor cunha camelia rosa bordada e a palabra camelia',
    }),
    featured: false,
  },
  {
    slug: 'bordado-toxo',
    name: { es: 'Bordado Toxo', gl: 'Bordado Toxo' },
    category: 'bordados',
    price: 42,
    summary: { es: 'Toxo en flor, en amarillo', gl: 'Toxo en flor, en amarelo' },
    description: {
      es: [
        'El toxo del monte gallego, con sus flores amarillas y sus espinas, bordado en una rama larga con el nombre en galego.',
        'Bastidor de 15 cm, listo para colgar.',
      ],
      // En galego el nombre ya está en galego, así que la coletilla sobra: lo
      // que en castellano era un dato —que la palabra bordada está en otra
      // lengua— aquí no dice nada.
      gl: [
        'O toxo do monte galego, coas súas flores amarelas e as súas espiñas, bordado nunha rama longa co seu nome.',
        'Bastidor de 15 cm, listo para colgar.',
      ],
    },
    materials: {
      es: ['Lino', 'Hilo de algodón', 'Bastidor de madera de 15 cm'],
      gl: ['Liño', 'Fío de algodón', 'Bastidor de madeira de 15 cm'],
    },
    image: imgLocalized('bordado-toxo', {
      es: 'Bastidor con una rama de toxo bordada en amarillo y la palabra toxo',
      gl: 'Bastidor cunha rama de toxo bordada en amarelo e a palabra toxo',
    }),
    featured: false,
  },
  {
    slug: 'bordado-rostro',
    name: { es: 'Bordado Rostro', gl: 'Bordado Rostro' },
    category: 'bordados',
    price: 48,
    summary: { es: 'Un retrato a línea, con color', gl: 'Un retrato a liña, con cor' },
    description: {
      es: [
        'Un rostro de mujer bordado de una sola línea continua, con manchas de color suelto en el pelo y los ojos. Es la pieza menos botánica del taller.',
        'Bastidor de 20 cm. Se puede bordar a partir de una foto tuya.',
      ],
      gl: [
        'Un rostro de muller bordado dunha soa liña continua, con manchas de cor solta no pelo e nos ollos. É a peza menos botánica do taller.',
        'Bastidor de 20 cm. Pódese bordar a partir dunha foto túa.',
      ],
    },
    materials: {
      es: ['Lino', 'Hilo de algodón', 'Bastidor de madera de 20 cm'],
      gl: ['Liño', 'Fío de algodón', 'Bastidor de madeira de 20 cm'],
    },
    image: imgLocalized('bordado-rostro', {
      es: 'Bastidor con el rostro de una mujer bordado a línea, en una estantería de libros',
      gl: 'Bastidor co rostro dunha muller bordado a liña, nunha estantería de libros',
    }),
    featured: false,
  },

  // ── Resto del archivo del Instagram de Ana (30/07/2026). Hasta ahora sólo
  //    estaban publicadas las piezas «de ficha»; el resto —bodegones, tomas
  //    alternativas, packaging y proceso— se quedaba en la carpeta de archivo.
  //    Aquí entra todo: no había motivo para que la web enseñase menos catálogo
  //    del que hay. Nombres y textos son propuesta.

  {
    slug: 'pendientes-donut-trio',
    name: { es: 'Pendientes Donut', gl: 'Pendentes Donut' },
    category: 'pendientes',
    price: 30,
    summary: {
      es: 'Tres aros de resina, en tres colores',
      gl: 'Tres aros de resina, en tres cores',
    },
    description: {
      es: [
        'Un aro grueso de resina colgando de un gancho dorado, sin flor: aquí manda el color. Se hacen en crema veteado, verde oliva y rosa pálido.',
        'Se piden por pares. Dime el color y te lo preparo.',
      ],
      gl: [
        'Un aro groso de resina colgando dun gancho dourado, sen flor: aquí manda a cor. Fanse en crema veteado, verde oliva e rosa pálido.',
        'Pídense por pares. Dime a cor e prepárocho.',
      ],
    },
    materials: {
      es: ['Resina', 'Pigmento mineral', 'Gancho de acero dorado'],
      gl: ['Resina', 'Pigmento mineral', 'Gancho de aceiro dourado'],
    },
    image: imgLocalized('pendientes-donut-trio', {
      es: 'Seis pares de pendientes de aro de resina en crema, verde y rosa sobre un expositor',
      gl: 'Seis pares de pendentes de aro de resina en crema, verde e rosa sobre un expositor',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-arco-silvestre',
    name: { es: 'Pendientes Arco Silvestre', gl: 'Pendentes Arco Silvestre' },
    category: 'pendientes',
    price: 32,
    summary: {
      es: 'Margarita y flor amarilla bajo el arco',
      gl: 'Margarida e flor amarela baixo o arco',
    },
    description: {
      es: [
        'El arco del taller, esta vez con una margarita blanca abierta, una florecilla amarilla y una brizna verde repartidas dentro de la resina transparente.',
        'La resina es fina, así que pesan poco para lo grandes que se ven.',
      ],
      gl: [
        'O arco do taller, esta vez cunha margarida branca aberta, unha floriña amarela e unha palla verde repartidas dentro da resina transparente.',
        'A resina é fina, así que pesan pouco para o grandes que se ven.',
      ],
    },
    materials: {
      es: ['Resina', 'Margarita y flor silvestre secas', 'Gancho de acero dorado'],
      gl: ['Resina', 'Margarida e flor silvestre secas', 'Gancho de aceiro dourado'],
    },
    image: imgLocalized('pendientes-arco-silvestre', {
      es: 'Dos pendientes de arco transparente con margaritas, colgados de una maceta con un bonsái',
      gl: 'Dous pendentes de arco transparente con margaridas, colgados dunha maceta cun bonsái',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-otono',
    name: { es: 'Pendientes Otoño', gl: 'Pendentes Outono' },
    category: 'pendientes',
    price: 30,
    summary: { es: 'Verde oliva y naranja, sin flor', gl: 'Verde oliva e laranxa, sen flor' },
    description: {
      es: [
        'Tres modelos de la misma colección: nube con disco, arco con círculo y dos piedras encadenadas. Todos en resina teñida en verde oliva y naranja quemado, los colores del monte en octubre.',
        'Se piden por pares y sueltos: no hace falta llevarse los tres.',
      ],
      gl: [
        'Tres modelos da mesma colección: nube con disco, arco con círculo e dúas pedras encadeadas. Todos en resina tinguida en verde oliva e laranxa queimado, as cores do monte en outubro.',
        'Pídense por pares e soltos: non fai falta levar os tres.',
      ],
    },
    materials: {
      es: ['Resina', 'Pigmento mineral', 'Acero dorado'],
      gl: ['Resina', 'Pigmento mineral', 'Aceiro dourado'],
    },
    image: imgLocalized('pendientes-otono', {
      es: 'Tres pares de pendientes geométricos verdes y naranjas en expositores sobre madera',
      gl: 'Tres pares de pendentes xeométricos verdes e laranxas en expositores sobre madeira',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-fumaria',
    name: { es: 'Pendientes Fumaria', gl: 'Pendentes Fumaria' },
    category: 'pendientes',
    price: 34,
    summary: {
      es: 'Fumaria y helecho en un óvalo grande',
      gl: 'Fumaria e fento nun óvalo grande',
    },
    description: {
      es: [
        'Fumaria —esa flor rosa de puntas oscuras que sale en las cunetas— con unas hojas de helecho detrás, dentro de un óvalo transparente colgado de un aro fino.',
        'Es de las piezas más grandes y de las que menos pesan.',
      ],
      gl: [
        'Fumaria —esa flor rosa de puntas escuras que sae nas gabias— cunhas follas de fento detrás, dentro dun óvalo transparente colgado dun aro fino.',
        'É das pezas máis grandes e das que menos pesan.',
      ],
    },
    materials: {
      es: ['Resina', 'Fumaria y helecho prensados', 'Aro de acero dorado'],
      gl: ['Resina', 'Fumaria e fento prensados', 'Aro de aceiro dourado'],
    },
    image: imgLocalized('pendientes-fumaria', {
      es: 'Pendientes ovalados con flores rosas y helecho colgados de un soporte dorado',
      gl: 'Pendentes ovalados con flores rosas e fento colgados dun soporte dourado',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-disco-margarita',
    name: { es: 'Pendientes Disco Margarita', gl: 'Pendentes Disco Margarida' },
    category: 'pendientes',
    price: 32,
    summary: { es: 'Una margarita abierta, a contraluz', gl: 'Unha margarida aberta, a contraluz' },
    description: {
      es: [
        'Una margarita blanca abierta del todo, con el centro amarillo intacto, dentro de un disco redondo de resina casi incolora. Al trasluz se le ven los pétalos uno a uno.',
        'Cuelgan de un aro grande, así que se mueven al andar.',
      ],
      gl: [
        'Unha margarida branca aberta de todo, co centro amarelo intacto, dentro dun disco redondo de resina case incolora. Ao trasluz vénselle os pétalos un a un.',
        'Colgan dun aro grande, así que se moven ao andar.',
      ],
    },
    materials: {
      es: ['Resina', 'Margarita prensada', 'Aro de acero dorado'],
      gl: ['Resina', 'Margarida prensada', 'Aro de aceiro dourado'],
    },
    image: imgLocalized('pendientes-disco-margarita', {
      es: 'Pendientes redondos con una margarita blanca dentro, en un soporte dorado al sol',
      gl: 'Pendentes redondos cunha margarida branca dentro, nun soporte dourado ao sol',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-ovalo-amarillo',
    name: { es: 'Pendientes Óvalo Amarillo', gl: 'Pendentes Óvalo Amarelo' },
    category: 'pendientes',
    price: 28,
    summary: {
      es: 'Una flor amarilla dentro de un óvalo hueco',
      gl: 'Unha flor amarela dentro dun óvalo baleiro',
    },
    description: {
      es: [
        'La montura es un óvalo dorado abierto y la flor queda suspendida en el aire, sujeta por una lámina de resina casi invisible. Parece que flota.',
        'Pequeños y de diario. Cierre de botón.',
      ],
      gl: [
        'A montura é un óvalo dourado aberto e a flor queda suspendida no aire, suxeita por unha lámina de resina case invisible. Parece que flota.',
        'Pequenos e de diario. Peche de botón.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor amarilla seca', 'Montura ovalada dorada'],
      gl: ['Resina', 'Flor amarela seca', 'Montura ovalada dourada'],
    },
    image: imgLocalized('pendientes-ovalo-amarillo', {
      es: 'Dos pendientes de óvalo dorado con una flor amarilla dentro, sobre lino',
      gl: 'Dous pendentes de óvalo dourado cunha flor amarela dentro, sobre liño',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-terrazo-azul',
    name: { es: 'Pendientes Terrazo Azul', gl: 'Pendentes Terrazo Azul' },
    category: 'pendientes',
    price: 32,
    summary: {
      es: 'Pétalos azules partidos, como un terrazo',
      gl: 'Pétalos azuis partidos, coma un terrazo',
    },
    description: {
      es: [
        'Pétalos de flor azul y lila cortados a trozos y repartidos en resina transparente: de lejos parece terrazo, de cerca sigue siendo flor.',
        'Tres formas de la misma colección: rectángulo calado, arco pequeño y arco grande. Se piden por pares.',
      ],
      gl: [
        'Pétalos de flor azul e lila cortados a anacos e repartidos en resina transparente: de lonxe parece terrazo, de preto segue sendo flor.',
        'Tres formas da mesma colección: rectángulo calado, arco pequeno e arco grande. Pídense por pares.',
      ],
    },
    materials: {
      es: ['Resina', 'Pétalos secos', 'Acero dorado'],
      gl: ['Resina', 'Pétalos secos', 'Aceiro dourado'],
    },
    image: imgLocalized('pendientes-terrazo-azul', {
      es: 'Tres pares de pendientes de resina con trozos de pétalo azul sobre tela clara',
      gl: 'Tres pares de pendentes de resina con anacos de pétalo azul sobre tea clara',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-ovalo-plata',
    name: { es: 'Pendientes Óvalo Plata', gl: 'Pendentes Óvalo Prata' },
    category: 'pendientes',
    price: 28,
    summary: { es: 'Flor rosa en montura plateada', gl: 'Flor rosa en montura prateada' },
    description: {
      es: [
        'La misma montura ovalada hueca, esta vez en plateado y con una florecilla rosa de tallo largo dentro.',
        'Para quien no lleva dorado. Se hacen también con la flor que elijas.',
      ],
      gl: [
        'A mesma montura ovalada baleira, esta vez en prateado e cunha floriña rosa de talo longo dentro.',
        'Para quen non leva dourado. Fanse tamén coa flor que escollas.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor silvestre seca', 'Montura ovalada plateada'],
      gl: ['Resina', 'Flor silvestre seca', 'Montura ovalada prateada'],
    },
    image: imgLocalized('pendientes-ovalo-plata', {
      es: 'Dos pendientes ovalados plateados con una flor rosa, sostenidos en una mano',
      gl: 'Dous pendentes ovalados prateados cunha flor rosa, sostidos nunha man',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-aro-petalos',
    name: { es: 'Pendientes Aro de Pétalos', gl: 'Pendentes Aro de Pétalos' },
    category: 'pendientes',
    price: 32,
    summary: {
      es: 'Un anillo de resina lleno de pétalos morados',
      gl: 'Un anel de resina cheo de pétalos morados',
    },
    description: {
      es: [
        'Aro grueso de resina transparente con pétalos morados y ámbar embebidos por todo el contorno. El centro queda hueco, así que la luz pasa a través.',
        'Es de las piezas que mejor quedan a contraluz.',
      ],
      gl: [
        'Aro groso de resina transparente con pétalos morados e ámbar embebidos por todo o contorno. O centro queda baleiro, así que a luz pasa a través.',
        'É das pezas que mellor quedan a contraluz.',
      ],
    },
    materials: {
      es: ['Resina', 'Pétalos secos', 'Gancho de acero dorado'],
      gl: ['Resina', 'Pétalos secos', 'Gancho de aceiro dourado'],
    },
    image: imgLocalized('pendientes-aro-petalos', {
      es: 'Pendientes de aro con pétalos morados colgados de la rama de un árbol al sol',
      gl: 'Pendentes de aro con pétalos morados colgados da rama dunha árbore ao sol',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-arco-fucsia',
    name: { es: 'Pendientes Arco Fucsia', gl: 'Pendentes Arco Fucsia' },
    category: 'pendientes',
    price: 32,
    summary: {
      es: 'Fucsia, rojo y naranja en el mismo arco',
      gl: 'Fucsia, vermello e laranxa no mesmo arco',
    },
    description: {
      es: [
        'Pétalos de buganvilla y de rosa cortados y colocados en un arco macizo. Es la combinación más caliente del taller: fucsia, rojo y naranja sin nada frío que los calme.',
        'Cada par sale distinto: los trozos nunca caen igual.',
      ],
      gl: [
        'Pétalos de buganvilla e de rosa cortados e colocados nun arco macizo. É a combinación máis quente do taller: fucsia, vermello e laranxa sen nada frío que os calme.',
        'Cada par sae distinto: os anacos nunca caen igual.',
      ],
    },
    materials: {
      es: ['Resina', 'Pétalos secos', 'Gancho de acero dorado'],
      gl: ['Resina', 'Pétalos secos', 'Gancho de aceiro dourado'],
    },
    image: imgLocalized('pendientes-arco-fucsia', {
      es: 'Dos pendientes de arco con pétalos fucsias y naranjas en la palma de una mano al sol',
      gl: 'Dous pendentes de arco con pétalos fucsias e laranxas na palma dunha man ao sol',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-cascada-azul',
    name: { es: 'Pendientes Cascada', gl: 'Pendentes Fervenza' },
    category: 'pendientes',
    price: 36,
    summary: {
      es: 'Tres piezas encadenadas, azul y oro',
      gl: 'Tres pezas encadeadas, azul e ouro',
    },
    description: {
      es: [
        'Círculo, arco y barra colgando uno del otro, los tres con pétalos azules y virutas doradas dentro. Son los pendientes más largos que hago.',
        'Pesan poco a pesar del tamaño, pero piden pelo recogido.',
      ],
      gl: [
        'Círculo, arco e barra colgando un do outro, os tres con pétalos azuis e labras douradas dentro. Son os pendentes máis longos que fago.',
        'Pesan pouco malia o tamaño, pero piden pelo recollido.',
      ],
    },
    materials: {
      es: ['Resina', 'Pétalos secos', 'Pan de oro', 'Acero dorado'],
      gl: ['Resina', 'Pétalos secos', 'Pan de ouro', 'Aceiro dourado'],
    },
    image: imgLocalized('pendientes-cascada-azul', {
      es: 'Pendientes largos de tres piezas con pétalos azules, sostenidos frente al mar',
      gl: 'Pendentes longos de tres pezas con pétalos azuis, sostidos fronte ao mar',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-hoja-otono',
    name: { es: 'Pendientes Hoja de Otoño', gl: 'Pendentes Folla de Outono' },
    category: 'pendientes',
    price: 34,
    summary: {
      es: 'Una hoja roja entera, recortada a su forma',
      gl: 'Unha folla vermella enteira, recortada á súa forma',
    },
    description: {
      es: [
        'Una hoja de otoño completa, roja con la nervadura ámbar, sellada en resina y recortada siguiendo su propio contorno. No hay montura: la pieza tiene la forma de la hoja.',
        'Cada par depende de las hojas que haya recogido ese año, así que la forma nunca se repite.',
      ],
      gl: [
        'Unha folla de outono completa, vermella coa nervadura ámbar, selada en resina e recortada seguindo o seu propio contorno. Non hai montura: a peza ten a forma da folla.',
        'Cada par depende das follas que teña recollido ese ano, así que a forma nunca se repite.',
      ],
    },
    materials: {
      es: ['Resina', 'Hoja natural prensada', 'Aro de acero dorado'],
      gl: ['Resina', 'Folla natural prensada', 'Aro de aceiro dourado'],
    },
    image: imgLocalized('pendientes-hoja-otono', {
      es: 'Dos pendientes en forma de hoja roja colgados de las ramas de un bonsái',
      gl: 'Dous pendentes en forma de folla vermella colgados das ramas dun bonsái',
    }),
    featured: true,
  },
  {
    slug: 'pendientes-lavanda-gota',
    name: { es: 'Pendientes Lavanda', gl: 'Pendentes Lavanda' },
    category: 'pendientes',
    price: 30,
    summary: { es: 'Gota o aro, con lavanda dentro', gl: 'Pinga ou aro, con lavanda dentro' },
    description: {
      es: [
        'Lavanda repartida en resina transparente, en dos formas: gota alargada de botón y aro hueco de gancho. El morado queda apagado, como la flor cuando se seca de verdad.',
        'Se piden por pares. Dime cuál de las dos formas quieres.',
      ],
      gl: [
        'Lavanda repartida en resina transparente, en dúas formas: pinga alongada de botón e aro baleiro de gancho. O morado queda apagado, coma a flor cando seca de verdade.',
        'Pídense por pares. Dime cal das dúas formas queres.',
      ],
    },
    materials: {
      es: ['Resina', 'Lavanda seca', 'Acero dorado'],
      gl: ['Resina', 'Lavanda seca', 'Aceiro dourado'],
    },
    image: imgLocalized('pendientes-lavanda-gota', {
      es: 'Dos pares de pendientes con lavanda sobre una rodaja de madera entre hojas secas',
      gl: 'Dous pares de pendentes con lavanda sobre unha rodaxe de madeira entre follas secas',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-arco-lila',
    name: { es: 'Pendientes Arco Lila', gl: 'Pendentes Arco Lila' },
    category: 'pendientes',
    price: 34,
    summary: {
      es: 'Margaritas amarillas y florecillas lilas',
      gl: 'Margaridas amarelas e floriñas lilas',
    },
    description: {
      es: [
        'Arco de resina transparente lleno hasta arriba: margaritas amarillas abiertas, florecillas lilas y hojas finas, sin dejar hueco. De las piezas con más flor por centímetro.',
        'Se hacen a juego con el colgante hexagonal.',
      ],
      gl: [
        'Arco de resina transparente cheo ata arriba: margaridas amarelas abertas, floriñas lilas e follas finas, sen deixar oco. Das pezas con máis flor por centímetro.',
        'Fanse a xogo co colgante hexagonal.',
      ],
    },
    materials: {
      es: ['Resina', 'Margarita y flor silvestre secas', 'Gancho de acero dorado'],
      gl: ['Resina', 'Margarida e flor silvestre secas', 'Gancho de aceiro dourado'],
    },
    image: imgLocalized('pendientes-arco-lila', {
      es: 'Dos pendientes de arco con margaritas amarillas y flores lilas sobre lino, entre hojas',
      gl: 'Dous pendentes de arco con margaridas amarelas e flores lilas sobre liño, entre follas',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-pensamiento',
    name: { es: 'Pendientes Pensamiento', gl: 'Pendentes Pensamento' },
    category: 'pendientes',
    price: 34,
    summary: {
      es: 'Un pensamiento entero, crema y burdeos',
      gl: 'Un pensamento enteiro, crema e bordeos',
    },
    description: {
      es: [
        'La flor del pensamiento completa, con sus cinco pétalos, dos color crema arriba y tres burdeos abajo. Se recorta la resina al borde del pétalo para que no se vea montura.',
        'Es la pieza que más cuesta secar bien: el pétalo es grueso y se pardea si se seca deprisa.',
      ],
      gl: [
        'A flor do pensamento completa, cos seus cinco pétalos, dous de cor crema arriba e tres bordeos abaixo. Recórtase a resina ao bordo do pétalo para que non se vexa montura.',
        'É a peza que máis custa secar ben: o pétalo é groso e amarelea se seca de présa.',
      ],
    },
    materials: {
      es: ['Resina', 'Pensamiento natural seco', 'Gancho de acero dorado'],
      gl: ['Resina', 'Pensamento natural seco', 'Gancho de aceiro dourado'],
    },
    image: imgLocalized('pendientes-pensamiento', {
      es: 'Dos pendientes con flores de pensamiento crema y burdeos sostenidos en una mano al sol',
      gl: 'Dous pendentes con flores de pensamento crema e bordeos sostidos nunha man ao sol',
    }),
    featured: true,
  },
  {
    slug: 'pendientes-cadena-rosa',
    name: { es: 'Pendientes Cadena Rosa', gl: 'Pendentes Cadea Rosa' },
    category: 'pendientes',
    price: 32,
    summary: {
      es: 'Dos discos rosas al final de dos cadenas',
      gl: 'Dous discos rosas ao final de dúas cadeas',
    },
    description: {
      es: [
        'Dos cadenas finas de distinta largura que caen de un mismo gancho, cada una con un disco de resina rosa y pan de oro. Se mueven todo el rato.',
        'Los más largos y los más discretos a la vez: la pieza es diminuta.',
      ],
      gl: [
        'Dúas cadeas finas de distinta lonxitude que caen dun mesmo gancho, cada unha cun disco de resina rosa e pan de ouro. Móvense todo o tempo.',
        'Os máis longos e os máis discretos á vez: a peza é diminuta.',
      ],
    },
    materials: {
      es: ['Resina', 'Pigmento', 'Pan de oro', 'Cadena de acero dorado'],
      gl: ['Resina', 'Pigmento', 'Pan de ouro', 'Cadea de aceiro dourado'],
    },
    image: imgLocalized('pendientes-cadena-rosa', {
      es: 'Pendientes largos de cadena con dos discos rosas, sobre lino junto a eucalipto',
      gl: 'Pendentes longos de cadea con dous discos rosas, sobre liño xunto a eucalipto',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-flor-gota-azul',
    name: { es: 'Pendientes Flor y Gota', gl: 'Pendentes Flor e Pinga' },
    category: 'pendientes',
    price: 34,
    summary: { es: 'Flor arriba, gota larga debajo', gl: 'Flor arriba, pinga longa debaixo' },
    description: {
      es: [
        'Dos piezas unidas por una anilla: una flor de cinco pétalos arriba y una gota larga colgando, las dos con flor azul y ámbar dentro.',
        'Es el modelo que más se pide para bodas.',
      ],
      gl: [
        'Dúas pezas unidas por unha anela: unha flor de cinco pétalos arriba e unha pinga longa colgando, as dúas con flor azul e ámbar dentro.',
        'É o modelo que máis se pide para vodas.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor seca', 'Acero dorado'],
      gl: ['Resina', 'Flor seca', 'Aceiro dourado'],
    },
    image: imgLocalized('pendientes-flor-gota-azul', {
      es: 'Pendientes de flor y gota en su tarjeta, sostenidos frente al mar al atardecer',
      gl: 'Pendentes de flor e pinga na súa tarxeta, sostidos fronte ao mar ao solpor',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-gota-fucsia',
    name: { es: 'Pendientes Gota Fucsia', gl: 'Pendentes Pinga Fucsia' },
    category: 'pendientes',
    price: 30,
    summary: { es: 'Gota larga fucsia con pan de oro', gl: 'Pinga longa fucsia con pan de ouro' },
    description: {
      es: [
        'Una sola gota larga por pendiente, con pétalos fucsias y virutas de pan de oro repartidas por dentro. Cierre de botón, así que quedan pegados a la oreja arriba y sueltos abajo.',
      ],
      gl: [
        'Unha soa pinga longa por pendente, con pétalos fucsias e labras de pan de ouro repartidas por dentro. Peche de botón, así que quedan pegados á orella arriba e soltos abaixo.',
      ],
    },
    materials: {
      es: ['Resina', 'Pétalos secos', 'Pan de oro', 'Acero dorado'],
      gl: ['Resina', 'Pétalos secos', 'Pan de ouro', 'Aceiro dourado'],
    },
    image: imgLocalized('pendientes-gota-fucsia', {
      es: 'Pendientes de gota larga fucsia en su tarjeta, junto a un sello de campanilla',
      gl: 'Pendentes de pinga longa fucsia na súa tarxeta, xunto a un selo de campaíña',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-flor-cuadrado',
    name: { es: 'Pendientes Flor y Cuadrado', gl: 'Pendentes Flor e Cadrado' },
    category: 'pendientes',
    price: 32,
    summary: { es: 'Ámbar y verde, en dos piezas', gl: 'Ámbar e verde, en dúas pezas' },
    description: {
      es: [
        'Flor de cinco pétalos arriba y cuadrado debajo, los dos con pétalos ámbar y hojas verdes dentro. Los colores salen del eucalipto seco con el que se fotografían.',
      ],
      gl: [
        'Flor de cinco pétalos arriba e cadrado debaixo, os dous con pétalos ámbar e follas verdes dentro. As cores saen do eucalipto seco co que se fotografían.',
      ],
    },
    materials: {
      es: ['Resina', 'Pétalos y hoja secos', 'Acero dorado'],
      gl: ['Resina', 'Pétalos e folla secos', 'Aceiro dourado'],
    },
    image: imgLocalized('pendientes-flor-cuadrado', {
      es: 'Pendientes de flor y cuadrado en tonos ámbar sobre lino, junto a hojas de eucalipto',
      gl: 'Pendentes de flor e cadrado en tons ámbar sobre liño, xunto a follas de eucalipto',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-rectangulo-esmeralda',
    name: { es: 'Pendientes Rectángulo Esmeralda', gl: 'Pendentes Rectángulo Esmeralda' },
    category: 'pendientes',
    price: 34,
    summary: { es: 'Rosa, verde esmeralda y oro', gl: 'Rosa, verde esmeralda e ouro' },
    description: {
      es: [
        'Rectángulo calado por dentro, con pétalos rosas, hojas verde esmeralda y pan de oro repartidos por el marco. Se hacen también en gota, con la misma mezcla.',
        'Se piden por pares. Dime si los quieres en rectángulo o en gota.',
      ],
      gl: [
        'Rectángulo calado por dentro, con pétalos rosas, follas verde esmeralda e pan de ouro repartidos polo marco. Fanse tamén en pinga, coa mesma mestura.',
        'Pídense por pares. Dime se os queres en rectángulo ou en pinga.',
      ],
    },
    materials: {
      es: ['Resina', 'Pétalos y hoja secos', 'Pan de oro', 'Acero dorado'],
      gl: ['Resina', 'Pétalos e folla secos', 'Pan de ouro', 'Aceiro dourado'],
    },
    image: imgLocalized('pendientes-rectangulo-esmeralda', {
      es: 'Pendientes rectangulares y de gota con pétalos rosas y verdes sobre una rodaja de madera',
      gl: 'Pendentes rectangulares e de pinga con pétalos rosas e verdes sobre unha rodaxe de madeira',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-miel',
    name: { es: 'Pendientes Miel', gl: 'Pendentes Mel' },
    category: 'pendientes',
    price: 32,
    summary: { es: 'Flor de tojo en tres formatos', gl: 'Flor de toxo en tres formatos' },
    description: {
      es: [
        'Flor de tojo seca, que al perder el agua se queda entre miel y canela, repartida en resina clara. Hay tres formatos: arco, barra larga y escalera de cuatro cuadrados.',
        'Se piden por pares. La escalera es la más larga y la que más pesa.',
      ],
      gl: [
        'Flor de toxo seca, que ao perder a auga queda entre mel e canela, repartida en resina clara. Hai tres formatos: arco, barra longa e escaleira de catro cadrados.',
        'Pídense por pares. A escaleira é a máis longa e a que máis pesa.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor de tojo seca', 'Acero dorado'],
      gl: ['Resina', 'Flor de toxo seca', 'Aceiro dourado'],
    },
    image: imgLocalized('pendientes-miel', {
      es: 'Tres pares de pendientes color miel con flores secas, sobre tela de lino',
      gl: 'Tres pares de pendentes de cor mel con flores secas, sobre tea de liño',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-aro-flor-intercambiable',
    name: { es: 'Aros con Flor Intercambiable', gl: 'Aros con Flor Intercambiable' },
    category: 'pendientes',
    price: 34,
    summary: { es: 'Un aro y las flores que quieras', gl: 'Un aro e as flores que queiras' },
    description: {
      es: [
        'Un aro de acero, dorado o plateado, y flores de resina que se sacan y se ponen. Cada flor es una pieza distinta: azul veteado, verde esmeralda, morado, ámbar, lila.',
        'El par de aros va con dos flores a elegir. Las de más se piden sueltas y se van cambiando según el día.',
      ],
      gl: [
        'Un aro de aceiro, dourado ou prateado, e flores de resina que se sacan e se poñen. Cada flor é unha peza distinta: azul veteado, verde esmeralda, morado, ámbar, lila.',
        'O par de aros vai con dúas flores a escoller. As de máis pídense soltas e vanse cambiando segundo o día.',
      ],
    },
    materials: {
      es: ['Resina', 'Pétalos secos', 'Aro de acero dorado o plateado'],
      gl: ['Resina', 'Pétalos secos', 'Aro de aceiro dourado ou prateado'],
    },
    image: imgLocalized('pendientes-aro-flor-intercambiable', {
      es: 'Siete flores de resina de colores y dos pares de aros en la palma de una mano',
      gl: 'Sete flores de resina de cores e dous pares de aros na palma dunha man',
    }),
    featured: true,
  },
  {
    slug: 'pendientes-ovalo-nube',
    name: { es: 'Pendientes Óvalo Nube', gl: 'Pendentes Óvalo Nube' },
    category: 'pendientes',
    price: 32,
    summary: { es: 'Crema, azul pálido y oro', gl: 'Crema, azul pálido e ouro' },
    description: {
      es: [
        'Óvalo grueso calado por dentro, con pétalos color crema, azul muy pálido y láminas de oro. Es la pieza más clara del taller y la que mejor va con ropa de verano.',
      ],
      gl: [
        'Óvalo groso calado por dentro, con pétalos de cor crema, azul moi pálido e láminas de ouro. É a peza máis clara do taller e a que mellor vai con roupa de verán.',
      ],
    },
    materials: {
      es: ['Resina', 'Pétalos secos', 'Pan de oro', 'Acero plateado'],
      gl: ['Resina', 'Pétalos secos', 'Pan de ouro', 'Aceiro prateado'],
    },
    image: imgLocalized('pendientes-ovalo-nube', {
      es: 'Pendientes ovalados en tonos crema y azul pálido en su tarjeta, sobre un arbusto verde',
      gl: 'Pendentes ovalados en tons crema e azul pálido na súa tarxeta, sobre un arbusto verde',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-gota-hortensia',
    name: { es: 'Pendientes Gota Hortensia', gl: 'Pendentes Pinga Hortensia' },
    category: 'pendientes',
    price: 32,
    summary: {
      es: 'Hortensia blanca y una brizna dorada',
      gl: 'Hortensia branca e unha palla dourada',
    },
    description: {
      es: [
        'Una flor de hortensia blanca con el centro verde y una brizna seca de color miel cruzando la gota. Fondo casi transparente, montura plateada.',
        'La hortensia blanca amarillea con el sol directo; guárdalos a la sombra y aguantan años.',
      ],
      gl: [
        'Unha flor de hortensia branca co centro verde e unha palla seca de cor mel cruzando a pinga. Fondo case transparente, montura prateada.',
        'A hortensia branca amarelea co sol directo; gárdaos á sombra e aguantan anos.',
      ],
    },
    materials: {
      es: ['Resina', 'Hortensia natural seca', 'Acero plateado'],
      gl: ['Resina', 'Hortensia natural seca', 'Aceiro prateado'],
    },
    image: imgLocalized('pendientes-gota-hortensia', {
      es: 'Pendientes de gota con hortensia blanca en su tarjeta, sobre la arena de la playa',
      gl: 'Pendentes de pinga con hortensia branca na súa tarxeta, sobre a area da praia',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-hortensia-azul',
    name: { es: 'Pendientes Hortensia Azul', gl: 'Pendentes Hortensia Azul' },
    category: 'pendientes',
    price: 32,
    summary: { es: 'Hortensia azul en aro plateado', gl: 'Hortensia azul en aro prateado' },
    description: {
      es: [
        'La flor entera de hortensia azul, recortada a su contorno y colgada de un aro plateado grande. El azul de la hortensia gallega, el que sale cuando la tierra es ácida.',
      ],
      gl: [
        'A flor enteira de hortensia azul, recortada ao seu contorno e colgada dun aro prateado grande. O azul da hortensia galega, o que sae cando a terra é ácida.',
      ],
    },
    materials: {
      es: ['Resina', 'Hortensia natural seca', 'Aro de acero plateado'],
      gl: ['Resina', 'Hortensia natural seca', 'Aro de aceiro prateado'],
    },
    image: imgLocalized('pendientes-hortensia-azul', {
      es: 'Pendientes de aro con flores de hortensia azul pálido, sostenidos al atardecer en el campo',
      gl: 'Pendentes de aro con flores de hortensia azul pálido, sostidos ao solpor no campo',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-tres-aros',
    name: { es: 'Pendientes Tres Aros', gl: 'Pendentes Tres Aros' },
    category: 'pendientes',
    price: 34,
    summary: { es: 'Tres donuts crema en cascada', gl: 'Tres donuts crema en fervenza' },
    description: {
      es: [
        'Tres aros de resina color crema veteado, encadenados de mayor a menor. Sin flor: es la pieza más sobria que hago.',
        'Largos, pero muy ligeros: la resina hueca no pesa.',
      ],
      gl: [
        'Tres aros de resina de cor crema veteado, encadeados de maior a menor. Sen flor: é a peza máis sobria que fago.',
        'Longos, pero moi lixeiros: a resina baleira non pesa.',
      ],
    },
    materials: {
      es: ['Resina', 'Pigmento mineral', 'Gancho de acero dorado'],
      gl: ['Resina', 'Pigmento mineral', 'Gancho de aceiro dourado'],
    },
    image: imgLocalized('pendientes-tres-aros', {
      es: 'Pendientes de tres aros color crema apoyados en una roca, con la playa al fondo',
      gl: 'Pendentes de tres aros de cor crema apoiados nunha rocha, coa praia ao fondo',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-esfera-amarilla',
    name: { es: 'Pendientes Esfera', gl: 'Pendentes Esfera' },
    category: 'pendientes',
    price: 30,
    summary: {
      es: 'Una flor amarilla dentro de una bola',
      gl: 'Unha flor amarela dentro dunha bóla',
    },
    description: {
      es: [
        'Una esfera de resina del tamaño de un guisante con una flor amarilla suspendida en el centro. No es una placa: la flor está metida en el volumen y se ve desde cualquier ángulo.',
        'Cuelgan de un aro pequeño, pegados al lóbulo.',
      ],
      gl: [
        'Unha esfera de resina do tamaño dun chícharo cunha flor amarela suspendida no centro. Non é unha placa: a flor está metida no volume e vese desde calquera ángulo.',
        'Colgan dun aro pequeno, pegados ao lóbulo.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor amarilla seca', 'Aro de acero dorado'],
      gl: ['Resina', 'Flor amarela seca', 'Aro de aceiro dourado'],
    },
    image: imgLocalized('pendientes-esfera-amarilla', {
      es: 'Dos pendientes de esfera con una flor amarilla dentro, colgados de una rama de cedro',
      gl: 'Dous pendentes de esfera cunha flor amarela dentro, colgados dunha rama de cedro',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-arco-mostaza',
    name: { es: 'Pendientes Arco Mostaza', gl: 'Pendentes Arco Mostaza' },
    category: 'pendientes',
    price: 30,
    summary: { es: 'Arco pequeño color mostaza', gl: 'Arco pequeno de cor mostaza' },
    description: {
      es: [
        'Botón redondo y arco debajo, los dos en resina mostaza con flor seca dentro. De los más pequeños de la familia de arcos: se llevan a diario sin pensar en ellos.',
      ],
      gl: [
        'Botón redondo e arco debaixo, os dous en resina mostaza con flor seca dentro. Dos máis pequenos da familia de arcos: lévanse a diario sen pensar neles.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor seca', 'Acero dorado'],
      gl: ['Resina', 'Flor seca', 'Aceiro dourado'],
    },
    image: imgLocalized('pendientes-arco-mostaza', {
      es: 'Pendiente de arco color mostaza puesto en la oreja, con el pelo al viento',
      gl: 'Pendente de arco de cor mostaza posto na orella, co pelo ao vento',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-verbena',
    name: { es: 'Pendientes Verbena', gl: 'Pendentes Verbena' },
    category: 'pendientes',
    price: 32,
    summary: { es: 'Todos los colores a la vez', gl: 'Todas as cores á vez' },
    description: {
      es: [
        'Pétalos rojos, morados, amarillos y blancos partidos y mezclados sin ningún criterio. Es la pieza más ruidosa del taller y la que más gusta en verano.',
        'En dos formas: arco pequeño de botón y aro grande de gancho. Se piden por pares.',
      ],
      gl: [
        'Pétalos vermellos, morados, amarelos e brancos partidos e mesturados sen ningún criterio. É a peza máis ruidosa do taller e a que máis gusta no verán.',
        'En dúas formas: arco pequeno de botón e aro grande de gancho. Pídense por pares.',
      ],
    },
    materials: {
      es: ['Resina', 'Pétalos secos', 'Acero dorado'],
      gl: ['Resina', 'Pétalos secos', 'Aceiro dourado'],
    },
    image: imgLocalized('pendientes-verbena', {
      es: 'Dos pares de pendientes con pétalos de muchos colores sobre una rodaja de madera',
      gl: 'Dous pares de pendentes con pétalos de moitas cores sobre unha rodaxe de madeira',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-margarita-gota',
    name: { es: 'Pendientes Margarita y Gota', gl: 'Pendentes Margarida e Pinga' },
    category: 'pendientes',
    price: 34,
    summary: {
      es: 'Margarita en resina, gota en latón',
      gl: 'Margarida en resina, pinga en latón',
    },
    description: {
      es: [
        'Una margarita blanca en disco de resina y, colgando, una gota de latón martilleado. Es la única pieza donde el metal pesa tanto como la flor.',
        'El martilleado se hace a mano, así que no hay dos gotas con la misma marca.',
      ],
      gl: [
        'Unha margarida branca en disco de resina e, colgando, unha pinga de latón martelado. É a única peza onde o metal pesa tanto coma a flor.',
        'O martelado faise a man, así que non hai dúas pingas coa mesma marca.',
      ],
    },
    materials: {
      es: ['Resina', 'Margarita prensada', 'Latón martilleado'],
      gl: ['Resina', 'Margarida prensada', 'Latón martelado'],
    },
    image: imgLocalized('pendientes-margarita-gota', {
      es: 'Pendiente con margarita y gota de latón puesto, de perfil, con chaqueta de cuero',
      gl: 'Pendente con margarida e pinga de latón posto, de perfil, con chaqueta de coiro',
    }),
    featured: false,
  },
  {
    slug: 'pendientes-margarita-grande',
    name: { es: 'Pendientes Margarita Grande', gl: 'Pendentes Margarida Grande' },
    category: 'pendientes',
    price: 34,
    summary: {
      es: 'Una margarita entera, del tamaño real',
      gl: 'Unha margarida enteira, do tamaño real',
    },
    description: {
      es: [
        'La margarita a su tamaño de campo, sin recortar, dentro de un disco de borde libre con un filo dorado que se pintó a mano. Ocupa entero el lóbulo.',
        'Es la versión grande de los pendientes de disco.',
      ],
      gl: [
        'A margarida ao seu tamaño de campo, sen recortar, dentro dun disco de bordo libre cun fío dourado que se pintou a man. Ocupa enteiro o lóbulo.',
        'É a versión grande dos pendentes de disco.',
      ],
    },
    materials: {
      es: ['Resina', 'Margarita prensada', 'Filo dorado', 'Acero dorado'],
      gl: ['Resina', 'Margarida prensada', 'Fío dourado', 'Aceiro dourado'],
    },
    image: imgLocalized('pendientes-margarita-grande', {
      es: 'Pendiente grande con una margarita blanca y borde dorado puesto en la oreja',
      gl: 'Pendente grande cunha margarida branca e bordo dourado posto na orella',
    }),
    featured: false,
  },

  {
    slug: 'colgante-ovalo-amarillo',
    name: { es: 'Colgante Óvalo Amarillo', gl: 'Colgante Óvalo Amarelo' },
    category: 'colgantes',
    price: 30,
    summary: {
      es: 'Dos flores amarillas suspendidas en el aire',
      gl: 'Dúas flores amarelas suspendidas no aire',
    },
    description: {
      es: [
        'Óvalo dorado hueco con dos flores amarillas de tallo largo sujetas por una lámina de resina finísima. Puesto a contraluz sólo se ven las flores.',
        'Cadena de 45 cm.',
      ],
      gl: [
        'Óvalo dourado baleiro con dúas flores amarelas de talo longo suxeitas por unha lámina de resina finísima. Posto a contraluz só se ven as flores.',
        'Cadea de 45 cm.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor amarilla seca', 'Montura ovalada dorada', 'Cadena fina'],
      gl: ['Resina', 'Flor amarela seca', 'Montura ovalada dourada', 'Cadea fina'],
    },
    image: imgLocalized('colgante-ovalo-amarillo', {
      es: 'Colgante de óvalo dorado con flores amarillas colgando frente a una pared clara',
      gl: 'Colgante de óvalo dourado con flores amarelas colgando fronte a unha parede clara',
    }),
    featured: false,
  },
  {
    slug: 'conjunto-violeta',
    name: { es: 'Conjunto Violeta', gl: 'Conxunto Violeta' },
    category: 'colgantes',
    price: 54,
    summary: {
      es: 'Colgante y pendientes con la misma flor lila',
      gl: 'Colgante e pendentes coa mesma flor lila',
    },
    description: {
      es: [
        'Una flor lila de cinco pétalos, entera, en las tres piezas: los dos pendientes de aro y el colgante. Fondo transparente, sin montura a la vista.',
        'Se piden juntos o por separado.',
      ],
      gl: [
        'Unha flor lila de cinco pétalos, enteira, nas tres pezas: os dous pendentes de aro e o colgante. Fondo transparente, sen montura á vista.',
        'Pídense xuntos ou por separado.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor lila seca', 'Aro y cadena de acero dorado'],
      gl: ['Resina', 'Flor lila seca', 'Aro e cadea de aceiro dourado'],
    },
    image: imgLocalized('conjunto-violeta', {
      es: 'Pendientes de aro y colgante con flores lilas sobre una rodaja de madera, en la hierba',
      gl: 'Pendentes de aro e colgante con flores lilas sobre unha rodaxe de madeira, na herba',
    }),
    featured: false,
  },
  {
    slug: 'colgante-ovalo-naranja',
    name: { es: 'Colgante Óvalo Naranja', gl: 'Colgante Óvalo Laranxa' },
    category: 'colgantes',
    price: 30,
    summary: {
      es: 'Dos florecillas naranjas, muy pequeño',
      gl: 'Dúas floriñas laranxas, moi pequeno',
    },
    description: {
      es: [
        'La montura ovalada hueca con dos flores naranjas dentro, del tamaño de una moneda pequeña. Queda justo en el hueco del cuello.',
        'Se entrega con cadena dorada de 45 cm.',
      ],
      gl: [
        'A montura ovalada baleira con dúas flores laranxas dentro, do tamaño dunha moeda pequena. Queda xusto no oco do pescozo.',
        'Entrégase con cadea dourada de 45 cm.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor naranja seca', 'Montura ovalada dorada', 'Cadena fina'],
      gl: ['Resina', 'Flor laranxa seca', 'Montura ovalada dourada', 'Cadea fina'],
    },
    image: imgLocalized('colgante-ovalo-naranja', {
      es: 'Colgante ovalado con flores naranjas puesto al cuello, con camisa blanca',
      gl: 'Colgante ovalado con flores laranxas posto ao pescozo, con camisa branca',
    }),
    featured: false,
  },
  {
    slug: 'colgante-ovalo-plata',
    name: { es: 'Colgante Óvalo Plata', gl: 'Colgante Óvalo Prata' },
    category: 'colgantes',
    price: 30,
    summary: { es: 'Pétalo morado en montura plateada', gl: 'Pétalo morado en montura prateada' },
    description: {
      es: [
        'Un pétalo morado y una hojita verde dentro de un óvalo plateado macizo, con fondo casi transparente. La versión en plata del camafeo.',
      ],
      gl: [
        'Un pétalo morado e unha folliña verde dentro dun óvalo prateado macizo, con fondo case transparente. A versión en prata do camafeo.',
      ],
    },
    materials: {
      es: ['Resina', 'Pétalo y hoja secos', 'Montura ovalada plateada'],
      gl: ['Resina', 'Pétalo e folla secos', 'Montura ovalada prateada'],
    },
    image: imgLocalized('colgante-ovalo-plata', {
      es: 'Colgante ovalado plateado con una flor morada puesto al cuello, con jersey claro',
      gl: 'Colgante ovalado prateado cunha flor morada posto ao pescozo, con xersei claro',
    }),
    featured: false,
  },
  {
    slug: 'colgantes-piedra-redonda',
    name: { es: 'Colgantes Piedra Redonda', gl: 'Colgantes Pedra Redonda' },
    category: 'colgantes',
    price: 28,
    summary: { es: 'Verde musgo, azul noche o ámbar', gl: 'Verde musgo, azul noite ou ámbar' },
    description: {
      es: [
        'Piedra redonda pequeña en montura dorada, con tres rellenos: musgo verde, pétalo azul y flor ámbar. Es el colgante más discreto que hago.',
        'Se piden de uno en uno. Dime el color.',
      ],
      gl: [
        'Pedra redonda pequena en montura dourada, con tres recheos: musgo verde, pétalo azul e flor ámbar. É o colgante máis discreto que fago.',
        'Pídense dun en un. Dime a cor.',
      ],
    },
    materials: {
      es: ['Resina', 'Musgo o flor secos', 'Montura redonda dorada'],
      gl: ['Resina', 'Musgo ou flor secos', 'Montura redonda dourada'],
    },
    image: imgLocalized('colgantes-piedra-redonda', {
      es: 'Tres colgantes redondos verde, azul y ámbar sobre una rodaja de madera con flores secas',
      gl: 'Tres colgantes redondos verde, azul e ámbar sobre unha rodaxe de madeira con flores secas',
    }),
    featured: false,
  },
  {
    slug: 'colgante-hexagono-hojas',
    name: { es: 'Colgante Hexágono Hojas', gl: 'Colgante Hexágono Follas' },
    category: 'colgantes',
    price: 30,
    summary: { es: 'Una ramita verde, nada más', gl: 'Unha ramiña verde, nada máis' },
    description: {
      es: [
        'Una ramita de cinco hojas verdes, colocada recta, dentro de un hexágono dorado con fondo blanco roto. Sin flor y sin color: sólo la hoja.',
        'De las piezas que más se regalan.',
      ],
      gl: [
        'Unha ramiña de cinco follas verdes, colocada recta, dentro dun hexágono dourado con fondo branco roto. Sen flor e sen cor: só a folla.',
        'Das pezas que máis se regalan.',
      ],
    },
    materials: {
      es: ['Resina', 'Hoja natural prensada', 'Montura hexagonal dorada'],
      gl: ['Resina', 'Folla natural prensada', 'Montura hexagonal dourada'],
    },
    image: imgLocalized('colgante-hexagono-hojas', {
      es: 'Colgante hexagonal dorado con hojas verdes colgando frente a una pared blanca',
      gl: 'Colgante hexagonal dourado con follas verdes colgando fronte a unha parede branca',
    }),
    featured: false,
  },
  {
    slug: 'conjunto-clavel',
    name: { es: 'Conjunto Clavel', gl: 'Conxunto Caravel' },
    category: 'colgantes',
    price: 66,
    summary: {
      es: 'Pendientes, anillo y colgante en granate',
      gl: 'Pendentes, anel e colgante en granate',
    },
    description: {
      es: [
        'Hecho con los pétalos de un clavel granate: pendientes de rectángulo calado, anillo de piedra ovalada y colgante de gota. Los tres del mismo rojo oscuro.',
        'Se piden juntos o por separado, entero o pieza a pieza.',
      ],
      gl: [
        'Feito cos pétalos dun caravel granate: pendentes de rectángulo calado, anel de pedra ovalada e colgante de pinga. Os tres do mesmo vermello escuro.',
        'Pídense xuntos ou por separado, enteiro ou peza a peza.',
      ],
    },
    materials: {
      es: ['Resina', 'Pétalos de clavel secos', 'Acero dorado'],
      gl: ['Resina', 'Pétalos de caravel secos', 'Aceiro dourado'],
    },
    image: imgLocalized('conjunto-clavel', {
      es: 'Pendientes, anillo y colgante granates sobre una rodaja de madera, junto a un clavel',
      gl: 'Pendentes, anel e colgante granates sobre unha rodaxe de madeira, xunto a un caravel',
    }),
    featured: true,
  },
  {
    slug: 'colgantes-hexagono-mini',
    name: { es: 'Colgantes Hexágono Mini', gl: 'Colgantes Hexágono Mini' },
    category: 'colgantes',
    price: 28,
    summary: { es: 'Seis flores, una por colgante', gl: 'Seis flores, unha por colgante' },
    description: {
      es: [
        'El hexágono dorado en su tamaño pequeño, con una sola flor centrada: hoja verde, lavanda, hortensia blanca, viola morada, margarita amarilla o pétalo crema.',
        'Se piden de uno en uno. Se pueden llevar dos o tres a la vez, con cadenas de distinta largura.',
      ],
      gl: [
        'O hexágono dourado no seu tamaño pequeno, cunha soa flor centrada: folla verde, lavanda, hortensia branca, viola morada, margarida amarela ou pétalo crema.',
        'Pídense dun en un. Pódense levar dous ou tres á vez, con cadeas de distinta lonxitude.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor seca', 'Montura hexagonal dorada', 'Cadena fina'],
      gl: ['Resina', 'Flor seca', 'Montura hexagonal dourada', 'Cadea fina'],
    },
    image: imgLocalized('colgantes-hexagono-mini', {
      es: 'Seis colgantes hexagonales dorados con flores distintas sobre una rodaja de madera',
      gl: 'Seis colgantes hexagonais dourados con flores distintas sobre unha rodaxe de madeira',
    }),
    featured: false,
  },

  {
    slug: 'anillos-finos-granate',
    name: { es: 'Anillos Finos Granate', gl: 'Aneis Finos Granate' },
    category: 'anillos',
    price: 24,
    summary: { es: 'Dos aros muy finos, para apilar', gl: 'Dous aros moi finos, para apilar' },
    description: {
      es: [
        'Aro fino de acero con una piedra pequeña de resina granate encima. Pensados para llevar dos o tres seguidos en el mismo dedo.',
        'Se piden de uno en uno. Talla ajustable.',
      ],
      gl: [
        'Aro fino de aceiro cunha pedra pequena de resina granate enriba. Pensados para levar dous ou tres seguidos no mesmo dedo.',
        'Pídense dun en un. Talla axustable.',
      ],
    },
    materials: {
      es: ['Resina', 'Pétalos secos', 'Aro de acero ajustable'],
      gl: ['Resina', 'Pétalos secos', 'Aro de aceiro axustable'],
    },
    image: imgLocalized('anillos-finos-granate', {
      es: 'Dos anillos finos con piedras granates en una mano que sostiene flores amarillas',
      gl: 'Dous aneis finos con pedras granates nunha man que sostén flores amarelas',
    }),
    featured: false,
  },
  {
    slug: 'anillos-cuadrados',
    name: { es: 'Anillos Cuadrados', gl: 'Aneis Cadrados' },
    category: 'anillos',
    price: 28,
    summary: { es: 'Piedra cuadrada en tres colores', gl: 'Pedra cadrada en tres cores' },
    description: {
      es: [
        'Piedra cuadrada de resina sobre aro fino dorado, con flores dentro. Hay ámbar, rosa y amarillo, y se llevan los tres juntos.',
        'Se piden de uno en uno. El aro es abierto, así que se adapta.',
      ],
      gl: [
        'Pedra cadrada de resina sobre aro fino dourado, con flores dentro. Hai ámbar, rosa e amarelo, e lévanse os tres xuntos.',
        'Pídense dun en un. O aro é aberto, así que se adapta.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor seca', 'Aro de acero dorado ajustable'],
      gl: ['Resina', 'Flor seca', 'Aro de aceiro dourado axustable'],
    },
    image: imgLocalized('anillos-cuadrados', {
      es: 'Tres anillos de piedra cuadrada ámbar, rosa y amarilla en una mano apoyada en el bolsillo',
      gl: 'Tres aneis de pedra cadrada ámbar, rosa e amarela nunha man apoiada no peto',
    }),
    featured: false,
  },
  {
    slug: 'anillo-ovalo-petalos',
    name: { es: 'Anillo Óvalo de Pétalos', gl: 'Anel Óvalo de Pétalos' },
    category: 'anillos',
    price: 34,
    summary: { es: 'Óvalo grande, morado y naranja', gl: 'Óvalo grande, morado e laranxa' },
    description: {
      es: [
        'La piedra más grande que hago: un óvalo ancho lleno de trozos de pétalo morado, naranja y blanco. Ocupa medio dedo.',
        'Montura ajustable. Es el anillo que se ve desde lejos.',
      ],
      gl: [
        'A pedra máis grande que fago: un óvalo ancho cheo de anacos de pétalo morado, laranxa e branco. Ocupa medio dedo.',
        'Montura axustable. É o anel que se ve desde lonxe.',
      ],
    },
    materials: {
      es: ['Resina', 'Pétalos secos', 'Montura ovalada ajustable'],
      gl: ['Resina', 'Pétalos secos', 'Montura ovalada axustable'],
    },
    image: imgLocalized('anillo-ovalo-petalos', {
      es: 'Anillo ovalado con pétalos morados y naranjas en una mano recogiéndose el pelo',
      gl: 'Anel ovalado con pétalos morados e laranxas nunha man recollendo o pelo',
    }),
    featured: false,
  },
  {
    slug: 'anillo-fino-ambar',
    name: { es: 'Anillo Fino Ámbar', gl: 'Anel Fino Ámbar' },
    category: 'anillos',
    price: 26,
    summary: { es: 'Una piedra de miel y otra morada', gl: 'Unha pedra de mel e outra morada' },
    description: {
      es: [
        'Aro fino dorado con dos piedras pequeñas seguidas, una ámbar y otra morada. Se lleva solo o con otro aro liso al lado.',
        'Talla ajustable.',
      ],
      gl: [
        'Aro fino dourado con dúas pedras pequenas seguidas, unha ámbar e outra morada. Lévase só ou con outro aro liso ao lado.',
        'Talla axustable.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor seca', 'Aro de acero dorado ajustable'],
      gl: ['Resina', 'Flor seca', 'Aro de aceiro dourado axustable'],
    },
    image: imgLocalized('anillo-fino-ambar', {
      es: 'Anillo fino con piedras ámbar y morada en la mano de una mujer, de perfil, en el bosque',
      gl: 'Anel fino con pedras ámbar e morada na man dunha muller, de perfil, no bosque',
    }),
    featured: false,
  },

  {
    slug: 'bordado-abrazo',
    name: { es: 'Bordado Abrazo', gl: 'Bordado Abrazo' },
    category: 'bordados',
    price: 52,
    summary: { es: 'Una madre y su hija, de una línea', gl: 'Unha nai e a súa filla, dunha liña' },
    description: {
      es: [
        'Dos figuras abrazadas bordadas a línea continua, con flores sueltas de colores repartidas por la ropa y el pelo, y una luna arriba. La pieza más pedida para regalar en un nacimiento.',
        'Bastidor de 20 cm. Se puede bordar a partir de una foto vuestra.',
      ],
      gl: [
        'Dúas figuras abrazadas bordadas a liña continua, con flores soltas de cores repartidas pola roupa e o pelo, e unha lúa arriba. A peza máis pedida para regalar nun nacemento.',
        'Bastidor de 20 cm. Pódese bordar a partir dunha foto vosa.',
      ],
    },
    materials: {
      es: ['Lino', 'Hilo de algodón', 'Bastidor de madera de 20 cm'],
      gl: ['Liño', 'Fío de algodón', 'Bastidor de madeira de 20 cm'],
    },
    image: imgLocalized('bordado-abrazo', {
      es: 'Bastidor con dos figuras abrazadas bordadas a línea, con florecillas de colores',
      gl: 'Bastidor con dúas figuras abrazadas bordadas a liña, con floriñas de cores',
    }),
    featured: false,
  },
  {
    slug: 'bordado-con-un-par',
    name: { es: 'Bordado Con un Par', gl: 'Bordado Con un Par' },
    category: 'bordados',
    price: 46,
    summary: { es: 'Un útero en rojo y dos ramas', gl: 'Un útero en vermello e dúas ramas' },
    description: {
      es: [
        'Un útero bordado a línea en rojo, con dos ramitas de hoja verde y flores azules debajo, y la frase «con un par» encima.',
        'Bastidor de 20 cm. Admite otra frase, si prefieres.',
      ],
      gl: [
        'Un útero bordado a liña en vermello, con dúas ramiñas de folla verde e flores azuis debaixo, e a frase «con un par» enriba.',
        'Bastidor de 20 cm. Admite outra frase, se o prefires.',
      ],
    },
    materials: {
      es: ['Lino', 'Hilo de algodón', 'Bastidor de madera de 20 cm'],
      gl: ['Liño', 'Fío de algodón', 'Bastidor de madeira de 20 cm'],
    },
    image: imgLocalized('bordado-con-un-par', {
      es: 'Bastidor colgado en la pared con un útero bordado en rojo y la frase «con un par»',
      gl: 'Bastidor colgado na parede cun útero bordado en vermello e a frase «con un par»',
    }),
    featured: false,
  },

  // Fotos de proceso y de envoltorio. No son piezas: no pasan por el carrito y
  // llevan a hablar conmigo, igual que los encargos.

  {
    slug: 'taller-flores-prensadas',
    name: { es: 'Flores Prensadas', gl: 'Flores Prensadas' },
    category: 'taller',
    price: null,
    summary: { es: 'El material, antes de la resina', gl: 'O material, antes da resina' },
    description: {
      es: [
        'Margaritas y caléndulas después de dos semanas de prensa. Al secarse pierden el color vivo y se quedan en marrones y ocres: esa gama es la que acaba dentro de las piezas de otoño.',
        'Si quieres que seque flores tuyas, escríbeme antes de que se pasen: cuanto más frescas lleguen a la prensa, mejor aguanta el color.',
      ],
      gl: [
        'Margaridas e caléndulas despois de dúas semanas de prensa. Ao secarse perden a cor viva e quedan en marróns e ocres: esa gama é a que acaba dentro das pezas de outono.',
        'Se queres que seque flores túas, escríbeme antes de que se pasen: canto máis frescas cheguen á prensa, mellor aguanta a cor.',
      ],
    },
    materials: {
      es: ['Margarita', 'Caléndula', 'Prensa de madera'],
      gl: ['Margarida', 'Caléndula', 'Prensa de madeira'],
    },
    image: imgLocalized('taller-flores-prensadas', {
      es: 'Margaritas y caléndulas secas prensadas, repartidas sobre papel blanco',
      gl: 'Margaridas e caléndulas secas prensadas, repartidas sobre papel branco',
    }),
    featured: false,
  },
  {
    slug: 'taller-buganvilla-libro',
    name: { es: 'Buganvillas en un Libro', gl: 'Buganvillas nun Libro' },
    category: 'taller',
    price: null,
    summary: { es: 'Prensadas entre páginas, sin prisa', gl: 'Prensadas entre páxinas, sen presa' },
    description: {
      es: [
        'Brácteas de buganvilla secándose entre las hojas de un libro. Es el método de siempre y sigue siendo el mejor para las flores finas: el papel absorbe la humedad sin aplastar el color.',
        'Tres semanas, y el naranja se queda casi como estaba.',
      ],
      gl: [
        'Brácteas de buganvilla secándose entre as follas dun libro. É o método de sempre e segue sendo o mellor para as flores finas: o papel absorbe a humidade sen esmagar a cor.',
        'Tres semanas, e o laranxa queda case como estaba.',
      ],
    },
    materials: {
      es: ['Buganvilla', 'Un libro cualquiera', 'Paciencia'],
      gl: ['Buganvilla', 'Un libro calquera', 'Paciencia'],
    },
    image: imgLocalized('taller-buganvilla-libro', {
      es: 'Brácteas de buganvilla naranja secándose entre las páginas abiertas de un libro',
      gl: 'Brácteas de buganvilla laranxa secándose entre as páxinas abertas dun libro',
    }),
    featured: false,
  },
  {
    slug: 'taller-montaje',
    name: { es: 'El Montaje', gl: 'A Montaxe' },
    category: 'taller',
    price: null,
    summary: { es: 'Cada pieza, a su tarjeta', gl: 'Cada peza, á súa tarxeta' },
    description: {
      es: [
        'Las tarjetas se cortan e imprimen aquí, y cada pieza se monta a mano en la suya antes de guardarla. Es el último paso y el que más se nota al abrir el paquete.',
      ],
      gl: [
        'As tarxetas córtanse e imprímense aquí, e cada peza móntase a man na súa antes de gardala. É o último paso e o que máis se nota ao abrir o paquete.',
      ],
    },
    materials: { es: ['Cartulina', 'Tinta', 'Un rato'], gl: ['Cartolina', 'Tinta', 'Un rato'] },
    image: imgLocalized('taller-montaje', {
      es: 'Dos manos montando unos pendientes en una tarjeta con el logo',
      gl: 'Dúas mans montando uns pendentes nunha tarxeta co logo',
    }),
    featured: false,
  },
  {
    slug: 'taller-tarjetas',
    name: { es: 'Listo para Regalar', gl: 'Listo para Regalar' },
    category: 'taller',
    price: null,
    summary: { es: 'Cuatro piezas en su tarjeta', gl: 'Catro pezas na súa tarxeta' },
    description: {
      es: [
        'Así sale cada pieza del taller: en su tarjeta, con el nombre y el cuidado detrás. Puesto así ya se puede regalar sin envolver nada más.',
        'Si es un regalo, dímelo al encargar y le añado una nota escrita a mano.',
      ],
      gl: [
        'Así sae cada peza do taller: na súa tarxeta, co nome e o coidado detrás. Posto así xa se pode regalar sen envolver nada máis.',
        'Se é un agasallo, dimo ao encargar e engádolle unha nota escrita a man.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor seca', 'Tarjeta impresa'],
      gl: ['Resina', 'Flor seca', 'Tarxeta impresa'],
    },
    image: imgLocalized('taller-tarjetas', {
      es: 'Cuatro tarjetas con pendientes y colgantes de resina sobre un plato de madera',
      gl: 'Catro tarxetas con pendentes e colgantes de resina sobre un prato de madeira',
    }),
    featured: false,
  },
  {
    slug: 'taller-caja-regalo',
    name: { es: 'La Caja', gl: 'A Caixa' },
    category: 'taller',
    price: null,
    summary: { es: 'Cómo llega el pedido a casa', gl: 'Como chega o pedido á casa' },
    description: {
      es: [
        'Caja de cartón sin plástico, virutas de papel, una ramita seca y una lámina botánica dentro. Los pedidos de más de una pieza van todos así.',
        'El envoltorio va incluido. No hay que pedirlo aparte.',
      ],
      gl: [
        'Caixa de cartón sen plástico, labras de papel, unha ramiña seca e unha lámina botánica dentro. Os pedidos de máis dunha peza van todos así.',
        'O envoltorio vai incluído. Non hai que pedilo aparte.',
      ],
    },
    materials: {
      es: ['Cartón', 'Papel', 'Lámina botánica'],
      gl: ['Cartón', 'Papel', 'Lámina botánica'],
    },
    image: imgLocalized('taller-caja-regalo', {
      es: 'Caja de envío abierta con un colgante, un anillo y una lámina botánica dentro',
      gl: 'Caixa de envío aberta cun colgante, un anel e unha lámina botánica dentro',
    }),
    featured: false,
  },
  {
    slug: 'taller-envio-ambar',
    name: { es: 'Un Pedido de Ámbar', gl: 'Un Pedido de Ámbar' },
    category: 'taller',
    price: null,
    summary: {
      es: 'Pendientes y colgante, listos para salir',
      gl: 'Pendentes e colgante, listos para saír',
    },
    description: {
      es: [
        'Un pedido a medio cerrar: pendientes y colgante a juego en tonos ámbar, cada uno en su tarjeta, con un sello antiguo de regalo.',
        'Los sellos los voy guardando y meto uno distinto en cada caja.',
      ],
      gl: [
        'Un pedido a medio pechar: pendentes e colgante a xogo en tons ámbar, cada un na súa tarxeta, cun selo antigo de agasallo.',
        'Os selos vounos gardando e meto un distinto en cada caixa.',
      ],
    },
    materials: {
      es: ['Resina', 'Flor seca', 'Cartón y papel'],
      gl: ['Resina', 'Flor seca', 'Cartón e papel'],
    },
    image: imgLocalized('taller-envio-ambar', {
      es: 'Caja de envío con pendientes y un colgante ámbar en sus tarjetas, junto a un sello antiguo',
      gl: 'Caixa de envío con pendentes e un colgante ámbar nas súas tarxetas, xunto a un selo antigo',
    }),
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
