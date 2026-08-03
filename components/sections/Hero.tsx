import { ReelBackdrop } from '@/components/ui/ReelBackdrop'
import { reels } from '@/content/reel'
import { site } from '@/content/site'
import { imgSrc } from '@/lib/media'

/**
 * Portada: **el taller a pantalla completa, y una frase encima.**
 *
 * Antes esto era aire, un titular y el arco del logotipo con una pieza dentro, y el
 * propio comentario decía que aquí no había «una foto a sangre con texto encima»
 * porque eso pedía una imagen espectacular que no existía. Lo que ha llegado no es una
 * foto: son los dos vídeos del taller, y ocupan la primera pantalla entera. Es lo que
 * distingue una web de artesana de un cartel: se mueve, y lo que se mueve son sus
 * manos.
 *
 * `100svh` y no `100vh`: en móvil, `vh` cuenta la barra del navegador como si no
 * existiera y la primera pantalla queda cortada por abajo, justo donde está el texto.
 *
 * **En escritorio se ven los dos vídeos a la vez, uno al lado del otro.** Un clip
 * vertical de 720 px de ancho estirado a una pantalla de portátil hay que ampliarlo casi
 * tres veces y recortarle arriba y abajo: se veía blando y descuadrado, mientras que en
 * móvil —donde el hueco es casi el 9:16 del clip— se veía bien. Dos huecos verticales
 * llenan una pantalla ancha sin pedirle a ninguno lo que no tiene. El reparto vive en
 * `ReelBackdrop`, que es también quien explica por qué en móvil sigue habiendo uno solo.
 *
 * **El texto va abajo y no en el centro.** Arriba está la cabecera flotando, y el
 * centro es donde el vídeo tiene lo que hay que ver —las manos, la prensa—. Pegado al
 * borde inferior, el titular no tapa nada y el degradado que le da contraste cae donde
 * la imagen ya es más oscura.
 *
 * **`data-hero` no es decorativo.** `globals.css` lo busca con `:has()` para volver
 * lino el texto de la cabecera mientras no se ha hecho scroll: sin él, el menú sale en
 * tinta sobre el vídeo y no se lee. Ese CSS llevaba escrito desde antes, esperando un
 * hero a sangre; éste es el primero que lo usa. Tiene que seguir siendo **el primer
 * hijo de `main`** o el selector deja de encajar.
 *
 * El `bg-bark` de debajo no se ve nunca con el vídeo puesto, y está para el instante
 * anterior a que cargue el póster: sin él ese instante es lino, y el texto es lino.
 */
export function Hero() {
  const first = reels[0]

  return (
    <section
      data-hero
      /* `-mt-20 md:-mt-24` recupera exactamente lo que la cabecera ocupa de flujo
         (`h-20`, `md:h-24` en `Header.tsx`). La barra es `sticky` y transparente,
         pero sigue empujando: sin esto el vídeo empezaba 96 px más abajo y esa
         franja quedaba en lino con el logotipo —ya en lino por `data-hero`— encima,
         o sea invisible. Si cambia el alto de la barra, cambia aquí. */
      className="relative isolate -mt-20 flex min-h-[100svh] flex-col justify-end overflow-hidden bg-bark md:-mt-24"
    >
      {first && (
        <ReelBackdrop
          clips={reels.map((clip) => ({ file: clip.file }))}
          poster={first.poster ? imgSrc(first.poster) : undefined}
        />
      )}

      {/* El velo, anclado en `rem` y no en porcentajes del alto: los topes en `rem`
          sobreviven a cualquier pantalla, y lo que primero se vuelve ilegible sobre una
          imagen en movimiento no es el titular —que ocupa media pantalla y aguanta
          cualquier cosa detrás— sino el sobretítulo y el párrafo. Quien toque este
          degradado tiene que volver a mirar esos dos.

          **Y una tercera cosa: la marca de la cabecera.** Va en lino por `data-hero`, y
          el segundo clip tiene un cartón blanco que sube hasta arriba y la deja casi
          invisible. De ahí que el degradado no se aclare del todo al llegar al techo
          —vuelve a 0.45— en vez de acabar en el 0.2 de un velo normal. El punto más
          claro es el centro, que es donde el vídeo tiene lo que hay que ver y no hay
          texto encima. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(44_40_35/0.94)_0,rgb(44_40_35/0.8)_14rem,rgb(44_40_35/0.32)_26rem,rgb(44_40_35/0.45)_100%)]"
      />

      {/* `animate-bloom` como antes: la portada se asienta, no aparece de golpe. */}
      <div className="page-gutter animate-bloom relative pt-32 pb-20 md:pb-28">
        <p className="eyebrow text-linen/75">Hecho a mano en {site.location}</p>
        <h1 className="mt-7 font-serif text-display text-linen">
          Flores que
          <br />
          no se marchitan
        </h1>
        <p className="mt-8 max-w-md text-linen/85">{site.intro}</p>
      </div>
    </section>
  )
}
