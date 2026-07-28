import Link from 'next/link'
import { Leaf } from '@/components/ui/Media'

export default function NotFound() {
  return (
    <div className="page-gutter grid min-h-[60svh] place-items-center py-24 text-center">
      <div>
        <Leaf className="mx-auto h-10 w-10 text-sage" />
        <h1 className="mt-8 font-serif text-title">Esta página se marchitó</h1>
        <p className="mt-4 text-bark-soft">O quizá nunca llegó a florecer.</p>
        <Link href="/" className="btn mt-10">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
