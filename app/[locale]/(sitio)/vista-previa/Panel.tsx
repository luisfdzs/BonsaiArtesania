'use client'

import { useAjustesCompartidos } from './compartido'
import { MODELOS } from './modelos'
import type { AjustesMazo } from '@/components/tienda/motorDelMazo'
import { cn } from '@/lib/cn'

/**
 * Los mandos, en su propia pestaña. Lo que se toca aquí llega a la pestaña del
 * catálogo al momento, así que se puede tener la tienda limpia en una y los
 * diales en la otra. Ver `compartido`.
 */
export function Panel() {
  const [ajustes, publicar] = useAjustesCompartidos()
  const cambia = (parte: Partial<AjustesMazo>) => publicar({ ...ajustes, ...parte })

  return (
    <div className="page-gutter py-10">
      <h1 className="font-serif text-title leading-tight">Mandos del catálogo</h1>
      <p className="mt-3 text-small text-bark-soft">
        Deja <code>/es/vista-previa</code> abierta en otra pestaña: lo que muevas aquí llega allí al
        momento.
      </p>

      <p className="eyebrow mt-10 text-bark-faint">Modelo</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {MODELOS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => cambia({ modelo: m.id })}
            className={cn(
              'rounded-full border px-4 py-2 text-micro uppercase tracking-[0.18em] transition-colors duration-500 ease-(--ease-out-soft)',
              ajustes.modelo === m.id
                ? 'border-transparent bg-sage-deep text-linen'
                : 'border-line text-bark-faint',
            )}
          >
            {m.nombre}
          </button>
        ))}
      </div>
      <p className="mt-3 text-small text-bark-soft">
        {MODELOS.find((m) => m.id === ajustes.modelo)?.nota}
      </p>

      <p className="eyebrow mt-10 text-bark-faint">Cómo se va</p>
      <div className="mt-4 grid gap-5">
        <Dial
          etiqueta="Se apaga en"
          unidad=" de familia"
          valor={ajustes.desvanecido}
          min={0.2}
          max={1}
          paso={0.05}
          onChange={(desvanecido) => cambia({ desvanecido })}
        />
        <Dial
          etiqueta="Desenfoque"
          unidad=" px"
          valor={ajustes.desenfoque}
          min={0}
          max={20}
          paso={0.5}
          onChange={(desenfoque) => cambia({ desenfoque })}
        />
        <Dial
          etiqueta="Escala mínima"
          valor={ajustes.escalaMinima}
          min={0.5}
          max={1}
          paso={0.02}
          onChange={(escalaMinima) => cambia({ escalaMinima })}
        />
        <Dial
          etiqueta="Velo"
          valor={ajustes.velo}
          min={0}
          max={1}
          paso={0.05}
          onChange={(velo) => cambia({ velo })}
        />
        <Dial
          etiqueta="Esquina"
          unidad=" px"
          valor={ajustes.radio}
          min={0}
          max={48}
          paso={1}
          onChange={(radio) => cambia({ radio })}
        />
        <Dial
          etiqueta="Perspectiva"
          unidad=" anchos"
          valor={ajustes.perspectiva}
          min={0.8}
          max={5}
          paso={0.1}
          onChange={(perspectiva) => cambia({ perspectiva })}
        />
      </div>

      <p className="eyebrow mt-10 text-bark-faint">El tacto</p>
      <div className="mt-4 grid gap-5">
        <Dial
          etiqueta="Aterrizaje"
          unidad=" ms"
          valor={ajustes.aterrizaje}
          min={0}
          max={600}
          paso={10}
          onChange={(aterrizaje) => cambia({ aterrizaje })}
        />
        <Dial
          etiqueta="Proyección del impulso"
          valor={ajustes.proyeccion}
          min={20}
          max={320}
          paso={10}
          onChange={(proyeccion) => cambia({ proyeccion })}
        />
        <Dial
          etiqueta="Umbral del gesto"
          unidad=" pantallas"
          valor={ajustes.umbral}
          min={0.06}
          max={0.5}
          paso={0.01}
          onChange={(umbral) => cambia({ umbral })}
        />
        <Dial
          etiqueta="Vuelo máximo"
          unidad=" familias"
          valor={ajustes.vuelo}
          min={1}
          max={5}
          paso={1}
          onChange={(vuelo) => cambia({ vuelo })}
        />
      </div>

      <pre className="mt-8 overflow-x-auto rounded-[1rem] border border-line bg-[color-mix(in_srgb,var(--color-linen-deep)_50%,transparent)] p-4 text-[0.6875rem] leading-relaxed text-bark-soft">
        {JSON.stringify(ajustes, null, 2)}
      </pre>
    </div>
  )
}

function Dial({
  etiqueta,
  unidad = '',
  valor,
  min,
  max,
  paso,
  onChange,
}: {
  etiqueta: string
  unidad?: string
  valor: number
  min: number
  max: number
  paso: number
  onChange: (valor: number) => void
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-small text-bark-soft">
        {etiqueta}
        <span className="font-serif text-base text-bark-faint">
          {valor >= 10 ? Math.round(valor) : valor.toFixed(valor < 0.99 ? 3 : 2)}
          {unidad}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={paso}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1 w-full appearance-none rounded-full bg-line accent-sage-deep"
      />
    </label>
  )
}
