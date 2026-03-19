import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import pool from '../config/db.js'
import { enviarEmailReset } from '../config/email.js'

/**
 * POST /api/auth/solicitar-reset
 * Body: { nombre_usuario, email }
 *
 * El usuario ingresa su nombre de usuario + su correo personal.
 * El backend verifica que el nombre_usuario exista y esté activo.
 * El email NO se valida contra la BD (no está almacenado ahí),
 * simplemente se usa como destino del correo.
 * Respuesta siempre genérica.
 */
export async function solicitarReset(req, res) {
  const { nombre_usuario, email } = req.body

  if (!nombre_usuario?.trim() || !email?.trim()) {
    return res.status(400).json({ error: 'Nombre de usuario y correo son requeridos' })
  }

  const respuestaGenerica = {
    mensaje: 'Si los datos son correctos, recibirás un enlace en los próximos minutos.'
  }

  try {
    // Buscar usuario activo por nombre
    const { rows } = await pool.query(
      `SELECT id_usuario, nombre_usuario
       FROM Usuarios
       WHERE nombre_usuario = $1 AND estado_usuario = 'activo'
       LIMIT 1`,
      [nombre_usuario.trim()]
    )

    if (!rows[0]) return res.json(respuestaGenerica)

    const usuario = rows[0]

    // Invalidar tokens anteriores del mismo usuario
    await pool.query(
      `UPDATE password_reset_tokens SET usado = TRUE
       WHERE id_usuario = $1 AND usado = FALSE`,
      [usuario.id_usuario]
    )

    // Generar token seguro de 64 chars
    const token = crypto.randomBytes(32).toString('hex')
    const expira = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Guardar token vinculado al usuario
    await pool.query(
      `INSERT INTO password_reset_tokens (id_usuario, token, expira_en)
       VALUES ($1, $2, $3)`,
      [usuario.id_usuario, token, expira]
    )

    // Enviar correo al email que el usuario escribió
    try {
      await enviarEmailReset(email.trim(), usuario.nombre_usuario, token)
      console.log(`✅  Correo de reset enviado a: ${email.trim()}`)
    } catch (mailErr) {
      console.error('❌  Error al enviar correo de reset:')
      console.error('    Destinatario:', email.trim())
      console.error('    Error:', mailErr.message)
      console.error('    Detalle:', mailErr.response || mailErr.code || '')
    }

    return res.json(respuestaGenerica)

  } catch (err) {
    console.error('Error en solicitar-reset:', err)
    return res.json(respuestaGenerica)
  }
}

/**
 * POST /api/auth/restablecer-password
 * Body: { token, nueva_password }
 */
export async function restablecerPassword(req, res) {
  const { token, nueva_password } = req.body

  if (!token || !nueva_password) {
    return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' })
  }

  if (nueva_password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
  }

  try {
    const { rows } = await pool.query(
      `SELECT prt.id, prt.id_usuario, u.nombre_usuario
       FROM password_reset_tokens prt
       JOIN Usuarios u ON u.id_usuario = prt.id_usuario
       WHERE prt.token = $1
         AND prt.usado = FALSE
         AND prt.expira_en > NOW()
       LIMIT 1`,
      [token]
    )

    if (!rows[0]) {
      return res.status(400).json({
        error: 'El enlace es inválido o ha expirado. Solicita uno nuevo.'
      })
    }

    const { id: tokenId, id_usuario } = rows[0]

    // Hashear y guardar nueva contraseña
    const hash = await bcrypt.hash(nueva_password, 10)
    await pool.query(
      `UPDATE Usuarios SET password_usuario = $1 WHERE id_usuario = $2`,
      [hash, id_usuario]
    )

    // Marcar token como usado
    await pool.query(
      `UPDATE password_reset_tokens SET usado = TRUE WHERE id = $1`,
      [tokenId]
    )

    return res.json({ mensaje: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' })

  } catch (err) {
    console.error('Error en restablecer-password:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/**
 * GET /api/auth/validar-token?token=abc
 */
export async function validarToken(req, res) {
  const { token } = req.query
  if (!token) return res.status(400).json({ valido: false })

  try {
    const { rows } = await pool.query(
      `SELECT id FROM password_reset_tokens
       WHERE token = $1 AND usado = FALSE AND expira_en > NOW()
       LIMIT 1`,
      [token]
    )
    return res.json({ valido: rows.length > 0 })
  } catch (err) {
    return res.status(500).json({ valido: false })
  }
}