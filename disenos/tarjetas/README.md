# Tarjetas con QR

Tarjeta de 85×55 mm para imprimir (probada contra Vistaprint), con el logotipo
por delante y un QR a la web por detrás. Los archivos listos para subir están en
`salida/`; el resto de la carpeta existe para poder **volver a generarlos** en
lugar de depender de dos PNG que nadie sabe de dónde salieron.

## Qué subir a la imprenta

| Archivo                               | Qué es                                                                            |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| `salida/tarjeta-cara-a.png`           | Cara con el logotipo                                                              |
| `salida/tarjeta-cara-b.png`           | Cara con el QR                                                                    |
| `salida/tarjeta-previsualizacion.png` | Las dos caras con las guías de corte y de seguridad marcadas. **Sólo para mirar** |

Los dos PNG miden 2079×1370 px = **88×58 mm a 600 ppp**: 85×55 de corte más
1,5 mm de sangre por lado, que es exactamente el lienzo de Vistaprint. Entran
1:1, sin escalar. Nada legible se acerca a menos de 7 mm del corte.

Los archivos **llevan la resolución sellada dentro** (bloque `pHYs` a 600 ppp).
No es un detalle: un PNG salido de un canvas no lo lleva, y sin él Vistaprint no
sabe que 2079 px son 88 mm — colocaba la imagen a un tamaño inventado, más
pequeña que el lienzo y sin cubrir la sangre. Si algún día se cambia la forma de
generar los PNG, hay que conservar ese sellado.

Para otra imprenta que pida 3 mm de sangre, se cambia `BLEED` en `geometry.mjs`
y se regenera: el diseño se recoloca solo.

Van en RGB y la imprenta convierte a CMYK. Lo que más puede apagarse es el
salvia del filete y el rosa del destello; el resto es casi neutro.

## Cómo se regenera

```sh
node disenos/tarjetas/build-card.mjs   # escribe los dos SVG en salida/
node disenos/tarjetas/rasterizar.mjs   # servidor en localhost:3200
# abrir http://localhost:3200 y ejecutar rasterizar() en la consola
node disenos/tarjetas/verify-qr.mjs    # comprueba el QR del PNG resultante
```

El paso del navegador no es capricho: los SVG llevan las woff2 incrustadas y
hace falta un motor que aplique `@font-face` al dibujar un SVG en un canvas. Con
eso las letras salen con las tipografías reales del sitio y no hay sustitución
de fuentes en la imprenta.

## Los archivos

- **`geometry.mjs`** — todas las medidas, en un solo sitio. El generador y el
  verificador leen de aquí, así que si el QR se mueve, la comprobación se mueve
  con él.
- **`build-card.mjs`** — dibuja las dos caras en milímetros reales: el anverso a
  1:1 y la cara del QR, que es lo único propio de la tarjeta.
- **`../comun/marca.mjs`** — la marca sobre papel: colores, tipografías, el
  logotipo y el anverso entero. Está fuera de esta carpeta porque también lo usa
  la funda de la caja de regalo (`../caja/`), y las dos cosas tienen que llevar
  exactamente el mismo anverso: si cada generador dibujara su propio bonsái
  acabaría habiendo dos parecidos pero distintos, que es el fallo que no se ve
  hasta que están los dos impresos encima de la mesa. Los colores y las
  tipografías salen del sistema del sitio (`app/globals.css`, `app/layout.tsx`),
  el arco del logotipo son los mismos trazados de `Wordmark.tsx`, y los logos de
  Instagram y Gmail se leen de `public/icons/` — los mismos archivos que usa la
  web. Ahí están también el dominio, el usuario de Instagram y el correo, como
  constantes al principio.
- **`qr.mjs`** — generador de QR sin dependencias: versión 4, corrección H
  (30%). Se codifica aquí y no con un servicio online porque los generadores
  "gratis" devuelven QR _dinámicos_ que pasan por su dominio y mueren cuando
  dejas de pagarles. Este lleva la URL literal y no caduca.
- **`verify-qr.mjs`** — lector escrito al revés del generador. Abre el PNG ya
  rasterizado, muestrea el centro de cada módulo y desanda el camino completo:
  información de formato, máscara, lectura en zigzag, desintercalado y síndromes
  de Reed-Solomon. Encontró dos fallos que a ojo no se ven —la información de
  formato transpuesta y la columna 0 sin escribir— y por eso sigue aquí: es lo
  que hay que ejecutar antes de mandar nada a imprimir.
- **`../comun/fuentes/`** — copia del subconjunto latino de Cormorant Garamond y
  Jost. Están ahí y no se leen de `.next/static/media` porque allí el nombre
  lleva un hash de compilación que cambia en cada build.

## Si cambia algo

- **El dominio, el Instagram y el correo** se cambian en `build-card.mjs`
  (`URL`, `INSTAGRAM`, `EMAIL`). Van duplicados a propósito respecto a
  `content/site.ts` —el papel no importa el módulo de la web—, así que al tocar
  uno hay que tocar el otro: los dos deben decir `bonsai@bonsaiartesania.com`.
- **El tamaño o la posición del QR**, en `geometry.mjs`. Cada módulo no debería
  bajar de 0.4 mm; `verify-qr.mjs` lo comprueba.
- **Las tipografías de la web**: reemplazar los dos archivos de
  `../comun/fuentes/`.
