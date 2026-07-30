import Link from 'next/link'
import { Leaf } from '@/components/ui/Media'
import { HomeIcon } from '@/components/layout/NavIcons'

export default function NotFound() {
  return (
    <div className="page-gutter grid min-h-[60svh] place-items-center py-24 text-center">
      <div>
        <Leaf className="mx-auto h-10 w-10 text-sage" />
        <h1 className="mt-8 font-serif text-title">Esta página se marchitó</h1>
        <p className="mt-4 text-bark-soft">O quizá nunca llegó a florecer.</p>
        {/* La misma casa de la barra de navegación en lugar del rótulo: sin
            texto el botón se queda redondo, así que se le quita el relleno
            ancho y se le iguala el ancho al alto. El destino lo dice ahora
            `aria-label`. */}
        <Link href="/" aria-label="Volver al inicio" className="btn mt-10 w-11 px-0">
          <HomeIcon className="h-5 w-5" />
        </Link>
      </div>
    </div>
  )
}
