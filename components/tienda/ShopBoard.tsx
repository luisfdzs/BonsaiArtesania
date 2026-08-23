'use client'

import { FamilyFlow } from '@/components/tienda/FamilyFlow'
import { ProductGrid } from '@/components/tienda/ProductGrid'
import { ShopDeck, ShopDeckProvider, bucle, useShopDeck } from '@/components/tienda/ShopDeck'
import type { PiezaTarjeta } from '@/lib/catalogo'
import type { Locale } from '@/lib/i18n/config'
import type { Image } from '@/lib/media'

export type ShopFamily = {
  key: string
  href: string
  label: string
  title: string
  notice: boolean
  /** La primera foto de la familia: la miniatura de la barra. */
  thumb: Image | null
  items: PiezaTarjeta[]
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
  const { index, go, seguir } = useShopDeck()

  const abierta = familias[index]

  const panels = familias.map((f, i) => (
    <ProductGrid key={f.key} items={f.items} locale={locale} priority={i === current} />
  ))

  return (
    <div className="page-gutter">
      {/* El rótulo y la línea de presentación de la familia ya no se pintan: el
          catálogo empieza en la primera fila de piezas. Lo que se dice aquí lo
          dice la barra —qué familia está abierta— y las propias fotos. Pero la
          página sigue necesitando un encabezado: sin él, un lector de pantalla
          entra en la tienda sin saber en qué familia está. Va oculto a la vista y
          cambia con la familia abierta, igual que el título del documento. */}
      <h1 className="sr-only">{abierta?.label}</h1>

      <div className="shop-nav">
        <FamilyFlow
          familias={familias}
          index={index}
          onSelect={(i) => go(bucle(i, familias.length))}
          navLabel={navLabel}
          arrastre={seguir}
        />
      </div>

      {/* El aviso de que la tienda está cerrada era lo último de la cabecera;
          ahora abre la familia, que es donde se lee antes de mirar las piezas. */}
      {abierta?.notice && (
        <p className="mt-8 bg-petal-soft p-5 text-small text-bark-soft">{notice}</p>
      )}

      <ShopDeck
        panels={panels}
        className="shop-deck mt-8 scroll-mt-[9.75rem] md:scroll-mt-[10.75rem]"
      />
    </div>
  )
}
