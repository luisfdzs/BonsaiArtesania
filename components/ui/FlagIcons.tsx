import type { ReactElement } from 'react'
import type { Locale } from '@/lib/i18n/config'

type FlagProps = { className?: string }

const common = { viewBox: '0 0 30 20' } as const

export function SpainFlag({ className }: FlagProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <rect width="30" height="20" fill="#aa151b" />
      <rect y="5" width="30" height="10" fill="#f1bf00" />
    </svg>
  )
}

export function GaliciaFlag({ className }: FlagProps) {
  return (
    <svg {...common} aria-hidden className={className}>
      <rect width="30" height="20" fill="#ffffff" />
      <polygon points="1.28,-1.91 31.28,18.09 28.72,21.91 -1.28,1.91" fill="#0072bb" />
    </svg>
  )
}

export const localeFlags: Record<Locale, (props: FlagProps) => ReactElement> = {
  es: SpainFlag,
  gl: GaliciaFlag,
}
