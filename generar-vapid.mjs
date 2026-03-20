/**
 * SIGITTN — Genera las claves VAPID necesarias para Web Push.
 *
 * Ejecutar UNA SOLA VEZ y copiar los valores al .env del backend:
 *
 *   node generar-vapid.mjs
 *
 * Las claves son únicas por servidor. Si las regeneras, todos los
 * suscriptores anteriores deberán re-suscribirse.
 */
import webpush from 'web-push'

const keys = webpush.generateVAPIDKeys()

console.log('\n✅  Claves VAPID generadas. Copia esto en sigittn-backend/.env:\n')
console.log(`VAPID_EMAIL=mailto:tu_correo@dominio.com`)
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`)
console.log()
console.log('⚠️  NUNCA compartas VAPID_PRIVATE_KEY. No la subas a git.')
console.log('⚠️  La VAPID_PUBLIC_KEY también va en el frontend (.env de sigittn):')
console.log(`\nVITE_VAPID_PUBLIC_KEY=${keys.publicKey}\n`)
