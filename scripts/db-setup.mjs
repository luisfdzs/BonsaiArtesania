/**
 * Aprovisiona la base de datos: colecciones, índices y reglas de validación.
 *
 * Es idempotente: se puede ejecutar tantas veces como se quiera. No borra nada
 * ni modifica documentos; sólo crea lo que falta. Se lanza con `npm run db:setup`
 * y hace falta MONGODB_URI en el entorno.
 *
 * Existe como script y no como clics en la consola de Atlas para que el esquema
 * esté versionado con el código: cuando alguien clone el repo, una orden deja la
 * base igual que en producción.
 */

import { MongoClient } from 'mongodb'
import { readFileSync } from 'node:fs'

const DB_NAME = 'bonsaiartesania'

/** Lee MONGODB_URI del entorno o, si no está, de .env.local. */
function resolveUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI
  try {
    const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    const line = env.split('\n').find((l) => l.trim().startsWith('MONGODB_URI='))
    if (line)
      return line
        .slice(line.indexOf('=') + 1)
        .trim()
        .replace(/^["']|["']$/g, '')
  } catch {
    // .env.local no existe: caemos al error de abajo con un mensaje útil.
  }
  return null
}

const uri = resolveUri()

if (!uri) {
  console.error(
    '\n  Falta MONGODB_URI.\n\n' +
      '  1. En Atlas: Database Access → crea un usuario (deja que Atlas genere la contraseña).\n' +
      '  2. En Atlas: Network Access → permite tu IP.\n' +
      '  3. Copia .env.example a .env.local y pega ahí la cadena de conexión.\n',
  )
  process.exit(1)
}

/**
 * Validadores. Sólo sobre nuestras colecciones: `users`, `accounts`, `sessions` y
 * `verification_tokens` las escribe el adaptador de Auth.js, y fijarles un esquema
 * las rompería en cuanto la librería añada un campo.
 *
 * `moderate` en vez de `strict`: si algún día hay documentos antiguos que no
 * cumplen, seguirán pudiendo leerse y actualizarse en lugar de quedar bloqueados.
 */
const money = { bsonType: 'int', minimum: 0, description: 'céntimos, entero' }

const validators = {
  email_codes: {
    bsonType: 'object',
    required: ['email', 'purpose', 'codeHash', 'attempts', 'expiresAt'],
    properties: {
      email: { bsonType: 'string', minLength: 3, maxLength: 160 },
      purpose: { enum: ['alta', 'recuperar'] },
      // El HMAC en base64, nunca las seis cifras. Ver lib/codes.ts.
      codeHash: { bsonType: 'string' },
      attempts: { bsonType: 'int', minimum: 0 },
      expiresAt: { bsonType: 'date' },
    },
  },
  addresses: {
    bsonType: 'object',
    required: [
      'userId',
      'alias',
      'recipient',
      'phone',
      'line1',
      'postalCode',
      'city',
      'province',
      'country',
      'isDefault',
    ],
    properties: {
      userId: { bsonType: 'objectId' },
      alias: { bsonType: 'string', minLength: 1, maxLength: 40 },
      recipient: { bsonType: 'string', minLength: 1, maxLength: 120 },
      phone: { bsonType: 'string', minLength: 6, maxLength: 20 },
      line1: { bsonType: 'string', minLength: 1, maxLength: 160 },
      line2: { bsonType: ['string', 'null'], maxLength: 160 },
      // Cinco dígitos: el CP español. Si algún día se envía fuera, se relaja aquí.
      postalCode: { bsonType: 'string', pattern: '^[0-9]{5}$' },
      city: { bsonType: 'string', minLength: 1, maxLength: 80 },
      province: { bsonType: 'string', minLength: 1, maxLength: 80 },
      country: { bsonType: 'string', pattern: '^[A-Z]{2}$' },
      isDefault: { bsonType: 'bool' },
    },
  },
  carts: {
    bsonType: 'object',
    required: ['items', 'updatedAt'],
    properties: {
      userId: { bsonType: ['objectId', 'null'] },
      guestId: { bsonType: ['string', 'null'] },
      items: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['slug', 'qty', 'addedAt'],
          properties: {
            slug: { bsonType: 'string' },
            // Las piezas son únicas: más de una unidad no tiene sentido, pero se
            // deja margen porque hay modelos que Ana sí repite por encargo.
            qty: { bsonType: 'int', minimum: 1, maximum: 20 },
            addedAt: { bsonType: 'date' },
          },
        },
      },
    },
  },
  orders: {
    bsonType: 'object',
    required: ['number', 'userId', 'status', 'items', 'shipping', 'totals', 'payment'],
    properties: {
      number: { bsonType: 'string', pattern: '^BA-[0-9]{4}-[0-9]{4}$' },
      userId: { bsonType: 'objectId' },
      // Fuera de `required` a propósito: los pedidos anteriores al galego no lo
      // llevan y quien los lee cae al castellano. Ver `OrderDoc` en lib/schema.ts.
      locale: { enum: ['es', 'gl'] },
      status: {
        enum: ['pendiente_pago', 'preparando', 'enviado', 'en_reparto', 'entregado', 'cancelado'],
      },
      items: {
        bsonType: 'array',
        minItems: 1,
        items: {
          bsonType: 'object',
          required: ['slug', 'name', 'unitPriceCents', 'qty'],
          properties: {
            slug: { bsonType: 'string' },
            name: { bsonType: 'string' },
            unitPriceCents: money,
            qty: { bsonType: 'int', minimum: 1 },
          },
        },
      },
      totals: {
        bsonType: 'object',
        required: ['subtotalCents', 'shippingCents', 'totalCents'],
        properties: {
          subtotalCents: money,
          shippingCents: money,
          totalCents: money,
        },
      },
      payment: {
        bsonType: 'object',
        required: ['provider', 'status'],
        properties: {
          // Bloque heredado y sin uso: todo se archiva con 'simulado' /
          // 'pendiente'. Sigue declarado porque los documentos ya guardados lo
          // tienen; quitarlo es una migración. Ver `lib/schema.ts`.
          provider: { enum: ['stripe', 'transferencia', 'bizum', 'simulado'] },
          status: { enum: ['pendiente', 'pagado', 'fallido', 'reembolsado'] },
          intentId: { bsonType: ['string', 'null'] },
        },
      },
    },
  },
  push_subscriptions: {
    bsonType: 'object',
    required: ['email', 'endpoint', 'keys'],
    properties: {
      email: { bsonType: 'string', minLength: 3, maxLength: 160 },
      endpoint: { bsonType: 'string', maxLength: 1000 },
      keys: {
        bsonType: 'object',
        required: ['p256dh', 'auth'],
        properties: {
          p256dh: { bsonType: 'string', maxLength: 400 },
          auth: { bsonType: 'string', maxLength: 400 },
        },
      },
      userAgent: { bsonType: ['string', 'null'] },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' },
    },
  },
}

