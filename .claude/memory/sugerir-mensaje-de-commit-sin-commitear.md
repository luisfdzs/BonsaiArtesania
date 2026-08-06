---
name: sugerir-mensaje-de-commit-sin-commitear
description: "Regla fija de Luis: al terminar cambios de código, sugerir un mensaje de commit en inglés justo después de la respuesta corta, pero no commitear nunca sin petición explícita"
metadata:
  node_type: memory
  type: feedback
  modified: 2026-08-05
---

Regla literal de Luis para este proyecto:

> Al terminar cambios de código, sugiere siempre por defecto un buen mensaje de
> commit en inglés, inmediatamente después de tu respuesta de 50 palabras máx.
> Sugiere el mensaje pero nunca hagas tú el commit, a no ser que te lo pida
> explícitamente.

Forma de la entrega:

1. La respuesta corta (ver [[respuestas-de-menos-de-50-palabras]]).
2. Inmediatamente después, el mensaje de commit **en inglés**, en un bloque de
   código para que se pueda copiar tal cual.

El mensaje no cuenta contra el límite de palabras. Se sugiere siempre que se
hayan tocado ficheros, aunque el cambio sea pequeño.

**No ejecutar `git commit`** (ni `git add` con intención de commitear, ni `git
push`) hasta que Luis lo pida con esas palabras. La sugerencia es material para
que él decida.

**Why:** Luis quiere revisar el diff antes de que quede en la historia y elegir
el momento y la rama; a la vez no quiere redactar el mensaje cada vez. El inglés
es la convención de los mensajes del repo, aunque la conversación sea en
castellano.

**How to apply:** seguir el estilo *conventional commits* que ya usa el repo
(`feat:`, `fix:`, `chore:`, `docs:`, con ámbito entre paréntesis cuando aporte),
imperativo y en inglés. Si el trabajo abarca cambios independientes, proponer los
commits por separado en vez de uno que lo mezcle todo.
