/**
 * SIGITTN — notifications.js
 * Utilidad para gestionar permisos y suscripciones Web Push.
 *
 * Flujo:
 *   1. setupPushNotifications(token) → se llama al iniciar sesión.
 *   2. Solicita permiso de notificaciones al navegador.
 *   3. Suscribe el SW al servidor push con la clave VAPID pública.
 *   4. Envía la suscripción al backend (POST /api/push/suscribir).
 *
 * teardownPushNotifications() → se llama al cerrar sesión.
 *   - Des-suscribe del servidor push.
 *   - Notifica al backend (POST /api/push/desuscribir).
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const STORAGE_KEY = 'sigittn_push_endpoint'

// ── Helper: convierte base64url → Uint8Array (requerido por subscribe) ──
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

// ── Obtiene la clave VAPID pública del backend ───────────────────────────
async function getVapidPublicKey() {
  const res  = await fetch(`${BASE}/push/vapid-public-key`)
  const data = await res.json()
  return data.publicKey
}

// ── Envía la suscripción al backend ─────────────────────────────────────
async function registrarSuscripcionEnBackend(subscription, token) {
  const sub = subscription.toJSON()
  await fetch(`${BASE}/push/suscribir`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.keys.p256dh,
        auth:   sub.keys.auth,
      },
    }),
  })
}

// ── Notifica al backend que elimine la suscripción ───────────────────────
async function eliminarSuscripcionEnBackend(endpoint, token) {
  await fetch(`${BASE}/push/desuscribir`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ endpoint }),
  })
}

/**
 * setupPushNotifications
 * Llama esto justo después del login exitoso.
 *
 * @param {string} token - JWT del usuario autenticado
 * @returns {Promise<'granted'|'denied'|'unsupported'|'error'>}
 */
export async function setupPushNotifications(token) {
  // 1. Verificar soporte del navegador
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.info('Push notifications no soportadas en este navegador.')
    return 'unsupported'
  }

  try {
    // 2. Solicitar permiso (muestra el diálogo nativo del navegador)
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.info('Permiso de notificaciones denegado.')
      return 'denied'
    }

    // 3. Obtener el service worker registrado
    const registration = await navigator.serviceWorker.ready

    // 4. Obtener la clave pública VAPID
    const vapidPublicKey = await getVapidPublicKey()
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

    // 5. Suscribirse al servidor push del navegador
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey,
    })

    // 6. Guardar el endpoint localmente para poder des-suscribirse
    localStorage.setItem(STORAGE_KEY, subscription.endpoint)

    // 7. Enviar suscripción al backend
    await registrarSuscripcionEnBackend(subscription, token)

    console.info('✅ Suscripción push registrada correctamente.')
    return 'granted'
  } catch (err) {
    console.error('Error al configurar push notifications:', err)
    return 'error'
  }
}

/**
 * teardownPushNotifications
 * Llama esto justo antes del logout.
 *
 * @param {string} token - JWT del usuario autenticado (antes de borrarlo)
 */
export async function teardownPushNotifications(token) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

  try {
    const registration  = await navigator.serviceWorker.ready
    const subscription  = await registration.pushManager.getSubscription()

    if (subscription) {
      const endpoint = subscription.endpoint

      // Des-suscribirse del servidor push del navegador
      await subscription.unsubscribe()

      // Notificar al backend
      if (token) {
        await eliminarSuscripcionEnBackend(endpoint, token)
      }

      localStorage.removeItem(STORAGE_KEY)
      console.info('🔕 Suscripción push eliminada.')
    }
  } catch (err) {
    console.error('Error al des-suscribirse de push:', err)
  }
}
