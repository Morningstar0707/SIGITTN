import pool from '../config/db.js'
import { notificarUsuarios, getAdminIds } from '../utils/sendPush.js'

/**
 * Verifica si el usuario tiene acceso al chat de un ticket.
 */
async function verificarAcceso(idTicket, usuario) {
  if (usuario.nombre_rol === 'admin') return true

  const { rows } = await pool.query(
    `SELECT id_usuario_creador, id_usuario_asignado FROM Tickets WHERE id_ticket = $1`,
    [idTicket]
  )
  if (!rows[0]) return false

  const { id_usuario_creador, id_usuario_asignado } = rows[0]
  return (
    usuario.id_usuario === id_usuario_creador ||
    usuario.id_usuario === id_usuario_asignado
  )
}

/**
 * GET /api/tickets/:id/mensajes
 */
export async function listarMensajes(req, res) {
  const { id } = req.params

  try {
    const tieneAcceso = await verificarAcceso(parseInt(id), req.usuario)
    if (!tieneAcceso) {
      return res.status(403).json({ error: 'No tienes acceso a este chat' })
    }

    const { rows } = await pool.query(
      `SELECT
         m.id_mensaje,
         m.texto_mensaje,
         m.url_imagen_mensaje,
         m.fecha_mensaje,
         m.leido_mensaje,
         m.id_ticket,
         m.id_usuario,
         u.nombre_usuario
       FROM Mensaje_tickets m
       LEFT JOIN Usuarios u ON u.id_usuario = m.id_usuario
       WHERE m.id_ticket = $1
       ORDER BY m.fecha_mensaje ASC`,
      [id]
    )
    return res.json({ mensajes: rows })
  } catch (err) {
    console.error('Error al listar mensajes:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/**
 * POST /api/tickets/:id/mensajes
 *
 * 🔔 Push (según rol):
 *   - Admins: todos los admins activos excepto el remitente.
 *   - Usuario creador del ticket: si no es el remitente.
 *   - Usuario asignado al ticket: si no es el remitente.
 *   (sin duplicados)
 */
export async function crearMensaje(req, res) {
  const { id } = req.params
  const { texto_mensaje, url_imagen_mensaje } = req.body

  if (!texto_mensaje && !url_imagen_mensaje) {
    return res.status(400).json({
      error: 'Se requiere texto_mensaje o url_imagen_mensaje'
    })
  }

  try {
    const tieneAcceso = await verificarAcceso(parseInt(id), req.usuario)
    if (!tieneAcceso) {
      return res.status(403).json({ error: 'No tienes acceso a este chat' })
    }

    // Obtener info del ticket para armar destinatarios
    const { rows: ticketRows } = await pool.query(
      `SELECT t.id_ticket, t.titulo_ticket, t.id_usuario_creador, t.id_usuario_asignado
       FROM Tickets t WHERE t.id_ticket = $1`,
      [id]
    )
    if (!ticketRows[0]) return res.status(404).json({ error: 'Ticket no encontrado' })

    const { rows } = await pool.query(
      `INSERT INTO Mensaje_tickets (texto_mensaje, url_imagen_mensaje, id_ticket, id_usuario)
       VALUES ($1, $2, $3, $4)
       RETURNING id_mensaje, texto_mensaje, url_imagen_mensaje, fecha_mensaje, leido_mensaje, id_ticket, id_usuario`,
      [texto_mensaje || null, url_imagen_mensaje || null, id, req.usuario.id_usuario]
    )

    const mensajeCreado = {
      ...rows[0],
      nombre_usuario: req.usuario.nombre_usuario,
    }

    // ── Notificaciones push (no bloquean la respuesta) ───────────────────
    setTimeout(async () => {
      try {
        const ticket         = ticketRows[0]
        const remitenteId    = req.usuario.id_usuario
        const remitenteNombre = req.usuario.nombre_usuario
        const adminIds       = await getAdminIds()

        // Construir conjunto de destinatarios sin duplicados y sin el remitente
        const destinatariosSet = new Set()

        // Todos los admins activos
        adminIds.forEach(aid => destinatariosSet.add(aid))

        // Creador del ticket (puede no ser admin)
        if (ticket.id_usuario_creador) destinatariosSet.add(ticket.id_usuario_creador)

        // Asignado del ticket
        if (ticket.id_usuario_asignado) destinatariosSet.add(ticket.id_usuario_asignado)

        // Excluir al remitente (no se notifica a sí mismo)
        destinatariosSet.delete(remitenteId)

        const destinatarios = [...destinatariosSet]
        if (!destinatarios.length) return

        const preview = texto_mensaje
          ? (texto_mensaje.length > 60 ? texto_mensaje.substring(0, 60) + '…' : texto_mensaje)
          : '📷 Imagen adjunta'

        await notificarUsuarios(destinatarios, {
          title: `💬 Novedad en ticket #${ticket.id_ticket}`,
          body:  `${remitenteNombre}: ${preview}`,
          url:   '/?section=tickets',
          tag:   `mensaje-ticket-${id}`,
        })
      } catch (err) {
        console.error('Error en notificación push (crearMensaje):', err.message)
      }
    }, 0)
    // ────────────────────────────────────────────────────────────────────

    return res.status(201).json({ mensaje: mensajeCreado })
  } catch (err) {
    console.error('Error al crear mensaje:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/**
 * PATCH /api/tickets/:id/mensajes/:idMensaje/leido
 */
export async function marcarLeido(req, res) {
  const { idMensaje } = req.params
  try {
    const { rows } = await pool.query(
      `UPDATE Mensaje_tickets SET leido_mensaje = TRUE
       WHERE id_mensaje = $1
       RETURNING id_mensaje, leido_mensaje`,
      [idMensaje]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Mensaje no encontrado' })
    return res.json({ mensaje: rows[0] })
  } catch (err) {
    console.error('Error al marcar mensaje como leído:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/**
 * GET /api/mensajes/no-leidos
 */
export async function noLeidos(req, res) {
  const { id_usuario, nombre_rol } = req.usuario
  try {
    let query

    if (nombre_rol === 'admin') {
      query = await pool.query(
        `SELECT DISTINCT m.id_ticket
         FROM Mensaje_tickets m
         LEFT JOIN ticket_ultimo_visto tuv
           ON tuv.id_ticket = m.id_ticket AND tuv.id_usuario = $1
         WHERE m.id_usuario != $1
           AND m.fecha_mensaje > COALESCE(tuv.visto_en, '-infinity'::timestamptz)`,
        [id_usuario]
      )
    } else {
      query = await pool.query(
        `SELECT DISTINCT m.id_ticket
         FROM Mensaje_tickets m
         JOIN Tickets t ON t.id_ticket = m.id_ticket
         LEFT JOIN ticket_ultimo_visto tuv
           ON tuv.id_ticket = m.id_ticket AND tuv.id_usuario = $1
         WHERE m.id_usuario != $1
           AND (t.id_usuario_creador = $1 OR t.id_usuario_asignado = $1)
           AND m.fecha_mensaje > COALESCE(tuv.visto_en, '-infinity'::timestamptz)`,
        [id_usuario]
      )
    }

    return res.json({ ticketsConNoLeidos: query.rows.map(r => r.id_ticket) })
  } catch (err) {
    console.error('Error al obtener no leídos:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/**
 * PATCH /api/tickets/:id/mensajes/leidos
 */
export async function marcarTodosLeidos(req, res) {
  const { id } = req.params
  const { id_usuario } = req.usuario
  try {
    await pool.query(
      `INSERT INTO ticket_ultimo_visto (id_ticket, id_usuario, visto_en)
       VALUES ($1, $2, NOW())
       ON CONFLICT (id_ticket, id_usuario)
       DO UPDATE SET visto_en = NOW()`,
      [id, id_usuario]
    )
    return res.json({ ok: true })
  } catch (err) {
    console.error('Error al marcar todos leídos:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}