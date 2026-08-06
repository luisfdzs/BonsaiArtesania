---
name: respuestas-de-menos-de-50-palabras
description: "Regla fija de Luis: responder siempre con menos de 50 palabras por defecto, salvo que pida explícitamente una respuesta más completa"
metadata:
  node_type: memory
  type: feedback
  modified: 2026-08-05
---

Regla literal de Luis para este proyecto:

> Responde siempre por defecto con menos de 50 palabras, a no ser que se pida
> explícitamente una respuesta más completa.

Cómo se cuenta y qué queda dentro del límite:

- El límite es sobre el **texto de la respuesta**, no sobre el trabajo: leer
  ficheros, buscar, editar y ejecutar comandos no consume palabras.
- **Fuera del recuento:** el mensaje de commit sugerido (ver
  [[sugerir-mensaje-de-commit-sin-commitear]]), los bloques de código o de
  diff que se piden, y el contenido de los ficheros que se escriben.
- «Explícitamente más completa» significa que Luis lo pide: «explícame en
  detalle», «hazme un resumen largo», «dame el análisis completo». Que una
  pregunta *parezca* complicada no levanta el límite; si no cabe, se resume y se
  ofrece ampliar.

**Why:** Luis trabaja en tareas cortas y encadenadas, y una respuesta larga le
obliga a leer de más para encontrar el dato que buscaba. Prefiere pedir la
ampliación cuando la necesita.

**How to apply:** escribir la conclusión primero y cortar; nada de preámbulos,
resúmenes de lo ya hecho ni enumerar alternativas que no se van a seguir. Si hay
una decisión que le corresponde, se le pregunta en una frase.
