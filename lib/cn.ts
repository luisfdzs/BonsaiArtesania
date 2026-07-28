/**
 * Concatena clases ignorando falsy. Suficiente para este proyecto: no hay
 * conflictos de utilidades que justifiquen traer `tailwind-merge`.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
