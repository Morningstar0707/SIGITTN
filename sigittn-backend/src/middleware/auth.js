import jwt from 'jsonwebtoken'

/**
 * Verifica el JWT. Adjunta el payload a req.usuario:
 * { id_usuario, nombre_usuario, id_rol, nombre_rol }
 */
export function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = payload
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' })
    }
    return res.status(401).json({ error: 'Token inválido' })
  }
}

/**
 * Restringe la ruta a nombre_rol === 'admin'.
 * Usar siempre después de verificarToken.
 */
export function soloAdmin(req, res, next) {
  if (req.usuario?.nombre_rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: se requiere rol admin' })
  }
  next()
}