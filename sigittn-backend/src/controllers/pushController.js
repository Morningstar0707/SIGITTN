/**
 * SIGITTN — pushController.js
 * Gestiona las suscripciones Web Push de cada usuario.
 */
import pool from '../config/db.js'

/**
 * GET /api/push/vapid-public-key
 * Devuelve la clave pública VAPID para que el frontend la use al suscribirse.
 * Es pública, no requiere autenticación.
 */
export function getVapidPublicKey(_req, res) {
  const key = process.env.VAPID_PUBLIC_KEY
  if (!key) return res.status(500).json({ error: 'VAPID no configurado en el servidor' })
  return res.json({ publicKey: key })
}

/**
 * POST /api/push/suscribir
 * Guarda o actualiza la suscripción push del usuario autenticado.
 * Body: { endpoint, keys: { p256dh, auth } }
 */
export async function suscribir(req, res) {
  const { endpoint, keys } = req.body

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: 'Suscripción push inválida: faltan campos' })
  }

  try {
    await pool.query(
      `INSERT INTO push_subscriptions (id_usuario, endpoint, p256dh, auth)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (endpoint)
       DO UPDATE SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth, id_usuario = EXCLUDED.id_usuario`,
      [req.usuario.id_usuario, endpoint, keys.p256dh, keys.auth]
    )
    return res.status(201).json({ ok: true })
  } catch (err) {
    console.error('Error al guardar suscripción push:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/**
 * POST /api/push/desuscribir
 * Elimina la suscripción push del usuario autenticado.
 * Body: { endpoint }
 */
export async function desuscribir(req, res) {
  const { endpoint } = req.body

  if (!endpoint) return res.status(400).json({ error: 'endpoint requerido' })

  try {
    await pool.query(
      `DELETE FROM push_subscriptions WHERE id_usuario = $1 AND endpoint = $2`,
      [req.usuario.id_usuario, endpoint]
    )
    return res.json({ ok: true })
  } catch (err) {
    console.error('Error al eliminar suscripción push:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
