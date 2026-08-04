'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { useTranslator } from '@/lib/i18n/useLocale'

/**
 * El botón de volver arriba. Sale en toda la web, abajo y centrado, y sólo cuando
 * hay algo por encima a lo que volver.
 *
 * Hacía falta porque las páginas de aquí son largas de verdad: la portada baja por
 * el escaparate, los encargos y el contacto, y una familia de la tienda son
 * cuarenta y cuatro fotos. Al final de cualquiera de las dos, volver al principio
 * eran diez pasadas de rueda —o un pulgar arrastrando— y la única forma corta era
 * la marca de la cabecera, que en móvil no está a la vista mientras se baja.
 *
 * **Cuándo aparece**: en cuanto el documento está scrolleado. El umbral son ocho
 * píxeles y no cero para que el rebote elástico de iOS —que deja el scroll en 1 o
 * 2 al soltar arriba— no lo encienda estando ya en el principio.
 *
 * **Por qué se apaga con opacidad** y no desmontándolo: así entra y sale con el
 * mismo desvanecido lento del resto del sitio en vez de aparecer de golpe. Mientras
 * está apagado no se puede pulsar ni recibe el foco, que es lo que lo dejaría
 * tabulable siendo invisible.
 *
 * Va después de la barra de móvil en el orden de lectura, y por encima de ella en
 * la pantalla: en móvil se coloca justo sobre la barra, contando su alto y el hueco
 * de la rayita del sistema (`--spacing-nav-mobile`).
 */
export function ScrollTop() {
  const t = useTranslator()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const check = () => setVisible(window.scrollY > 8)
    // Una vez al montar: se puede llegar a mitad de página —un enlace con
    // ancla, o el navegador restaurando la posición al volver atrás— sin que
    // llegue a haber un solo evento de scroll.
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [])

  return (
    <button
      type="button"
      aria-label={t({ es: 'Volver arriba', gl: 'Volver arriba' })}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      // Sin `behavior` a propósito, igual que la casa de la barra de móvil:
      // hereda el scroll suave del CSS, y el salto seco cuando el sistema pide
      // menos movimiento.
      onClick={() => window.scrollTo({ top: 0 })}
      className={cn(
        'fixed bottom-[calc(var(--spacing-nav-mobile)+1rem)] left-1/2 z-40 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-line bg-linen/90 text-bark shadow-[0_1px_12px_rgba(60,54,46,0.06)] backdrop-blur-md transition duration-500 ease-(--ease-out-soft) hover:border-sage hover:text-sage-deep md:bottom-8',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      {/* El movimiento va en la flecha y no en el botón: el botón se está
          desvaneciendo, y dos transformaciones en el mismo elemento se pisan. */}
      <ArrowUpIcon className="h-5 w-5 animate-nudge-up" />
    </button>
  )
}

/** Trazado de Lucide (ISC), con el trazo a 1.5 como el resto de los iconos. */
function ArrowUpIcon({ className }: { className?: string }) {
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
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  )
}
