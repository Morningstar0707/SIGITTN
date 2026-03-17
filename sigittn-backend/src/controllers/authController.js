import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/db.js'

/**
 * POST /api/auth/login
 * Body: { nombre_usuario, password }
 */
export async function login(req, res) {
  const { nombre_usuario, password } = req.body

  if (!nombre_usuario || !password) {
    return res.status(400).json({ error: 'nombre_usuario y password son requeridos' })
  }

  try {
    const { rows } = await pool.query(
      `SELECT u.id_usuario, u.nombre_usuario, u.password_usuario,
              u.estado_usuario, u.id_rol, r.nombre_rol,
              u.id_dependencia, d.nombre_dependencia
       FROM Usuarios u
       JOIN Roles r ON r.id_rol = u.id_rol
       LEFT JOIN Dependencias d ON d.id_dependencia = u.id_dependencia
       WHERE u.nombre_usuario = $1
       LIMIT 1`,
      [nombre_usuario.trim()]
    )

    const usuario = rows[0]

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    if (usuario.estado_usuario === 'inactivo') {
      return res.status(403).json({ error: 'Cuenta inactiva. Contacta al administrador.' })
    }

    const passwordOk = await bcrypt.compare(password, usuario.password_usuario)
    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    const payload = {
      id_usuario:    usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      id_rol:        usuario.id_rol,
      nombre_rol:    usuario.nombre_rol,   // 'admin' | 'usuario'
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    })

    return res.json({
      token,
      usuario: {
        id_usuario:         usuario.id_usuario,
        nombre_usuario:     usuario.nombre_usuario,
        nombre_rol:         usuario.nombre_rol,
        id_dependencia:     usuario.id_dependencia,
        nombre_dependencia: usuario.nombre_dependencia,
      },
    })
  } catch (err) {
    console.error('Error en login:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/**
 * GET /api/auth/me
 */
export async function me(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT u.id_usuario, u.nombre_usuario, u.estado_usuario,
              u.id_rol, r.nombre_rol,
              u.id_dependencia, d.nombre_dependencia
       FROM Usuarios u
       JOIN Roles r ON r.id_rol = u.id_rol
       LEFT JOIN Dependencias d ON d.id_dependencia = u.id_dependencia
       WHERE u.id_usuario = $1`,
      [req.usuario.id_usuario]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' })
    return res.json({ usuario: rows[0] })
  } catch (err) {
    console.error('Error en /me:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
