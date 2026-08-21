'use client'

import Link from 'next/link'
import { FamilyFlow } from '@/components/tienda/FamilyFlow'
import { ProductGrid } from '@/components/tienda/ProductGrid'
import { ShopDeck, ShopDeckProvider, bucle, useShopDeck } from '@/components/tienda/ShopDeck'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/cn'
import type { ProductCardData } from '@/content/products'
import type { Locale } from '@/lib/i18n/config'
import type { Image } from '@/lib/media'

export type EscaparateFamilia = {
  key: string
  label: string
  href: string
  verMasLabel: string
  /** La primera foto de la familia: la miniatura de la barra. */
  thumb: Image | null
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
  const { index, go, seguir } = useShopDeck()
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
      {/* La misma barra que la tienda: `FamilyFlow`. Aquí las familias no son
          enlaces —no se sale de la portada, se cambia lo que enseña el mazo—, así
          que la lista desplegable las pinta como botones. Ver `FamilyFlow`. */}
      <div className="shop-nav">
        <FamilyFlow
          familias={familias}
          index={index}
          onSelect={(i) => elegir(bucle(i, familias.length))}
          navLabel={navLabel}
          arrastre={seguir}
        />
      </div>

      <div className="mt-8">
        <ShopDeck
          panels={panels}
          className="shop-deck scroll-mt-[9.75rem] md:scroll-mt-[10.75rem]"
        />
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