/** Índices. El comentario de cada uno explica qué consulta lo justifica. */
const indexes = {
  // Auth.js busca por correo en cada login; único además impide cuentas duplicadas.
  users: [{ keys: { email: 1 }, options: { unique: true, name: 'email_unico' } }],

  // El adaptador resuelve «¿qué usuario es este perfil de Google?» por este par.
  accounts: [
    {
      keys: { provider: 1, providerAccountId: 1 },
      options: { unique: true, name: 'proveedor_cuenta_unico' },
    },
    { keys: { userId: 1 }, options: { name: 'por_usuario' } },
  ],

  // La cookie de sesión llega en cada petición: sin este índice sería un escaneo.
  sessions: [
    { keys: { sessionToken: 1 }, options: { unique: true, name: 'token_unico' } },
    { keys: { userId: 1 }, options: { name: 'por_usuario' } },
    // Mongo borra solas las sesiones caducadas; si no, la colección crece sin fin.
    { keys: { expires: 1 }, options: { expireAfterSeconds: 0, name: 'caducidad' } },
  ],

  verification_tokens: [
    { keys: { identifier: 1, token: 1 }, options: { unique: true, name: 'identificador_token' } },
    { keys: { expires: 1 }, options: { expireAfterSeconds: 0, name: 'caducidad' } },
  ],

  email_codes: [
    // Toda consulta de lib/codes.ts busca por este par: emitir, comprobar y borrar.
    { keys: { email: 1, purpose: 1 }, options: { name: 'por_correo_y_motivo' } },
    // El TTL es aquí una medida de seguridad y no sólo de limpieza: es lo que hace
    // que un código deje de valer a los diez minutos aunque nadie lo use.
    { keys: { expiresAt: 1 }, options: { expireAfterSeconds: 0, name: 'caducidad' } },
  ],

  addresses: [
    { keys: { userId: 1, isDefault: -1 }, options: { name: 'por_usuario_predeterminada' } },
  ],

  carts: [
    // Parciales: un carrito tiene userId o guestId, nunca los dos. Un único normal
    // trataría los ausentes como null y sólo permitiría un documento sin dueño.
    {
      keys: { userId: 1 },
      options: {
        unique: true,
        name: 'un_carrito_por_usuario',
        partialFilterExpression: { userId: { $type: 'objectId' } },
      },
    },
    {
      keys: { guestId: 1 },
      options: {
        unique: true,
        name: 'un_carrito_por_invitado',
        partialFilterExpression: { guestId: { $type: 'string' } },
      },
    },
  ],

  orders: [
    { keys: { number: 1 }, options: { unique: true, name: 'numero_unico' } },
    // «Mis pedidos», del más reciente al más antiguo.
    { keys: { userId: 1, createdAt: -1 }, options: { name: 'por_usuario_reciente' } },
    // Panel de Ana: qué hay pendiente de preparar.
    { keys: { status: 1, createdAt: -1 }, options: { name: 'por_estado' } },
  ],

  rate_limits: [
    // Sin esto la colección crecería para siempre: cada ventana de cada IP deja un
    // documento. Con el TTL, Mongo los borra en cuanto la ventana pasa y la
    // colección se queda sólo con lo que está vivo. Es la única razón por la que
    // llevar los contadores en la base es barato.
    { keys: { expiresAt: 1 }, options: { expireAfterSeconds: 0, name: 'caducidad' } },
  ],

  push_subscriptions: [
    { keys: { endpoint: 1 }, options: { unique: true, name: 'endpoint_unico' } },
  ],
}

