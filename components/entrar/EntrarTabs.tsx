'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { LoginForm } from '@/components/entrar/LoginForm'
import { RequestCodeForm } from '@/components/entrar/RequestCodeForm'
import { FlowerLoader } from '@/components/ui/FlowerLoader'
import { cn } from '@/lib/cn'
import { path } from '@/lib/i18n/routes'
import { useLocale, useTranslator } from '@/lib/i18n/useLocale'

type Props = {
  creating: boolean
  backTo: string
  entrarHref: string
  crearHref: string
}

export function EntrarTabs({ creating: initial, backTo, entrarHref, crearHref }: Props) {
  const [creating, setCreating] = useState(initial)
  const [pending, startTransition] = useTransition()
  const locale = useLocale()
  const t = useTranslator()

  const crearCuenta = t({ es: 'Crear cuenta', gl: 'Crear conta' })
  const iniciarSesion = t({ es: 'Iniciar sesión', gl: 'Iniciar sesión' })

  const ir = (siguiente: boolean) => {
    if (siguiente === creating) return
    startTransition(() => {
      setCreating(siguiente)
      window.history.replaceState(null, '', siguiente ? crearHref : entrarHref)
    })
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
      className={cn('tap text-small', destino === creating ? 'text-bark' : 'text-bark-faint')}
    >
      {label}
    </Link>
  )

  return (
    <>
      <div className="flex justify-center gap-8 border-b border-line pb-4">
        {pestaña(iniciarSesion, entrarHref, false)}
        {pestaña(crearCuenta, crearHref, true)}
      </div>

      <div aria-busy={pending || undefined} className="relative">
        <h1 className="mt-10 font-serif text-title">{creating ? crearCuenta : iniciarSesion}</h1>

        <p className="mt-5 text-bark-soft">
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

        {pending && (
          <div className="absolute inset-0 z-20 flex items-start justify-center overflow-hidden bg-linen/95">
            <FlowerLoader label={t({ es: 'Cambiando de pestaña', gl: 'Cambiando de lapela' })} />
          </div>
        )}
      </div>
    </>
  )
}
