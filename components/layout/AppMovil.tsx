'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { FlowerBudIcon } from '@/components/ui/FlowerBud'
import { cn } from '@/lib/cn'
import { useTranslator } from '@/lib/i18n/useLocale'
import { CampanaIcon, CampanaOffIcon, CompartirIcon, InstalarIcon } from './NavIcons'

/**
 * LA APP EN EL MÓVIL, lo primero del menú y centrado.
 *
 * Un solo hueco con un solo botón, y lo que ofrece depende de por dónde se haya
 * quedado el visitante. Son tres momentos y van en orden, porque el segundo no
 * existe sin el primero:
 *
 * 1. **Sin instalar** → «Instalar la app».
 * 2. **Instalada y sin avisos** → «Activar los avisos».
 * 3. **Instalada y con los avisos puestos** → «Desactivar los avisos».
 *
Lo que cambia es lo que el botón hace, no si está. Antes el tercer momento no
 * pintaba nada —ya estaba todo hecho—, y eso dejaba sin marcha atrás a quien había
 * activado los avisos: para quitarlos había que entrar en los ajustes del teléfono.
 * Un interruptor que sólo enciende no es un interruptor.
 *
 * El hueco sí puede quedarse vacío, y es a propósito: en un navegador que no sabe
 * instalar no hay nada honesto que ofrecer. Ver «cuando no se sabe» más abajo.
 *
 * Van en el mismo sitio y no uno debajo del otro a propósito: es un único camino
 * con dos pasos, y enseñar el segundo antes de acabar el primero sería ofrecer algo
 * que en iOS todavía no puede funcionar —ahí los avisos sólo llegan si la web está
 * en la pantalla de inicio—.
 *
 * ## El primer paso, instalar
 *
 * **No lleva el distintivo de Google Play ni el de la App Store.** Esto es una web
 * instalable, no una app de tienda: no hay ficha que abrir, y esos distintivos
 * —que además sus dueños reservan para enlazar a su tienda— prometerían una
 * descarga que no existe. Cada plataforma lleva su icono y su verbo:
 *
 * - **En Android**, el navegador avisa de que la web se puede instalar
 *   (`beforeinstallprompt`) y aquí se guarda ese aviso para lanzarlo cuando lo pulse
 *   el visitante. Es lo mismo que ofrece Chrome por su cuenta, pero cuando se pide y
 *   no cuando le toca a él: el suyo se enseña una vez, y si se cierra no vuelve.
 * - **En iPhone**, Safari no ofrece nada y no hay evento que escuchar: lo único que
 *   se puede hacer es enseñar el camino —Compartir → Añadir a inicio—, así que el
 *   botón despliega esa instrucción en vez de instalar.
 *
 * Al pulsarlo, el botón se queda esperando con la flor y el rótulo «Instalando la
 * app…» hasta que el navegador dice que ya está (`appinstalled`), y entonces pasa
 * solo al paso de los avisos. La espera no es de adorno: entre aceptar el cuadro
 * del navegador y tener la app puesta pasa un rato, y sin ella el botón seguía
 * diciendo «Instalar la app» —invitando a pulsarlo otra vez sobre un aviso que ya
 * se ha gastado— justo cuando el trabajo estaba en marcha.
 *
 * ## Cuando no se sabe
 *
 * `beforeinstallprompt` calla en dos casos que no se parecen en nada: cuando la web
 * ya está instalada y cuando el navegador no sabe instalarla. Antes ese silencio se
 * resolvía enseñando «Instalar la app» con la instrucción del menú del navegador
 * debajo, y con ella se le ofrecía instalar a quien ya la tenía instalada.
 *
 * Ahora se pregunta: `navigator.getInstalledRelatedApps()` contesta si esta misma
 * web está puesta en el aparato —para eso el manifiesto se declara a sí mismo, ver
 * `app/manifest.ts`—. Si dice que sí, se salta el primer paso y se va derecho a los
 * avisos. Si no contesta o dice que no, y el aviso del navegador tampoco llega, el
 * hueco se queda vacío: es más honesto no ofrecer nada que ofrecer un botón que no
 * puede cumplir.
 *
 * ## El segundo, los avisos
 *
 * Los avisos son de los dos lados: al taller le suena un pedido nuevo o una
 * cancelación, y a quien compra le suena que su pedido ha cambiado de estado. Por
 * eso esto no está sólo en el panel —donde ya vivía, ver `AvisosMovil`— sino en el
 * menú de toda la web.
 *
 * Hacen falta dos cosas que aquí no se saben: si hay sesión —una suscripción se
 * guarda a nombre de un correo— y la clave pública con la que suscribirse. Las dos
 * se piden a `/api/push/estado`, y sólo con la web ya instalada: sin instalar no hay
 * nada que ofrecer, así que no se gasta una petición. Sin sesión no se pinta nada:
 * pedir permiso de avisos a quien no ha entrado sería quemar el único permiso que el
 * navegador no vuelve a preguntar.
 *
 * Y si el permiso está denegado, tampoco se pinta: eso no se puede deshacer desde
 * una página, se deshace en los ajustes del teléfono.
 */
