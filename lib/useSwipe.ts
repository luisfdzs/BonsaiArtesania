'use client'

import { useEffect, useRef, type RefObject } from 'react'

const MIN_X = 60
const MAX_Y = 45

export function useSwipe(
  onSwipe: (step: 1 | -1) => void,
  { dentro, ignorar }: { dentro?: RefObject<HTMLElement | null>; ignorar?: string } = {},
): void {
  const handler = useRef(onSwipe)
  useEffect(() => {
    handler.current = onSwipe
  }, [onSwipe])

  useEffect(() => {
    const node: HTMLElement | Document = dentro?.current ?? document
    let x = 0
    let y = 0
    let valid = false

    const onStart = (event: TouchEvent) => {
      valid = event.touches.length === 1
      if (!valid) return

      const target = event.target
      if (ignorar && target instanceof Element && target.closest(ignorar)) {
        valid = false
        return
      }

      const touch = event.touches[0]
      if (!touch) {
        valid = false
        return
      }
      x = touch.clientX
      y = touch.clientY
    }

    const onEnd = (event: TouchEvent) => {
      if (!valid) return
      valid = false

      const touch = event.changedTouches[0]
      if (!touch) return

      const dx = touch.clientX - x
      const dy = touch.clientY - y
      if (Math.abs(dx) < MIN_X || Math.abs(dy) > MAX_Y) return

      handler.current(dx < 0 ? 1 : -1)
    }

    node.addEventListener('touchstart', onStart as EventListener, { passive: true })
    node.addEventListener('touchend', onEnd as EventListener, { passive: true })

    return () => {
      node.removeEventListener('touchstart', onStart as EventListener)
      node.removeEventListener('touchend', onEnd as EventListener)
    }
  }, [dentro, ignorar])
}
