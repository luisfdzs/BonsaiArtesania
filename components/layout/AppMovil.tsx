'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { cn } from '@/lib/cn'
import { useTranslator } from '@/lib/i18n/useLocale'
import { CampanaIcon, CompartirIcon, InstalarIcon } from './NavIcons'

/**
 * LA APP EN EL MÓVIL, lo primero del menú y centrado.
 *
 * Un solo hueco con un solo botón, y lo que ofrece depende de por dónde se haya
 * quedado el visitante. Son tres momentos y van en orden, porque el segundo no
 * existe sin el primero:
 *
 * 1. **Sin instalar** → «Instalar la app».
 * 2. **Instalada y sin avisos** → «Activar los avisos».
 * 3. **Instalada y con los avisos puestos** → nada. Ya está todo hecho, y un botón
 *    que no cambia nada sólo estorba.
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
 *   que lo que queda es decir dónde está la opción en el menú del navegador.
 * - `avisos`: ya está instalada; lo que falta es dar permiso a las notificaciones.
 */
type Oferta = 'instalar' | 'ios' | 'navegador' | 'avisos' | null

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
  const instalado = useSyncExternalStore(suscribirInstalada, instalada, enElServidor)
  const apple = useSyncExternalStore(sinCambios, esApple, enElServidor)
  /** En un iPhone sin instalar no hay nada que lanzar: sólo el camino a mano. */
  const manual = !instalado && apple
  const [ofrecido, setOfrecido] = useState<Oferta>(null)
  const [abierto, setAbierto] = useState(false)
  const [fallo, setFallo] = useState(false)
  const [trabajando, setTrabajando] = useState(false)
  const aviso = useRef<Instalable | null>(null)
  const clave = useRef<string | null>(null)

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

    // Recién instalada, lo que toca es el paso siguiente. No hace falta recargar:
    // `suscribirInstalada` se enteró del mismo evento y el efecto de abajo vuelve a
    // mirar; aquí sólo se limpia lo del paso anterior.
    const alInstalar = () => {
      aviso.current = null
      setOfrecido(null)
    }

    window.addEventListener('beforeinstallprompt', alOfrecer)
    window.addEventListener('appinstalled', alInstalar)

    return () => {
      window.removeEventListener('beforeinstallprompt', alOfrecer)
      window.removeEventListener('appinstalled', alInstalar)
    }
  }, [manual, instalado])

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
      if (Notification.permission === 'granted') {
        const suscripcion = await (await registro()).pushManager.getSubscription()
        if (!vivo || suscripcion) return
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

    try {
      await guardado.prompt()
      const { outcome } = await guardado.userChoice
      setOfrecido(outcome === 'accepted' ? null : 'navegador')
    } catch {
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

      // Hecho: el hueco se queda vacío, que es el tercer momento.
      setOfrecido(null)
    } catch {
      setFallo(true)
    } finally {
      setTrabajando(false)
    }
  }, [])

  const oferta: Oferta = ofrecido ?? (manual ? 'ios' : null)
  if (!oferta) return null

  const rotulo =
    oferta === 'avisos'
      ? t({ es: 'Activar los avisos', gl: 'Activar os avisos' })
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
  // camino que se explica, y se despliega debajo en vez de abrir nada.
  const pulsable = oferta === 'instalar' || oferta === 'avisos'
  const Icono = oferta === 'avisos' ? CampanaIcon : oferta === 'ios' ? CompartirIcon : InstalarIcon

  const alPulsar = () => {
    if (oferta === 'avisos') return void activarAvisos()
    if (oferta === 'instalar') return void instalar()
    setAbierto((v) => !v)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={alPulsar}
        disabled={trabajando}
        aria-expanded={pulsable ? undefined : abierto}
        /* Todo en el verde de la casa —filete, icono y letra— y no en tinta: es el
           único botón del menú, y en salvia se lee como un botón sin necesidad de
           fondo. El icono no lleva color propio, hereda el del botón. */
        className={cn(
          'tap flex items-center gap-2.5 rounded-full border border-sage-deep px-5 py-2.5',
          'text-small text-sage-deep transition-opacity duration-500 ease-(--ease-out-soft)',
          trabajando && 'opacity-55',
        )}
      >
        <Icono className="h-5 w-5" />
        {rotulo}
      </button>

      {/* La instrucción, sólo cuando hace falta. Ocupa dos líneas en un móvil
          estrecho, así que se guarda hasta que se pide: si estuviera siempre, el
          menú acabaría con un párrafo debajo del botón. */}
      {!pulsable && abierto && (
        <p className="max-w-[22rem] text-small leading-relaxed text-bark-faint">{explicacion}</p>
      )}

      {fallo && (
        <p className="max-w-[22rem] text-small leading-relaxed text-bark-faint">
          {t({
            es: 'No se pudieron activar. Inténtalo otra vez.',
            gl: 'Non se puideron activar. Téntao outra vez.',
          })}
        </p>
      )}
    </div>
  )
}
