import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { isAdmin } from '@/lib/admin'
import { MAXIMO_BYTES, TIPOS } from '@/lib/portada-limites'

/**
 * EL PERMISO PARA SUBIR UN VÍDEO AL ALMACÉN
 *
 * Las fotos del catálogo viajan dentro de una acción de servidor: llegan al
 * servidor, `sharp` las recorta y se guardan. Con un vídeo eso no vale. Una
 * acción de servidor tiene un tope de cuerpo de un mega —y las funciones tienen
 * el suyo—, así que un mp4 de diez se queda por el camino con un error que no
 * dice nada. Y aunque cupiera, no habría razón para hacerlo pasar por ahí: del
 * vídeo no se recorta nada, se guarda tal cual.
 *
 * Así que el navegador lo sube **directamente al almacén**, y lo que hace este
 * endpoint es firmar ese permiso: recibe el nombre del fichero, comprueba que
 * quien pide es el taller y devuelve un token que sólo sirve para subir un vídeo,
 * de un tipo de los de la lista y con un tope de tamaño. Ver
 * `components/gestion/PortadaReels.tsx`, que es quien lo llama.
 *
 * **El tope de verdad es el de aquí.** El panel lo comprueba antes para poder
 * avisar con una frase en vez de con un fallo a mitad de subida, pero eso es
 * cortesía del panel: quien no pase por el panel se topa con esto.
 *
 * **`onUploadCompleted` no se usa a propósito.** Es un aviso que Vercel manda a
 * la web cuando la subida acaba, y en `localhost` no llega nunca —no hay a dónde
 * llamar—, así que apoyar en él el guardado en la base sería tener un panel que
 * funciona en producción y no en desarrollo. Lo que guarda es la propia página,
 * con `anadirReelDePortada`, en cuanto la subida termina.
 *
 * Un 404 y no un 403 cuando no es el taller, como en todo `/gestion`: lo que no
 * es tuyo no existe.
 */
export async function POST(request: Request): Promise<Response> {
  if (!(await isAdmin())) return new Response(null, { status: 404 })

  const body = (await request.json().catch(() => null)) as HandleUploadBody | null
  if (!body) return Response.json({ ok: false }, { status: 400 })

  try {
    const respuesta = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [...TIPOS, 'image/jpeg'],
        maximumSizeInBytes: MAXIMO_BYTES,
        /* El nombre lo pone el panel y lleva dentro un identificador, pero subir
           dos veces el mismo vídeo tras cambiarlo tiene que dejar dos ficheros:
           si se pisara el anterior, el CDN seguiría sirviendo el viejo durante
           horas. La misma razón que en `lib/almacen.ts`. */
        addRandomSuffix: true,
      }),
    })

    return Response.json(respuesta)
  } catch (error) {
    // Lo que llega aquí es un tipo no permitido o un fichero demasiado grande.
    // El mensaje de la librería es legible y el panel lo enseña tal cual.
    const texto = error instanceof Error ? error.message : ''
    return Response.json({ ok: false, error: texto }, { status: 400 })
  }
}
