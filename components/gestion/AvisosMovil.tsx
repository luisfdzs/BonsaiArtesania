'use client'

import { useState } from 'react'
import { FlowerBudIcon } from '@/components/ui/FlowerBud'
import {
  CampanaIcon,
  CampanaOffIcon,
  CompartirIcon,
  InstalarIcon,
} from '@/components/layout/NavIcons'
import { cn } from '@/lib/cn'
import { useTranslator } from '@/lib/i18n/useLocale'
import { useAppMovil } from '@/lib/useAppMovil'

/**
 * El botón de la app y los avisos, en la cuenta del taller.
 *
 * Es el mismo camino de tres pasos que el del menú de la tienda —instalar, activar
 * los avisos, quitarlos— y por eso comparten la máquina de estados: `useAppMovil`.
 * Antes esto sólo sabía encender y apagar, y en un teléfono nuevo eso dejaba a Ana
 * atascada en el primer paso: el botón salía apagado diciendo «antes hay que añadir
 * la web a la pantalla de inicio» y el botón que la añade estaba en la barra de la
 * tienda —que la cuenta del taller no tiene, ver `lib/admin.ts`—. Así que el único
 * sitio de la web donde ella puede instalar la app es éste.
 *
 * Lo que no comparte con el menú es qué hacer cuando no hay nada que ofrecer. Allí el
 * hueco se queda vacío; aquí no puede, porque esto vive bajo un rótulo que dice
 * «Avisos en el móvil» y un rótulo con nada debajo se lee como una avería. El botón
 * se queda apagado y el motivo va en el `title`, para quien lo busque, y no ocupando
 * la pantalla: son estados en los que no hay nada que pulsar —sin claves en el
 * servidor, un navegador que no admite avisos, el permiso denegado en los ajustes—.
 */
export function AvisosMovil() {
  const t = useTranslator()
  const { oferta, impedimento, instalando, trabajando, fallo, pulsable, pulsar } = useAppMovil()
  const [abierto, setAbierto] = useState(false)

  /**
   * Por qué el botón está apagado. No se pinta: va en el `title`.
   *
   * `sin-sesion` no está y no puede estar: esta página vive detrás del guarda del
   * panel, así que quien la ve ha entrado. Y sin oferta ni impedimento —el navegador
   * aún no ha dicho si se puede instalar— lo que falta es justo eso, instalar.
   */
  const motivo: Record<string, string> = {
    'sin-claves': t({
      es: 'Falta configurar las claves del aviso en el servidor.',
      gl: 'Falta configurar as chaves do aviso no servidor.',
    }),
    'no-soportado': t({
      es: 'Este navegador no admite avisos.',
      gl: 'Este navegador non admite avisos.',
    }),
    bloqueado: t({
      es: 'Los avisos están bloqueados en los ajustes del móvil.',
      gl: 'Os avisos están bloqueados nos axustes do móbil.',
    }),
    instalar: t({
      es: 'Antes hay que añadir la web a la pantalla de inicio.',
      gl: 'Antes hai que engadir a web á pantalla de inicio.',
    }),
  }

  const rotulo = instalando
    ? t({ es: 'Instalando la app…', gl: 'Instalando a app…' })
    : oferta === 'avisos'
      ? t({ es: 'Activar avisos', gl: 'Activar avisos' })
      : oferta === 'apagar'
        ? t({ es: 'Desactivar avisos', gl: 'Desactivar avisos' })
        : oferta === 'ios'
          ? t({ es: 'Añadir a la pantalla de inicio', gl: 'Engadir á pantalla de inicio' })
          : t({ es: 'Instalar la app', gl: 'Instalar a app' })

  const Icono =
    oferta === 'avisos'
      ? CampanaIcon
      : oferta === 'apagar'
        ? CampanaOffIcon
        : oferta === 'ios'
          ? CompartirIcon
          : InstalarIcon

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

  // Sin oferta y sin impedimento el navegador todavía no ha dicho si se puede
  // instalar: el botón dice el paso que falta —instalar— y está apagado, porque
  // pulsarlo no haría nada.
  const explicable = !instalando && (oferta === 'ios' || oferta === 'navegador')
  const apagado = !pulsable && !explicable

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={() => (pulsable ? pulsar() : setAbierto((v) => !v))}
        disabled={apagado || trabajando || instalando}
        title={apagado ? (motivo[impedimento ?? 'instalar'] ?? motivo.instalar) : undefined}
        aria-expanded={explicable ? abierto : undefined}
        className={cn('btn btn-sm', oferta === 'apagar' && 'btn-quiet')}
      >
        {/* La flor ocupa el sitio del icono mientras se instala, igual que en el
            menú: el botón no cambia de tamaño y la sección no se mueve. El rótulo
            ya dice «Instalando la app…», así que va sin `role="status"`. */}
        {instalando ? <FlowerBudIcon className="h-5 w-5" /> : <Icono className="h-5 w-5" />}
        {rotulo}
      </button>

      {explicable && abierto && (
        <p className="mx-auto mt-4 max-w-[22rem] text-small leading-relaxed text-bark-faint">
          {explicacion}
        </p>
      )}

      {fallo && (
        <p className="mx-auto mt-4 max-w-[22rem] text-small leading-relaxed text-bark-faint">
          {t({
            es: 'No se pudo. Inténtalo otra vez.',
            gl: 'Non se puido. Téntao outra vez.',
          })}
        </p>
      )}
    </div>
  )
}
