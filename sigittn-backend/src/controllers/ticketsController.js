import pool from '../config/db.js'

// JOIN completo para devolver nombres en vez de solo IDs
const SELECT_TICKET = `
  SELECT
    t.id_ticket,
    t.titulo_ticket,
    t.descripcion_ticket,
    t.fecha_creacion_ticket,
    t.fecha_cierre_ticket,
    t.id_modulo_origen,    m.nombre_modulo_origen,
    t.id_nivel_urgencia,   n.nombre_nivel_urgencia,
    t.id_estado,           e.nombre_estado,
    t.id_usuario_creador,  uc.nombre_usuario  AS nombre_usuario_creador,
    t.id_usuario_asignado, ua.nombre_usuario  AS nombre_usuario_asignado
  FROM Tickets t
  JOIN Modulo_origen_tickets   m  ON m.id_modulo_origen   = t.id_modulo_origen
  JOIN Nivel_urgencia_tickets  n  ON n.id_nivel_urgencia  = t.id_nivel_urgencia
  JOIN Estados_Ticket          e  ON e.id_estado          = t.id_estado
  JOIN Usuarios                uc ON uc.id_usuario        = t.id_usuario_creador
  LEFT JOIN Usuarios           ua ON ua.id_usuario        = t.id_usuario_asignado
`

/**
 * GET /api/tickets
 * Filtros opcionales: ?id_modulo_origen=3&id_estado=1&page=1&limit=9
 */
