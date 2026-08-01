# Funda de la caja de regalo

Papel para forrar la caja en la que van las piezas al regalarlas. Se imprime en
casa en A4 a color, se recorta y se dobla; no hay que pegar nada por fuera.

Son **tres folios**:

| Folio | Pieza                                | Qué lleva                                            |
| ----- | ------------------------------------ | ---------------------------------------------------- |
| 1     | La **tapa**, de 135 × 90 × 22 mm     | El mismo anverso que la tarjeta, centrado en la cara |
| 2     | El **fondo** de la base y 2 costados | Color plano                                          |
| 3     | Los otros 2 **costados** de la base  | Color plano                                          |

La tapa va en lino claro `#faf7f2` y la base en lino profundo `#f1ebe1`: los dos
tonos de la familia, no dos intentos del mismo color. Dos tonos vecinos perdonan
la diferencia de un folio a otro; dos intentos de clavar el mismo tono, no.

En la base no hay logotipo a propósito. Lo que se le pide es continuidad, no
protagonismo: repetir la marca en una superficie que nadie mira de frente sólo
consigue que se vea tres veces en la misma caja.

## Qué imprimir

| Archivo                          | Qué es                                                         |
| -------------------------------- | -------------------------------------------------------------- |
| `salida/caja-tapa.pdf`           | **Folio 1.** Con guías de corte y de doblez                    |
| `salida/caja-base-fondo.pdf`     | **Folio 2.** El fondo y los dos costados largos                |
| `salida/caja-base-costados.pdf`  | **Folio 3.** Los otros dos costados, sueltos                   |
| `salida/caja-tapa-sin-guias.pdf` | La tapa sin guías, para cuando ya se sepa cortar con plantilla |
| `salida/*.png`                   | Lo mismo en PNG a 400 ppp, por si hay que mandarlo a imprenta  |
| `salida/*.svg`                   | Los vectoriales de los que sale todo                           |

**Imprimir los PDF, no los PNG, y en «Tamaño real» (100 %) — nunca «Ajustar a la
página».** No es una manía: si la hoja sale al 97 %, los costados de la tapa
miden 25,2 mm en vez de 26 y no llegan a envolver el reborde. El PDF lleva la
página en A4 apaisada real, así que cualquier lector con «Tamaño real» la saca a
escala 1:1; el visor de imágenes de Windows, en cambio, escala un PNG a lo que le
parece. Cada folio trae un rótulo de control arriba a la derecha con lo que **tiene
que medir ese lado con una regla** sobre la hoja ya impresa: 219 mm el folio 1,
251 el 2 y 206 el 3.

Papel: cualquiera de 120–160 g satinado o mate va bien. Más gordo de 200 g no
dobla limpio y hace bulto en las esquinas. Aviso sobre la base: son dos folios
casi enteros de color plano claro, y muchas impresoras de inyección hacen bandas
en superficies así — merece la pena tirar una prueba antes de gastar el papel
bueno.

## La holgura de pliegue

Las medidas de la caja —135 × 90 × 22 la tapa, 85 × 82 × 63 la base— son **lo que
tiene que quedar visible** una vez envuelta, no lo que mide el papel. El papel es
más grande por todos lados, y de cuánto se encarga la constante `HOLGURA` (4 mm),
que se le suma **a cada panel y por cada lado**.

Hace falta porque un pliegue no es una arista de radio cero. El papel que baja por
el costado tiene que dar antes la vuelta al canto del cartón —un par de milímetros
de grosor— y luego doblar otra vez por el borde de abajo para meterse dentro; cada
una de esas dos curvas se come papel. Y un panel a la medida exacta obliga además a
colocar la caja al milímetro: a mano se descentra, y descentrado queda **menos** de
135 × 90 cubierto y el cartón asomando por una arista.

Así que en el papel:

|                    | La caja mide | El papel mide |
| ------------------ | ------------ | ------------- |
| Cara de la tapa    | 135 × 90     | **143 × 98**  |
| Costado de la tapa | 22           | **26**        |
| Fondo de la base   | 85 × 82      | **93 × 90**   |
| Pared de la base   | 63           | **67**        |

Los milímetros de sobra dan la vuelta a las aristas y bajan un poco por el costado,
que es exactamente lo que las tapa. Consecuencia al montar: **las rayas de doblez
no coinciden con las aristas de la caja** —caen 4 mm por fuera, a propósito—, así
que la caja se centra a ojo sobre el panel y no se alinea con las rayas.

Si con este cartón todavía quedara justo, se sube `HOLGURA` en `geometry.mjs` y las
tres hojas se recolocan solas.

## Cómo se monta

### Folio 1 · la tapa

El desarrollo es una sola pieza en forma de cruz:

```
        ┌─────────────┐                  ← pestaña
     ┌──┼─────────────┼──┐               ← costado + orejas
  ┌──┼──┼─────────────┼──┼──┐
  │  │  │  CARA       │  │  │
  │  │  │  SUPERIOR   │  │  │
  └──┼──┼─────────────┼──┼──┘
     └──┼─────────────┼──┘
        └─────────────┘
```

1. Recortar por la **raya larga** (el contorno exterior). Por fuera de esa línea
   hay 2 mm de color de sobra a propósito: es la sangre, la que perdona un corte
   torcido para que no aparezca una raya blanca en el canto.
2. Marcar y doblar todas las **rayas cortas**. Salen mejor pasando el canto de una
   regla o una plegadera por encima antes de doblar.
3. Poner la tapa boca abajo **centrada a ojo en el panel del medio**, sin
   alinearla con las rayas de doblez: caen 4 mm por fuera de las aristas a
   propósito, y esos 4 mm son los que dan la vuelta al canto. Subir los cuatro
   costados.
