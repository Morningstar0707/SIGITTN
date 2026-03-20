/**
 * SIGITTN — Inicialización de web-push con claves VAPID.
 * Importar este módulo para tener webpush ya configurado.
 */
import webpush from 'web-push'

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export default webpush
