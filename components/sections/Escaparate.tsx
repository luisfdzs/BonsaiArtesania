'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ShopRail } from '@/components/tienda/ShopRail'
import { ProductGrid } from '@/components/tienda/ProductGrid'
import { ShopPanel } from '@/components/tienda/ShopPanel'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/cn'
import type { ProductCardData } from '@/content/products'
import type { Locale } from '@/lib/i18n/config'
import { useSwipe } from '@/lib/useSwipe'

const MAX_WAIT = 2_000

function esperarFotos(node: HTMLElement | null, listo: () => void): () => void {
  const fotos = node ? [...node.querySelectorAll('img')] : []

  const pendientes = fotos.filter((foto) => {
    if (foto.complete) return false
    const caja = foto.getBoundingClientRect()
    return caja.bottom > 0 && caja.top < window.innerHeight
  })

  let quedan = pendientes.length
  const una = () => {
    quedan -= 1
    if (quedan <= 0) listo()
  }

  pendientes.forEach((foto) => {
    foto.addEventListener('load', una, { once: true })
    foto.addEventListener('error', una, { once: true })
  })

  const timer = setTimeout(listo, pendientes.length ? MAX_WAIT : 0)

  return () => {
    clearTimeout(timer)
    pendientes.forEach((foto) => {
      foto.removeEventListener('load', una)
      foto.removeEventListener('error', una)
    })
  }
}

export type EscaparateFamilia = {
  key: string
  label: string
  note?: string
  href: string
  verMasLabel: string
  items: ProductCardData[]
}

export function Escaparate({
  familias,
  locale,
  navLabel,
  verMas,
  personalizar,
  personalizarHref,
}: {
  familias: EscaparateFamilia[]
  locale: Locale
  navLabel: string
  verMas: string
  personalizar: string
  personalizarHref: string
}) {
  const [current, setCurrent] = useState(familias[0]?.key)
  const familia = familias.find((f) => f.key === current) ?? familias[0]
  const panel = useRef<HTMLDivElement>(null)

  const [waiting, setWaiting] = useState(false)

  useEffect(() => {
    if (!waiting) return
    return esperarFotos(panel.current, () => setWaiting(false))
  }, [waiting, current])

  const elegir = (key: string) => {
    if (key === current) return
    setWaiting(true)
    setCurrent(key)
    panel.current?.scrollIntoView({ block: 'start' })
  }

  useSwipe(
    (step) => {
      const index = familias.findIndex((f) => f.key === current)
      const next = familias[index + step]
      if (next) elegir(next.key)
    },
    { dentro: panel, ignorar: '.shop-rail' },
  )

  if (!familia) return null

  const hueco = (3 - (familia.items.length % 3)) % 3

  const botones = {
    href: familia.href,
    verMas,
    verMasLabel: familia.verMasLabel,
    personalizar,
    personalizarHref,
  }

  return (
    <>
      <div role="tablist" aria-label={navLabel} className="shop-nav mt-10">
        <ShopRail>
          {familias.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              id={`escaparate-tab-${f.key}`}
              aria-selected={f.key === familia.key}
              aria-controls="escaparate-panel"
              tabIndex={f.key === familia.key ? 0 : -1}
              onClick={() => elegir(f.key)}
              onKeyDown={(event) => {
                const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
                if (!step) return
                event.preventDefault()
                const index = familias.findIndex((x) => x.key === familia.key)
                const next = familias[(index + step + familias.length) % familias.length]
                if (!next) return
                elegir(next.key)
                document.getElementById(`escaparate-tab-${next.key}`)?.focus()
              }}
              className="shop-tab tap"
            >
              {f.label}
            </button>
          ))}
        </ShopRail>
      </div>

      <div
        ref={panel}
        role="tabpanel"
        id="escaparate-panel"
        aria-labelledby={`escaparate-tab-${familia.key}`}
        className="mt-16 scroll-mt-[7.75rem] md:scroll-mt-[8.75rem]"
      >
        <div className="flex items-baseline justify-between gap-6 border-b border-line pb-4">
          <h3 className="eyebrow">
            <Link href={familia.href} className="link-underline tap">
              {familia.label}
            </Link>
          </h3>
          {familia.note && <p className="text-right text-small text-bark-faint">{familia.note}</p>}
        </div>

        <ShopPanel pending={waiting}>
          <ProductGrid
            items={familia.items}
            locale={locale}
            priority={familia.key === familias[0]?.key}
            trailing={
              hueco > 0 && (
                <Reveal
                  className={cn(
                    'hidden self-center lg:flex lg:flex-col lg:items-center lg:gap-3',
                    hueco === 2 && 'lg:col-span-2',
                  )}
                >
                  <Botones {...botones} />
                </Reveal>
              )
            }
          />
        </ShopPanel>
      </div>

      <Reveal
        className={cn(
          'mt-16 flex flex-wrap justify-center gap-x-2 gap-y-3',
          hueco > 0 && 'lg:hidden',
        )}
      >
        <Botones {...botones} />
      </Reveal>
    </>
  )
}

function Botones({
  href,
  verMas,
  verMasLabel,
  personalizar,
  personalizarHref,
}: {
  href: string
  verMas: string
  verMasLabel: string
  personalizar: string
  personalizarHref: string
}) {
  return (
    <>
      <Link href={href} className="btn" aria-label={verMasLabel}>
        {verMas}
      </Link>
      <Link href={personalizarHref} className="btn btn-quiet">
        {personalizar}
      </Link>
    </>
  )
}
