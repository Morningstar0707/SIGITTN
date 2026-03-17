import pool from '../config/db.js'

/**
 * GET /api/tickets/:id/mensajes
 * Devuelve todos los mensajes de un ticket, con datos del usuario que los envió.
 */
export async function listarMensajes(req, res) {
  const { id } = req.params
  try {
    const { rows } = await pool.query(
      `SELECT
         m.id_mensaje,
         m.texto_mensaje,
         m.url_imagen_mensaje,
         m.fecha_mensaje,
         m.leido_mensaje,
         m.id_ticket
       FROM Mensaje_tickets m
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
 * Body: { texto_mensaje?, url_imagen_mensaje? }
 * Al menos uno de los dos es requerido.
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
    // Verificar que el ticket existe
    const { rows: ticketRows } = await pool.query(
      'SELECT id_ticket FROM Tickets WHERE id_ticket = $1', [id]
    )
    if (!ticketRows[0]) return res.status(404).json({ error: 'Ticket no encontrado' })

    const { rows } = await pool.query(
      `INSERT INTO Mensaje_tickets (texto_mensaje, url_imagen_mensaje, id_ticket)
       VALUES ($1, $2, $3)
       RETURNING id_mensaje, texto_mensaje, url_imagen_mensaje, fecha_mensaje, leido_mensaje, id_ticket`,
      [texto_mensaje || null, url_imagen_mensaje || null, id]
    )

    return res.status(201).json({ mensaje: rows[0] })
  } catch (err) {
    console.error('Error al crear mensaje:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/**
 * PATCH /api/tickets/:id/mensajes/:idMensaje/leido
 * Marca un mensaje como leído.
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
