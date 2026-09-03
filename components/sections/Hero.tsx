import { ReelBackdrop } from '@/components/ui/ReelBackdrop'
import { reels } from '@/content/reel'
import { site } from '@/content/site'
import { translator, type Locale } from '@/lib/i18n/config'
import { imgSrc, reelSrc } from '@/lib/media'
import { reelsDePortada } from '@/lib/portada'

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
 * **En móvil el vídeo lo pone Ana.** Los que suba desde `/gestion/portada` se encadenan
 * aquí, en el orden en que ella los deje, y sustituyen a los del taller —sólo en móvil:
 * el díptico de escritorio no se toca, porque está pensado para esos dos clips y para
 * dos exactamente—. Si no hay ninguno, en móvil vuelven los del taller y esta pantalla
 * es exactamente la que era. Ver `lib/portada.ts`.
 *
 * Que esto lea de la base convierte la portada en una página con consulta, y por eso la
 * lectura va cacheada bajo su etiqueta: se invalida cuando Ana toca algo y no en cada
 * visita.
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
 *
 * Los vídeos y el póster no llevan idioma: no hay texto dentro. El `alt` tampoco,
 * porque el fondo es decorativo y `ReelBackdrop` lo marca `aria-hidden` — lo que se
 * lee de esta pantalla es el titular, y ése sí está en los dos.
 */
export async function Hero({ locale }: { locale: Locale }) {
  const t = translator(locale)

  const taller = reels.map((clip) => ({
    src: reelSrc(clip.file),
    poster: clip.poster ? imgSrc(clip.poster) : null,
  }))

  const deAna = (await reelsDePortada()).map((reel) => ({ src: reel.src, poster: reel.poster }))

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
      {(taller.length > 0 || deAna.length > 0) && (
        <ReelBackdrop escritorio={taller} movil={deAna} />
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

      {/* `animate-bloom` como antes: la portada se asienta, no aparece de golpe.

          El aire de abajo es corto —y no las cinco o siete rem de antes— para que el
          «Catálogo» quede pegado al canto de la primera pantalla. Ahí es donde tiene
          sentido: es el pie de esta pantalla y la puerta de la siguiente, y bajarlo
          hasta el borde hace que un solo gesto deje el catálogo cuadrado debajo de la
          cabecera. Ver el `pt` de `DestacadasSection`, que es la otra mitad de esto. */}
      <div className="page-gutter animate-bloom relative pt-32 pb-8 md:pb-10">
        <p className="eyebrow text-linen/75">
          {t({ es: 'Hecho a mano en', gl: 'Feito a man en' })} {site.location}
        </p>
        {/* El salto de línea va a mano y no al azar del ancho: el titular es una frase
            de dos tiempos y se lee mejor partida donde la partiría quien la dice en voz
            alta. En galego el corte cae en el mismo sitio, después del sujeto. */}
        <h1 className="mt-7 font-serif text-display text-linen">
          {t({
            es: (
              <>
                Flores que
                <br />
                no se marchitan
              </>
            ),
            gl: (
              <>
                Flores que
                <br />
                non murchan
              </>
            ),
          })}
        </h1>
        <p className="mt-8 max-w-md text-linen/85">{t(site.intro)}</p>

        <div className="mt-14 flex justify-center md:mt-16">
          <a
            href="#catalogo"
            className="tap flex flex-col items-center gap-2 text-linen/75 transition-colors duration-700 hover:text-linen"
          >
            <span className="eyebrow">{t({ es: 'Catálogo', gl: 'Catálogo' })}</span>
            <ArrowDownIcon className="h-5 w-5 animate-nudge-down" />
          </a>
        </div>
      </div>
    </section>
  )
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  )
}
