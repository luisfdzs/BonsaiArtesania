'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { useTranslator } from '@/lib/i18n/useLocale'

/**
 * El interruptor de los avisos de este dispositivo, en la cuenta del taller.
 *
 * Un botón y nada más. Antes lo acompañaba un párrafo por estado —qué son los
 * avisos, que cada dispositivo va por su cuenta, que en iPhone hay que instalar
 * antes—, y era leerse cuatro líneas para pulsar un botón que Ana pulsa una vez en
 * la vida. El rótulo de la sección dice lo que es y el botón dice lo que hace.
 *
 * Los estados en los que no hay nada que hacer —sin claves en el servidor, un
 * navegador que no admite avisos, un iPhone sin instalar, el permiso denegado en
 * los ajustes— dejan el botón apagado en vez de quitarlo: el hueco no cambia de
 * forma según el aparato desde el que se mire. El motivo va en el `title`, para
 * quien lo busque, y no ocupando la pantalla.
 */
type Estado =
  'cargando' | 'sin-claves' | 'no-soportado' | 'instalar' | 'bloqueado' | 'apagado' | 'encendido'

function claveBinaria(clave: string): Uint8Array<ArrayBuffer> {
  const relleno = '='.repeat((4 - (clave.length % 4)) % 4)
  const base64 = (clave + relleno).replace(/-/g, '+').replace(/_/g, '/')
  const crudo = atob(base64)
  const bytes = new Uint8Array(new ArrayBuffer(crudo.length))
  for (let i = 0; i < crudo.length; i += 1) bytes[i] = crudo.charCodeAt(i)

  return bytes
}

function esApple(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function instalada(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

async function registro(): Promise<ServiceWorkerRegistration> {
  const existente = await navigator.serviceWorker.getRegistration('/')
  if (existente) return existente

  return navigator.serviceWorker.register('/sw.js', { scope: '/' })
}

export function AvisosMovil({ publicKey }: { publicKey: string | null }) {
  const t = useTranslator()
  const [estado, setEstado] = useState<Estado>('cargando')
  const [trabajando, setTrabajando] = useState(false)

  useEffect(() => {
    let vivo = true

    const mirar = async () => {
      if (!publicKey) return setEstado('sin-claves')

      if (!('serviceWorker' in navigator) || !('Notification' in window)) {
        return setEstado(esApple() && !instalada() ? 'instalar' : 'no-soportado')
      }

      if (!('PushManager' in window)) {
        return setEstado(instalada() ? 'no-soportado' : 'instalar')
      }

      if (Notification.permission === 'denied') return setEstado('bloqueado')

      const suscripcion = await (await registro()).pushManager.getSubscription()
      if (!vivo) return

      setEstado(suscripcion ? 'encendido' : 'apagado')
    }

    void mirar().catch(() => setEstado('no-soportado'))

    return () => {
      vivo = false
    }
  }, [publicKey])

  const activar = useCallback(async () => {
    if (!publicKey) return

    setTrabajando(true)

    try {
      const permiso = await Notification.requestPermission()
      if (permiso !== 'granted') {
        setEstado('bloqueado')
        return
      }

      const reg = await registro()
      const suscripcion =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: claveBinaria(publicKey),
        }))

      const respuesta = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(suscripcion.toJSON()),
      })

      if (!respuesta.ok) throw new Error('No se guardó la suscripción')

      setEstado('encendido')
    } catch {
      // El botón se queda como estaba: al volver a pulsar se reintenta, que es lo
      // único que se puede hacer y lo que iba a decir el aviso que había aquí.
      setEstado('apagado')
    } finally {
      setTrabajando(false)
    }
  }, [publicKey])

  const desactivar = useCallback(async () => {
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

      setEstado('apagado')
    } catch {
      setEstado('encendido')
    } finally {
      setTrabajando(false)
    }
  }, [])

  if (estado === 'cargando') return null

  const encendido = estado === 'encendido'
  const puede = encendido || estado === 'apagado'

  /** Por qué el botón está apagado. No se pinta: va en el `title`. */
  const motivo: Partial<Record<Estado, string>> = {
    'sin-claves': t({
      es: 'Falta configurar las claves del aviso en el servidor.',
      gl: 'Falta configurar as chaves do aviso no servidor.',
    }),
    'no-soportado': t({
      es: 'Este navegador no admite avisos.',
      gl: 'Este navegador non admite avisos.',
    }),
    instalar: t({
      es: 'Antes hay que añadir la web a la pantalla de inicio.',
      gl: 'Antes hai que engadir a web á pantalla de inicio.',
    }),
    bloqueado: t({
      es: 'Los avisos están bloqueados en los ajustes del móvil.',
      gl: 'Os avisos están bloqueados nos axustes do móbil.',
    }),
  }

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={encendido ? desactivar : activar}
        disabled={!puede || trabajando}
        title={motivo[estado]}
        className={cn('btn btn-sm', encendido && 'btn-quiet')}
      >
        {encendido
          ? t({ es: 'Desactivar avisos', gl: 'Desactivar avisos' })
          : t({ es: 'Activar avisos', gl: 'Activar avisos' })}
      </button>
    </div>
  )
}
