'use client'

import Link from 'next/link'
import { ProductGrid } from '@/components/tienda/ProductGrid'
import { ShopDeck, ShopDeckProvider, useShopDeck } from '@/components/tienda/ShopDeck'
import { ShopRail } from '@/components/tienda/ShopRail'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/cn'
import type { ProductCardData } from '@/content/products'
import type { Locale } from '@/lib/i18n/config'

export type EscaparateFamilia = {
  key: string
  label: string
  href: string
  verMasLabel: string
  items: ProductCardData[]
}

type Props = {
  familias: EscaparateFamilia[]
  locale: Locale
  navLabel: string
  verMas: string
  personalizar: string
  personalizarHref: string
}

export function Escaparate(props: Props) {
  return (
    <ShopDeckProvider count={props.familias.length} initial={0}>
      <Vitrina {...props} />
    </ShopDeckProvider>
  )
}

function Vitrina({ familias, locale, navLabel, verMas, personalizar, personalizarHref }: Props) {
  const { index, go } = useShopDeck()
  const familia = familias[index]

  const elegir = (i: number) => {
    if (i === index) return
    go(i)
  }

  if (!familia) return null

  const botones = (f: EscaparateFamilia) => ({
    href: f.href,
    verMas,
    verMasLabel: f.verMasLabel,
    personalizar,
    personalizarHref,
  })

  const hueco = (f: EscaparateFamilia) => (3 - (f.items.length % 3)) % 3

  const panels = familias.map((f, i) => {
    const libre = hueco(f)

    return (
      <div key={f.key}>
        <ProductGrid
          items={f.items}
          locale={locale}
          priority={i === 0}
          className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
          trailing={
            libre > 0 && (
              <Reveal
                className={cn(
                  'hidden self-center lg:flex lg:flex-col lg:items-center lg:gap-3',
                  libre === 2 && 'lg:col-span-2',
                )}
              >
                <Botones {...botones(f)} />
              </Reveal>
            )
          }
        />
        <Reveal
          className={cn(
            'mt-16 flex flex-wrap justify-center gap-x-2 gap-y-3',
            libre > 0 && 'lg:hidden',
          )}
        >
          <Botones {...botones(f)} />
        </Reveal>
      </div>
    )
  })

  return (
    <>
      <div role="tablist" aria-label={navLabel} className="shop-nav">
        <ShopRail follow={index}>
          {familias.map((f, i) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              id={`escaparate-tab-${f.key}`}
              aria-selected={i === index}
              aria-controls="escaparate-panel"
              tabIndex={i === index ? 0 : -1}
              onClick={() => elegir(i)}
              onKeyDown={(event) => {
                const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
                if (!step) return
                event.preventDefault()
                const siguiente = (index + step + familias.length) % familias.length
                const next = familias[siguiente]
                if (!next) return
                elegir(siguiente)
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
        role="tabpanel"
        id="escaparate-panel"
        aria-labelledby={`escaparate-tab-${familia.key}`}
        className="mt-14"
      >
        <ShopDeck panels={panels} className="scroll-mt-[9.75rem] md:scroll-mt-[10.75rem]" />
      </div>
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
