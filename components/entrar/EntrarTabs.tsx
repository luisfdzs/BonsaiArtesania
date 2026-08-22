'use client'

import Link from 'next/link'
import { type CSSProperties, type TouchEvent, useRef, useState, useTransition } from 'react'
import { GoogleButton } from '@/components/entrar/GoogleButton'
import { LoginForm } from '@/components/entrar/LoginForm'
import { RequestCodeForm } from '@/components/entrar/RequestCodeForm'
import { FlowerLoader } from '@/components/ui/FlowerLoader'
import { path } from '@/lib/i18n/routes'
import { useLocale, useTranslator } from '@/lib/i18n/useLocale'

type Props = {
  creating: boolean
  backTo: string
  entrarHref: string
  crearHref: string
  google: boolean
  error?: string
}

/**
 * Cuánto tiene que recorrer el dedo para que cuente como cambio de pestaña, y
 * cuánto más horizontal que vertical tiene que ser el recorrido.
 *
 * El umbral en píxeles y no en fracción del ancho: lo que decide si un gesto se
 * ha hecho a propósito es cuánto se ha movido la mano, y eso no crece con la
 * pantalla. 56px es aproximadamente el ancho de un pulgar.
 *
 * Y el gesto tiene que ser vez y media más ancho que alto. Sin esa comprobación,
 * bajar por la página con el dedo un poco torcido cambia de pestaña por el
 * camino; con ella, para cambiar hay que ir de lado a propósito.
 */
const SWIPE_MIN = 56
const SWIPE_RATIO = 1.5

/**
 * Entrar y crear cuenta.
 *
 * Las dos pestañas son dos cosas distintas: a la izquierda se entra con la
 * contraseña de siempre, y a la derecha se empieza un alta que pasa por el buzón
 * una única vez, la del día en que se crea la cuenta.
 *
 * Todo vive dentro de una tarjeta de filete verde —`auth-card`—, con las pestañas
 * en su borde de arriba. Antes eran dos rótulos sueltos sobre el lino y un
 * formulario debajo, sin nada que dijera dónde acababa la pantalla; la caja le da
 * un sitio a lo que se escribe y separa la elección —qué quiero hacer— de la
 * tarea —escribir el correo—.
 *
 * En el móvil se cambia de pestaña también deslizando de lado, que es el gesto
 * que se espera cuando dos cosas están una al lado de la otra. El deslizamiento
 * no se sigue con el dedo, sólo se cuenta al soltar: seguirlo obligaría a tener
 * los dos formularios montados a la vez, y dos campos de correo y dos de
 * contraseña en el DOM hacen que el llavero del navegador ofrezca la contraseña
 * en el sitio equivocado. Lo que sí cuenta el gesto es de qué lado viene el
 * contenido, y eso lo dice la animación de `auth-panel`.
 *
 * Las pestañas siguen siendo enlaces de verdad, con su `href`, así que la pantalla
 * funciona sin JavaScript: sin él el `onClick` no corre y el enlace navega a la
 * otra pestaña, que es la misma página con `?modo=crear`.
 */
