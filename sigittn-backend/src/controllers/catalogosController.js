import pool from '../config/db.js'

/**
 * GET /api/catalogos
 * Devuelve todos los catálogos en una sola petición.
 * El frontend los usa para poblar los <select> de los formularios.
 * Incluye lista de usuarios activos para el selector de responsable.
 */
export async function obtenerCatalogos(req, res) {
  try {
    const [roles, dependencias, modulos, urgencias, estados, usuariosActivos] = await Promise.all([
      pool.query('SELECT id_rol, nombre_rol FROM Roles ORDER BY id_rol'),
      pool.query('SELECT id_dependencia, nombre_dependencia FROM Dependencias ORDER BY nombre_dependencia'),
      pool.query('SELECT id_modulo_origen, nombre_modulo_origen FROM Modulo_origen_tickets ORDER BY id_modulo_origen'),
      pool.query('SELECT id_nivel_urgencia, nombre_nivel_urgencia FROM Nivel_urgencia_tickets ORDER BY id_nivel_urgencia'),
      pool.query('SELECT id_estado, nombre_estado FROM Estados_Ticket ORDER BY id_estado'),
      pool.query(`
        SELECT u.id_usuario, u.nombre_usuario, r.nombre_rol, d.nombre_dependencia
        FROM Usuarios u
        JOIN Roles r ON r.id_rol = u.id_rol
        LEFT JOIN Dependencias d ON d.id_dependencia = u.id_dependencia
        WHERE u.estado_usuario = 'activo'
        ORDER BY u.nombre_usuario ASC
      `),
    ])

    return res.json({
      roles:          roles.rows,
      dependencias:   dependencias.rows,
      modulos:        modulos.rows,
      urgencias:      urgencias.rows,
      estados:        estados.rows,
      usuarios:       usuariosActivos.rows,
    })
  } catch (err) {
    console.error('Error al obtener catálogos:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}