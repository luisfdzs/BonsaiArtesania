import webpush from 'web-push'

const { publicKey, privateKey } = webpush.generateVAPIDKeys()

console.log(
  '\n  Claves VAPID. Pégalas en .env.local y en las variables de Vercel.\n' +
    '  Si las cambias, todos los dispositivos tienen que volver a activarse.\n',
)
console.log(`VAPID_PUBLIC_KEY="${publicKey}"`)
console.log(`VAPID_PRIVATE_KEY="${privateKey}"\n`)