type Instalable = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Lo que se puede ofrecer aquí:
 *
 * - `instalar`: el navegador ha dado el aviso, así que el botón instala.
 * - `ios`: no hay aviso que lanzar; el botón explica cómo se hace a mano.
 * - `navegador`: había aviso, se usó y no se instaló. El aviso es de un solo uso, así
 *   que lo que queda es decir dónde está la opción en el menú del navegador. Sólo se
 *   llega aquí después de rechazar el cuadro del navegador, nunca de salida: cuando
 *   no se sabe nada, no se ofrece nada.
 * - `avisos`: ya está instalada; lo que falta es dar permiso a las notificaciones.
 * - `apagar`: instalada y con los avisos puestos en este dispositivo; el botón los
 *   quita.
 */
type Oferta = 'instalar' | 'ios' | 'navegador' | 'avisos' | 'apagar' | null

function esApple(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

/** Ya está en la pantalla de inicio: abierta aparte del navegador. */
function instalada(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

type AppRelacionada = { platform?: string }
type ConRelacionadas = Navigator & {
  getInstalledRelatedApps?: () => Promise<AppRelacionada[]>
}

/**
 * Puesta en el aparato, aunque ahora mismo se esté viendo en una pestaña.
 *
 * `instalada()` sólo mira si **esta ventana** se ha abierto aparte del navegador, y
 * eso es otra pregunta: recién instalada desde aquí, la pestaña en la que se pulsó
 * sigue siendo una pestaña, y al volver mañana por el navegador también. Por eso el
 * menú ofrecía instalar a quien ya la tenía.
 *
 * Lo contesta el navegador con la lista de apps relacionadas del manifiesto, que se
 * apunta a sí mismo justo para esto. Sólo Chromium lo tiene; donde no está —Safari,
 * Firefox— se responde que no se sabe, y arriba eso se traduce en no ofrecer nada
 * en vez de en ofrecerlo a ciegas.
 */
async function puestaEnElAparato(): Promise<boolean> {
  const nav = navigator as ConRelacionadas
  if (!nav.getInstalledRelatedApps) return false

  try {
    const apps = await nav.getInstalledRelatedApps()
    return apps.some((app) => app.platform === 'webapp')
  } catch {
    return false
  }
}

/**
 * El seguro de la espera de instalación, en milisegundos.
 *
 * Lo normal es que `appinstalled` llegue en un par de segundos y la espera acabe
 * ahí. Esto es para el caso en que no llegue —el navegador se lo come, la
 * instalación se queda a medias—: una flor dando vueltas para siempre deja el menú
 * sin salida, y hay que poder volver a intentarlo. Al agotarse se pregunta otra vez
 * si está puesta, que es lo único que se puede saber a esas alturas.
 */
const ESPERA_INSTALACION = 40_000

/**
 * Lo que sólo se puede saber en el navegador —si está instalada, y si el aparato es
 * de Apple— se lee con `useSyncExternalStore` y no con un efecto que llame a
 * `setState`: en el servidor no hay `navigator` ni `matchMedia`, y ésta es la forma
 * de leerlo en el cliente sin pintar primero un botón que no toca. En el HTML que
 * llega no hay nada, que es lo correcto: esto no se puede saber ahí.
 *
 * Y lo de estar instalada además cambia en vivo: al instalar desde este mismo botón
 * hay que pasar al paso siguiente sin recargar. De eso se encarga la suscripción.
 */
function suscribirInstalada(alCambiar: () => void): () => void {
  const media = window.matchMedia('(display-mode: standalone)')
  media.addEventListener('change', alCambiar)
  window.addEventListener('appinstalled', alCambiar)

  return () => {
    media.removeEventListener('change', alCambiar)
    window.removeEventListener('appinstalled', alCambiar)
  }
}

const sinCambios = () => () => {}
const enElServidor = () => false

/** La clave pública VAPID, de texto a los bytes que espera el navegador. */
function claveBinaria(clave: string): Uint8Array<ArrayBuffer> {
  const relleno = '='.repeat((4 - (clave.length % 4)) % 4)
  const base64 = (clave + relleno).replace(/-/g, '+').replace(/_/g, '/')
  const crudo = atob(base64)
  const bytes = new Uint8Array(new ArrayBuffer(crudo.length))
  for (let i = 0; i < crudo.length; i += 1) bytes[i] = crudo.charCodeAt(i)

  return bytes
}

/** El service worker de la web, que es quien recibe los avisos. */
async function registro(): Promise<ServiceWorkerRegistration> {
  const existente = await navigator.serviceWorker.getRegistration('/')
  return existente ?? navigator.serviceWorker.register('/sw.js', { scope: '/' })
}

export function AppMovil() {
  const t = useTranslator()
  const abiertaAparte = useSyncExternalStore(suscribirInstalada, instalada, enElServidor)
  const apple = useSyncExternalStore(sinCambios, esApple, enElServidor)
  /**
   * Puesta en el aparato: o se está viendo abierta aparte del navegador, o el
   * navegador ha dicho que está. Lo segundo puede llegar tarde —es una promesa— o
   * no llegar nunca, así que empieza en `false`; mientras, no se ofrece instalar,
   * que es el lado seguro por el que equivocarse.
   */
  const [detectada, setDetectada] = useState(false)
  const instalado = abiertaAparte || detectada
  /** En un iPhone sin instalar no hay nada que lanzar: sólo el camino a mano. */
  const manual = !instalado && apple
  const [ofrecido, setOfrecido] = useState<Oferta>(null)
  const [abierto, setAbierto] = useState(false)
  const [fallo, setFallo] = useState(false)
  const [trabajando, setTrabajando] = useState(false)
  /** Desde que se pulsa instalar hasta que el navegador dice que ya está. */
  const [instalando, setInstalando] = useState(false)
  const aviso = useRef<Instalable | null>(null)
  const clave = useRef<string | null>(null)

  /**
   * Lo primero, antes de ofrecer nada: preguntar si ya está puesta. En un iPhone no
   * se pregunta porque allí nadie contesta, y abierta aparte del navegador la
   * respuesta ya se sabe.
   */
  useEffect(() => {
    if (apple || instalado) return

    let vivo = true
    void puestaEnElAparato().then((puesta) => {
      if (vivo && puesta) setDetectada(true)
    })

    return () => {
      vivo = false
    }
  }, [apple, instalado])

  /** Sin instalar: se escucha al navegador para poder ofrecer la instalación. */
  useEffect(() => {
    if (manual || instalado) return

    const alOfrecer = (event: Event) => {
      // Sin esto el navegador saca su propio aviso y el evento se gasta ahí, así
      // que este botón se quedaría sin nada que lanzar. El precio es que Chrome ya
      // no lo ofrece por su cuenta; a cambio, aquí está siempre y en su idioma.
      event.preventDefault()
      aviso.current = event as Instalable
      setOfrecido('instalar')
    }

    // Recién instalada, lo que toca es el paso siguiente: se cierra la espera y se
    // apunta que está puesta, que es lo que hace que el efecto de abajo salga a
    // buscar el estado de los avisos. `suscribirInstalada` se enteró del mismo
    // evento, pero no basta: la pestaña en la que se ha pulsado sigue siendo una
    // pestaña, así que su `display-mode` no cambia y sin esto el hueco volvería a
    // ofrecer instalar.
    const alInstalar = () => {
      aviso.current = null
      setOfrecido(null)
      setInstalando(false)
      setDetectada(true)
    }

    window.addEventListener('beforeinstallprompt', alOfrecer)
    window.addEventListener('appinstalled', alInstalar)

    return () => {
      window.removeEventListener('beforeinstallprompt', alOfrecer)
      window.removeEventListener('appinstalled', alInstalar)
    }
  }, [manual, instalado])

  /**
   * El seguro de la espera. Lo normal es que la cierre `appinstalled`; esto sólo
   * salta si no llega, y entonces pregunta si está puesta y, si tampoco, devuelve
   * el camino a mano. Lo que no puede pasar es que la flor se quede dando vueltas.
   */
  useEffect(() => {
    if (!instalando) return

    const reloj = setTimeout(() => {
      void puestaEnElAparato().then((puesta) => {
        setInstalando(false)
        if (puesta) setDetectada(true)
        else setOfrecido('navegador')
      })
    }, ESPERA_INSTALACION)

    return () => clearTimeout(reloj)
  }, [instalando])

  /** Ya instalada: si falta dar permiso a los avisos, se ofrece. */
  useEffect(() => {
    if (!instalado) return
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return
    if (!('PushManager' in window)) return
    if (Notification.permission === 'denied') return

    let vivo = true

    const mirar = async () => {
      const respuesta = await fetch('/api/push/estado', { cache: 'no-store' })
      if (!respuesta.ok) return
      const datos = (await respuesta.json()) as { sesion?: boolean; clave?: string | null }
      if (!vivo || !datos.sesion || !datos.clave) return
      clave.current = datos.clave

      // Con el permiso ya dado puede que aún falte la suscripción: es de este
      // dispositivo y de este navegador, así que un teléfono nuevo la necesita
      // aunque el permiso venga de antes.
      // Y si ya la tiene, lo que se ofrece es quitarla.
      if (Notification.permission === 'granted') {
        const suscripcion = await (await registro()).pushManager.getSubscription()
        if (!vivo) return
        if (suscripcion) return setOfrecido('apagar')
      }

      setOfrecido('avisos')
    }

    void mirar().catch(() => {})

    return () => {
      vivo = false
    }
  }, [instalado])

  const instalar = useCallback(async () => {
    const guardado = aviso.current
    if (!guardado) return setOfrecido('navegador')

    // De un solo uso: se suelta antes de esperar la respuesta para que un segundo
    // toque no vuelva a lanzarlo, que es un error del navegador.
    aviso.current = null
    setInstalando(true)

    try {
      await guardado.prompt()
      const { outcome } = await guardado.userChoice

      // Aceptado: la espera **no** se cierra aquí. El cuadro del navegador se ha
      // cerrado, pero la app aún se está poniendo, y quien mira el menú necesita
      // ver que algo pasa hasta que esté. La cierra `appinstalled`.
      if (outcome === 'accepted') return

      setInstalando(false)
      setOfrecido('navegador')
    } catch {
      setInstalando(false)
      setOfrecido('navegador')
    }
  }, [])

  const activarAvisos = useCallback(async () => {
    const publica = clave.current
    if (!publica) return

    setFallo(false)
    setTrabajando(true)

    try {
      // El permiso primero: sin él no se puede suscribir, y si se niega no se
      // vuelve a preguntar. Con el hueco fuera, que es lo que toca.
      if ((await Notification.requestPermission()) !== 'granted') return setOfrecido(null)

      const reg = await registro()
      const suscripcion =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: claveBinaria(publica),
        }))

      const respuesta = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(suscripcion.toJSON()),
      })
      if (!respuesta.ok) throw new Error('No se guardó la suscripción')

      // Hecho: el botón se da la vuelta y pasa a ser el que los quita.
      setOfrecido('apagar')
    } catch {
      setFallo(true)
    } finally {
      setTrabajando(false)
    }
  }, [])

  /**
   * La marcha atrás. Se da de baja en el servidor **y** en el navegador: sin lo
   * primero se seguirían mandando avisos a un endpoint muerto, y sin lo segundo el
   * navegador conservaría la suscripción y al volver a activar no habría nada nuevo
   * que guardar.
   *
   * El permiso del navegador no se toca —no se puede revocar desde una página—, así
   * que volver a activar no vuelve a preguntar. Es lo que se quiere: quitar los
   * avisos no puede costar tener que ir a los ajustes del teléfono para recuperarlos.
   */
  const desactivarAvisos = useCallback(async () => {
    setFallo(false)
    setTrabajando(true)

    try {
      const suscripcion = await (await registro()).pushManager.getSubscription()

      if (suscripcion) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ endpoint: suscripcion.endpoint }),
        })
        await suscripcion.unsubscribe()
      }

      setOfrecido('avisos')
    } catch {
      setFallo(true)
    } finally {
      setTrabajando(false)
    }
  }, [])

  /**
   * Sin instalar, lo que hay depende de lo que se sepa: con el aviso del navegador
   * guardado, el botón que instala; en un iPhone, el camino a mano; y si no se sabe
   * nada —ni aviso, ni respuesta de que esté puesta—, nada. Instalada, lo que toca
   * lo decide el efecto de arriba; hasta que contesta no hay botón, que es lo que
   * dura una petición.
   */
  const oferta: Oferta = instalado ? ofrecido : (ofrecido ?? (manual ? 'ios' : null))

  // La espera manda sobre todo lo demás: mientras se instala no hay nada que
  // ofrecer, sólo lo que está pasando.
  if (!oferta && !instalando) return null

  const rotulo = instalando
    ? t({ es: 'Instalando la app…', gl: 'Instalando a app…' })
    : oferta === 'avisos'
      ? t({ es: 'Activar los avisos', gl: 'Activar os avisos' })
      : oferta === 'apagar'
        ? t({ es: 'Desactivar los avisos', gl: 'Desactivar os avisos' })
        : oferta === 'ios'
          ? t({ es: 'Añadir a la pantalla de inicio', gl: 'Engadir á pantalla de inicio' })
          : t({ es: 'Instalar la app', gl: 'Instalar a app' })

  const explicacion =
    oferta === 'ios'
      ? t({
          es: 'Pulsa Compartir, abajo en Safari, y luego «Añadir a pantalla de inicio».',
          gl: 'Preme Compartir, abaixo en Safari, e logo «Engadir á pantalla de inicio».',
        })
      : t({
          es: 'En el menú del navegador, arriba a la derecha: «Instalar app».',
          gl: 'No menú do navegador, arriba á dereita: «Instalar app».',
        })

  // Los avisos y la instalación se activan al pulsar; los otros dos casos son un
  // camino que se explica, y se despliega debajo en vez de abrir nada. Instalando
  // no se pulsa nada: el aviso del navegador ya se ha gastado.
  const pulsable =
    !instalando && (oferta === 'instalar' || oferta === 'avisos' || oferta === 'apagar')
  const Icono =
    oferta === 'avisos'
      ? CampanaIcon
      : oferta === 'apagar'
        ? CampanaOffIcon
        : oferta === 'ios'
          ? CompartirIcon
          : InstalarIcon

  const alPulsar = () => {
    if (oferta === 'avisos') return void activarAvisos()
    if (oferta === 'apagar') return void desactivarAvisos()
    if (oferta === 'instalar') return void instalar()
    setAbierto((v) => !v)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={alPulsar}
        disabled={trabajando || instalando}
        aria-expanded={pulsable || instalando ? undefined : abierto}
        /* Todo en el verde de la casa —filete, icono y letra— y no en tinta: es el
           único botón del menú, y en salvia se lee como un botón sin necesidad de
           fondo. El icono no lleva color propio, hereda el del botón. */
        className={cn(
          'tap flex items-center gap-2.5 rounded-full border border-sage-deep px-5 py-2.5',
          'text-small text-sage-deep transition-opacity duration-500 ease-(--ease-out-soft)',
          (trabajando || instalando) && 'opacity-55',
        )}
      >
        {/* La flor ocupa el sitio del icono, no se pone al lado: así el botón no
            cambia de tamaño al pulsarlo y el menú no se mueve. Mismo apaño que en
            los botones del carrito, sólo que aquí la espera no la marca un
            formulario sino el navegador. El rótulo ya dice «Instalando la app…»,
            así que la flor va sin `role="status"`: se anunciaría dos veces. */}
        {instalando ? <FlowerBudIcon className="h-5 w-5" /> : <Icono className="h-5 w-5" />}
        {rotulo}
      </button>

      {/* La instrucción, sólo cuando hace falta. Ocupa dos líneas en un móvil
          estrecho, así que se guarda hasta que se pide: si estuviera siempre, el
          menú acabaría con un párrafo debajo del botón. */}
      {!pulsable && !instalando && abierto && (
        <p className="max-w-[22rem] text-small leading-relaxed text-bark-faint">{explicacion}</p>
      )}

      {fallo && (
        <p className="max-w-[22rem] text-small leading-relaxed text-bark-faint">
          {t({
            es: 'No se pudo. Inténtalo otra vez.',
            gl: 'Non se puido. Téntao outra vez.',
          })}
        </p>
      )}
    </div>
  )
}
