'use client'

import { useSwipe } from '@/lib/useSwipe'
import { useShopSwitch } from './ShopSwitch'

export function ShopSwipe({ hrefs, current }: { hrefs: string[]; current: number }) {
  const shop = useShopSwitch()

  useSwipe(
    (step) => {
      const next = hrefs[current + step]
      if (next) shop?.go(next)
    },
    { ignorar: '.shop-rail' },
  )

  return null
}
