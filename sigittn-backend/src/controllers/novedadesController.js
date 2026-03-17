import pool from '../config/db.js'

/**
 * GET /api/tickets/:id/novedades
 * Devuelve todos los mensajes del chat de un ticket.
 */
export async function listarNovedades(req, res) {
  const { id } = req.params
  try {
    const { rows } = await pool.query(
      `SELECT n.id, n.tipo, n.contenido, n.creado_en,
              u.nombre AS usuario_nombre, u.rol AS usuario_rol
       FROM novedades n
       LEFT JOIN usuarios u ON u.id = n.usuario_id
       WHERE n.ticket_id = $1
       ORDER BY n.creado_en ASC`,
      [id]
    )
    return res.json({ novedades: rows })
  } catch (err) {
    console.error('Error al listar novedades:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/**
 * POST /api/tickets/:id/novedades
 * Añade un mensaje (texto o imagen) al chat del ticket.
 * Body: { tipo: 'texto'|'imagen', contenido: string }
 */
export async function crearNovedad(req, res) {
  const { id } = req.params
  const { tipo = 'texto', contenido } = req.body

  if (!contenido || contenido.trim() === '') {
    return res.status(400).json({ error: 'contenido es requerido' })
  }

  try {
    // Verificar que el ticket exista
    const { rows: ticket } = await pool.query(
      'SELECT id FROM tickets WHERE id = $1', [id]
    )
    if (!ticket[0]) return res.status(404).json({ error: 'Ticket no encontrado' })

    const { rows } = await pool.query(
      `INSERT INTO novedades (ticket_id, usuario_id, tipo, contenido)
       VALUES ($1, $2, $3, $4)
       RETURNING id, tipo, contenido, creado_en`,
      [id, req.usuario.id, tipo, contenido.trim()]
    )

    return res.status(201).json({
      novedad: {
        ...rows[0],
        usuario_nombre: req.usuario.nombre,
        usuario_rol:    req.usuario.rol,
      }
    })
  } catch (err) {
    console.error('Error al crear novedad:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
