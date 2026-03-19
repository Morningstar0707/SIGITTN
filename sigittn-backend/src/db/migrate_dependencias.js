/**
 * SIGITTN — Migración: eliminar dependencia "Sistemas"
 * Ejecutar una sola vez: npm run db:dependencias
 */
import pool from '../config/db.js'

async function run() {
  const client = await pool.connect()
  try {
    console.log('\n🗄️  Eliminando dependencia "Sistemas"...\n')
    await client.query('BEGIN')

    // Reasignar usuarios que tengan dependencia "Sistemas" a NULL
    const { rows: dep } = await client.query(
      `SELECT id_dependencia FROM Dependencias WHERE nombre_dependencia = 'Sistemas' LIMIT 1`
    )

    if (!dep[0]) {
      console.log('  ↳ Dependencia "Sistemas" no encontrada, nada que hacer.')
      await client.query('ROLLBACK')
      return
    }

    const id = dep[0].id_dependencia

    // Desasignar usuarios que pertenecen a esa dependencia
    const { rowCount } = await client.query(
      `UPDATE Usuarios SET id_dependencia = NULL WHERE id_dependencia = $1`, [id]
    )
    if (rowCount > 0) {
      console.log(`  ↳ ${rowCount} usuario(s) desasignados de la dependencia Sistemas`)
    }

    // Eliminar la dependencia
    await client.query(`DELETE FROM Dependencias WHERE id_dependencia = $1`, [id])
    console.log('✅  Dependencia "Sistemas" eliminada')

    await client.query('COMMIT')
    console.log()
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌  Error:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

run()
