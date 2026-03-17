import bcrypt from 'bcryptjs'
import pool from '../config/db.js'

// Vista auxiliar reutilizable
const SELECT_USUARIO = `
  SELECT u.id_usuario, u.nombre_usuario, u.estado_usuario,
         u.id_rol, r.nombre_rol,
         u.id_dependencia, d.nombre_dependencia
  FROM Usuarios u
  JOIN Roles r ON r.id_rol = u.id_rol
  LEFT JOIN Dependencias d ON d.id_dependencia = u.id_dependencia
`

/**
 * GET /api/usuarios/buscar?q=texto
 * Solo admin. Busca usuarios por nombre (mínimo 2 chars).
 * Devuelve máximo 10 resultados para el autocomplete.
 */
export async function buscarUsuarios(req, res) {
  const { q = '' } = req.query

  if (q.trim().length < 2) {
    return res.json({ usuarios: [] })
  }

  try {
    const { rows } = await pool.query(
      `${SELECT_USUARIO}
       WHERE LOWER(u.nombre_usuario) LIKE LOWER($1)
       ORDER BY u.nombre_usuario ASC
       LIMIT 10`,
      [`%${q.trim()}%`]
    )
    return res.json({ usuarios: rows })
  } catch (err) {
    console.error('Error al buscar usuarios:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/**
 * GET /api/usuarios
 * Solo admin. Lista todos — usado solo para operaciones internas.
 * En la UI se usa /buscar en su lugar.
 */
export async function listarUsuarios(req, res) {
  try {
    const { rows } = await pool.query(`${SELECT_USUARIO} ORDER BY u.id_usuario ASC`)
    return res.json({ usuarios: rows })
  } catch (err) {
    console.error('Error al listar usuarios:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/**
 * POST /api/usuarios
 * Body: { nombre_usuario, password, id_rol, id_dependencia, estado_usuario? }
 */
export async function crearUsuario(req, res) {
  const { nombre_usuario, password, id_rol, id_dependencia, estado_usuario = 'activo' } = req.body

  if (!nombre_usuario || !password || !id_rol) {
    return res.status(400).json({ error: 'nombre_usuario, password e id_rol son requeridos' })
  }

  try {
    const existe = await pool.query(
      'SELECT id_usuario FROM Usuarios WHERE nombre_usuario = $1', [nombre_usuario.trim()]
    )
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese nombre' })
    }

    const hash = await bcrypt.hash(password, 10)
    const { rows } = await pool.query(
      `INSERT INTO Usuarios (nombre_usuario, password_usuario, id_rol, id_dependencia, estado_usuario)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_usuario, nombre_usuario, estado_usuario, id_rol, id_dependencia`,
      [nombre_usuario.trim(), hash, id_rol, id_dependencia || null, estado_usuario]
    )

    const { rows: full } = await pool.query(
      `${SELECT_USUARIO} WHERE u.id_usuario = $1`, [rows[0].id_usuario]
    )
    return res.status(201).json({ usuario: full[0] })
  } catch (err) {
    console.error('Error al crear usuario:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/**
 * PUT /api/usuarios/:id
 */
export async function actualizarUsuario(req, res) {
  const { id } = req.params
  const { nombre_usuario, password, id_rol, id_dependencia, estado_usuario } = req.body

  try {
    const { rows: existing } = await pool.query(
      'SELECT id_usuario FROM Usuarios WHERE id_usuario = $1', [id]
    )
    if (!existing[0]) return res.status(404).json({ error: 'Usuario no encontrado' })

    const campos = []
    const valores = []
    let idx = 1

    if (nombre_usuario !== undefined) { campos.push(`nombre_usuario = $${idx++}`);  valores.push(nombre_usuario.trim()) }
    if (id_rol !== undefined)         { campos.push(`id_rol = $${idx++}`);           valores.push(id_rol) }
    if (id_dependencia !== undefined) { campos.push(`id_dependencia = $${idx++}`);  valores.push(id_dependencia) }
    if (estado_usuario !== undefined) { campos.push(`estado_usuario = $${idx++}`);  valores.push(estado_usuario) }
    if (password) {
      const hash = await bcrypt.hash(password, 10)
      campos.push(`password_usuario = $${idx++}`)
      valores.push(hash)
    }

    if (campos.length === 0) return res.status(400).json({ error: 'No hay campos para actualizar' })

    valores.push(id)
    await pool.query(
      `UPDATE Usuarios SET ${campos.join(', ')} WHERE id_usuario = $${idx}`, valores
    )

    const { rows: full } = await pool.query(`${SELECT_USUARIO} WHERE u.id_usuario = $1`, [id])
    return res.json({ usuario: full[0] })
  } catch (err) {
    console.error('Error al actualizar usuario:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}