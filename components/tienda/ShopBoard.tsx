'use client'

import { ProductGrid } from '@/components/tienda/ProductGrid'
import { ShopDeck, ShopDeckProvider, ShopLink, useShopDeck } from '@/components/tienda/ShopDeck'
import { ShopRail } from '@/components/tienda/ShopRail'
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
  const familia = familias[index]

  const panels = familias.map((f, i) => (
    <ProductGrid key={f.key} items={f.items} locale={locale} priority={i === current} />
  ))

  return (
    <div className="page-gutter pt-16 md:pt-24">
      <header className="max-w-xl">
        <h1 className="font-serif text-display">{familia?.label}</h1>
        <p className="mt-7 text-bark-soft">{familia?.intro}</p>

        {familia?.notice && (
          <p className="mt-8 bg-petal-soft p-5 text-small text-bark-soft">{notice}</p>
        )}
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

      <ShopDeck panels={panels} className="mt-16" />
    </div>
  )
}
