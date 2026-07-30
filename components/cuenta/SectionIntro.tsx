/**
 * El encabezado de cada sección de la cuenta: título y una línea que explica de
 * qué va. Va como componente y no repetido en las cuatro páginas para que el
 * ritmo vertical sea idéntico en todas —era lo que fallaba antes, cada una
 * empezaba con un párrafo suelto a una altura distinta.
 *
 * Es un `h2`: el `h1` de la zona es el nombre de la persona, en el layout.
 */
export function SectionIntro({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="text-center">
      <h2 className="font-serif text-lead">{title}</h2>
      {children && <p className="mx-auto mt-4 max-w-md text-bark-soft">{children}</p>}
    </div>
  )
}
