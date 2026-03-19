/**
 * Migración: agregar id_usuario a Mensaje_tickets
 * Ejecutar una sola vez: node src/db/migrate_mensajes_usuario.js
 */
import pool from '../config/db.js'

async function migrate() {
  const client = await pool.connect()
  try {
    console.log('\n🔄  Migrando Mensaje_tickets...\n')
    await client.query('BEGIN')

    // Agregar columna id_usuario si no existe
    await client.query(`
      ALTER TABLE Mensaje_tickets
      ADD COLUMN IF NOT EXISTS id_usuario INTEGER REFERENCES Usuarios(id_usuario)
    `)

    await client.query('COMMIT')
    console.log('✅  Columna id_usuario agregada a Mensaje_tickets\n')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌  Error en migración:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