4. Las **orejas** —los cuadrados de las esquinas, que cuelgan de los costados
   izquierdo y derecho— doblan alrededor de la esquina y se pegan **por detrás**
   del costado de arriba o de abajo. Son lo que tapa la esquina; sin ellas quedan
   cuatro cortes abiertos justo en lo primero que se mira.
5. Las cuatro **pestañas de 12 mm** se meten por dentro del borde de la tapa y se
   pegan ahí. Si con el papel dentro la tapa entra a presión sobre la base,
   recortarlas más cortas: no cambia nada más del diseño.

### Folios 2 y 3 · la base

La base va en dos hojas porque de una sola pieza mediría 255 × 246 mm y en una A4
no cabe ni apaisada. Se parte por dos de las cuatro aristas verticales, que es
donde una funda lleva costura de todas formas.

```
  FOLIO 2 · el fondo y los dos costados largos

       ┌────┬───────────┬────┐
    ┌──┤    │           │    ├──┐       ← pestañas ↕ y orejas
    │  │ C  │   FONDO   │ C  │  │
    └──┤    │           │    ├──┘
       └────┴───────────┴────┘

  FOLIO 3 · los otros dos costados, sueltos

       ┌───────┐   ┌───────┐
       │   C   │   │   C   │
       └───────┘   └───────┘
```

1. **Folio 2 primero.** Poner la base boca abajo centrada a ojo en el panel del
   fondo —otra vez, no por las rayas—, subir las dos paredes y doblar sus cuatro
   **orejas** alrededor de las aristas verticales, pegándolas sobre las otras dos
   caras. Luego las dos pestañas por dentro del borde de arriba.
2. **Folio 3 después, encima.** Los dos costados sueltos se pegan sobre las caras
   que quedan, **tapando las orejas del folio 2**. El orden importa: al ir
   tapadas, si un costado se corta un pelo estrecho lo que asoma por la rendija es
   la oreja, del mismo color, y no el cartón. Al contrario se vería el solape.
3. Cada costado del folio 3 mide 93 × 87 y lleva cuatro rayas: los **4 mm de cada
   lado** doblan alrededor de la arista vertical y caen sobre la cara de al lado,
   los **12 de arriba** van por dentro del borde y los **8 de abajo**, bajo el
   fondo. Lo que queda en el medio son los 85 × 63 de la cara.

## Cómo se regenera

```sh
node disenos/caja/build-box.mjs    # la tapa   → SVG en salida/
node disenos/caja/build-base.mjs   # la base   → SVG en salida/
node disenos/caja/rasterizar.mjs   # servidor en localhost:3201
# abrir http://localhost:3201 y ejecutar rasterizar() en la consola → PNG y PDF
node disenos/caja/verify.mjs       # mide los archivos y comprueba que la escala cuadra
```

El rasterizador no lleva escrita la lista de hojas: coge **todo SVG que haya en
`salida/`**. Así añadir una pieza es escribir su generador y nada más, y no hay una
lista que se quede vieja en silencio dejando un folio sin regenerar.

El paso del navegador es el mismo que en las tarjetas y por el mismo motivo: el
SVG lleva las woff2 del sitio incrustadas y hace falta un motor que sepa aplicar
`@font-face` al dibujar un SVG en un canvas. Con eso las letras salen con las
tipografías reales de la web.

**`verify.mjs` no es opcional.** Lo que se puede estropear aquí sin que se note no
es el diseño —eso se ve— sino la escala, y una funda un 3 % pequeña se ve perfecta
en pantalla y perfecta impresa: sólo se descubre al intentar envolver la caja con
ella. Así que el verificador no mide los números del SVG, que son los que
escribimos nosotros: mide los píxeles del PNG y los bytes del PDF, que es lo que la
impresora va a leer. Mide también por el centro del fondo, donde no debería haber
papel, para comprobar que los recortes de esquina están de verdad recortados.

## Los archivos

- **`geometry-hoja.mjs`** — lo que comparten todas las piezas: la A4 apaisada, los
  400 ppp y los 2 mm de sangre.
- **`geometry.mjs`** — la tapa: sus tres medidas, la holgura de pliegue y el
  desarrollo deducido de ellas.
- **`geometry-base.mjs`** — la base: igual, y el reparto en dos hojas.
- **`build-box.mjs`** — dibuja la tapa. El anverso **no** se dibuja aquí: se pide a
  `../comun/marca.mjs`, que es el mismo código que usa la cara A de la tarjeta.
- **`build-base.mjs`** — dibuja las dos hojas de la base.
- **`rasterizar.mjs`** — el servidor de un uso, y de paso el que escribe los PDF.
- **`verify.mjs`** — el que mide.

## Si cambia algo

- **Otra caja** → `LID_L`/`LID_W`/`LID_D` en `geometry.mjs`, `BASE_W`/`BASE_D`/
  `BASE_H` en `geometry-base.mjs`. Ojo: los desarrollos crecen con la caja y en
  algún punto dejan de caber en una A4 apaisada; entonces hay que subir
  `PAGE_W`/`PAGE_H` a A3 o partir la pieza en más trozos.
- **Cartón más gordo, o el papel se queda corto al doblar** → `HOLGURA` en
  `geometry.mjs`, que gobierna la tapa y la base a la vez.
- **La marca, el logotipo, los colores o el texto del anverso** → `marca.mjs`, y
  entonces cambian la caja y la tarjeta a la vez, que es de lo que se trata.
- **Cuánto ocupa el diseño en la tapa** → `SCALE` en `build-box.mjs`.