export function EntrarTabs({
  creating: initial,
  backTo,
  entrarHref,
  crearHref,
  google,
  error,
}: Props) {
  const [creating, setCreating] = useState(initial)
  // De qué lado entra el contenido: 1 desde la derecha, -1 desde la izquierda, 0
  // en el primer pintado, cuando no se viene de ninguna parte y no hay nada que
  // desplazar. Ver `auth-slide` en globals.css.
  const [from, setFrom] = useState(0)
  const [pending, startTransition] = useTransition()
  const locale = useLocale()
  const t = useTranslator()

  // Dónde empezó el dedo. En una `ref` y no en estado: cambia en cada
  // `touchmove` que no nos interesa y no tiene que repintar nada.
  const toque = useRef<{ x: number; y: number } | null>(null)

  const crearCuenta = t({ es: 'Crear cuenta', gl: 'Crear conta' })
  const iniciarSesion = t({ es: 'Iniciar sesión', gl: 'Iniciar sesión' })

  const ir = (siguiente: boolean) => {
    if (siguiente === creating) return
    // Crear cuenta está a la derecha, así que al ir hacia ella el contenido
    // entra por la derecha, y al volver, por la izquierda.
    setFrom(siguiente ? 1 : -1)
    startTransition(() => {
      setCreating(siguiente)
      window.history.replaceState(null, '', siguiente ? crearHref : entrarHref)
    })
  }

  const empezarToque = (event: TouchEvent) => {
    // Con dos dedos encima no se está cambiando de pestaña, se está haciendo
    // zoom; y sin punto de partida, el `touchend` no hace nada.
    toque.current =
      event.touches.length === 1 && event.touches[0]
        ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
        : null
  }

  const soltarToque = (event: TouchEvent) => {
    const inicio = toque.current
    const fin = event.changedTouches[0]
    toque.current = null
    if (!inicio || !fin) return

    const dx = fin.clientX - inicio.x
    const dy = fin.clientY - inicio.y
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy) * SWIPE_RATIO) return

    // Arrastrar hacia la izquierda trae lo que está a la derecha, como en
    // cualquier carrusel: el contenido sigue al dedo.
    ir(dx < 0)
  }

  const pestaña = (label: string, href: string, destino: boolean) => (
    <Link
      href={href}
      aria-current={destino === creating ? 'page' : undefined}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        ir(destino)
      }}
      className="shop-tab tap flex-1 justify-center"
    >
      {label}
    </Link>
  )

  return (
    <div
      className="auth-card"
      onTouchStart={empezarToque}
      onTouchEnd={soltarToque}
      onTouchCancel={() => {
        toque.current = null
      }}
    >
      <div className="auth-tabs">
        {pestaña(iniciarSesion, entrarHref, false)}
        {pestaña(crearCuenta, crearHref, true)}
      </div>

      <div aria-busy={pending || undefined} className="relative">
        {/* La `key` es lo que hace que el bloque se rehaga al cambiar de pestaña, y
            con él arranque otra vez la animación de entrada. Sin ella React
            reutilizaría el nodo y el contenido cambiaría de golpe. */}
        <div
          key={creating ? 'crear' : 'entrar'}
          className="auth-panel"
          style={{ '--auth-from': from } as CSSProperties}
        >
          {/* El rótulo de la pestaña abierta ya está arriba, así que el título no
              tiene que gritarlo otra vez: va en `text-lead` y no en `text-title`,
              que dentro de una tarjeta de 28rem se comía el formulario. */}
          <h1 className="mt-8 font-serif text-lead">{creating ? crearCuenta : iniciarSesion}</h1>

          <p className="mt-4 text-bark-soft">
            {creating
              ? t({
                  es: 'Con una cuenta guardas tus direcciones de envío y puedes seguir tus pedidos. Escribe tu correo y te envío un código para confirmarlo.',
                  gl: 'Cunha conta gardas os teus enderezos de envío e podes seguir os teus pedidos. Escribe o teu correo e envíoche un código para confirmalo.',
                })
              : t({
                  es: 'Entra con el correo y la contraseña de tu cuenta.',
                  gl: 'Entra co correo e o contrasinal da túa conta.',
                })}
          </p>

          {error && (
            <p className="field-error mt-6" role="alert">
              {error}
            </p>
          )}

          {google && <GoogleButton backTo={backTo} />}

          {creating ? (
            <RequestCodeForm purpose="alta" backTo={backTo} />
          ) : (
            <LoginForm backTo={backTo} />
          )}

          {creating ? (
            <p className="mt-8 text-small text-bark-faint">
              {t({
                es: 'Al crear la cuenta, tus datos se tratan como se explica en',
                gl: 'Ao crear a conta, os teus datos trátanse como se explica en',
              })}{' '}
              <Link href={path(locale, '/legal/privacidad')} className="link-underline">
                {t({ es: 'privacidad', gl: 'privacidade' })}
              </Link>
              .
            </p>
          ) : (
            <p className="mt-8 text-small text-bark-faint">
              {t({ es: '¿Todavía no tienes cuenta?', gl: 'Aínda non tes conta?' })}{' '}
              <Link
                href={crearHref}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                  event.preventDefault()
                  ir(true)
                }}
                className="link-underline"
              >
                {t({ es: 'Créala en un minuto', gl: 'Créaa nun minuto' })}
              </Link>
              .
            </p>
          )}
        </div>

        {/* La flor va fuera del bloque que anima: dentro se desplazaría con él, y
            lo que tiene que hacer es quedarse quieta encima. */}
        {pending && (
          <div className="absolute inset-0 z-20 flex items-start justify-center overflow-hidden bg-linen/95">
            <FlowerLoader label={t({ es: 'Cambiando de pestaña', gl: 'Cambiando de lapela' })} />
          </div>
        )}
      </div>
    </div>
  )
}
