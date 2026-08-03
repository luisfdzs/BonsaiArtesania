import type { Metadata } from 'next'
import Link from 'next/link'
import { legal } from '@/content/legal'
import { LegalPage } from '@/components/legal/LegalPage'
import { site } from '@/content/site'

export const metadata: Metadata = {
  title: 'Privacidad',
  description: 'Qué datos se recogen, para qué, cuánto se guardan y cómo borrarlos.',
  alternates: { canonical: '/legal/privacidad' },
}

/**
 * Un solo aviso, con las cookies dentro.
 *
 * Antes eran tres páginas. Las cookies de esta web son dos y las dos son técnicas,
 * así que no daban para una página propia; y de lo demás no hay nada que decir
 * —aquí no se cierra ninguna operación—. Lo que sí hay que decir, y es lo único
 * obligatorio de verdad, es qué se hace con el nombre, el teléfono y la dirección
 * que la web pide para poder enviar una pieza.
 *
 * Todo lo que se afirma aquí está comprobado contra el código, no supuesto: las
 * cookies son las de `lib/session.ts` y `lib/cart.ts`, el hash es el de
 * `lib/password.ts`, y lo que se borra y lo que se anonimiza es lo que hace
 * `app/(sitio)/cuenta/privacidad/actions.ts`. Si alguna de esas tres cosas cambia,
 * este texto pasa a ser falso y hay que corregirlo aquí el mismo día.
 */
export default function PrivacidadPage() {
  return (
    <LegalPage title="Privacidad">
      <p>
        Esto es un taller pequeño. Se recogen los datos mínimos para poder atender una petición y
        enviar una pieza, y nada más: <strong>no hay analítica, ni publicidad, ni perfiles</strong>,
        y tus datos no se ceden ni se comparten con nadie fuera de la lista de más abajo.
      </p>

      <h2>Quién responde</h2>
      <ul>
        <li>
          <strong>Responsable:</strong> {legal.responsible}
        </li>
        <li>
          <strong>Correo:</strong> {site.contact.email}
        </li>
      </ul>
      <p>
        A esa dirección se escribe para cualquier cosa de esta página: preguntar, corregir un dato o
        pedir que se borre todo.
      </p>

      <h2>Qué se recoge y para qué</h2>
      <table>
        <thead>
          <tr>
            <th>Datos</th>
            <th>Para qué</th>
            <th>Por qué se puede</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Correo electrónico</td>
            <td>Crear tu cuenta, enviarte el código que la confirma y avisarte de tus peticiones</td>
            <td>Para poder atender lo que pides</td>
          </tr>
          <tr>
            <td>Nombre</td>
            <td>Saber cómo llamarte y a nombre de quién va el paquete</td>
            <td>Para poder atender lo que pides</td>
          </tr>
          <tr>
            <td>Teléfono</td>
            <td>Avisarte de un problema con el envío</td>
            <td>Para poder atender lo que pides</td>
          </tr>
          <tr>
            <td>Dirección de entrega</td>
            <td>Enviarte la pieza</td>
            <td>Para poder atender lo que pides</td>
          </tr>
          <tr>
            <td>Tus peticiones y su historial</td>
            <td>Atenderlas y que puedas consultar cómo van</td>
            <td>Para poder atender lo que pides</td>
          </tr>
        </tbody>
      </table>

      <p>
        <strong>Tu contraseña no se guarda.</strong> Lo que queda es un resumen criptográfico
        (scrypt) del que no se puede volver atrás: sirve para comprobar que aciertas, no para saber
        cuál es.
      </p>
      <p>
        <strong>Datos bancarios: ninguno.</strong> Ni número de tarjeta, ni caducidad, ni código de
        seguridad. La web no los pide en ningún momento y no hay dónde guardarlos.
      </p>

      <h2>Cuánto tiempo se guardan</h2>
      <ul>
        <li>
          <strong>Cuenta y direcciones:</strong> mientras tengas la cuenta abierta. Si la borras,
          desaparecen.
        </li>
        <li>
          <strong>Peticiones:</strong> se conservan como registro del taller. Si borras la cuenta no
          se eliminan, se anonimizan: se les quita tu nombre, tu teléfono y tu dirección, y dejan de
          estar ligadas a ti. Queda qué se pidió y cuándo, sin a quién.
        </li>
      </ul>

      <h2>Quién más los trata</h2>
      <p>Sólo los proveedores necesarios para que la web funcione:</p>
      <table>
        <thead>
          <tr>
            <th>Proveedor</th>
            <th>Para qué</th>
            <th>Dónde</th>
          </tr>
        </thead>
        <tbody>
          {legal.processors.map((processor) => (
            <tr key={processor.name}>
              <td>{processor.name}</td>
              <td>{processor.purpose}</td>
              <td>{processor.location}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Tus derechos</h2>
      <p>
        Puedes acceder a tus datos, corregirlos, borrarlos, limitar su tratamiento, oponerte y
        pedirlos en un fichero portable. Lo más rápido es hacerlo tú desde{' '}
        <Link href="/cuenta/privacidad">tus datos y privacidad</Link>: desde ahí te descargas todo
        lo que hay sobre ti y borras tu cuenta sin pedir permiso a nadie ni esperar respuesta.
      </p>
      <p>
        También puedes escribir a <strong>{site.contact.email}</strong>. Y si crees que algo no se ha
        hecho bien, puedes reclamar ante la{' '}
        <a href="https://www.aepd.es" target="_blank" rel="noreferrer">
          Agencia Española de Protección de Datos
        </a>
        .
      </p>

      <h2>Cookies</h2>
      <p>
        No hay banner, y es a propósito: las únicas dos cookies de esta web son técnicas e
        imprescindibles para que funcione. Según el artículo 22.2 de la LSSI y el criterio de la
        AEPD, esas no necesitan consentimiento —basta con explicarlas, que es lo que hace esta
        tabla—. No hay analítica, ni píxeles, ni cookies de terceros. Si algún día se añade algo de
        eso, aparecerá aquí y con un banner de consentimiento previo.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Para qué</th>
            <th>Duración</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>authjs.session-token</code>
            </td>
            <td>Mantener tu sesión abierta cuando entras con tu cuenta</td>
            <td>30 días</td>
          </tr>
          <tr>
            <td>
              <code>ba_carrito</code>
            </td>
            <td>Recordar tu carrito si todavía no tienes cuenta</td>
            <td>30 días</td>
          </tr>
        </tbody>
      </table>
      <p>
        Puedes borrarlas o bloquearlas desde tu navegador. Al ser las imprescindibles, bloquearlas
        significa que no podrás mantener la sesión abierta ni conservar el carrito, pero el resto de
        la web se sigue leyendo con normalidad.
      </p>
    </LegalPage>
  )
}