export async function listarTickets(req, res) {
  const { id_modulo_origen, id_estado, page = 1, limit = 9 } = req.query
  const offset = (parseInt(page) - 1) * parseInt(limit)

  const condiciones = []
  const valores = []
  let idx = 1

  if (id_modulo_origen) { condiciones.push(`t.id_modulo_origen = $${idx++}`);  valores.push(id_modulo_origen) }
  if (id_estado)        { condiciones.push(`t.id_estado = $${idx++}`);         valores.push(id_estado) }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : ''

  try {
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) FROM Tickets t ${where}`, valores
    )
    const total = parseInt(countRows[0].count)

    const { rows } = await pool.query(
      `${SELECT_TICKET} ${where}
       ORDER BY t.fecha_creacion_ticket DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...valores, parseInt(limit), offset]
    )

    return res.json({
      tickets: rows,
      total,
      page:  parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    })
  } catch (err) {
    console.error('Error al listar tickets:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/**
 * GET /api/tickets/:id
 */
export async function obtenerTicket(req, res) {
  try {
    const { rows } = await pool.query(
      `${SELECT_TICKET} WHERE t.id_ticket = $1`, [req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Ticket no encontrado' })
    return res.json({ ticket: rows[0] })
  } catch (err) {
    console.error('Error al obtener ticket:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/**
 * POST /api/tickets
 * Body: { titulo_ticket, descripcion_ticket, id_modulo_origen, id_nivel_urgencia }
 * El estado inicial es siempre 'Nuevo' (id_estado = 1).
 * El creador se toma del token JWT.
 */
export async function crearTicket(req, res) {
  const {
    titulo_ticket,
    descripcion_ticket = '',
    id_modulo_origen,
    id_nivel_urgencia,
    id_usuario_asignado,   // opcional — cualquier rol puede asignarlo al crear
  } = req.body

  if (!titulo_ticket || !id_modulo_origen || !id_nivel_urgencia) {
    return res.status(400).json({
      error: 'titulo_ticket, id_modulo_origen e id_nivel_urgencia son requeridos'
    })
  }

  try {
    // Estado inicial = 'Nuevo'
    const { rows: estadoRows } = await pool.query(
      `SELECT id_estado FROM Estados_Ticket WHERE nombre_estado = 'Nuevo' LIMIT 1`
    )
    const id_estado = estadoRows[0]?.id_estado
    if (!id_estado) {
      return res.status(500).json({ error: 'Estado "Nuevo" no encontrado en la base de datos' })
    }

    const asignado = id_usuario_asignado ? parseInt(id_usuario_asignado) : null

    const { rows } = await pool.query(
      `INSERT INTO Tickets
         (titulo_ticket, descripcion_ticket, id_modulo_origen, id_nivel_urgencia, id_estado, id_usuario_creador, id_usuario_asignado)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id_ticket`,
      [titulo_ticket, descripcion_ticket, id_modulo_origen, id_nivel_urgencia,
       id_estado, req.usuario.id_usuario, asignado]
    )

    const { rows: full } = await pool.query(
      `${SELECT_TICKET} WHERE t.id_ticket = $1`, [rows[0].id_ticket]
    )
    return res.status(201).json({ ticket: full[0] })
  } catch (err) {
    console.error('Error al crear ticket:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/**
 * PUT /api/tickets/:id
 * Cualquier campo editable. Solo admin puede asignar usuario.
 */
export async function actualizarTicket(req, res) {
  const { id } = req.params
  const {
    titulo_ticket, descripcion_ticket,
    id_modulo_origen, id_nivel_urgencia,
    id_estado, id_usuario_asignado,
  } = req.body
  const esAdmin = req.usuario.nombre_rol === 'admin'

  try {
    const { rows: existing } = await pool.query(
      'SELECT id_ticket FROM Tickets WHERE id_ticket = $1', [id]
    )
    if (!existing[0]) return res.status(404).json({ error: 'Ticket no encontrado' })

    const campos = []
    const valores = []
    let idx = 1

    if (titulo_ticket !== undefined)      { campos.push(`titulo_ticket = $${idx++}`);      valores.push(titulo_ticket) }
    if (descripcion_ticket !== undefined) { campos.push(`descripcion_ticket = $${idx++}`); valores.push(descripcion_ticket) }
    if (id_modulo_origen !== undefined)   { campos.push(`id_modulo_origen = $${idx++}`);   valores.push(id_modulo_origen) }
    if (id_nivel_urgencia !== undefined)  { campos.push(`id_nivel_urgencia = $${idx++}`);  valores.push(id_nivel_urgencia) }
    if (id_estado !== undefined) {
      campos.push(`id_estado = $${idx++}`)
      valores.push(id_estado)
      // Si el estado es 'Cerrado', registrar fecha de cierre
      const { rows: estadoRows } = await pool.query(
        'SELECT nombre_estado FROM Estados_Ticket WHERE id_estado = $1', [id_estado]
      )
      if (estadoRows[0]?.nombre_estado === 'Cerrado') {
        campos.push(`fecha_cierre_ticket = NOW()`)
      }
    }
    // Solo admin puede asignar responsable
    if (esAdmin && id_usuario_asignado !== undefined) {
      campos.push(`id_usuario_asignado = $${idx++}`)
      valores.push(id_usuario_asignado)
    }

    if (campos.length === 0) return res.status(400).json({ error: 'No hay campos para actualizar' })

    valores.push(id)
    await pool.query(
      `UPDATE Tickets SET ${campos.join(', ')} WHERE id_ticket = $${idx}`, valores
    )

    const { rows: full } = await pool.query(
      `${SELECT_TICKET} WHERE t.id_ticket = $1`, [id]
    )
    return res.json({ ticket: full[0] })
  } catch (err) {
    console.error('Error al actualizar ticket:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/**
 * PATCH /api/tickets/:id/estado
 * Atajo rápido para cambiar solo el estado.
 * Body: { id_estado }
 */
export async function cambiarEstado(req, res) {
  const { id } = req.params
  const { id_estado } = req.body

  if (!id_estado) return res.status(400).json({ error: 'id_estado es requerido' })

  try {
    // Verificar que el estado existe
    const { rows: estadoRows } = await pool.query(
      'SELECT nombre_estado FROM Estados_Ticket WHERE id_estado = $1', [id_estado]
    )
    if (!estadoRows[0]) return res.status(400).json({ error: 'Estado no válido' })

    const esCerrado = estadoRows[0].nombre_estado === 'Cerrado'

    const { rows } = await pool.query(
      `UPDATE Tickets
       SET id_estado = $1 ${esCerrado ? ', fecha_cierre_ticket = NOW()' : ''}
       WHERE id_ticket = $2
       RETURNING id_ticket, id_estado, fecha_cierre_ticket`,
      [id_estado, id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Ticket no encontrado' })

    return res.json({
      ticket: {
        ...rows[0],
        nombre_estado: estadoRows[0].nombre_estado,
      }
    })
  } catch (err) {
    console.error('Error al cambiar estado:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}