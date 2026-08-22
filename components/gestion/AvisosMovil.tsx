'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslator } from '@/lib/i18n/useLocale'

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
  const [aviso, setAviso] = useState<string | null>(null)

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

    setAviso(null)
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
      setAviso(
        t({
          es: 'Listo. Este dispositivo ya recibe los avisos.',
          gl: 'Listo. Este dispositivo xa recibe os avisos.',
        }),
      )
    } catch {
      setAviso(
        t({
          es: 'No se pudo activar. Inténtalo otra vez.',
          gl: 'Non se puido activar. Téntao outra vez.',
        }),
      )
    } finally {
      setTrabajando(false)
    }
  }, [publicKey, t])

  const desactivar = useCallback(async () => {
    setAviso(null)
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
      setAviso(t({ es: 'No se pudo desactivar.', gl: 'Non se puido desactivar.' }))
    } finally {
      setTrabajando(false)
    }
  }, [t])

  if (estado === 'cargando') return null

  const explicacion: Record<Exclude<Estado, 'cargando'>, string> = {
    'sin-claves': t({
      es: 'Falta configurar las claves del aviso en el servidor.',
      gl: 'Falta configurar as chaves do aviso no servidor.',
    }),
    'no-soportado': t({
      es: 'Este navegador no admite avisos. Prueba desde el móvil.',
      gl: 'Este navegador non admite avisos. Proba desde o móbil.',
    }),
    instalar: t({
      es: 'Antes hay que añadir la web a la pantalla de inicio y abrirla desde ese icono.',
      gl: 'Antes hai que engadir a web á pantalla de inicio e abrila dese icono.',
    }),
    bloqueado: t({
      es: 'Los avisos están bloqueados en los ajustes del móvil. Permítelos ahí y vuelve.',
      gl: 'Os avisos están bloqueados nos axustes do móbil. Permíteos aí e volve.',
    }),
    apagado: t({
      es: 'Los pedidos nuevos te sonarán en este dispositivo.',
      gl: 'Os pedidos novos soaránche neste dispositivo.',
    }),
    encendido: t({
      es: 'Este dispositivo ya recibe los avisos de pedido.',
      gl: 'Este dispositivo xa recibe os avisos de pedido.',
    }),
  }

  return (
    <div className="text-center">
      <p className="mx-auto max-w-md text-bark-soft">{explicacion[estado]}</p>

      {(estado === 'apagado' || estado === 'encendido') && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {estado === 'apagado' ? (
            <button type="button" onClick={activar} disabled={trabajando} className="btn btn-sm">
              {t({ es: 'Activar avisos aquí', gl: 'Activar avisos aquí' })}
            </button>
          ) : (
            <button
              type="button"
              onClick={desactivar}
              disabled={trabajando}
              className="btn btn-quiet btn-sm"
            >
              {t({ es: 'Desactivar', gl: 'Desactivar' })}
            </button>
          )}
        </div>
      )}

      {aviso && <p className="mt-4 text-small text-bark-faint">{aviso}</p>}
    </div>
  )
}
