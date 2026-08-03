# Bonsái Artesanía

Tienda de joyería artesanal en resina y flor natural (Instagram [@san.bonsai\_](https://www.instagram.com/san.bonsai_/)).

**Stack** — Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · TypeScript estricto · Vercel.
Mismo esqueleto que `sangilstudio`, sin CMS: el contenido vive en `content/`.

```bash
npm install
npm run dev      # http://localhost:3000
npm run check    # typecheck + lint + formato
npm run build
```

## Dónde se toca cada cosa

| Quiero cambiar…                      | Fichero                      |
| ------------------------------------ | ---------------------------- |
| Nombres y textos de las joyas        | `content/products.ts`        |
| Correo, WhatsApp, Instagram, dominio | `content/site.ts`            |
| Colores, tipos, ritmo, animaciones   | `app/globals.css` (`@theme`) |
| Menú                                 | `lib/navigation.ts`          |

## Sistema de diseño

Todos los tokens están en el `@theme` de `app/globals.css` y **sólo** ahí: las utilidades de
Tailwind se generan a partir de ellos, así que no existe forma de usar un color o un espaciado
fuera del sistema. Lino, corteza, salvia y pétalo; una serif (Cormorant Garamond) para las voces
y una geométrica ligera (Jost) para lo funcional. Las apariciones al hacer scroll son CSS puro
(`animation-timeline: view()`), sin JavaScript, y respetan `prefers-reduced-motion`.

## Fotos · `npm run images`

Los originales viven en `fotos-originales/` (gitignorada), una foto por pieza, y **el nombre del
fichero es la clave**: `colgante-lavanda.jpg` se referencia en el catálogo como
`img('colgante-lavanda', 'texto alternativo')`. Una clave que no exista es un error de
TypeScript, no una imagen rota en producción.

```bash
npm run images           # sólo lo que ha cambiado
npm run images -- --force
```

El script genera `public/media/<clave>.webp` (máx. 1600 px, calidad 82) y
`content/media-manifest.json` con ancho, alto y un placeholder difuminado en base64 — de ahí sale
el CLS 0 y el degradado que se ve mientras carga. Un único derivado: las variantes responsive las
genera `next/image`.

Las fotos actuales están tomadas del Instagram de Ana (1080 px de ancho). Cuando haya originales
de cámara, se sustituyen en `fotos-originales/` con el mismo nombre y se vuelve a lanzar el
script. La proporción de la rejilla es 4:5 vertical.

Si una pieza aún no tiene foto, `image: null` dibuja un marcador degradado en su lugar.

## Pendiente de esta beta

- Revisar con Ana los nombres y los textos de las piezas: son una propuesta.
- Los encargos se organizan por WhatsApp o correo, con el mensaje ya escrito
  (`lib/contact.ts`). Lo que sale de la web es una petición, y nada más.
