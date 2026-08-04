import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { signOut } from '@/auth'
import { LogoutIcon } from '@/components/cuenta/CuentaIcons'
import { GestionNav } from '@/components/gestion/GestionNav'
import { Wordmark } from '@/components/layout/Wordmark'
import { FormPending } from '@/components/ui/FormPending'
import { ScrollTop } from '@/components/ui/ScrollTop'
import { adminSession } from '@/lib/admin'
import { isLocale, pick, translator } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'

type Params = { params: Promise<{ locale: string }> }

const TITLE = { es: 'Gestión', gl: 'Xestión' }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  return {
    title: isLocale(locale) ? pick(TITLE, locale) : TITLE.es,
    robots: { index: false, follow: false },
  }
}

/**
 * El panel de gestión: **lo único que tiene la cuenta del taller**.
 *
 * Antes vivía en `/taller` y era una página más de la web: llegaba con la
 * cabecera del sitio encima —portada, tienda, encargos, carrito— y con el pie
 * debajo. Nada de eso le sirve a Ana, que entra a preparar pedidos y no a pedir, y
 * el carrito era además un enlace a una página que su propia cuenta tiene
 * cerrada. Ahora el panel es su propio armazón: cuelga de la raíz y no del
 * grupo `(sitio)`, así que no hereda ninguna de esas dos cosas. Ver
 * `components/layout/SiteChrome.tsx` para el reparto.
 *
 * Se llama `/gestion` y no `/taller` porque «el taller» ya significaba otra cosa
 * de cara al público —la sección de la portada donde se cuenta cómo se trabaja—,
 * y dos sitios con el mismo nombre no se distinguen ni al hablar ni en la barra
 * de direcciones.
 *
 * A quien no es administrador se le devuelve un 404, no un «no autorizado»: un
 * 403 confirma que la ruta existe. Si no hay sesión tampoco se redirige a entrar,
 * porque eso también delataría que hay algo detrás.
 *
 * Se maqueta como una sola columna centrada, igual que las páginas de texto del
 * sitio: es el mismo sitio, y no había razón para que la parte de dentro se
 * leyera como un panel de administración distinto. En ordenador, eso sí, esa
 * columna se abre hasta el ancho de la pantalla —ver el comentario de abajo—;
 * en móvil se queda como estaba.
 *
 * Lo que sí lleva propio, arriba y abajo, es lo que la cabecera de la web daba
 * gratis: la marca —para saber dónde se está—, las dos secciones que hay, y
 * **con qué cuenta se está dentro y cómo se sale**. Los pedidos de todo el mundo
 * están detrás de esta sesión, así que cerrarla tiene que estar a mano.
 */
export default async function GestionLayout({
  children,
  params,
}: {
  children: React.ReactNode
} & Params) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = translator(locale)

  const session = await adminSession()
  if (!session) notFound()

  const email = session.user?.email ?? ''

  return (
    <main id="main" className="page-gutter flex-1 pt-16 pb-(--spacing-section) md:pt-24">
      {/* En pantalla de ordenador el panel ocupa el ancho entero y no la columna
          de 42rem del resto del sitio. Las páginas de texto se leen mejor
          estrechas, pero aquí no se lee: se barre una lista de pedidos y se
          trabaja sobre uno, y cada sección —dirección, cambio de estado,
          historial— cabe de sobra a lo ancho sin tener que bajar. En móvil no
          cambia nada, que ahí 42rem ya era más de lo que hay. */}
      <header className="mx-auto flex max-w-2xl flex-col items-center border-b border-line pb-8 text-center md:max-w-none">
        {/* La marca, sin enlace: aquí no llevaría a ninguna parte —la portada no
            es de esta cuenta— y está sólo para decir de qué web es este panel. */}
        <Wordmark className="h-7 text-bark" />
        <h1 className="mt-6 font-serif text-title">{t(TITLE)}</h1>
        <p className="mt-3 text-small text-bark-faint">
          {t({
            es: 'Los pedidos de la tienda, todos. Aquí se cambia por dónde va cada uno.',
            gl: 'Os pedidos da tenda, todos. Aquí cámbiase por onde vai cada un.',
          })}
        </p>

        <div className="mt-8">
          <GestionNav />
        </div>
      </header>

      <div className="mx-auto mt-12 max-w-2xl text-center md:max-w-none">{children}</div>

      <div className="mx-auto mt-20 flex max-w-2xl flex-col items-center gap-6 border-t border-line pt-10 text-center md:max-w-none">
        {email && (
          <p className="text-small text-bark-faint">
            {t({ es: 'Dentro como', gl: 'Dentro como' })} {email}
          </p>
        )}

        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: path(locale, '/') })
          }}
        >
          {/* Igual que en la cuenta: salir borra la sesión de la base y luego
              lleva a la portada, y hasta el segundo viaje la gestión sigue en
              pantalla como si no se hubiera pulsado nada. */}
          <FormPending label={t({ es: 'Cerrando tu sesión', gl: 'Pechando a túa sesión' })} />

          <button type="submit" className="btn btn-quiet btn-sm">
            <LogoutIcon className="h-4 w-4" />
            {t({ es: 'Salir', gl: 'Saír' })}
          </button>
        </form>
      </div>

      {/* La flecha de volver arriba también aquí: el panel no hereda el armazón
          del sitio, y la lista de pedidos es lo más largo que tiene esta web. */}
      <ScrollTop />
    </main>
  )
}