const client = new MongoClient(uri)

try {
  await client.connect()
  const db = client.db(DB_NAME)

  const existing = new Set(
    (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name),
  )

  const wanted = [
    'users',
    'accounts',
    'sessions',
    'verification_tokens',
    // Códigos de un solo uso del alta y de la recuperación. Se vacía sola por TTL.
    'email_codes',
    'addresses',
    'carts',
    'orders',
    // Contador del número de pedido. Un documento por año; ver lib/orders.ts.
    'counters',
    // Contadores de los límites de uso. Se vacían solos por TTL; ver lib/rate-limit.ts.
    'rate_limits',
    // Dispositivos que reciben el aviso de pedido en la app. Uno por navegador.
    'push_subscriptions',
  ]

  console.log(`\n  Base: ${DB_NAME}\n`)

  for (const name of wanted) {
    if (existing.has(name)) {
      console.log(`  · ${name} ya existía`)
    } else {
      await db.createCollection(name)
      console.log(`  + ${name} creada`)
    }

    // El validador se aplica con collMod para que valga igual en colecciones
    // nuevas y en las que ya estaban.
    const validator = validators[name]
    if (validator) {
      await db.command({
        collMod: name,
        validator: { $jsonSchema: validator },
        validationLevel: 'moderate',
        validationAction: 'error',
      })
      console.log(`    validación aplicada`)
    }
  }

  console.log('')

  for (const [name, list] of Object.entries(indexes)) {
    for (const { keys, options } of list) {
      try {
        await db.collection(name).createIndex(keys, options)
        console.log(`  índice ${name}.${options.name}`)
      } catch (error) {
        // Un índice que ya existe con otras opciones da IndexOptionsConflict (85).
        // No es motivo para abortar el resto: se avisa y se sigue.
        if (error.code === 85 || error.code === 86) {
          console.log(`  índice ${name}.${options.name} — ya existe con otra definición, se deja`)
        } else {
          throw error
        }
      }
    }
  }

  console.log('\n  Listo.\n')
} finally {
  await client.close()
}
