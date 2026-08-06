'use client'

import Link from 'next/link'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/cn'

const GAP = 32

const INTENT = 8

const RATIO = 0.2

const SNAP_MS = 420

const RUBBER = 0.3

type Deck = {
  index: number
  count: number
  go: (index: number) => void
  settle: (index: number) => void
  attach: (slide: ((index: number) => void) | null) => void
}

const DeckContext = createContext<Deck | null>(null)

function useDeck(): Deck {
  const deck = useContext(DeckContext)
  if (!deck) throw new Error('ShopDeck fuera de ShopDeckProvider')
  return deck
}

export function useShopDeck(): { index: number; go: (index: number) => void } {
  return useDeck()
}

export function ShopDeckProvider({
  count,
  initial,
  onChange,
  children,
}: {
  count: number
  initial: number
  onChange?: (index: number) => void
  children: ReactNode
}) {
  const [index, setIndex] = useState(initial)
  const slide = useRef<((index: number) => void) | null>(null)

  const aviso = useRef(onChange)
  useEffect(() => {
    aviso.current = onChange
  })

  const settle = useCallback((next: number) => {
    setIndex(next)
    aviso.current?.(next)
  }, [])

  const attach = useCallback((fn: ((index: number) => void) | null) => {
    slide.current = fn
  }, [])

  const go = useCallback(
    (next: number) => {
      if (next === index || next < 0 || next >= count) return
      if (Math.abs(next - index) === 1 && slide.current) slide.current(next)
      else settle(next)
    },
    [index, count, settle],
  )

  const deck = useMemo(
    () => ({ index, count, go, settle, attach }),
    [index, count, go, settle, attach],
  )

  return <DeckContext.Provider value={deck}>{children}</DeckContext.Provider>
}

export function ShopLink({
  href,
  index,
  active = false,
  className,
  children,
}: {
  href: string
  index: number
  active?: boolean
  className?: string
  children: ReactNode
}) {
  const deck = useDeck()

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        deck.go(index)
      }}
      className={className}
    >
      {children}
    </Link>
  )
}

const sinCambios = () => () => {}
const enElNavegador = () => true
const enElServidor = () => false

export function ShopDeck({ panels, className }: { panels: ReactNode[]; className?: string }) {
  const deck = useDeck()
  const view = useRef<HTMLDivElement>(null)
  const layer = useRef<HTMLDivElement>(null)

  const montado = useSyncExternalStore(sinCambios, enElNavegador, enElServidor)

  const gesto = useRef({ x: 0, y: 0, dx: 0, eje: '' as '' | 'x' | 'y', vivo: false })
  const ocupado = useRef(false)

  const mover = (px: number, ms = 0) => {
    const nodo = layer.current
    if (!nodo) return
    nodo.style.transition = ms ? `transform ${ms}ms var(--ease-out-soft)` : 'none'
    nodo.style.transform = `translate3d(${px}px, 0, 0)`
  }

  const slide = useCallback(
    (next: number) => {
      const ancho = (view.current?.clientWidth ?? 0) + GAP
      const paso = next - deck.index
      ocupado.current = true
      mover(-paso * ancho, SNAP_MS)

      window.setTimeout(() => {
        mover(0)
        ocupado.current = false
        deck.settle(next)
      }, SNAP_MS)
    },
    [deck],
  )

  useEffect(() => {
    deck.attach(slide)
    return () => deck.attach(null)
  }, [deck, slide])

  useEffect(() => {
    const nodo = view.current
    if (!nodo || nodo.getBoundingClientRect().top >= 0) return
    nodo.scrollIntoView({ block: 'start' })
  }, [deck.index])

  const onStart = (event: React.TouchEvent) => {
    if (ocupado.current || event.touches.length !== 1) return
    const toque = event.touches[0]
    if (!toque) return
    gesto.current = { x: toque.clientX, y: toque.clientY, dx: 0, eje: '', vivo: true }
  }

  const onMove = (event: React.TouchEvent) => {
    const g = gesto.current
    if (!g.vivo) return
    const toque = event.touches[0]
    if (!toque) return

    const dx = toque.clientX - g.x
    const dy = toque.clientY - g.y

    if (!g.eje) {
      if (Math.abs(dx) < INTENT && Math.abs(dy) < INTENT) return
      g.eje = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      if (g.eje === 'y') {
        g.vivo = false
        return
      }
    }

    const hay = dx < 0 ? deck.index < deck.count - 1 : deck.index > 0
    g.dx = hay ? dx : dx * RUBBER
    mover(g.dx)
  }

  const onEnd = () => {
    const g = gesto.current
    if (!g.vivo) return
    g.vivo = false
    if (g.eje !== 'x') return

    const ancho = view.current?.clientWidth ?? 0
    const paso = g.dx <= -ancho * RATIO ? 1 : g.dx >= ancho * RATIO ? -1 : 0
    const next = deck.index + paso

    if (paso && next >= 0 && next < deck.count) slide(next)
    else mover(0, SNAP_MS)
  }

  return (
    <div
      ref={view}
      className={cn('relative overflow-x-clip', className)}
      style={{ touchAction: 'pan-y pinch-zoom' }}
      onTouchStart={onStart}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
      onTouchCancel={onEnd}
    >
      <div ref={layer} className="relative will-change-transform">
        {panels.map((panel, i) => {
          const salto = i - deck.index
          if (salto === 0) {
            return (
              <div key={i} className="relative flow-root">
                {panel}
              </div>
            )
          }

          const vecina = Math.abs(salto) === 1
          return (
            <div
              key={i}
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0"
              style={{ transform: `translateX(calc(${salto * 100}% + ${salto * GAP}px))` }}
            >
              {montado && vecina ? panel : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
