import Link from 'next/link'

/**
 * VOLVER
 *
 * Una flecha en un círculo y, al lado, el nombre del sitio al que se vuelve.
 *
 * Las dos cosas hacen falta y por razones distintas: la flecha se reconoce sin
 * leerla —es el gesto de «atrás» en cualquier pantalla— y el nombre dice a dónde,
 * que es lo que no se sabe cuando llevas un rato editando y ya no recuerdas de qué
 * familia veníass. Un «Volver» a secas obliga a probar para averiguarlo.
 *
 * Es un enlace de verdad y no un `history.back()`: quien llega aquí desde un
 * enlace guardado, o desde la barra de direcciones, no tiene historia a la que
 * volver, y un botón que a veces no hace nada es peor que no tenerlo.
 */
export function BotonAtras({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      /* El margen no es decorativo: encima va el filete de la barra del panel, que
         es pegajosa, y un círculo de 44px pegado a él se lee como si colgara de la
         barra en vez de pertenecer a la página. Va igual arriba que abajo para que
         la flecha quede centrada en su propio aire y no empujada contra el título. */
      className="group my-1 inline-flex items-center gap-3 text-small text-bark-soft transition-colors duration-500 hover:text-bark md:my-2"
    >
      <span className="flex size-11 items-center justify-center rounded-full border border-line transition-colors duration-500 group-hover:border-sage-deep group-hover:text-sage-deep">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
          className="size-5"
        >
          <path d="M14 6l-6 6 6 6" />
        </svg>
      </span>
      {children}
    </Link>
  )
}
