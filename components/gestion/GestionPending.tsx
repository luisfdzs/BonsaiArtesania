'use client'

import { useLinkStatus } from 'next/link'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { FlowerLoader } from '@/components/ui/FlowerLoader'

type Pending = {
  label: string | null
  announce: (label: string | null) => void
}

const PendingContext = createContext<Pending>({ label: null, announce: () => {} })

export function GestionPendingProvider({ children }: { children: React.ReactNode }) {
  const [label, setLabel] = useState<string | null>(null)
  const announce = useCallback((next: string | null) => setLabel(next), [])
  const value = useMemo(() => ({ label, announce }), [label, announce])

  return <PendingContext.Provider value={value}>{children}</PendingContext.Provider>
}

export function GestionPendingSignal({ label }: { label: string }) {
  const { pending } = useLinkStatus()
  const { announce } = useContext(PendingContext)

  useEffect(() => {
    if (!pending) return
    announce(label)
    return () => announce(null)
  }, [pending, label, announce])

  return null
}

export function GestionPendingSlot({ children }: { children: React.ReactNode }) {
  const { label } = useContext(PendingContext)

  if (label) return <FlowerLoader label={label} />

  return children
}
