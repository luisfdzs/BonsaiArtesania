'use client'

import { useRouter } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { ArrowLeftIcon } from '@/components/cuenta/CuentaIcons'
import { cn } from '@/lib/cn'
import { useTranslator } from '@/lib/i18n/useLocale'

/**
 * Volver atrás, en toda la app.
 *
 * Va en la cabecera y no flotando abajo porque atrás no es una acción de la
 * página —como volver arriba— sino del sitio: pertenece a la barra, al lado de la
 * marca, que es lo otro que está en todas las pantallas. Y va en las dos
 * cabeceras que hay, la de la web y la del panel de gestión, que no comparten
 * armazón; ver `components/layout/SiteChrome.tsx`.
 *
 * Devuelve al paso anterior del historial y no a una ruta padre calculada de la
 * dirección: lo que se espera de una flecha atrás es deshacer el último salto,
 * que muchas veces no es «subir un nivel» —de la ficha de una pieza se llega
 * desde la portada, desde la tienda o desde una familia—.
 *
 * **Sólo se puede pulsar si hay a dónde volver.** Quien abre una dirección
 * directamente, de un enlace compartido o del buscador, no tiene historial en
 * esta pestaña y una flecha ahí no haría nada.
 *
 * El historial es un dato del navegador, no del componente, así que se lee con
 * `useSyncExternalStore` y no guardándolo en un estado desde un efecto: en el
 * servidor no existe —de ahí el `false` de la instantánea de servidor— y en cada
 * navegación hay que volver a mirarlo. No hay a qué suscribirse porque el
 * historial no avisa cuando crece; lo que provoca la relectura es el propio
 * cambio de página, que vuelve a pintar la cabecera.
 *
 * Mientras no lo hay se apaga con opacidad y no desmontándose, igual que
 * `ScrollTop`: el hueco es el mismo en todas las páginas, así que la marca de al
 * lado no se mueve al pasar de una a otra. Apagado no recibe el foco ni el ratón,
 * que es lo que lo dejaría tabulable siendo invisible.
 */
const subscribe = () => () => {}
const hasHistory = () => window.history.length > 1
const noHistory = () => false

export function BackButton({ className }: { className?: string }) {
  const router = useRouter()
  const t = useTranslator()
  const available = useSyncExternalStore(subscribe, hasHistory, noHistory)

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label={t({ es: 'Volver atrás', gl: 'Volver atrás' })}
      aria-hidden={!available}
      tabIndex={available ? 0 : -1}
      className={cn(
        'tap flex h-10 w-10 items-center justify-center transition duration-500 hover:bg-sage-deep/12',
        available ? 'opacity-70 hover:opacity-100' : 'pointer-events-none opacity-0',
        className,
      )}
    >
      <ArrowLeftIcon className="h-5 w-5" />
    </button>
  )
}
