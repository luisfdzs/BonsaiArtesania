'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { WaitVeil } from '@/components/ui/WaitVeil'

export type EstadoOption = { value: string; label: string }

type Props = {
  base: string
  value: string
  options: EstadoOption[]
  label: string
  waiting: string
}

export function EstadoFiltro({ base, value, options, label, waiting }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <div className="mx-auto max-w-72">
      <label className="field-label text-center" htmlFor="estado">
        {label}
      </label>
      <select
        id="estado"
        name="estado"
        value={value}
        onChange={(event) => {
          const next = event.target.value
          start(() => router.push(next === 'pendientes' ? base : `${base}?estado=${next}`))
        }}
        className="field text-center"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {pending && <WaitVeil label={waiting} />}
    </div>
  )
}
