/**
 * SIGITTN — Service Worker personalizado
 * Estrategia: injectManifest (vite-plugin-pwa)
 *
 * Este archivo es procesado por Workbox:
 * - self.__WB_MANIFEST es inyectado automáticamente con el precache manifest.
 * - Maneja eventos push y notificationclick de Web Push API.
 */
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

// ── Precaching ────────────────────────────────────────────────
self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// ── Push ──────────────────────────────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'SIGITTN', body: event.data.text() }
  }

  const title = payload.title || 'SIGITTN'
  const options = {
    body:    payload.body  || '',
    icon:    '/icons/icon-192.png',
    badge: '/icons/badge-96.png',
    data:    { url: payload.url || '/' },
    tag:     payload.tag || 'sigittn-notif',
    renotify: true,
    // Vibración en móvil: patrón corto-pausa-largo
    vibrate: [100, 50, 200],
    requireInteraction: true,
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// ── Clic en notificación ──────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Si ya hay una ventana abierta de la app, enfocarla y navegar
        const existing = windowClients.find(c =>
          c.url.startsWith(self.location.origin)
        )
        if (existing) {
          existing.focus()
          return existing.navigate(targetUrl)
        }
        // Si no hay ventana abierta, abrir una nueva
        return clients.openWindow(targetUrl)
      })
  )
})
