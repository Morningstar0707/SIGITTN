/**
 * SIGITTN — sendPush.js
 * Helpers para obtener destinatarios y disparar notificaciones push.
 */
import webpush from './webpush.js'
import pool    from '../config/db.js'

/**
 * Envía una notificación push a una lista de usuarios.
 * Elimina automáticamente las suscripciones inválidas (410 Gone).
 *
 * @param {number[]} userIds  IDs de usuarios destino
 * @param {{ title: string, body: string, url?: string, tag?: string }} payload
 */
export async function notificarUsuarios(userIds, payload) {
  if (!userIds || userIds.length === 0) return

  // Deduplicar IDs
  const ids = [...new Set(userIds)]
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ')

  let subs
  try {
    const { rows } = await pool.query(
      `SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE id_usuario IN (${placeholders})`,
      ids
    )
    subs = rows
  } catch (err) {
    console.error('sendPush: error al obtener suscripciones:', err.message)
    return
  }

  if (!subs.length) return

  const json = JSON.stringify({
    title: payload.title,
    body:  payload.body,
    url:   payload.url  || '/',
    tag:   payload.tag  || 'sigittn',
  })

  await Promise.allSettled(
    subs.map(sub =>
      webpush
        .sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          json
        )
        .catch(err => {
          // 410 = endpoint ya no existe → limpiar BD para no acumular basura
          if (err.statusCode === 410 || err.statusCode === 404) {
            pool.query(
              'DELETE FROM push_subscriptions WHERE endpoint = $1',
              [sub.endpoint]
            ).catch(() => {})
          } else {
            console.error('sendPush: error al enviar a endpoint:', err.message)
          }
        })
    )
  )
}

/**
 * Devuelve los IDs de todos los usuarios con rol 'admin' activos.
 */
export async function getAdminIds() {
  const { rows } = await pool.query(
    `SELECT u.id_usuario
     FROM   Usuarios u
     JOIN   Roles    r ON r.id_rol = u.id_rol
     WHERE  r.nombre_rol = 'admin'
       AND  u.estado_usuario = 'activo'`
  )
  return rows.map(r => r.id_usuario)
}
