---
name: sin-comentarios-en-el-texto
description: "Regla fija de Luis: no meter comentarios en el texto que se escribe — ni comentarios en el código ni acotaciones explicativas en el contenido entregado"
metadata:
  node_type: memory
  type: feedback
  modified: 2026-08-05
---

Regla literal de Luis para este proyecto:

> No metas comentarios en el texto

Se aplica a lo que se **escribe como producto**, no a la conversación:

- **En código:** no añadir comentarios (`//`, `/* */`, `#`, `<!-- -->`) a lo que se
  escribe o se modifica. El código se explica por los nombres y por su forma. Si
  el fichero que se está tocando ya tiene comentarios propios del proyecto, se
  respetan los que hay; la regla es no *añadir* nuevos.
- **En texto:** no intercalar acotaciones, notas al margen ni glosas del tipo
  «(esto es lo que hace X)» en el contenido que se entrega.

Lo que sí sigue valiendo es explicar en la respuesta de chat lo que haga falta,
dentro del límite de [[respuestas-de-menos-de-50-palabras]].

**Why:** Luis quiere el código y los textos limpios; los comentarios generados
automáticamente envejecen mal, repiten lo que ya dice el código y le obligan a
borrarlos a mano en cada revisión.

**How to apply:** antes de guardar un fichero, revisar que no se hayan colado
comentarios nuevos. Si algo *de verdad* no se entiende sin explicación, decirlo
en la respuesta de chat, no dentro del fichero.
