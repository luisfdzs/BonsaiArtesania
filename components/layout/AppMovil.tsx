'use client'

import { useState } from 'react'
import { FlowerBudIcon } from '@/components/ui/FlowerBud'
import { cn } from '@/lib/cn'
import { useTranslator } from '@/lib/i18n/useLocale'
import { useAppMovil } from '@/lib/useAppMovil'
import { CampanaIcon, CampanaOffIcon, CompartirIcon, InstalarIcon } from './NavIcons'

/**
 * LA APP EN EL MÓVIL, lo primero del menú y centrado.
 *
 * Un solo hueco con un solo botón, y lo que ofrece depende de por dónde se haya
 * quedado el visitante: instalar, activar los avisos o quitarlos. Los tres momentos,
 * lo que decide cuál toca y por qué, están en `useAppMovil`; aquí sólo se pinta. La
 * misma máquina la usa el botón de la cuenta del taller, ver `AvisosMovil`.
 *
 * Van en el mismo sitio y no uno debajo del otro a propósito: es un único camino con
 * dos pasos, y enseñar el segundo antes de acabar el primero sería ofrecer algo que
 * en iOS todavía no puede funcionar —ahí los avisos sólo llegan si la web está en la
 * pantalla de inicio—.
 *
 * **El hueco sí puede quedarse vacío, y es a propósito**: en un navegador que no sabe
 * instalar no hay nada honesto que ofrecer, y en el menú de la web un botón apagado
 * con una explicación sería peor que nada. La cuenta del taller hace lo contrario
 * —allí el botón se queda apagado con el motivo—, y por eso el `impedimento` que
 * devuelve el hook aquí no se usa.
 *
 * **No lleva el distintivo de Google Play ni el de la App Store.** Esto es una web
 * instalable, no una app de tienda: no hay ficha que abrir, y esos distintivos
 * —que además sus dueños reservan para enlazar a su tienda— prometerían una descarga
 * que no existe. Cada plataforma lleva su icono y su verbo.
 */
export function AppMovil() {
  const t = useTranslator()
  const { oferta, instalando, trabajando, fallo, pulsable, pulsar } = useAppMovil()
  const [abierto, setAbierto] = useState(false)

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

  const Icono =
    oferta === 'avisos'
      ? CampanaIcon
      : oferta === 'apagar'
        ? CampanaOffIcon
        : oferta === 'ios'
          ? CompartirIcon
          : InstalarIcon

  // Los caminos que sólo se explican —iOS y el menú del navegador— despliegan la
  // instrucción debajo en vez de abrir nada.
  const alPulsar = () => (pulsable ? pulsar() : setAbierto((v) => !v))

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
