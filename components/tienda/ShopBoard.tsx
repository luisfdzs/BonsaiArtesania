'use client'

import { ProductGrid } from '@/components/tienda/ProductGrid'
import { ShopDeck, ShopDeckProvider, ShopLink, useShopDeck } from '@/components/tienda/ShopDeck'
import { ShopRail } from '@/components/tienda/ShopRail'
import { cn } from '@/lib/cn'
import type { ProductCardData } from '@/content/products'
import type { Locale } from '@/lib/i18n/config'

export type ShopFamily = {
  key: string
  href: string
  label: string
  intro: string
  title: string
  notice: boolean
  items: ProductCardData[]
}

type Props = {
  locale: Locale
  familias: ShopFamily[]
  current: number
  navLabel: string
  notice: string
}

export function ShopBoard(props: Props) {
  const { familias, current } = props

  return (
    <ShopDeckProvider
      count={familias.length}
      initial={current}
      onChange={(index) => {
        const familia = familias[index]
        if (!familia) return
        window.history.replaceState(null, '', familia.href)
        document.title = familia.title
      }}
    >
      <Board {...props} />
    </ShopDeckProvider>
  )
}

function Board({ locale, familias, current, navLabel, notice }: Props) {
  const { index } = useShopDeck()

  const panels = familias.map((f, i) => (
    <ProductGrid key={f.key} items={f.items} locale={locale} priority={i === current} />
  ))

  return (
    <div className="page-gutter pt-16 md:pt-24">
      <header className="grid max-w-xl">
        {familias.map((f, i) => {
          const abierta = i === index

          return (
            <div
              key={f.key}
              aria-hidden={!abierta}
              className={cn(
                'col-start-1 row-start-1 transition-opacity duration-500 ease-(--ease-out-soft)',
                abierta ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            >
              {abierta ? (
                <h1 className="font-serif text-display">{f.label}</h1>
              ) : (
                <p className="font-serif text-display">{f.label}</p>
              )}
              <p className="mt-7 text-bark-soft">{f.intro}</p>

              {f.notice && (
                <p className="mt-8 bg-petal-soft p-5 text-small text-bark-soft">{notice}</p>
              )}
            </div>
          )
        })}
      </header>

      <nav aria-label={navLabel} className="shop-nav mt-12">
        <ShopRail follow={index}>
          {familias.map((f, i) => (
            <ShopLink key={f.key} href={f.href} index={i} active={i === index} className="shop-tab">
              {f.label}
            </ShopLink>
          ))}
        </ShopRail>
      </nav>

      <ShopDeck panels={panels} className="mt-28 scroll-mt-[9.75rem] md:scroll-mt-[10.75rem]" />
    </div>
  )
}
