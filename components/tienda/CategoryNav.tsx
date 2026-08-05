import { cn } from '@/lib/cn'
import { categories, productsByCategory } from '@/content/products'
import { translator, type Locale } from '@/lib/i18n/config'
import { path } from '@/lib/i18n/routes'
import { ShopRail } from './ShopRail'
import { ShopSwipe } from './ShopSwipe'
import { ShopTab } from './ShopTab'

type Props = {
  current?: string
  outside?: boolean
  locale: Locale
  className?: string
}

export function CategoryNav({ current, outside = false, locale, className }: Props) {
  const t = translator(locale)
  const visible = categories.filter((category) => productsByCategory(category.key).length > 0)

  const hrefs = [
    path(locale, '/tienda'),
    ...visible.map((category) => path(locale, `/tienda/categoria/${category.key}`)),
  ]
  const index = current ? visible.findIndex((category) => category.key === current) + 1 : 0

  return (
    <nav
      aria-label={t({ es: 'Familias de la tienda', gl: 'Familias da tenda' })}
      className={cn('shop-nav', className)}
    >
      <ShopRail>
        <ShopTab
          href={path(locale, '/tienda')}
          label={t({ es: 'Todo', gl: 'Todo' })}
          active={!current && !outside}
        />

        {visible.map((category) => (
          <ShopTab
            key={category.key}
            href={path(locale, `/tienda/categoria/${category.key}`)}
            label={t(category.label)}
            active={category.key === current}
          />
        ))}
      </ShopRail>

      {!outside && <ShopSwipe hrefs={hrefs} current={index} />}
    </nav>
  )
}
